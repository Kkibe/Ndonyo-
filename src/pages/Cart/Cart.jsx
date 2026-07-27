import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Loader from '../../components/Loader/Loader';
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowLeft,
  Truck, ShieldCheck, ChevronRight,
} from 'lucide-react';
import './Cart.scss';

export default function Cart() {
  const { currentUser } = useAuth();
  const { cart, updateQuantity, removeItem, loading } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const updateQuantityHandler = (productId, newQuantity, size, color) => {
    if (newQuantity < 1) {
      removeItem(productId, size, color);
    } else {
      updateQuantity(productId, newQuantity, size, color);
    }
  };

  if (loading) return <Loader />;

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="empty-cart-icon">🛒</div>
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added any items yet.</p>
        <button className="btn-primary" onClick={() => navigate('/marketplace')}>
          Continue Shopping
        </button>
      </div>
    );
  }

  const subtotal = cart.total || 0;
  const shipping = subtotal >= 5000 ? 0 : 250;
  const total = subtotal + shipping;

  return (
    <div className="cart-page">
      <div className="cart-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> Back
        </button>
        <h1>Shopping Cart</h1>
        <div className="cart-steps">
          <div className="step active">
            <span className="step-num">1</span>
            <span className="step-label">Cart</span>
          </div>
          <div className="step-line"></div>
          <div className="step">
            <span className="step-num">2</span>
            <span className="step-label">Checkout</span>
          </div>
          <div className="step-line"></div>
          <div className="step">
            <span className="step-num">3</span>
            <span className="step-label">Done</span>
          </div>
        </div>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          <div className="cart-items-header">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Total</span>
            <span></span>
          </div>
          {cart.items.map((item, index) => (
            <div key={index} className="cart-item">
              <div className="product-info">
                <img src={item.image || '/placeholder.jpg'} alt={item.name} />
                <div className="product-details">
                  <h4>{item.name}</h4>
                  {item.size && <span className="variant">Size: {item.size}</span>}
                  {item.color && <span className="variant">Color: {item.color}</span>}
                </div>
              </div>
              <div className="product-price">KSH {item.price.toLocaleString()}</div>
              <div className="quantity-control">
                <button onClick={() => updateQuantityHandler(item.productId, item.quantity - 1, item.size, item.color)}>
                  <Minus size={14} />
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantityHandler(item.productId, item.quantity + 1, item.size, item.color)}>
                  <Plus size={14} />
                </button>
              </div>
              <div className="product-total">KSH {(item.price * item.quantity).toLocaleString()}</div>
              <button className="remove-btn" onClick={() => removeItem(item.productId, item.size, item.color)}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal ({cart.items.length} items)</span>
            <span>KSH {subtotal.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : `KSH ${shipping.toLocaleString()}`}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>KSH {total.toLocaleString()}</span>
          </div>
          {shipping === 0 ? (
            <div className="free-shipping-badge">
              <Truck size={16} /> You've qualified for free shipping!
            </div>
          ) : (
            <div className="free-shipping-progress">
              <Truck size={16} />
              <span>Add KSH {(5000 - subtotal).toLocaleString()} more for free shipping</span>
            </div>
          )}
          <button className="checkout-btn" onClick={() => navigate('/checkout')}>
            Proceed to Checkout <ChevronRight size={18} />
          </button>
          <button className="continue-btn" onClick={() => navigate('/marketplace')}>
            Continue Shopping
          </button>
          <div className="secure-checkout">
            <ShieldCheck size={16} />
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
