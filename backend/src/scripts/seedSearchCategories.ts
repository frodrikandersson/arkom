// backend/src/scripts/seedSearchCategories.ts
import { db } from '../config/db.js';
import { catalogues, categories, subCategoryFilters, subCategoryFilterOptions } from '../config/schema.js';

const catalogueData = [
  { name: 'Illustrations', sortOrder: 0 },
  { name: '2D Avatars', sortOrder: 1 },
  { name: '3D Models', sortOrder: 2 },
  { name: 'Emotes + Badges', sortOrder: 3 },
  { name: 'Stream Assets', sortOrder: 4 },
  { name: 'Branding + Graphics', sortOrder: 5 },
  { name: 'Animation + Videos', sortOrder: 6 },
  { name: 'Music + Audio', sortOrder: 7 },
  { name: 'Writing', sortOrder: 8 },
  { name: 'Physical Goods', sortOrder: 9 },
  { name: 'Advice', sortOrder: 10 },
  { name: 'Misc', sortOrder: 11 },
];

const categoryData: { [key: string]: string[] } = {
  'Illustrations': [
    'Character Illustrations', 'Chibi Illustrations', 'Creature Illustrations', 'Comics Creation', 
    'Other Illustrations', 'Backgrounds', 'Character Design', 'Creature Design', 'Outfit Design', 
    'Other Original Design', 'Character Reference Sheets', 'Creature Reference Sheets', 'Other Reference Sheets'
  ],
  '2D Avatars': [
    'VTuber Model Art', 'Chibi VTuber Model Art', 'Creature Model Art', 'Other 2D VTuber Model Art',
    'VTuber Model Rigging', 'Chibi VTuber Model Rigging', 'Creature Model Rigging', 'Other Vtuber Model Rigging',
    'VTuber Model Add-ons', '2D Tracking Upgrades', 'Other 2D VTuber Model Add-ons',
    'PNGtuber / GIFtuber Avatar', 'Chibi PNGtuber / GIFtuber Avatar', 'Creature PNGtuber / GIFtuber Avatar', 'Other Reactive Avatars'
  ],
  '3D Models': [
    'VRoid Model', 'Chibi VRoid Model', 'VRoid Model Asset', 'Other VRoid Models',
    '3D VTuber Models / VRChat Avatars', '3D VTuber / VRChat Assets', 'Other 3D Character Models',
    '3D Tracking Upgrades', 'Other 3D VTuber Model Add-ons', '3D Creatures Models', '3D Object Models',
    '3D Worlds / Environments', 'Other 3D Models'
  ],
  'Emotes + Badges': [
    'Emotes', 'Chat Stickers', 'Subscriber Badges'
  ],
  'Stream Assets': [
    'VTuber Stream Props', 'VTuber Throwables', 'Other VTuber Stream Assets', 'Twitch Panels',
    'Stream Overlays', 'Stream Alerts', 'Stinger Transitions', 'Stream Widgets',
    'Stream Avatar Sprites', 'Other Stream Assets', 'Stream Deck Icons'
  ],
  'Branding + Graphics': [
    'Patterns', 'Logo Design', 'Profile Setup', 'Other Branding', 'Video Thumbnail', 'Stream Schedule',
    'Social Media Banner', 'Slideshow Presentation', 'Other Templates', 'Other Graphic Design',
    'Tournament Graphics', 'Subathon / Donothon Graphics', 'VTuber Debut Graphics',
    'VTuber Model Reveal Graphics', 'Community Event Graphics', 'Other Event Graphics',
    'Product Packaging / Labels', 'Book Cover', 'Other Packaging Design'
  ],
  'Animation + Videos': [
    'Emote Animation (animation-only)', 'Illustration Animation (animation-only)', 'Logo Animation (animation-only)',
    'Other Image Animation (animation-only)', 'Original Anime / Cartoons / Animations', 'Original Animatics / Storyboards',
    'Other Animation Creation', 'Music Videos', 'Trailers + Teasers', 'Intro + Outro Videos',
    'VTuber Model Showcase', 'Other Video Creation', 'Socials Video Editing', 'VOD Editing',
    'Visual Effects', 'Other Video Editing'
  ],
  'Music + Audio': [
    'Timing', 'Vocal Tuning', 'Mixing + Mastering', 'Full Mix', 'Other Audio Engineering',
    'Original BGM (no vocal)', 'Original Music (vocal)', 'Cover Instrumental (no vocal)',
    'Jingles + Intros', 'Harmony Guides', 'Other Music Creation', 'Vocals', 'Voice Over',
    'Other Voice Work', 'Sound Alerts + Effects'
  ],
  'Writing': [
    'Lore Writing', 'Script Writing', 'Story Writing', 'Lyric Writing', 'Other Creative Writing',
    'Translation', 'Lyrics Translation', 'Other Writing'
  ],
  'Physical Goods': [
    'Cosplay + Fashion', 'Acrylic Charms', 'Stickers', 'Plushies', 'Figures', 'Mousepads',
    'Dakimakura', 'Posters + Prints', 'Other Small Batch Productions', 'Drawings', 'Paintings',
    'Sculptures', 'Photography', 'Crafts', 'Other Traditional Arts + Crafts'
  ],
  'Advice': [
    'Merchandise Advice', 'Marketing Advice', 'Streaming Advice', 'Digital Illustration Advice',
    '3D Modelling Advice', 'Graphic Design Advice', 'Frame-by-frame Animation Advice', 'Rigging Advice',
    '3d Animation Advice', 'Motion Graphics Advice', 'Video Editing Advice', 'Music Production Advice',
    'Audio Engineering Advice', 'Voice Work Advice', 'Traditional Arts Advice', 'Writing + Translation Advice',
    'Game Modification Advice', 'UI / UX Advice', 'Coding Advice', 'Career Advice', 'Personal Advice'
  ],
  'Misc': [
    'Minecraft Skins', 'Game Mods', 'Discord Bots', 'Other Coding', 'Other Bots',
    'Game UI', 'Website Design', 'Other UI / UX', 'Mouse Cursors'
  ]
};

