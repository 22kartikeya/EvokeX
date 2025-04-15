import { useEffect, useRef, useState } from "react";
import { WebContainer } from '@webcontainer/api';

export function useWebContainer() {
  const [webcontainer, setWebcontainer] = useState<WebContainer>();
  const hasBootedRef = useRef(false); // prevents multiple boots

  useEffect(() => {
    const main = async () => {
      if (hasBootedRef.current) return; // skip if already booted
      hasBootedRef.current = true;

      try {
        const webcontainerInstance = await WebContainer.boot();
        setWebcontainer(webcontainerInstance);
      } catch (err) {
        console.error("Failed to boot WebContainer:", err);
      }
    };

    main();
  }, []);

  return webcontainer;
}