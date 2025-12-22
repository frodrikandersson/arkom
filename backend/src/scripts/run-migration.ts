import { migrateSocialLinks } from '../migrations/update-social-links-structure.js';

async function runMigrations() {
  console.log('Starting social links migration...');
  
  try {
    await migrateSocialLinks();
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
