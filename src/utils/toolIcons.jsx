// src/utils/toolIcons.jsx
import React from 'react';
import {
  Palette,
  Bot,
  Code2,
  Briefcase,
  Sparkles,
  Wrench,
  Layers,
  Video
} from 'lucide-react';

export const FigmaIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 38 57" fill="none">
    <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE" />
    <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83" />
    <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262" />
    <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E" />
    <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF" />
  </svg>
);

export const CanvaIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="11" fill="url(#canva-grad)" />
    <path d="M14.5 9.2c-.6-.7-1.4-1.1-2.4-1.1-2.2 0-3.6 1.7-3.6 4.1 0 2.2 1.4 3.8 3.5 3.8 1.1 0 2-.5 2.5-1.2.3-.4.6-.3.8-.1l.6.8c.2.2.1.5-.2.8-.8.9-2.1 1.5-3.8 1.5-3.3 0-5.6-2.4-5.6-5.6 0-3.4 2.2-5.9 5.8-5.9 1.6 0 2.9.6 3.8 1.5.3.3.2.7-.1.9l-.7.7c-.2.2-.5.2-.7-.2z" fill="#FFFFFF" />
    <defs>
      <linearGradient id="canva-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00C4CC" />
        <stop offset="1" stopColor="#7D2AE8" />
      </linearGradient>
    </defs>
  </svg>
);

export const PhotoshopIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#001E36" />
    <path d="M6 16.5V7.5H10.2C11.8 7.5 12.8 8.4 12.8 9.8C12.8 11.3 11.7 12.1 10.1 12.1H7.8V16.5H6ZM7.8 10.5H9.9C10.6 10.5 11.1 10.2 11.1 9.8C11.1 9.3 10.6 9.1 9.9 9.1H7.8V10.5ZM13.8 15.2C14.3 15.6 15 15.9 15.8 15.9C16.8 15.9 17.3 15.4 17.3 14.8C17.3 13.3 13.9 13.9 13.9 11.5C13.9 10.1 15 9.1 16.6 9.1C17.4 9.1 18.2 9.4 18.7 9.7L18.2 11.1C17.7 10.8 17.1 10.6 16.5 10.6C15.7 10.6 15.3 11 15.3 11.5C15.3 12.9 18.7 12.3 18.7 14.8C18.7 16.3 17.5 17.4 15.8 17.4C14.8 17.4 13.9 17 13.3 16.5L13.8 15.2Z" fill="#31A8FF" />
  </svg>
);

export const IllustratorIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#330000" />
    <path d="M6 16.5L9.5 7.5H11.5L15 16.5H13.2L12.4 14.3H8.6L7.8 16.5H6ZM9.1 12.8H11.9L10.5 8.9H10.4L9.1 12.8ZM16.8 9.5V7.5H18.8V9.5H16.8ZM16.8 16.5V10.5H18.8V16.5H16.8Z" fill="#FF9A00" />
  </svg>
);

export const PremiereIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#00005B" />
    <path d="M5.5 16.5V7.5H9.7C11.3 7.5 12.3 8.4 12.3 9.8C12.3 11.3 11.2 12.1 9.6 12.1H7.3V16.5H5.5ZM7.3 10.5H9.4C10.1 10.5 10.6 10.2 10.6 9.8C10.6 9.3 10.1 9.1 9.4 9.1H7.3V10.5ZM13.8 16.5V10.8H15.5V12.1H15.6C16 11.2 16.8 10.7 17.8 10.7C18.1 10.7 18.4 10.7 18.6 10.8V12.5C18.3 12.4 17.9 12.4 17.5 12.4C16.4 12.4 15.6 13.2 15.6 14.6V16.5H13.8Z" fill="#EA77FF" />
  </svg>
);

export const AffinityIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#1C2128" />
    <path d="M12 4.5L4.5 18h4.2l1.6-3h3.4l1.6 3h4.2L12 4.5zm0 4.5l2 3.6h-4l2-3.6z" fill="url(#affinity-grad-util)" />
    <defs>
      <linearGradient id="affinity-grad-util" x1="4.5" y1="4.5" x2="19.5" y2="18" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00D2FF" />
        <stop offset="0.5" stopColor="#0078FF" />
        <stop offset="1" stopColor="#6A00FF" />
      </linearGradient>
    </defs>
  </svg>
);

