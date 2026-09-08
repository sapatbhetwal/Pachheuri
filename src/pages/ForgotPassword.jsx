import React, { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'

const ForgotPassword = () => {
  const { forgotPassword } = useContext(ShopContext)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetData, setResetData] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await forgotPassword(email.trim().toLowerCase())
      setResetData(res)
    } catch (err) {
      setError(err.message || 'Failed to process password reset request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 section-padding py-12">
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="font-prata text-3xl text-neutral-900 mb-2">Reset Password</h1>
          <p className="text-sm text-gray-500">Enter your registered email to reset your account password</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2 border border-red-100">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {resetData ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-medium text-lg text-neutral-900">Reset Token Generated</h3>
            <p className="text-sm text-gray-500">
              A secure password reset link has been created for <span className="font-semibold text-neutral-800">{email}</span>.
            </p>

            {/* Direct Reset Action */}
            {resetData.resetUrl && (
              <div className="bg-neutral-50 border border-gray-200 rounded-xl p-4 text-left my-4">
                <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Instant Reset Link:</p>
                <Link
                  to={resetData.resetUrl}
                  className="inline-flex items-center justify-center gap-2 w-full bg-neutral-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-neutral-800 transition-all"
                >
                  Proceed to Reset Password →
                </Link>
                <p className="text-[11px] text-gray-400 text-center mt-2 font-mono">
                  Token: {resetData.resetToken}
                </p>
              </div>
            )}

            <div className="pt-2">
              <Link to="/login" className="text-sm text-gray-600 hover:text-neutral-900 underline font-medium">
                Back to Sign In
              </Link>
            </div>
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
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-neutral-900 focus:bg-white transition-all text-sm"
                required
              />
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
                  Generating Reset Link...
                </span>
              ) : (
                'Generate Reset Link'
              )}
            </button>
          </form>
        )}

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500">
            Remember your password?{' '}
            <Link to="/login" className="text-neutral-900 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
