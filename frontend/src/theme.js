// theme.js - Theme Management System
// Includes 9 distinct themes with standardized variables for background images and panel overrides.

export const themes = {
    "neon-dojo": {
        // --- BASE PALETTE (Deep Void) ---
        "--bg-dark": "#050014",       // Deepest Void
        "--bg-surface": "#0a001f",    // Surface/Card
        "--bg-panel": "rgba(24, 10, 51, 0.4)", // Legacy
        
        // --- STANDARDIZED NEW VARS ---
        "--panel-bg": "rgba(10, 0, 31, 0.85)", 
        "--overlay-bg": "rgba(5, 0, 20, 0.85)", 
        "--glass-blur": "20px",
        "--bg-image": "radial-gradient(circle at 50% 0%, #1a0b2e 0%, #050014 60%)",

        // --- TEXT ---
        "--text-header": "#ffffff",
        "--text-primary": "#e0e0e0", // Mapped for consistency
        "--text-main": "#e0e0e0",
        "--text-secondary": "#b8b8d1", // Mapped
        "--text-muted": "#8b8b9b",
        "--text-tertiary": "#5a5a6a",

        // --- BORDERS & ACCENTS ---
        "--border-subtle": "#180a33",
        "--border-active": "#2a1b4e",
        
        // --- NEON SPECTRUM ---
        "--neon-cyan": "#00f2ff",     
        "--neon-violet": "#bc13fe",   
        "--neon-gold": "#ffd700",     
        "--neon-green": "#0aff68",    
        "--neon-red": "#ff003c",      
        "--neon-magenta": "#ff00ff",
        "--neon-mint": "#6ee7b7", // Added for badge consistency

        // --- SPECIAL ---
        "--void-deep": "#050014",
        "--void-mid": "#0a001f", // Added for Card consistency
        "--void-light": "#2a1f4a", // Added for Card consistency
        "--void-glow": "#180a33",
        "--gradient-mastery": "linear-gradient(90deg, #00f2ff, #bc13fe)",
        "--font-display": "'Orbitron', sans-serif",
        "--font-body": "'Inter', sans-serif",
        "--font-mono": "'JetBrains Mono', monospace",
        "--shadow-neon": "0 0 10px rgba(0, 242, 255, 0.3)",
        "--shadow-lg": "0 8px 32px rgba(0, 0, 0, 0.5)"
    },

    "github-dark": {
        "--bg-dark": "#0d1117",
        "--bg-surface": "#161b22",
        "--bg-panel": "#21262d", // Legacy

        "--panel-bg": "rgba(22, 27, 34, 0.9)", 
        "--overlay-bg": "rgba(13, 17, 23, 0.9)",
        "--glass-blur": "12px",
        "--bg-image": "none",

        "--text-header": "#c9d1d9",
        "--text-primary": "#c9d1d9",
        "--text-main": "#c9d1d9",
        "--text-secondary": "#8b949e",
        "--text-muted": "#8b949e",
        "--text-tertiary": "#6e7681",

        "--border-subtle": "#30363d",
        "--border-active": "#8b949e",
        
        "--neon-cyan": "#58a6ff",
        "--neon-violet": "#bc8cff",
        "--neon-gold": "#d29922",
        "--neon-green": "#238636",
        "--neon-red": "#ff7b72",
        "--neon-magenta": "#d2a8ff",
        "--neon-mint": "#3fb950",

        "--void-deep": "#0d1117",
        "--void-mid": "#161b22",
        "--void-light": "#21262d",
        "--void-glow": "#30363d",
        "--gradient-mastery": "linear-gradient(90deg, #58a6ff, #bc8cff)",
        "--font-display": "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        "--font-body": "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        "--font-mono": "ui-monospace, SFMono-Regular, SF Mono, Menlo, monospace",
        "--shadow-neon": "none",
        "--shadow-lg": "0 8px 24px rgba(0, 0, 0, 0.4)"
    },

    "github-light": {
        "--bg-dark": "#f6f8fa",
        "--bg-surface": "#ffffff",
        "--bg-panel": "rgba(255, 255, 255, 0.7)", 

        // Light Theme: Heavy Glassmorphism
        "--panel-bg": "rgba(255, 255, 255, 0.4)", 
        "--overlay-bg": "rgba(240, 240, 240, 0.6)",
        "--glass-blur": "25px", 
        "--bg-image": "none",

        "--text-header": "#24292f",
        "--text-primary": "#24292f",
        "--text-main": "#24292f",
        "--text-secondary": "#57606a",
        "--text-muted": "#57606a",
        "--text-tertiary": "#6e7781",

        "--border-subtle": "#d0d7de",
        "--border-active": "#afb8c1",
        
        "--neon-cyan": "#0969da",
        "--neon-violet": "#8250df",
        "--neon-gold": "#bf8700",
        "--neon-green": "#2da44e",
        "--neon-red": "#d1242f",
        "--neon-magenta": "#a475f9",
        "--neon-mint": "#2da44e",

        "--void-deep": "#f6f8fa",
        "--void-mid": "#ffffff",
        "--void-light": "#f6f8fa",
        "--void-glow": "#d0d7de",
        "--gradient-mastery": "linear-gradient(90deg, #0969da, #8250df)",
        "--font-display": "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        "--font-body": "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        "--font-mono": "ui-monospace, SFMono-Regular, SF Mono, Menlo, monospace",
        "--shadow-neon": "none",
        "--shadow-lg": "0 5px 15px rgba(0, 0, 0, 0.08)"
    },

    "dark-not-boring": {
        "--bg-dark": "#0b0f14",
        "--bg-surface": "#121821",
        "--bg-panel": "rgba(26, 34, 48, 0.7)",

        "--panel-bg": "rgba(18, 24, 33, 0.8)",
        "--overlay-bg": "rgba(11, 15, 20, 0.85)",
        "--glass-blur": "16px",
        "--bg-image": "none",

        "--text-header": "#f0f6fc",
        "--text-primary": "#c9d1d9",
        "--text-main": "#c9d1d9",
        "--text-secondary": "#8b949e",
        "--text-muted": "#8b949e",
        "--text-tertiary": "#6e7681",

        "--border-subtle": "#21262d",
        "--border-active": "#30363d",
        
        "--neon-cyan": "#7ee787",
        "--neon-violet": "#a5b4fc",
        "--neon-gold": "#f2cc60",
        "--neon-green": "#3fb950",
        "--neon-red": "#ff7b72",
        "--neon-magenta": "#ff9bd2",
        "--neon-mint": "#7ee787",

        "--void-deep": "#0b0f14",
        "--void-mid": "#121821",
        "--void-light": "#1a2230",
        "--void-glow": "#21262d",
        "--gradient-mastery": "linear-gradient(90deg, #7ee787, #a5b4fc)",
        "--font-display": "'Inter', sans-serif",
        "--font-body": "'Inter', sans-serif",
        "--font-mono": "'JetBrains Mono', monospace",
        "--shadow-neon": "0 0 10px rgba(126, 231, 135, 0.25)",
        "--shadow-lg": "0 8px 32px rgba(0, 0, 0, 0.4)"
    },

    "monokai-pro": {
        "--bg-dark": "#2D2A2E",
        "--bg-surface": "#403E41",
        "--bg-panel": "#363437",
        
        "--panel-bg": "rgba(64, 62, 65, 0.9)",
        "--overlay-bg": "rgba(45, 42, 46, 0.9)",
        "--glass-blur": "10px",
        "--bg-image": "none",

        "--text-header": "#FCFCFA",
        "--text-primary": "#FDF9F3",
        "--text-main": "#FDF9F3",
        "--text-secondary": "#939293",
        "--text-muted": "#939293",
        "--text-tertiary": "#727072",

        "--border-subtle": "#5B595C",
        "--border-active": "#727072",
        "--neon-cyan": "#78DCE8",
        "--neon-violet": "#AB9DF2",
        "--neon-gold": "#FFD866",
        "--neon-green": "#A9DC76",
        "--neon-red": "#FF6188",
        "--neon-magenta": "#FF6188",
        "--neon-mint": "#A9DC76",

        "--void-deep": "#2D2A2E",
        "--void-mid": "#403E41",
        "--void-light": "#5B595C",
        "--void-glow": "#403E41",
        "--gradient-mastery": "linear-gradient(90deg, #78DCE8, #AB9DF2)",
        "--font-display": "'Inter', sans-serif",
        "--font-body": "'Inter', sans-serif",
        "--font-mono": "'JetBrains Mono', monospace",
        "--shadow-neon": "0 0 10px rgba(120, 220, 232, 0.2)",
        "--shadow-lg": "0 4px 12px rgba(0, 0, 0, 0.3)"
    },

    "synthwave": {
        "--bg-dark": "#262335",
        "--bg-surface": "#241b2f",
        "--bg-panel": "#34294f",

        "--panel-bg": "rgba(36, 27, 47, 0.8)",
        "--overlay-bg": "rgba(38, 35, 53, 0.85)",
        "--glass-blur": "15px",
        "--bg-image": "linear-gradient(to bottom, #2b213a 0%, #241b2f 100%)",

        "--text-header": "#fff0f5",
        "--text-primary": "#fdfdfd",
        "--text-main": "#fdfdfd",
        "--text-secondary": "#848bbd",
        "--text-muted": "#848bbd",
        "--text-tertiary": "#6e5a7d",

        "--border-subtle": "#495495",
        "--border-active": "#f72585",
        "--neon-cyan": "#4CC9F0",
        "--neon-violet": "#7209B7",
        "--neon-gold": "#FFD700",
        "--neon-green": "#0aff68",
        "--neon-red": "#B5179E",
        "--neon-magenta": "#F72585",
        "--neon-mint": "#4CC9F0",

        "--void-deep": "#262335",
        "--void-mid": "#241b2f",
        "--void-light": "#34294f",
        "--void-glow": "#495495",
        "--gradient-mastery": "linear-gradient(90deg, #F72585, #4CC9F0)",
        "--font-display": "'Orbitron', sans-serif",
        "--font-body": "'Inter', sans-serif",
        "--font-mono": "'Fira Code', monospace",
        "--shadow-neon": "0 0 15px rgba(247, 37, 133, 0.5)",
        "--shadow-lg": "0 4px 20px rgba(114, 9, 183, 0.4)"
    },

    "dracula": {
        "--bg-dark": "#282a36",
        "--bg-surface": "#44475a",
        "--bg-panel": "#383a59",

        "--panel-bg": "rgba(68, 71, 90, 0.9)",
        "--overlay-bg": "rgba(40, 42, 54, 0.9)",
        "--glass-blur": "10px",
        "--bg-image": "none",

        "--text-header": "#f8f8f2",
        "--text-primary": "#f8f8f2",
        "--text-main": "#f8f8f2",
        "--text-secondary": "#6272a4",
        "--text-muted": "#6272a4",
        "--text-tertiary": "#6272a4",

        "--border-subtle": "#6272a4",
        "--border-active": "#bd93f9",
        "--neon-cyan": "#8be9fd",
        "--neon-violet": "#bd93f9",
        "--neon-gold": "#f1fa8c",
        "--neon-green": "#50fa7b",
        "--neon-red": "#ff5555",
        "--neon-magenta": "#ff79c6",
        "--neon-mint": "#50fa7b",

        "--void-deep": "#282a36",
        "--void-mid": "#44475a",
        "--void-light": "#6272a4",
        "--void-glow": "#44475a",
        "--gradient-mastery": "linear-gradient(90deg, #bd93f9, #ff79c6)",
        "--font-display": "'Inter', sans-serif",
        "--font-body": "'Inter', sans-serif",
        "--font-mono": "'Fira Code', monospace",
        "--shadow-neon": "0 0 10px rgba(189, 147, 249, 0.3)",
        "--shadow-lg": "0 8px 16px rgba(0, 0, 0, 0.3)"
    },
    
    "nord-theme": {
        "--bg-dark": "#2E3440",
        "--bg-surface": "#3B4252",
        "--bg-panel": "#434C5E",

        "--panel-bg": "rgba(59, 66, 82, 0.85)",
        "--overlay-bg": "rgba(46, 52, 64, 0.9)",
        "--glass-blur": "12px",
        "--bg-image": "none",

        "--text-header": "#ECEFF4",
        "--text-primary": "#E5E9F0",
        "--text-main": "#E5E9F0",
        "--text-secondary": "#D8DEE9",
        "--text-muted": "#D8DEE9",
        "--text-tertiary": "#4C566A",

        "--border-subtle": "#4C566A",
        "--border-active": "#88C0D0",
        "--neon-cyan": "#88C0D0",
        "--neon-violet": "#B48EAD",
        "--neon-gold": "#EBCB8B",
        "--neon-green": "#A3BE8C",
        "--neon-red": "#BF616A",
        "--neon-magenta": "#B48EAD",
        "--neon-mint": "#8FBCBB",

        "--void-deep": "#2E3440",
        "--void-mid": "#3B4252",
        "--void-light": "#434C5E",
        "--void-glow": "#4C566A",
        "--gradient-mastery": "linear-gradient(90deg, #88C0D0, #B48EAD)",
        "--font-display": "'Inter', sans-serif",
        "--font-body": "'Inter', sans-serif",
        "--font-mono": "'JetBrains Mono', monospace",
        "--shadow-neon": "none",
        "--shadow-lg": "0 8px 16px rgba(0, 0, 0, 0.2)"
    },
    
    "tokyo-night": {
        "--bg-dark": "#1a1b26",
        "--bg-surface": "#24283b",
        "--bg-panel": "#283457", // Slightly lighter for panels
        
        "--panel-bg": "rgba(40, 52, 87, 0.85)",
        "--overlay-bg": "rgba(26, 27, 38, 0.9)",
        "--glass-blur": "14px",
        "--bg-image": "none",

        "--text-header": "#c0caf5",
        "--text-primary": "#a9b1d6",
        "--text-main": "#a9b1d6",
        "--text-secondary": "#565f89",
        "--text-muted": "#565f89",
        "--text-tertiary": "#414868",

        "--border-subtle": "#414868",
        "--border-active": "#7aa2f7",
        
        "--neon-cyan": "#7dcfff",
        "--neon-violet": "#bb9af7",
        "--neon-gold": "#e0af68",
        "--neon-green": "#9ece6a",
        "--neon-red": "#f7768e",
        "--neon-magenta": "#bb9af7",
        "--neon-mint": "#73daca",

        "--void-deep": "#1a1b26",
        "--void-mid": "#24283b",
        "--void-light": "#283457",
        "--void-glow": "#414868",
        "--gradient-mastery": "linear-gradient(90deg, #7aa2f7, #bb9af7)",
        "--font-display": "'Inter', sans-serif",
        "--font-body": "'Inter', sans-serif",
        "--font-mono": "'JetBrains Mono', monospace",
        "--shadow-neon": "0 0 10px rgba(122, 162, 247, 0.2)",
        "--shadow-lg": "0 8px 20px rgba(0, 0, 0, 0.3)"
    },

    "cyberpunk-yellow": {
        "--bg-dark": "#fcee0a",       // Cyberpunk Yellow
        "--bg-surface": "#000000",    // Harsh Black Contrast
        "--bg-panel": "#121212",      // Dark Off-Black

        // CYBERPUNK: No blur, high opacity
        "--panel-bg": "#000000",
        "--overlay-bg": "rgba(0, 0, 0, 0.95)",
        "--glass-blur": "0px",
        "--bg-image": "none",

        "--text-header": "#000000",
        "--text-primary": "#000000",
        "--text-main": "#000000",
        "--text-secondary": "#333333",
        "--text-muted": "#333333",
        "--text-tertiary": "#444444",

        "--border-subtle": "#000000",
        "--border-active": "#000000",

        "--neon-cyan": "#00f2ff",     // Electric Blue
        "--neon-violet": "#bc13fe",
        "--neon-gold": "#000000",     // Black Gold
        "--neon-green": "#000000",    // Black Green
        "--neon-red": "#ff003c",      
        "--neon-magenta": "#ff00ff",
        "--neon-mint": "#00f2ff",

        // Map void vars to Black/Yellow to prevent dark mode bleed
        "--void-deep": "#fcee0a",
        "--void-mid": "#fcee0a", 
        "--void-light": "#fcee0a",
        "--void-glow": "#000000",
        
        "--gradient-mastery": "linear-gradient(90deg, #000000, #333333)",
        "--font-display": "'Orbitron', sans-serif",
        "--font-body": "'Inter', sans-serif", 
        "--font-mono": "'JetBrains Mono', monospace",
        "--shadow-neon": "4px 4px 0px #000000", // Hard shadows
        "--shadow-lg": "4px 4px 0px #000000"
    }
};

export const initTheme = () => {
    // Default to 'neon-dojo' if no theme saved, or if saved theme not found
    const savedTheme = localStorage.getItem('app-theme') || 'neon-dojo';
    applyTheme(savedTheme);
};

export const applyTheme = (themeName) => {
    const theme = themes[themeName] || themes['neon-dojo'];
    const root = document.documentElement;

    Object.entries(theme).forEach(([key, value]) => {
        root.style.setProperty(key, value);
    });

    localStorage.setItem('app-theme', themeName);
    
    // Also set specific class for body if needed for tailwind/other util overrides
    document.body.className = themeName;
};
