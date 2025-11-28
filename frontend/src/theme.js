export const themes = {
    "github-dark": {
        "--bg-dark": "#0d1117",
        "--bg-surface": "#161b22",
        "--text-header": "#c9d1d9",
        "--text-main": "#c9d1d9",
        "--border-subtle": "#30363d",
        "--neon-cyan": "#58a6ff",
        "--neon-red": "#ff7b72",
        "--neon-green": "#238636"
    },
    "github-light": {
        "--bg-dark": "#ffffff",
        "--bg-surface": "#f6f8fa",
        "--text-header": "#24292f",
        "--text-main": "#24292f",
        "--border-subtle": "#d0d7de",
        "--neon-cyan": "#0969da",
        "--neon-red": "#cf222e",
        "--neon-green": "#1a7f37"
    },
    "monokai-pro": {
        "--bg-dark": "#2d2a2e",
        "--bg-surface": "#403e41",
        "--text-header": "#fcfcfa",
        "--text-main": "#fcfcfa",
        "--border-subtle": "#727072",
        "--neon-cyan": "#78dce8",
        "--neon-red": "#ff6188",
        "--neon-green": "#a9dc76"
    },
    "dark-not-boring": {
        "--bg-dark": "#1e1e2e",
        "--bg-surface": "#302d41",
        "--text-header": "#cdd6f4",
        "--text-main": "#cdd6f4",
        "--border-subtle": "#45475a",
        "--neon-cyan": "#89b4fa",
        "--neon-red": "#f38ba8",
        "--neon-green": "#a6e3a1"
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
