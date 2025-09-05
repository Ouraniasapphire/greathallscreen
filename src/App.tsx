import { createSignal, onMount, onCleanup } from "solid-js";
import styles from "./App.module.css";

function App() {
  const [time, setTime] = createSignal(new Date());
  const [images, setImages] = createSignal<string[]>([]);
  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [currentClass, setCurrentClass] = createSignal("Passing time");

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

  const schedule = [
    { start: "08:15", end: "09:06", label: "1st Hour" },
    { start: "09:09", end: "10:00", label: "2nd Hour" },
    { start: "10:03", end: "10:54", label: "3rd Hour" },
    { start: "10:57", end: "12:13", label: "4th Hour" },
    { start: "12:16", end: "13:07", label: "5th Hour" },
    { start: "13:10", end: "14:01", label: "6th Hour" },
    { start: "14:04", end: "14:57", label: "7th Hour" },
  ];

  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  // Tick clock every second
  const clockInterval = setInterval(() => setTime(new Date()), 1000);
  onCleanup(() => clearInterval(clockInterval));

  // Fetch images from Vercel serverless function
  async function fetchImages() {
    try {
      const res = await fetch("/api/album"); // use serverless function
      const data: string[] = await res.json();
      setImages(data);
    } catch (err) {
      console.error("Failed to fetch images:", err);
    }
  }

  // Rotate slideshow and refetch album
  onMount(() => {
    fetchImages();

    const slideInterval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % (images().length || 1));
    }, 60000); // change slide every 5s

    const refreshInterval = setInterval(fetchImages, 5 * 60 * 1000); // refresh every 5 min

    return () => {
      clearInterval(slideInterval);
      clearInterval(refreshInterval);
    };
  });

  // Update current class hour every minute
  const classInterval = setInterval(() => {
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
  }, 1000);
  onCleanup(() => clearInterval(classInterval));

  // Use Vercel proxy endpoint
  const proxiedUrl = (url: string) =>
    `/api/proxy?url=${encodeURIComponent(url)}`;

  return (
    <div class={styles.app}>
      <div class={styles.clockContainer}>
        <div class={styles.clock}>
          <div class={styles.time}>
            {time().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
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

      <div class={styles.slideshow}>
        {images().length > 0 ? (
          <img
            src={proxiedUrl(images()[currentIndex()])}
            class={styles.slideImage}
          />
        ) : (
          <p class={styles.loading}>Loading slideshow...</p>
        )}
      </div>
    </div>
  );
}

export default App;
