// Embedded Persistent Database for Pachheuri (IndexedDB with LocalStorage Fallback)
import { products as initialProducts } from '../assets/frontend_assets/assets'

const DB_NAME = 'PachheuriStoreDB'
const DB_VERSION = 1

const STORAGE_KEYS = {
  PRODUCTS: 'pachheuri_products_backup',
  ORDERS: 'pachheuri_orders_backup',
  CART: 'pachheuri_cart_backup',
  USER: 'pachheuri_user_backup',
  WISHLIST: 'pachheuri_wishlist_backup',
}

let dbInstance = null

export function getDB() {
  if (dbInstance) return Promise.resolve(dbInstance)
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null)
      return
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = (event) => {
        const db = event.target.result
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: '_id' })
        }
        if (!db.objectStoreNames.contains('orders')) {
          db.createObjectStore('orders', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('custom_assets')) {
          db.createObjectStore('custom_assets', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' })
        }
      }

      request.onsuccess = (event) => {
        dbInstance = event.target.result
        resolve(dbInstance)
      }

      request.onerror = (err) => {
        console.warn('IndexedDB failed to open, falling back to localStorage:', err)
        resolve(null)
      }
    } catch (e) {
      console.warn('IndexedDB exception, falling back to localStorage:', e)
      resolve(null)
    }
  })
}

// Helper for IndexedDB transaction
async function withStore(storeName, mode, callback) {
  const db = await getDB()
  if (!db) return null
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, mode)
      const store = tx.objectStore(storeName)
      const req = callback(store)

      tx.oncomplete = () => resolve(req ? req.result : true)
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    } catch (err) {
      reject(err)
    }
  })
}

// --- Product Operations ---

export async function fetchProductsFromDB() {
  try {
    const db = await getDB()
    if (db) {
      const stored = await withStore('products', 'readonly', (store) => store.getAll())
      if (stored && stored.length > 0) {
        return stored
      }
      // Seed default products into IndexedDB on first run
      await withStore('products', 'readwrite', (store) => {
        initialProducts.forEach((p) => store.put(p))
      })
      return initialProducts
    }
  } catch (e) {
    console.warn('Error reading products from IndexedDB:', e)
  }

  // Fallback to localStorage
  try {
    const local = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
    if (local) {
      const parsed = JSON.parse(local)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts))
  } catch (e) {
    console.warn('localStorage error:', e)
  }

  return initialProducts
}

export async function saveProductToDB(product) {
  try {
    await withStore('products', 'readwrite', (store) => store.put(product))
  } catch (e) {
    console.warn('Failed to save product in IndexedDB:', e)
  }

  // Also sync to localStorage
  try {
    const local = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
    const list = local ? JSON.parse(local) : []
    const idx = list.findIndex((p) => p._id === product._id)
    if (idx >= 0) {
      list[idx] = product
    } else {
      list.unshift(product)
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list))
  } catch {
    // Ignore storage quota errors in fallback
  }
}

export async function deleteProductFromDB(productId) {
  try {
    await withStore('products', 'readwrite', (store) => store.delete(productId))
  } catch (e) {
    console.warn('Failed to delete product from IndexedDB:', e)
  }

  try {
    const local = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
    if (local) {
      const list = JSON.parse(local).filter((p) => p._id !== productId)
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list))
    }
  } catch {
    // ignore
  }
}

export async function resetProductsInDB() {
  try {
    await withStore('products', 'readwrite', (store) => {
      store.clear()
      initialProducts.forEach((p) => store.put(p))
    })
  } catch (e) {
    console.warn('Failed to reset products in IndexedDB:', e)
  }

  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts))
  } catch {
    // ignore
  }

  return initialProducts
}

// --- Orders Operations ---

export async function fetchOrdersFromDB() {
  try {
    const db = await getDB()
    if (db) {
      const stored = await withStore('orders', 'readonly', (store) => store.getAll())
      if (stored && Array.isArray(stored)) {
        return stored.reverse()
      }
    }
  } catch (e) {
    console.warn('Error fetching orders from IndexedDB:', e)
  }

  try {
    const local = localStorage.getItem(STORAGE_KEYS.ORDERS)
    if (local) return JSON.parse(local)
  } catch {
    // ignore
  }

  return []
}

export async function saveOrderToDB(order) {
  try {
    await withStore('orders', 'readwrite', (store) => store.put(order))
  } catch (e) {
    console.warn('Failed to save order in IndexedDB:', e)
  }

  try {
    const local = localStorage.getItem(STORAGE_KEYS.ORDERS)
    const list = local ? JSON.parse(local) : []
    list.unshift(order)
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(list))
  } catch {
    // ignore
  }
}

export async function updateOrderStatusInDB(orderId, status) {
  try {
    const db = await getDB()
    if (db) {
      await withStore('orders', 'readwrite', (store) => {
        const req = store.get(orderId)
        req.onsuccess = () => {
          if (req.result) {
            const updated = { ...req.result, status }
            store.put(updated)
          }
        }
      })
    }
  } catch (e) {
    console.warn('Failed to update order status in IndexedDB:', e)
  }

  try {
    const local = localStorage.getItem(STORAGE_KEYS.ORDERS)
    if (local) {
      const list = JSON.parse(local).map((o) => (o.id === orderId ? { ...o, status } : o))
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(list))
    }
  } catch {
    // ignore
  }
}

// --- Meta / Session Helpers ---

export function getLocalData(key, defaultVal) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultVal
  } catch {
    return defaultVal
  }
}

export function setLocalData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}
