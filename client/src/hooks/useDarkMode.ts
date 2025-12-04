import { useEffect, useState } from "react";

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    if (window.matchMedia) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  const toggleDarkMode = () => setIsDarkMode((m) => !m);

  return { isDarkMode, toggleDarkMode };
}