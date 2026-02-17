// theme.js — Standard Design System
// Updates: "standard-dark" is now the default Slate/Blue theme.

export const themes = {
  // === STANDARD DARK (Ink & Prussian Blue) ===
  "standard-dark": {
    // --- BACKGROUND ---
    "--bg-dark": "#0d1b2a",      // Ink Black
    "--bg-surface": "#1b263b",   // Prussian Blue
    "--bg-panel": "#1b263b",     // Prussian Blue
    "--bg-card": "#1b263b",
    "--bg-hover": "#415a77",     // Dusk Blue (lighter interaction)
    "--panel-bg": "#1b263b",
    "--overlay-bg": "rgba(13, 27, 42, 0.9)", // Ink Black opacity
    "--glass-blur": "12px",
    "--bg-image": "none",

    // --- TEXT ---
    "--text-header": "#e0e1dd",    // Alabaster Grey
    "--text-primary": "#e0e1dd",   // Alabaster Grey
    "--text-main": "#e0e1dd",
    "--text-secondary": "#778da9", // Dusty Denim
    "--text-muted": "#415a77",     // Dusk Blue
    "--text-tertiary": "#415a77",

    // --- BORDERS ---
    "--border-subtle": "#415a77",  // Dusk Blue
    "--border-active": "#778da9",  // Dusty Denim

    // --- BRAND COLORS ---
    "--primary": "#778da9",        // Dusty Denim (Keep it monochrome/tech)
    "--primary-light": "#e0e1dd",
    "--primary-bg": "#1b263b",
    "--success": "#29BC9B",        // Keep func colors standard
    "--warning": "#F59E0B",
    "--danger": "#EF4444",

    // --- LEGACY MAPPING ---
    "--neon-cyan": "#778da9",
    "--neon-violet": "#415a77",
    "--void-deep": "#0d1b2a",
    "--void-mid": "#1b263b",
    "--font-display": "'Inter', sans-serif",
    "--font-body": "'Inter', sans-serif",
    "--font-mono": "'JetBrains Mono', monospace",
  },

  // === STANDARD LIGHT (Deep Space & Yale Blue) ===
  "standard-light": {
    // --- BACKGROUND ---
    "--bg-dark": "#F0F8FF",        // Alice Blue (Very light tint)
    "--bg-surface": "#FFFFFF",
    "--bg-panel": "#FFFFFF",
    "--bg-card": "#FFFFFF",
    "--bg-hover": "#a9d6e5",       // Light Blue
    "--panel-bg": "#FFFFFF",
    "--overlay-bg": "rgba(255, 255, 255, 0.95)",
    "--glass-blur": "10px",

    // --- TEXT ---
    "--text-header": "#012a4a",    // Deep Space Blue
    "--text-primary": "#013a63",   // Yale Blue
    "--text-main": "#013a63",
    "--text-secondary": "#2a6f97", // Rich Cerulean
    "--text-muted": "#468faf",     // Air Force Blue
    "--text-tertiary": "#61a5c2",  // Steel Blue

    // --- BORDERS ---
    "--border-subtle": "#89c2d9",  // Sky Blue Light
    "--border-active": "#2c7da0",  // Cerulean

    // --- BRAND COLORS ---
    "--primary": "#014f86",        // Yale Blue 3
    "--primary-light": "#2a6f97",  // Rich Cerulean
    "--primary-bg": "#a9d6e5",     // Light Blue
    "--success": "#014f86",        // Using Blue as success in this palette
    "--warning": "#F59E0B",
    "--danger": "#EF4444",

    // --- LEGACY MAPPING ---
    "--neon-cyan": "#014f86",
    "--void-deep": "#F0F8FF",
    "--font-display": "'Inter', sans-serif",
    "--font-body": "'Inter', sans-serif",
    "--font-mono": "'JetBrains Mono', monospace",
  },
};

export const initTheme = () => {
  const savedTheme = localStorage.getItem('app-theme') || 'standard-dark';
  const validThemes = Object.keys(themes);
  const themeName = validThemes.includes(savedTheme) ? savedTheme : 'standard-dark';
  applyTheme(themeName);
};

export const applyTheme = (themeName) => {
  const theme = themes[themeName] || themes['standard-dark'];
  const root = document.documentElement;

  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  localStorage.setItem('app-theme', themeName);
  document.documentElement.setAttribute('data-theme', themeName);
  document.getElementById('theme-color-meta')?.setAttribute('content', theme['--bg-dark']);
};
