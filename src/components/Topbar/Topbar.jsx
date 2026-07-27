import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { Telegram, WhatsApp, LocalShipping, SupportAgent } from '@mui/icons-material';
import './Topbar.scss'

export default function Topbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`topbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="topbar-container">
        <div className="topbar-left">
          <LocalShipping className="live-icon" />
          <span className="live-text">Free shipping on orders over KSH 5,000</span>
        </div>
        
        <div className="topbar-social">
          <a href="https://t.me/powerkingtips" target="_blank" rel="noopener noreferrer" className="social-icon telegram" aria-label="Telegram">
            <Telegram />
          </a>
          <a href="https://whatsapp.com/channel/0029Vb3Louu9xVJktevbuZ2K" target="_blank" rel="noopener noreferrer" className="social-icon whatsapp" aria-label="WhatsApp">
            <WhatsApp />
          </a>
        </div>
        
        <div className="topbar-right">
          <SupportAgent className="tips-count" style={{ fontSize: 14, marginRight: 4 }} />
          <span className="tips-count">24/7 Support</span>
        </div>
      </div>
    </div>
  );
}