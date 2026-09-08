import React, { createContext, useState, useEffect, useCallback } from 'react'
import { products as initialProducts } from '../assets/frontend_assets/assets'
import {
  fetchProductsFromDB,
  saveProductToDB,
  deleteProductFromDB,
  resetProductsInDB,
  fetchOrdersFromDB,
  saveOrderToDB,
  updateOrderStatusInDB,
  getLocalData,
  setLocalData,
} from '../utils/db'
import { api, getStoredToken, setStoredToken } from '../utils/api'

export const ShopContext = createContext()

// Helper to normalize any legacy cached price in IndexedDB to realistic Nepal Rupee (NPR) prices
const normalizePrice = (p) => {
  let price = Number(p.price) || 1200
  if (price < 500) {
    if (price === 200) price = 2500
    else if (price === 100) price = 1500
    else if (price === 220) price = 2800
    else if (price === 110) price = 1650
    else price = Math.round((price * 12.5) / 50) * 50
  }
  return { ...p, price }
}

const ShopContextProvider = ({ children }) => {
  const currency = 'Rs. '
  const delivery_fee = 100 // Standard Kathmandu Valley delivery fee: Rs. 100, Outside Valley: Rs. 150

  const getDeliveryFee = useCallback((district = '') => {
    const valleyDistricts = ['kathmandu', 'lalitpur', 'bhaktapur']
    const isValley = valleyDistricts.includes(district.toLowerCase().trim())
    return isValley ? 100 : 150
  }, [])

  const formatPrice = useCallback((amount) => {
    const num = Number(amount) || 0
    return `Rs. ${num.toLocaleString('en-IN')}`
  }, [])

  // State
  const [products, setProducts] = useState(() => initialProducts.map(normalizePrice))
  const [isDbLoaded, setIsDbLoaded] = useState(false)
  const [cartItems, setCartItems] = useState(() => getLocalData('pachheuri_cart', {}))
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [user, setUser] = useState(() => getLocalData('pachheuri_user', null))
  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])
  const [wishlist, setWishlist] = useState(() => getLocalData('pachheuri_wishlist', []))
  const [authLoading, setAuthLoading] = useState(true)

  // Load products from persistent IndexedDB
  useEffect(() => {
    let isMounted = true

    fetchProductsFromDB().then((data) => {
      if (isMounted && data && data.length > 0) {
        setProducts(data.map(normalizePrice))
        setIsDbLoaded(true)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  // Verify and restore authenticated session on mount
  useEffect(() => {
    let isMounted = true
    const token = getStoredToken()

    if (!token) {
      setAuthLoading(false)
      return
    }

    api
      .getMe()
      .then((res) => {
        if (isMounted && res && res.success && res.user) {
          setUser(res.user)
          setProfile(res.user)
          setLocalData('pachheuri_user', res.user)
        }
      })
      .catch(() => {
        if (isMounted) {
          setStoredToken(null)
          setUser(null)
          setProfile(null)
          setLocalData('pachheuri_user', null)
        }
      })
      .finally(() => {
        if (isMounted) setAuthLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Synchronize user-specific data (cart, wishlist, orders) whenever the authenticated user changes
  const loadUserData = useCallback(async (currentUser) => {
    if (!currentUser) {
      // Unauthenticated / Guest state
      setOrders([])
      return
    }

    try {
      // Admin sees all orders; regular user sees only their own orders
      if (currentUser.role === 'admin') {
        const res = await api.getAdminOrders().catch(() => null)
        if (res && res.orders) {
          setOrders(res.orders)
        } else {
          const localOrders = await fetchOrdersFromDB()
          setOrders(localOrders || [])
        }
      } else {
        const [ordersRes, cartRes, wishRes, profRes] = await Promise.allSettled([
          api.getUserOrders(),
          api.getCart(),
          api.getWishlist(),
          api.getProfile(),
        ])

        if (ordersRes.status === 'fulfilled' && ordersRes.value.orders) {
          setOrders(ordersRes.value.orders)
        } else {
          const localOrders = await fetchOrdersFromDB()
          const myLocalOrders = (localOrders || []).filter(
            (o) => o.userId === currentUser.id || o.userEmail === currentUser.email
          )
          setOrders(myLocalOrders)
        }

        if (cartRes.status === 'fulfilled' && cartRes.value.cart) {
          setCartItems(cartRes.value.cart)
        }

        if (wishRes.status === 'fulfilled' && wishRes.value.wishlist) {
          setWishlist(wishRes.value.wishlist)
        }

        if (profRes.status === 'fulfilled' && profRes.value.profile) {
          setProfile(profRes.value.profile)
        }
      }
    } catch (err) {
      console.error('Error loading user-specific data:', err)
    }
  }, [])

  useEffect(() => {
    loadUserData(user)
  }, [user, loadUserData])

  // Sync cart to local storage and server
  useEffect(() => {
    setLocalData('pachheuri_cart', cartItems)
    if (user && user.role !== 'admin') {
      const timer = setTimeout(() => {
        api.updateCart(cartItems).catch(() => {})
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [cartItems, user])

  // Sync user to local storage
  useEffect(() => {
    setLocalData('pachheuri_user', user)
  }, [user])

  // Sync wishlist to local storage
  useEffect(() => {
    setLocalData('pachheuri_wishlist', wishlist)
  }, [wishlist])

  // --- Cart Functions ---
  const addToCart = (itemId, size) => {
    if (!size) return false
    setCartItems((prev) => {
      const updated = { ...prev }
      if (!updated[itemId]) updated[itemId] = {}
      updated[itemId][size] = (updated[itemId][size] || 0) + 1
      return updated
    })
    return true
  }

  const updateQuantity = (itemId, size, quantity) => {
    setCartItems((prev) => {
      const updated = { ...prev }
      if (!updated[itemId]) updated[itemId] = {}
      if (quantity <= 0) {
        delete updated[itemId][size]
        if (Object.keys(updated[itemId]).length === 0) delete updated[itemId]
      } else {
        updated[itemId][size] = quantity
      }
      return updated
    })
  }

  const getCartCount = () => {
    let count = 0
    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) count += cartItems[itemId][size]
    }
    return count
  }

  const getCartAmount = () => {
    let amount = 0
    for (const itemId in cartItems) {
      const product = products.find((p) => p._id === itemId)
      if (product) {
        for (const size in cartItems[itemId]) amount += product.price * cartItems[itemId][size]
      }
    }
    return amount
  }

  const toggleWishlist = async (itemId) => {
    setWishlist((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
    if (user) {
      try {
        const res = await api.toggleWishlist(itemId)
        if (res && res.wishlist) setWishlist(res.wishlist)
      } catch (err) {
        console.error('Failed to sync wishlist with server:', err)
      }
    }
  }

  // --- Order & Payment Functions ---
  const placeOrder = async ({ deliveryInfo, method, paymentDetails }) => {
    const total = getCartAmount() + delivery_fee

    // Call backend endpoint to validate payment details and record order
    const result = await api.createOrder({
      deliveryInfo,
      items: { ...cartItems },
      method,
      paymentDetails,
      total,
    })

    if (result && result.success && result.order) {
      setOrders((prev) => [result.order, ...prev])
      setCartItems({})
      await saveOrderToDB(result.order)
      return result.order
    }

    throw new Error(result?.error || 'Failed to place order')
  }

  const updateOrderStatus = async (orderId, status) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
    await api.updateAdminOrderStatus(orderId, status).catch(() => {})
    await updateOrderStatusInDB(orderId, status)
  }

  // --- Auth Functions ---
  const register = async (name, email, password) => {
    const res = await api.register({ name, email, password })
    if (res.success && res.user) {
      setUser(res.user)
      setProfile(res.user)
      setCartItems({})
      setWishlist([])
      return res.user
    }
    throw new Error(res.error || 'Registration failed')
  }

  const login = async (email, password) => {
    const res = await api.login({ email, password })
    if (res.success && res.user) {
      setUser(res.user)
      setProfile(res.user)
      return res.user
    }
    throw new Error(res.error || 'Invalid credentials')
  }

  const adminLogin = async (email, password) => {
    const res = await api.adminLogin({ email, password })
    if (res.success && res.user) {
      setUser(res.user)
      setProfile(res.user)
      return res.user
    }
    throw new Error(res.error || 'Invalid admin credentials')
  }

  const logout = async () => {
    await api.logout().catch(() => {})
    setUser(null)
    setProfile(null)
    setCartItems({})
    setWishlist([])
    setOrders([])
    setLocalData('pachheuri_user', null)
    setLocalData('pachheuri_cart', {})
    setLocalData('pachheuri_wishlist', [])
  }

  const forgotPassword = async (email) => {
    return await api.forgotPassword({ email })
  }

  const resetPassword = async (email, token, newPassword) => {
    return await api.resetPassword({ email, token, newPassword })
  }

  const updateProfile = async (data) => {
    const res = await api.updateProfile(data)
    if (res.success && res.profile) {
      setProfile(res.profile)
      setUser((prev) => ({ ...prev, ...res.profile }))
      return res.profile
    }
    throw new Error(res.error || 'Failed to update profile')
  }

  // --- Admin Product CRUD with Persistent DB ---
  const addProduct = async (productData) => {
    const newProduct = {
      _id: 'prod_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      date: Date.now(),
      bestseller: false,
      ...productData,
    }
    setProducts((prev) => [newProduct, ...prev])
    await saveProductToDB(newProduct)
    return newProduct._id
  }

  const updateProduct = async (productId, updates) => {
    let updatedObj = null
    setProducts((prev) =>
      prev.map((p) => {
        if (p._id === productId) {
          updatedObj = { ...p, ...updates }
          return updatedObj
        }
        return p
      })
    )
    if (updatedObj) {
      await saveProductToDB(updatedObj)
    }
  }

  const deleteProduct = async (productId) => {
    setProducts((prev) => prev.filter((p) => p._id !== productId))
    await deleteProductFromDB(productId)
  }

  const toggleBestseller = async (productId) => {
    let target = null
    setProducts((prev) =>
      prev.map((p) => {
        if (p._id === productId) {
          target = { ...p, bestseller: !p.bestseller }
          return target
        }
        return p
      })
    )
    if (target) {
      await saveProductToDB(target)
    }
  }

  const resetCatalogToDefault = async () => {
    const defaultData = await resetProductsInDB()
    setProducts(defaultData)
  }

  const value = {
    products,
    isDbLoaded,
    currency,
    delivery_fee,
    getDeliveryFee,
    formatPrice,
    cartItems,
    addToCart,
    updateQuantity,
    getCartCount,
    getCartAmount,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    user,
    profile,
    authLoading,
    register,
    login,
    adminLogin,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    orders,
    placeOrder,
    updateOrderStatus,
    wishlist,
    toggleWishlist,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleBestseller,
    resetCatalogToDefault,
  }

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export default ShopContextProvider
