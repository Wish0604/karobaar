INSERT INTO users (id, phone, preferred_language)
VALUES
  ('00000000-0000-0000-0000-000000000001', '+919999999999', 'en'),
  ('00000000-0000-0000-0000-000000000002', '+918888888888', 'hi')
ON CONFLICT DO NOTHING;

INSERT INTO businesses (id, owner_id, legal_name, display_name, entity_type, operating_model, category, verification_stage)
VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Rajesh Grocery', 'Rajesh Kirana', 'individual', 'physical_storefront', 'grocery', 'business_checks_passed')
ON CONFLICT DO NOTHING;

INSERT INTO products (id, business_id, name, category, selling_price, mrp, is_reservation_enabled)
VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Basmati Rice 5kg', 'grocery', 480.00, 530.00, TRUE),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Sugar 1kg', 'grocery', 48.00, 52.00, TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO inventory (id, product_id, physical_stock, reserved_stock, pending_replenishment)
VALUES
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 30, 2, 0),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 80, 5, 0)
ON CONFLICT DO NOTHING;
