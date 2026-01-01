import { useState } from 'react';
import { extractYouTubeVideoId, getYouTubeThumbnailUrl } from '../../utils/youtubeHelpers';

interface YouTubeThumbnailProps {
  url: string;
  alt?: string;
  className?: string;
  showPlayIcon?: boolean;
  playIconClassName?: string;
  onPlay?: () => void;
}

export const YouTubeThumbnail = ({ 
  url, 
  alt = 'YouTube video', 
  className, 
  showPlayIcon = false,
  playIconClassName,
  onPlay 
}: YouTubeThumbnailProps) => {
  const [quality, setQuality] = useState<'maxresdefault' | 'mqdefault'>('maxresdefault');
  const videoId = extractYouTubeVideoId(url);

  if (!videoId) {
    return <div>Invalid YouTube URL</div>;
  }

  const thumbnailUrl = getYouTubeThumbnailUrl(videoId, quality);

  const handleError = () => {
    if (quality === 'maxresdefault') {
      setQuality('mqdefault');
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onPlay) {
      e.stopPropagation();
      onPlay();
    }
  };

  return (
    <>
      <img 
        src={thumbnailUrl} 
        alt={alt} 
        className={className}
        onError={handleError}
      />
      {showPlayIcon && playIconClassName && (
        <div className={playIconClassName} onClick={handleClick}>
          <span>▶</span>
        </div>
      )}
    </>
  );
};
