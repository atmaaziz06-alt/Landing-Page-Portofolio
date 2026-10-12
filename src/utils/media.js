export const AI_VIDEO_CATEGORY = 'Ai Video Content';
export const GRAPHIC_DESIGN_CATEGORY = 'Desain Grafis';

const PROTECTED_PROJECT_CATEGORIES = new Set([
  AI_VIDEO_CATEGORY,
  GRAPHIC_DESIGN_CATEGORY,
  'AI Video Content Creator',
  'Graphic Design'
]);

export function isProtectedProjectCategory(category) {
  return PROTECTED_PROJECT_CATEGORIES.has(category);
}

export function isGraphicDesignProjectCategory(category) {
  return category === GRAPHIC_DESIGN_CATEGORY || category === 'Graphic Design';
}

export function isVideoUrl(url) {
  if (typeof url !== 'string') return false;

  const pathname = url.split(/[?#]/, 1)[0].toLowerCase();
  return pathname.endsWith('.mp4') || pathname.endsWith('.webm');
}
