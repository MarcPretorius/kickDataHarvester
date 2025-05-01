// Load environment variables from .env file
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
const { Pool } = pg;

// Get the directory name using ESM syntax
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load .env file
dotenv.config({ path: path.join(rootDir, '.env') });

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set.');
  console.error('Please make sure you have a .env file with DATABASE_URL defined.');
  process.exit(1);
}

console.log('🔄 Checking database connection...');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as time');
    console.log('✅ Successfully connected to database!');
    console.log(`⏰ Current database time: ${result.rows[0].time}`);
    
    // List tables in the database
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('📝 No tables found in the database. You may need to run the migration script.');
    } else {
      console.log('\n📊 Tables in the database:');
      tablesResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name}`);
      });
    }
    
    client.release();
  } catch (error) {
    console.error('❌ Failed to connect to the database:');
    console.error(error.message);
    process.exit(1);
  } finally {
    pool.end();
  }
}

checkConnection();