import React, { useContext } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { ShopContext } from '../../context/ShopContext.jsx'
import { assets } from '../../assets/admin_assets/assets'
const AdminLayout = () => {
  const { user, logout } = useContext(ShopContext)
  const location = useLocation()
  const navigate = useNavigate()

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center bg-white rounded-3xl p-10 shadow-xl border border-gray-100">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="font-prata text-2xl text-neutral-900 mb-2">Admin Access Required</h2>
          <p className="text-gray-400 text-sm mb-6">You need admin privileges to view this page.</p>
          <button onClick={() => navigate('/login')} className="bg-neutral-900 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-neutral-800 transition-all">Go to Login</button>
        </div>
      </div>
    )
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { name: 'Products', path: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { name: 'Add Product', path: '/admin/add-product', icon: 'M12 4v16m8-8H4' },
    { name: 'Orders', path: '/admin/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 hidden md:flex flex-col fixed h-full">
        <div className="p-6 border-b border-gray-50">
          <Link to="/" className="flex items-center gap-2">
            <img src={assets.logo} alt="Forever" className="h-7 w-auto object-contain" />
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${location.pathname === item.path ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-900/20' : 'text-gray-500 hover:bg-gray-50 hover:text-neutral-900'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-50">
          <div className="flex items-center gap-3 px-4 py-3 mb-3">
            <div className="w-9 h-9 bg-neutral-900 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{user.name[0]}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900">{user.name}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/') }} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50 px-4 py-3 flex items-center justify-between">
        <img src={assets.logo} alt="" className="h-6 object-contain" />
        <span className="text-sm font-semibold">Admin</span>
        <button onClick={() => { logout(); navigate('/') }} className="text-red-500 text-sm font-medium">Logout</button>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-6 md:p-10 mt-12 md:mt-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout