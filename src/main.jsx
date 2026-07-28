import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PriceProvider } from './context/PriceContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import App from './App';
import './App.scss';
import { Toaster } from 'react-hot-toast';

// Performance monitoring (optional)
const reportWebVitals = (metric) => {
  console.log(metric);
  // Send to analytics if needed
};

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PriceProvider>
          <WishlistProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </WishlistProvider>
        </PriceProvider>
      </AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '8px', fontFamily: 'inherit' } }} />
    </BrowserRouter>
  </StrictMode>
);

// Report web vitals
reportWebVitals(console.log);