export const ChatGPTIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="#10A37F">
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 10.3 3.69a6.055 6.055 0 0 0-5.4 3.01 5.99 5.99 0 0 0-3.924 4.19 6.05 6.05 0 0 0 .782 5.56 5.985 5.985 0 0 0 .516 4.91 6.046 6.046 0 0 0 6.51 2.9A6.065 6.065 0 0 0 13.7 20.31a6.055 6.055 0 0 0 5.4-3.01 5.99 5.99 0 0 0 3.924-4.19 6.05 6.05 0 0 0-.742-5.289zm-8.878 11.23a4.57 4.57 0 0 1-2.736-.921l.135-.078 4.553-2.628a.747.747 0 0 0 .378-.654v-6.425l1.93 1.114a.07.07 0 0 1 .038.052v5.42a4.58 4.58 0 0 1-4.298 4.12zm-8.4-3.659a4.56 4.56 0 0 1-.58-2.83l.136.082 4.553 2.628a.754.754 0 0 0 .756 0l5.565-3.212v2.228a.07.07 0 0 1-.028.058l-4.693 2.71a4.58 4.58 0 0 1-5.709-.664zm-1.12-8.583a4.57 4.57 0 0 1 2.156-1.909v5.336a.75.75 0 0 0 .378.654l5.564 3.213-1.93 1.114a.07.07 0 0 1-.065.006l-4.694-2.71a4.58 4.58 0 0 1-1.409-5.704zm13.774 3.036l-5.564-3.213 1.93-1.114a.07.07 0 0 1 .065-.006l4.694 2.71a4.58 4.58 0 0 1 1.409 5.704 4.57 4.57 0 0 1-2.156 1.91v-5.337a.75.75 0 0 0-.378-.654zm2.868-2.613a4.56 4.56 0 0 1 .58 2.83l-.136-.082-4.553-2.628a.754.754 0 0 0-.756 0l-5.565 3.212V8.547a.07.07 0 0 1 .028-.058l4.693-2.71a4.58 4.58 0 0 1 5.709.664zm-8.118 4.18l-2.52-1.455 2.52-1.455 2.52 1.455-2.52 1.455z"/>
  </svg>
);

export const GeminiIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z" fill="url(#gemini-grad-util)" />
    <defs>
      <linearGradient id="gemini-grad-util" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1BA1E3" />
        <stop offset="0.5" stopColor="#7B61FF" />
        <stop offset="1" stopColor="#FA5560" />
      </linearGradient>
    </defs>
  </svg>
);

export const CapCutIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#111111" />
    <path d="M4.5 7.5h15v2.8H12L7.3 16.5H4.5V7.5z" fill="#00F7EF" />
    <path d="M19.5 16.5H4.5v-2.8H12l4.7-6.2h2.8v9z" fill="#FFFFFF" />
  </svg>
);

export const ClaudeIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 100 100" fill="#CC785C">
    <path d="m19.6 66.5 19.7-11 .3-1-.3-.5h-1l-3.3-.2-11.2-.3L14 53l-9.5-.5-2.4-.5L0 49l.2-1.5 2-1.3 2.9.2 6.3.5 9.5.6 6.9.4L38 49.1h1.6l.2-.7-.5-.4-.4-.4L29 41l-10.6-7-5.6-4.1-3-2-1.5-2-.6-4.2 2.7-3 3.7.3.9.2 3.7 2.9 8 6.1L37 36l1.5 1.2.6-.4.1-.3-.7-1.1L33 25l-6-10.4-2.7-4.3-.7-2.6c-.3-1-.4-2-.4-3l3-4.2L28 0l4.2.6L33.8 2l2.6 6 4.1 9.3L47 29.9l2 3.8 1 3.4.3 1h.7v-.5l.5-7.2 1-8.7 1-11.2.3-3.2 1.6-3.8 3-2L61 2.6l2 2.9-.3 1.8-1.1 7.7L59 27.1l-1.5 8.2h.9l1-1.1 4.1-5.4 6.9-8.6 3-3.5L77 13l2.3-1.8h4.3l3.1 4.7-1.4 4.9-4.4 5.6-3.7 4.7-5.3 7.1-3.2 5.7.3.4h.7l12-2.6 6.4-1.1 7.6-1.3 3.5 1.6.4 1.6-1.4 3.4-8.2 2-9.6 2-14.3 3.3-.2.1.2.3 6.4.6 2.8.2h6.8l12.6 1 3.3 2 1.9 2.7-.3 2-5.1 2.6-6.8-1.6-16-3.8-5.4-1.3h-.8v.4l4.6 4.5 8.3 7.5L89 80.1l.5 2.4-1.3 2-1.4-.2-9.2-7-3.6-3-8-6.8h-.5v.7l1.8 2.7 9.8 14.7.5 4.5-.7 1.4-2.6 1-2.7-.6-5.8-8-6-9-4.7-8.2-.5.4-2.9 30.2-1.3 1.5-3 1.2-2.5-2-1.4-3 1.4-6.2 1.6-8 1.3-6.4 1.2-7.9.7-2.6v-.2H49L43 72l-9 12.3-7.2 7.6-1.7.7-3-1.5.3-2.8L24 86l10-12.8 6-7.9 4-4.6-.1-.5h-.3L17.2 77.4l-4.7.6-2-2 .2-3 1-1 8-5.5Z" />
  </svg>
);

