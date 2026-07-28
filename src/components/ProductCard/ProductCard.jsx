import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Favorite, FavoriteBorder, ShoppingCart, Visibility } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import toast from 'react-hot-toast';
import './ProductCard.scss';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || null);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [wishloading, setWishLoading] = useState(false);

  const outOfStock = !product.in_stock || product.stock === 0;

  const handleQuickView = (e) => {
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  const handleAddToWishlist = async (e) => {
    e.stopPropagation();
    if (!currentUser) {
      toast.error('Please log in to use your wishlist');
      navigate('/login');
      return;
    }
    setWishLoading(true);
    const result = await toggleWishlist(product.id);
    setWishLoading(false);
    if (result.success) {
      if (isWishlisted(product.id)) {
        toast.success('Removed from wishlist');
      } else {
        toast.success('Added to wishlist!');
      }
    } else if (result.error !== 'not_authenticated') {
      toast.error('Could not update wishlist');
    }
  };

  const handleAddToCartClick = async (e) => {
    e.stopPropagation();
    if (!currentUser) {
      toast.error('Please log in to add items to cart');
      navigate('/login');
      return;
    }
    if (outOfStock) return;
    const result = await addToCart(product.id, 1, selectedSize, selectedColor);
    if (result.success) {
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error(result.error || 'Could not add to cart');
    }
  };

  return (
    <div 
      className="product-card" 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-image">
        {!imageLoaded && <div className="image-skeleton"></div>}
        <img 
          src={product.images?.[0] || '/placeholder.jpg'} 
          alt={product.name}
          onLoad={() => setImageLoaded(true)}
          style={{ opacity: imageLoaded ? 1 : 0 }}
        />
        {product.discount && <span className="discount-badge">-{product.discount}%</span>}
        {outOfStock && <span className="out-of-stock">Out of Stock</span>}
        {product.isNew && <span className="new-badge">New</span>}
        {product.bestseller && <span className="bestseller-badge">⭐ Bestseller</span>}
        
        <div className={`product-actions ${isHovered ? 'show' : ''}`}>
          <button className="action-btn" onClick={handleQuickView} title="Quick View">
            <Visibility />
          </button>
          <button className="action-btn" onClick={handleAddToWishlist} disabled={wishloading} title="Add to Wishlist">
            {isWishlisted(product.id) ? <Favorite className="active" /> : <FavoriteBorder />}
          </button>
          <button className="action-btn" onClick={handleAddToCartClick} disabled={outOfStock} title="Add to Cart">
            <ShoppingCart />
          </button>
        </div>
      </div>
      
      <div className="product-info">
        <div className="product-header">
          <h3 onClick={() => navigate(`/product/${product.id}`)}>{product.name}</h3>
          <span className="category">{product.category}</span>
        </div>
        
        <div className="rating">
          <div className="stars">
            {[1, 2, 3, 4, 5].map(star => (
              <span key={star} className={`star ${star <= (product.rating || 0) ? 'filled' : ''}`}>★</span>
            ))}
          </div>
          <span className="review-count">({product.reviews_count || 0})</span>
        </div>
        
        <div className="price">
          <span className="current">KSH {Number(product.price || 0).toLocaleString()}</span>
          {product.old_price && Number(product.old_price) > 0 && <span className="old">KSH {Number(product.old_price).toLocaleString()}</span>}
        </div>
        
        {product.sizes && product.sizes.length > 0 && (
          <div className="size-selector">
            <span className="selector-label">Size:</span>
            <div className="size-options">
              {product.sizes.map(size => (
                <button
                  key={size}
                  className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setSelectedSize(size); }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {product.colors && product.colors.length > 0 && (
          <div className="color-selector">
            <span className="selector-label">Color:</span>
            <div className="color-options">
              {product.colors.map(color => (
                <button
                  key={color}
                  className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                  style={{ backgroundColor: color.toLowerCase() }}
                  onClick={(e) => { e.stopPropagation(); setSelectedColor(color); }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
        
        <button
          className="add-to-cart-btn"
          onClick={handleAddToCartClick}
          disabled={outOfStock}
        >
          {outOfStock ? 'Out of Stock' : 'Add to Cart'}
          <ShoppingCart className="btn-icon" />
        </button>
      </div>
    </div>
  );
}
