import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import Hero from '../components/Hero'
import Title from '../components/Title'
import ProductCard from '../components/ProductCard'
import { assets } from "../assets/frontend_assets/assets";
const Home = () => {
  const { products } = useContext(ShopContext)
  const bestsellers = products.filter((p) => p.bestseller).slice(0, 8)
  const latest = [...products].sort((a, b) => b.date - a.date).slice(0, 8)

  const categories = [
    { name: 'Women', image: products.find(p => p.category === 'Women')?.image[0], count: products.filter(p => p.category === 'Women').length },
    { name: 'Men', image: products.find(p => p.category === 'Men')?.image[0], count: products.filter(p => p.category === 'Men').length },
    { name: 'Kids', image: products.find(p => p.category === 'Kids')?.image[0], count: products.filter(p => p.category === 'Kids').length },
  ]

  return (
    <div>
      <Hero />

      {/* Categories */}
      <section className="section-padding py-20">
        <Title text1="Shop by" text2="Category" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link key={cat.name} to={`/collection?category=${cat.name}`} className="group relative overflow-hidden rounded-sm aspect-[4/3]">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <h3 className="font-prata text-2xl mb-1">{cat.name}</h3>
                <p className="text-sm opacity-80">{cat.count} Products</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="section-padding py-20 bg-neutral-50">
        <Title text1="Our" text2="Bestsellers" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {bestsellers.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/collection" className="btn-outline inline-block">View All Products</Link>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-5 bg-neutral-100 rounded-full flex items-center justify-center">
              <img src={assets.exchange_icon} alt="Exchange" className="w-7 h-7" />
            </div>
            <h3 className="font-medium text-neutral-900 mb-2">Easy Exchange</h3>
            <p className="text-sm text-gray-500">Hassle-free returns within 30 days of purchase.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-5 bg-neutral-100 rounded-full flex items-center justify-center">
              <img src={assets.quality_icon} alt="Quality" className="w-7 h-7" />
            </div>
            <h3 className="font-medium text-neutral-900 mb-2">Premium Quality</h3>
            <p className="text-sm text-gray-500">Crafted with the finest materials for lasting comfort.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-5 bg-neutral-100 rounded-full flex items-center justify-center">
              <img src={assets.support_img} alt="Support" className="w-7 h-7" />
            </div>
            <h3 className="font-medium text-neutral-900 mb-2">24/7 Support</h3>
            <p className="text-sm text-gray-500">Our team is always here to help you with anything.</p>
          </div>
        </div>
      </section>

      {/* Latest Arrivals */}
      <section className="section-padding py-20 bg-neutral-50">
        <Title text1="Latest" text2="Arrivals" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {latest.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home