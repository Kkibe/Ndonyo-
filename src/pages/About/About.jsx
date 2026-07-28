import React, { useLayoutEffect } from 'react'
import FaqItem from '../../components/FaqItem/FaqItem';
import { faqs, testimonials } from '../../data';
import AppHelmet from '../../components/AppHelmet';
import { LocalShipping, Security, Headset, ShoppingBag } from '@mui/icons-material';

export default function About() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  });

  const features = [
    { icon: <ShoppingBag />, title: 'Wide Selection', desc: 'Thousands of products from verified sellers across Kenya.' },
    { icon: <LocalShipping />, title: 'Fast Delivery', desc: 'Free shipping on orders over KSH 5,000. Get it in 1-3 days.' },
    { icon: <Security />, title: 'Secure Payments', desc: 'Pay with M-Pesa, card, or cash on delivery. Buyer protection included.' },
    { icon: <Headset />, title: '24/7 Support', desc: 'Our team is always here to help with any questions or issues.' },
  ];

  return (
    <div className='about'>
      <AppHelmet title={"About"} location={'/about'} />
      <div className="about-us">
        <div className="info">
          <h1 className="about-title">About Ndonyo</h1>
          <p className="about-description">Welcome to Ndonyo, your online market day. We connect buyers and sellers across Kenya and beyond, making it easy to find quality products at fair prices. Whether you're shopping for footwear, apparel, equipment, or everyday essentials, Ndonyo brings the market to your fingertips.</p>

          <h1 className="section-title">For Shoppers</h1>
          <p className="section-description">Discover thousands of products from trusted sellers, all in one place. Compare prices, read reviews, and shop with confidence thanks to our secure checkout and buyer protection. Pay the way that suits you — M-Pesa, card, or cash on delivery — and get your order delivered fast.</p>

          <h1 className="section-title">For Sellers</h1>
          <p className="section-description">Grow your business on Ndonyo. List your products in minutes, reach customers across the country, and manage everything from a simple dashboard. We handle the payments and help with shipping so you can focus on what you do best.</p>

          <h1 className="section-title">Stay Updated with Real-Time Insights</h1>
          <p className="section-description">Track your orders in real time, get notified about new arrivals and deals, and stay on top of your shopping. Our platform keeps you informed every step of the way, from checkout to delivery.</p>

          <h1 className="section-title">Our Mission</h1>
          <p className="section-description mission-text">We're here to make online shopping simple, safe, and accessible for everyone. By connecting local sellers with buyers, we help communities thrive and give every product a fair chance to find its home. Join us today and be part of a marketplace built on trust.</p>
        </div>
      </div>

      {/* Why Shop With Us */}
      <div className="why-shop-section">
        <h1 className="faq-main-title">Why Shop With Us</h1>
        <h2 className="faq-subtitle">What makes Ndonyo different</h2>
        <div className="features-grid">
          {features.map((feature, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials — horizontal scrolling */}
      <div className="testimonials-section">
        <h1 className="faq-main-title">What Our Customers Say</h1>
        <h2 className="faq-subtitle">Real stories from real shoppers</h2>
        <div className="testimonials-scroll">
          {testimonials.map((testimonial, i) => (
            <div className="testimonial-card" key={i}>
              <p className="testimonial-text">"{testimonial.text}"</p>
              <div className="stars-container">
                {'★'.repeat(5)}
              </div>
              <div className="user-info">
                <div>
                  <span className="name">{testimonial.name}</span>
                  <span className="country">{testimonial.country}</span>
                </div>
                <div className="verified-badge">
                  <span>Verified Buyer</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <h1 className="faq-main-title" id='faq'>FAQ's</h1>
      <h2 className="faq-subtitle">People ask for:</h2>
      <div className="faqs-container">
        {
          faqs.map(faq => {
            return (
              <FaqItem key={faq.id} question={faq.question} answer={faq.answer} />
            )
          })
        }
      </div>
    </div>
  )
}
