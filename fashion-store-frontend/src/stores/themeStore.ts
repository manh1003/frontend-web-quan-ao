import { create } from "zustand";
import { persist } from "zustand/middleware";
import { settingsApi } from "@/api/settings";

export interface ThemeSettings {
  siteName: string;
  siteDescription: string;
  logoUrl: string;
  faviconUrl: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  primaryColor: string;
  secondaryColor: string;
}

interface ThemeStore {
  settings: ThemeSettings;
  isLoading: boolean;
  error: string | null;
  updateSettings: (settings: Partial<ThemeSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  applyTheme: () => void;
  loadSettingsFromServer: () => Promise<void>;
}

const defaultSettings: ThemeSettings = {
  siteName: "Fashion Store",
  siteDescription: "Cửa hàng thời trang trực tuyến",
  logoUrl: "",
  faviconUrl: "",
  contactEmail: "contact@fashionstore.com",
  contactPhone: "0123456789",
  address: "123 Đường ABC, Quận 1, TP.HCM",
  primaryColor: "#6366f1",
  secondaryColor: "#ec4899",
};

// Helper function to apply CSS variables
const applyCSSVariables = (settings: ThemeSettings) => {
  const root = document.documentElement;

  // Convert hex to RGB for Tailwind compatibility
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(
          result[3],
          16
        )}`
      : "99 102 241"; // Default primary color
  };

  // Apply primary color (all shades use same RGB value, alpha handled by Tailwind)
  const primaryRgb = hexToRgb(settings.primaryColor);
  root.style.setProperty("--color-primary", primaryRgb);
  root.style.setProperty("--color-primary-50", primaryRgb);
  root.style.setProperty("--color-primary-100", primaryRgb);
  root.style.setProperty("--color-primary-200", primaryRgb);
  root.style.setProperty("--color-primary-300", primaryRgb);
  root.style.setProperty("--color-primary-400", primaryRgb);
  root.style.setProperty("--color-primary-500", primaryRgb);
  root.style.setProperty("--color-primary-600", primaryRgb);
  root.style.setProperty("--color-primary-700", primaryRgb);
  root.style.setProperty("--color-primary-800", primaryRgb);
  root.style.setProperty("--color-primary-900", primaryRgb);

  // Apply secondary color
  const secondaryRgb = hexToRgb(settings.secondaryColor);
  root.style.setProperty("--color-secondary", secondaryRgb);
  root.style.setProperty("--color-secondary-50", secondaryRgb);
  root.style.setProperty("--color-secondary-100", secondaryRgb);
  root.style.setProperty("--color-secondary-200", secondaryRgb);
  root.style.setProperty("--color-secondary-300", secondaryRgb);
  root.style.setProperty("--color-secondary-400", secondaryRgb);
  root.style.setProperty("--color-secondary-500", secondaryRgb);
  root.style.setProperty("--color-secondary-600", secondaryRgb);
  root.style.setProperty("--color-secondary-700", secondaryRgb);
  root.style.setProperty("--color-secondary-800", secondaryRgb);
  root.style.setProperty("--color-secondary-900", secondaryRgb);

  // Debug: Log to console
  console.log("🎨 Theme applied:", {
    primary: primaryRgb,
    secondary: secondaryRgb,
  });
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      isLoading: false,
      error: null,

      loadSettingsFromServer: async () => {
        set({ isLoading: true, error: null });
        try {
          const serverSettings = await settingsApi.getSettings();
          
          // Luôn sync settings từ server về client để đảm bảo đồng bộ
          console.log("✅ Syncing settings from server");
          set({ settings: serverSettings, isLoading: false });
          applyCSSVariables(serverSettings);
        } catch (error) {
          console.error("Failed to load settings from server:", error);
          set({
            error: "Không thể tải cài đặt từ server",
            isLoading: false
          });
          // Fallback to localStorage settings nếu server không khả dụng
          const { settings } = get();
          applyCSSVariables(settings);
        }
      },

      updateSettings: async (newSettings) => {
        set({ isLoading: true, error: null });
        try {
          const currentSettings = get().settings;
          const updatedSettings = { ...currentSettings, ...newSettings };
          
          // Update local state first for immediate UI feedback
          set({ settings: updatedSettings });
          applyCSSVariables(updatedSettings);
          
          // Then save to server
          const savedSettings = await settingsApi.updateSettings(updatedSettings);
          
          // Confirm with server response
          set({ settings: savedSettings, isLoading: false });
          console.log("✅ Settings saved successfully to server and localStorage");
        } catch (error) {
          console.error("Failed to update settings on server:", error);
          set({
            error: "Không thể lưu cài đặt lên server, nhưng đã lưu local",
            isLoading: false
          });
          // Keep local changes even if server save fails
          const updatedSettings = { ...get().settings, ...newSettings };
          set({ settings: updatedSettings });
          applyCSSVariables(updatedSettings);
          console.log("⚠️ Settings saved to localStorage only (server error)");
        }
      },

      resetSettings: async () => {
        set({ isLoading: true, error: null });
        try {
          const resetSettings = await settingsApi.resetSettings();
          set({ settings: resetSettings, isLoading: false });
          applyCSSVariables(resetSettings);
        } catch (error) {
          console.error("Failed to reset settings:", error);
          set({
            error: "Không thể reset cài đặt",
            isLoading: false,
            settings: defaultSettings
          });
          applyCSSVariables(defaultSettings);
        }
      },

      applyTheme: () => {
        const { settings } = get();
        applyCSSVariables(settings);
      },
    }),
    {
      name: "theme-storage",
      onRehydrateStorage: () => (state) => {
        // Apply theme after rehydration from localStorage
        if (state) {
          applyCSSVariables(state.settings);
          // Load from server in background to sync (with error handling)
          state.loadSettingsFromServer().catch((error) => {
            console.warn("Could not sync settings from server on startup:", error);
            // Continue with localStorage settings
          });
        }
      },
    }
  )
);
