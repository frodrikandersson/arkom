/**
 * Extract YouTube video ID from various YouTube URL formats
 * @param url - YouTube URL (youtube.com, youtu.be, etc.)
 * @returns Video ID or null if invalid
 */
export function extractYouTubeVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // youtu.be format
    if (urlObj.hostname.includes('youtu.be')) {
      return urlObj.pathname.slice(1);
    }
    
    // youtube.com format
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v');
    }
    
    return null;
  } catch (e) {
    console.error('Invalid YouTube URL:', e);
    return null;
  }
}

/**
 * Get YouTube thumbnail URL for a video
 * @param videoId - YouTube video ID
 * @param quality - Thumbnail quality ('maxres', 'hq', 'mq', 'sd')
 * @returns Thumbnail URL
 */
export function getYouTubeThumbnailUrl(
  videoId: string,
  quality: 'maxresdefault' | 'hqdefault' | 'mqdefault' | 'sddefault' = 'maxresdefault'
): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Get YouTube thumbnail URL from a YouTube URL
 * @param url - YouTube URL
 * @param quality - Thumbnail quality
 * @returns Thumbnail URL or null if invalid
 */
export function getYouTubeThumbnailFromUrl(
  url: string,
  quality: 'maxresdefault' | 'hqdefault' | 'mqdefault' | 'sddefault' = 'maxresdefault'
): string | null {
  const videoId = extractYouTubeVideoId(url);
  return videoId ? getYouTubeThumbnailUrl(videoId, quality) : null;
}
