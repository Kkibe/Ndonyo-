import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderService } from '../../services/marketplace.service';
import Loader from '../../components/Loader/Loader';
import { CheckCircle, LocalShipping, Home, Receipt } from '@mui/icons-material';
import './OrderConfirmation.scss';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      const data = await orderService.getOrder(orderId);
      setOrder(data);
      setLoading(false);
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return <Loader />;

  if (!order) {
    return (
      <div className="order-confirmation">
        <div className="confirmation-card">
          <h2>Order Not Found</h2>
          <p>We couldn't find this order. It may have been removed.</p>
          <Link to="/marketplace" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  const estimatedDelivery = () => {
    const days = order.shippingDetails?.city === 'Nairobi' ? 2 : 4;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <div className="order-confirmation">
      <div className="confirmation-card">
        <div className="success-icon">
          <CheckCircle />
        </div>
        <h1>Order Confirmed!</h1>
        <p className="order-id">Order ID: <strong>#{order.orderId?.slice(-8).toUpperCase()}</strong></p>
        <p className="success-message">
          Thank you for your order{order.shippingDetails?.fullName ? `, ${order.shippingDetails.fullName}` : ''}. 
          We've received it and will start preparing it right away.
        </p>

        <div className="delivery-estimate">
          <LocalShipping />
          <div>
            <span className="label">Estimated Delivery</span>
            <span className="date">{estimatedDelivery()}</span>
          </div>
        </div>

        <div className="order-summary-box">
          <h3><Receipt /> Order Summary</h3>
          <div className="summary-row">
            <span>Items</span>
            <span>{order.items?.length || 0} product(s)</span>
          </div>
          <div className="summary-row">
            <span>Payment Method</span>
            <span>
              {order.paymentMethod === 'mpesa' && 'M-Pesa'}
              {order.paymentMethod === 'card' && 'Card'}
              {order.paymentMethod === 'cod' && 'Cash on Delivery'}
            </span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{order.shippingDetails?.city}, Kenya</span>
          </div>
          <div className="summary-row total">
            <span>Total Paid</span>
            <span>KSH {order.total?.toLocaleString()}</span>
          </div>
        </div>

        <div className="whats-next">
          <h3>What happens next?</h3>
          <ol>
            <li>We'll send you a confirmation email and SMS with your order details.</li>
            <li>Our seller will prepare and pack your items within 24 hours.</li>
            <li>You'll receive a tracking number once your order ships.</li>
            <li>Track your delivery anytime from your profile.</li>
          </ol>
        </div>

        <div className="confirmation-actions">
          <Link to="/marketplace" className="btn-primary">
            <Home /> Continue Shopping
          </Link>
          <Link to={`/profile/${order.userId}`} className="btn-secondary">
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
