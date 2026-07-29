import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext.jsx'

const Login = () => {
  const { login, adminLogin } = useContext(ShopContext)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    let success
    if (isAdmin) {
      success = adminLogin(email, password)
      if (success) { navigate('/admin'); return }
      setError('Invalid admin credentials')
    } else {
      success = login(email, password)
      if (success) { navigate('/'); return }
      setError('Invalid credentials. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 pt-16">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl shadow-neutral-900/5 p-8 md:p-10 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="font-prata text-2xl text-neutral-900 mb-2">{isAdmin ? 'Admin Access' : 'Welcome Back'}</h1>
            <p className="text-sm text-gray-400">{isAdmin ? 'Sign in to admin panel' : 'Sign in to your account'}</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-neutral-900 focus:bg-white transition-all text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-neutral-900 focus:bg-white transition-all text-sm" required />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-neutral-900 focus:ring-neutral-900" />
                <span className="text-gray-500">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-neutral-900 font-medium hover:underline">Forgot password?</Link>
            </div>

            <button type="submit" className="w-full bg-neutral-900 text-white py-3.5 rounded-full font-semibold text-sm hover:bg-neutral-800 transition-all hover:shadow-lg active:scale-95 mt-2">
              {isAdmin ? 'Access Admin Panel' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center space-y-3">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-neutral-900 font-semibold hover:underline">Create one</Link>
            </p>
            <button onClick={() => setIsAdmin(!isAdmin)} className="text-xs text-gray-400 hover:text-neutral-900 transition-colors">
              {isAdmin ? '← Back to user login' : 'Admin login →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login