import { createSignal, onMount, For } from "solid-js";
import { UserConfig, DEFAULTS } from "../config";
import styles from "../App.module.css";
import { useNavigate } from "@solidjs/router";

interface Theme {
  textColor: string;
  backgroundColor: string;
}

interface ConfigPanelProps {
  currentConfig: UserConfig;
  updateConfig: (newConfig: Partial<UserConfig>) => void;
}

export function ConfigPanel(props: ConfigPanelProps) {
  const navigate = useNavigate();

  // "Applied" values (used for previewing the app)
  const [appliedTheme, setAppliedTheme] = createSignal<Theme>({
    textColor: props.currentConfig.textColor,
    backgroundColor: props.currentConfig.backgroundColor,
  });
  const [appliedFont, setAppliedFont] = createSignal(
    props.currentConfig.fontFamily
  );

  // "Working" values (form inputs before Apply is pressed)
  const [themeName, setThemeName] = createSignal<string>("");
  const [themes, setThemes] = createSignal<Record<string, Theme>>({});
  const [fontFamily, setFontFamily] = createSignal(
    props.currentConfig.fontFamily
  );
  const [albumUrl, setAlbumUrl] = createSignal(props.currentConfig.albumUrl);
  const [slideshowSpeed, setSlideshowSpeed] = createSignal(
    props.currentConfig.slideshowSpeed
  );
  const [musicUrl, setMusicUrl] = createSignal(props.currentConfig.musicUrl);

  const [availableFonts, setAvailableFonts] = createSignal<string[]>([]);

  onMount(async () => {
    try {
      // load fonts
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "/fonts.css";
      document.head.appendChild(link);

      const resFonts = await fetch("/fonts.json");
      const fonts: string[] = await resFonts.json();
      const fontNames = fonts.map((f) => f.replace(/\.[^/.]+$/, ""));
      setAvailableFonts(fontNames);

      if (
        !props.currentConfig.fontFamily ||
        !fontNames.includes(props.currentConfig.fontFamily)
      ) {
        const fallback = fontNames.includes("Poppins")
          ? `"Poppins", sans-serif`
          : DEFAULTS.fontFamily;
        setFontFamily(fallback);
        setAppliedFont(fallback);
      }

      // load themes
      const resThemes = await fetch("/src/ThemeDefaults.json");
      const themesData: Record<string, Theme> = await resThemes.json();
      setThemes(themesData);

      // pick initial theme based on current config
      const foundTheme = Object.entries(themesData).find(
        ([, t]) =>
          t.textColor === props.currentConfig.textColor &&
          t.backgroundColor === props.currentConfig.backgroundColor
      );
      if (foundTheme) {
        setThemeName(foundTheme[0]);
        setAppliedTheme(foundTheme[1]);
      } else {
        const first = Object.keys(themesData)[0];
        setThemeName(first);
        setAppliedTheme(themesData[first]);
      }
    } catch (err) {
      console.error("Could not load fonts.json or ThemeDefaults.json", err);
    }
  });

  const applyChanges = () => {
    const selectedTheme = themes()[themeName()];
    const finalTheme = selectedTheme ?? DEFAULTS;

    setAppliedTheme(finalTheme);
    setAppliedFont(fontFamily());

    props.updateConfig({
      textColor: finalTheme.textColor,
      backgroundColor: finalTheme.backgroundColor,
      fontFamily: fontFamily(),
      albumUrl: albumUrl(),
      slideshowSpeed: slideshowSpeed(),
      musicUrl: musicUrl(),
    });

    navigate("/");
  };

  const revertDefaults = () => {
    setThemeName(""); // reset
    setFontFamily(DEFAULTS.fontFamily);
    setAlbumUrl(DEFAULTS.albumUrl);
    setSlideshowSpeed(DEFAULTS.slideshowSpeed);
    setMusicUrl(DEFAULTS.musicUrl);

    setAppliedTheme({
      textColor: DEFAULTS.textColor,
      backgroundColor: DEFAULTS.backgroundColor,
    });
    setAppliedFont(DEFAULTS.fontFamily);

    props.updateConfig(DEFAULTS);
  };

  return (
    <div
      class={styles.app}
      style={{
        background: appliedTheme().backgroundColor,
        color: appliedTheme().textColor,
        "font-family": appliedFont(),
      }}
    >
      <div class={`${styles.config} ${styles.inner}`}>
        <h3>Configure the Clock</h3>

        {/* THEME SELECT */}
        <div>
          <label style={{ color: appliedTheme().textColor }}>Theme:</label>
          <select
            value={themeName()}
            onInput={(e) => setThemeName(e.currentTarget.value)}
          >
            <For each={Object.keys(themes())}>
              {(name) => <option value={name}>{name}</option>}
            </For>
          </select>
        </div>

        {/* FONT SELECT */}
        <div>
          <label style={{ color: appliedTheme().textColor }}>Font:</label>
          <select
            value={fontFamily()}
            onInput={(e) => setFontFamily(e.currentTarget.value)}
            style={{
              "font-family": fontFamily(), // show selected font in dropdown
            }}
          >
            <For each={availableFonts()}>
              {(font) => (
                <option value={font} style={{ "font-family": font }}>
                  {font}
                </option>
              )}
            </For>
          </select>
        </div>

        {/* ALBUM URL */}
        <div>
          <label style={{ color: appliedTheme().textColor }}>Album URL:</label>
          <input
            type="text"
            value={albumUrl()}
            placeholder="Paste Google album URL"
            onInput={(e) => setAlbumUrl(e.currentTarget.value)}
          />
        </div>

        {/* SLIDESHOW SPEED */}
        <div>
          <label style={{ color: appliedTheme().textColor }}>
            Slideshow Speed (seconds):
          </label>
          <input
            type="number"
            min="5"
            value={slideshowSpeed()}
            onInput={(e) => setSlideshowSpeed(Number(e.currentTarget.value))}
          />
        </div>

        {/* MUSIC URL */}
        <div>
          <label style={{ color: appliedTheme().textColor }}>
            Ambient Music URL:
          </label>
          <input
            type="text"
            value={musicUrl()}
            placeholder="Paste YouTube URL"
            onInput={(e) => setMusicUrl(e.currentTarget.value)}
          />
        </div>

        {/* BUTTONS */}
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
              "background-color": appliedTheme().textColor,
              color: appliedTheme().backgroundColor,
            }}
          >
            Apply
          </button>
          <button
            onClick={revertDefaults}
            style={{
              "background-color": appliedTheme().textColor,
              color: appliedTheme().backgroundColor,
            }}
          >
            Revert
          </button>
        </div>
      </div>
    </div>
  );
}
