"""
Full-Stack Developer — Career Path Catalog
===========================================
A complete path from HTML to deployment. Build real apps,
master both frontend and backend, and ship production code.

Modules: 12 (hard skills + soft skills + capstone)
"""

FULL_STACK_DEVELOPER = {
    "role": "fullstack",
    "title": "Full-Stack Developer",
    "description": "A complete path from HTML to deployment. Build real apps, master both frontend and backend, and ship production code.",
    "modules": [
        # ── 0  HTML & CSS Foundations ──────────────────────────────
        {
            "label": "HTML & CSS Foundations",
            "description": "Semantic HTML5, modern CSS (Flexbox, Grid), responsive design, and accessibility basics. The building blocks of every web page.",
            "market_value": "Low",
            "node_type": "core",
            "connections": [1, 2],
            "project_prompt": "Build a responsive personal portfolio site with at least 3 sections, mobile-first layout, and ARIA landmarks.",
            "resources": {
                "primary": [
                    {"title": "FreeCodeCamp Responsive Web Design", "url": "https://www.freecodecamp.org/learn/2022/responsive-web-design/", "type": "interactive"},
                    {"title": "MDN HTML Basics", "url": "https://developer.mozilla.org/en-US/docs/Learn/HTML", "type": "docs"},
                ],
                "additional": [
                    {"title": "CSS Grid Garden", "url": "https://cssgridgarden.com/", "type": "interactive"},
                    {"title": "Flexbox Froggy", "url": "https://flexboxfroggy.com/", "type": "interactive"},
                    {"title": "Kevin Powell CSS YouTube", "url": "https://www.youtube.com/@KevinPowell", "type": "video"},
                ],
            },
            "lessons": [
                {"title": "What is HTML?", "description": "Elements, tags, attributes, and the document tree.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Semantic HTML5", "description": "header, nav, main, article, aside, footer — and why they matter.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Forms & Inputs", "description": "Building accessible forms with validation attributes.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "CSS Selectors & Specificity", "description": "How the cascade works, class vs id, combinators.", "phase": 1, "order": 4, "estimated_minutes": 25},
                {"title": "Box Model & Layout", "description": "Margin, padding, border, display, and positioning.", "phase": 2, "order": 5, "estimated_minutes": 30},
                {"title": "Flexbox Deep Dive", "description": "One-dimensional layout: axes, wrapping, alignment.", "phase": 2, "order": 6, "estimated_minutes": 30},
                {"title": "CSS Grid", "description": "Two-dimensional layout: tracks, areas, and responsive grids.", "phase": 2, "order": 7, "estimated_minutes": 35},
                {"title": "Responsive Design", "description": "Media queries, mobile-first, fluid typography, container queries.", "phase": 3, "order": 8, "estimated_minutes": 30},
                {"title": "Accessibility (a11y)", "description": "ARIA, screen readers, color contrast, keyboard navigation.", "phase": 3, "order": 9, "estimated_minutes": 25},
                {"title": "CSS Variables & Theming", "description": "Custom properties, dark mode toggle, design tokens.", "phase": 3, "order": 10, "estimated_minutes": 25},
            ],
        },

        # ── 1  JavaScript Essentials ──────────────────────────────
        {
            "label": "JavaScript Essentials",
            "description": "Modern JavaScript (ES2020+): variables, functions, DOM, async/await, error handling, and modules. The engine of interactivity.",
            "market_value": "Med",
            "node_type": "core",
            "connections": [3, 4],
            "project_prompt": "Build an interactive data dashboard that fetches a public API, supports filtering, and handles loading/error states.",
            "resources": {
                "primary": [
                    {"title": "FreeCodeCamp JavaScript Algorithms", "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/", "type": "interactive"},
                    {"title": "JavaScript.info", "url": "https://javascript.info/", "type": "docs"},
                ],
                "additional": [
                    {"title": "MDN JavaScript Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", "type": "docs"},
                    {"title": "Traversy Media JS Crash Course", "url": "https://www.youtube.com/watch?v=hdI2bqOjy3c", "type": "video"},
                    {"title": "Eloquent JavaScript", "url": "https://eloquentjavascript.net/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Variables & Types", "description": "let, const, strings, numbers, booleans, null, undefined.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Functions & Scope", "description": "Declarations, expressions, arrow functions, closures.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "Arrays & Objects", "description": "map, filter, reduce, destructuring, spread operator.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "DOM Manipulation", "description": "querySelector, events, creating/removing elements.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "Async JavaScript", "description": "Callbacks, promises, async/await, fetch API.", "phase": 2, "order": 5, "estimated_minutes": 35},
                {"title": "Error Handling", "description": "try/catch, custom errors, debugging techniques.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "ES Modules", "description": "import/export, dynamic imports, module patterns.", "phase": 3, "order": 7, "estimated_minutes": 20},
                {"title": "Modern JS Patterns", "description": "Optional chaining, nullish coalescing, template literals.", "phase": 3, "order": 8, "estimated_minutes": 25},
            ],
        },

        # ── 2  Git & Version Control ──────────────────────────────
        {
            "label": "Git & Version Control",
            "description": "Git fundamentals, branching, merging, GitHub workflows, and collaboration patterns every developer must know.",
            "market_value": "Low-Med",
            "node_type": "core",
            "connections": [1],
            "project_prompt": "Create a GitHub repo with at least 3 branches, meaningful commits, a PR workflow, and a complete README.",
            "resources": {
                "primary": [
                    {"title": "Git Official Docs", "url": "https://git-scm.com/doc", "type": "docs"},
                    {"title": "Learn Git Branching", "url": "https://learngitbranching.js.org/", "type": "interactive"},
                ],
                "additional": [
                    {"title": "GitHub Skills", "url": "https://skills.github.com/", "type": "interactive"},
                    {"title": "Fireship Git in 100 Seconds", "url": "https://www.youtube.com/watch?v=hwP7WQkmECE", "type": "video"},
                ],
            },
            "lessons": [
                {"title": "What is Version Control?", "description": "Why git exists and how it tracks changes.", "phase": 1, "order": 1, "estimated_minutes": 15},
                {"title": "Init, Add, Commit", "description": "Starting repos, staging, and committing changes.", "phase": 1, "order": 2, "estimated_minutes": 20},
                {"title": "Branches & Merging", "description": "Feature branches, merge vs rebase, conflict resolution.", "phase": 2, "order": 3, "estimated_minutes": 30},
                {"title": "GitHub & Remote Repos", "description": "Push, pull, clone, fork, and pull requests.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "Collaboration Workflows", "description": "Git Flow, trunk-based development, code reviews.", "phase": 3, "order": 5, "estimated_minutes": 25},
                {"title": "Advanced Git", "description": "Stash, cherry-pick, interactive rebase, bisect.", "phase": 3, "order": 6, "estimated_minutes": 30},
            ],
        },

        # ── 3  React & Component Architecture ─────────────────────
        {
            "label": "React & Component Architecture",
            "description": "Build modern UIs with React: components, hooks, state management, and routing. The most in-demand frontend framework.",
            "market_value": "High",
            "node_type": "core",
            "connections": [5, 6],
            "project_prompt": "Build a multi-page React app with routing, global state, API integration, and at least 5 reusable components.",
            "resources": {
                "primary": [
                    {"title": "React Official Docs", "url": "https://react.dev/learn", "type": "docs"},
                    {"title": "Scrimba Learn React", "url": "https://scrimba.com/learn/learnreact", "type": "interactive"},
                ],
                "additional": [
                    {"title": "FreeCodeCamp React Course", "url": "https://www.freecodecamp.org/learn/front-end-development-libraries/#react", "type": "interactive"},
                    {"title": "Jack Herrington React YouTube", "url": "https://www.youtube.com/@jherr", "type": "video"},
                    {"title": "React Patterns", "url": "https://reactpatterns.com/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "JSX & Components", "description": "Writing JSX, functional components, props.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "State with useState", "description": "Managing component state, re-renders, lifting state up.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "Effects & Lifecycle", "description": "useEffect for side effects, cleanup, dependency arrays.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "Event Handling & Forms", "description": "Controlled inputs, form submission, validation.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "React Router", "description": "Client-side routing, nested routes, params, navigation.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "Context & Global State", "description": "useContext, reducer pattern, when to use state libraries.", "phase": 2, "order": 6, "estimated_minutes": 30},
                {"title": "Custom Hooks", "description": "Extracting reusable logic into custom hooks.", "phase": 3, "order": 7, "estimated_minutes": 25},
                {"title": "Performance & Memoization", "description": "React.memo, useMemo, useCallback, profiling.", "phase": 3, "order": 8, "estimated_minutes": 30},
                {"title": "Fetching Data Patterns", "description": "SWR, React Query, suspense, loading/error boundaries.", "phase": 3, "order": 9, "estimated_minutes": 30},
            ],
        },

        # ── 4  Node.js & Express APIs ─────────────────────────────
        {
            "label": "Node.js & Express APIs",
            "description": "Server-side JavaScript: REST APIs, middleware, authentication, and file handling with Node.js and Express.",
            "market_value": "High",
            "node_type": "core",
            "connections": [5, 6],
            "project_prompt": "Build a REST API with user auth (JWT), CRUD endpoints, input validation, and error handling middleware.",
            "resources": {
                "primary": [
                    {"title": "Node.js Official Docs", "url": "https://nodejs.org/en/docs/guides", "type": "docs"},
                    {"title": "FreeCodeCamp Backend APIs", "url": "https://www.freecodecamp.org/learn/back-end-development-and-apis/", "type": "interactive"},
                ],
                "additional": [
                    {"title": "Express.js Guide", "url": "https://expressjs.com/en/guide/routing.html", "type": "docs"},
                    {"title": "Traversy Media Node Crash Course", "url": "https://www.youtube.com/watch?v=fBNz5xF-Kx4", "type": "video"},
                    {"title": "REST API Design Best Practices", "url": "https://restfulapi.net/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Node.js Basics", "description": "Runtime, modules, npm, package.json.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Express Setup & Routing", "description": "Creating a server, routes, request/response.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Middleware", "description": "Custom middleware, error handling, cors, logging.", "phase": 1, "order": 3, "estimated_minutes": 25},
                {"title": "REST API Design", "description": "CRUD operations, HTTP methods, status codes.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "Authentication & JWT", "description": "Signup/login, hashing passwords, token-based auth.", "phase": 2, "order": 5, "estimated_minutes": 35},
                {"title": "Input Validation", "description": "Sanitizing data, validation libraries, security basics.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "File Uploads & Streams", "description": "Multer, streaming data, handling large files.", "phase": 3, "order": 7, "estimated_minutes": 25},
                {"title": "Error Handling Patterns", "description": "Centralized error handler, async wrappers, logging.", "phase": 3, "order": 8, "estimated_minutes": 25},
            ],
        },

        # ── 5  Databases & Data Modeling ──────────────────────────
        {
            "label": "Databases & Data Modeling",
            "description": "SQL and NoSQL fundamentals. Design schemas, write queries, and understand when to use PostgreSQL vs MongoDB.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [7],
            "project_prompt": "Design a database schema for a social app (users, posts, comments), implement it in PostgreSQL, and write 10 queries.",
            "resources": {
                "primary": [
                    {"title": "SQLBolt Interactive SQL", "url": "https://sqlbolt.com/", "type": "interactive"},
                    {"title": "PostgreSQL Tutorial", "url": "https://www.postgresqltutorial.com/", "type": "docs"},
                ],
                "additional": [
                    {"title": "MongoDB University", "url": "https://university.mongodb.com/", "type": "interactive"},
                    {"title": "Prisma Data Modeling Guide", "url": "https://www.prisma.io/docs/orm/prisma-schema/data-model", "type": "docs"},
                    {"title": "Database Design Course (FCC)", "url": "https://www.youtube.com/watch?v=ztHopE5Wnpc", "type": "video"},
                ],
            },
            "lessons": [
                {"title": "Relational Databases Intro", "description": "Tables, rows, columns, primary keys, relationships.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "SQL Basics", "description": "SELECT, INSERT, UPDATE, DELETE, WHERE, ORDER BY.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "JOINs & Relationships", "description": "INNER, LEFT, RIGHT joins, one-to-many, many-to-many.", "phase": 2, "order": 3, "estimated_minutes": 30},
                {"title": "Schema Design", "description": "Normalization, indexes, constraints, migrations.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "NoSQL Concepts", "description": "Document stores, when to choose NoSQL vs SQL.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "ORMs & Query Builders", "description": "Prisma, Sequelize, or Django ORM patterns.", "phase": 3, "order": 6, "estimated_minutes": 30},
                {"title": "Transactions & Performance", "description": "ACID, connection pooling, query optimization.", "phase": 3, "order": 7, "estimated_minutes": 30},
            ],
        },

        # ── 6  Testing & Quality ──────────────────────────────────
        {
            "label": "Testing & Quality",
            "description": "Write tests that catch bugs before users do. Unit, integration, and end-to-end testing for frontend and backend.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [7],
            "project_prompt": "Add a comprehensive test suite to one of your previous projects: 10+ unit tests, 3 integration tests, and 1 E2E test.",
            "resources": {
                "primary": [
                    {"title": "Jest Official Docs", "url": "https://jestjs.io/docs/getting-started", "type": "docs"},
                    {"title": "Testing Library Docs", "url": "https://testing-library.com/docs/react-testing-library/intro/", "type": "docs"},
                ],
                "additional": [
                    {"title": "Playwright E2E Testing", "url": "https://playwright.dev/docs/intro", "type": "docs"},
                    {"title": "TDD Tutorial (Fireship)", "url": "https://www.youtube.com/watch?v=Jv2uxzhPFl4", "type": "video"},
                ],
            },
            "lessons": [
                {"title": "Why Test?", "description": "Test pyramid, cost of bugs, TDD vs BDD.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Unit Testing with Jest", "description": "Writing assertions, matchers, mocking.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "Testing React Components", "description": "render, fireEvent, screen queries, user-event.", "phase": 2, "order": 3, "estimated_minutes": 30},
                {"title": "API & Integration Tests", "description": "Supertest, testing routes, database fixtures.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "E2E Testing", "description": "Playwright or Cypress for full user-flow tests.", "phase": 3, "order": 5, "estimated_minutes": 35},
                {"title": "CI Testing Pipeline", "description": "Running tests in GitHub Actions, coverage reports.", "phase": 3, "order": 6, "estimated_minutes": 25},
            ],
        },

        # ── 7  Deployment & DevOps Basics ─────────────────────────
        {
            "label": "Deployment & DevOps Basics",
            "description": "Ship your code to production. Docker basics, CI/CD, environment variables, and hosting on modern platforms.",
            "market_value": "High",
            "node_type": "core",
            "connections": [8, 9],
            "project_prompt": "Dockerize a full-stack app, set up a CI/CD pipeline (GitHub Actions), and deploy to a free host with environment configs.",
            "resources": {
                "primary": [
                    {"title": "Docker Getting Started", "url": "https://docs.docker.com/get-started/", "type": "docs"},
                    {"title": "GitHub Actions Docs", "url": "https://docs.github.com/en/actions/quickstart", "type": "docs"},
                ],
                "additional": [
                    {"title": "Render Deploy Guide", "url": "https://docs.render.com/", "type": "docs"},
                    {"title": "Fireship Docker in 100s", "url": "https://www.youtube.com/watch?v=Gjnup-PuquQ", "type": "video"},
                    {"title": "Vercel Deployment", "url": "https://vercel.com/docs", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Hosting Options Overview", "description": "PaaS vs IaaS, free tiers, choosing a provider.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Environment Variables", "description": "Secrets management, .env files, config patterns.", "phase": 1, "order": 2, "estimated_minutes": 20},
                {"title": "Docker Basics", "description": "Images, containers, Dockerfile, docker-compose.", "phase": 2, "order": 3, "estimated_minutes": 35},
                {"title": "CI/CD Pipelines", "description": "GitHub Actions: test, build, deploy on push.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "DNS & Domains", "description": "Configuring custom domains, SSL certificates.", "phase": 3, "order": 5, "estimated_minutes": 20},
                {"title": "Monitoring & Logging", "description": "Health checks, error tracking, uptime monitoring.", "phase": 3, "order": 6, "estimated_minutes": 25},
            ],
        },

        # ── 8  System Design Fundamentals ─────────────────────────
        {
            "label": "System Design Fundamentals",
            "description": "Understand how large-scale systems work: load balancers, caching, CDNs, microservices, and message queues.",
            "market_value": "High",
            "node_type": "core",
            "connections": [10, 11],
            "project_prompt": "Draw a system design diagram for a URL shortener (like bit.ly) and write a doc explaining your choices for database, caching, and scaling.",
            "resources": {
                "primary": [
                    {"title": "System Design Primer (GitHub)", "url": "https://github.com/donnemartin/system-design-primer", "type": "docs"},
                    {"title": "ByteByteGo YouTube", "url": "https://www.youtube.com/@ByteByteGo", "type": "video"},
                ],
                "additional": [
                    {"title": "Designing Data-Intensive Applications (summary)", "url": "https://www.youtube.com/watch?v=PdtlXdse7pw", "type": "video"},
                    {"title": "High Scalability Blog", "url": "http://highscalability.com/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Client-Server Architecture", "description": "How the web works: DNS, HTTP, TCP/IP, request lifecycle.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Load Balancing", "description": "Round-robin, least connections, sticky sessions, reverse proxies.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Caching Strategies", "description": "CDN, Redis, browser cache, cache invalidation patterns.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "Database Scaling", "description": "Read replicas, sharding, partitioning, connection pooling.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "Message Queues & Async", "description": "RabbitMQ, Redis queues, Celery — decoupling services.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "Microservices vs Monolith", "description": "When to split, API gateways, service communication.", "phase": 2, "order": 6, "estimated_minutes": 30},
                {"title": "API Rate Limiting & Throttling", "description": "Token bucket, sliding window, protecting your API.", "phase": 3, "order": 7, "estimated_minutes": 20},
                {"title": "Designing for Failure", "description": "Circuit breakers, retries, graceful degradation, health checks.", "phase": 3, "order": 8, "estimated_minutes": 25},
            ],
        },

        # ── 9  Security & Authentication ──────────────────────────
        {
            "label": "Security & Authentication",
            "description": "Protect your apps and users. OWASP top 10, HTTPS, CORS, JWT best practices, OAuth, and common vulnerabilities.",
            "market_value": "High",
            "node_type": "core",
            "connections": [10, 11],
            "project_prompt": "Audit one of your previous projects for OWASP top-10 vulnerabilities. Fix at least 5 issues and document your findings.",
            "resources": {
                "primary": [
                    {"title": "OWASP Top 10", "url": "https://owasp.org/www-project-top-ten/", "type": "docs"},
                    {"title": "PortSwigger Web Security Academy", "url": "https://portswigger.net/web-security", "type": "interactive"},
                ],
                "additional": [
                    {"title": "Auth0 Identity Fundamentals", "url": "https://auth0.com/docs/get-started/identity-fundamentals", "type": "docs"},
                    {"title": "Fireship Auth Explained", "url": "https://www.youtube.com/watch?v=rT8cd7Yw5yI", "type": "video"},
                ],
            },
            "lessons": [
                {"title": "HTTPS & TLS", "description": "How encryption works, certificates, HSTS.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Authentication Patterns", "description": "Session vs token, JWT structure, refresh tokens.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "OAuth 2.0 & OpenID Connect", "description": "Authorization code flow, social login, scopes.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "CORS & CSRF", "description": "Cross-origin requests, CSRF tokens, SameSite cookies.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "XSS & Injection Attacks", "description": "Sanitizing input, CSP headers, SQL injection prevention.", "phase": 2, "order": 5, "estimated_minutes": 30},
                {"title": "Password Security", "description": "Hashing (bcrypt/argon2), salting, password policies.", "phase": 2, "order": 6, "estimated_minutes": 20},
                {"title": "Security Headers & CSP", "description": "Helmet.js, Content-Security-Policy, X-Frame-Options.", "phase": 3, "order": 7, "estimated_minutes": 20},
                {"title": "Security Auditing", "description": "npm audit, Snyk, dependency scanning, pen-testing basics.", "phase": 3, "order": 8, "estimated_minutes": 25},
            ],
        },

        # ── 10  Full-Stack Capstone Project ───────────────────────
        {
            "label": "Full-Stack Capstone Project",
            "description": "Put it all together: design, build, test, and deploy a complete full-stack application from scratch. This is your portfolio centerpiece.",
            "market_value": "High",
            "node_type": "core",
            "connections": [],
            "project_prompt": "Build and deploy a production-quality full-stack SaaS app with auth, database, API, React frontend, tests, and CI/CD.",
            "resources": {
                "primary": [
                    {"title": "Project Ideas (GitHub)", "url": "https://github.com/florinpop17/app-ideas", "type": "docs"},
                    {"title": "System Design Primer", "url": "https://github.com/donnemartin/system-design-primer", "type": "docs"},
                ],
                "additional": [
                    {"title": "How to Structure Projects", "url": "https://www.youtube.com/watch?v=Yw7yWHigGKI", "type": "video"},
                    {"title": "README Template", "url": "https://github.com/othneildrew/Best-README-Template", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Planning & Requirements", "description": "User stories, wireframes, tech stack decisions.", "phase": 1, "order": 1, "estimated_minutes": 40},
                {"title": "Database & API Design", "description": "Schema design, API endpoints, authentication flow.", "phase": 1, "order": 2, "estimated_minutes": 40},
                {"title": "Frontend Architecture", "description": "Component tree, routing, state management plan.", "phase": 2, "order": 3, "estimated_minutes": 35},
                {"title": "Core Feature Implementation", "description": "Build the main CRUD features end-to-end.", "phase": 2, "order": 4, "estimated_minutes": 60},
                {"title": "Testing & QA", "description": "Write tests, fix bugs, handle edge cases.", "phase": 3, "order": 5, "estimated_minutes": 40},
                {"title": "Deploy & Document", "description": "Dockerize, deploy, write README, record demo.", "phase": 3, "order": 6, "estimated_minutes": 40},
            ],
        },

        # ── 11  Communication & Soft Skills ───────────────────────
        {
            "label": "Communication & Soft Skills",
            "description": "Technical skills get you interviews. Soft skills get you hired. Learn to explain, collaborate, and present your work.",
            "market_value": "Med-High",
            "node_type": "soft_skill",
            "connections": [10],
            "project_prompt": "Record a 3-minute non-technical explanation of your capstone project, as if presenting to a non-tech stakeholder.",
            "resources": {
                "primary": [
                    {"title": "Technical Writing (Google)", "url": "https://developers.google.com/tech-writing", "type": "docs"},
                    {"title": "How to Explain Code Simply", "url": "https://www.youtube.com/watch?v=MnIPpUiTcRc", "type": "video"},
                ],
                "additional": [
                    {"title": "STAR Method for Interviews", "url": "https://www.themuse.com/advice/star-interview-method", "type": "docs"},
                    {"title": "Collaboration on GitHub", "url": "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Explaining Technical Concepts", "description": "How to translate code into plain English.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Code Reviews & Feedback", "description": "Giving and receiving constructive feedback on PRs.", "phase": 1, "order": 2, "estimated_minutes": 20},
                {"title": "Working with Non-Tech Teams", "description": "Communicating timelines, tradeoffs, and blockers.", "phase": 2, "order": 3, "estimated_minutes": 25},
                {"title": "Technical Writing", "description": "READMEs, documentation, blog posts about your work.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "Interview Preparation", "description": "STAR method, behavioral questions, whiteboarding.", "phase": 3, "order": 5, "estimated_minutes": 30},
                {"title": "Networking & Visibility", "description": "LinkedIn optimization, open-source contributions, communities.", "phase": 3, "order": 6, "estimated_minutes": 20},
            ],
        },
    ],
}
