CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE,
  preferred_language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id),
  legal_name VARCHAR(255),
  display_name VARCHAR(255) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  operating_model VARCHAR(50) NOT NULL,
  category VARCHAR(80) NOT NULL,
  verification_stage VARCHAR(50) NOT NULL DEFAULT 'profile_started',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS business_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  address_line1 VARCHAR(255),
  city VARCHAR(120),
  state VARCHAR(120),
  postal_code VARCHAR(20),
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7)
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(80),
  description TEXT,
  mrp NUMERIC(10, 2),
  selling_price NUMERIC(10, 2) NOT NULL,
  purchase_cost NUMERIC(10, 2),
  is_reservation_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  physical_stock INTEGER NOT NULL DEFAULT 0,
  reserved_stock INTEGER NOT NULL DEFAULT 0,
  pending_replenishment INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_physical_nonnegative CHECK (physical_stock >= 0),
  CONSTRAINT chk_reserved_nonnegative CHECK (reserved_stock >= 0),
  CONSTRAINT chk_pending_nonnegative CHECK (pending_replenishment >= 0)
);

CREATE TABLE IF NOT EXISTS inventory_holds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reservation_id UUID,
  quantity INTEGER NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_hold_qty_positive CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_user_id UUID REFERENCES users(id),
  business_id UUID NOT NULL REFERENCES businesses(id),
  status VARCHAR(40) NOT NULL DEFAULT 'requested',
  reservation_type VARCHAR(40) NOT NULL,
  scheduled_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reservation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  CONSTRAINT chk_res_item_qty_positive CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_user_id UUID REFERENCES users(id),
  business_id UUID NOT NULL REFERENCES businesses(id),
  reservation_id UUID REFERENCES reservations(id),
  order_status VARCHAR(40) NOT NULL DEFAULT 'created',
  total_amount NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  CONSTRAINT chk_order_qty_positive CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id),
  provider VARCHAR(50) NOT NULL,
  provider_reference VARCHAR(255),
  payment_status VARCHAR(40) NOT NULL DEFAULT 'pending',
  amount NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  insight_type VARCHAR(60) NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE VIEW inventory_available AS
SELECT
  i.product_id,
  i.physical_stock,
  i.reserved_stock,
  (i.physical_stock - i.reserved_stock) AS available_stock,
  i.pending_replenishment,
  i.updated_at
FROM inventory i;
