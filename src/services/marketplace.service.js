import { supabase } from '../config/supabase';
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from './email.service';

export const CATEGORIES = {
  FOOTWEAR: 'footwear',
  APPAREL: 'apparel',
  ACCESSORIES: 'accessories',
  EQUIPMENT: 'equipment',
  TRAINING: 'training',
  FAN_GEAR: 'fan_gear',
};

// USER SERVICE
export const userService = {
  async getUser(id) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  async getUserByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  },

  async updateUser(id, data) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: error.message };
    }
  },

  async getAllUsers(page = 1, pageSize = 20, searchTerm = '') {
    try {
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { users: data || [], hasMore: (data || []).length === pageSize, total: count || 0 };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { users: [], hasMore: false, total: 0 };
    }
  },
};

// PRODUCT SERVICE
export const productService = {
  async getProducts(page = 1, pageSize = 12, filters = {}) {
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters.inStock !== undefined) {
        query = query.eq('in_stock', filters.inStock);
      }

      if (filters.sortBy) {
        const ascending = filters.sortOrder === 'asc';
        const sortCol = filters.sortBy === 'createdAt' ? 'created_at' : filters.sortBy;
        query = query.order(sortCol, { ascending });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      query = query.range((page - 1) * pageSize, page * pageSize - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      return { products: data || [], hasMore: (data || []).length === pageSize, total: count || 0 };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { products: [], hasMore: false, total: 0 };
    }
  },

  async getProduct(productId) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  async getFeaturedProducts(limit = 8) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .eq('in_stock', true)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  },

  async searchProducts(searchTerm, pageSize = 20) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(pageSize);
      if (error) throw error;
      return { products: data || [], hasMore: false };
    } catch (error) {
      console.error('Error searching products:', error);
      return { products: [], hasMore: false };
    }
  },

  async getProductsByCategory(category, pageSize = 12) {
    return this.getProducts(1, pageSize, { category });
  },

  async addProduct(productData) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          sales_count: 0,
          rating: 0,
          reviews_count: 0,
        })
        .select()
        .single();
      if (error) throw error;
      return { success: true, id: data.id };
    } catch (error) {
      console.error('Error adding product:', error);
      return { success: false, error: error.message };
    }
  },

  async updateProduct(productId, productData) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ ...productData, updated_at: new Date().toISOString() })
        .eq('id', productId);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error updating product:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteProduct(productId) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { success: false, error: error.message };
    }
  },

  async updateStock(productId, quantityChange) {
    try {
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', productId)
        .maybeSingle();
      if (fetchError) throw fetchError;
      if (!product) return { success: false, error: 'Product not found' };

      const newStock = Math.max(0, product.stock + quantityChange);
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock, in_stock: newStock > 0 })
        .eq('id', productId);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error updating stock:', error);
      return { success: false, error: error.message };
    }
  },

  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },
};

// CART SERVICE
export const cartService = {
  async getCart(userId) {
    try {
      const { data, error } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        return { id: data.id, items: data.items || [], total: Number(data.total) || 0 };
      }
      return { items: [], total: 0 };
    } catch (error) {
      console.error('Error fetching cart:', error);
      return { items: [], total: 0 };
    }
  },

  async saveCart(userId, items, total) {
    try {
      const { data: existing } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('carts')
          .update({ items, total, updated_at: new Date().toISOString() })
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('carts')
          .insert({ user_id: userId, items, total });
        if (error) throw error;
      }
      return { success: true, cart: { items, total } };
    } catch (error) {
      console.error('Error saving cart:', error);
      return { success: false, error: error.message };
    }
  },

  async addToCart(userId, productId, quantity = 1, size = null, color = null) {
    try {
      const product = await productService.getProduct(productId);
      if (!product || (product.stock || 0) < quantity) {
        return { success: false, error: 'Product out of stock' };
      }

      const currentCart = await this.getCart(userId);
      const items = [...currentCart.items];
      const existingIndex = items.findIndex(
        (item) => item.productId === productId && item.size === size && item.color === color
      );

      if (existingIndex >= 0) {
        items[existingIndex].quantity += quantity;
      } else {
        items.push({
          productId,
          name: product.name,
          price: Number(product.price),
          quantity,
          size,
          color,
          image: product.images?.[0] || '',
        });
      }

      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return this.saveCart(userId, items, total);
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, error: error.message };
    }
  },

  async updateCartItem(userId, productId, quantity, size = null, color = null) {
    try {
      const currentCart = await this.getCart(userId);
      const items = currentCart.items.filter(
        (item) => !(item.productId === productId && item.size === size && item.color === color)
      );

      if (quantity > 0) {
        const product = await productService.getProduct(productId);
        if (!product || (product.stock || 0) < quantity) {
          return { success: false, error: 'Not enough stock' };
        }
        items.push({
          productId,
          name: product.name,
          price: Number(product.price),
          quantity,
          size,
          color,
          image: product.images?.[0] || '',
        });
      }

      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return this.saveCart(userId, items, total);
    } catch (error) {
      console.error('Error updating cart:', error);
      return { success: false, error: error.message };
    }
  },

  async removeFromCart(userId, productId, size = null, color = null) {
    return this.updateCartItem(userId, productId, 0, size, color);
  },

  async clearCart(userId) {
    return this.saveCart(userId, [], 0);
  },
};

