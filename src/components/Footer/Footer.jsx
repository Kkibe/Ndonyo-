import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowUpward, Telegram, WhatsApp } from '@mui/icons-material';
import './Footer.scss';

export default function Footer() {
  const { isAdmin, currentUser } = useAuth();

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="footer">
      <div className="social">
        <h2>Follow us</h2>
        <div className="wrapper">
          <a href="https://t.me/powerkingtips" target="_blank" rel="noopener noreferrer" className="telegram" aria-label="Telegram">
            <Telegram />
          </a>
          <a href="https://whatsapp.com/channel/0029Vb3Louu9xVJktevbuZ2K" target="_blank" rel="noopener noreferrer" className="whatsapp" aria-label="WhatsApp">
            <WhatsApp />
          </a>
        </div>
      </div>

      <hr />

      <div className="footer-bottom">
        <p>&copy; Ndonyo {new Date().getFullYear()}</p>

        <NavLink to="/marketplace" className="footer-link">
          Shop
        </NavLink>

        <NavLink to="/about#faq" className="footer-link">
          FAQ
        </NavLink>

        {!currentUser && (
          <>
            <NavLink to="/login" className="footer-link">
              Login
            </NavLink>
            <NavLink to="/register" className="footer-link">
              Register
            </NavLink>
          </>
        )}

        {currentUser && (
          <NavLink to={`/profile/${currentUser.email}`} className="footer-link">
            My Profile
          </NavLink>
        )}

        {currentUser && (
          <NavLink to="/cart" className="footer-link">
            My Cart
          </NavLink>
        )}

        {isAdmin && (
          <>
            <NavLink to="/users" className="footer-link">
              Users
            </NavLink>
            <NavLink to="/admin/dashboard" className="footer-link">
              Admin Panel
            </NavLink>
          </>
        )}

        <button className="btn-top" onClick={handleScrollToTop} aria-label="Back to top">
          <ArrowUpward />
        </button>
      </div>
    </div>
  );
}
