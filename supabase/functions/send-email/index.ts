import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const emailStyles = `
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
  .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
  .header { background: linear-gradient(135deg, #00ae58 0%, #007a37 100%); padding: 30px 20px; text-align: center; }
  .logo { font-size: 28px; font-weight: bold; color: #ffffff; }
  .content { padding: 30px; }
  .welcome-box { background: linear-gradient(135deg, #e8f5e9, #c8e6d9); padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; }
  .btn { display: inline-block; background: linear-gradient(135deg, #00ae58 0%, #007a37 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 10px 0; }
  .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  .alert-box { background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0; }
  .info-row { padding: 10px 0; border-bottom: 1px solid #eee; }
  .item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
  .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: bold; text-transform: uppercase; font-size: 13px; }
  .status-pending { background: #fff3e0; color: #e65100; }
  .status-confirmed { background: #e3f2fd; color: #1565c0; }
  .status-shipped { background: #e8f5e9; color: #2e7d32; }
  .status-delivered { background: #e8f5e9; color: #1b5e20; }
  .status-cancelled { background: #ffebee; color: #c62828; }
`;

const buildWrapper = (innerHtml, title) => `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>${title}</title><style>${emailStyles}</style></head><body><div class="container"><div class="header"><div class="logo">Ndonyo</div></div><div class="content">${innerHtml}</div><div class="footer"><p>&copy; ${new Date().getFullYear()} Ndonyo. All rights reserved.</p><p>Online market day for Kenya</p></div></div></body></html>`;

const templates = {
  welcome: (p) => buildWrapper(`
    <h2>Welcome to Ndonyo! 🎉</h2>
    <p>Hello ${p.username || 'there'},</p>
    <p>Thank you for joining Ndonyo — your online market day. We're excited to have you shopping with us.</p>
    <div class="welcome-box">
      <strong>🎁 Get Started:</strong><br/>
      Browse thousands of products from trusted sellers across Kenya. Pay with M-Pesa, card, or cash on delivery.
    </div>
    <h3>✨ What you can do:</h3>
    <ul>
      <li>🛍️ <strong>Shop</strong> — Browse products from verified sellers</li>
      <li>📦 <strong>Track Orders</strong> — Real-time order tracking</li>
      <li>❤️ <strong>Wishlist</strong> — Save your favourite items</li>
      <li>🚚 <strong>Fast Delivery</strong> — Free shipping on orders over KSH 5,000</li>
    </ul>
    <a href="${p.dashboardLink || 'https://ndonyo.co.ke'}" class="btn">Start Shopping</a>
    <p>Happy shopping!<br/>The Ndonyo Team</p>
  `, 'Welcome to Ndonyo'),

  login_alert: (p) => buildWrapper(`
    <h2>Login Alert 🔐</h2>
    <p>Hello ${p.username || 'there'},</p>
    <p>We noticed a new login to your Ndonyo account. If this was you, no action is needed.</p>
    <div class="alert-box">
      <strong>📍 Location:</strong> ${p.location || 'Unknown'}<br/>
      <strong>💻 Device:</strong> ${p.device || 'Unknown'}<br/>
      <strong>🌐 Browser:</strong> ${p.browser || 'Unknown'}<br/>
      <strong>🕐 Time:</strong> ${p.time || new Date().toLocaleString()}
    </div>
    <p>If you did not make this login, please change your password immediately.</p>
    <a href="${p.resetPasswordLink || 'https://ndonyo.co.ke/login'}" class="btn">Reset Password</a>
    <p>Stay safe!<br/>The Ndonyo Team</p>
  `, 'Login Alert'),

  order_confirmation: (p) => {
    const itemsHtml = (p.items || []).map((item) => `
      <div class="item">
        <span>${item.name} ${item.size ? `(${item.size})` : ''} × ${item.quantity}</span>
        <span>KSH ${(item.price * item.quantity).toLocaleString()}</span>
      </div>
    `).join('');
    const sd = p.shippingDetails || {};
    return buildWrapper(`
      <h2>Order Confirmed! ✅</h2>
      <p>Hello ${p.username || 'there'},</p>
      <p>Thank you for your order! We've received it and are getting it ready.</p>
      <div class="welcome-box">
        <strong>Order ID:</strong> #${(p.orderId || '').slice(-8).toUpperCase()}<br/>
        <strong>Total:</strong> KSH ${Number(p.total || 0).toLocaleString()}<br/>
        <strong>Payment:</strong> ${p.paymentMethod || 'M-Pesa'}
      </div>
      <h3>📦 Order Items</h3>
      ${itemsHtml}
      <h3>📍 Shipping Address</h3>
      <div class="info-row"><strong>${sd.fullName || ''}</strong></div>
      <div class="info-row">${sd.address || ''}</div>
      <div class="info-row">${sd.city || ''}, Kenya</div>
      <div class="info-row">${sd.phone || ''}</div>
      <p>We'll send you another email once your order ships, along with a tracking number.</p>
      <a href="${p.dashboardLink || 'https://ndonyo.co.ke'}" class="btn">Track My Order</a>
      <p>Thank you for shopping with Ndonyo!<br/>The Ndonyo Team</p>
    `, 'Order Confirmed');
  },

  order_status: (p) => {
    const statusClass = `status-${(p.status || 'pending').toLowerCase()}`;
    return buildWrapper(`
      <h2>Order Update 📦</h2>
      <p>Hello ${p.username || 'there'},</p>
      <p>Your order status has been updated.</p>
      <div class="welcome-box">
        <strong>Order ID:</strong> #${(p.orderId || '').slice(-8).toUpperCase()}<br/>
        <strong>Status:</strong> <span class="status-badge ${statusClass}">${p.status || 'pending'}</span>
        ${p.trackingNumber ? `<br/><strong>Tracking Number:</strong> ${p.trackingNumber}` : ''}
      </div>
      <p>${p.status === 'shipped' ? 'Great news! Your order is on its way. Use the tracking number above to follow your delivery.' : ''}</p>
      <p>${p.status === 'delivered' ? 'Your order has been delivered. Thank you for shopping with Ndonyo! We hope you love your purchase.' : ''}</p>
      <a href="${p.dashboardLink || 'https://ndonyo.co.ke'}" class="btn">Track My Order</a>
      <p>The Ndonyo Team</p>
    `, 'Order Update');
  },

  new_feature: (p) => buildWrapper(`
    <h2>New on Ndonyo! ✨</h2>
    <p>Hello ${p.username || 'there'},</p>
    <p>${p.message || 'We just added something exciting to Ndonyo.'}</p>
    <a href="${p.dashboardLink || 'https://ndonyo.co.ke'}" class="btn">Check It Out</a>
    <p>The Ndonyo Team</p>
  `, 'New on Ndonyo'),
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { template, params, to_email } = await req.json();

    if (!template || !to_email) {
      return new Response(JSON.stringify({ error: "template and to_email are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = templates[template] ? templates[template](params || {}) : templates.welcome(params || {});
    const subject = {
      welcome: "Welcome to Ndonyo! 🎉",
      login_alert: "New Login to Your Ndonyo Account",
      order_confirmation: "Your Ndonyo Order is Confirmed! ✅",
      order_status: "Your Ndonyo Order Status Updated",
      new_feature: "New on Ndonyo! ✨",
    }[template] || "Ndonyo Notification";

    return new Response(JSON.stringify({ success: true, message: "Email queued", to: to_email, subject }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
