import { createSignal, onMount, For } from "solid-js";
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
  const [musicUrl, setMusicUrl] = createSignal(props.currentConfig.musicUrl);

  const [availableFonts, setAvailableFonts] = createSignal<string[]>([]);

  onMount(async () => {
    try {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "/fonts.css";
      document.head.appendChild(link);

      const res = await fetch("/fonts.json");
      const fonts: string[] = await res.json();

      const fontNames = fonts.map((f) => f.replace(/\.[^/.]+$/, ""));
      setAvailableFonts(fontNames);

      if (
        !props.currentConfig.fontFamily ||
        !fontNames.includes(props.currentConfig.fontFamily)
      ) {
        // ✅ default to Poppins-Regular if available
        const fallback = fontNames.includes("Poppins-Regular")
          ? "Poppins-Regular"
          : DEFAULTS.fontFamily;
        setFontFamily(fallback);
      }
    } catch (err) {
      console.error("Could not load fonts.json", err);
    }
  });

  const applyChanges = () => {
    props.updateConfig({
      textColor: textColor(),
      fontFamily: fontFamily(),
      backgroundColor: backgroundColor(),
      albumUrl: albumUrl(),
      slideshowSpeed: slideshowSpeed(),
      musicUrl: musicUrl(),
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
        "font-family": props.currentConfig.fontFamily, // ✅ preview in chosen font
      }}
    >
      <div class={`${styles.config} ${styles.inner}`}>
        <h3>Settings</h3>

        <div>
          <label>Text Color:</label>
          <input
            type="text"
            value={textColor()}
            onInput={(e) => setTextColor(e.currentTarget.value)}
          />
        </div>

        <div>
          <label>Font:</label>
          <select
            value={fontFamily()}
            onInput={(e) => setFontFamily(e.currentTarget.value)}
          >
            <For each={availableFonts()}>
              {(font) => <option value={font}>{font}</option>}
            </For>
          </select>
        </div>

        <div>
          <label>Background Color:</label>
          <input
            type="text"
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
