"""
Backend Developer — Career Path Catalog (Expanded)
==================================================
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
            "project_prompt": "Build a CLI task manager that supports adding, listing, completing, and deleting tasks. Store data in a JSON file, manage it with a dedicated class, and include a comprehensive test suite using `pytest`.",
            "resources": {
                "primary": [
                    {"title": "Python Official Tutorial", "url": "https://docs.python.org/3/tutorial/", "type": "docs"},
                    {"title": "FreeCodeCamp - Scientific Computing with Python", "url": "https://www.freecodecamp.org/learn/scientific-computing-with-python/", "type": "interactive"},
                    {"title": "Automate the Boring Stuff with Python", "url": "https://automatetheboringstuff.com/", "type": "book (free)"},
                ],
                "additional": [
                    {"title": "Real Python Tutorials", "url": "https://realpython.com/", "type": "docs"},
                    {"title": "Corey Schafer - Python YouTube Series", "url": "https://www.youtube.com/playlist?list=PL-osiE80TeTskP3x-b7iHiw3g1uO5k_H-", "type": "video"},
                    {"title": "Fluent Python (Book by Luciano Ramalho)", "url": "https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/", "type": "book (premium)"},
                    {"title": "ArjanCodes YouTube Channel", "url": "https://www.youtube.com/@ArjanCodes", "type": "video"},
                    {"title": "The Python Cheatsheet", "url": "https://www.pythoncheatsheet.org/", "type": "docs"},
                    {"title": "Exercism - Python Track", "url": "https://exercism.org/tracks/python", "type": "interactive"},
                ],
            },
            "lessons": [
                {"title": "Python Setup & Virtual Environments", "description": "Installing Python, pip, using `venv` for project isolation.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Variables & Core Data Types", "description": "Strings, integers, floats, booleans, type conversion, None.", "phase": 1, "order": 2, "estimated_minutes": 20},
                {"title": "Control Flow", "description": "if/elif/else, for loops, while loops, break, continue, match/case.", "phase": 1, "order": 3, "estimated_minutes": 25},
                {"title": "Functions & Arguments", "description": "def, return, *args, **kwargs, default values, type hints, docstrings.", "phase": 1, "order": 4, "estimated_minutes": 30},
                {"title": "Lists, Tuples & Dictionaries", "description": "Core data structures, indexing, slicing, methods.", "phase": 2, "order": 5, "estimated_minutes": 30},
                {"title": "List/Dict/Set Comprehensions", "description": "Writing concise, pythonic loops for data transformation.", "phase": 2, "order": 6, "estimated_minutes": 20},
                {"title": "String Manipulation & Regex", "description": "f-strings, methods, `re` module basics, parsing text.", "phase": 2, "order": 7, "estimated_minutes": 25},
                {"title": "File I/O with Context Managers", "description": "Reading/writing files, CSV, JSON, using the `with` statement.", "phase": 2, "order": 8, "estimated_minutes": 25},
                {"title": "Error & Exception Handling", "description": "try/except/else/finally, creating custom exceptions, raising.", "phase": 3, "order": 9, "estimated_minutes": 25},
                {"title": "Modules, Packages & Pip", "description": "Importing, `__init__.py`, pip install, `requirements.txt`.", "phase": 3, "order": 10, "estimated_minutes": 25},
                {"title": "Object-Oriented Programming (OOP)", "description": "Classes, instances, inheritance, polymorphism, dunder methods.", "phase": 3, "order": 11, "estimated_minutes": 40},
                {"title": "Decorators & Generators", "description": "Function decorators, @property, `yield` keyword, iterators, contextlib.", "phase": 3, "order": 12, "estimated_minutes": 30},
            ],
        },

        # ── 1  Data Structures & Algorithms ───────────────────────
        {
            "label": "Data Structures & Algorithms",
            "description": "Think like a programmer. Learn fundamental CS concepts — arrays, linked lists, trees, sorting, and searching — with Python implementations.",
            "market_value": "Med",
            "node_type": "core",
            "connections": [3],
            "project_prompt": "Implement and benchmark 5 sorting algorithms and 5 data structures (including a Trie) from scratch. Write unit tests for each implementation, covering edge cases like empty inputs and duplicates.",
            "resources": {
                "primary": [
                    {"title": "NeetCode Roadmap", "url": "https://neetcode.io/roadmap", "type": "interactive"},
                    {"title": "Grokking the Coding Interview (Educative)", "url": "https://www.educative.io/courses/grokking-the-coding-interview", "type": "interactive (premium)"},
                    {"title": "FreeCodeCamp - DSA in Python", "url": "https://www.youtube.com/watch?v=pkYVOmU3MgA", "type": "video"},
                ],
                "additional": [
                    {"title": "LeetCode (Problem Solving)", "url": "https://leetcode.com/problemset/all/", "type": "interactive"},
                    {"title": "Cracking the Coding Interview (Book)", "url": "https://www.crackingthecodinginterview.com/", "type": "book"},
                    {"title": "Visualgo (Algorithm Visualization)", "url": "https://visualgo.net/en", "type": "interactive"},
                    {"title": "Big-O Cheat Sheet", "url": "https://www.bigocheatsheet.com/", "type": "docs"},
                    {"title": "AlgoExpert", "url": "https://www.algoexpert.io/", "type": "interactive (premium)"},
                ],
            },
            "lessons": [
                {"title": "Big-O Notation", "description": "Time and space complexity, analyzing algorithms, common orders.", "phase": 1, "order": 1, "estimated_minutes": 30},
                {"title": "Arrays & Strings", "description": "Two pointers, sliding window, prefix sums, in-place operations.", "phase": 1, "order": 2, "estimated_minutes": 35},
                {"title": "Hash Maps & Sets", "description": "Counting, frequency maps, lookup optimization, collision resolution.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "Linked Lists", "description": "Singly/doubly linked, reversal, cycle detection, fast & slow pointers.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "Stacks & Queues", "description": "LIFO, FIFO, parentheses matching, monotonic stacks, BFS template.", "phase": 2, "order": 5, "estimated_minutes": 30},
                {"title": "Sorting Algorithms", "description": "Bubble, insertion, merge, quick sort — implementations and comparisons.", "phase": 2, "order": 6, "estimated_minutes": 30},
                {"title": "Binary Search", "description": "Sorted array search, boundary finding, template patterns for complex cases.", "phase": 2, "order": 7, "estimated_minutes": 25},
                {"title": "Trees & Binary Search Trees", "description": "Traversals (in/pre/post/level), insertion, deletion, validation, DFS/BFS.", "phase": 3, "order": 8, "estimated_minutes": 40},
                {"title": "Heaps & Priority Queues", "description": "Min/max heaps, `heapq` module, top K elements problems.", "phase": 3, "order": 9, "estimated_minutes": 25},
                {"title": "Recursion & Backtracking", "description": "Base cases, call stack, permutations, subsets, solving mazes.", "phase": 3, "order": 10, "estimated_minutes": 30},
                {"title": "Graphs", "description": "Adjacency list/matrix, DFS, BFS, topological sort, shortest path (Dijkstra).", "phase": 3, "order": 11, "estimated_minutes": 35},
                {"title": "1-D Dynamic Programming", "description": "Memoization vs tabulation, Fibonacci, climbing stairs, house robber.", "phase": 3, "order": 12, "estimated_minutes": 30},
            ],
        },

        # ── 2  Git & Version Control ──────────────────────────────
        {
            "label": "Git & Version Control",
            "description": "Track every change, collaborate with teams, and never lose work. Git and GitHub are essential for every backend developer.",
            "market_value": "Low-Med",
            "node_type": "core",
            "connections": [3],
            "project_prompt": "Set up a repo with branch protection rules, PR templates, GitHub Actions for linting/testing, and a complete CONTRIBUTING.md. Practice a full feature branch workflow with a PR and code review.",
            "resources": {
                "primary": [
                    {"title": "Learn Git Branching", "url": "https://learngitbranching.js.org/", "type": "interactive"},
                    {"title": "Pro Git (Book)", "url": "https://git-scm.com/book/en/v2", "type": "book (free)"},
                ],
                "additional": [
                    {"title": "GitHub Skills", "url": "https://skills.github.com/", "type": "interactive"},
                    {"title": "Fireship - Git in 100 Seconds", "url": "https://www.youtube.com/watch?v=hwP7WQkmECE", "type": "video"},
                    {"title": "Atlassian Git Tutorial", "url": "https://www.atlassian.com/git", "type": "docs"},
                    {"title": "Conventional Commits", "url": "https://www.conventionalcommits.org/en/v1.0.0/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Why Version Control?", "description": "Tracking changes, collaboration, safety net, branching model.", "phase": 1, "order": 1, "estimated_minutes": 15},
                {"title": "Git Basics", "description": "init, add, commit, status, log, diff, .gitignore.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Branching & Merging", "description": "Creating feature branches, `git merge`, resolving merge conflicts.", "phase": 2, "order": 3, "estimated_minutes": 30},
                {"title": "GitHub & Remote Repos", "description": "Push, pull, fetch, cloning, fork, pull requests, code review workflow.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "Interactive Rebase & Amending", "description": "Squashing, rewording, and reordering commits for a clean history.", "phase": 3, "order": 5, "estimated_minutes": 25},
                {"title": "Advanced Git", "description": "Stash, cherry-pick, bisect, reflog, hooks.", "phase": 3, "order": 6, "estimated_minutes": 30},
                {"title": "Git Workflows", "description": "Git Flow, GitHub Flow, Trunk-Based Development, release strategies.", "phase": 3, "order": 7, "estimated_minutes": 20},
            ],
        },

        # ── 3  Databases & SQL ────────────────────────────────────
        {
            "label": "Databases & SQL",
            "description": "Data is the backbone of every backend. Master relational databases, write complex SQL queries, and understand data modeling.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [4, 5],
            "project_prompt": "Design a normalized database schema for a social media platform (users, posts, comments, likes, follows). Write 25+ queries, including complex JOINs, window functions for leaderboards, and CTEs for analytics.",
            "resources": {
                "primary": [
                    {"title": "SQLBolt Interactive Lessons", "url": "https://sqlbolt.com/", "type": "interactive"},
                    {"title": "PostgreSQL Official Tutorial", "url": "https://www.postgresql.org/docs/current/tutorial.html", "type": "docs"},
                    {"title": "Designing Data-Intensive Applications (Book)", "url": "https://www.oreilly.com/library/view/designing-data-intensive-applications/9781449373320/", "type": "book (premium)"},
                ],
                "additional": [
                    {"title": "Mode SQL Tutorial", "url": "https://mode.com/sql-tutorial/", "type": "interactive"},
                    {"title": "Database Design Course (FreeCodeCamp)", "url": "https://www.youtube.com/watch?v=ztHopE5Wnpc", "type": "video"},
                    {"title": "Use The Index, Luke!", "url": "https://use-the-index-luke.com/", "type": "docs"},
                    {"title": "Postgres.fm (Podcast)", "url": "https://postgres.fm/", "type": "audio"},
                    {"title": "pgAdmin (DB GUI Tool)", "url": "https://www.pgadmin.org/", "type": "tool"},
                ],
            },
            "lessons": [
                {"title": "Relational Database Concepts", "description": "Tables, rows, columns, primary/foreign keys, relationships.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "SQL SELECT & Filtering", "description": "SELECT, WHERE, ORDER BY, LIMIT, DISTINCT, LIKE, IN.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Data Manipulation (DML)", "description": "INSERT, UPDATE, DELETE, RETURNING clauses, ON CONFLICT.", "phase": 1, "order": 3, "estimated_minutes": 20},
                {"title": "JOINs Mastery", "description": "INNER, LEFT, RIGHT, FULL, CROSS, self-joins, multiple joins.", "phase": 2, "order": 4, "estimated_minutes": 35},
                {"title": "Aggregate Functions & GROUP BY", "description": "COUNT, SUM, AVG, MAX, MIN, HAVING clause.", "phase": 2, "order": 5, "estimated_minutes": 30},
                {"title": "Subqueries & CTEs", "description": "Nested queries, the `WITH` clause for readability, recursive CTEs.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "Window Functions", "description": "OVER(), PARTITION BY, ROW_NUMBER(), RANK(), LEAD(), LAG().", "phase": 2, "order": 7, "estimated_minutes": 30},
                {"title": "Schema Design & Normalization", "description": "1NF, 2NF, 3NF, when to denormalize, ER diagrams.", "phase": 3, "order": 8, "estimated_minutes": 35},
                {"title": "Indexes & Performance Tuning", "description": "B-tree, hash indexes, composite indexes, `EXPLAIN ANALYZE`.", "phase": 3, "order": 9, "estimated_minutes": 30},
                {"title": "Constraints & Data Integrity", "description": "UNIQUE, CHECK, FOREIGN KEY, cascades, triggers.", "phase": 3, "order": 10, "estimated_minutes": 25},
                {"title": "Transactions & ACID Properties", "description": "BEGIN, COMMIT, ROLLBACK, isolation levels, deadlocks.", "phase": 3, "order": 11, "estimated_minutes": 25},
                {"title": "NoSQL Introduction", "description": "Document (MongoDB), key-value (Redis), column (Cassandra), graph (Neo4j).", "phase": 3, "order": 12, "estimated_minutes": 25},
            ],
        },

        # ── 4  REST API Design ────────────────────────────────────
        {
            "label": "REST API Design",
            "description": "Design APIs that other developers love to use. RESTful conventions, status codes, versioning, pagination, and documentation.",
            "market_value": "High",
            "node_type": "core",
            "connections": [6],
            "project_prompt": "Design and document (with OpenAPI/Swagger) a complete REST API for a library management system. Include resources for books, authors, patrons, and loans. Specify filtering, sorting, and pagination for all list endpoints.",
            "resources": {
                "primary": [
                    {"title": "RESTful API Design Guide", "url": "https://restfulapi.net/", "type": "docs"},
                    {"title": "Microsoft REST API Guidelines", "url": "https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md", "type": "docs"},
                    {"title": "Postman (API Client)", "url": "https://www.postman.com/", "type": "tool"},
                ],
                "additional": [
                    {"title": "Swagger/OpenAPI Specification", "url": "https://swagger.io/specification/", "type": "docs"},
                    {"title": "Hussein Nasser - REST API Design", "url": "https://www.youtube.com/watch?v=faMdrSCVDzc", "type": "video"},
                    {"title": "HTTP Status Codes", "url": "https://http.cat/", "type": "docs"},
                    {"title": "Zalando RESTful API Guidelines", "url": "https://opensource.zalando.com/restful-api-guidelines/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "HTTP Fundamentals", "description": "Request/response cycle, methods (GET, POST, PUT, DELETE, PATCH), headers, body.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "REST Principles", "description": "Statelessness, client-server, cacheability, resource-based URLs.", "phase": 1, "order": 2, "estimated_minutes": 20},
                {"title": "Status Codes & Error Responses", "description": "2xx, 3xx, 4xx, 5xx — returning meaningful error objects.", "phase": 1, "order": 3, "estimated_minutes": 20},
                {"title": "URL Design & Naming Conventions", "description": "Plural nouns, nesting resources, avoiding verbs in URLs.", "phase": 2, "order": 4, "estimated_minutes": 20},
                {"title": "Filtering, Sorting & Searching", "description": "Designing effective query parameters for data retrieval.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "Pagination Patterns", "description": "Offset, cursor, keyset — trade-offs and implementation.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "API Versioning Strategies", "description": "URL, header, query param versioning — when and how.", "phase": 2, "order": 7, "estimated_minutes": 20},
                {"title": "Idempotency & Safe Methods", "description": "Understanding idempotent operations (PUT, DELETE) vs non-idempotent (POST).", "phase": 3, "order": 8, "estimated_minutes": 20},
                {"title": "OpenAPI / Swagger for Documentation", "description": "Writing a schema, generating interactive docs, and client SDKs.", "phase": 3, "order": 9, "estimated_minutes": 30},
                {"title": "Rate Limiting & Throttling", "description": "Token bucket, sliding window, protecting your API from abuse.", "phase": 3, "order": 10, "estimated_minutes": 20},
            ],
        },

        # ── 5  Authentication & Security ──────────────────────────
        {
            "label": "Authentication & Security",
            "description": "Protect your users and data. Session management, JWT, OAuth, password hashing, CORS, and OWASP top-10 vulnerabilities.",
            "market_value": "High",
            "node_type": "core",
            "connections": [6],
            "project_prompt": "Implement a secure auth system with registration, login, JWT access/refresh tokens, secure cookie storage, password reset via email, and social login with GitHub (OAuth 2.0).",
            "resources": {
                "primary": [
                    {"title": "OWASP Top 10", "url": "https://owasp.org/www-project-top-ten/", "type": "docs"},
                    {"title": "Auth0 Identity Fundamentals", "url": "https://auth0.com/docs/get-started/identity-fundamentals", "type": "docs"},
                    {"title": "PortSwigger Web Security Academy", "url": "https://portswigger.net/web-security", "type": "interactive"},
                ],
                "additional": [
                    {"title": "Hussein Nasser - JWT Explained", "url": "https://www.youtube.com/watch?v=7Q17ubqLfaM", "type": "video"},
                    {"title": "The JWT Handbook", "url": "https://jwt.io/introduction", "type": "docs"},
                    {"title": "Django Security Checklist", "url": "https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/", "type": "docs"},
                    {"title": "fireship.io - Security", "url": "https://fireship.io/tags/security", "type": "video"},
                ],
            },
            "lessons": [
                {"title": "Authentication vs Authorization", "description": "Who are you vs what can you do — the fundamental distinction.", "phase": 1, "order": 1, "estimated_minutes": 15},
                {"title": "Secure Password Hashing", "description": "bcrypt, argon2, scrypt, salting — never store plain-text passwords.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Session-Based Authentication", "description": "Cookies, server-side sessions, CSRF tokens, SameSite.", "phase": 1, "order": 3, "estimated_minutes": 25},
                {"title": "JWT (JSON Web Tokens)", "description": "Structure (header, payload, signature), signing, storing securely (cookies vs localStorage).", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "Access & Refresh Tokens", "description": "Short-lived access tokens, long-lived refresh tokens, token rotation.", "phase": 2, "order": 5, "estimated_minutes": 30},
                {"title": "OAuth 2.0 & Social Login", "description": "Authorization code flow, client credentials, integrating GitHub/Google.", "phase": 2, "order": 6, "estimated_minutes": 35},
                {"title": "CORS & CSRF Protection", "description": "What CORS is, preflight requests, CSRF middleware.", "phase": 2, "order": 7, "estimated_minutes": 25},
                {"title": "OWASP Top-10 Vulnerabilities", "description": "Injection, XSS, broken auth — understanding and preventing.", "phase": 3, "order": 8, "estimated_minutes": 30},
                {"title": "Input Validation & Sanitization", "description": "Serializer validation, SQL injection prevention, escaping output.", "phase": 3, "order": 9, "estimated_minutes": 25},
                {"title": "HTTPS & Security Headers", "description": "TLS, HSTS, CSP, X-Content-Type-Options, X-Frame-Options.", "phase": 3, "order": 10, "estimated_minutes": 20},
            ],
        },

        # ── 6  Django & DRF Deep Dive ─────────────────────────────
        {
            "label": "Django & DRF Deep Dive",
            "description": "Build production-grade APIs with Django and Django REST Framework. Models, serializers, viewsets, permissions, filtering, and the admin.",
            "market_value": "High",
            "node_type": "core",
            "connections": [7, 8],
            "project_prompt": "Build a complete backend for a Q&A platform like Stack Overflow. Use DRF for user auth, questions, answers, comments, voting, and tags. Implement nested serializers for question/answer display and optimize queries.",
            "resources": {
                "primary": [
                    {"title": "Django Official Tutorial", "url": "https://docs.djangoproject.com/en/5.0/intro/tutorial01/", "type": "docs"},
                    {"title": "DRF Official Tutorial", "url": "https://www.django-rest-framework.org/tutorial/1-serialization/", "type": "docs"},
                    {"title": "TestDriven.io Django Courses", "url": "https://testdriven.io/courses/", "type": "interactive (premium)"},
                ],
                "additional": [
                    {"title": "Django for Beginners/APIs/Professionals (Books)", "url": "https://djangoforbeginners.com/", "type": "book"},
                    {"title": "Very Academy - Django YouTube Series", "url": "https://www.youtube.com/@vaboratory/playlists", "type": "video"},
                    {"title": "Two Scoops of Django (Book)", "url": "https://www.feldroy.com/books/two-scoops-of-django-3-x", "type": "book"},
                    {"title": "DRF Docs on Permissions", "url": "https://www.django-rest-framework.org/api-guide/permissions/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Django Project Setup", "description": "startproject, startapp, settings, URL configuration, MVT pattern.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Models & Migrations", "description": "Defining models, field types, relationships (ForeignKey, M2M), makemigrations.", "phase": 1, "order": 2, "estimated_minutes": 35},
                {"title": "Django ORM Mastery", "description": "QuerySets, `filter`, `exclude`, `annotate`, `aggregate`, `F()` expressions, `select_related`, `prefetch_related`.", "phase": 1, "order": 3, "estimated_minutes": 40},
                {"title": "Django Admin", "description": "Registering models, customizing list/detail views, filters, actions.", "phase": 1, "order": 4, "estimated_minutes": 25},
                {"title": "DRF Serializers", "description": "ModelSerializer, nested serializers, validation, writable nested serializers, `SerializerMethodField`.", "phase": 2, "order": 5, "estimated_minutes": 35},
                {"title": "Views & ViewSets", "description": "APIView, Generic Views (ListCreate, RetrieveUpdateDestroy), ModelViewSet, `@action` decorator.", "phase": 2, "order": 6, "estimated_minutes": 35},
                {"title": "Permissions & Authentication", "description": "IsAuthenticated, IsAdminUser, custom permissions, JWT/Session auth integration.", "phase": 2, "order": 7, "estimated_minutes": 30},
                {"title": "Filtering, Searching & Ordering", "description": "`django-filter` backend, `SearchFilter`, `OrderingFilter`, custom filters.", "phase": 2, "order": 8, "estimated_minutes": 25},
                {"title": "File Uploads & Media Storage", "description": "FileField, ImageField, storage backends, integrating with S3 for production.", "phase": 3, "order": 9, "estimated_minutes": 25},
                {"title": "Signals & Custom Middleware", "description": "post_save, pre_delete, writing custom middleware for request/response processing.", "phase": 3, "order": 10, "estimated_minutes": 25},
                {"title": "Management Commands", "description": "Writing custom `manage.py` commands for data tasks, cron jobs.", "phase": 3, "order": 11, "estimated_minutes": 20},
                {"title": "Django Settings for Production", "description": "Splitting settings files, environment variables, security settings.", "phase": 3, "order": 12, "estimated_minutes": 25},
            ],
        },

        # ── 7  Caching, Queues & Background Tasks ────────────────
        {
            "label": "Caching, Queues & Background Tasks",
            "description": "Keep your API fast under load. Learn Redis caching, Celery task queues, and async processing patterns.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [9],
            "project_prompt": "Add caching (Redis) and background tasks (Celery) to an existing Django API. Cache expensive list endpoints, queue welcome email sending on user signup, and add a periodic task to generate a daily report.",
            "resources": {
                "primary": [
                    {"title": "Redis Official Docs", "url": "https://redis.io/docs/", "type": "docs"},
                    {"title": "Celery Official Docs", "url": "https://docs.celeryq.dev/en/stable/getting-started/introduction.html", "type": "docs"},
                    {"title": "Real Python - Django & Celery", "url": "https://realpython.com/asynchronous-tasks-with-django-and-celery/", "type": "docs"},
                ],
                "additional": [
                    {"title": "Django Cache Framework", "url": "https://docs.djangoproject.com/en/5.0/topics/cache/", "type": "docs"},
                    {"title": "Hussein Nasser - Caching Patterns", "url": "https://www.youtube.com/watch?v=U3RkDLtS7uY", "type": "video"},
                    {"title": "Redis University", "url": "https://university.redis.com/", "type": "interactive"},
                    {"title": "TestDriven.io - Django & Celery", "url": "https://testdriven.io/blog/django-and-celery/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Caching Fundamentals", "description": "Cache hits/misses, cache-aside, write-through, cache invalidation strategies.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Redis Basics", "description": "Data types (strings, lists, hashes), GET/SET, expiration, using redis-cli.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Django Cache Framework", "description": "Cache backends, per-view caching, template caching, low-level cache API.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "Background Task Fundamentals", "description": "Why use task queues? Brokers vs Backends. The actor model.", "phase": 2, "order": 4, "estimated_minutes": 20},
                {"title": "Celery Setup with Django", "description": "Broker config (Redis/RabbitMQ), defining tasks (`@shared_task`), calling tasks.", "phase": 2, "order": 5, "estimated_minutes": 35},
                {"title": "Celery Beat (Periodic Tasks)", "description": "Scheduled tasks, crontab schedules, database scheduler.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "Task Monitoring & Retries", "description": "Flower dashboard, result backends, exponential backoff, error handling.", "phase": 2, "order": 7, "estimated_minutes": 25},
                {"title": "Async Django & ASGI", "description": "Introduction to `async/await` in Python, writing async views, Channels basics.", "phase": 3, "order": 8, "estimated_minutes": 30},
            ],
        },

        # ── 8  Testing Backend Applications ───────────────────────
        {
            "label": "Testing Backend Applications",
            "description": "Write tests that give you confidence to deploy on Friday. Unit tests, API tests, fixtures, mocking, and test-driven development.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [9],
            "project_prompt": "Write a comprehensive test suite for a Django API, achieving 90%+ test coverage. Include unit tests for models/services, API tests for all endpoints (including auth), use `pytest` fixtures, mock external services, and use `factory-boy` for test data generation.",
            "resources": {
                "primary": [
                    {"title": "Django Testing Docs", "url": "https://docs.djangoproject.com/en/5.0/topics/testing/", "type": "docs"},
                    {"title": "pytest Documentation", "url": "https://docs.pytest.org/en/stable/", "type": "docs"},
                    {"title": "Obey the Testing Goat! (Book)", "url": "https://www.obeythetestinggoat.com/", "type": "book (free)"},
                ],
                "additional": [
                    {"title": "Factory Boy Docs", "url": "https://factoryboy.readthedocs.io/en/stable/", "type": "docs"},
                    {"title": "Real Python - Testing with pytest", "url": "https://realpython.com/pytest-python-testing/", "type": "docs"},
                    {"title": "ArjanCodes - Testing Playlist", "url": "https://www.youtube.com/playlist?list=PLC9Gk35yA6rHi5MIOVveG22yI6Iun1o_g", "type": "video"},
                    {"title": "Mocking with `unittest.mock`", "url": "https://docs.python.org/3/library/unittest.mock.html", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "The Testing Pyramid", "description": "Unit, Integration, and End-to-End tests — what they are and why.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "pytest Setup & Fixtures", "description": "Installing, `conftest.py`, writing fixtures, parametrize, markers.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "Unit Testing Django", "description": "Testing models (methods, constraints), utility functions, services.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "API Testing with DRF", "description": "`APIClient`, authenticating requests in tests, status code and data assertions.", "phase": 2, "order": 4, "estimated_minutes": 35},
                {"title": "Mocking & Patching", "description": "`unittest.mock`, patching external API calls, `side_effect`.", "phase": 2, "order": 5, "estimated_minutes": 30},
                {"title": "Test Data with Factories", "description": "`factory-boy`, creating realistic test data efficiently, LazyAttribute.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "Test-Driven Development (TDD)", "description": "The red-green-refactor cycle, writing tests before code.", "phase": 3, "order": 7, "estimated_minutes": 25},
                {"title": "Test Coverage & Reporting", "description": "`coverage.py`, measuring test effectiveness, HTML reports, CI enforcement.", "phase": 3, "order": 8, "estimated_minutes": 20},
            ],
        },

        # ── 9  Docker & CI/CD ─────────────────────────────────────
        {
            "label": "Docker & CI/CD",
            "description": "Containerize your applications and automate deployments. Docker, docker-compose, GitHub Actions, and production hosting.",
            "market_value": "High",
            "node_type": "core",
            "connections": [10, 11],
            "project_prompt": "Dockerize a full Django + PostgreSQL + Redis + Celery application using docker-compose. Create a GitHub Actions CI pipeline that lints, tests, and builds images. Deploy the application to a PaaS like Render or Railway.",
            "resources": {
                "primary": [
                    {"title": "Docker Getting Started", "url": "https://docs.docker.com/get-started/", "type": "docs"},
                    {"title": "GitHub Actions Quickstart", "url": "https://docs.github.com/en/actions/quickstart", "type": "docs"},
                    {"title": "TestDriven.io - Dockerizing Django", "url": "https://testdriven.io/blog/dockerizing-django-with-postgres-gunicorn-and-nginx/", "type": "docs"},
                ],
                "additional": [
                    {"title": "Fireship - Docker in 100 Seconds", "url": "https://www.youtube.com/watch?v=Gjnup-PuquQ", "type": "video"},
                    {"title": "Docker Compose Specification", "url": "https://docs.docker.com/compose/", "type": "docs"},
                    {"title": "Render - Deploy Django Guide", "url": "https://docs.render.com/deploy-django", "type": "docs"},
                    {"title": "The Twelve-Factor App", "url": "https://12factor.net/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Docker Fundamentals", "description": "Images, containers, Dockerfile, building, running, port mapping.", "phase": 1, "order": 1, "estimated_minutes": 35},
                {"title": "Docker Compose", "description": "Multi-container apps, services, networks, volumes, environment variables.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "Dockerizing a Django App", "description": "Writing a Dockerfile for Django, Gunicorn, static files, entrypoint scripts.", "phase": 2, "order": 3, "estimated_minutes": 35},
                {"title": "CI/CD with GitHub Actions", "description": "Workflow files (`.yml`), jobs, steps, running tests and linters automatically.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "Building & Pushing Images", "description": "Creating a build job, pushing to a container registry (Docker Hub, GHCR).", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "Deploying to Production (PaaS)", "description": "Render/Railway setup, environment configs, health checks, scaling.", "phase": 3, "order": 6, "estimated_minutes": 30},
                {"title": "Database Migrations in CI/CD", "description": "Running migrations safely during deployment, rollback strategies.", "phase": 3, "order": 7, "estimated_minutes": 25},
                {"title": "Secrets & Environment Management", "description": ".env files, GitHub secrets, production environment configuration.", "phase": 3, "order": 8, "estimated_minutes": 20},
            ],
        },

        # ── 10  System Design Fundamentals ────────────────────────
        {
            "label": "System Design Fundamentals",
            "description": "Think at scale. Learn load balancing, microservices, message queues, database sharding, and how to design systems that handle millions of users.",
            "market_value": "High",
            "node_type": "core",
            "connections": [12, 13],
            "project_prompt": "Design the system architecture for a real-time food delivery service (like Uber Eats). Create a diagram, define API contracts between services, choose database types, and explain your scaling and caching strategies.",
            "resources": {
                "primary": [
                    {"title": "System Design Primer (GitHub)", "url": "https://github.com/donnemartin/system-design-primer", "type": "docs"},
                    {"title": "ByteByteGo YouTube Channel", "url": "https://www.youtube.com/@ByteByteGo", "type": "video"},
                    {"title": "Grokking the System Design Interview (Educative)", "url": "https://www.educative.io/courses/grokking-the-system-design-interview", "type": "interactive (premium)"},
                ],
                "additional": [
                    {"title": "Designing Data-Intensive Applications (Book)", "url": "https://www.oreilly.com/library/view/designing-data-intensive-applications/9781449373320/", "type": "book"},
                    {"title": "Alex Xu's System Design Books", "url": "https://www.amazon.com/System-Design-Interview-Insiders-Guide/dp/1736049119", "type": "book"},
                    {"title": "Hussein Nasser - Backend Engineering YouTube", "url": "https://www.youtube.com/@hnasr", "type": "video"},
                    {"title": "High Scalability Blog", "url": "http://highscalability.com/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "System Design Interview Framework", "description": "Clarifying requirements, back-of-the-envelope estimation, high-level design.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Vertical vs Horizontal Scaling", "description": "Scaling up vs scaling out, stateful vs stateless services.", "phase": 1, "order": 2, "estimated_minutes": 20},
                {"title": "Load Balancing & Reverse Proxies", "description": "Nginx, HAProxy, algorithms (round-robin, least connections), health checks.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "Database Scaling Strategies", "description": "Read replicas, sharding, partitioning, leader election, CAP theorem.", "phase": 2, "order": 4, "estimated_minutes": 35},
                {"title": "Caching at Scale", "description": "Multi-level caches (client, CDN, server), Redis cluster, cache invalidation.", "phase": 2, "order": 5, "estimated_minutes": 30},
                {"title": "Message Queues & Event-Driven Arch", "description": "RabbitMQ vs Kafka, event sourcing, CQRS pattern.", "phase": 2, "order": 6, "estimated_minutes": 30},
                {"title": "API Gateways & Service Discovery", "description": "Single entry point for microservices, service registration.", "phase": 2, "order": 7, "estimated_minutes": 25},
                {"title": "Designing Common Systems", "description": "URL shortener, chat app, news feed, notification system — walkthroughs.", "phase": 3, "order": 8, "estimated_minutes": 45},
                {"title": "Observability: Logging, Metrics, Tracing", "description": "Structured logging, Prometheus/Grafana, distributed tracing (Jaeger).", "phase": 3, "order": 9, "estimated_minutes": 30},
            ],
        },

        # ── 11  GraphQL & API Alternatives ────────────────────────
        {
            "label": "GraphQL & API Alternatives",
            "description": "Beyond REST. Learn GraphQL fundamentals, gRPC basics, and WebSockets — expanding your API toolkit.",
            "market_value": "Med",
            "node_type": "core",
            "connections": [12, 13],
            "project_prompt": "Re-implement a portion of a previous REST API project using GraphQL (with Strawberry). Create queries for fetching data, mutations for creating/updating, and implement a basic subscription for real-time updates.",
            "resources": {
                "primary": [
                    {"title": "GraphQL Official Docs", "url": "https://graphql.org/learn/", "type": "docs"},
                    {"title": "Strawberry (Python GraphQL) Docs", "url": "https://strawberry.rocks/docs", "type": "docs"},
                    {"title": "How to GraphQL Tutorial", "url": "https://www.howtographql.com/", "type": "interactive"},
                ],
                "additional": [
                    {"title": "Fireship - GraphQL Explained", "url": "https://www.youtube.com/watch?v=eIQh02xuVw4", "type": "video"},
                    {"title": "gRPC Introduction", "url": "https://grpc.io/docs/what-is-grpc/introduction/", "type": "docs"},
                    {"title": "Django Channels Docs", "url": "https://channels.readthedocs.io/en/latest/", "type": "docs"},
                    {"title": "Apollo GraphQL Blog", "url": "https://www.apollographql.com/blog/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "REST Limitations", "description": "Over-fetching, under-fetching, multiple round trips.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "GraphQL Fundamentals", "description": "Schema Definition Language (SDL), types, queries, mutations, resolvers.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "GraphQL with Django & Strawberry", "description": "Setup, creating types from models, writing query and mutation resolvers.", "phase": 2, "order": 3, "estimated_minutes": 35},
                {"title": "Subscriptions & Real-time", "description": "GraphQL subscriptions, WebSocket transport with Django Channels.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "The N+1 Problem & DataLoader", "description": "Identifying and solving performance bottlenecks by batching queries.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "gRPC Basics", "description": "Protocol Buffers, service definitions, unary vs streaming RPCs.", "phase": 3, "order": 6, "estimated_minutes": 25},
                {"title": "WebSockets with Django Channels", "description": "ASGI, consumers, groups, real-time bi-directional messaging.", "phase": 3, "order": 7, "estimated_minutes": 30},
                {"title": "Choosing the Right Protocol", "description": "REST vs GraphQL vs gRPC vs WebSocket — a decision framework.", "phase": 3, "order": 8, "estimated_minutes": 20},
            ],
        },

        # ── 12  Backend Capstone Project ──────────────────────────
        {
            "label": "Backend Capstone Project",
            "description": "Build a production-quality API from scratch. Your portfolio centerpiece that demonstrates every backend skill you've learned.",
            "market_value": "High",
            "node_type": "core",
            "connections": [],
            "project_prompt": "Build and deploy a complete backend for a multi-tenant SaaS application (e.g., project management tool, appointment scheduler). It must include user/organization auth, JWT, role-based permissions, data isolation between tenants, background tasks, caching, a comprehensive test suite, CI/CD, and full API documentation.",
            "resources": {
                "primary": [
                    {"title": "Project Ideas (GitHub)", "url": "https://github.com/florinpop17/app-ideas", "type": "docs"},
                    {"title": "System Design Primer", "url": "https://github.com/donnemartin/system-design-primer", "type": "docs"},
                ],
                "additional": [
                    {"title": "Best README Template", "url": "https://github.com/othneildrew/Best-README-Template", "type": "docs"},
                    {"title": "The Twelve-Factor App", "url": "https://12factor.net/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Project Scoping & Architecture", "description": "Defining core features (MVP), choosing tech stack, creating a system diagram.", "phase": 1, "order": 1, "estimated_minutes": 45},
                {"title": "Database Schema Design", "description": "Creating an ER diagram, defining models and relationships, planning for scalability.", "phase": 1, "order": 2, "estimated_minutes": 40},
                {"title": "Core API Implementation", "description": "Building out endpoints, serializers, permissions, filtering, and pagination.", "phase": 2, "order": 3, "estimated_minutes": 60},
                {"title": "Implementing Auth & Security", "description": "JWT, role-based access control (RBAC), rate limiting, input validation.", "phase": 2, "order": 4, "estimated_minutes": 45},
                {"title": "Integrating Caching & Background Tasks", "description": "Implementing Celery tasks, Redis caching for performance.", "phase": 2, "order": 5, "estimated_minutes": 40},
                {"title": "Writing a Comprehensive Test Suite", "description": "Using pytest, factory-boy, and mocks to achieve 90%+ coverage.", "phase": 3, "order": 6, "estimated_minutes": 50},
                {"title": "Dockerizing & Setting up CI/CD", "description": "Creating Dockerfiles, docker-compose, and a full GitHub Actions pipeline.", "phase": 3, "order": 7, "estimated_minutes": 40},
                {"title": "Deployment & Documentation", "description": "Deploying to a PaaS, writing OpenAPI docs, and creating a high-quality README.", "phase": 3, "order": 8, "estimated_minutes": 35},
            ],
        },

        # ── 13  Communication & Career Skills ─────────────────────
        {
            "label": "Communication & Career Skills",
            "description": "Technical skills get the interview. Soft skills get the job and the promotion. Learn to communicate, collaborate, and present at a professional level.",
            "market_value": "Med-High",
            "node_type": "soft_skill",
            "connections": [12],
            "project_prompt": "Write a technical blog post explaining a complex backend topic (e.g., 'How JWT Refresh Tokens Work'). Contribute to an open-source Django/Python project (1+ merged PR). Create a 5-minute video walkthrough of your capstone project's architecture.",
            "resources": {
                "primary": [
                    {"title": "Technical Writing (Google)", "url": "https://developers.google.com/tech-writing", "type": "docs"},
                    {"title": "How to Contribute to Open Source", "url": "https://opensource.guide/how-to-contribute/", "type": "docs"},
                    {"title": "The Pragmatic Programmer (Book)", "url": "https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/", "type": "book"},
                ],
                "additional": [
                    {"title": "STAR Method for Interviews", "url": "https://www.themuse.com/advice/star-interview-method", "type": "docs"},
                    {"title": "Dev.to & Hashnode (Blogging Platforms)", "url": "https://dev.to/", "type": "platform"},
                    {"title": "Pramp (Peer-to-peer Interview Practice)", "url": "https://www.pramp.com/", "type": "interactive"},
                    {"title": "Gergely Orosz - The Pragmatic Engineer", "url": "https://blog.pragmaticengineer.com/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Explaining Technical Concepts", "description": "Translating architecture decisions for both technical and non-technical audiences.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Effective Technical Writing", "description": "Writing clear API docs, READMEs, and Architecture Decision Records (ADRs).", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "Giving & Receiving Code Reviews", "description": "Providing constructive feedback, PR etiquette, not taking feedback personally.", "phase": 2, "order": 3, "estimated_minutes": 25},
                {"title": "Agile & Scrum Methodologies", "description": "Sprints, stand-ups, retrospectives, story points — how modern teams work.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "Interview Preparation", "description": "Behavioral questions (STAR method), system design interviews, live coding.", "phase": 3, "order": 5, "estimated_minutes": 35},
                {"title": "Building Your Portfolio & Resume", "description": "Showcasing projects, tailoring your resume to job descriptions.", "phase": 3, "order": 6, "estimated_minutes": 30},
                {"title": "Networking & Personal Branding", "description": "Using LinkedIn effectively, contributing to communities, finding mentors.", "phase": 3, "order": 7, "estimated_minutes": 20},
                {"title": "Salary Negotiation", "description": "Market research, negotiation frameworks, evaluating total compensation.", "phase": 3, "order": 8, "estimated_minutes": 20},
            ],
        },
    ],
}