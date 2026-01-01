import { extractYouTubeVideoId } from '../../utils/youtubeHelpers';

interface YouTubeEmbedProps {
  url: string;
  alt?: string;
  className?: string;
  thumbnailClassName?: string;
  playIconClassName?: string;
}

export const YouTubeEmbed = ({ 
  url, 
  alt, 
  className,
}: YouTubeEmbedProps) => {
  const videoId = extractYouTubeVideoId(url);

  if (!videoId) {
    return <div>Invalid YouTube URL</div>;
  }

  // Autoplay muted, loop the video
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&rel=0&modestbranding=1`;

  return (
    <>
      <iframe
        src={embedUrl}
        title={alt || 'YouTube video player'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className={className}
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          pointerEvents: 'none', // Disable iframe clicks
        }}
      />
      {/* Transparent overlay to allow parent clicks */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        cursor: 'pointer',
      }} />
    </>
  );
};
