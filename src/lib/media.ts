/**
 * Extracts and formats YouTube video embed URLs from any YouTube link standard formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://music.youtube.com/watch?v=VIDEO_ID
 */
export function getYouTubeEmbedUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Regex pattern matching YouTube video IDs (11 characters)
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);

  if (match && match[2] && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0`;
  }
  
  return null;
}

/**
 * Checks if a given string is a valid PDF URL or data URI.
 */
export function isPdfUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();
  return (
    trimmed.startsWith('data:application/pdf') ||
    trimmed.endsWith('.pdf') ||
    trimmed.includes('.pdf?') ||
    trimmed.includes('application/pdf')
  );
}

/**
 * Returns a high quality YouTube thumbnail image URL from a YouTube video URL or ID.
 */
export function getYouTubeThumbnailUrl(url?: string | null, fallbackUrl?: string | null): string {
  const defaultFallback = fallbackUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80';
  if (!url || typeof url !== 'string') return defaultFallback;

  const embedUrl = getYouTubeEmbedUrl(url);
  if (!embedUrl) return defaultFallback;

  const match = embedUrl.match(/\/embed\/([^?]+)/);
  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }

  return defaultFallback;
}
