// server.js
import express from "express";
import fetch from "node-fetch";
import fs from "fs";
import { fetchImageUrls } from "google-photos-album-image-url-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const albumUrl = process.env.GOOGLE_ALBUM_URL;
const albumJsonPath = "./public/album.json";

let albumCache = [];
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch album URLs, cache in memory, and write to JSON
async function updateAlbumCache() {
  try {
    const images = await fetchImageUrls(albumUrl);
    albumCache = images.map((i) => i.url);

    // Write to JSON file
    fs.writeFileSync(albumJsonPath, JSON.stringify(albumCache, null, 2));
    console.log(
      `Album updated: ${albumCache.length} images, saved to ${albumJsonPath}`
    );
  } catch (err) {
    console.error("Failed to fetch album:", err);
  }
}

// Initial fetch
updateAlbumCache();

// Refresh album every 5 minutes
setInterval(updateAlbumCache, CACHE_DURATION);

// Proxy endpoint for images
app.get("/api/proxy-image", async (req, res) => {
  const url = req.query.url;
  if (!url || Array.isArray(url))
    return res.status(400).send("Missing or invalid URL");

  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "image/jpeg"
    );
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch image");
  }
});

// Endpoint to return album URLs (reads from memory)
app.get("/api/album", async (req, res) => {
  if (albumCache.length === 0) await updateAlbumCache();
  res.json(albumCache);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Proxy + album server running on http://localhost:${PORT}`)
);
