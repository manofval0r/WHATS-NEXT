// theme.js - utility to apply predefined themes
export const themes = {
    "github-dark": {
        "--bg-dark": "#0d1117",
        "--bg-surface": "#161b22",
        "--text-header": "#c9d1d9",
        "--text-main": "#c9d1d9",
        "--border-subtle": "#30363d",
        "--neon-cyan": "#58a6ff",
        "--neon-red": "#ff7b72"
    },
    "github-light": {
        "--bg-dark": "#ffffff",
        "--bg-surface": "#f6f8fa",
        "--text-header": "#24292f",
        "--text-main": "#24292f",
        "--border-subtle": "#d0d7de",
        "--neon-cyan": "#0969da",
        "--neon-red": "#cf222e"
    },
    "dark-not-boring": {
        "--bg-dark": "#1e1e2e",
        "--bg-surface": "#302d41",
        "--text-header": "#cdd6f4",
        "--text-main": "#cdd6f4",
        "--border-subtle": "#45475a",
        "--neon-cyan": "#89b4fa",
        "--neon-red": "#f38ba8"
    },
    "serious-light": {
        "--bg-dark": "#fafafa",
        "--bg-surface": "#e0e0e0",
        "--text-header": "#212121",
        "--text-main": "#212121",
        "--border-subtle": "#bdbdbd",
        "--neon-cyan": "#009688",
        "--neon-red": "#d32f2f"
    }
};

export function applyTheme(name) {
    const root = document.documentElement;
    const vars = themes[name];
    if (!vars) return;
    Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));
    document.body.className = `theme-${name}`;
    localStorage.setItem('selectedTheme', name);
}

export function initTheme() {
    const saved = localStorage.getItem('selectedTheme') || 'dark-not-boring';
    applyTheme(saved);
}
