import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import SearchBar from './components/SearchBar.jsx'
import Home from './pages/Home.jsx'
import Collection from './pages/Collection.jsx'
import Product from './pages/Product.jsx'
import Cart from './pages/Cart.jsx'
import PlaceOrder from './pages/PlaceOrder.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Orders from './pages/Orders.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import ProductList from './pages/admin/ProductList.jsx'
import AddProduct from './pages/admin/AddProduct.jsx'
import AdminOrders from './pages/admin/AdminOrders.jsx'

const App = () => {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminRoute && <Navbar />}
      {!isAdminRoute && <SearchBar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/product/:productId" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/orders" element={<Orders />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductList />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="edit-product/:productId" element={<AddProduct />} />
            <Route path="orders" element={<AdminOrders />} />
          </Route>
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  )
}

export default App