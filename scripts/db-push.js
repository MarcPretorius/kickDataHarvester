// Load environment variables from .env file
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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

console.log('🔄 Loading environment variables...');
console.log(`📊 Database URL detected: ${process.env.DATABASE_URL.split('@')[1] || '(encrypted)'}`);

try {
  console.log('🚀 Running database push operation...');
  execSync('npx drizzle-kit push', { 
    stdio: 'inherit',
    env: process.env
  });
  
  console.log('✅ Database schema pushed successfully!');
  
  // Create migrations directory if it doesn't exist
  const migrationsDir = path.join(rootDir, 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
    console.log('📁 Created migrations directory');
  }
  
} catch (error) {
  console.error('❌ Error pushing database schema:');
  console.error(error.message);
  process.exit(1);
}