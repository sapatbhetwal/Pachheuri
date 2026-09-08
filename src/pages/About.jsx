import React from 'react'
import { assets } from "../assets/frontend_assets/assets";
import Title from '../components/Title'

const About = () => {
  return (
    <div>
      <div className="section-padding py-16">
        <Title text1="About"  />
        <div className="flex flex-col md:flex-row items-center gap-10 max-w-5xl mx-auto">
          <div className="w-full md:w-1/2">
            <img src={assets.about_img} alt="About Us" className="w-full h-[400px] object-cover rounded-sm" />
          </div>
          <div className="w-full md:w-1/2">
            <p className="text-gray-500 leading-relaxed mb-4">
              Pachherui was born from a simple belief: fashion should be timeless, not disposable. 
              Founded in 2020, we've dedicated ourselves to creating clothing that transcends seasons 
              and trends.
            </p>
            <p className="text-gray-500 leading-relaxed mb-6">
              Every piece in our collection is thoughtfully designed and ethically produced. 
              We partner with skilled artisans and sustainable manufacturers to bring you quality 
              that you can feel good about wearing.
            </p>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <p className="font-prata text-3xl text-neutral-900 mb-1">50K+</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Customers</p>
              </div>
              <div className="text-center">
                <p className="font-prata text-3xl text-neutral-900 mb-1">200+</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Products</p>
              </div>
              <div className="text-center">
                <p className="font-prata text-3xl text-neutral-900 mb-1">15+</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Countries</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About