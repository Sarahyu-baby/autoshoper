# Supabase Migration Guide for AutoShopping Backend

This guide will help you migrate your Node.js backend from in-memory storage to Supabase (PostgreSQL).

## 📋 Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com) if you haven't already
2. **Node.js**: Version 16 or higher
3. **npm or yarn**: Package manager

## 🔧 Step 1: Set Up Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Name: `autoshopping-backend`
   - Database Password: Generate a strong password and save it
4. Wait for project creation (2-3 minutes)
5. Once created, go to Project Settings → API
6. Copy these values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon public key**
   - **service_role key** (for server-side operations)

## 📦 Step 2: Install Dependencies

```bash
npm install @supabase/supabase-js
npm install --save-dev @types/node typescript ts-node nodemon
```

## ⚙️ Step 3: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your Supabase credentials:
```env
SUPABASE_URL=your_project_url_here
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
PORT=3001
NODE_ENV=development
```

## 🗄️ Step 4: Create Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/20241122000000_create_products_table.sql`
4. Click "Run" to execute the SQL

This will create:
- `products` table with proper data types
- Indexes for performance
- RLS (Row Level Security) policies
- Updated_at trigger

## 🚀 Step 5: Update Your Express App

Replace your current product routes in your main app file:

```javascript
// In your main app.js or server.js
import supabaseProductRoutes from './api/routes/supabaseProducts.js';

// Replace your existing product routes with:
app.use('/api/products', supabaseProductRoutes);
```

## 📊 Step 6: Migrate Existing Data

Run the migration script to insert example products:

```bash
node scripts/migrateProducts.js
```

This script will:
- Test your Supabase connection
- Insert 5 example smartphone products
- Show you the results and any errors

## 🧪 Step 7: Test Your API

You can test your new Supabase-powered API with these endpoints:

### Get All Products
```bash
curl http://localhost:3001/api/products
```

### Get Products with Filters
```bash
curl "http://localhost:3001/api/products?brand=Apple&category=Smartphones&minPrice=500&maxPrice=1500"
```

### Search Products
```bash
curl "http://localhost:3001/api/products/search?query=iPhone&limit=10"
```

### Get Single Product
```bash
curl http://localhost:3001/api/products/your-product-uuid-here
```

### Create Product
```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "price": 999.00,
    "brand": "Apple",
    "category": "Smartphones",
    "imageUrl": "https://via.placeholder.com/300x300",
    "productUrl": "https://example.com/iphone-15-pro",
    "rating": 4.7,
    "reviewCount": 1250,
    "sourcePlatform": "Apple Store"
  }'
```

### Update Product
```bash
curl -X PUT http://localhost:3001/api/products/your-product-uuid-here \
  -H "Content-Type: application/json" \
  -d '{
    "price": 899.00,
    "rating": 4.8
  }'
```

### Delete Product
```bash
curl -X DELETE http://localhost:3001/api/products/your-product-uuid-here
```

## 🔄 Data Transformation

The service automatically handles the transformation between your frontend format and Supabase database format:

**Frontend Format:**
```javascript
{
  id: 'string',
  name: 'string',
  price: 999.99,
  brand: 'string',
  category: 'string',
  imageUrl: 'string',
  productUrl: 'string',
  rating: 4.5,
  reviewCount: 100,
  sourcePlatform: 'string',
  createdAt: Date,
  updatedAt: Date
}
```

**Database Format (automatically converted):**
```sql
{
  id: UUID,
  name: VARCHAR(255),
  price: DECIMAL(10,2),
  brand: VARCHAR(100),
  category: VARCHAR(100),
  image_url: TEXT,
  product_url: TEXT,
  rating: DECIMAL(3,2),
  review_count: INTEGER,
  source_platform: VARCHAR(50),
  created_at: TIMESTAMP WITH TIME ZONE,
  updated_at: TIMESTAMP WITH TIME ZONE
}
```

## 🔒 Security Features

1. **RLS Policies**: Row Level Security is enabled with appropriate policies
2. **Input Validation**: All inputs are validated before database operations
3. **Error Handling**: Comprehensive error handling with proper HTTP status codes
4. **UUID Validation**: All UUIDs are validated before use
5. **SQL Injection Protection**: Supabase client uses parameterized queries

## 🐛 Troubleshooting

### Connection Issues
- Check your `.env` file has correct Supabase credentials
- Verify your Supabase project is active
- Check network connectivity to Supabase

### Permission Errors
- Ensure RLS policies are created correctly
- Check that your anon key has proper permissions
- Verify database user permissions

### Data Type Errors
- Check that your data matches the expected types
- Ensure required fields are provided
- Verify price and rating ranges

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html)

## 🎯 Next Steps

1. **Add Authentication**: Implement user authentication with Supabase Auth
2. **Add Comments Table**: Create a comments/reviews table linked to products
3. **Add Search Index**: Create full-text search indexes for better search performance
4. **Add Caching**: Implement Redis caching for frequently accessed data
5. **Add Analytics**: Track product views and user interactions

## 📞 Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify your Supabase dashboard for database errors
3. Test your connection with the migration script first
4. Check that all SQL migrations ran successfully