"""
Frontend Developer — Career Path Catalog
=========================================
Master the art of building beautiful, accessible, and performant
user interfaces. From HTML basics to advanced React patterns,
TypeScript, testing, and performance optimization.

Modules: 14 (hard skills + soft skills + capstone)
"""

FRONTEND_DEVELOPER = {
    "role": "frontend",
    "title": "Frontend Developer",
    "description": "Master the art of building beautiful, accessible, and performant user interfaces. From HTML basics to production-grade React apps.",
    "modules": [
        # ── 0  HTML & Semantic Markup ─────────────────────────────
        {
            "label": "HTML & Semantic Markup",
            "description": "The skeleton of every web page. Learn HTML5 elements, forms, tables, multimedia, and why semantic structure matters for SEO and accessibility.",
            "market_value": "Low",
            "node_type": "core",
            "connections": [1, 2],
            "project_prompt": "Build a multi-page static website for a local business with semantic HTML, accessible forms, embedded media, and schema.org microdata.",
            "resources": {
                "primary": [
                    {"title": "FreeCodeCamp Responsive Web Design", "url": "https://www.freecodecamp.org/learn/2022/responsive-web-design/", "type": "interactive"},
                    {"title": "MDN HTML Elements Reference", "url": "https://developer.mozilla.org/en-US/docs/Web/HTML/Element", "type": "docs"},
                ],
                "additional": [
                    {"title": "W3Schools HTML Tutorial", "url": "https://www.w3schools.com/html/", "type": "docs"},
                    {"title": "HTML Best Practices (GitHub)", "url": "https://github.com/hail2u/html-best-practices", "type": "docs"},
                    {"title": "Traversy Media HTML Crash Course", "url": "https://www.youtube.com/watch?v=UB1O30fR-EE", "type": "video"},
                ],
            },
            "lessons": [
                {"title": "HTML Document Structure", "description": "DOCTYPE, html, head, body — the skeleton of every page.", "phase": 1, "order": 1, "estimated_minutes": 15},
                {"title": "Text Elements & Headings", "description": "h1-h6, p, span, strong, em — structuring readable content.", "phase": 1, "order": 2, "estimated_minutes": 15},
                {"title": "Links & Navigation", "description": "Anchor tags, href, target, nav element, skip links.", "phase": 1, "order": 3, "estimated_minutes": 20},
                {"title": "Images & Multimedia", "description": "img, figure, figcaption, video, audio, srcset for responsive images.", "phase": 1, "order": 4, "estimated_minutes": 20},
                {"title": "Lists & Tables", "description": "ul, ol, dl, table, thead, tbody — data display elements.", "phase": 1, "order": 5, "estimated_minutes": 15},
                {"title": "Semantic HTML5 Elements", "description": "header, main, article, section, aside, footer — why they matter.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "Forms & Input Types", "description": "form, input, select, textarea, validation attributes, fieldset.", "phase": 2, "order": 7, "estimated_minutes": 30},
                {"title": "HTML Accessibility Fundamentals", "description": "ARIA roles, labels, alt text — making the web usable for everyone.", "phase": 2, "order": 8, "estimated_minutes": 25},
                {"title": "Meta Tags & SEO Basics", "description": "title, description, Open Graph, structured data, robots.txt.", "phase": 3, "order": 9, "estimated_minutes": 20},
                {"title": "HTML Best Practices", "description": "Validation, performance (lazy loading), progressive enhancement.", "phase": 3, "order": 10, "estimated_minutes": 20},
            ],
        },

        # ── 1  CSS Fundamentals & Layout ──────────────────────────
        {
            "label": "CSS Fundamentals & Layout",
            "description": "Style and lay out web pages with CSS. Master selectors, the box model, Flexbox, Grid, and responsive design patterns.",
            "market_value": "Low-Med",
            "node_type": "core",
            "connections": [3],
            "project_prompt": "Recreate a popular website's landing page (Stripe, Linear, or Spotify) pixel-for-pixel using only HTML and CSS — fully responsive.",
            "resources": {
                "primary": [
                    {"title": "MDN CSS First Steps", "url": "https://developer.mozilla.org/en-US/docs/Learn/CSS/First_steps", "type": "docs"},
                    {"title": "CSS Grid Garden", "url": "https://cssgridgarden.com/", "type": "interactive"},
                ],
                "additional": [
                    {"title": "Flexbox Froggy", "url": "https://flexboxfroggy.com/", "type": "interactive"},
                    {"title": "Kevin Powell CSS YouTube", "url": "https://www.youtube.com/@KevinPowell", "type": "video"},
                    {"title": "CSS-Tricks Complete Guide to Flexbox", "url": "https://css-tricks.com/snippets/css/a-guide-to-flexbox/", "type": "docs"},
                    {"title": "CSS-Tricks Complete Guide to Grid", "url": "https://css-tricks.com/snippets/css/complete-guide-grid/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "CSS Selectors & Specificity", "description": "Element, class, id, combinators, pseudo-classes — and the cascade.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Box Model Deep Dive", "description": "Content, padding, border, margin, box-sizing.", "phase": 1, "order": 2, "estimated_minutes": 20},
                {"title": "Colors, Typography & Units", "description": "RGB, HSL, rem, em, vh/vw, font stacks, Google Fonts.", "phase": 1, "order": 3, "estimated_minutes": 20},
                {"title": "Display & Positioning", "description": "block, inline, inline-block, static, relative, absolute, fixed, sticky.", "phase": 1, "order": 4, "estimated_minutes": 25},
                {"title": "Flexbox Mastery", "description": "Flex container, items, axes, wrapping, alignment, ordering.", "phase": 2, "order": 5, "estimated_minutes": 30},
                {"title": "CSS Grid Mastery", "description": "Tracks, areas, auto-fit/auto-fill, template columns, gap.", "phase": 2, "order": 6, "estimated_minutes": 35},
                {"title": "Responsive Design & Media Queries", "description": "Mobile-first, breakpoints, fluid typography, clamp().", "phase": 2, "order": 7, "estimated_minutes": 30},
                {"title": "CSS Transitions & Animations", "description": "transition, @keyframes, transform, will-change, easing.", "phase": 3, "order": 8, "estimated_minutes": 25},
                {"title": "CSS Variables & Custom Properties", "description": "Theming, dark mode, design tokens with --custom-props.", "phase": 3, "order": 9, "estimated_minutes": 20},
                {"title": "Modern CSS Features", "description": "Container queries, nesting, :has(), subgrid, layers (@layer).", "phase": 3, "order": 10, "estimated_minutes": 25},
            ],
        },

        # ── 2  Git & Collaboration ────────────────────────────────
        {
            "label": "Git & Collaboration",
            "description": "Version control is non-negotiable. Learn Git for tracking changes, collaborating on teams, and contributing to open source.",
            "market_value": "Low-Med",
            "node_type": "core",
            "connections": [3],
            "project_prompt": "Create a GitHub repo with feature branches, meaningful commit messages, a PR workflow, issue templates, and a complete README.",
            "resources": {
                "primary": [
                    {"title": "Learn Git Branching (interactive)", "url": "https://learngitbranching.js.org/", "type": "interactive"},
                    {"title": "Git Official Docs", "url": "https://git-scm.com/doc", "type": "docs"},
                ],
                "additional": [
                    {"title": "GitHub Skills", "url": "https://skills.github.com/", "type": "interactive"},
                    {"title": "Fireship Git in 100 Seconds", "url": "https://www.youtube.com/watch?v=hwP7WQkmECE", "type": "video"},
                ],
            },
            "lessons": [
                {"title": "What is Version Control?", "description": "Why Git exists, snapshots vs diffs, distributed VCS.", "phase": 1, "order": 1, "estimated_minutes": 15},
                {"title": "Git Init, Add, Commit", "description": "Creating repos, staging area, writing good commit messages.", "phase": 1, "order": 2, "estimated_minutes": 20},
                {"title": "Branching & Merging", "description": "Feature branches, merge vs rebase, resolving conflicts.", "phase": 2, "order": 3, "estimated_minutes": 30},
                {"title": "GitHub & Remote Repos", "description": "Push, pull, clone, fork, and pull requests.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "Collaboration Workflows", "description": "Git Flow, trunk-based development, code review etiquette.", "phase": 3, "order": 5, "estimated_minutes": 25},
                {"title": "Advanced Git", "description": "Stash, cherry-pick, interactive rebase, bisect, git hooks.", "phase": 3, "order": 6, "estimated_minutes": 30},
            ],
        },

        # ── 3  JavaScript Deep Dive ───────────────────────────────
        {
            "label": "JavaScript Deep Dive",
            "description": "The engine of every web app. Master ES2024+ — from variables and functions to async patterns, closures, and the event loop.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [4, 5],
            "project_prompt": "Build a vanilla JS single-page app (no frameworks) that fetches data from a public API, implements client-side routing, and persists state to localStorage.",
            "resources": {
                "primary": [
                    {"title": "FreeCodeCamp JS Algorithms & Data Structures", "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/", "type": "interactive"},
                    {"title": "JavaScript.info", "url": "https://javascript.info/", "type": "docs"},
                ],
                "additional": [
                    {"title": "Eloquent JavaScript", "url": "https://eloquentjavascript.net/", "type": "docs"},
                    {"title": "MDN JavaScript Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", "type": "docs"},
                    {"title": "Traversy Media JS Crash Course", "url": "https://www.youtube.com/watch?v=hdI2bqOjy3c", "type": "video"},
                    {"title": "Fireship JS in 100 Seconds", "url": "https://www.youtube.com/watch?v=DHjqpvDnNGE", "type": "video"},
                ],
            },
            "lessons": [
                {"title": "Variables, Types & Coercion", "description": "let, const, primitives, typeof, loose vs strict equality.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Functions & Scope", "description": "Declarations, expressions, arrow functions, closures, hoisting.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "Arrays & Array Methods", "description": "map, filter, reduce, find, some, every, flat, destructuring.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "Objects & Prototypes", "description": "Object literals, this, prototype chain, classes, spread/rest.", "phase": 1, "order": 4, "estimated_minutes": 30},
                {"title": "DOM Manipulation", "description": "querySelector, createElement, events, delegation, MutationObserver.", "phase": 2, "order": 5, "estimated_minutes": 30},
                {"title": "The Event Loop", "description": "Call stack, task queue, microtasks, requestAnimationFrame.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "Promises & Async/Await", "description": "Promise chaining, error handling, Promise.all, async patterns.", "phase": 2, "order": 7, "estimated_minutes": 35},
                {"title": "Fetch API & HTTP", "description": "GET, POST, headers, JSON, error handling, AbortController.", "phase": 2, "order": 8, "estimated_minutes": 25},
                {"title": "ES Modules", "description": "import/export, dynamic imports, tree shaking, bundler basics.", "phase": 3, "order": 9, "estimated_minutes": 20},
                {"title": "Error Handling Patterns", "description": "try/catch, custom error classes, global handlers, debugging.", "phase": 3, "order": 10, "estimated_minutes": 20},
                {"title": "Modern JS Features", "description": "Optional chaining, nullish coalescing, structured clone, at().", "phase": 3, "order": 11, "estimated_minutes": 20},
                {"title": "Web Storage & Browser APIs", "description": "localStorage, sessionStorage, IndexedDB, Web Workers basics.", "phase": 3, "order": 12, "estimated_minutes": 25},
            ],
        },

        # ── 4  TypeScript Essentials ──────────────────────────────
        {
            "label": "TypeScript Essentials",
            "description": "Add type safety to JavaScript. TypeScript is now a requirement for most frontend roles — learn it early and use it everywhere.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [6],
            "project_prompt": "Convert a small JavaScript project (at least 10 files) to TypeScript. Add strict types, interfaces, generics, and achieve zero any types.",
            "resources": {
                "primary": [
                    {"title": "TypeScript Official Handbook", "url": "https://www.typescriptlang.org/docs/handbook/intro.html", "type": "docs"},
                    {"title": "Total TypeScript Beginners Tutorial", "url": "https://www.totaltypescript.com/tutorials/beginners-typescript", "type": "interactive"},
                ],
                "additional": [
                    {"title": "FreeCodeCamp TypeScript Course", "url": "https://www.youtube.com/watch?v=30LWjhZzg50", "type": "video"},
                    {"title": "TypeScript Deep Dive (book)", "url": "https://basarat.gitbook.io/typescript/", "type": "docs"},
                    {"title": "Matt Pocock YouTube", "url": "https://www.youtube.com/@mattpocockuk", "type": "video"},
                ],
            },
            "lessons": [
                {"title": "Why TypeScript?", "description": "Benefits of static typing, setup with tsc, tsconfig.json.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Basic Types & Type Annotations", "description": "string, number, boolean, arrays, tuples, enums, any vs unknown.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Interfaces & Type Aliases", "description": "Defining shapes, extending, intersecting, optional properties.", "phase": 1, "order": 3, "estimated_minutes": 25},
                {"title": "Functions & Generics", "description": "Typed parameters, return types, generic functions, constraints.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "Union & Narrowing", "description": "Union types, discriminated unions, type guards, typeof/instanceof.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "TypeScript with React", "description": "Typing props, state, events, refs, children, and custom hooks.", "phase": 2, "order": 6, "estimated_minutes": 30},
                {"title": "Utility Types", "description": "Partial, Required, Pick, Omit, Record, ReturnType, Parameters.", "phase": 3, "order": 7, "estimated_minutes": 25},
                {"title": "Advanced Patterns", "description": "Mapped types, conditional types, infer, template literal types.", "phase": 3, "order": 8, "estimated_minutes": 30},
            ],
        },

        # ── 5  React Fundamentals ─────────────────────────────────
        {
            "label": "React Fundamentals",
            "description": "The most in-demand UI library. Build modern, component-driven interfaces with React — from JSX basics to hooks and routing.",
            "market_value": "High",
            "node_type": "core",
            "connections": [6, 7],
            "project_prompt": "Build a multi-page React app with 3+ routes, global state, loading/error handling, and at least 8 reusable components.",
            "resources": {
                "primary": [
                    {"title": "React Official Docs (react.dev)", "url": "https://react.dev/learn", "type": "docs"},
                    {"title": "Scrimba Learn React", "url": "https://scrimba.com/learn/learnreact", "type": "interactive"},
                ],
                "additional": [
                    {"title": "FreeCodeCamp React Course", "url": "https://www.freecodecamp.org/learn/front-end-development-libraries/#react", "type": "interactive"},
                    {"title": "Jack Herrington YouTube", "url": "https://www.youtube.com/@jherr", "type": "video"},
                    {"title": "Theo Browne YouTube", "url": "https://www.youtube.com/@t3dotgg", "type": "video"},
                ],
            },
            "lessons": [
                {"title": "JSX & Component Basics", "description": "JSX syntax, functional components, rendering, fragments.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Props & Component Composition", "description": "Passing data, children, composition patterns, prop drilling.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "State with useState", "description": "State updates, re-renders, lifting state up, derived state.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "useEffect & Side Effects", "description": "Data fetching, subscriptions, cleanup, dependency arrays.", "phase": 1, "order": 4, "estimated_minutes": 30},
                {"title": "Event Handling & Forms", "description": "Controlled inputs, form submission, validation patterns.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "Conditional Rendering & Lists", "description": "Ternary, &&, rendering arrays, key prop, filtering.", "phase": 2, "order": 6, "estimated_minutes": 20},
                {"title": "React Router", "description": "Routes, Link, NavLink, params, nested routes, programmatic nav.", "phase": 2, "order": 7, "estimated_minutes": 30},
                {"title": "Context API & useReducer", "description": "Global state, provider pattern, dispatch actions, when to use.", "phase": 2, "order": 8, "estimated_minutes": 30},
                {"title": "Custom Hooks", "description": "Extracting reusable logic, hook composition, hook rules.", "phase": 3, "order": 9, "estimated_minutes": 25},
                {"title": "useRef & Imperative Handle", "description": "DOM refs, mutable refs, focusing inputs, scroll control.", "phase": 3, "order": 10, "estimated_minutes": 20},
                {"title": "Error Boundaries & Suspense", "description": "Catching render errors, lazy loading, code splitting.", "phase": 3, "order": 11, "estimated_minutes": 25},
            ],
        },

        # ── 6  State Management & Data Fetching ───────────────────
        {
            "label": "State Management & Data Fetching",
            "description": "Manage complex application state beyond useState. Learn Zustand, React Query, and patterns for server state vs client state.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [8, 9],
            "project_prompt": "Build a dashboard app with Zustand for UI state, React Query for server data, optimistic updates, and offline caching.",
            "resources": {
                "primary": [
                    {"title": "TanStack Query (React Query) Docs", "url": "https://tanstack.com/query/latest/docs/react/overview", "type": "docs"},
                    {"title": "Zustand GitHub", "url": "https://github.com/pmndrs/zustand", "type": "docs"},
                ],
                "additional": [
                    {"title": "Redux Toolkit Docs", "url": "https://redux-toolkit.js.org/introduction/getting-started", "type": "docs"},
                    {"title": "Jack Herrington State Management", "url": "https://www.youtube.com/watch?v=zpUMRsAO6-Y", "type": "video"},
                    {"title": "Theo — Stop Using Redux", "url": "https://www.youtube.com/watch?v=5-1LM2NySR0", "type": "video"},
                ],
            },
            "lessons": [
                {"title": "Client State vs Server State", "description": "Why they're different and why you need different tools.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Zustand Basics", "description": "Creating stores, selectors, actions, middleware, devtools.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "React Query Fundamentals", "description": "useQuery, useMutation, query keys, stale time, cache time.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "Pagination & Infinite Scroll", "description": "useInfiniteQuery, cursor pagination, virtual lists.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "Optimistic Updates", "description": "Optimistic mutations, rollback, query invalidation.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "Global State Patterns", "description": "Context vs Zustand vs Redux — when to use which.", "phase": 2, "order": 6, "estimated_minutes": 20},
                {"title": "Form State & Validation", "description": "React Hook Form, Zod validation, field-level errors.", "phase": 3, "order": 7, "estimated_minutes": 30},
                {"title": "Offline & Caching Strategies", "description": "Persisted queries, service workers, offline-first patterns.", "phase": 3, "order": 8, "estimated_minutes": 25},
            ],
        },

        # ── 7  CSS Architecture & Design Systems ──────────────────
        {
            "label": "CSS Architecture & Design Systems",
            "description": "Scale your styles. Learn Tailwind CSS, CSS Modules, styled-components, and how to build a consistent component library.",
            "market_value": "Med",
            "node_type": "core",
            "connections": [8, 9],
            "project_prompt": "Build a reusable component library (Button, Input, Card, Modal, Toast) with Tailwind + CSS variables, documented with Storybook.",
            "resources": {
                "primary": [
                    {"title": "Tailwind CSS Docs", "url": "https://tailwindcss.com/docs", "type": "docs"},
                    {"title": "Storybook Getting Started", "url": "https://storybook.js.org/docs/react/get-started", "type": "docs"},
                ],
                "additional": [
                    {"title": "CSS Modules Guide", "url": "https://github.com/css-modules/css-modules", "type": "docs"},
                    {"title": "Tailwind Labs YouTube", "url": "https://www.youtube.com/@TailwindLabs", "type": "video"},
                    {"title": "Josh Comeau CSS-for-JS", "url": "https://www.joshwcomeau.com/css/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "CSS Architecture Problems", "description": "Specificity wars, global scope, naming collisions — why we need solutions.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "BEM & Naming Conventions", "description": "Block-Element-Modifier, consistent class naming, folder structure.", "phase": 1, "order": 2, "estimated_minutes": 20},
                {"title": "CSS Modules", "description": "Scoped styles, composition, integration with Vite/Webpack.", "phase": 1, "order": 3, "estimated_minutes": 20},
                {"title": "Tailwind CSS Fundamentals", "description": "Utility-first, responsive prefixes, config, @apply.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "Tailwind Advanced Patterns", "description": "Custom plugins, arbitrary values, dark mode, animation utilities.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "CSS-in-JS Overview", "description": "styled-components, Emotion — trade-offs vs utility-first.", "phase": 2, "order": 6, "estimated_minutes": 20},
                {"title": "Design Tokens & Theming", "description": "CSS variables, design token files, consistent spacing/color scales.", "phase": 3, "order": 7, "estimated_minutes": 25},
                {"title": "Building a Component Library", "description": "Storybook setup, variant props, accessibility, documentation.", "phase": 3, "order": 8, "estimated_minutes": 35},
            ],
        },

        # ── 8  Testing Frontend Applications ──────────────────────
        {
            "label": "Testing Frontend Applications",
            "description": "Ship with confidence. Unit test components, integration test pages, and end-to-end test user flows.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [10],
            "project_prompt": "Write a full test suite for a React app: 15+ unit tests, 5 integration tests, and 2 E2E tests with Playwright. Achieve 80%+ coverage.",
            "resources": {
                "primary": [
                    {"title": "Vitest Docs", "url": "https://vitest.dev/guide/", "type": "docs"},
                    {"title": "Testing Library Docs", "url": "https://testing-library.com/docs/react-testing-library/intro/", "type": "docs"},
                ],
                "additional": [
                    {"title": "Playwright Docs", "url": "https://playwright.dev/docs/intro", "type": "docs"},
                    {"title": "Kent C. Dodds Testing Trophy", "url": "https://kentcdodds.com/blog/write-tests", "type": "docs"},
                    {"title": "Fireship Testing Overview", "url": "https://www.youtube.com/watch?v=Jv2uxzhPFl4", "type": "video"},
                ],
            },
            "lessons": [
                {"title": "Why Test Frontend Code?", "description": "Testing trophy, confidence, regression prevention.", "phase": 1, "order": 1, "estimated_minutes": 15},
                {"title": "Vitest Setup & Basics", "description": "Installing, configuring, writing first assertions, matchers.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Testing React Components", "description": "render, screen, fireEvent, userEvent, queries.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "Mocking & Spying", "description": "vi.mock, vi.fn, mocking API calls, module mocks.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "Integration Testing Patterns", "description": "Testing pages, router integration, context providers.", "phase": 2, "order": 5, "estimated_minutes": 30},
                {"title": "E2E Testing with Playwright", "description": "Browser automation, selectors, assertions, screenshots.", "phase": 2, "order": 6, "estimated_minutes": 35},
                {"title": "Accessibility Testing", "description": "axe-core, jest-axe, automated a11y checks in CI.", "phase": 3, "order": 7, "estimated_minutes": 20},
                {"title": "CI Integration & Coverage", "description": "GitHub Actions, coverage reports, branch protection rules.", "phase": 3, "order": 8, "estimated_minutes": 25},
            ],
        },

        # ── 9  Performance & Core Web Vitals ──────────────────────
        {
            "label": "Performance & Core Web Vitals",
            "description": "Fast sites win. Learn to measure, diagnose, and fix performance issues — LCP, FID, CLS, bundle size, and rendering bottlenecks.",
            "market_value": "High",
            "node_type": "core",
            "connections": [10],
            "project_prompt": "Audit a React app with Lighthouse, fix all performance issues, achieve green scores, and document before/after metrics.",
            "resources": {
                "primary": [
                    {"title": "web.dev Performance", "url": "https://web.dev/performance/", "type": "docs"},
                    {"title": "Chrome DevTools Performance Tab", "url": "https://developer.chrome.com/docs/devtools/performance/", "type": "docs"},
                ],
                "additional": [
                    {"title": "Lighthouse Scoring Guide", "url": "https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/", "type": "docs"},
                    {"title": "Fireship Perf Tips", "url": "https://www.youtube.com/watch?v=0fONene3OIA", "type": "video"},
                    {"title": "Bundle Analyzer (webpack/vite)", "url": "https://github.com/btd/rollup-plugin-visualizer", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Core Web Vitals Explained", "description": "LCP, INP, CLS — what Google measures and why it matters.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Measuring Performance", "description": "Lighthouse, WebPageTest, DevTools Performance panel, RUM.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Image Optimization", "description": "WebP/AVIF, lazy loading, srcset, CDN delivery, aspect ratios.", "phase": 1, "order": 3, "estimated_minutes": 25},
                {"title": "Code Splitting & Lazy Loading", "description": "React.lazy, dynamic imports, route-based splitting.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "Bundle Size Optimization", "description": "Tree shaking, analyzing bundles, replacing heavy libraries.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "Rendering Performance", "description": "Virtual DOM, avoiding re-renders, React Profiler, memo.", "phase": 2, "order": 6, "estimated_minutes": 30},
                {"title": "Caching & CDN Strategies", "description": "HTTP cache headers, service workers, CDN edge caching.", "phase": 3, "order": 7, "estimated_minutes": 25},
                {"title": "Font & CSS Performance", "description": "Font loading strategies, critical CSS, removing unused styles.", "phase": 3, "order": 8, "estimated_minutes": 20},
                {"title": "Prefetching & Preloading", "description": "preload, prefetch, preconnect, speculative loading.", "phase": 3, "order": 9, "estimated_minutes": 20},
            ],
        },

        # ── 10  Accessibility (a11y) Best Practices ───────────────
        {
            "label": "Accessibility (a11y) Best Practices",
            "description": "The web is for everyone. Learn WCAG, ARIA, keyboard navigation, screen readers, and how to build inclusive interfaces.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [11, 12],
            "project_prompt": "Audit an existing web app for WCAG 2.1 AA compliance. Fix at least 10 issues and write a report with before/after screenshots.",
            "resources": {
                "primary": [
                    {"title": "MDN Accessibility Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/Accessibility", "type": "docs"},
                    {"title": "WebAIM WCAG Checklist", "url": "https://webaim.org/standards/wcag/checklist", "type": "docs"},
                ],
                "additional": [
                    {"title": "A11y Project Checklist", "url": "https://www.a11yproject.com/checklist/", "type": "docs"},
                    {"title": "Deque University (free)", "url": "https://dequeuniversity.com/", "type": "interactive"},
                    {"title": "Google Accessibility Course", "url": "https://web.dev/learn/accessibility/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Why Accessibility Matters", "description": "Legal requirements, business case, the disability spectrum.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "WCAG 2.1 Overview", "description": "Perceivable, Operable, Understandable, Robust — the four principles.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Semantic HTML for a11y", "description": "Native elements vs ARIA, landmark roles, headings hierarchy.", "phase": 1, "order": 3, "estimated_minutes": 25},
                {"title": "Keyboard Navigation", "description": "Focus management, tab order, skip links, focus trapping in modals.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "ARIA Roles & Properties", "description": "aria-label, aria-live, aria-expanded, role=dialog, role=alert.", "phase": 2, "order": 5, "estimated_minutes": 30},
                {"title": "Screen Reader Testing", "description": "NVDA, VoiceOver, JAWS basics — testing like a real user.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "Color Contrast & Visual Design", "description": "Contrast ratios, color blindness, focus indicators, motion.", "phase": 3, "order": 7, "estimated_minutes": 20},
                {"title": "Automated a11y Testing", "description": "axe-core, Lighthouse a11y audit, CI integration, linting.", "phase": 3, "order": 8, "estimated_minutes": 25},
            ],
        },

        # ── 11  Build Tools & Dev Workflow ────────────────────────
        {
            "label": "Build Tools & Dev Workflow",
            "description": "Understand the tools beneath your framework: Vite, ESLint, Prettier, npm scripts, and the modern frontend build pipeline.",
            "market_value": "Med",
            "node_type": "core",
            "connections": [12, 13],
            "project_prompt": "Set up a production React template from scratch: Vite, TypeScript, ESLint, Prettier, Husky pre-commit hooks, path aliases, and env config.",
            "resources": {
                "primary": [
                    {"title": "Vite Official Docs", "url": "https://vitejs.dev/guide/", "type": "docs"},
                    {"title": "ESLint Getting Started", "url": "https://eslint.org/docs/latest/use/getting-started", "type": "docs"},
                ],
                "additional": [
                    {"title": "Fireship Vite in 100 Seconds", "url": "https://www.youtube.com/watch?v=KCrXgy8qtjM", "type": "video"},
                    {"title": "Prettier Docs", "url": "https://prettier.io/docs/en/index.html", "type": "docs"},
                    {"title": "pnpm Docs", "url": "https://pnpm.io/motivation", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "How Bundlers Work", "description": "Modules → bundle, tree shaking, code splitting, HMR.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Vite Configuration", "description": "vite.config, plugins, aliases, env variables, proxy.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "ESLint & Code Quality", "description": "Rules, plugins, flat config, fixing auto-fixable issues.", "phase": 1, "order": 3, "estimated_minutes": 20},
                {"title": "Prettier & Formatting", "description": "Setup, editor integration, ESLint integration, CI checks.", "phase": 2, "order": 4, "estimated_minutes": 15},
                {"title": "Package Managers Deep Dive", "description": "npm vs pnpm vs yarn, lockfiles, workspaces, versioning.", "phase": 2, "order": 5, "estimated_minutes": 20},
                {"title": "Pre-commit Hooks", "description": "Husky, lint-staged, commitlint — enforcing quality at commit.", "phase": 2, "order": 6, "estimated_minutes": 20},
                {"title": "Environment Variables", "description": "import.meta.env, .env files, build-time vs runtime config.", "phase": 3, "order": 7, "estimated_minutes": 15},
                {"title": "Monorepos & Workspaces", "description": "Turborepo, Nx basics, sharing code between packages.", "phase": 3, "order": 8, "estimated_minutes": 25},
            ],
        },

        # ── 12  Portfolio Capstone Project ────────────────────────
        {
            "label": "Portfolio Capstone Project",
            "description": "Put it all together. Design, build, test, and deploy a polished frontend application that showcases every skill you've learned.",
            "market_value": "High",
            "node_type": "core",
            "connections": [],
            "project_prompt": "Build and deploy a production-quality React app with TypeScript, Tailwind, React Query, full test suite, CI/CD, and a Lighthouse score above 90 in every category.",
            "resources": {
                "primary": [
                    {"title": "Frontend Mentor Challenges", "url": "https://www.frontendmentor.io/", "type": "interactive"},
                    {"title": "Project Ideas (GitHub)", "url": "https://github.com/florinpop17/app-ideas", "type": "docs"},
                ],
                "additional": [
                    {"title": "How to Build a Great Portfolio (YouTube)", "url": "https://www.youtube.com/watch?v=oCD1GHRysn0", "type": "video"},
                    {"title": "README Template", "url": "https://github.com/othneildrew/Best-README-Template", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Project Planning", "description": "Choosing an idea, user stories, wireframing, tech stack decisions.", "phase": 1, "order": 1, "estimated_minutes": 35},
                {"title": "Design System Setup", "description": "Color palette, typography, spacing scale, component inventory.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "Core UI Implementation", "description": "Build layouts, pages, and navigation with responsive design.", "phase": 2, "order": 3, "estimated_minutes": 60},
                {"title": "Data Layer & State", "description": "API integration, state management, loading/error states.", "phase": 2, "order": 4, "estimated_minutes": 45},
                {"title": "Testing & QA", "description": "Write tests, cross-browser test, performance audit, a11y audit.", "phase": 3, "order": 5, "estimated_minutes": 40},
                {"title": "Deploy & Document", "description": "Deploy to Vercel/Netlify, write README, record a demo video.", "phase": 3, "order": 6, "estimated_minutes": 35},
            ],
        },

        # ── 13  Communication & Career Skills ─────────────────────
        {
            "label": "Communication & Career Skills",
            "description": "Stand out in the job market. Learn to communicate technical ideas, write great READMEs, contribute to open source, and ace interviews.",
            "market_value": "Med-High",
            "node_type": "soft_skill",
            "connections": [12],
            "project_prompt": "Contribute to an open-source project (at least 1 merged PR), write a technical blog post about a concept you learned, and record a 3-minute project walkthrough.",
            "resources": {
                "primary": [
                    {"title": "Technical Writing (Google)", "url": "https://developers.google.com/tech-writing", "type": "docs"},
                    {"title": "How to Contribute to Open Source", "url": "https://opensource.guide/how-to-contribute/", "type": "docs"},
                ],
                "additional": [
                    {"title": "STAR Method for Interviews", "url": "https://www.themuse.com/advice/star-interview-method", "type": "docs"},
                    {"title": "Dev.to Community", "url": "https://dev.to/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Explaining Technical Concepts", "description": "Translate code into plain English for non-technical audiences.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Writing Great READMEs", "description": "Structure, badges, screenshots, installation steps, contributing guide.", "phase": 1, "order": 2, "estimated_minutes": 20},
                {"title": "Contributing to Open Source", "description": "Finding issues, forking, making PRs, community etiquette.", "phase": 2, "order": 3, "estimated_minutes": 30},
                {"title": "Technical Blogging", "description": "Writing tutorials, sharing learnings, building your brand.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "Interview Preparation", "description": "STAR method, behavioral questions, take-home challenges, live coding.", "phase": 3, "order": 5, "estimated_minutes": 30},
                {"title": "LinkedIn & Portfolio Optimization", "description": "Professional summary, project showcases, networking strategies.", "phase": 3, "order": 6, "estimated_minutes": 20},
                {"title": "Salary Negotiation", "description": "Researching market rates, negotiation scripts, evaluating offers.", "phase": 3, "order": 7, "estimated_minutes": 20},
            ],
        },
    ],
}
