import React, { useContext, useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import {
  PROVINCES,
  NEPAL_DISTRICTS_BY_PROVINCE,
  COMMON_MUNICIPALITIES,
  POSTAL_CODES_BY_DISTRICT,
  isValidNepalPhone,
} from '../data/nepalLocationData'

const Profile = () => {
  const { user, profile, updateProfile, logout } = useContext(ShopContext)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    province: 'Bagmati Province',
    district: 'Kathmandu',
    municipality: 'Kathmandu Metropolitan City',
    ward: '10',
    tole: '',
    houseNo: '',
    postalCode: '44600',
    country: 'Nepal',
    deliveryInstructions: '',
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      const province = profile?.province || 'Bagmati Province'
      const district = profile?.district || (NEPAL_DISTRICTS_BY_PROVINCE[province]?.[0] || 'Kathmandu')
      setFormData({
        name: profile?.name || user.name || '',
        phone: profile?.phone || '',
        province: province,
        district: district,
        municipality: profile?.municipality || profile?.city || 'Kathmandu Metropolitan City',
        ward: profile?.ward || '10',
        tole: profile?.tole || profile?.address || '',
        houseNo: profile?.houseNo || '',
        postalCode: profile?.postalCode || profile?.zip || POSTAL_CODES_BY_DISTRICT[district] || '44600',
        country: 'Nepal',
        deliveryInstructions: profile?.deliveryInstructions || '',
      })
    }
  }, [user, profile])

  if (!user) {
    return (
      <div className="section-padding py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="font-prata text-2xl text-neutral-900 mb-3">Please Sign In</h2>
        <p className="text-gray-500 text-sm mb-6">You must be logged in to view your profile and account settings.</p>
        <Link to="/login" className="btn-primary">
          Sign In
        </Link>
      </div>
    )
  }

  const handleProvinceChange = (e) => {
    const newProvince = e.target.value
    const districtList = NEPAL_DISTRICTS_BY_PROVINCE[newProvince] || []
    const firstDistrict = districtList[0] || ''
    const muniList = COMMON_MUNICIPALITIES[firstDistrict] || []
    setFormData((prev) => ({
      ...prev,
      province: newProvince,
      district: firstDistrict,
      municipality: muniList[0] || '',
      postalCode: POSTAL_CODES_BY_DISTRICT[firstDistrict] || '',
    }))
  }

  const handleDistrictChange = (e) => {
    const newDistrict = e.target.value
    const muniList = COMMON_MUNICIPALITIES[newDistrict] || []
    setFormData((prev) => ({
      ...prev,
      district: newDistrict,
      municipality: muniList[0] || prev.municipality,
      postalCode: POSTAL_CODES_BY_DISTRICT[newDistrict] || prev.postalCode,
    }))
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess('')
    setError('')

    if (formData.phone && !isValidNepalPhone(formData.phone)) {
      setError('Please provide a valid Nepal phone number (e.g., 9841234567, 9801234567, or +977 98...)')
      return
    }

    setLoading(true)

    try {
      await updateProfile(formData)
      setSuccess('Account profile & Nepal delivery address updated successfully!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.message || 'Failed to update profile.')
    } finally {
      setLoading(false)
    }
  }

  const districtList = NEPAL_DISTRICTS_BY_PROVINCE[formData.province] || []
  const municipalitySuggestions = COMMON_MUNICIPALITIES[formData.district] || []

  return (
    <div className="section-padding py-10 min-h-screen">
      <Title text1="My" text2="Account" />

      <div className="max-w-2xl mx-auto mt-6">
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
          {/* Account Overview Header */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-medium text-neutral-900">{user.name}</h2>
              <p className="text-sm text-gray-500 font-mono text-xs">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-neutral-800">
                  Role: {user.role}
                </span>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  🇳🇵 Nepal Region
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                logout()
                navigate('/')
              }}
              className="px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-700">
                Personal & Saved Delivery Information (Nepal)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nepal Phone Number (+977) *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="98XXXXXXXX or +977 98XXXXXXXX"
                  className="input-field"
                  required
                />
              </div>
            </div>

            {/* Province & District Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Province *</label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleProvinceChange}
                  className="input-field bg-white"
                  required
                >
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">District *</label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleDistrictChange}
                  className="input-field bg-white"
                  required
                >
                  {districtList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Municipality & Ward */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Municipality / Rural Municipality *
                </label>
                <input
                  type="text"
                  name="municipality"
                  value={formData.municipality}
                  onChange={handleChange}
                  placeholder="e.g. Kathmandu Metropolitan City"
                  list="municipality-list"
                  className="input-field"
                  required
                />
                <datalist id="municipality-list">
                  {municipalitySuggestions.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ward No. *</label>
                <input
                  type="number"
                  name="ward"
                  min="1"
                  max="35"
                  value={formData.ward}
                  onChange={handleChange}
                  placeholder="e.g. 10"
                  className="input-field"
                  required
                />
              </div>
            </div>

            {/* Tole / Street and House No */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tole / Street / Area *
                </label>
                <input
                  type="text"
                  name="tole"
                  value={formData.tole}
                  onChange={handleChange}
                  placeholder="e.g. New Road, Baneshwor, Thamel"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  House / Building No.
                </label>
                <input
                  type="text"
                  name="houseNo"
                  value={formData.houseNo}
                  onChange={handleChange}
                  placeholder="e.g. 24B / Flat 3"
                  className="input-field"
                />
              </div>
            </div>

            {/* Postal code & Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nepal Postal Code *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="e.g. 44600"
                  className="input-field font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  value="Nepal"
                  readOnly
                  disabled
                  className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Delivery Instructions / Landmarks */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nearby Landmark / Delivery Instructions
              </label>
              <input
                type="text"
                name="deliveryInstructions"
                value={formData.deliveryInstructions}
                onChange={handleChange}
                placeholder="e.g. Near Bhatbhateni Supermarket, Opposite to Global IME Bank"
                className="input-field"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Link to="/orders" className="text-xs text-neutral-900 font-medium hover:underline">
                ← View My Orders
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile
