// src/config.ts
export interface UserConfig {
  textColor: string;
  fontFamily: string;
  backgroundColor: string;
  albumUrl: string; // NEW
}

export const DEFAULTS: UserConfig = {
  textColor: "#b3e5fc",
  fontFamily: "Poppins, sans-serif",
  backgroundColor: "#1a1a1a",
  albumUrl: import.meta.env.VITE_ALBUM_URL || "",
};

export function setCookie(name: string, value: string, days = 30) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/`;
}

export function getCookie(name: string) {
  return document.cookie.split("; ").reduce((r, v) => {
    const [key, val] = v.split("=");
    return key === name ? decodeURIComponent(val) : r;
  }, "");
}

export function loadConfig(): UserConfig {
  const cookieAlbumUrl = getCookie("albumUrl");
  return {
    textColor: getCookie("textColor") || DEFAULTS.textColor,
    fontFamily: getCookie("fontFamily") || DEFAULTS.fontFamily,
    backgroundColor: getCookie("backgroundColor") || DEFAULTS.backgroundColor,
    albumUrl:
      cookieAlbumUrl && cookieAlbumUrl.trim() !== ""
        ? cookieAlbumUrl
        : DEFAULTS.albumUrl, // fallback to env default if empty
  };
}

export function saveConfig(config: Partial<UserConfig>) {
  if (config.textColor) setCookie("textColor", config.textColor);
  if (config.fontFamily) setCookie("fontFamily", config.fontFamily);
  if (config.backgroundColor)
    setCookie("backgroundColor", config.backgroundColor);

  if (config.albumUrl !== undefined) {
    if (config.albumUrl.trim() === "") {
      // clear cookie by expiring it
      setCookie("albumUrl", "", -1);
    } else {
      setCookie("albumUrl", config.albumUrl);
    }
  }
}

// at bottom of config.ts
export default {
  DEFAULTS,
  loadConfig,
  saveConfig,
  setCookie,
  getCookie,
};
