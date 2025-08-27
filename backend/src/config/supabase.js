const { Pool } = require('pg');
require('dotenv').config();

// Supabase connection configuration
const supabaseConfig = {
  // Supabase connection string format: postgres://[user]:[password]@[host]:[port]/[database]
  connectionString: process.env.SUPABASE_DB_URL || process.env.DATABASE_URL,
  
  // OR individual parameters for Supabase
  user: process.env.SUPABASE_DB_USER || 'postgres',
  host: process.env.SUPABASE_DB_HOST || 'dsstubyylfpsejjgyheo.supabase.co',
  database: process.env.SUPABASE_DB_NAME || 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD,
  port: process.env.SUPABASE_DB_PORT || 5432,
  
  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  
  // SSL required for Supabase
  ssl: {
    rejectUnauthorized: false
  }
};

// Create connection pool
const pool = new Pool(supabaseConfig);

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client:', err);
  process.exit(-1);
});

// Database connection test
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Supabase connected successfully');
    
    // Test basic query
    const result = await client.query('SELECT NOW()');
    console.log('📅 Database time:', result.rows[0].now);
    
    // Test our tables exist
    const tableCheck = await client.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'hcm_%'
    `);
    console.log(`📊 Found ${tableCheck.rows[0].table_count} HCM tables`);
    
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Supabase connection failed:', err.message);
    return false;
  }
};

// Query helper function with table prefix awareness
const query = async (text, params) => {
  const start = Date.now();
  try {
    // Auto-replace table names without hcm_ prefix in queries
    let modifiedText = text;
    const tableNames = [
      'user_profiles', 'households', 'household_members', 'task_categories',
      'task_templates', 'tasks', 'task_photos', 'recipes', 'meal_plans',
      'shopping_lists', 'shopping_list_items', 'budget_categories', 'budgets',
      'expenses', 'reports', 'report_photos', 'notifications', 'member_points',
      'audit_logs'
    ];
    
    // Replace table names with hcm_ prefix
    tableNames.forEach(tableName => {
      const regex = new RegExp(`\\b${tableName}\\b(?!_)`, 'gi');
      modifiedText = modifiedText.replace(regex, `hcm_${tableName}`);
    });
    
    const res = await pool.query(modifiedText, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Query executed in ${duration}ms`);
    }
    
    return res;
  } catch (err) {
    console.error('❌ Supabase query error:', err.message);
    console.error('Query:', text.substring(0, 100) + '...');
    throw err;
  }
};

// Transaction helper function
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Graceful shutdown
const closePool = async () => {
  try {
    await pool.end();
    console.log('📦 Supabase pool closed');
  } catch (err) {
    console.error('❌ Error closing Supabase pool:', err);
  }
};

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
  closePool
};