"""
Backend Developer — Career Path Catalog
========================================
Master server-side programming with Python and Django.
From fundamentals to system design, databases, APIs,
authentication, caching, and production deployment.

Modules: 14 (hard skills + soft skills + capstone)
"""

BACKEND_DEVELOPER = {
    "role": "backend",
    "title": "Backend Developer",
    "description": "Master server-side programming with Python and Django. Build robust APIs, design databases, handle authentication, and deploy production systems.",
    "modules": [
        # ── 0  Python Fundamentals ────────────────────────────────
        {
            "label": "Python Fundamentals",
            "description": "The foundation of backend development. Learn Python syntax, data structures, functions, OOP, and the standard library.",
            "market_value": "Low-Med",
            "node_type": "core",
            "connections": [1, 2],
            "project_prompt": "Build a CLI task manager that supports adding, listing, completing, and deleting tasks — stored in a JSON file with proper error handling.",
            "resources": {
                "primary": [
                    {"title": "Python Official Tutorial", "url": "https://docs.python.org/3/tutorial/", "type": "docs"},
                    {"title": "FreeCodeCamp Python Course", "url": "https://www.freecodecamp.org/learn/scientific-computing-with-python/", "type": "interactive"},
                ],
                "additional": [
                    {"title": "Real Python Tutorials", "url": "https://realpython.com/", "type": "docs"},
                    {"title": "Automate the Boring Stuff", "url": "https://automatetheboringstuff.com/", "type": "docs"},
                    {"title": "Corey Schafer Python YouTube", "url": "https://www.youtube.com/@coreyms", "type": "video"},
                ],
            },
            "lessons": [
                {"title": "Python Setup & REPL", "description": "Installing Python, pip, virtual environments, running scripts.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Variables & Data Types", "description": "Strings, integers, floats, booleans, type conversion.", "phase": 1, "order": 2, "estimated_minutes": 20},
                {"title": "Control Flow", "description": "if/elif/else, for loops, while loops, break, continue.", "phase": 1, "order": 3, "estimated_minutes": 25},
                {"title": "Functions & Arguments", "description": "def, return, *args, **kwargs, default values, docstrings.", "phase": 1, "order": 4, "estimated_minutes": 25},
                {"title": "Lists, Tuples & Dicts", "description": "Core data structures, list comprehensions, dict methods.", "phase": 2, "order": 5, "estimated_minutes": 30},
                {"title": "Sets & Collections", "description": "Sets, frozensets, Counter, defaultdict, OrderedDict.", "phase": 2, "order": 6, "estimated_minutes": 20},
                {"title": "String Manipulation", "description": "f-strings, methods, regex basics, parsing text.", "phase": 2, "order": 7, "estimated_minutes": 20},
                {"title": "File I/O", "description": "Reading/writing files, CSV, JSON, context managers.", "phase": 2, "order": 8, "estimated_minutes": 25},
                {"title": "Error Handling", "description": "try/except, custom exceptions, raising, logging.", "phase": 3, "order": 9, "estimated_minutes": 25},
                {"title": "Modules & Packages", "description": "Importing, __init__.py, pip install, requirements.txt.", "phase": 3, "order": 10, "estimated_minutes": 20},
                {"title": "Object-Oriented Programming", "description": "Classes, inheritance, polymorphism, dunder methods.", "phase": 3, "order": 11, "estimated_minutes": 35},
                {"title": "Decorators & Generators", "description": "Function decorators, @property, yield, iterators.", "phase": 3, "order": 12, "estimated_minutes": 25},
            ],
        },

        # ── 1  Data Structures & Algorithms ───────────────────────
        {
            "label": "Data Structures & Algorithms",
            "description": "Think like a programmer. Learn fundamental CS concepts — arrays, linked lists, trees, sorting, and searching — with Python implementations.",
            "market_value": "Med",
            "node_type": "core",
            "connections": [3],
            "project_prompt": "Implement and benchmark 5 sorting algorithms and 3 data structures from scratch. Write tests for each with edge cases.",
            "resources": {
                "primary": [
                    {"title": "NeetCode Roadmap", "url": "https://neetcode.io/roadmap", "type": "interactive"},
                    {"title": "FreeCodeCamp DSA in Python", "url": "https://www.youtube.com/watch?v=pkYVOmU3MgA", "type": "video"},
                ],
                "additional": [
                    {"title": "LeetCode (Easy Level)", "url": "https://leetcode.com/problemset/all/?difficulty=EASY", "type": "interactive"},
                    {"title": "Visualgo (Algorithm Visualization)", "url": "https://visualgo.net/en", "type": "interactive"},
                    {"title": "Big-O Cheat Sheet", "url": "https://www.bigocheatsheet.com/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Big-O Notation", "description": "Time and space complexity, analyzing algorithms, common orders.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Arrays & Strings", "description": "Two pointers, sliding window, in-place operations.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "Hash Maps & Sets", "description": "Counting, frequency maps, lookup optimization.", "phase": 1, "order": 3, "estimated_minutes": 25},
                {"title": "Linked Lists", "description": "Singly/doubly linked, reversal, cycle detection, merge.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "Stacks & Queues", "description": "LIFO, FIFO, parentheses matching, BFS template.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "Sorting Algorithms", "description": "Bubble, merge, quick sort — implementations and comparisons.", "phase": 2, "order": 6, "estimated_minutes": 30},
                {"title": "Binary Search", "description": "Sorted array search, boundary finding, template patterns.", "phase": 2, "order": 7, "estimated_minutes": 25},
                {"title": "Trees & Binary Search Trees", "description": "Traversals (in/pre/post), insertion, deletion, DFS/BFS.", "phase": 3, "order": 8, "estimated_minutes": 35},
                {"title": "Recursion & Backtracking", "description": "Base cases, call stack, permutations, subsets.", "phase": 3, "order": 9, "estimated_minutes": 30},
                {"title": "Graphs Introduction", "description": "Adjacency lists, DFS, BFS, connected components.", "phase": 3, "order": 10, "estimated_minutes": 30},
            ],
        },

        # ── 2  Git & Version Control ──────────────────────────────
        {
            "label": "Git & Version Control",
            "description": "Track every change, collaborate with teams, and never lose work. Git and GitHub are essential for every backend developer.",
            "market_value": "Low-Med",
            "node_type": "core",
            "connections": [3],
            "project_prompt": "Set up a repo with branch protection, PR templates, GitHub Actions for linting, and a complete CONTRIBUTING.md.",
            "resources": {
                "primary": [
                    {"title": "Learn Git Branching", "url": "https://learngitbranching.js.org/", "type": "interactive"},
                    {"title": "Git Official Docs", "url": "https://git-scm.com/doc", "type": "docs"},
                ],
                "additional": [
                    {"title": "GitHub Skills", "url": "https://skills.github.com/", "type": "interactive"},
                    {"title": "Fireship Git in 100 Seconds", "url": "https://www.youtube.com/watch?v=hwP7WQkmECE", "type": "video"},
                ],
            },
            "lessons": [
                {"title": "Why Version Control?", "description": "Tracking changes, collaboration, branching model.", "phase": 1, "order": 1, "estimated_minutes": 15},
                {"title": "Git Basics", "description": "init, add, commit, status, log, diff.", "phase": 1, "order": 2, "estimated_minutes": 20},
                {"title": "Branching & Merging", "description": "Feature branches, merge vs rebase, conflict resolution.", "phase": 2, "order": 3, "estimated_minutes": 30},
                {"title": "GitHub & Pull Requests", "description": "Push, pull, fork, PRs, code review workflow.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "Advanced Git", "description": "Stash, cherry-pick, bisect, interactive rebase, hooks.", "phase": 3, "order": 5, "estimated_minutes": 30},
                {"title": "Git Workflows", "description": "Git Flow, trunk-based, release branches, CI integration.", "phase": 3, "order": 6, "estimated_minutes": 20},
            ],
        },

        # ── 3  Databases & SQL ────────────────────────────────────
        {
            "label": "Databases & SQL",
            "description": "Data is the backbone of every backend. Master relational databases, write complex SQL queries, and understand data modeling.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [4, 5],
            "project_prompt": "Design a database for an e-commerce platform (users, products, orders, payments, reviews). Write 20 queries including JOINs, aggregations, and subqueries.",
            "resources": {
                "primary": [
                    {"title": "SQLBolt Interactive Lessons", "url": "https://sqlbolt.com/", "type": "interactive"},
                    {"title": "PostgreSQL Official Tutorial", "url": "https://www.postgresql.org/docs/current/tutorial.html", "type": "docs"},
                ],
                "additional": [
                    {"title": "Mode SQL Tutorial", "url": "https://mode.com/sql-tutorial/", "type": "interactive"},
                    {"title": "Database Design Course (FCC)", "url": "https://www.youtube.com/watch?v=ztHopE5Wnpc", "type": "video"},
                    {"title": "Use The Index, Luke!", "url": "https://use-the-index-luke.com/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Relational Database Concepts", "description": "Tables, rows, columns, primary keys, relationships.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "SQL SELECT & Filtering", "description": "SELECT, WHERE, ORDER BY, LIMIT, DISTINCT, LIKE.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "INSERT, UPDATE, DELETE", "description": "Modifying data, RETURNING clauses, ON CONFLICT.", "phase": 1, "order": 3, "estimated_minutes": 20},
                {"title": "JOINs Mastery", "description": "INNER, LEFT, RIGHT, FULL, CROSS, self-joins.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "Aggregate Functions & GROUP BY", "description": "COUNT, SUM, AVG, MAX, MIN, HAVING, window functions.", "phase": 2, "order": 5, "estimated_minutes": 30},
                {"title": "Subqueries & CTEs", "description": "Nested queries, WITH clause, recursive CTEs.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "Schema Design & Normalization", "description": "1NF, 2NF, 3NF, when to denormalize, ER diagrams.", "phase": 2, "order": 7, "estimated_minutes": 30},
                {"title": "Indexes & Performance", "description": "B-tree, hash indexes, EXPLAIN ANALYZE, query optimization.", "phase": 3, "order": 8, "estimated_minutes": 30},
                {"title": "Constraints & Data Integrity", "description": "UNIQUE, CHECK, FOREIGN KEY, cascades, triggers.", "phase": 3, "order": 9, "estimated_minutes": 25},
                {"title": "Transactions & ACID", "description": "BEGIN, COMMIT, ROLLBACK, isolation levels, deadlocks.", "phase": 3, "order": 10, "estimated_minutes": 25},
                {"title": "NoSQL Overview", "description": "Document stores (MongoDB), key-value (Redis), when to choose NoSQL.", "phase": 3, "order": 11, "estimated_minutes": 25},
            ],
        },

        # ── 4  REST API Design ────────────────────────────────────
        {
            "label": "REST API Design",
            "description": "Design APIs that other developers love to use. RESTful conventions, status codes, versioning, pagination, and documentation.",
            "market_value": "High",
            "node_type": "core",
            "connections": [6],
            "project_prompt": "Design and document (with OpenAPI/Swagger) a REST API for a note-taking app with authentication, tags, sharing, and search.",
            "resources": {
                "primary": [
                    {"title": "RESTful API Design Guide", "url": "https://restfulapi.net/", "type": "docs"},
                    {"title": "HTTP Status Codes", "url": "https://httpstatuses.io/", "type": "docs"},
                ],
                "additional": [
                    {"title": "Swagger/OpenAPI Docs", "url": "https://swagger.io/docs/specification/about/", "type": "docs"},
                    {"title": "Hussein Nasser REST API Design", "url": "https://www.youtube.com/watch?v=faMdrSCVDzc", "type": "video"},
                    {"title": "Best API Design Practices", "url": "https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "HTTP Fundamentals", "description": "Methods (GET, POST, PUT, DELETE, PATCH), headers, body.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "REST Principles", "description": "Statelessness, resource-based URLs, HATEOAS basics.", "phase": 1, "order": 2, "estimated_minutes": 20},
                {"title": "Status Codes & Error Responses", "description": "2xx, 3xx, 4xx, 5xx — returning meaningful error objects.", "phase": 1, "order": 3, "estimated_minutes": 20},
                {"title": "URL Design & Naming", "description": "Plural nouns, nesting, query params, filtering, sorting.  ", "phase": 2, "order": 4, "estimated_minutes": 20},
                {"title": "Pagination Patterns", "description": "Offset, cursor, keyset — trade-offs and implementation.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "API Versioning", "description": "URL, header, query param versioning — when and how.", "phase": 2, "order": 6, "estimated_minutes": 20},
                {"title": "OpenAPI / Swagger", "description": "Documenting APIs, auto-generating clients, testing tools.", "phase": 3, "order": 7, "estimated_minutes": 25},
                {"title": "Rate Limiting & Throttling", "description": "Token bucket, sliding window, DRF throttle classes.", "phase": 3, "order": 8, "estimated_minutes": 20},
            ],
        },

        # ── 5  Authentication & Security ──────────────────────────
        {
            "label": "Authentication & Security",
            "description": "Protect your users and data. Session management, JWT, OAuth, password hashing, CORS, and OWASP top-10 vulnerabilities.",
            "market_value": "High",
            "node_type": "core",
            "connections": [6],
            "project_prompt": "Implement a secure auth system with registration, login, JWT refresh tokens, password reset, and OAuth (GitHub). Write a security audit report.",
            "resources": {
                "primary": [
                    {"title": "OWASP Top 10", "url": "https://owasp.org/www-project-top-ten/", "type": "docs"},
                    {"title": "Auth0 Identity Fundamentals", "url": "https://auth0.com/docs/get-started/identity-fundamentals", "type": "docs"},
                ],
                "additional": [
                    {"title": "PortSwigger Web Security Academy", "url": "https://portswigger.net/web-security", "type": "interactive"},
                    {"title": "Hussein Nasser JWT Explained", "url": "https://www.youtube.com/watch?v=7Q17ubqLfaM", "type": "video"},
                    {"title": "Django Security Checklist", "url": "https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Authentication vs Authorization", "description": "Who are you vs what can you do — the fundamental distinction.", "phase": 1, "order": 1, "estimated_minutes": 15},
                {"title": "Password Hashing", "description": "bcrypt, argon2, salting — never store plain-text passwords.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Session-Based Auth", "description": "Cookies, session stores, CSRF tokens, SameSite.", "phase": 1, "order": 3, "estimated_minutes": 25},
                {"title": "JWT (JSON Web Tokens)", "description": "Structure, signing, access/refresh tokens, token rotation.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "OAuth 2.0 & Social Login", "description": "Authorization code flow, client credentials, integrating GitHub/Google.", "phase": 2, "order": 5, "estimated_minutes": 30},
                {"title": "CORS & CSRF Protection", "description": "What CORS is, preflight requests, CSRF middleware.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "OWASP Top-10 Vulnerabilities", "description": "Injection, XSS, broken auth — understanding and preventing.", "phase": 3, "order": 7, "estimated_minutes": 30},
                {"title": "Input Validation & Sanitization", "description": "Serializer validation, SQL injection prevention, escaping.", "phase": 3, "order": 8, "estimated_minutes": 25},
                {"title": "HTTPS & Security Headers", "description": "TLS, HSTS, CSP, X-Content-Type-Options, X-Frame-Options.", "phase": 3, "order": 9, "estimated_minutes": 20},
            ],
        },

        # ── 6  Django & DRF Deep Dive ─────────────────────────────
        {
            "label": "Django & DRF Deep Dive",
            "description": "Build production-grade APIs with Django and Django REST Framework. Models, serializers, viewsets, permissions, filtering, and the admin.",
            "market_value": "High",
            "node_type": "core",
            "connections": [7, 8],
            "project_prompt": "Build a complete backend for a blog platform with Django REST Framework: user auth, posts, comments, tags, search, pagination, and admin panel.",
            "resources": {
                "primary": [
                    {"title": "Django Official Tutorial", "url": "https://docs.djangoproject.com/en/5.0/intro/tutorial01/", "type": "docs"},
                    {"title": "DRF Official Quickstart", "url": "https://www.django-rest-framework.org/tutorial/quickstart/", "type": "docs"},
                ],
                "additional": [
                    {"title": "Django for Beginners (book)", "url": "https://djangoforbeginners.com/", "type": "docs"},
                    {"title": "Very Academy Django YouTube", "url": "https://www.youtube.com/@vaboratory", "type": "video"},
                    {"title": "Django Best Practices", "url": "https://docs.djangoproject.com/en/5.0/misc/design-philosophies/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Django Project Setup", "description": "startproject, startapp, settings, URL configuration.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Models & Migrations", "description": "Defining models, field types, relationships, makemigrations.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "Django ORM Queries", "description": "QuerySets, filter, exclude, annotate, aggregate, select_related.", "phase": 1, "order": 3, "estimated_minutes": 35},
                {"title": "Django Admin", "description": "Registering models, customizing list display, filters, actions.", "phase": 1, "order": 4, "estimated_minutes": 20},
                {"title": "DRF Serializers", "description": "ModelSerializer, nested serializers, validation, writable nested.", "phase": 2, "order": 5, "estimated_minutes": 35},
                {"title": "Views & ViewSets", "description": "APIView, GenericAPIView, ModelViewSet, @action decorator.", "phase": 2, "order": 6, "estimated_minutes": 30},
                {"title": "Permissions & Authentication", "description": "IsAuthenticated, IsAdminUser, custom permissions, JWT integration.", "phase": 2, "order": 7, "estimated_minutes": 25},
                {"title": "Filtering, Searching & Ordering", "description": "django-filter, SearchFilter, OrderingFilter, custom filters.", "phase": 2, "order": 8, "estimated_minutes": 25},
                {"title": "Pagination & Throttling", "description": "PageNumber, Cursor, LimitOffset pagination, rate limits.", "phase": 3, "order": 9, "estimated_minutes": 20},
                {"title": "Signals & Middleware", "description": "post_save, pre_delete, custom middleware, request processing.", "phase": 3, "order": 10, "estimated_minutes": 25},
                {"title": "File Uploads & Media", "description": "FileField, ImageField, storage backends, S3 integration.", "phase": 3, "order": 11, "estimated_minutes": 25},
                {"title": "Management Commands", "description": "Writing custom Django commands for data tasks, cron jobs.", "phase": 3, "order": 12, "estimated_minutes": 20},
            ],
        },

        # ── 7  Caching, Queues & Background Tasks ────────────────
        {
            "label": "Caching, Queues & Background Tasks",
            "description": "Keep your API fast under load. Learn Redis caching, Celery task queues, and async processing patterns.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [9],
            "project_prompt": "Add caching (Redis) and background tasks (Celery) to an existing Django API: cache expensive queries, queue email sending, and add periodic tasks.",
            "resources": {
                "primary": [
                    {"title": "Redis Official Docs", "url": "https://redis.io/docs/", "type": "docs"},
                    {"title": "Celery Official Docs", "url": "https://docs.celeryq.dev/en/stable/getting-started/introduction.html", "type": "docs"},
                ],
                "additional": [
                    {"title": "Django Cache Framework", "url": "https://docs.djangoproject.com/en/5.0/topics/cache/", "type": "docs"},
                    {"title": "Real Python Celery Guide", "url": "https://realpython.com/asynchronous-tasks-with-django-and-celery/", "type": "docs"},
                    {"title": "Hussein Nasser Caching", "url": "https://www.youtube.com/watch?v=U3RkDLtS7uY", "type": "video"},
                ],
            },
            "lessons": [
                {"title": "Why Caching Matters", "description": "Cache hits/misses, cache-aside, write-through, invalidation.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Redis Basics", "description": "Data types, GET/SET, expiration, pub/sub, CLI usage.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Django Cache Framework", "description": "Cache backends, per-view caching, template caching, low-level API.", "phase": 1, "order": 3, "estimated_minutes": 25},
                {"title": "Celery Setup & Tasks", "description": "Broker config, @shared_task, task routing, retries.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "Celery Beat (Periodic Tasks)", "description": "Scheduled tasks, crontab, database scheduler.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "Task Monitoring", "description": "Flower dashboard, result backends, error tracking.", "phase": 2, "order": 6, "estimated_minutes": 20},
                {"title": "Cache Patterns at Scale", "description": "Cache stampede prevention, distributed locking, cache warming.", "phase": 3, "order": 7, "estimated_minutes": 25},
                {"title": "Async Django (ASGI)", "description": "async views, Channels, WebSockets introduction.", "phase": 3, "order": 8, "estimated_minutes": 30},
            ],
        },

        # ── 8  Testing Backend Applications ───────────────────────
        {
            "label": "Testing Backend Applications",
            "description": "Write tests that give you confidence to deploy on Friday. Unit tests, API tests, fixtures, mocking, and test-driven development.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [9],
            "project_prompt": "Write a comprehensive test suite for a Django API: 20+ unit tests, 10 API tests, test factories, and achieve 85%+ coverage.",
            "resources": {
                "primary": [
                    {"title": "Django Testing Docs", "url": "https://docs.djangoproject.com/en/5.0/topics/testing/", "type": "docs"},
                    {"title": "pytest Documentation", "url": "https://docs.pytest.org/en/stable/", "type": "docs"},
                ],
                "additional": [
                    {"title": "Factory Boy Docs", "url": "https://factoryboy.readthedocs.io/en/stable/", "type": "docs"},
                    {"title": "Real Python Testing Guide", "url": "https://realpython.com/pytest-python-testing/", "type": "docs"},
                    {"title": "TDD with Python (book)", "url": "https://www.obeythetestinggoat.com/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Why Test Backend Code?", "description": "Test pyramid, regression prevention, confidence in deploys.", "phase": 1, "order": 1, "estimated_minutes": 15},
                {"title": "pytest Setup & Basics", "description": "Installing, conftest.py, fixtures, parametrize, markers.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Testing Django Models", "description": "Model creation, validation, custom methods, constraints.", "phase": 1, "order": 3, "estimated_minutes": 25},
                {"title": "API Testing with DRF", "description": "APIClient, authentication in tests, status code assertions.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "Mocking & Patching", "description": "unittest.mock, patching external services, side_effect.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "Test Factories", "description": "Factory Boy, creating test data efficiently, LazyAttribute.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "Coverage & Reporting", "description": "coverage.py, measuring, HTML reports, CI enforcement.", "phase": 3, "order": 7, "estimated_minutes": 20},
                {"title": "TDD Workflow", "description": "Red-green-refactor cycle, writing tests first, discipline.", "phase": 3, "order": 8, "estimated_minutes": 25},
            ],
        },

        # ── 9  Docker & CI/CD ─────────────────────────────────────
        {
            "label": "Docker & CI/CD",
            "description": "Containerize your applications and automate deployments. Docker, docker-compose, GitHub Actions, and production hosting.",
            "market_value": "High",
            "node_type": "core",
            "connections": [10, 11],
            "project_prompt": "Dockerize a Django + PostgreSQL + Redis + Celery setup. Add GitHub Actions CI (lint, test, build) and deploy to Render or Railway.",
            "resources": {
                "primary": [
                    {"title": "Docker Getting Started", "url": "https://docs.docker.com/get-started/", "type": "docs"},
                    {"title": "GitHub Actions Quickstart", "url": "https://docs.github.com/en/actions/quickstart", "type": "docs"},
                ],
                "additional": [
                    {"title": "Fireship Docker in 100 Seconds", "url": "https://www.youtube.com/watch?v=Gjnup-PuquQ", "type": "video"},
                    {"title": "Docker Compose Docs", "url": "https://docs.docker.com/compose/", "type": "docs"},
                    {"title": "Render Django Deploy Guide", "url": "https://docs.render.com/deploy-django", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Docker Basics", "description": "Images, containers, Dockerfile, building and running.", "phase": 1, "order": 1, "estimated_minutes": 30},
                {"title": "Docker Compose", "description": "Multi-container apps, services, networks, volumes.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "Dockerizing Django", "description": "Dockerfile for Django, Gunicorn, static files, env vars.", "phase": 2, "order": 3, "estimated_minutes": 30},
                {"title": "CI/CD with GitHub Actions", "description": "Workflow files, test jobs, build jobs, secrets.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "Production Deployment", "description": "Render/Railway setup, environment configs, health checks.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "Database Migrations in CI", "description": "Running migrations safely, rollbacks, zero-downtime deploys.", "phase": 3, "order": 6, "estimated_minutes": 25},
                {"title": "Logging & Monitoring", "description": "Structured logging, Sentry integration, uptime monitoring.", "phase": 3, "order": 7, "estimated_minutes": 25},
                {"title": "Secrets & Environment Management", "description": ".env, Vault basics, CI secrets, not committing keys.", "phase": 3, "order": 8, "estimated_minutes": 20},
            ],
        },

        # ── 10  System Design Fundamentals ────────────────────────
        {
            "label": "System Design Fundamentals",
            "description": "Think at scale. Learn load balancing, microservices, message queues, database sharding, and how to design systems that handle millions of users.",
            "market_value": "High",
            "node_type": "core",
            "connections": [12, 13],
            "project_prompt": "Design a system architecture for a URL shortener (like bit.ly). Include a diagram, database schema, caching strategy, and scaling plan.",
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
                {"title": "System Design Overview", "description": "Why it matters, common interview formats, key concepts.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Load Balancing & Reverse Proxies", "description": "Nginx, round-robin, health checks, horizontal scaling.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Database Scaling", "description": "Read replicas, sharding, partitioning, CAP theorem.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "Caching at Scale", "description": "Multi-level caches, CDN, Redis cluster, cache invalidation.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "Message Queues & Event-Driven", "description": "RabbitMQ, Kafka concepts, event sourcing, CQRS.", "phase": 2, "order": 5, "estimated_minutes": 30},
                {"title": "Microservices Architecture", "description": "Service boundaries, API gateway, service mesh, trade-offs.", "phase": 2, "order": 6, "estimated_minutes": 30},
                {"title": "Designing Common Systems", "description": "URL shortener, chat app, notification system — walkthroughs.", "phase": 3, "order": 7, "estimated_minutes": 40},
                {"title": "Observability & Resilience", "description": "Circuit breakers, distributed tracing, graceful degradation.", "phase": 3, "order": 8, "estimated_minutes": 25},
            ],
        },

        # ── 11  GraphQL & API Alternatives ────────────────────────
        {
            "label": "GraphQL & API Alternatives",
            "description": "Beyond REST. Learn GraphQL fundamentals, gRPC basics, and WebSockets — expanding your API toolkit.",
            "market_value": "Med",
            "node_type": "core",
            "connections": [12, 13],
            "project_prompt": "Build a GraphQL API (with Strawberry or Graphene-Django) for a bookstore with queries, mutations, subscriptions, and pagination.",
            "resources": {
                "primary": [
                    {"title": "GraphQL Official Docs", "url": "https://graphql.org/learn/", "type": "docs"},
                    {"title": "Strawberry Python GraphQL", "url": "https://strawberry.rocks/docs", "type": "docs"},
                ],
                "additional": [
                    {"title": "Fireship GraphQL Explained", "url": "https://www.youtube.com/watch?v=eIQh02xuVw4", "type": "video"},
                    {"title": "gRPC Introduction", "url": "https://grpc.io/docs/what-is-grpc/introduction/", "type": "docs"},
                    {"title": "WebSocket Tutorial", "url": "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "REST Limitations", "description": "Over-fetching, under-fetching, multiple round trips.", "phase": 1, "order": 1, "estimated_minutes": 15},
                {"title": "GraphQL Fundamentals", "description": "Schema, types, queries, mutations, resolvers.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "GraphQL with Django", "description": "Strawberry/Graphene setup, integrating with Django models.", "phase": 2, "order": 3, "estimated_minutes": 30},
                {"title": "Subscriptions & Real-time", "description": "GraphQL subscriptions, WebSocket transport.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "N+1 Problem & DataLoader", "description": "Batching queries, avoiding performance traps.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "gRPC Basics", "description": "Protocol Buffers, service definitions, streaming.", "phase": 3, "order": 6, "estimated_minutes": 25},
                {"title": "WebSockets with Django Channels", "description": "ASGI, consumers, groups, real-time messaging.", "phase": 3, "order": 7, "estimated_minutes": 30},
                {"title": "Choosing the Right Protocol", "description": "REST vs GraphQL vs gRPC vs WebSocket — decision framework.", "phase": 3, "order": 8, "estimated_minutes": 20},
            ],
        },

        # ── 12  Backend Capstone Project ──────────────────────────
        {
            "label": "Backend Capstone Project",
            "description": "Build a production-quality API from scratch. Your portfolio centerpiece that demonstrates every backend skill you've learned.",
            "market_value": "High",
            "node_type": "core",
            "connections": [],
            "project_prompt": "Build and deploy a production API platform (e.g., a SaaS backend, marketplace API, or analytics service) with auth, caching, background tasks, tests, CI/CD, and documentation.",
            "resources": {
                "primary": [
                    {"title": "Project Ideas (GitHub)", "url": "https://github.com/florinpop17/app-ideas", "type": "docs"},
                    {"title": "System Design Primer", "url": "https://github.com/donnemartin/system-design-primer", "type": "docs"},
                ],
                "additional": [
                    {"title": "Best README Template", "url": "https://github.com/othneildrew/Best-README-Template", "type": "docs"},
                    {"title": "12-Factor App", "url": "https://12factor.net/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Requirements & Architecture", "description": "Defining scope, choosing tech stack, system diagram.", "phase": 1, "order": 1, "estimated_minutes": 40},
                {"title": "Database Design", "description": "ER diagram, schema, indexes, seed data.", "phase": 1, "order": 2, "estimated_minutes": 35},
                {"title": "API Implementation", "description": "Endpoints, serializers, permissions, filtering, pagination.", "phase": 2, "order": 3, "estimated_minutes": 60},
                {"title": "Auth & Security", "description": "JWT, OAuth, rate limiting, input validation.", "phase": 2, "order": 4, "estimated_minutes": 40},
                {"title": "Background Tasks & Caching", "description": "Celery tasks, Redis caching, periodic jobs.", "phase": 2, "order": 5, "estimated_minutes": 35},
                {"title": "Testing", "description": "pytest suite, API tests, mocks, 85%+ coverage.", "phase": 3, "order": 6, "estimated_minutes": 40},
                {"title": "Dockerize & Deploy", "description": "Docker, CI/CD, production hosting, monitoring.", "phase": 3, "order": 7, "estimated_minutes": 35},
                {"title": "Documentation & Demo", "description": "OpenAPI docs, README, architecture diagram, demo recording.", "phase": 3, "order": 8, "estimated_minutes": 30},
            ],
        },

        # ── 13  Communication & Career Skills ─────────────────────
        {
            "label": "Communication & Career Skills",
            "description": "Technical skills get the interview. Soft skills get the job. Learn to communicate, collaborate, and present at a professional level.",
            "market_value": "Med-High",
            "node_type": "soft_skill",
            "connections": [12],
            "project_prompt": "Write a technical blog post about a backend concept, contribute to an open-source Django project (1+ merged PR), and record a system design walkthrough.",
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
                {"title": "Explaining Backend Concepts", "description": "Translate architecture decisions into non-technical language.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Technical Writing", "description": "API docs, READMEs, architecture decision records.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Code Reviews", "description": "Giving and receiving constructive feedback, PR etiquette.", "phase": 2, "order": 3, "estimated_minutes": 20},
                {"title": "Open Source Contribution", "description": "Finding issues, reading codebases, submitting quality PRs.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "Interview Preparation", "description": "System design interviews, STAR method, live coding.", "phase": 3, "order": 5, "estimated_minutes": 30},
                {"title": "Networking & Visibility", "description": "LinkedIn, tech communities, conference talks, mentoring.", "phase": 3, "order": 6, "estimated_minutes": 20},
                {"title": "Salary Negotiation", "description": "Market research, negotiation frameworks, evaluating offers.", "phase": 3, "order": 7, "estimated_minutes": 20},
            ],
        },
    ],
}
