// src/components/ConfigPanel.tsx
import { createSignal } from "solid-js";
import { UserConfig, DEFAULTS } from "../config";
import styles from "../App.module.css";

interface ConfigPanelProps {
  currentConfig: UserConfig;
  updateConfig: (newConfig: Partial<UserConfig>) => void;
}

export function ConfigPanel(props: ConfigPanelProps) {
  const [textColor, setTextColor] = createSignal(props.currentConfig.textColor);
  const [fontFamily, setFontFamily] = createSignal(
    props.currentConfig.fontFamily
  );
  const [backgroundColor, setBackgroundColor] = createSignal(
    props.currentConfig.backgroundColor
  );
  const [albumUrl, setAlbumUrl] = createSignal(props.currentConfig.albumUrl); // NEW

  const applyChanges = () => {
    props.updateConfig({
      textColor: textColor(),
      fontFamily: fontFamily(),
      backgroundColor: backgroundColor(),
      albumUrl: albumUrl(), // save user’s album url
    });
  };

  const revertDefaults = () => {
    setTextColor(DEFAULTS.textColor);
    setFontFamily(DEFAULTS.fontFamily);
    setBackgroundColor(DEFAULTS.backgroundColor);
    setAlbumUrl(DEFAULTS.albumUrl); // reset to env
    props.updateConfig(DEFAULTS);
  };

  return (
    <div
      class={styles.app}
      style={{
        background: props.currentConfig.backgroundColor,
        color: props.currentConfig.textColor,
        "font-family": props.currentConfig.fontFamily,
        "min-height": "100vh",
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
      }}
    >
      <div class={styles.config}>
        <h3>Settings</h3>

        <div>
          <label>Text Color:</label>
          <input
            type="color"
            value={textColor()}
            onInput={(e) => setTextColor(e.currentTarget.value)}
          />
        </div>

        <div>
          <label>Font:</label>
          <input
            type="text"
            value={fontFamily()}
            onInput={(e) => setFontFamily(e.currentTarget.value)}
          />
        </div>

        <div>
          <label>Background Color:</label>
          <input
            type="color"
            value={backgroundColor()}
            onInput={(e) => setBackgroundColor(e.currentTarget.value)}
          />
        </div>

        <div>
          <label>Album URL:</label>
          <input
            type="text"
            value={albumUrl()}
            placeholder="Paste Google album URL"
            onInput={(e) => setAlbumUrl(e.currentTarget.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "1rem", "margin-top": "1rem" }}>
          <button onClick={applyChanges}>Apply</button>
          <div class={styles.tooltipContainer}>
            <button onClick={revertDefaults} class={styles.revertButton}>
              Revert
            </button>
            <span class={styles.tooltipText}>Revert back to defaults</span>
          </div>
        </div>
      </div>
    </div>
  );
}
