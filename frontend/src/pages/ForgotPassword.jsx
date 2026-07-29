import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 section-padding py-10">
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-sm shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="font-prata text-3xl text-neutral-900 mb-2">Reset Password</h1>
          <p className="text-sm text-gray-500">Enter your email to receive reset instructions</p>
        </div>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-medium text-neutral-900 mb-2">Check your inbox</h3>
            <p className="text-sm text-gray-500 mb-6">We've sent password reset instructions to {email}</p>
            <Link to="/login" className="btn-outline inline-block">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
                required
              />
            </div>
            <button type="submit" className="w-full btn-primary mt-2">Send Reset Link</button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Remember your password?{' '}
            <Link to="/login" className="text-neutral-900 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword