import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/marketplace.service';
import AppHelmet from '../../components/AppHelmet';
import ProductCard from '../../components/ProductCard/ProductCard';
import Loader from '../../components/Loader/Loader';
import {
  ShoppingBag, LocalShipping, Security, Headset,
  TrendingUp, Star, ArrowForward, ChevronLeft, ChevronRight,
} from '@mui/icons-material';
import './Home.scss';

const CATEGORIES = [
  { id: 'footwear', name: 'Footwear', icon: '👟', color: '#00ae58' },
  { id: 'apparel', name: 'Apparel', icon: '👕', color: '#007a37' },
  { id: 'accessories', name: 'Accessories', icon: '🧢', color: '#00ae58' },
  { id: 'equipment', name: 'Equipment', icon: '⚽', color: '#007a37' },
  { id: 'training', name: 'Training', icon: '💪', color: '#00ae58' },
  { id: 'fan_gear', name: 'Fan Gear', icon: '🏆', color: '#007a37' },
];

export default function Home() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [editorsChoice, setEditorsChoice] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = React.useRef(null);

  const fetchHomeProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [featRes, editorsRes, newRes] = await Promise.all([
        productService.getFeaturedProducts(8),
        productService.getProducts(1, 10, { sortBy: 'rating', sortOrder: 'desc' }),
        productService.getProducts(1, 8, { sortBy: 'createdAt', sortOrder: 'desc' }),
      ]);
      setFeatured(featRes || []);
      setEditorsChoice(editorsRes.products || []);
      setNewArrivals(newRes.products || []);
    } catch (error) {
      console.error('Error fetching home products:', error);
      setFeatured([]);
      setEditorsChoice([]);
      setNewArrivals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeProducts();
  }, [fetchHomeProducts]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="home-page">
      <AppHelmet title="Home" />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Ndonyo — Your Market Day, Online</h1>
          <p>Shop premium footwear, apparel, and gear from trusted sellers across Kenya. Quality products, fast delivery, secure payments.</p>
          <div className="hero-buttons">
            <NavLink to="/marketplace" className="btn btn-primary">
              Start Shopping <ArrowForward style={{ marginLeft: 6 }} />
            </NavLink>
            {!currentUser && (
              <NavLink to="/register" className="btn btn-secondary">
                Create Account
              </NavLink>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <p>Find exactly what you're looking for</p>
        </div>
        <div className="categories-grid">
          {CATEGORIES.map((cat) => (
            <NavLink
              key={cat.id}
              to={`/marketplace?category=${cat.id}`}
              className="category-card"
              style={{ borderBottomColor: cat.color }}
            >
              <span className="category-icon">{cat.icon}</span>
              <h3>{cat.name}</h3>
              <p>Browse {cat.name.toLowerCase()}</p>
            </NavLink>
          ))}
        </div>
      </section>

      {/* Editor's Choice — Horizontal scrolling products */}
      <section className="editors-choice-section">
        <div className="section-header">
          <h2>Editor's Choice</h2>
          <p>Top-rated picks our team loves</p>
          <div className="scroll-controls">
            <button className="scroll-btn" onClick={scrollLeft} aria-label="Scroll left">
              <ChevronLeft />
            </button>
            <button className="scroll-btn" onClick={scrollRight} aria-label="Scroll right">
              <ChevronRight />
            </button>
          </div>
        </div>
        {loading ? (
          <div className="loading-skeleton">
            {[...Array(8)].map((_, i) => (
              <div className="product-skeleton" key={i}></div>
            ))}
          </div>
        ) : editorsChoice.length > 0 ? (
          <div className="horizontal-scroll" ref={scrollRef}>
            {editorsChoice.map((p) => (
              <div className="horizontal-card" key={p.id}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-home">
            <Star style={{ fontSize: 48, color: 'var(--grey)' }} />
            <p>No editor's choice products yet.</p>
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="section-header">
          <h2>Featured Products</h2>
          <p>Hand-picked favourites from our top sellers</p>
          <NavLink to="/marketplace?sort=featured" className="view-all-link">
            View All <ArrowForward style={{ fontSize: 14 }} />
          </NavLink>
        </div>
        {loading ? (
          <div className="loading-skeleton">
            {[...Array(8)].map((_, i) => (
              <div className="product-skeleton" key={i}></div>
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="products-grid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="empty-home">
            <ShoppingBag style={{ fontSize: 48, color: 'var(--grey)' }} />
            <p>No featured products yet. Check back soon!</p>
            <NavLink to="/marketplace" className="btn btn-primary">Browse Marketplace</NavLink>
          </div>
        )}
      </section>

      {/* New Arrivals */}
      <section className="new-arrivals-section">
        <div className="section-header">
          <h2>New Arrivals</h2>
          <p>Fresh stock just landed</p>
          <NavLink to="/marketplace?sort=newest" className="view-all-link">
            View All <ArrowForward style={{ fontSize: 14 }} />
          </NavLink>
        </div>
        {loading ? (
          <div className="loading-skeleton">
            {[...Array(8)].map((_, i) => (
              <div className="product-skeleton" key={i}></div>
            ))}
          </div>
        ) : newArrivals.length > 0 ? (
          <div className="products-grid">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="empty-home">
            <TrendingUp style={{ fontSize: 48, color: 'var(--grey)' }} />
            <p>No new arrivals to show yet.</p>
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="cta-content">
          <h3>Ready to find your next great deal?</h3>
          <p>Join thousands of happy shoppers on Ndonyo. Quality products, trusted sellers, delivered to your door.</p>
          <NavLink to="/marketplace" className="btn-large">
            Explore Marketplace <ArrowForward style={{ marginLeft: 8 }} />
          </NavLink>
        </div>
      </section>
    </div>
  );
}
