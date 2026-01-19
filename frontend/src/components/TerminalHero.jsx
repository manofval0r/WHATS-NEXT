import React, { useState, useEffect, useRef } from 'react';
import './TerminalHero.css';
import { CheckCircle, ExternalLink, Terminal, Lock, RotateCcw } from 'lucide-react';

const SCRIPTS = [
    {
        id: 'react',
        lines: [
            { type: 'cmd', text: 'npx create-vite@latest my-portfolio --template react-ts' },
            { type: 'cmd', text: 'cd my-portfolio' },
            { type: 'cmd', text: 'npm install' },
            { type: 'cmd', text: 'npm run dev' }
        ],
        output: `
  Local:    http://localhost:5173
  Network:  http://192.168.1.42:5173
`
    },
    {
        id: 'astro',
        lines: [
            { type: 'cmd', text: 'npm create astro@latest dev-portfolio' },
            { type: 'cmd', text: 'cd dev-portfolio' },
            { type: 'cmd', text: 'npm install' },
            { type: 'cmd', text: 'npm run dev' }
        ],
        output: `
  Local:    http://localhost:4321
`
    },
    {
        id: 'next',
        lines: [
            { type: 'cmd', text: 'bun create next-app@latest my-saas --ts' },
            { type: 'cmd', text: 'cd my-saas' },
            { type: 'cmd', text: 'bun install' },
            { type: 'cmd', text: 'bun run dev' }
        ],
        output: `
  Local:    http://localhost:3000
`
    },
    {
        id: 'rust',
        lines: [
            { type: 'cmd', text: 'cargo new rust-actix-api' },
            { type: 'cmd', text: 'cd rust-actix-api' },
            { type: 'cmd', text: 'cargo run' }
        ],
        output: `
  Finished dev [unoptimized + debuginfo]
     Running \`target/debug/rust-actix-api\`
  Server running at http://127.0.0.1:8080
`
    },
    {
        id: 'svelte',
        lines: [
            { type: 'cmd', text: 'npm create svelte@latest hacker-news-clone' },
            { type: 'cmd', text: 'cd hacker-news-clone' },
            { type: 'cmd', text: 'npm install' },
            { type: 'cmd', text: 'npm run dev' }
        ],
        output: `
  Local:    http://localhost:5173
  Vite ⚡ ready in 420 ms
`
    }
];

export default function TerminalHero() {
    const [scriptIndex, setScriptIndex] = useState(0);
    const [displayedLines, setDisplayedLines] = useState([]);
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [showOutput, setShowOutput] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);

    const currentScript = SCRIPTS[scriptIndex];

    useEffect(() => {
        // Reset state when script changes
        setDisplayedLines([]);
        setCurrentLineIndex(0);
        setCharIndex(0);
        setShowOutput(false);
        setShowSuccess(false);
        setIsFadingOut(false);
    }, [scriptIndex]);

    useEffect(() => {
        if (showSuccess || isFadingOut) return;

        const line = currentScript.lines[currentLineIndex];
        if (!line) {
            // All lines typed, show output
            if (!showOutput) {
                const timer = setTimeout(() => {
                    setShowOutput(true);
                }, 500);
                return () => clearTimeout(timer);
            } else {
                // Output shown, wait then show success
                const timer = setTimeout(() => {
                    setShowSuccess(true);
                }, 2000); // 2 sec pause after output
                return () => clearTimeout(timer);
            }
        }

        // Typing effect
        if (charIndex < line.text.length) {
            const timer = setTimeout(() => {
                setCharIndex(prev => prev + 1);
            }, 30 + Math.random() * 40); // Random typing speed (30-70ms)
            return () => clearTimeout(timer);
        } else {
            // Line finished, move to next line
            const timer = setTimeout(() => {
                setDisplayedLines(prev => [...prev, line]);
                setCurrentLineIndex(prev => prev + 1);
                setCharIndex(0);
            }, 400); // Pause between commands
            return () => clearTimeout(timer);
        }
    }, [currentScript, currentLineIndex, charIndex, showOutput, showSuccess, isFadingOut]);

    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => {
                setIsFadingOut(true);
                setTimeout(() => {
                    setScriptIndex(prev => (prev + 1) % SCRIPTS.length);
                }, 500); // Fade out duration
            }, 5000); // Show success for 5 seconds
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    // Render helper
    const renderCurrentLine = () => {
        const line = currentScript.lines[currentLineIndex];
        if (!line) return null;
        return (
            <div className="terminal-line active">
                <span className="prompt">$</span>
                <span className="cmd-text">{line.text.substring(0, charIndex)}</span>
                <span className="cursor">█</span>
            </div>
        );
    };

    return (
        <div className={`terminal-container ${isFadingOut ? 'fade-out' : 'fade-in'}`}>
            <div className="terminal-header">
                <div className="terminal-buttons">
                    <div className="dot red"></div>
                    <div className="dot yellow"></div>
                    <div className="dot green"></div>
                </div>
                <div className="terminal-title">bash — 80x24</div>
            </div>

            <div className="terminal-body">
                {displayedLines.map((line, idx) => (
                    <div key={idx} className="terminal-line">
                        <span className="prompt">$</span>
                        <span className="cmd-text">{line.text}</span>
                    </div>
                ))}

                {!showOutput && renderCurrentLine()}

                {showOutput && (
                    <div className="terminal-output">
                        <pre>{currentScript.output}</pre>
                        <div className="terminal-line active" style={{ marginTop: '16px' }}>
                            <span className="prompt">$</span>
                            <span className="cursor">█</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Success Overlay */}
            <div className={`success-overlay ${showSuccess ? 'visible' : ''}`}>
                <div className="success-content">
                    <div className="success-badge">
                        <CheckCircle size={20} color="#4ade80" />
                        <span>You just shipped your first project in 42 seconds</span>
                    </div>

                    <div className="preview-card">
                        <div className="preview-header">
                            <div className="preview-url">
                                <div className="lock-icon"><Lock size={12} /></div>
                                <span>localhost:5173</span>
                                <div className="refresh-icon"><RotateCcw size={12} /></div>
                            </div>
                        </div>
                        <div className="preview-body">
                            <div className="preview-hero">
                                <div className="preview-title"></div>
                                <div className="preview-text"></div>
                                <div className="preview-btn"></div>
                            </div>
                            <div className="preview-grid">
                                <div className="preview-item"></div>
                                <div className="preview-item"></div>
                                <div className="preview-item"></div>
                            </div>
                        </div>

                        <div className="live-badge">
                            <div className="live-dot"></div>
                            <span>Live Server</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="scanline"></div>
        </div>
    );
}
