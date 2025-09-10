import { createSignal, createMemo, onMount } from "solid-js";
import styles from "./App.module.css";
import { useConfig } from "./useConfig";
import { loadConfig, saveConfig, DEFAULTS } from "./config";
import SlideMenu from "./components/Menu";
import { useNavigate } from "@solidjs/router";

function App() {
  const [musicStarted, setMusicStarted] = createSignal(false);
  const navigate = useNavigate();

  // ---------- Config ----------
  const { config } = useConfig();

  // ---------- Clock ----------
  const [time, setTime] = createSignal(new Date());
  onMount(() => {
    const clockInterval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  });

  const [showClock, setShowClock] = createSignal(true);

  // ---------- Slideshow ----------
  const [images, setImages] = createSignal<string[]>([]);
  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [showSlideshow, setShowSlideshow] = createSignal(true);

  const fetchImages = async () => {
    try {
      const url = config().albumUrl || DEFAULTS.albumUrl; // user cookie or env
      const res = await fetch(`/api/album?url=${encodeURIComponent(url)}`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: string[] = await res.json();

      if (!data || data.length === 0) {
        console.warn("No images returned, falling back to local image.");
        setImages(["/FALLBACK.png"]); // 👈 replace with your local path
        return;
      }

      setImages(data);
    } catch (err) {
      setImages(["/FALLBACK.png"]); // 👈 replace with your local path
    }
  };

  onMount(() => {
    fetchImages();

    const slideInterval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % (images().length || 1));
    }, (config().slideshowSpeed || DEFAULTS.slideshowSpeed) * 1000);

    const refreshInterval = setInterval(fetchImages, 5 * 60 * 1000);

    return () => {
      clearInterval(slideInterval);
      clearInterval(refreshInterval);
    };
  });

  const [isClient, setIsClient] = createSignal(false);

  onMount(() => setIsClient(true));

  const proxiedUrl = (url: string) =>
    `/api/proxy?url=${encodeURIComponent(url)}`;

  // ---------- Class Schedule ----------
  const [currentClass, setCurrentClass] = createSignal("Passing time");
  const schedule = [
    { start: "00:00", end: "08:14", label: "Good morning!" },
    { start: "08:15", end: "09:06", label: "1st Hour" },
    { start: "09:09", end: "10:00", label: "2nd Hour" },
    { start: "10:03", end: "10:54", label: "3rd Hour" },
    { start: "10:57", end: "12:13", label: "4th Hour" },
    { start: "12:16", end: "13:07", label: "5th Hour" },
    { start: "13:10", end: "14:01", label: "6th Hour" },
    { start: "14:04", end: "14:57", label: "7th Hour" },
    { start: "14:58", end: "23:59", label: "Have a great night!" },
  ];

  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const updateClass = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    let current = "Passing time";
    for (const period of schedule) {
      if (
        currentMinutes >= timeToMinutes(period.start) &&
        currentMinutes <= timeToMinutes(period.end)
      ) {
        current = period.label;
        break;
      }
    }
    setCurrentClass(current);
  };

  onMount(() => {
    updateClass();
    const classInterval = setInterval(updateClass, 1000);
    return () => clearInterval(classInterval);
  });

  // ---------- Date ----------
  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const layoutClass = createMemo(() => {
    if (!showClock() || !showSlideshow()) return styles.solo;
    return styles.group;
  });

  return (
    <div
      class={`${styles.app} ${layoutClass()}`}
      style={{
        "background-color": config().backgroundColor,
        "font-family": config().fontFamily,
        "min-height": "100vh",
        padding: "1rem",
        position: "relative",
      }}
    >
      {showClock() && (
        <div
          class={styles.clockContainer}
          style={{ color: config().textColor }}
        >
          <div class={styles.clock}>
            <div class={styles.time}>
              {time()
                .toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
                .replace(/\s?[AP]M/, "")}
            </div>
            <div class={styles.side}>
              <div>{time().getHours() >= 12 ? "PM" : "AM"}</div>
              <div>{time().getSeconds().toString().padStart(2, "0")}</div>
            </div>
          </div>
          <div class={styles.dateclass}>
            <div class={styles.date}>
              {`${weekdays[time().getDay()]} - ${
                months[time().getMonth()]
              } ${time().getDate().toString().padStart(2, "0")}`}
            </div>
            <div class={styles.classHour}>{currentClass()}</div>
          </div>
        </div>
      )}

      <SlideMenu>
        <ul style={{ "list-style": "none", padding: 0, margin: 0 }}>
          {/* Play button */}
          <li>
            {config().musicUrl && (
              <button
                onClick={() => setMusicStarted(!musicStarted())} // toggle signal
                style={{
                  width: "100%",
                  padding: "0.5rem 1rem",
                  "border-radius": "0.5rem",
                  border: "none",
                  cursor: "pointer",
                  "background-color": config().textColor,
                  color: config().backgroundColor,
                  "font-weight": "bold",
                  "margin-bottom": "0.5rem",
                  "line-height": 1,
                }}
              >
                {musicStarted() ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill={config().backgroundColor}
                  >
                    <path d="M320-640v320-320Zm-80 400v-480h480v480H240Zm80-80h320v-320H320v320Z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill={config().backgroundColor}
                  >
                    <path d="M320-200v-560l440 280-440 280Zm80-280Zm0 134 210-134-210-134v268Z" />
                  </svg>
                )}
              </button>
            )}
          </li>
          <li>
            <button
              onClick={() => setShowSlideshow(!showSlideshow())}
              style={{
                width: "100%",
                padding: "0.5rem 1rem",
                "border-radius": "0.5rem",
                border: "none",
                cursor: "pointer",
                "background-color": config().textColor,
                color: config().backgroundColor,
                "font-weight": "bold",
                "margin-bottom": "0.5rem",
                "line-height": 1,
              }}
            >
              {showSlideshow() ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill={config().backgroundColor}
                >
                  <path d="m840-234-80-80v-446H314l-80-80h526q33 0 56.5 23.5T840-760v526ZM792-56l-64-64H200q-33 0-56.5-23.5T120-200v-528l-64-64 56-56 736 736-56 56ZM240-280l120-160 90 120 33-44-283-283v447h447l-80-80H240Zm297-257ZM424-424Z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill={config().backgroundColor}
                >
                  <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480 450-320l-90-120-120 160Zm-40 80v-560 560Z" />
                </svg>
              )}
            </button>
          </li>
          <li>
            <button
              onClick={() => setShowClock(!showClock())}
              style={{
                width: "100%",
                padding: "0.5rem 1rem",
                "border-radius": "0.5rem",
                border: "none",
                cursor: "pointer",
                "background-color": config().textColor,
                color: config().backgroundColor,
                "font-weight": "bold",
                "margin-bottom": "0.5rem",
                "line-height": 1,
              }}
            >
              {showClock() ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill={config().backgroundColor}
                >
                  <path d="m798-274-60-60q11-27 16.5-53.5T760-440q0-116-82-198t-198-82q-24 0-51 5t-56 16l-60-60q38-20 80.5-30.5T480-800q60 0 117.5 20T706-722l56-56 56 56-56 56q38 51 58 108.5T840-440q0 42-10.5 83.5T798-274ZM520-552v-88h-80v8l80 80ZM792-56l-96-96q-48 35-103.5 53.5T480-80q-74 0-139.5-28.5T226-186q-49-49-77.5-114.5T120-440q0-60 18.5-115.5T192-656L56-792l56-56 736 736-56 56ZM480-160q42 0 82-13t75-37L248-599q-24 35-36 75t-12 84q0 116 82 198t198 82ZM360-840v-80h240v80H360Zm83 435Zm113-112Z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill={config().backgroundColor}
                >
                  <path d="M480-80q-75 0-140.5-28.5t-114-77q-48.5-48.5-77-114T120-440q0-75 28.5-140.5t77-114q48.5-48.5 114-77T480-800q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-440q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-80Zm0-360Zm112 168 56-56-128-128v-184h-80v216l152 152ZM224-866l56 56-170 170-56-56 170-170Zm512 0 170 170-56 56-170-170 56-56ZM480-160q117 0 198.5-81.5T760-440q0-117-81.5-198.5T480-720q-117 0-198.5 81.5T200-440q0 117 81.5 198.5T480-160Z" />
                </svg>
              )}
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate("/config")}
              style={{
                width: "100%",
                padding: "0.5rem 1rem",
                "border-radius": "0.5rem",
                border: "none",
                cursor: "pointer",
                "background-color": config().textColor,
                color: config().backgroundColor,
                "font-weight": "bold",
                "margin-bottom": "0.5rem",
                "line-height": 1,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill={config().backgroundColor}
              >
                <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
              </svg>
            </button>
          </li>
        </ul>
      </SlideMenu>

      {/* ---------- Slideshow ---------- */}
      {showSlideshow() && (
        <div class={styles.slideshow}>
          {images().length > 0 ? (
            <img
              src={
                images()[currentIndex()].startsWith("http")
                  ? proxiedUrl(images()[currentIndex()])
                  : images()[currentIndex()]
              }
              class={styles.slideImage}
            />
          ) : (
            <p class={styles.loading} style={{ color: config().textColor }}>
              Loading slideshow...
            </p>
          )}
        </div>
      )}

      {musicStarted() &&
        config().musicUrl &&
        (() => {
          try {
            const url = new URL(config().musicUrl);
            const videoId = url.searchParams.get("v");
            if (!videoId) return null;

            const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}`;

            return (
              <iframe
                width="0"
                height="0"
                src={embedUrl}
                allow="autoplay"
              ></iframe>
            );
          } catch {
            return null;
          }
        })()}
    </div>
  );
}

export default App;
