import { fetchImageUrls } from "google-photos-album-image-url-fetch";

export default async function handler(req, res) {
  const albumUrl = process.env.GOOGLE_ALBUM_URL;

  if (!albumUrl) return res.status(400).json({ error: "No album URL set" });

  try {
    const images = await fetchImageUrls(albumUrl);
    const urls = images.map((i) => i.url);
    res.status(200).json(urls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch album" });
  }
}
