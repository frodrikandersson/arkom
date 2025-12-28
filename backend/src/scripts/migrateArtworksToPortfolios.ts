// import { db } from '../config/db.js';
// import { sql } from 'drizzle-orm';
// import { artworks, portfolios, portfolioMedia } from '../config/schema.js';

// async function migrateArtworksToPortfolios() {
//   try {
//     console.log('Starting artwork migration...');
    
//     // Get all artworks
//     const allArtworks = await db.select().from(artworks);
//     console.log(`Found ${allArtworks.length} artworks to migrate`);
    
//     let successCount = 0;
//     let errorCount = 0;
    
//     for (const artwork of allArtworks) {
//       try {
//         // Create portfolio from artwork
//         const [portfolio] = await db.insert(portfolios).values({
//           userId: artwork.userId,
//           title: artwork.title,
//           description: artwork.description,
//           tags: artwork.tags,
//           status: artwork.isPublic ? 'published' : 'draft',
//           linkedToCommission: false,
//           hasSensitiveContent: false,
//           viewCount: artwork.viewCount,
//           likeCount: artwork.likeCount,
//           publishedAt: artwork.isPublic ? artwork.createdAt : null,
//           createdAt: artwork.createdAt,
//           updatedAt: artwork.updatedAt,
//         }).returning();

//         // Create media entry for the artwork file
//         await db.insert(portfolioMedia).values({
//           portfolioId: portfolio.id,
//           mediaType: 'image',
//           fileUrl: artwork.fileUrl,
//           thumbnailUrl: artwork.thumbnailUrl || null,
//           mimeType: 'image/jpeg', // Default assumption
//           sortOrder: 0,
//         });

//         successCount++;
//         console.log(`✅ Migrated artwork ${artwork.id} → portfolio ${portfolio.id}`);
//       } catch (error) {
//         errorCount++;
//         console.error(`❌ Failed to migrate artwork ${artwork.id}:`, error);
//       }
//     }
    
//     console.log('\n=== Migration Complete ===');
//     console.log(`✅ Successfully migrated: ${successCount}`);
//     console.log(`❌ Failed: ${errorCount}`);
//     console.log(`📊 Total: ${allArtworks.length}`);
    
//     // Drop old tables with CASCADE to handle dependencies
//     console.log('\n=== Dropping old tables ===');
//     console.log('⚠️  This will drop: provenance_appeals, provenance_analysis, artworks');

//     try {
//       await db.execute(sql`DROP TABLE IF EXISTS provenance_appeals CASCADE`);
//       console.log('✅ Dropped provenance_appeals');

//       await db.execute(sql`DROP TABLE IF EXISTS provenance_analysis CASCADE`);
//       console.log('✅ Dropped provenance_analysis');

//       await db.execute(sql`DROP TABLE IF EXISTS artworks CASCADE`);
//       console.log('✅ Dropped artworks');

//       console.log('\n✅ Clean migration complete - old tables removed');
//     } catch (error) {
//       console.error('❌ Failed to drop old tables:', error);
//       console.log('⚠️  Migration data preserved, but old tables still exist');
//     }


//     process.exit(0);
//   } catch (error) {
//     console.error('❌ Migration failed:', error);
//     process.exit(1);
//   }
// }

// migrateArtworksToPortfolios();
