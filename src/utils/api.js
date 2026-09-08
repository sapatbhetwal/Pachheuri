// API client for Pachheuri Full-Stack E-Commerce

const TOKEN_KEY = 'pachheuri_auth_token'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || null
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

async function request(endpoint, options = {}) {
  const token = getStoredToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  })

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
  // Auth
  async register({ name, email, password }) {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
    if (res.token) setStoredToken(res.token)
    return res
  },

  async login({ email, password }) {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (res.token) setStoredToken(res.token)
    return res
  },

  async adminLogin({ email, password }) {
    const res = await request('/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (res.token) setStoredToken(res.token)
    return res
  },

  async getMe() {
    return await request('/api/auth/me')
  },

  async logout() {
    try {
      await request('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore network errors on logout
    }
    setStoredToken(null)
    return { success: true }
  },

  async forgotPassword({ email }) {
    return await request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  async resetPassword({ email, token, newPassword }) {
    return await request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, token, newPassword }),
    })
  },

  // User private data
  async getProfile() {
    return await request('/api/user/profile')
  },

  async updateProfile(data) {
    return await request('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async getCart() {
    return await request('/api/user/cart')
  },

  async updateCart(cart) {
    return await request('/api/user/cart', {
      method: 'PUT',
      body: JSON.stringify({ cart }),
    })
  },

  async getWishlist() {
    return await request('/api/user/wishlist')
  },

  async toggleWishlist(productId) {
    return await request('/api/user/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    })
  },

  async getUserOrders() {
    return await request('/api/user/orders')
  },

  // Payment & Orders
  async validateCard(card) {
    return await request('/api/payment/validate-card', {
      method: 'POST',
      body: JSON.stringify(card),
    })
  },

  async createOrder({ deliveryInfo, items, method, paymentDetails, total }) {
    return await request('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ deliveryInfo, items, method, paymentDetails, total }),
    })
  },

  // Admin
  async getAdminOrders() {
    return await request('/api/admin/orders')
  },

  async updateAdminOrderStatus(orderId, status) {
    return await request(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  },
}
