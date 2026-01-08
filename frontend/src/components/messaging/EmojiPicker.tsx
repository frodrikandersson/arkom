import { useEffect, useState, lazy, Suspense } from 'react';
import { useEmojiPickerStyles } from '../../hooks/useEmojiPickerStyles';
import styles from './EmojiPicker.module.css';

// Lazy load emoji-mart to reduce initial bundle size
const LazyPicker = lazy(() =>
  Promise.all([
    import('@emoji-mart/data'),
    import('@emoji-mart/react')
  ]).then(([dataModule, pickerModule]) => ({
    default: ({ data, ...props }: any) => {
      const Picker = pickerModule.default;
      return <Picker data={dataModule.default} {...props} />;
    }
  }))
);

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  theme?: 'light' | 'dark' | 'auto';
}

export const EmojiPicker = ({ onEmojiSelect, theme = 'auto' }: EmojiPickerProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const pickerRef = useEmojiPickerStyles(isMobile);

  return (
    <div className={styles.emojiPicker} ref={pickerRef}>
      <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading emojis...</div>}>
        <LazyPicker
          data={undefined}
          onEmojiSelect={(emoji: any) => onEmojiSelect(emoji.native)}
          theme={theme}
          previewPosition="none"
          skinTonePosition="search"
          searchPosition="sticky"
          perLine={8}
          maxFrequentRows={2}
          dynamicWidth={isMobile}
        />
      </Suspense>
    </div>
  );
};