// ORDER SERVICE
export const orderService = {
  async createOrder(userId, cart, shippingDetails, paymentMethod) {
    try {
      const subtotal = Number(cart.total) || 0;
      const shippingCost = subtotal >= 5000 ? 0 : 250;
      const total = subtotal + shippingCost;

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          items: cart.items,
          subtotal,
          shipping_cost: shippingCost,
          total,
          shipping_details: shippingDetails,
          payment_method: paymentMethod,
          status: 'pending',
        })
        .select()
        .single();
      if (error) throw error;

      // Create order_items rows
      const orderItems = cart.items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: item.image,
      }));
      await supabase.from('order_items').insert(orderItems);

      // Clear cart
      await cartService.clearCart(userId);

      // Decrement stock + increment sales_count
      for (const item of cart.items) {
        const { data: product } = await supabase
          .from('products')
          .select('stock, sales_count')
          .eq('id', item.productId)
          .maybeSingle();
        if (product) {
          await supabase
            .from('products')
            .update({
              stock: Math.max(0, product.stock - item.quantity),
              in_stock: product.stock - item.quantity > 0,
              sales_count: (product.sales_count || 0) + item.quantity,
            })
            .eq('id', item.productId);
        }
      }

      // Send order confirmation email
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, username')
          .eq('id', userId)
          .maybeSingle();
        if (profile) {
          await sendOrderConfirmationEmail({
            to_email: profile.email,
            username: profile.username,
            orderId: order.id,
            items: cart.items,
            total,
            shippingDetails,
            paymentMethod,
          });
        }
      } catch (emailErr) {
        console.error('Order confirmation email failed:', emailErr);
      }

      return { success: true, orderId: order.id };
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false, error: error.message };
    }
  },

  async getUserOrders(userId, page = 1, pageSize = 10) {
    try {
      const { data, error, count } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);
      if (error) throw error;
      return { orders: data || [], hasMore: (data || []).length === pageSize, total: count || 0 };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { orders: [], hasMore: false, total: 0 };
    }
  },

  async getOrder(orderId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  },

  async updateOrderStatus(orderId, status, trackingNumber = null) {
    try {
      const updateData = { status, updated_at: new Date().toISOString() };
      if (trackingNumber) updateData.tracking_number = trackingNumber;
      const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);
      if (error) throw error;

      // Send status update email
      try {
        const { data: order } = await supabase
          .from('orders')
          .select('user_id, total')
          .eq('id', orderId)
          .maybeSingle();
        if (order) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, username')
            .eq('id', order.user_id)
            .maybeSingle();
          if (profile) {
            await sendOrderStatusEmail({
              to_email: profile.email,
              username: profile.username,
              orderId,
              status,
              trackingNumber,
            });
          }
        }
      } catch (emailErr) {
        console.error('Order status email failed:', emailErr);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: error.message };
    }
  },

  async getAllOrders(page = 1, pageSize = 20, statusFilter = null) {
    try {
      let query = supabase
        .from('orders')
        .select('*, profiles!orders_user_id_fkey(email, username)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);
      if (statusFilter) query = query.eq('status', statusFilter);
      const { data, error, count } = await query;
      if (error) throw error;
      return { orders: data || [], hasMore: (data || []).length === pageSize, total: count || 0 };
    } catch (error) {
      console.error('Error fetching all orders:', error);
      return { orders: [], hasMore: false, total: 0 };
    }
  },
};

// WISHLIST SERVICE
export const wishlistService = {
  async getWishlist(userId) {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('product_id, products(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((row) => ({ productId: row.product_id, ...row.products }));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return [];
    }
  },

  async addToWishlist(userId, productId) {
    try {
      const { error } = await supabase
        .from('wishlists')
        .insert({ user_id: userId, product_id: productId });
      if (error && error.code !== '23505') throw error;
      return { success: true };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return { success: false, error: error.message };
    }
  },

  async removeFromWishlist(userId, productId) {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return { success: false, error: error.message };
    }
  },
};

// STORE SERVICE
export const storeService = {
  async getStores(page = 1, pageSize = 12) {
    try {
      const { data, error, count } = await supabase
        .from('stores')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);
      if (error) throw error;
      return { stores: data || [], hasMore: (data || []).length === pageSize, total: count || 0 };
    } catch (error) {
      console.error('Error fetching stores:', error);
      return { stores: [], hasMore: false, total: 0 };
    }
  },

  async getStore(storeId) {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .maybeSingle();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching store:', error);
      return null;
    }
  },

  async createStore(ownerId, storeData) {
    try {
      const { data, error } = await supabase
        .from('stores')
        .insert({ owner_id: ownerId, ...storeData })
        .select()
        .single();
      if (error) throw error;
      return { success: true, id: data.id };
    } catch (error) {
      console.error('Error creating store:', error);
      return { success: false, error: error.message };
    }
  },

  async getStoreByOwner(ownerId) {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', ownerId)
        .maybeSingle();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching store by owner:', error);
      return null;
    }
  },
};

// REVIEW SERVICE
export const reviewService = {
  async getProductReviews(productId) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles!reviews_user_id_fkey(username)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  },

  async addReview(userId, productId, rating, comment) {
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({ user_id: userId, product_id: productId, rating, comment });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error adding review:', error);
      return { success: false, error: error.message };
    }
  },
};
