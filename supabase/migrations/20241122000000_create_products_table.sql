-- Create products table with proper types and constraints
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  brand VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image_url TEXT NOT NULL,
  product_url TEXT NOT NULL,
  rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
  source_platform VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for common query patterns
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(rating);
CREATE INDEX idx_products_created_at ON products(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your auth requirements)
-- Allow anyone to read products
CREATE POLICY "Allow public read access" ON products
  FOR SELECT USING (true);

-- Allow authenticated users to insert products
CREATE POLICY "Allow authenticated insert" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own products (if you add user_id column)
CREATE POLICY "Allow users to update own products" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow users to delete their own products (if you add user_id column)
CREATE POLICY "Allow users to delete own products" ON products
  FOR DELETE USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT SELECT ON products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON products TO authenticated;