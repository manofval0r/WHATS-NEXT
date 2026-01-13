// theme.js - Neon Dojo Theme Management

export const themes = {
    "neon-dojo": {
        // --- BASE PALETTE (Deep Void) ---
        "--bg-dark": "#050014",       // Deepest Void
        "--bg-surface": "#0a001f",    // Surface/Card
        "--bg-panel": "rgba(24, 10, 51, 0.4)",      // Glass Panel
        
        // --- TEXT ---
        "--text-header": "#ffffff",
        "--text-main": "#e0e0e0",
        "--text-muted": "#8b8b9b",
        "--text-tertiary": "#5a5a6a",

        // --- BORDERS & ACCENTS ---
        "--border-subtle": "#180a33",
        "--border-active": "#2a1b4e",
        
        // --- NEON SPECTRUM ---
        "--neon-cyan": "#00f2ff",     // Primary Action / Info
        "--neon-violet": "#bc13fe",   // Creative / Magic
        "--neon-gold": "#ffd700",     // Premium / Achievement
        "--neon-green": "#0aff68",    // Success
        "--neon-red": "#ff003c",      // Error / Danger
        "--neon-magenta": "#ff00ff",

        // --- SPECIAL ---
        "--void-deep": "#050014",
        "--void-glow": "#180a33",
        "--gradient-mastery": "linear-gradient(90deg, #00f2ff, #bc13fe)",
        "--font-display": "'Orbitron', sans-serif",
        "--font-body": "'Inter', sans-serif",
        "--font-mono": "'JetBrains Mono', monospace",
        "--shadow-neon": "0 0 10px rgba(0, 242, 255, 0.3)"
    },
    // Retaining legacy themes for fallback/premium options if needed, 
    // but mapping them to closer equivalents or keeping as is.
    "github-dark": {
        "--bg-dark": "#0d1117",
        "--bg-surface": "#161b22",
        "--bg-panel": "#21262d",
        "--text-header": "#c9d1d9",
        "--text-main": "#c9d1d9",
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

        "--void-deep": "#0d1117",
        "--void-glow": "#30363d",
        "--gradient-mastery": "linear-gradient(90deg, #58a6ff, #bc8cff)",
        "--font-display": "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        "--font-body": "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        "--font-mono": "ui-monospace, SFMono-Regular, SF Mono, Menlo, monospace",
        "--shadow-neon": "none"
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
