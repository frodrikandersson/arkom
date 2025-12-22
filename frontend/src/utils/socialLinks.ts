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
 * Get logo/icon emoji for known social media domains
 * @param domain - The domain name (e.g., "github.com")
 * @returns Emoji or icon representing the platform
 */
export function getLogo(domain: string): string {
  const logos: Record<string, string> = {
    'twitter.com': '𝕏',
    'x.com': '𝕏',
    'github.com': '⚡',
    'linkedin.com': 'in',
    'instagram.com': '📷',
    'facebook.com': 'f',
    'bluesky.app/profile': '🦋',
    'youtube.com': '▶',
    'tiktok.com': '♪',
    'reddit.com': '🤖',
    'discord.gg': '💬',
    'twitch.tv': '📺',
  };
  return logos[domain] || '🔗';
}
