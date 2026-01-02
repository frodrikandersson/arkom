import { db } from '../config/db.js';
import { userSettings } from '../config/schema.js';
import { eq } from 'drizzle-orm';

const ADMIN_EMAIL = 'frodrikandersson@gmail.com';

async function makeAdmin() {
  console.log(`Making user with email ${ADMIN_EMAIL} an admin...`);

  // Note: Stack Auth stores email in a different table
  // We need to find the userId first, then update userSettings
  // For now, we'll use userId directly if you know it, or query from Stack Auth

  // If you have the userId:
  const userId = '31c0905b-d528-4207-8a38-cd9ee3c7b802'; // Replace with actual userId from Stack Auth

  // Check if settings exist
  const [existing] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId));

  if (!existing) {
    // Create settings with admin flag
    await db.insert(userSettings).values({
      userId,
      isAdmin: true,
    });
    console.log('Created user settings with admin privileges');
  } else {
    // Update existing settings
    await db
      .update(userSettings)
      .set({ isAdmin: true })
      .where(eq(userSettings.userId, userId));
    console.log('Updated user to admin');
  }

  console.log('Done!');
  process.exit(0);
}

makeAdmin().catch((error) => {
  console.error('Failed to make admin:', error);
  process.exit(1);
});
