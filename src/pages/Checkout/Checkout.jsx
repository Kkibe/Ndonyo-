import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { orderService } from '../../services/marketplace.service';
import Loader from '../../components/Loader/Loader';
import {
  ArrowLeft, CreditCard, Smartphone, LocalShipping, VerifiedUser,
  ChevronRight, CheckCircle, LocationOn, Person, Phone, Email,
} from '@mui/icons-material';
import './Checkout.scss';
import toast from 'react-hot-toast';

const KENYAN_CITIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika',
  'Nyeri', 'Machakos', 'Kericho', 'Kitale', 'Nanyuki', 'Other',
];

export default function Checkout() {
  const { currentUser } = useAuth();
  const { cart, clearCart, loading: cartLoading } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=shipping, 2=payment, 3=review
  const [shipping, setShipping] = useState({
    fullName: currentUser?.displayName || '',
    phone: '',
    email: currentUser?.email || '',
    address: '',
    city: 'Nairobi',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  if (cartLoading) return <Loader />;

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="checkout-empty">
        <div className="empty-icon">🛒</div>
        <h2>Your Cart is Empty</h2>
        <p>Add some products before checking out.</p>
        <button className="btn-primary" onClick={() => navigate('/marketplace')}>
          Continue Shopping
        </button>
      </div>
    );
  }

  const subtotal = cart.total || 0;
  const shippingCost = subtotal >= 5000 ? 0 : 250;
  const total = subtotal + shippingCost;

  const validateShipping = () => {
    const e = {};
    if (!shipping.fullName.trim()) e.fullName = 'Full name is required';
    if (!shipping.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^0?[17]\d{8}$/.test(shipping.phone.replace(/\s/g, '')))
      e.phone = 'Enter a valid Kenyan phone number (e.g. 0712345678)';
    if (!shipping.address.trim()) e.address = 'Delivery address is required';
    if (!shipping.city) e.city = 'Please select a city';
    if (paymentMethod === 'mpesa' && step >= 2) {
      if (!mpesaPhone.trim()) e.mpesaPhone = 'M-Pesa phone number is required';
      else if (!/^0?[17]\d{8}$/.test(mpesaPhone.replace(/\s/g, '')))
        e.mpesaPhone = 'Enter a valid M-Pesa phone number';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleShippingChange = (field, value) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleNext = () => {
    if (step === 1 && !validateShipping()) return;
    setStep((s) => Math.min(s + 1, 3));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    if (!validateShipping()) return;
    setProcessing(true);
    try {
      const result = await orderService.createOrder(
        currentUser.id,
        cart,
        { ...shipping, shippingCost },
        paymentMethod
      );
      if (result.success) {
        await clearCart();
        toast.success('Order placed successfully!');
        navigate(`/order-confirmation/${result.orderId}`);
      } else {
        toast.error('Failed to place order: ' + (result.error || 'Please try again.'));
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <button className="back-btn" onClick={() => navigate('/cart')}>
          <ArrowLeft size={20} /> Back to Cart
        </button>
        <h1>Checkout</h1>
        <div className="checkout-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-num">1</span>
            <span className="step-label">Shipping</span>
          </div>
          <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-num">2</span>
            <span className="step-label">Payment</span>
          </div>
          <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <span className="step-num">3</span>
            <span className="step-label">Review</span>
          </div>
        </div>
      </div>

      <div className="checkout-content">
        <div className="checkout-main">
          {/* Step 1: Shipping */}
          {step === 1 && (
            <div className="step-section shipping-section">
              <h2><LocationOn /> Shipping Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <div className="input-with-icon">
                    <Person />
                    <input
                      type="text"
                      value={shipping.fullName}
                      onChange={(e) => handleShippingChange('fullName', e.target.value)}
                      className={errors.fullName ? 'error' : ''}
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.fullName && <span className="error-msg">{errors.fullName}</span>}
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <div className="input-with-icon">
                    <Phone />
                    <input
                      type="tel"
                      value={shipping.phone}
                      onChange={(e) => handleShippingChange('phone', e.target.value)}
                      className={errors.phone ? 'error' : ''}
                      placeholder="0712345678"
                    />
                  </div>
                  {errors.phone && <span className="error-msg">{errors.phone}</span>}
                </div>

                <div className="form-group full">
                  <label>Delivery Address *</label>
                  <textarea
                    value={shipping.address}
                    onChange={(e) => handleShippingChange('address', e.target.value)}
                    className={errors.address ? 'error' : ''}
                    placeholder="House number, street, estate, landmark"
                    rows="3"
                  />
                  {errors.address && <span className="error-msg">{errors.address}</span>}
                </div>

                <div className="form-group">
                  <label>City / Town *</label>
                  <select
                    value={shipping.city}
                    onChange={(e) => handleShippingChange('city', e.target.value)}
                    className={errors.city ? 'error' : ''}
                  >
                    {KENYAN_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.city && <span className="error-msg">{errors.city}</span>}
                </div>

                <div className="form-group">
                  <label>Email (Optional)</label>
                  <div className="input-with-icon">
                    <Email />
                    <input
                      type="email"
                      value={shipping.email}
                      onChange={(e) => handleShippingChange('email', e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="form-group full">
                  <label>Delivery Notes (Optional)</label>
                  <textarea
                    value={shipping.notes}
                    onChange={(e) => handleShippingChange('notes', e.target.value)}
                    placeholder="Any special instructions for the courier"
                    rows="2"
                  />
                </div>
              </div>

              <div className="delivery-info">
                <LocalShipping size={18} />
                <span>Estimated delivery: {shipping.city === 'Nairobi' ? '1-2 business days' : '2-5 business days'}</span>
              </div>

              <button className="btn-continue" onClick={handleNext}>
                Continue to Payment <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="step-section payment-section">
              <h2><CreditCard /> Payment Method</h2>
              <div className="payment-methods">
                <label className={`payment-option ${paymentMethod === 'mpesa' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    value="mpesa"
                    checked={paymentMethod === 'mpesa'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-icon"><Smartphone /></div>
                  <div className="payment-info">
                    <strong>M-Pesa</strong>
                    <span>Pay via STK push to your phone</span>
                  </div>
                  <CheckCircle className="check-icon" />
                </label>

                <label className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-icon"><CreditCard /></div>
                  <div className="payment-info">
                    <strong>Credit / Debit Card</strong>
                    <span>Visa, Mastercard</span>
                  </div>
                  <CheckCircle className="check-icon" />
                </label>

                <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-icon"><LocalShipping /></div>
                  <div className="payment-info">
                    <strong>Cash on Delivery</strong>
                    <span>Pay when you receive your order</span>
                  </div>
                  <CheckCircle className="check-icon" />
                </label>
              </div>

              {paymentMethod === 'mpesa' && (
                <div className="mpesa-prompt">
                  <h4>M-Pesa Phone Number *</h4>
                  <p>Enter the phone number registered with M-Pesa. You'll receive a payment prompt on this phone.</p>
                  <div className="input-with-icon">
                    <Phone />
                    <input
                      type="tel"
                      value={mpesaPhone}
                      onChange={(e) => {
                        setMpesaPhone(e.target.value);
                        if (errors.mpesaPhone) setErrors((p) => ({ ...p, mpesaPhone: undefined }));
                      }}
                      className={errors.mpesaPhone ? 'error' : ''}
                      placeholder="0712345678"
                    />
                  </div>
                  {errors.mpesaPhone && <span className="error-msg">{errors.mpesaPhone}</span>}
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="cod-notice">
                  <LocalShipping size={18} />
                  <span>A small handling fee of KSH 50 applies for cash on delivery orders. Have exact change ready for the courier.</span>
                </div>
              )}

              <div className="step-actions">
                <button className="btn-back" onClick={handleBack}>Back</button>
                <button className="btn-continue" onClick={handleNext}>
                  Review Order <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="step-section review-section">
              <h2><CheckCircle /> Review Your Order</h2>

              <div className="review-block">
                <div className="review-block-header">
                  <h4>Shipping Address</h4>
                  <button className="edit-link" onClick={() => setStep(1)}>Edit</button>
                </div>
                <p><strong>{shipping.fullName}</strong></p>
                <p>{shipping.address}</p>
                <p>{shipping.city}, Kenya</p>
                <p>{shipping.phone}</p>
                {shipping.email && <p>{shipping.email}</p>}
                {shipping.notes && <p className="notes">Notes: {shipping.notes}</p>}
              </div>

              <div className="review-block">
                <div className="review-block-header">
                  <h4>Payment Method</h4>
                  <button className="edit-link" onClick={() => setStep(2)}>Edit</button>
                </div>
                <p>
                  {paymentMethod === 'mpesa' && 'M-Pesa' }
                  {paymentMethod === 'card' && 'Credit / Debit Card'}
                  {paymentMethod === 'cod' && 'Cash on Delivery'}
                  {paymentMethod === 'mpesa' && mpesaPhone && ` — ${mpesaPhone}`}
                </p>
              </div>

              <div className="review-block">
                <div className="review-block-header">
                  <h4>Order Items ({cart.items.length})</h4>
                </div>
                {cart.items.map((item, i) => (
                  <div className="review-item" key={i}>
                    <img src={item.image || '/placeholder.jpg'} alt={item.name} />
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-qty">Qty: {item.quantity}</span>
                      {item.size && <span className="item-variant">Size: {item.size}</span>}
                      {item.color && <span className="item-variant">Color: {item.color}</span>}
                    </div>
                    <span className="item-price">KSH {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="step-actions">
                <button className="btn-back" onClick={handleBack}>Back</button>
                <button className="btn-place-order" onClick={handlePlaceOrder} disabled={processing}>
                  {processing ? 'Placing Order...' : `Place Order • KSH ${total.toLocaleString()}`}
                </button>
              </div>

              <div className="secure-note">
                <VerifiedUser size={16} />
                <span>Your payment is encrypted and secure. By placing this order you agree to our terms of service.</span>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <aside className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-items">
            {cart.items.map((item, i) => (
              <div className="summary-item" key={i}>
                <img src={item.image || '/placeholder.jpg'} alt={item.name} />
                <div className="summary-item-info">
                  <span className="summary-item-name">{item.name}</span>
                  <span className="summary-item-qty">Qty {item.quantity}</span>
                </div>
                <span className="summary-item-price">KSH {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>KSH {subtotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shippingCost === 0 ? 'Free' : `KSH ${shippingCost.toLocaleString()}`}</span>
            </div>
            {shippingCost === 0 && (
              <div className="free-shipping-note">
                <LocalShipping style={{ fontSize: 14 }} /> You saved on shipping!
              </div>
            )}
            <div className="summary-row total">
              <span>Total</span>
              <span>KSH {total.toLocaleString()}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
