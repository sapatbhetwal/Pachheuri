import React, { useContext, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext.jsx'

const Login = () => {
  const { login, adminLogin } = useContext(ShopContext)
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // Message passed from reset password or registration
  const successMessage = location.state?.message

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isAdmin) {
        await adminLogin(email, password)
        navigate('/admin')
      } else {
        await login(email, password)
        navigate('/')
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Quick fill helper for testing
  const fillDemo = (role) => {
    if (role === 'admin') {
      setIsAdmin(true)
      setEmail('admin@123.com')
      setPassword('admin123')
    } else {
      setIsAdmin(false)
      setEmail('demo@user.com')
      setPassword('password123')
    }
    setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 pt-16 pb-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl shadow-neutral-900/5 p-8 md:p-10 border border-gray-100">
          <div className="text-center mb-6">
            <h1 className="font-prata text-2xl text-neutral-900 mb-2">
              {isAdmin ? 'Admin Access' : 'Welcome Back'}
            </h1>
            <p className="text-sm text-gray-400">
              {isAdmin ? 'Sign in to admin dashboard' : 'Sign in to your account'}
            </p>
          </div>

          {/* Quick Demo Credentials Bar */}
          <div className="mb-6 p-3 bg-neutral-50 border border-gray-200 rounded-xl text-xs flex items-center justify-between">
            <span className="text-gray-500 font-medium">Quick Demo:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillDemo('user')}
                className="px-2.5 py-1 bg-white border border-gray-300 hover:border-neutral-900 rounded-md text-neutral-800 font-medium transition-colors"
              >
                Shopper
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="px-2.5 py-1 bg-white border border-gray-300 hover:border-neutral-900 rounded-md text-neutral-800 font-medium transition-colors"
              >
                Admin
              </button>
            </div>
          </div>

          {successMessage && (
            <div className="bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2 border border-emerald-100">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2 border border-red-100">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-neutral-900 focus:bg-white transition-all text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-neutral-900 focus:bg-white transition-all text-sm"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded border-gray-300 text-neutral-900 focus:ring-neutral-900"
                />
                <span className="text-gray-500 text-xs">Remember session</span>
              </label>
              <Link to="/forgot-password" className="text-neutral-900 font-medium text-xs hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neutral-900 text-white py-3.5 rounded-full font-semibold text-sm hover:bg-neutral-800 transition-all hover:shadow-lg active:scale-95 mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Authenticating...
                </span>
              ) : (
                <span>{isAdmin ? 'Access Admin Panel' : 'Sign In'}</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center space-y-3">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-neutral-900 font-semibold hover:underline">
                Create one
              </Link>
            </p>
            <button
              type="button"
              onClick={() => {
                setIsAdmin(!isAdmin)
                setError('')
              }}
              className="text-xs text-gray-400 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              {isAdmin ? '← Back to regular user login' : 'Switch to admin portal login →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
