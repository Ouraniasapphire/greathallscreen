import { createSignal, onMount } from "solid-js";
import styles from "./App.module.css";
import { useConfig } from "./useConfig";
import { loadConfig, saveConfig, DEFAULTS } from "./config";
import SlideMenu from "./components/Menu";

function App() {
  const [musicStarted, setMusicStarted] = createSignal(false);

  // ---------- Config ----------
  const { config } = useConfig();

  // ---------- Clock ----------
  const [time, setTime] = createSignal(new Date());
  onMount(() => {
    const clockInterval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  });

  // ---------- Slideshow ----------
  const [images, setImages] = createSignal<string[]>([]);
  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [showSlideshow, setShowSlideshow] = createSignal(true);

  const fetchImages = async () => {
    try {
      const url = config().albumUrl || DEFAULTS.albumUrl; // user cookie or env
      const res = await fetch(`/api/album?url=${encodeURIComponent(url)}`);
      const data: string[] = await res.json();
      setImages(data);
    } catch (err) {
      console.error("Failed to fetch images:", err);
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

  return (
    <div
      class={styles.app}
      style={{
        "background-color": config().backgroundColor,
        "font-family": config().fontFamily,
        "min-height": "100vh",
        padding: "1rem",
        position: "relative",
      }}
    >
      {/* ---------- Clock ---------- */}
      <div class={styles.clockContainer} style={{ color: config().textColor }}>
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
        <div class={styles.date}>
          {`${weekdays[time().getDay()]} - ${months[time().getMonth()]} ${time()
            .getDate()
            .toString()
            .padStart(2, "0")}`}
        </div>
        <div class={styles.classHour}>{currentClass()}</div>
      </div>

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
        </ul>
      </SlideMenu>

      {/* ---------- Slideshow ---------- */}
      {showSlideshow() && (
        <div class={styles.slideshow}>
          {images().length > 0 ? (
            <img
              src={proxiedUrl(images()[currentIndex()])}
              class={styles.slideImage}
            />
          ) : (
            <p class={styles.loading} style={{ color: config().textColor }}>
              Loading slideshow...
            </p>
          )}
        </div>
      )}

      {/* Hidden iframe once user clicks */}
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
                frameborder="0"
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
