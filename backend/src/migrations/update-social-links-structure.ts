import { db } from '../config/db.js';
import { userSettings } from '../config/schema.js';
import { sql } from 'drizzle-orm';

interface SocialLink {
  domain: string;
  handle: string;
}

type OldSocialLinks = Record<string, string>;
type NewSocialLinks = Record<string, SocialLink>;

interface UserRow extends Record<string, unknown> {
  id: number;
  user_id: string;
  social_links: OldSocialLinks | NewSocialLinks;
}

export async function migrateSocialLinks() {
  // Get all users with social links
  const result = await db.execute<UserRow>(sql`
    SELECT id, user_id, social_links 
    FROM user_settings 
    WHERE social_links IS NOT NULL
  `);

  if (!result.rows || result.rows.length === 0) {
    console.log('No users with social links found');
    return;
  }

  for (const user of result.rows) {
    const oldLinks = user.social_links;
    
    if (!oldLinks || typeof oldLinks !== 'object') {
      console.warn(`Invalid social_links for user ${user.user_id}`);
      continue;
    }

    const newLinks: NewSocialLinks = {};

    // Convert old format (URL strings) to new format (domain + handle objects)
    for (const [platform, value] of Object.entries(oldLinks)) {
      if (typeof value === 'string') {
        // Old format - URL string
        try {
          const urlObj = new URL(value.startsWith('http') ? value : `https://${value}`);
          newLinks[platform] = {
            domain: urlObj.hostname.replace('www.', ''),
            handle: urlObj.pathname.slice(1) || '',
          };
        } catch (error) {
          console.error(`Failed to parse URL for ${platform} (user ${user.user_id}):`, value);
          // Treat unparseable URL as raw handle
          newLinks[platform] = { domain: '', handle: value };
        }
      } else if (
        typeof value === 'object' &&
        value !== null &&
        'domain' in value &&
        'handle' in value &&
        typeof value.domain === 'string' &&
        typeof value.handle === 'string'
      ) {
        // Already in new format
        newLinks[platform] = {
          domain: value.domain,
          handle: value.handle,
        };
      } else {
        console.warn(`Unknown format for ${platform} (user ${user.user_id}):`, value);
      }
    }

    // Update the record
    await db.execute(sql`
      UPDATE user_settings 
      SET social_links = ${JSON.stringify(newLinks)}::jsonb 
      WHERE user_id = ${user.user_id}
    `);
  }

  console.log(`Migrated social links for ${result.rows.length} users`);
}
