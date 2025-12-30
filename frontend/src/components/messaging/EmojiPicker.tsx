import { useEffect, useState } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useEmojiPickerStyles } from '../../hooks/useEmojiPickerStyles';
import styles from './EmojiPicker.module.css';

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
      <Picker
        data={data}
        onEmojiSelect={(emoji: any) => onEmojiSelect(emoji.native)}
        theme={theme}
        previewPosition="none"
        skinTonePosition="search"
        searchPosition="sticky"
        perLine={8}
        maxFrequentRows={2}
        dynamicWidth={isMobile}
      />
    </div>
  );
};
