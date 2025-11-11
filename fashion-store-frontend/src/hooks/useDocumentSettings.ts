import { useEffect } from "react";
import { useThemeStore } from "@/stores";

export function useDocumentSettings() {
  const { settings } = useThemeStore();

  useEffect(() => {
    // Update document title
    document.title = settings.siteName;

    // Update favicon
    if (settings.faviconUrl) {
      // Remove old favicon
      const existingFavicon = document.querySelector("link[rel*='icon']");
      if (existingFavicon) {
        existingFavicon.remove();
      }

      // Add new favicon
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = settings.faviconUrl;
      document.head.appendChild(link);
    }

    // Update meta description
    let metaDescription = document.querySelector("meta[name='description']");
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", settings.siteDescription);
  }, [settings.siteName, settings.faviconUrl, settings.siteDescription]);
}