export const GoogleFlowIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#131314" />
    <defs>
      <linearGradient id="flow-grad-util" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4285F4" />
        <stop offset="35%" stopColor="#A855F7" />
        <stop offset="70%" stopColor="#EA4335" />
        <stop offset="100%" stopColor="#FBBC05" />
      </linearGradient>
    </defs>
    <path
      d="M6 14.5C6 11.5 8.2 9.5 11 9.5C13.8 9.5 14.8 14.5 17.5 14.5C19.2 14.5 20 13.5 20 12C20 9.8 18.2 8 16 8C14.5 8 13.2 8.8 12.5 9.8"
      stroke="url(#flow-grad-util)"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <circle cx="7" cy="14.5" r="1.5" fill="#4285F4" />
    <circle cx="17.5" cy="14.5" r="1.5" fill="#FBBC05" />
  </svg>
);

export const HtmlIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <path d="M3 2L5 20L12 22L19 20L21 2H3Z" fill="#E44D26" />
    <path d="M12 3.8V20.2L17.5 18.7L19.1 3.8H12Z" fill="#F16529" />
    <path d="M7 6.5H17L16.7 9H9.7L10 11.5H16.4L15.9 16.3L12 17.4L8.1 16.3L7.8 13.2H9.8L10 14.7L12 15.2L14 14.7L14.2 13H7.5L7 6.5Z" fill="#FFFFFF" />
  </svg>
);

export const CssIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <path d="M3 2L5 20L12 22L19 20L21 2H3Z" fill="#1572B6" />
    <path d="M12 3.8V20.2L17.5 18.7L19.1 3.8H12Z" fill="#33A9DC" />
    <path d="M7 6.5H17L16.7 9H9.7L10 11.5H16.4L15.9 16.3L12 17.4L8.1 16.3L7.8 13.2H9.8L10 14.7L12 15.2L14 14.7L14.2 13H7.5L7 6.5Z" fill="#FFFFFF" />
  </svg>
);

export const JsIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#F7DF1E" />
    <path d="M7 17.5C7.5 18.3 8.3 19 9.5 19C10.8 19 11.8 18.1 11.8 16.2V9.5H9.8V16.1C9.8 16.9 9.3 17.2 8.7 17.2C8.2 17.2 7.8 16.9 7.5 16.4L7 17.5ZM13.8 16.6C14.3 17.5 15.2 18 16.4 18C17.7 18 18.7 17.3 18.7 16.1C18.7 14.9 18 14.4 16.9 13.9L16.3 13.6C15.6 13.3 15.1 13 15.1 12.4C15.1 11.8 15.6 11.4 16.3 11.4C17 11.4 17.5 11.7 17.9 12.4L19 11.7C18.4 10.6 17.5 10.1 16.3 10.1C14.8 10.1 13.7 11 13.7 12.4C13.7 13.6 14.4 14.2 15.5 14.7L16.1 15C16.9 15.4 17.4 15.7 17.4 16.4C17.4 17.1 16.8 17.5 16.1 17.5C15.2 17.5 14.6 17 14.2 16.2L13.8 16.6Z" fill="#000000" />
  </svg>
);

export const ReactIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="-11.5 -10.23174 23 20.46348" fill="none">
    <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
    <g stroke="#61DAFB" strokeWidth="1" fill="none">
      <ellipse rx="11" ry="4.2" />
      <ellipse rx="11" ry="4.2" transform="rotate(60)" />
      <ellipse rx="11" ry="4.2" transform="rotate(120)" />
    </g>
  </svg>
);

export const TailwindIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.336 6.182 14.975 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.336 13.382 8.975 12 6.001 12z" fill="#38BDF8" />
  </svg>
);

export const MeetIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <path d="M15 8.5L19.5 5V19L15 15.5V8.5Z" fill="#00832D" />
    <path d="M3 7C3 5.9 3.9 5 5 5H13C14.1 5 15 5.9 15 7V17C15 18.1 14.1 19 13 19H5C3.9 19 3 18.1 3 17V7Z" fill="#00AC47" />
    <path d="M15 8.5L12 5H5C3.9 5 3 5.9 3 7V12L15 8.5Z" fill="#0066DA" />
    <path d="M3 12V17C3 18.1 3.9 19 5 19H12L15 15.5L3 12Z" fill="#E37400" />
    <path d="M15 15.5L19.5 19V14L15 15.5Z" fill="#D93025" />
  </svg>
);

