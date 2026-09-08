const TOKEN_KEY = 'pachheuri_auth_token'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || null
}

export function setStoredToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(endpoint, options = {}) {
  const token = getStoredToken()
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers.Authorization = ['Bearer', token].join(' ')

  let response
  try {
    response = await fetch(endpoint, { ...options, headers })
  } catch {
    throw new Error('Unable to connect to Pachheuri server. Please make sure the backend is running.')
  }
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.error || data.message || 'Request failed')
    error.status = response.status
    error.details = data.errors || null
    error.data = data
    throw error
  }
  return data
}

export const api = {
  async register(payload) {
    const result = await request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) })
    if (result.token) setStoredToken(result.token)
    return result
  },
  async login(payload) {
    const result = await request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) })
    if (result.token) setStoredToken(result.token)
    return result
  },
  async adminLogin(payload) {
    const result = await request('/api/auth/admin-login', { method: 'POST', body: JSON.stringify(payload) })
    if (result.token) setStoredToken(result.token)
    return result
  },
  getMe: () => request('/api/auth/me'),
  async logout() {
    try {
      await request('/api/auth/logout', { method: 'POST' })
    } finally {
      setStoredToken(null)
    }
    return { success: true }
  },
  forgotPassword: (payload) => request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify(payload) }),
  resetPassword: (payload) => request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),
  getProfile: () => request('/api/user/profile'),
  updateProfile: (data) => request('/api/user/profile', { method: 'PUT', body: JSON.stringify(data) }),
  getCart: () => request('/api/user/cart'),
  updateCart: (cart) => request('/api/user/cart', { method: 'PUT', body: JSON.stringify({ cart }) }),
  getWishlist: () => request('/api/user/wishlist'),
  toggleWishlist: (productId) => request('/api/user/wishlist/toggle', { method: 'POST', body: JSON.stringify({ productId }) }),
  getUserOrders: () => request('/api/user/orders'),
  validateCard: (card) => request('/api/payment/validate-card', { method: 'POST', body: JSON.stringify(card) }),
  createOrder: (payload) => request('/api/orders', { method: 'POST', body: JSON.stringify(payload) }),
  getProducts: () => request('/api/products'),
  createProduct: (product) => request('/api/products', { method: 'POST', body: JSON.stringify(product) }),
  updateProduct: (productId, product) => request(`/api/products/${productId}`, { method: 'PUT', body: JSON.stringify(product) }),
  deleteProduct: (productId) => request(`/api/products/${productId}`, { method: 'DELETE' }),
  getAdminOrders: () => request('/api/admin/orders'),
  updateAdminOrderStatus: (orderId, status) => request(`/api/admin/orders/${orderId}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
}
