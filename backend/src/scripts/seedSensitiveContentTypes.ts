import { db } from '../config/db.js';
import { sensitiveContentTypes } from '../config/schema.js';

const seedData = [
  {
    type: 'gore',
    displayName: 'Gore',
    description: 'Content containing graphic violence, blood, or disturbing imagery',
  },
  {
    type: 'sexual_nudity_18+',
    displayName: 'Sexual/Nudity (18+)',
    description: 'Adult content including nudity or sexual themes',
  },
  {
    type: 'other',
    displayName: 'Other',
    description: 'Other potentially sensitive content',
  },
];

async function seedSensitiveContentTypes() {
  try {
    console.log('Seeding sensitive content types...');
    
    for (const item of seedData) {
      await db
        .insert(sensitiveContentTypes)
        .values(item)
        .onConflictDoNothing(); // Skip if already exists
    }
    
    console.log('✅ Sensitive content types seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding sensitive content types:', error);
    process.exit(1);
  }
}

seedSensitiveContentTypes();