export const DocsIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#4285F4" />
    <path d="M14 2V8H20L14 2Z" fill="#A1C2FA" />
    <path d="M8 12H16M8 15H16M8 18H13" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const SheetsIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#0F9D58" />
    <path d="M14 2V8H20L14 2Z" fill="#87CEAB" />
    <path d="M7 11H17V17H7V11Z" fill="#FFFFFF" />
    <path d="M7 13H17M7 15H17M11 11V17M14 11V17" stroke="#0F9D58" strokeWidth="0.8" />
  </svg>
);

export const ZoomIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#2D8CFF" />
    <path d="M6 8.5C6 7.67 6.67 7 7.5 7H14.5C15.33 7 16 7.67 16 8.5V15.5C16 16.33 15.33 17 14.5 17H7.5C6.67 17 6 16.33 6 15.5V8.5Z" fill="#FFFFFF" />
    <path d="M16 10.5L19 8V16L16 13.5V10.5Z" fill="#FFFFFF" />
  </svg>
);

export const NotionIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#171717" />
    <path d="M7 7v10h2.2l5.2-6.5V17h2.6V7h-2.2L9.6 13.5V7H7z" fill="#FFFFFF" />
  </svg>
);

export const DriveIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 87.3 78" fill="none">
    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47" />
    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335" />
    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.25z" fill="#00832d" />
    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.25z" fill="#2684fc" />
    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
  </svg>
);

export const iconMap = {
  figma: <FigmaIcon />,
  canva: <CanvaIcon />,
  photoshop: <PhotoshopIcon />,
  adobephotoshop: <PhotoshopIcon />,
  illustrator: <IllustratorIcon />,
  adobeillustrator: <IllustratorIcon />,
  premiere: <PremiereIcon />,
  adobepremiere: <PremiereIcon />,
  adobepremierepro: <PremiereIcon />,
  affinity: <AffinityIcon />,
  affinitydesigner: <AffinityIcon />,
  chatgpt: <ChatGPTIcon />,
  gemini: <GeminiIcon />,
  flow: <GoogleFlowIcon />,
  googleflow: <GoogleFlowIcon />,
  claude: <ClaudeIcon />,
  claudeai: <ClaudeIcon />,
  capcut: <CapCutIcon />,
  html: <HtmlIcon />,
  html5: <HtmlIcon />,
  css: <CssIcon />,
  css3: <CssIcon />,
  js: <JsIcon />,
  javascript: <JsIcon />,
  react: <ReactIcon />,
  reactjs: <ReactIcon />,
  tailwind: <TailwindIcon />,
  tailwindcss: <TailwindIcon />,
  meet: <MeetIcon />,
  googlemeet: <MeetIcon />,
  docs: <DocsIcon />,
  googledocs: <DocsIcon />,
  sheets: <SheetsIcon />,
  googlespreadsheet: <SheetsIcon />,
  zoom: <ZoomIcon />,
  notion: <NotionIcon />,
  drive: <DriveIcon />,
  googledrive: <DriveIcon />
};

export function ToolImage({ src, alt, fallback }) {
  const [hasError, setHasError] = React.useState(false);

  // If the src changes, reset error state
  React.useEffect(() => {
    setHasError(false);
  }, [src]);

  if (hasError || !src) return fallback;

  return (
    <img
      src={src}
      alt={alt || 'Tool'}
      className="w-5 h-5 object-contain"
      onError={() => setHasError(true)}
    />
  );
}

export function resolveToolIcon(tool) {
  if (!tool) return <Wrench className="w-5 h-5 text-[#5F5A57]" />;
  if (tool.icon) return tool.icon;

  const getFallback = () => {
    const key = (tool.iconKey || tool.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (iconMap[key]) return iconMap[key];

    switch (tool.category) {
      case 'Desain':
        return <Palette className="w-5 h-5 text-[#E66F52]" />;
      case 'Prompting AI':
        return <Bot className="w-5 h-5 text-[#7B61FF]" />;
      case 'Front End Development':
        return <Code2 className="w-5 h-5 text-[#0284C7]" />;
      case 'Office':
        return <Briefcase className="w-5 h-5 text-[#059669]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#E66F52]" />;
    }
  };

  if (tool.customIconUrl) {
    return (
      <ToolImage
        src={tool.customIconUrl}
        alt={tool.name}
        fallback={getFallback()}
      />
    );
  }

  return getFallback();
}
