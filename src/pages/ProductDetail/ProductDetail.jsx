import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../../services/marketplace.service';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Loader from '../../components/Loader/Loader';
import {
  ArrowBack, ShoppingCart, Favorite, FavoriteBorder, Star,
  LocalShipping, Security, Refresh, Store,
} from '@mui/icons-material';
import './ProductDetail.scss';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    const data = await productService.getProduct(id);
    setProduct(data);
    if (data) {
      setSelectedSize(data.sizes?.[0] || null);
      setSelectedColor(data.colors?.[0] || null);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [fetchProduct]);

  const handleAddToCart = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const result = await addToCart(product.id, quantity, selectedSize, selectedColor);
    if (result.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } else {
      alert(result.error || 'Could not add to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const result = await addToCart(product.id, quantity, selectedSize, selectedColor);
    if (result.success) {
      navigate('/checkout');
    }
  };

  if (loading) return <Loader />;

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="not-found">
          <h2>Product Not Found</h2>
          <p>This product may have been removed or is no longer available.</p>
          <Link to="/marketplace" className="btn-primary">Back to Marketplace</Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length ? product.images : ['/placeholder.jpg'];

  return (
    <div className="product-detail-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/marketplace">Shop</Link> / <span>{product.name}</span>
      </div>

      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowBack /> Back
      </button>

      <div className="product-detail-grid">
        {/* Images */}
        <div className="product-images">
          <div className="main-image">
            <img src={images[selectedImage]} alt={product.name} />
            {!product.inStock && <span className="out-of-stock">Out of Stock</span>}
            {product.oldPrice && (
              <span className="discount-badge">
                -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="image-thumbnails">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`thumb ${selectedImage === i ? 'active' : ''}`}
                  onClick={() => setSelectedImage(i)}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="product-info">
          <span className="category-tag">{product.category}</span>
          <h1>{product.name}</h1>

          <div className="rating-row">
            <div className="stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={s <= Math.round(product.rating || 0) ? 'filled' : ''}
                />
              ))}
            </div>
            <span className="review-count">({product.reviews?.length || 0} reviews)</span>
            <span className="sold">| {product.salesCount || 0} sold</span>
          </div>

          <div className="price-box">
            <span className="current-price">KSH {product.price?.toLocaleString()}</span>
            {product.oldPrice && (
              <span className="old-price">KSH {product.oldPrice?.toLocaleString()}</span>
            )}
          </div>

          {product.description && (
            <div className="description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className="variant-section">
              <label>Size</label>
              <div className="variant-options">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`variant-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div className="variant-section">
              <label>Color</label>
              <div className="variant-options">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color.toLowerCase() }}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="quantity-section">
            <label>Quantity</label>
            <div className="quantity-control">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
              <span>{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                disabled={quantity >= (product.stock || 99)}
              >
                +
              </button>
            </div>
            {product.stock <= 10 && product.stock > 0 && (
              <span className="low-stock">Only {product.stock} left!</span>
            )}
          </div>

          <div className="action-buttons">
            <button
              className="btn-cart"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingCart />
              {added ? 'Added!' : 'Add to Cart'}
            </button>
            <button
              className="btn-buy"
              onClick={handleBuyNow}
              disabled={!product.inStock}
            >
              Buy Now
            </button>
            <button className="btn-wishlist" title="Add to wishlist">
              <FavoriteBorder />
            </button>
          </div>

          <div className="assurance-box">
            <div className="assurance-item">
              <LocalShipping />
              <div>
                <strong>Fast Delivery</strong>
                <span>1-5 business days</span>
              </div>
            </div>
            <div className="assurance-item">
              <Security />
              <div>
                <strong>Secure Payment</strong>
                <span>M-Pesa, Card, COD</span>
              </div>
            </div>
            <div className="assurance-item">
              <Refresh />
              <div>
                <strong>Easy Returns</strong>
                <span>30-day return policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seller info */}
      {product.seller && (
        <div className="seller-strip">
          <Store />
          <div>
            <span>Sold by</span>
            <strong>{product.seller}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
