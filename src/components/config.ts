// src/config.ts
export interface UserConfig {
  textColor: string;
  fontFamily: string;
  backgroundColor: string;
}

export const DEFAULTS: UserConfig = {
  textColor: "#b3e5fc",
  fontFamily: "Poppins, sans-serif",
  backgroundColor: "#1a1a1a",
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
  return {
    textColor: getCookie("textColor") || DEFAULTS.textColor,
    fontFamily: getCookie("fontFamily") || DEFAULTS.fontFamily,
    backgroundColor: getCookie("backgroundColor") || DEFAULTS.backgroundColor,
  };
}

export function saveConfig(config: Partial<UserConfig>) {
  if (config.textColor) setCookie("textColor", config.textColor);
  if (config.fontFamily) setCookie("fontFamily", config.fontFamily);
  if (config.backgroundColor)
    setCookie("backgroundColor", config.backgroundColor);
}
