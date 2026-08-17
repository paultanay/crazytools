import { useEffect, useState } from "react";

export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent("crazytools:open-palette"));
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("crazytools:open-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("crazytools:open-palette", onOpen);
    };
  }, []);

  return { open, setOpen };
}
