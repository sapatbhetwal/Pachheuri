import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'

const Register = () => {
  const { login } = useContext(ShopContext)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    login(formData.email, formData.password)
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 section-padding py-10">
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-sm shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="font-prata text-3xl text-neutral-900 mb-2">Create Account</h1>
          <p className="text-sm text-gray-500">Join us and start shopping</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-sm mb-6">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className="input-field" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="input-field" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="input-field" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className="input-field" required />
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 mt-0.5 rounded-sm border-gray-300" required />
            <span className="text-xs text-gray-500">I agree to the Terms of Service and Privacy Policy</span>
          </label>

          <button type="submit" className="w-full btn-primary mt-2">Create Account</button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-neutral-900 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register