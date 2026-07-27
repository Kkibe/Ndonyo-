import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService, orderService, wishlistService } from '../../services/marketplace.service';
import { useAuth } from '../../context/AuthContext';
import { usePagination } from '../../hooks/usePagination';
import Loader from '../../components/Loader/Loader';
import './UserProfile.scss';

export default function UserProfile() {
  const { email } = useParams();
  const navigate = useNavigate();
  const { currentUser, userData, isAdmin } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transLoading, setTransLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [lastElementRef] = usePagination(setPage, hasMore, transLoading);

  const isOwnProfile = !email || email === currentUser?.email;
  const canEdit = isOwnProfile || isAdmin;

  const fetchUser = useCallback(async () => {
    let targetEmail = email || currentUser?.email;
    if (!targetEmail) return;
    const user = await userService.getUserByEmail(targetEmail);
    setProfileUser(user);
  }, [email, currentUser]);

  const fetchOrders = useCallback(async () => {
    if (!profileUser?.id) return;
    setTransLoading(true);
    const result = await orderService.getUserOrders(profileUser.id, page, 10);
    if (page === 1) {
      setOrders(result.orders);
    } else {
      setOrders((prev) => [...prev, ...result.orders]);
    }
    setHasMore(result.hasMore);
    setTransLoading(false);
  }, [profileUser, page]);

  const fetchWishlist = useCallback(async () => {
    if (!profileUser?.id || !isOwnProfile) return;
    const items = await wishlistService.getWishlist(profileUser.id);
    setWishlist(items);
  }, [profileUser, isOwnProfile]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (profileUser) {
      fetchOrders();
      fetchWishlist();
      setLoading(false);
    }
  }, [profileUser, fetchOrders, fetchWishlist]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const statusColors = {
    pending: '#e65100',
    confirmed: '#1565c0',
    shipped: '#2e7d32',
    delivered: '#1b5e20',
    cancelled: '#c62828',
  };

  if (loading) return <Loader />;
  if (!profileUser) return <div className="error">User not found</div>;

  return (
    <div className="user-profile">
      <div className="user-header">
        <div className="uh-left">
          <div className="uh-image">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                profileUser.username || profileUser.email
              )}&background=00ae58&color=fff`}
              alt="Profile"
            />
            <div className="gradient"></div>
          </div>
          <div className="user-info">
            <h2 className="user-name">
              {profileUser.username || profileUser.email.split('@')[0]}
            </h2>
            <p className="user-email">{profileUser.email}</p>
            {profileUser.role === 'seller' && (
              <span className="seller-tag">Seller</span>
            )}
          </div>
        </div>

        <div className="user-links">
          <div className="user-stats">
            <div className="stat">
              <span className="stat-value">{orders.length}</span>
              <span className="stat-label">Orders</span>
            </div>
            {isOwnProfile && (
              <div className="stat">
                <span className="stat-value">{wishlist.length}</span>
                <span className="stat-label">Wishlist</span>
              </div>
            )}
          </div>

          <div className="user-actions">
            {canEdit && (
              <button className="btn edit-btn" onClick={() => navigate('/profile/edit', { state: profileUser })}>
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</button>
        <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Orders</button>
        {isOwnProfile && (
          <button className={`tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`} onClick={() => setActiveTab('wishlist')}>Wishlist</button>
        )}
        <button className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Settings</button>
      </div>

      {activeTab === 'profile' && (
        <div className="profile-content">
          <h2 className="section-title">Account Details</h2>
          <div className="profile-details">
            <div className="detail-row"><strong>Username:</strong> {profileUser.username || 'Not set'}</div>
            <div className="detail-row"><strong>Email:</strong> {profileUser.email}</div>
            {profileUser.phone && <div className="detail-row"><strong>Phone:</strong> {profileUser.phone}</div>}
            {profileUser.location && <div className="detail-row"><strong>Location:</strong> {profileUser.location}</div>}
            <div className="detail-row"><strong>Member since:</strong> {formatDate(profileUser.created_at)}</div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="orders-section">
          <h2 className="section-title">Order History</h2>
          {orders.length === 0 && !transLoading ? (
            <div className="no-transactions">
              <div className="empty-icon">📦</div>
              <h3>No Orders Yet</h3>
              <p>Your order history will appear here once you place an order.</p>
              <button className="btn" onClick={() => navigate('/marketplace')}>Start Shopping</button>
            </div>
          ) : (
            <div className="transactions-list">
              {orders.map((order) => (
                <details key={order.id} className="transaction-item">
                  <summary>
                    <div className="transaction-summary">
                      <span className="transaction-icon" style={{ backgroundColor: '#e8f5e9' }}>📦</span>
                      <div className="transaction-info">
                        <h3 className="transaction-name">Order #{order.id.slice(-8).toUpperCase()}</h3>
                        <small className="transaction-category">{formatDate(order.created_at)}</small>
                      </div>
                      <span className="transaction-amount">
                        KSH {Number(order.total).toLocaleString()}
                      </span>
                      <span className="status-pill" style={{ backgroundColor: statusColors[order.status] || '#666', color: 'white' }}>
                        {order.status}
                      </span>
                    </div>
                  </summary>
                  <div className="transaction-details">
                    <dl>
                      <div><dt>Items</dt><dd>{order.items?.length || 0} product(s)</dd></div>
                      <div><dt>Payment</dt><dd>{order.payment_method}</dd></div>
                      {order.tracking_number && <div><dt>Tracking</dt><dd>{order.tracking_number}</dd></div>}
                      <div><dt>Shipping to</dt><dd>{order.shipping_details?.city}, Kenya</dd></div>
                    </dl>
                  </div>
                </details>
              ))}
              {transLoading && <div className="loading-more"><Loader /></div>}
              {hasMore && !transLoading && <div ref={lastElementRef} className="load-more-trigger" />}
            </div>
          )}
        </div>
      )}

      {activeTab === 'wishlist' && isOwnProfile && (
        <div className="wishlist-section">
          <h2 className="section-title">My Wishlist</h2>
          {wishlist.length === 0 ? (
            <div className="no-transactions">
              <div className="empty-icon">❤️</div>
              <h3>Your wishlist is empty</h3>
              <p>Save products you love by tapping the heart icon.</p>
              <button className="btn" onClick={() => navigate('/marketplace')}>Browse Products</button>
            </div>
          ) : (
            <div className="wishlist-grid">
              {wishlist.map((product) => (
                <div key={product.id} className="wishlist-card" onClick={() => navigate(`/product/${product.id}`)}>
                  <img src={product.images?.[0] || '/placeholder.jpg'} alt={product.name} />
                  <h4>{product.name}</h4>
                  <span className="price">KSH {Number(product.price).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && isOwnProfile && (
        <div className="settings-section">
          <h2 className="section-title">Settings</h2>
          <div className="profile-details">
            <p>Manage your account preferences here.</p>
          </div>
        </div>
      )}

      <div className="explore">
        <button className="explore-btn" onClick={() => navigate('/marketplace')}>
          EXPLORE PRODUCTS
        </button>
      </div>
    </div>
  );
}
