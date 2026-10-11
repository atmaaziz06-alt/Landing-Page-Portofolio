export const AI_VIDEO_CATEGORY = 'Ai Video Content';

export function isVideoUrl(url) {
  if (typeof url !== 'string') return false;

  const pathname = url.split(/[?#]/, 1)[0].toLowerCase();
  return pathname.endsWith('.mp4') || pathname.endsWith('.webm');
}
