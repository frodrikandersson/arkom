import { useEffect, useRef } from 'react';

/**
 * Custom hook to apply theme styles to the emoji picker's shadow DOM
 * and handle mobile responsive width overrides
 */
export const useEmojiPickerStyles = (isMobile: boolean) => {
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getComputedRGB = (cssVar: string): string => {
      const color = getComputedStyle(document.documentElement)
        .getPropertyValue(cssVar)
        .trim();

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

    const applyStylesToShadowDOM = (): boolean => {
      if (!pickerRef.current) return false;

      const picker = pickerRef.current.querySelector('em-emoji-picker') as HTMLElement;
      if (!picker?.shadowRoot) return false;

      // Apply theme CSS variables
      picker.style.setProperty('--rgb-background', getComputedRGB('--color-card'));
      picker.style.setProperty('--rgb-input', getComputedRGB('--color-foreground'));
      picker.style.setProperty('--rgb-color', getComputedRGB('--color-text'));
      picker.style.setProperty('--rgb-accent', getComputedRGB('--color-accent'));

      // Override mobile width constraints via shadow DOM
      if (isMobile) {
        const shadowRoot = picker.shadowRoot;
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
    };

    // Try to apply styles immediately
    if (applyStylesToShadowDOM()) return;

    // If picker not ready, watch for it with MutationObserver
    const observer = new MutationObserver(() => {
      if (applyStylesToShadowDOM()) {
        observer.disconnect();
      }
    });

    if (pickerRef.current) {
      observer.observe(pickerRef.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => observer.disconnect();
  }, [isMobile]);

  return pickerRef;
};
