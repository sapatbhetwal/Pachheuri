import React, { useState, useContext, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { assets } from "../assets/frontend_assets/assets";
const Navbar = () => {
  const { getCartCount, user, logout, setShowSearch, showSearch } = useContext(ShopContext)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    setMenuOpen(false)
    setProfileOpen(false)
  }, [location])

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'COLLECTION', path: '/collection' },
    { name: 'ABOUT', path: '/about' },
    { name: 'CONTACT', path: '/contact' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="section-padding">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2">
            <img src={assets.logo} alt="Forever" className="h-8 lg:h-10 object-contain" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium tracking-wide transition-colors hover:text-neutral-500 ${
                  location.pathname === link.path ? 'text-neutral-900 border-b-2 border-neutral-900 pb-0.5' : 'text-gray-500'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <button onClick={() => setShowSearch(!showSearch)} className="p-1 hover:opacity-70 transition-opacity">
              <img src={assets.search_icon} alt="Search" className="w-5 h-5" />
            </button>

            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="p-1 hover:opacity-70 transition-opacity">
                <img src={assets.profile_icon} alt="Profile" className="w-5 h-5" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-sm py-2 animate-fade-in-up">
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-gray-50">My Orders</Link>
                      {isAdmin && (
                        <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-gray-50 text-amber-600">Admin Panel</Link>
                      )}
                      <button onClick={() => { logout(); navigate('/') }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-500">Logout</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="block px-4 py-2 text-sm hover:bg-gray-50">Login</Link>
                      <Link to="/register" className="block px-4 py-2 text-sm hover:bg-gray-50">Register</Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <Link to="/cart" className="relative p-1 hover:opacity-70 transition-opacity">
              <img src={assets.cart_icon} alt="Cart" className="w-5 h-5" />
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-neutral-900 text-white text-[10px] flex items-center justify-center rounded-full">
                  {getCartCount()}
                </span>
              )}
            </Link>

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-1">
              <img src={assets.menu_icon} alt="Menu" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-fade-in-up">
          <div className="section-padding py-4 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className={`block py-3 text-sm font-medium tracking-wide ${location.pathname === link.path ? 'text-neutral-900' : 'text-gray-500'}`}>
                {link.name}
              </Link>
            ))}
            {user && (
              <>
                <Link to="/orders" className="block py-3 text-sm font-medium text-gray-500">MY ORDERS</Link>
                {isAdmin && <Link to="/admin" className="block py-3 text-sm font-medium text-amber-600">ADMIN PANEL</Link>}
                <button onClick={() => { logout(); navigate('/') }} className="block py-3 text-sm font-medium text-red-500">LOGOUT</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar