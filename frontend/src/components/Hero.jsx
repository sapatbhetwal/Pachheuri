import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from "../assets/frontend_assets/assets";

const Hero = () => {
  return (
    <section className="relative bg-neutral-50 overflow-hidden">
      <div className="section-padding">
        <div className="flex flex-col md:flex-row items-center min-h-[500px] lg:min-h-[600px]">
          <div className="w-full md:w-1/2 py-12 md:py-0 md:pr-12 z-10">
            <div className="max-w-lg">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-[2px] bg-neutral-900"></div>
                <span className="text-sm font-medium tracking-widest text-neutral-500 uppercase">New Arrivals</span>
              </div>
              <h1 className="font-prata text-4xl md:text-5xl lg:text-6xl leading-tight mb-6 text-neutral-900">
                Discover Your<br />
                <span className="italic">Perfect Style</span>
              </h1>
              <p className="text-gray-500 text-base md:text-lg mb-8 leading-relaxed">
                Explore our curated collection of premium fashion for men, women, and kids.
                Quality meets elegance in every piece.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/collection" className="btn-primary inline-block">Shop Now</Link>
                <Link to="/collection" className="btn-outline inline-block">View Collection</Link>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 relative">
            <div className="relative">
              <img
                src={assets.hero_img}
                alt="Fashion Collection"
                className="w-full h-[400px] md:h-[500px] lg:h-[600px] object-cover object-top"
              />
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-sm shadow-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Starting from</p>
                <p className="text-2xl font-prata font-bold text-neutral-900">$100</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero