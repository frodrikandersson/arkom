import { useEffect, useRef, useState } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import styles from './EmojiPicker.module.css';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  theme?: 'light' | 'dark' | 'auto';
}

export const EmojiPicker = ({ onEmojiSelect, theme = 'auto' }: EmojiPickerProps) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Get computed theme colors and convert to RGB
    const getComputedRGB = (cssVar: string) => {
      const color = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
      // If it's a hex color, convert to RGB
      if (color.startsWith('#')) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `${r}, ${g}, ${b}`;
      }
      return color;
    };

    const applyStyles = () => {
      if (pickerRef.current) {
        const picker = pickerRef.current.querySelector('em-emoji-picker') as HTMLElement;
        if (picker && picker.shadowRoot) {
          picker.style.setProperty('--rgb-background', getComputedRGB('--color-card'));
          picker.style.setProperty('--rgb-input', getComputedRGB('--color-foreground'));
          picker.style.setProperty('--rgb-color', getComputedRGB('--color-text'));
          picker.style.setProperty('--rgb-accent', getComputedRGB('--color-accent'));
          
          // Access shadow DOM to override :host width on mobile
          if (isMobile) {
            const shadowRoot = picker.shadowRoot;
            
            // Inject CSS to override :host { width: min-content }
            let styleEl = shadowRoot.querySelector('#mobile-width-override') as HTMLStyleElement;
            if (!styleEl) {
              styleEl = document.createElement('style');
              styleEl.id = 'mobile-width-override';
              styleEl.textContent = `
                :host {
                  width: 100% !important;
                  max-width: 100% !important;
                }
                .scroll {
                  padding-right: var(--padding) !important;
                }
              `;
              shadowRoot.appendChild(styleEl);
            }

          }
          return true;
        }
      }
      return false;
    };

    // Try immediately
    if (applyStyles()) return;

    // If picker not ready, watch for it
    const observer = new MutationObserver(() => {
      if (applyStyles()) {
        observer.disconnect();
      }
    });

    if (pickerRef.current) {
      observer.observe(pickerRef.current, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, [isMobile]);

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
        dynamicWidth={isMobile}  // Only enable on mobile
      />
    </div>
  );
};