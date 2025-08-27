const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔄 Connecting to database...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');

    // Read and execute schema
    console.log('🔄 Setting up database schema...');
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('✅ Schema created successfully');

    // Read and execute seed data
    console.log('🔄 Inserting demo data...');
    const seedPath = path.join(__dirname, '../../database/seed.sql');
    const seedData = fs.readFileSync(seedPath, 'utf8');
    await pool.query(seedData);
    console.log('✅ Demo data inserted successfully');

    console.log('🎉 Database setup completed!');
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️ Database already exists, skipping setup');
    } else {
      console.error('❌ Database setup failed:', error.message);
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };