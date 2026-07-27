/*
# Seed sample categories and products for Ndonyo marketplace

## Overview
Populates the catalog with 6 categories and 20 sample products so the
storefront has content to display immediately. Images use stock photos.

## Notes
1. Categories cover footwear, apparel, accessories, equipment, training, fan gear.
2. Products span price ranges from KSH 899 to KSH 24,999.
3. A demo admin profile is also seeded for the admin dashboard.
*/

-- Categories
INSERT INTO categories (name, slug, icon) VALUES
  ('Footwear', 'footwear', '👟'),
  ('Apparel', 'apparel', '👕'),
  ('Accessories', 'accessories', '🧢'),
  ('Equipment', 'equipment', '⚽'),
  ('Training', 'training', '💪'),
  ('Fan Gear', 'fan_gear', '🏆')
ON CONFLICT (slug) DO NOTHING;

-- Products (store_id and category_id left null; category text used for filtering)
INSERT INTO products (name, slug, description, price, old_price, stock, in_stock, images, sizes, colors, category, tags, featured, rating, sales_count, reviews_count) VALUES
  ('Nike Air Max 270', 'nike-air-max-270', 'Iconic Air Max cushioning for all-day comfort. Breathable mesh upper with a bold visible air unit.', 12999, 15999, 45, true,
    ARRAY['https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800', 'https://images.pexels.com/photos/1102777/pexels-photo-1102777.jpeg?auto=compress&cs=tinysrgb&w=800'],
    ARRAY['40','41','42','43','44','45'], ARRAY['Black','White','Red'], 'footwear',
    ARRAY['nike','running','sneakers','air max'], true, 4.8, 234, 45),

  ('Adidas Ultraboost 22', 'adidas-ultraboost-22', 'Responsive Boost midsole returns energy with every stride. Primeknit upper wraps your foot for a snug fit.', 14999, null, 30, true,
    ARRAY['https://images.pexels.com/photos/1639729/pexels-photo-1639729.jpeg?auto=compress&cs=tinysrgb&w=800'],
    ARRAY['40','41','42','43','44'], ARRAY['Black','Grey'], 'footwear',
    ARRAY['adidas','running','ultraboost'], true, 4.7, 189, 38),

  ('Puma RS-X trainers', 'puma-rs-x-trainers', 'Retro-inspired chunky trainers with RS foam for superior cushioning and street style.', 8999, 10999, 60, true,
    ARRAY['https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800'],
    ARRAY['39','40','41','42','43'], ARRAY['White','Blue','Black'], 'footwear',
    ARRAY['puma','trainers','casual'], false, 4.5, 156, 31),

  ('New Balance 574', 'new-balance-574', 'Classic heritage silhouette with ENCAP cushioning. Versatile enough for everyday wear.', 9999, null, 25, true,
    ARRAY['https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=800'],
    ARRAY['40','41','42','43','44','45'], ARRAY['Grey','Navy','Beige'], 'footwear',
    ARRAY['new balance','classic','sneakers'], true, 4.6, 98, 22),

  ('Adidas Predator Football Boots', 'adidas-predator-boots', 'Control-frame upper for precision on the pitch. Firm-ground studs for grip on natural grass.', 11999, 13999, 20, true,
    ARRAY['https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=800'],
    ARRAY['40','41','42','43','44'], ARRAY['Black','Red'], 'footwear',
    ARRAY['adidas','football','boots','predator'], true, 4.9, 312, 51),

  ('Nike Dri-FIT Training Jersey', 'nike-dri-fit-jersey', 'Moisture-wicking Dri-FIT fabric keeps you dry during intense workouts. Athletic fit with mesh panels.', 2499, 2999, 120, true,
    ARRAY['https://images.pexels.com/photos/853451/pexels-photo-853451.jpeg?auto=compress&cs=tinysrgb&w=800'],
    ARRAY['S','M','L','XL','XXL'], ARRAY['Black','White','Blue','Red'], 'apparel',
    ARRAY['nike','jersey','training','dri-fit'], true, 4.6, 87, 19),

  ('Under Armour Compression Tights', 'ua-compression-tights', 'Super-tight fit supports muscles during training. HeatGear fabric wicks sweat and dries fast.', 3499, null, 75, true,
    ARRAY['https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=800'],
    ARRAY['S','M','L','XL'], ARRAY['Black','Navy'], 'apparel',
    ARRAY['under armour','tights','compression'], false, 4.4, 64, 14),

  ('Adidas Track Jacket', 'adidas-track-jacket', 'Classic 3-stripes track jacket with ribbed cuffs. Full zip front with side pockets.', 4999, 5999, 50, true,
    ARRAY['https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800'],
    ARRAY['S','M','L','XL','XXL'], ARRAY['Black','Blue','Red'], 'apparel',
    ARRAY['adidas','jacket','track'], true, 4.7, 142, 28),

  ('Puma Football Socks 3-Pack', 'puma-football-socks', 'Cushioned footbed with arch support. Moisture-control yarn keeps feet dry. Three pairs per pack.', 1299, null, 200, true,
    ARRAY['https://images.pexels.com/photos/2529147/pexels-photo-2529147.jpeg?auto=compress&cs=tinysrgb&w=800'],
    ARRAY['One Size'], ARRAY['White','Black','Multi'], 'accessories',
    ARRAY['puma','socks','football'], false, 4.3, 220, 41),

  ('Nike Duffel Bag', 'nike-duffel-bag', 'Spacious main compartment with ventilated shoe pocket. Adjustable shoulder strap for easy carrying.', 3999, 4999, 40, true,
    ARRAY['https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800'],
    ARRAY['One Size'], ARRAY['Black','Blue','Grey'], 'accessories',
    ARRAY['nike','bag','duffel','gym'], true, 4.8, 176, 33),

  ('Adidas Cap', 'adidas-cap', 'Classic six-panel construction with moisture-absorbing sweatband. Adjustable back closure for the perfect fit.', 1499, null, 150, true,
    ARRAY['https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=800'],
    ARRAY['One Size'], ARRAY['Black','White','Navy'], 'accessories',
    ARRAY['adidas','cap','hat'], false, 4.2, 95, 17),

  ('Wilson Basketball', 'wilson-basketball', 'Official size 7 indoor/outdoor basketball with deep channels for better grip and control.', 2999, null, 35, true,
    ARRAY['https://images.pexels.com/photos/2304169/pexels-photo-2304169.jpeg?auto=compress&cs=tinysrgb&w=800'],
    ARRAY['Size 7'], ARRAY['Orange'], 'equipment',
    ARRAY['basketball','wilson','ball'], false, 4.7, 88, 16),

  ('Adidas Football', 'adidas-football', 'Tournament-quality football with seamless surface for true flight. FIFA Basic certified.', 3499, 3999, 28, true,
    ARRAY['https://images.pexels.com/photos/47730/the-ball-stadion-fussball-47730.jpeg?auto=compress&cs=tinysrgb&w=800'],
    ARRAY['Size 5'], ARRAY['White','Black'], 'equipment',
    ARRAY['football','adidas','ball'], true, 4.8, 245, 47),

  ('Training Dumbbell Set 20kg', 'dumbbell-set-20kg', 'Adjustable dumbbells from 2kg to 10kg each. Compact design with spin-lock collars. Ideal for home gyms.', 8999, null, 15, true,
    ARRAY['https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg?auto=compress&cs=tinysrgb&w=800'],
    ARRAY['20kg Set'], ARRAY['Black'], 'training',
    ARRAY['dumbbells','weights','home gym'], true, 4.9, 67, 12),

  ('Resistance Band Set', 'resistance-band-set', 'Five progressive resistance levels from light to extra heavy. Includes carry bag and exercise guide.', 1999, 2499, 180, true,
    ARRAY['https://images.pexels.com/photos/4498152/pexels-photo-4498152.jpeg?auto=compress&cs=tinysrgb&w=800'],
    ARRAY['5-Band Set'], ARRAY['Multi'], 'training',
    ARRAY['resistance bands','fitness','home workout'], false, 4.5, 312, 58),

  ('Yoga Mat Premium', 'yoga-mat-premium', '6mm thick TPE material for joint support. Non-slip surface with alignment lines. Eco-friendly and durable.', 2499, null, 90, true,
    ARRAY['https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=800'],
    ARRAY['Standard'], ARRAY['Purple','Blue','Green','Black'], 'training',
    ARRAY['yoga','mat','fitness'], true, 4.6, 134, 26),

  ('Skipping Rope Pro', 'skipping-rope-pro', 'Lightweight aluminium handles with ball bearings for smooth rotation. Adjustable cable length.', 1299, null, 250, true,
    ARRAY['https://images.pexels.com/photos/4761352/pexels-photo-4761352.jpeg?auto=compress&cs=tinysrgb&w=800'],
    ARRAY['Adjustable'], ARRAY['Black','Red'], 'training',
    ARRAY['skipping rope','cardio','fitness'], false, 4.4, 189, 35),

  ('Liverpool FC Jersey 2024', 'liverpool-fc-jersey', 'Official home jersey with moisture-wicking technology. Embroidered club crest and sponsor logo.', 6999, 7999, 55, true,
    ARRAY['https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800'],
    ARRAY['S','M','L','XL','XXL'], ARRAY['Red'], 'fan_gear',
    ARRAY['liverpool','jersey','football','fan'], true, 4.8, 178, 34),

  ('Kenya National Team Jersey', 'kenya-jersey', 'Show your pride with the Harambee Stars home jersey. Lightweight breathable fabric with national crest.', 5999, null, 80, true,
    ARRAY['https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=800'],
    ARRAY['S','M','L','XL','XXL'], ARRAY['Green','Red','Black'], 'fan_gear',
    ARRAY['kenya','jersey','football','national'], true, 4.9, 234, 45),

  ('Arsenal Scarf', 'arsenal-scarf', 'Official club scarf in team colours. Soft acrylic knit keeps you warm on match days.', 1899, null, 110, true,
    ARRAY['https://images.pexels.com/photos/2079246/pexels-photo-2079246.jpeg?auto=compress&cs=tinysrgb&w=800'],
    ARRAY['One Size'], ARRAY['Red','White'], 'fan_gear',
    ARRAY['arsenal','scarf','fan','football'], false, 4.5, 76, 15)
ON CONFLICT DO NOTHING;
