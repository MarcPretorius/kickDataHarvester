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

console.log('🔄 Connecting to database...');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function generateTestData() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Generating test data...');
    
    // Start a transaction
    await client.query('BEGIN');
    
    // Create test channel
    console.log('📺 Creating test channel...');
    const channelResult = await client.query(`
      INSERT INTO channels (name, status, message_count, last_active, is_tracking)
      VALUES ('test_channel', 'active', 0, NOW(), true)
      ON CONFLICT (name) DO UPDATE
      SET status = 'active', is_tracking = true
      RETURNING id, name
    `);
    
    const channel = channelResult.rows[0];
    console.log(`✅ Channel created: ${channel.name} (ID: ${channel.id})`);
    
    // Create test messages
    console.log('💬 Creating test messages...');
    const messageCount = 10;
    
    for (let i = 0; i < messageCount; i++) {
      const userTypes = ['regular', 'subscriber', 'moderator'];
      const randomUserType = userTypes[Math.floor(Math.random() * userTypes.length)];
      
      const isFlagged = Math.random() > 0.7; // 30% chance message is flagged
      const isHidden = Math.random() > 0.8; // 20% chance message is hidden
      
      await client.query(`
        INSERT INTO chat_messages (
          channel_id, user_id, username, user_type, message, timestamp, 
          is_hidden, is_flagged, moderation_reason, moderated_by, moderated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        )
      `, [
        channel.id,
        `test-user-${i + 1}`,
        `TestUser${i + 1}`,
        randomUserType,
        `This is test message #${i + 1} from ${randomUserType}`,
        new Date(Date.now() - Math.floor(Math.random() * 86400000)), // Random time in last 24h
        isHidden,
        isFlagged,
        isHidden || isFlagged ? 'Test moderation' : null,
        isHidden || isFlagged ? 'Test Admin' : null,
        isHidden || isFlagged ? new Date() : null
      ]);
    }
    
    console.log(`✅ Created ${messageCount} test messages`);
    
    // Create content filters
    console.log('🔍 Creating test content filters...');
    const filterTypes = ['block', 'flag', 'replace'];
    const testKeywords = ['badword', 'spam', 'offensive'];
    
    for (let i = 0; i < testKeywords.length; i++) {
      const filterType = filterTypes[i % filterTypes.length];
      
      await client.query(`
        INSERT INTO content_filters (
          keyword, type, replacement, is_active, created_at, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        testKeywords[i],
        filterType,
        filterType === 'replace' ? '***' : null,
        true,
        new Date(),
        'Test Admin'
      ]);
    }
    
    console.log(`✅ Created ${testKeywords.length} test content filters`);
    
    // Commit the transaction
    await client.query('COMMIT');
    
    console.log('🎉 Test data generation complete!');
  } catch (error) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    console.error('❌ Error generating test data:');
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

generateTestData();