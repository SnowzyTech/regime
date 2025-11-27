"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, X, Send, Bot, User, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! Welcome to REGIME. I'm here to help you find the perfect skincare products for your needs. How can I assist you today?",
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen, isMinimized])

  const isSubmitDisabled = isLoading || !inputValue.trim()

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
    }

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No response body")
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "",
      }

      setMessages((prev) => [...prev, assistantMessage])

      let fullContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        console.log("[v0] Raw chunk received:", chunk)

        const lines = chunk.split("\n")
        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine) continue

          console.log("[v0] Processing line:", trimmedLine)

          // Format 1: "0:" prefix (text delta)
          if (trimmedLine.startsWith("0:")) {
            try {
              const text = JSON.parse(trimmedLine.slice(2))
              fullContent += text
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantMessage.id ? { ...m, content: fullContent } : m)),
              )
            } catch (e) {
              console.log("[v0] Failed to parse 0: format:", e)
            }
          }
          // Format 2: "d:" prefix (data message in newer SDK versions)
          else if (trimmedLine.startsWith("d:")) {
            try {
              const data = JSON.parse(trimmedLine.slice(2))
              if (data.type === "text-delta" && data.textDelta) {
                fullContent += data.textDelta
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantMessage.id ? { ...m, content: fullContent } : m)),
                )
              }
            } catch (e) {
              console.log("[v0] Failed to parse d: format:", e)
            }
          }
          // Format 3: SSE "data:" prefix
          else if (trimmedLine.startsWith("data:")) {
            try {
              const jsonStr = trimmedLine.slice(5).trim()
              if (jsonStr && jsonStr !== "[DONE]") {
                const data = JSON.parse(jsonStr)
                if (data.type === "text-delta" && data.delta) {
                  fullContent += data.delta
                  setMessages((prev) =>
                    prev.map((m) => (m.id === assistantMessage.id ? { ...m, content: fullContent } : m)),
                  )
                }
                // Handle OpenAI-style format
                else if (data.choices?.[0]?.delta?.content) {
                  fullContent += data.choices[0].delta.content
                  setMessages((prev) =>
                    prev.map((m) => (m.id === assistantMessage.id ? { ...m, content: fullContent } : m)),
                  )
                }
                // Handle direct text content
                else if (typeof data === "string") {
                  fullContent += data
                  setMessages((prev) =>
                    prev.map((m) => (m.id === assistantMessage.id ? { ...m, content: fullContent } : m)),
                  )
                }
              }
            } catch (e) {
              // Silently ignore parse errors
            }
          }
          // Format 4: Plain text (fallback for simple text chunks)
          else if (!trimmedLine.includes(":") && trimmedLine.length > 0) {
            // Could be plain text chunk
            fullContent += trimmedLine
            setMessages((prev) => prev.map((m) => (m.id === assistantMessage.id ? { ...m, content: fullContent } : m)))
          }
        }
      }

      console.log("[v0] Final content:", fullContent)

      if (!fullContent.trim()) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id
              ? { ...m, content: "I received your message but couldn't generate a response. Please try again." }
              : m,
          ),
        )
      }
    } catch (error) {
      console.error("[v0] Chat error:", error)
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#5C8D7B] text-white shadow-lg transition-all hover:bg-[#4a7a69] hover:scale-105"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <>
          {!isMinimized && (
            <div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm sm:hidden"
              onClick={() => setIsOpen(false)}
            />
          )}
          <div
            className={cn(
              "fixed z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300",
              isMinimized
                ? "bottom-6 right-6 w-72 h-14"
                : "bottom-0 right-0 w-full h-full sm:bottom-6 sm:right-6 sm:w-[380px] sm:h-[70vh] sm:max-h-[600px] sm:rounded-2xl rounded-none",
            )}
          >
            {/* Header */}
            <div
              className={cn(
                "flex items-center justify-between px-4 py-3 bg-[#5C8D7B] text-white",
                isMinimized ? "rounded-2xl" : "sm:rounded-t-2xl rounded-none",
              )}
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">REGIME Assistant</h3>
                  <p className="text-xs text-white/80">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors hidden sm:block"
                  aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn("flex gap-2", message.role === "user" ? "justify-end" : "justify-start")}
                    >
                      {message.role === "assistant" && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#5C8D7B]/10">
                          <Bot className="h-4 w-4 text-[#5C8D7B]" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                          message.role === "user"
                            ? "bg-[#5C8D7B] text-white rounded-br-md"
                            : "bg-gray-100 text-gray-800 rounded-bl-md",
                        )}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.role === "user" && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-2 justify-start">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#5C8D7B]/10">
                        <Bot className="h-4 w-4 text-[#5C8D7B]" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex gap-1">
                          <span
                            className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <span
                            className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <span
                            className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={onFormSubmit} className="p-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={onInputChange}
                      placeholder="Ask about our products..."
                      className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C8D7B] focus:border-transparent disabled:opacity-50"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isSubmitDisabled}
                      className="rounded-xl bg-[#5C8D7B] hover:bg-[#4a7a69] shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-[10px] text-gray-400 text-center mt-2">Powered by REGIME AI</p>
                </form>
              </>
            )}
          </div>
        </>
      )}
    </>
  )
}
