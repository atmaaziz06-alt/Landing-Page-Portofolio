import { useEffect, useState } from 'react';

export default function useContentProtection(enabled) {
  const [isCovered, setIsCovered] = useState(false);

  useEffect(() => {
    if (!enabled) return undefined;

    const cover = () => setIsCovered(true);
    const uncoverWhenFocused = () => {
      if (document.visibilityState === 'visible') {
        setIsCovered(false);
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        cover();
      } else {
        uncoverWhenFocused();
      }
    };
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const isSavePrintOrSourceShortcut =
        (event.ctrlKey || event.metaKey) && ['s', 'p', 'u'].includes(key);

      if (isSavePrintOrSourceShortcut || event.key === 'PrintScreen') {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener('blur', cover);
    window.addEventListener('focus', uncoverWhenFocused);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('blur', cover);
      window.removeEventListener('focus', uncoverWhenFocused);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [enabled]);

  return isCovered;
}
