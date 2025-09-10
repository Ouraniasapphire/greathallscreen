// src/components/ConfigPanel.tsx
import { createSignal } from "solid-js";
import { UserConfig, DEFAULTS } from "../config";
import styles from "../App.module.css";
import { useNavigate } from "@solidjs/router";

interface ConfigPanelProps {
  currentConfig: UserConfig;
  updateConfig: (newConfig: Partial<UserConfig>) => void;
}

export function ConfigPanel(props: ConfigPanelProps) {
  const navigate = useNavigate();
  const [textColor, setTextColor] = createSignal(props.currentConfig.textColor);
  const [fontFamily, setFontFamily] = createSignal(
    props.currentConfig.fontFamily
  );
  const [backgroundColor, setBackgroundColor] = createSignal(
    props.currentConfig.backgroundColor
  );
  const [albumUrl, setAlbumUrl] = createSignal(props.currentConfig.albumUrl);
  const [slideshowSpeed, setSlideshowSpeed] = createSignal(
    props.currentConfig.slideshowSpeed
  );
  const [musicUrl, setMusicUrl] = createSignal(props.currentConfig.musicUrl); // ✅

  const applyChanges = () => {
    props.updateConfig({
      textColor: textColor(),
      fontFamily: fontFamily(),
      backgroundColor: backgroundColor(),
      albumUrl: albumUrl(),
      slideshowSpeed: slideshowSpeed(),
      musicUrl: musicUrl(), // ✅ save
    });
  };

  const revertDefaults = () => {
    setTextColor(DEFAULTS.textColor);
    setFontFamily(DEFAULTS.fontFamily);
    setBackgroundColor(DEFAULTS.backgroundColor);
    setAlbumUrl(DEFAULTS.albumUrl);
    setSlideshowSpeed(DEFAULTS.slideshowSpeed);
    setMusicUrl(DEFAULTS.musicUrl);
    props.updateConfig(DEFAULTS);
  };

  return (
    <div
      class={styles.app}
      style={{
        background: props.currentConfig.backgroundColor,
        color: props.currentConfig.textColor,
      }}
    >
      <div class={`${styles.config} ${styles.inner}`}>
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
        <div>
          <label>Slideshow Speed (seconds):</label>
          <input
            type="number"
            min="5"
            value={slideshowSpeed()}
            onInput={(e) => setSlideshowSpeed(Number(e.currentTarget.value))}
          />
        </div>
        <div>
          <label>Ambient Music URL:</label>
          <input
            type="text"
            value={musicUrl()}
            placeholder="Paste MP3 or stream URL"
            onInput={(e) => setMusicUrl(e.currentTarget.value)}
          />
        </div>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            "margin-top": "1rem",
            "flex-direction": "column",
            width: "100%",
            "align-items": "center",
          }}
        >
          <button
            onClick={applyChanges}
            style={{
              "background-color": textColor(),
              color: backgroundColor(),
            }}
          >
            Apply
          </button>
          <button
            onClick={revertDefaults}
            style={{
              "background-color": textColor(),
              color: backgroundColor(),
            }}
          >
            Revert
          </button>
          <button
            onClick={() => navigate("/")}
            style={{
              "background-color": textColor(),
              color: backgroundColor(),
            }}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
