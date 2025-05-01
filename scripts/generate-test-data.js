// Load environment variables from .env file
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '../shared/schema.ts';

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

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function generateTestData() {
  try {
    console.log('🧪 Generating test data...');
    
    // Create test channel
    console.log('📺 Creating test channel...');
    const [channel] = await db.insert(schema.channels)
      .values({
        name: 'test_channel',
        status: 'active',
        messageCount: 0,
        lastActive: new Date(),
        isTracking: true
      })
      .returning()
      .onConflictDoUpdate({
        target: [schema.channels.name],
        set: { status: 'active', isTracking: true }
      });
    
    console.log(`✅ Channel created: ${channel.name} (ID: ${channel.id})`);
    
    // Create test messages
    console.log('💬 Creating test messages...');
    const messageCount = 10;
    
    for (let i = 0; i < messageCount; i++) {
      const userTypes = ['regular', 'subscriber', 'moderator'];
      const randomUserType = userTypes[Math.floor(Math.random() * userTypes.length)];
      
      const isFlagged = Math.random() > 0.7; // 30% chance message is flagged
      const isHidden = Math.random() > 0.8; // 20% chance message is hidden
      
      await db.insert(schema.chatMessages)
        .values({
          channelId: channel.id,
          userId: `test-user-${i + 1}`,
          username: `TestUser${i + 1}`,
          userType: randomUserType,
          message: `This is test message #${i + 1} from ${randomUserType}`,
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 86400000)), // Random time in last 24h
          isHidden: isHidden,
          isFlagged: isFlagged,
          moderationReason: isHidden || isFlagged ? 'Test moderation' : null,
          moderatedBy: isHidden || isFlagged ? 'Test Admin' : null,
          moderatedAt: isHidden || isFlagged ? new Date() : null
        });
    }
    
    console.log(`✅ Created ${messageCount} test messages`);
    
    // Create content filters
    console.log('🔍 Creating test content filters...');
    const filterTypes = ['block', 'flag', 'replace'];
    const testKeywords = ['badword', 'spam', 'offensive'];
    
    for (let i = 0; i < testKeywords.length; i++) {
      const filterType = filterTypes[i % filterTypes.length];
      
      await db.insert(schema.contentFilters)
        .values({
          keyword: testKeywords[i],
          type: filterType,
          replacement: filterType === 'replace' ? '***' : null,
          isActive: true,
          createdAt: new Date(),
          createdBy: 'Test Admin'
        })
        .onConflictDoUpdate({
          target: [schema.contentFilters.keyword],
          set: { isActive: true }
        });
    }
    
    console.log(`✅ Created ${testKeywords.length} test content filters`);
    
    console.log('🎉 Test data generation complete!');
  } catch (error) {
    console.error('❌ Error generating test data:');
    console.error(error);
  } finally {
    await pool.end();
  }
}

generateTestData();