const subCategoryFilterData = [
  { name: 'Subject', sortOrder: 0 },
  { name: 'Type', sortOrder: 1 },
];

const subCategoryFilterOptionsData: { [key: string]: string[] } = {
  'Subject': ['Human', 'Human-like', 'Anthro / Furry', 'Robot / Mecha', 'Other'],
  'Type': ['Head', 'Body', 'Full Body', 'Other'],
};

async function seed() {
  console.log('Seeding search categories...');

  // Insert catalogues
  const insertedCatalogues = await db.insert(catalogues).values(catalogueData).returning();
  console.log(`Inserted ${insertedCatalogues.length} catalogues`);

  // Insert categories
  for (const catalogue of insertedCatalogues) {
    const categoryList = categoryData[catalogue.name];
    if (categoryList) {
      const categoryValues = categoryList.map((name, index) => ({
        catalogueId: catalogue.id,
        name,
        sortOrder: index,
      }));
      await db.insert(categories).values(categoryValues);
      console.log(`Inserted ${categoryList.length} categories for ${catalogue.name}`);
    }
  }

  // Insert sub-category filters
  const insertedFilters = await db.insert(subCategoryFilters).values(subCategoryFilterData).returning();
  console.log(`Inserted ${insertedFilters.length} sub-category filters`);

  // Insert sub-category filter options
  for (const filter of insertedFilters) {
    const optionsList = subCategoryFilterOptionsData[filter.name];
    if (optionsList) {
      const optionValues = optionsList.map((name, index) => ({
        filterId: filter.id,
        name,
        sortOrder: index,
      }));
      await db.insert(subCategoryFilterOptions).values(optionValues);
      console.log(`Inserted ${optionsList.length} options for ${filter.name}`);
    }
  }

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
