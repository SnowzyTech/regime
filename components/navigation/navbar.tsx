"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingCart, User, Menu, X, LogOut } from "lucide-react"
import { useCart, subscribeToCart } from "@/hooks/use-cart"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userName, setUserName] = useState("")
  const [cartItemCount, setCartItemCount] = useState(0)
  const { cart } = useCart()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
        setUserName(data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "User")
      } else {
        setUser(null)
        setUserName("")
      }
    }
    checkUser()
  }, [])

  useEffect(() => {
    const updateCartCount = () => {
      const count = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0
      setCartItemCount(count)
    }
    updateCartCount()

    const unsubscribe = subscribeToCart((updatedCart) => {
      const count = updatedCart.items.reduce((acc, item) => acc + item.quantity, 0)
      setCartItemCount(count)
    })

    return unsubscribe
  }, [cart])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setUserName("")
    setIsUserDropdownOpen(false)
    toast.success("Signed out successfully!")
    router.push("/")
  }

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? "bg-primary-foreground shadow-sm" : "bg-transparent"}`}
    >
      <div className="regime-container flex items-center justify-between h-20">
        <Link href="/" className="text-2xl font-light tracking-wider">
          REGIME.
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-2 rounded-md transition-colors text-sm font-medium",
                pathname === link.href
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="relative p-2 hover:bg-accent hover:text-accent-foreground rounded-full transition-colors"
          >
            <ShoppingCart size={24} className="text-foreground hover:text-accent-foreground transition-colors" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
                {cartItemCount}
              </span>
            )}
          </Link>

          <div className="relative hidden md:block">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="p-2 hover:bg-accent hover:text-accent-foreground rounded-full transition-colors"
              title={user ? userName : "Sign In"}
            >
              <User size={24} className="text-foreground hover:text-accent-foreground" />
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg p-2 z-50">
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b border-border mb-2">
                      <p className="font-medium text-foreground">{userName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-foreground hover:bg-muted rounded transition-colors"
                    >
                      My Account
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-foreground hover:bg-muted rounded transition-colors flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/sign-in"
                      className="block px-4 py-2 text-foreground hover:bg-muted rounded transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/sign-up"
                      className="block px-4 py-2 text-foreground hover:bg-muted rounded transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 w-full h-full bg-primary-foreground z-50 flex flex-col overflow-y-auto">
          {/* Mobile Menu Header with Logo */}
          <div className="flex items-center justify-between px-4 h-20 border-b border-border shrink-0">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-light tracking-wider text-foreground"
            >
              REGIME.
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-accent hover:text-accent-foreground rounded-full transition-colors"
            >
              <X size={24} className="text-foreground" />
            </button>
          </div>

          {/* Mobile Menu Content */}
          <div className="flex flex-col flex-1 p-6 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "text-lg font-medium py-4 px-4 rounded-lg transition-colors",
                  pathname === link.href
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-border pt-4 mt-4">
              {user ? (
                <>
                  <div className="px-4 py-3 mb-2 bg-muted/50 rounded-lg">
                    <p className="font-medium text-foreground">{userName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-4 px-4 text-lg font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors"
                  >
                    My Account
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full text-left py-4 px-4 text-lg font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors flex items-center gap-2"
                  >
                    <LogOut size={20} />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/sign-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-4 px-4 text-lg font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors"
                  >
                    <User size={20} />
                    Sign In
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-4 px-4 text-lg font-medium text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors"
                  >
                    <User size={20} />
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
