import React, { createContext, useState, useEffect } from 'react'
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

export const ShopContext = createContext()

const ShopContextProvider = ({ children }) => {
  const currency = '$'
  const delivery_fee = 10

  // State with initial fallback
  const [products, setProducts] = useState(initialProducts)
  const [isDbLoaded, setIsDbLoaded] = useState(false)
  const [cartItems, setCartItems] = useState(() => getLocalData('pachheuri_cart', {}))
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [user, setUser] = useState(() => getLocalData('pachheuri_user', null))
  const [orders, setOrders] = useState([])
  const [wishlist, setWishlist] = useState(() => getLocalData('pachheuri_wishlist', []))

  // Load products and orders from persistent IndexedDB on mount
  useEffect(() => {
    let isMounted = true

    fetchProductsFromDB().then((data) => {
      if (isMounted && data && data.length > 0) {
        setProducts(data)
        setIsDbLoaded(true)
      }
    })

    fetchOrdersFromDB().then((data) => {
      if (isMounted && data) {
        setOrders(data)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  // Sync cart to local storage
  useEffect(() => {
    setLocalData('pachheuri_cart', cartItems)
  }, [cartItems])

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

  const toggleWishlist = (itemId) => {
    setWishlist((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const placeOrder = async (orderData) => {
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
    await saveOrderToDB(newOrder)
    return newOrder.id
  }

  const updateOrderStatus = async (orderId, status) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
    await updateOrderStatusInDB(orderId, status)
  }

  // --- Auth Functions ---
  const login = (email, _password) => {
    const newUser = { email, name: email.split('@')[0], role: 'user' }
    setUser(newUser)
    return true
  }

  const adminLogin = (email, password) => {
    if (email === 'admin@123.com' && password === 'admin123') {
      const adminUser = { email, name: 'Admin', role: 'admin' }
      setUser(adminUser)
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    setCartItems({})
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
