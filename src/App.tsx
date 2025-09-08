import { createSignal, onMount } from "solid-js";
import styles from "./App.module.css";
import { useConfig } from "./useConfig";
import { loadConfig, saveConfig, DEFAULTS } from "./config";

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
      {/* ---------- Toggle Button ---------- */}
      <button
        onClick={() => setShowSlideshow(!showSlideshow())}
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          padding: "0.5rem 1rem",
          "border-radius": "0.5rem",
          border: "none",
          cursor: "pointer",
          "background-color": config().textColor,
          color: config().backgroundColor,
          "font-weight": "bold",
        }}
      >
        {showSlideshow() ? "Hide" : "Show"}
      </button>

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

      {/* ---------- Ambient Music ---------- */}
      <div>
        {/* Play button */}
        {config().musicUrl && (
          <button
            onClick={() => setMusicStarted(!musicStarted())} // toggle signal
            style={{
              position: "absolute",
              top: "1rem",
              left: "1rem",
              padding: "0.5rem 1rem",
              "border-radius": "0.5rem",
              border: "none",
              cursor: "pointer",
              "background-color": config().textColor,
              color: config().backgroundColor,
              "font-weight": "bold",
            }}
          >
            {musicStarted() ? "Stop" : "Play"}
          </button>
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
    </div>
  );
}

export default App;
