import { SocialLink } from '../models';

/**
 * Constructs a full URL from a SocialLink object (domain + handle)
 * @param link - The social link object with domain and handle
 * @returns Full URL string or empty string if invalid
 */
export const constructSocialUrl = (link: SocialLink): string => {
  if (!link.domain || !link.handle) {
    return '';
  }
  
  // Ensure domain doesn't have protocol
  const cleanDomain = link.domain.replace(/^https?:\/\//, '');
  
  // Ensure handle doesn't have leading slash
  const cleanHandle = link.handle.replace(/^\//, '');
  
  return `https://${cleanDomain}/${cleanHandle}`;
};

/**
 * Get display name for known social media domains
 * @param domain - The domain name (e.g., "github.com")
 * @returns Display name for the platform
 */
export function getPlatformName(domain: string): string {
  const names: Record<string, string> = {
    'twitter.com': 'Twitter/X',
    'x.com': 'X',
    'github.com': 'GitHub',
    'linkedin.com': 'LinkedIn',
    'instagram.com': 'Instagram',
    'facebook.com': 'Facebook',
    'bsky.app/profile': 'Bluesky',
    'youtube.com': 'YouTube',
    'tiktok.com': 'TikTok',
    'reddit.com': 'Reddit',
    'discord.gg': 'Discord',
    'twitch.tv': 'Twitch',
  };
  return names[domain] || domain;
}
