import { supabase } from '../config/supabase';

/**
 * Sends an email by invoking the send-email edge function.
 * @param {string} template - welcome | login_alert | order_confirmation | order_status | new_feature
 * @param {object} params - template parameters
 * @param {string} toEmail - recipient email
 */
export const sendEmail = async (template, params, toEmail) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { template, params, to_email: toEmail },
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Welcome email on registration
export const sendWelcomeEmail = (user) => {
  return sendEmail('welcome', {
    username: user.username || user.email?.split('@')[0],
    dashboardLink: `${window.location.origin}`,
  }, user.email);
};

// Login alert when a user signs in
export const sendLoginAlertEmail = (user, loginData = {}) => {
  return sendEmail('login_alert', {
    username: user.username || user.email?.split('@')[0],
    location: loginData.location || 'Kenya',
    device: loginData.device || navigator?.userAgent?.includes('Mobile') ? 'Mobile' : 'Desktop',
    browser: loginData.browser || navigator?.userAgent || 'Unknown',
    time: new Date().toLocaleString('en-GB', { timeZone: 'Africa/Nairobi' }),
    resetPasswordLink: `${window.location.origin}/login`,
  }, user.email);
};

// Order confirmation email
export const sendOrderConfirmationEmail = (orderData) => {
  return sendEmail('order_confirmation', {
    username: orderData.username,
    orderId: orderData.orderId,
    items: orderData.items,
    total: orderData.total,
    shippingDetails: orderData.shippingDetails,
    paymentMethod: orderData.paymentMethod,
    dashboardLink: `${window.location.origin}`,
  }, orderData.to_email);
};

// Order status update email (shipped, delivered, etc.)
export const sendOrderStatusEmail = (statusData) => {
  return sendEmail('order_status', {
    username: statusData.username,
    orderId: statusData.orderId,
    status: statusData.status,
    trackingNumber: statusData.trackingNumber,
    dashboardLink: `${window.location.origin}`,
  }, statusData.to_email);
};

// New feature announcement
export const sendNewFeatureEmail = (user, message) => {
  return sendEmail('new_feature', {
    username: user.username || user.email?.split('@')[0],
    message,
    dashboardLink: `${window.location.origin}`,
  }, user.email);
};
