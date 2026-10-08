'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { PropertyCard } from '@/components/property-card';

export default function ContactPage() {
  const [inquiryCategory, setInquiryCategory] = useState<'general' | 'property' | 'owner_business'>('general');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    building: '',
    message: ''
  });

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-serif font-semibold mb-4">Contact Us</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Have questions about a property, our services, or tenant services? We&apos;re here to help.
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-serif font-semibold text-slate-900 mb-6">
                Get in Touch
              </h2>

              <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-medium text-slate-900 mb-1">General Inquiries</h3>
                  <a href="mailto:info@teams-management.com" className="text-slate-600 hover:text-slate-900 transition-colors break-all">
                    info@teams-management.com
                  </a>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-medium text-slate-900 mb-1">Phone</h3>
                  <a href="tel:+12125550123" className="text-slate-600 hover:text-slate-900 transition-colors">
                    (212) 555-0123
                  </a>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-medium text-slate-900 mb-1">Hours</h3>
                  <p className="text-slate-600">Monday - Friday: 9am - 6pm EST</p>
                  <p className="text-slate-500 text-sm mt-1">Saturday - Sunday: By appointment</p>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <h3 className="font-medium text-slate-900 mb-3">Contact Categories</h3>
                  <div className="space-y-2">
                    {['general', 'property', 'owner_business'].map((category) => (
                      <label 
                        key={category}
                        className={`inline-flex items-center px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                          inquiryCategory === category 
                            ? 'bg-slate-100 text-slate-900' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={category}
                          checked={inquiryCategory === category}
                          onChange={() => setInquiryCategory(category as any)}
                          className="sr-only"
                        />
                        <span className="capitalize mr-2">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Inquiry Form */}
            <div role="status" className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-slate-700">
              Online inquiries are temporarily unavailable. Please email the team using the contact address on this page.
            </div>
            <form hidden onSubmit={(event) => event.preventDefault()} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-shadow"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-shadow"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number (optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-shadow"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label htmlFor="building" className="block text-sm font-medium text-slate-700 mb-1">
                    Building (optional)
                  </label>
                  <select
                    id="building"
                    name="building"
                    value={formData.building}
                    onChange={(e) => setFormData(prev => ({ ...prev, building: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-shadow"
                  >
                    <option value="">Select a property (optional)</option>
                    {/* TODO: Populate from D1 in production */}
                    <option value="central-park-tower">Central Park Tower</option>
                    <option value="brooklyn-bridge-view">Brooklyn Bridge View Residences</option>
                    <option value="upper-east-side-garden-court">Upper East Side Garden Court</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-shadow resize-none"
                    placeholder="How can we help you?"
                  />
                </div>

                <button
                  type="submit"
                  disabled
                  className="w-full px-6 py-3 rounded-lg font-medium bg-slate-400 text-white cursor-not-allowed"
                >
                  Submit Inquiry
                </button>

                <p className="text-xs text-slate-500 text-center">
                  Online submissions are temporarily unavailable. Please use the email contact listed above.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Related Properties */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-serif font-semibold text-slate-900 mb-8 text-center">
            Properties We&apos;re Managing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* TODO: Query buildings from D1 in production */}
            <div className="p-6 bg-white rounded-lg border border-slate-200">
              <h3 className="font-medium text-slate-900 mb-2">General Inquiries</h3>
              <p className="text-sm text-slate-500">Questions about our company or services</p>
            </div>
            <div className="p-6 bg-white rounded-lg border border-slate-200">
              <h3 className="font-medium text-slate-900 mb-2">Property Specific</h3>
              <p className="text-sm text-slate-500">Building information, amenities, or residency questions</p>
            </div>
            <div className="p-6 bg-white rounded-lg border border-slate-200">
              <h3 className="font-medium text-slate-900 mb-2">Owner/Business</h3>
              <p className="text-sm text-slate-500">Building owner inquiries or partnership opportunities</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
