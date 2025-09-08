// src/useConfig.ts
import { createSignal } from "solid-js";
import { loadConfig, saveConfig, UserConfig } from "./components/config";

// Create a global reactive config store
const [config, setConfig] = createSignal<UserConfig>(loadConfig());

// Update config and persist to cookies
const updateConfig = (newConfig: Partial<UserConfig>) => {
  const updated = { ...config(), ...newConfig };
  setConfig(updated);
  saveConfig(updated);
};

// Export signal getter, setter, and updater
export function useConfig() {
  return {
    config,
    setConfig,
    updateConfig,
  };
}
