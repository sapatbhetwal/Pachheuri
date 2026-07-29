import React, { createContext, useState } from 'react'
import { products as initialProducts } from "../assets/frontend_assets/assets"

export const ShopContext = createContext()

const ShopContextProvider = ({ children }) => {
  const currency = '$'
  const delivery_fee = 10

  const [products, setProducts] = useState(initialProducts)
  const [cartItems, setCartItems] = useState({})
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [wishlist, setWishlist] = useState([])

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

  const toggleWishlist = (itemId) => {
    setWishlist((prev) => prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId])
  }

  const placeOrder = (orderData) => {
    const newOrder = {
      id: 'ORD' + Date.now(),
      date: new Date().toISOString(),
      items: { ...cartItems },
      total: getCartAmount() + delivery_fee,
      status: 'Processing',
      ...orderData,
    }
    setOrders((prev) => [newOrder, ...prev])
    setCartItems({})
    return newOrder.id
  }

  // --- Auth Functions ---
  const login = (email, password) => {
    setUser({ email, name: email.split('@')[0], role: 'user' })
    return true
  }

  const adminLogin = (email, password) => {
    if (email === 'admin@123.com' && password === 'admin123') {
      setUser({ email, name: 'Admin', role: 'admin' })
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    setCartItems({})
  }

  // --- Admin Product CRUD ---
  const addProduct = (productData) => {
    const newProduct = {
      _id: 'aaa' + Date.now().toString(36),
      date: Date.now(),
      bestseller: false,
      ...productData,
    }
    setProducts((prev) => [newProduct, ...prev])
    return newProduct._id
  }

  const updateProduct = (productId, updates) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === productId ? { ...p, ...updates } : p))
    )
  }

  const deleteProduct = (productId) => {
    setProducts((prev) => prev.filter((p) => p._id !== productId))
  }

  const toggleBestseller = (productId) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === productId ? { ...p, bestseller: !p.bestseller } : p))
    )
  }

  const value = {
    products,
    currency,
    delivery_fee,
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
    login,
    adminLogin,
    logout,
    orders,
    placeOrder,
    wishlist,
    toggleWishlist,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleBestseller,
  }

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export default ShopContextProvider