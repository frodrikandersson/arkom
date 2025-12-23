import { db } from '../config/db.js';
import { sql } from 'drizzle-orm';

export async function migrateActiveConversations() {
  console.log('Creating active_conversations table...');
  
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS active_conversations (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      last_active TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, conversation_id)
    );
    
    CREATE INDEX IF NOT EXISTS active_conv_user_conv_idx ON active_conversations(user_id, conversation_id);
  `);
  
  console.log('active_conversations table created successfully!');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateActiveConversations()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
