import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from "../assets/frontend_assets/assets";
const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="section-padding py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div className="lg:col-span-1">
            <img src={assets.logo} alt="Forever" className="h-8 object-contain invert mb-6" />
            <p className="text-gray-400 text-sm leading-relaxed mb-6">

              Pachheuri is your destination for timeless fashion. We believe in quality,
              sustainability, and style that lasts beyond seasons.
            </p>
            <div className="flex gap-4">
              {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                <a key={social} href="#" className="w-9 h-9 border border-gray-700 rounded-full flex items-center justify-center hover:border-white hover:bg-white hover:text-neutral-900 transition-all">
                  <span className="text-xs font-bold uppercase">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase mb-6">Company</h4>
            <ul className="space-y-3">
              {['About Us', 'Careers', 'Press', 'Blog'].map((item) => (
                <li key={item}>
                  <Link to="/about" className="text-gray-400 text-sm hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase mb-6">Support</h4>
            <ul className="space-y-3">
              {['Contact Us', 'FAQs', 'Shipping Info', 'Returns & Exchanges', 'Size Guide'].map((item) => (
                <li key={item}>
                  <Link to="/contact" className="text-gray-400 text-sm hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase mb-6">Stay Updated</h4>
            <p className="text-gray-400 text-sm mb-4">Subscribe for exclusive offers and new arrivals.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-white/10 border border-gray-700 text-white text-sm px-4 py-2.5 outline-none focus:border-white transition-colors placeholder:text-gray-500"
              />
              <button className="bg-white text-neutral-900 px-5 py-2.5 text-sm font-medium hover:bg-gray-200 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">&copy; 2026 Pachheuri. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <img src={assets.razorpay_logo} alt="Razorpay" className="h-5 object-contain opacity-60" />
            <img src={assets.stripe_logo} alt="Stripe" className="h-5 object-contain opacity-60" />
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer