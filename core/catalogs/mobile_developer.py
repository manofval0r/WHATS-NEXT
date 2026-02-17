"""
Mobile Developer — Career Path Catalog
========================================
From JavaScript/TypeScript foundations through React Native,
native APIs, navigation, animations, testing, and publishing.
A complete path to building cross-platform mobile applications.

Modules: 14 (hard skills + soft skills + capstone)
"""

MOBILE_DEVELOPER = {
    "role": "mobile",
    "title": "Mobile Developer",
    "description": "From JavaScript/TypeScript foundations through React Native, native APIs, animations, and app store publishing. Build cross-platform mobile apps from idea to launch.",
    "modules": [
        # ── 0  JavaScript Foundations ─────────────────────────────
        {
            "label": "JavaScript Foundations",
            "description": "JavaScript is the engine behind React Native. Master the core language before building mobile interfaces.",
            "market_value": "Med",
            "node_type": "core",
            "connections": [1, 2],
            "project_prompt": "Build 5 JavaScript mini-projects (calculator, quiz app logic, todo logic, API fetcher, data transformer) that run in Node.js with unit tests.",
            "resources": {
                "primary": [
                    {"title": "javascript.info (Modern JS)", "url": "https://javascript.info/", "type": "docs"},
                    {"title": "FreeCodeCamp JavaScript", "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/", "type": "interactive"},
                ],
                "additional": [
                    {"title": "Eloquent JavaScript (free)", "url": "https://eloquentjavascript.net/", "type": "docs"},
                    {"title": "Fireship JS in 100 seconds", "url": "https://www.youtube.com/watch?v=DHjqpvDnNGE", "type": "video"},
                    {"title": "MDN JavaScript Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Variables & Data Types", "description": "let/const, primitives, objects, arrays, typeof.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Operators & Control Flow", "description": "if/else, ternary, switch, for, while, for...of.", "phase": 1, "order": 2, "estimated_minutes": 20},
                {"title": "Functions & Scope", "description": "Declarations, expressions, arrow functions, closures, hoisting.", "phase": 1, "order": 3, "estimated_minutes": 25},
                {"title": "Arrays & Array Methods", "description": "map, filter, reduce, find, every, spread/rest.", "phase": 1, "order": 4, "estimated_minutes": 25},
                {"title": "Objects & Destructuring", "description": "Object literals, dot/bracket notation, destructuring, spread.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "Async JavaScript", "description": "Callbacks, Promises, async/await, fetch API, error handling.", "phase": 2, "order": 6, "estimated_minutes": 30},
                {"title": "ES6+ Modern Features", "description": "Template literals, optional chaining, nullish coalescing, modules.", "phase": 2, "order": 7, "estimated_minutes": 25},
                {"title": "Error Handling & Debugging", "description": "try/catch, console methods, debugging strategies.", "phase": 3, "order": 8, "estimated_minutes": 20},
                {"title": "Working with JSON & APIs", "description": "JSON.parse/stringify, fetching APIs, request/response.", "phase": 3, "order": 9, "estimated_minutes": 25},
                {"title": "JavaScript Patterns", "description": "Module pattern, observer, factory, clean code principles.", "phase": 3, "order": 10, "estimated_minutes": 25},
            ],
        },

        # ── 1  TypeScript for Mobile ──────────────────────────────
        {
            "label": "TypeScript for Mobile",
            "description": "Type safety prevents bugs before they reach users. Learn TypeScript thoroughly — it's the standard for production React Native apps.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [3],
            "project_prompt": "Convert a JavaScript project to TypeScript: add interfaces for all data models, generic utility types, and achieve zero type errors.",
            "resources": {
                "primary": [
                    {"title": "TypeScript Official Handbook", "url": "https://www.typescriptlang.org/docs/handbook/intro.html", "type": "docs"},
                    {"title": "Total TypeScript Beginners", "url": "https://www.totaltypescript.com/tutorials/beginners-typescript", "type": "interactive"},
                ],
                "additional": [
                    {"title": "Matt Pocock TypeScript YouTube", "url": "https://www.youtube.com/@maaboroshi", "type": "video"},
                    {"title": "TypeScript Playground", "url": "https://www.typescriptlang.org/play", "type": "interactive"},
                ],
            },
            "lessons": [
                {"title": "TypeScript Setup & Basics", "description": "tsconfig.json, basic types, type annotations, inference.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Interfaces & Type Aliases", "description": "Defining shapes, extending, intersection types, unions.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Functions & Generics", "description": "Typed parameters, return types, generic functions, constraints.", "phase": 1, "order": 3, "estimated_minutes": 25},
                {"title": "Enums & Literal Types", "description": "String/numeric enums, as const, discriminated unions.", "phase": 2, "order": 4, "estimated_minutes": 20},
                {"title": "Utility Types", "description": "Partial, Required, Pick, Omit, Record, Readonly.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "Type Guards & Narrowing", "description": "typeof, instanceof, in, custom type guards, assertion functions.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "TypeScript with React Native", "description": "Component props, event types, navigation types, hooks typing.", "phase": 3, "order": 7, "estimated_minutes": 30},
                {"title": "Advanced Patterns", "description": "Mapped types, conditional types, template literal types.", "phase": 3, "order": 8, "estimated_minutes": 25},
            ],
        },

        # ── 2  Git & Collaboration ────────────────────────────────
        {
            "label": "Git & Collaboration",
            "description": "Version control for mobile projects. Branching, PRs, managing native dependencies, and collaborating with design and QA teams.",
            "market_value": "Low-Med",
            "node_type": "core",
            "connections": [3],
            "project_prompt": "Set up a React Native project with Git: feature branch workflow, .gitignore for RN/iOS/Android, PR templates, and semantic commits.",
            "resources": {
                "primary": [
                    {"title": "Learn Git Branching", "url": "https://learngitbranching.js.org/", "type": "interactive"},
                    {"title": "GitHub Skills", "url": "https://skills.github.com/", "type": "interactive"},
                ],
                "additional": [
                    {"title": "Conventional Commits", "url": "https://www.conventionalcommits.org/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Git Fundamentals", "description": "init, add, commit, log, diff, .gitignore for mobile.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Branching & Merging", "description": "Feature branches, merge vs rebase, resolving conflicts.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Pull Requests & Code Review", "description": "PR workflow, reviewing, requesting changes, approvals.", "phase": 2, "order": 3, "estimated_minutes": 20},
                {"title": "Mobile-Specific Git", "description": "RN .gitignore, Xcode project conflicts, lockfile management.", "phase": 2, "order": 4, "estimated_minutes": 20},
                {"title": "Monorepo & Workspace Patterns", "description": "Yarn workspaces, Turborepo, sharing code between platforms.", "phase": 3, "order": 5, "estimated_minutes": 25},
            ],
        },

        # ── 3  React Native Fundamentals ──────────────────────────
        {
            "label": "React Native Fundamentals",
            "description": "The core of cross-platform mobile development. Components, styling, layout, props, state, and the React Native ecosystem.",
            "market_value": "High",
            "node_type": "core",
            "connections": [4, 5],
            "project_prompt": "Build a multi-screen mobile app (e.g., weather app or recipe browser) with at least 5 screens, API integration, and platform-specific styling.",
            "resources": {
                "primary": [
                    {"title": "React Native Official Docs", "url": "https://reactnative.dev/docs/getting-started", "type": "docs"},
                    {"title": "React Native Express", "url": "https://www.reactnative.express/", "type": "interactive"},
                ],
                "additional": [
                    {"title": "Expo Docs", "url": "https://docs.expo.dev/", "type": "docs"},
                    {"title": "William Candillon YouTube", "url": "https://www.youtube.com/@wcandillon", "type": "video"},
                    {"title": "Fireship React Native", "url": "https://www.youtube.com/watch?v=ur6I5m2nTvk", "type": "video"},
                ],
            },
            "lessons": [
                {"title": "React Native Setup & Expo", "description": "Expo vs bare workflow, create-expo-app, dev tools.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Core Components", "description": "View, Text, Image, ScrollView, FlatList, TextInput.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Styling with StyleSheet", "description": "Flexbox layout, StyleSheet.create, platform-specific styles.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "Props & State", "description": "Component props, useState, lifting state, prop drilling.", "phase": 1, "order": 4, "estimated_minutes": 25},
                {"title": "Lists & Performance", "description": "FlatList, SectionList, keyExtractor, renderItem, virtualization.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "Handling User Input", "description": "TextInput, forms, keyboard handling, validation.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "Platform APIs", "description": "Platform module, Dimensions, StatusBar, SafeAreaView.", "phase": 2, "order": 7, "estimated_minutes": 20},
                {"title": "Images & Media", "description": "Image component, caching, SVGs, responsive images.", "phase": 3, "order": 8, "estimated_minutes": 20},
                {"title": "Debugging React Native", "description": "React DevTools, Flipper, console, performance monitor.", "phase": 3, "order": 9, "estimated_minutes": 25},
                {"title": "Custom Components", "description": "Reusable component patterns, compound components, render props.", "phase": 3, "order": 10, "estimated_minutes": 25},
            ],
        },

        # ── 4  Navigation & Routing ───────────────────────────────
        {
            "label": "Navigation & Routing",
            "description": "Multi-screen apps need navigation. Master React Navigation — stacks, tabs, drawers, deep linking, and authentication flows.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [6, 7],
            "project_prompt": "Build an app with complex navigation: tab bar with nested stacks, drawer, modal screens, deep linking, and auth flow (login → main tabs).",
            "resources": {
                "primary": [
                    {"title": "React Navigation Docs", "url": "https://reactnavigation.org/docs/getting-started", "type": "docs"},
                    {"title": "Expo Router Docs", "url": "https://docs.expo.dev/router/introduction/", "type": "docs"},
                ],
                "additional": [
                    {"title": "React Navigation YouTube", "url": "https://www.youtube.com/watch?v=nQVCkqvU1uE", "type": "video"},
                ],
            },
            "lessons": [
                {"title": "Stack Navigator", "description": "createStackNavigator, screens, params, header options.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Tab Navigator", "description": "Bottom tabs, top tabs, custom tab bar, badges.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Drawer Navigator", "description": "Side drawer, custom content, combining navigators.", "phase": 1, "order": 3, "estimated_minutes": 20},
                {"title": "Nesting Navigators", "description": "Tabs inside stack, conditional navigation, TypeScript typing.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "Authentication Flow", "description": "Conditional screens, splash screen, protected routes.", "phase": 2, "order": 5, "estimated_minutes": 30},
                {"title": "Deep Linking & Universal Links", "description": "URL schemes, expo-linking, iOS/Android config.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "Screen Options & Transitions", "description": "Custom headers, transitions, shared element transitions.", "phase": 3, "order": 7, "estimated_minutes": 25},
                {"title": "Expo Router (File-Based)", "description": "File-based routing, layouts, typed routes, migration.", "phase": 3, "order": 8, "estimated_minutes": 30},
            ],
        },

        # ── 5  State Management ───────────────────────────────────
        {
            "label": "State Management",
            "description": "Manage complex app state. From React hooks through context to Zustand and React Query for server state.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [6, 7],
            "project_prompt": "Refactor an app to use proper state management: Zustand for global state, React Query for API data, and AsyncStorage for persistence.",
            "resources": {
                "primary": [
                    {"title": "Zustand GitHub", "url": "https://github.com/pmndrs/zustand", "type": "docs"},
                    {"title": "TanStack Query Docs", "url": "https://tanstack.com/query/latest/docs/framework/react/overview", "type": "docs"},
                ],
                "additional": [
                    {"title": "React Context Docs", "url": "https://react.dev/learn/passing-data-deeply-with-context", "type": "docs"},
                    {"title": "MMKV (fast storage)", "url": "https://github.com/mrousavy/react-native-mmkv", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "useState & useReducer", "description": "Local state, complex state with reducers, when to use each.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Context API", "description": "createContext, Provider, useContext, avoiding re-renders.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Zustand Basics", "description": "Creating stores, selectors, actions, devtools.", "phase": 1, "order": 3, "estimated_minutes": 25},
                {"title": "Zustand Advanced", "description": "Middleware, persist, immer, slices, computed values.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "React Query for API Data", "description": "useQuery, useMutation, caching, refetching, stale time.", "phase": 2, "order": 5, "estimated_minutes": 30},
                {"title": "Offline-First Patterns", "description": "React Query persistence, optimistic updates, sync queues.", "phase": 2, "order": 6, "estimated_minutes": 30},
                {"title": "AsyncStorage & MMKV", "description": "Local persistence, key-value storage, migration.", "phase": 3, "order": 7, "estimated_minutes": 20},
                {"title": "State Architecture Patterns", "description": "When to use what: local vs global vs server state.", "phase": 3, "order": 8, "estimated_minutes": 20},
            ],
        },

        # ── 6  Native APIs & Device Features ─────────────────────
        {
            "label": "Native APIs & Device Features",
            "description": "Access device capabilities: camera, location, notifications, biometrics, file system, and sensors through React Native bridges.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [8, 9],
            "project_prompt": "Build a feature-rich app using native APIs: camera capture, location tracking, push notifications, biometric auth, and file upload.",
            "resources": {
                "primary": [
                    {"title": "Expo SDK Reference", "url": "https://docs.expo.dev/versions/latest/", "type": "docs"},
                    {"title": "React Native Community Libraries", "url": "https://github.com/react-native-community", "type": "docs"},
                ],
                "additional": [
                    {"title": "Expo Notifications", "url": "https://docs.expo.dev/push-notifications/overview/", "type": "docs"},
                    {"title": "React Native Camera", "url": "https://mrousavy.github.io/react-native-vision-camera/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Camera & Image Picker", "description": "expo-camera, ImagePicker, permissions, image manipulation.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Location Services", "description": "Foreground/background location, geofencing, maps.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "Push Notifications", "description": "Expo push, notification handlers, channels, scheduling.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "Biometric Authentication", "description": "Face ID, Touch ID, fingerprint — expo-local-authentication.", "phase": 2, "order": 4, "estimated_minutes": 20},
                {"title": "File System & Downloads", "description": "expo-file-system, document picker, sharing files.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "Sensors & Haptics", "description": "Accelerometer, gyroscope, haptic feedback, device info.", "phase": 2, "order": 6, "estimated_minutes": 20},
                {"title": "Permissions Handling", "description": "Requesting, checking, explaining permissions, platform differences.", "phase": 3, "order": 7, "estimated_minutes": 20},
                {"title": "Native Modules & Bridges", "description": "When to use native code, Turbo Modules, Expo config plugins.", "phase": 3, "order": 8, "estimated_minutes": 30},
            ],
        },

        # ── 7  Animations & Gestures ──────────────────────────────
        {
            "label": "Animations & Gestures",
            "description": "Delightful mobile experiences need smooth animations and intuitive gestures. Master Reanimated and Gesture Handler.",
            "market_value": "Med",
            "node_type": "core",
            "connections": [8, 9],
            "project_prompt": "Build an app with rich interactions: swipeable cards (Tinder-like), drag-and-drop list, shared element transitions, and a custom pull-to-refresh.",
            "resources": {
                "primary": [
                    {"title": "Reanimated Docs", "url": "https://docs.swmansion.com/react-native-reanimated/", "type": "docs"},
                    {"title": "William Candillon Animations", "url": "https://www.youtube.com/@wcandillon", "type": "video"},
                ],
                "additional": [
                    {"title": "Gesture Handler Docs", "url": "https://docs.swmansion.com/react-native-gesture-handler/", "type": "docs"},
                    {"title": "React Native Skia", "url": "https://shopify.github.io/react-native-skia/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Animated API Basics", "description": "Animated.Value, timing, spring, interpolation.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "LayoutAnimation", "description": "Automatic layout transitions, configuring presets.", "phase": 1, "order": 2, "estimated_minutes": 20},
                {"title": "Reanimated Fundamentals", "description": "useSharedValue, useAnimatedStyle, withTiming, withSpring.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "Reanimated Worklets", "description": "UI thread animations, runOnJS, measure, scrollHandler.", "phase": 2, "order": 4, "estimated_minutes": 30},
                {"title": "Gesture Handler", "description": "Pan, pinch, rotation, tap — composing gestures.", "phase": 2, "order": 5, "estimated_minutes": 30},
                {"title": "Gesture + Animation Combos", "description": "Swipeable cards, bottom sheets, drag handles.", "phase": 2, "order": 6, "estimated_minutes": 35},
                {"title": "Shared Element Transitions", "description": "Page transitions, hero animations, navigation integration.", "phase": 3, "order": 7, "estimated_minutes": 30},
                {"title": "Advanced: Skia & Canvas", "description": "Custom drawing, paths, shaders, performant graphics.", "phase": 3, "order": 8, "estimated_minutes": 35},
            ],
        },

        # ── 8  Testing Mobile Apps ────────────────────────────────
        {
            "label": "Testing Mobile Apps",
            "description": "Ship with confidence. Unit tests, component tests, integration tests, and end-to-end testing for React Native apps.",
            "market_value": "Med",
            "node_type": "core",
            "connections": [10, 11],
            "project_prompt": "Add comprehensive tests to a React Native app: 80%+ unit test coverage, component tests with RNTL, and E2E tests with Detox or Maestro.",
            "resources": {
                "primary": [
                    {"title": "React Native Testing Library", "url": "https://callstack.github.io/react-native-testing-library/", "type": "docs"},
                    {"title": "Jest Official Docs", "url": "https://jestjs.io/docs/getting-started", "type": "docs"},
                ],
                "additional": [
                    {"title": "Detox E2E Testing", "url": "https://wix.github.io/Detox/", "type": "docs"},
                    {"title": "Maestro E2E Testing", "url": "https://maestro.mobile.dev/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Jest Fundamentals", "description": "describe, it, expect, matchers, mocking, async tests.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Testing React Native Components", "description": "RNTL, render, getByText, fireEvent, screen queries.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "Mocking in Mobile", "description": "Mocking modules, native modules, API calls, navigation.", "phase": 1, "order": 3, "estimated_minutes": 25},
                {"title": "Testing Hooks & State", "description": "renderHook, act, testing custom hooks, async state.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "Testing Navigation Flows", "description": "Mocking navigation, testing screen transitions, params.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "E2E Testing with Detox/Maestro", "description": "Setup, writing flows, CI integration, visual testing.", "phase": 3, "order": 6, "estimated_minutes": 35},
                {"title": "Testing Best Practices", "description": "What to test, coverage goals, test structure, CI setup.", "phase": 3, "order": 7, "estimated_minutes": 20},
            ],
        },

        # ── 9  Performance Optimization ───────────────────────────
        {
            "label": "Performance Optimization",
            "description": "Make your app feel native. JS thread optimization, render performance, memory management, and profiling tools.",
            "market_value": "Med-High",
            "node_type": "core",
            "connections": [10, 11],
            "project_prompt": "Audit and optimize a React Native app: identify performance issues with profiling tools, fix jank, reduce bundle size, and improve startup time.",
            "resources": {
                "primary": [
                    {"title": "RN Performance Overview", "url": "https://reactnative.dev/docs/performance", "type": "docs"},
                    {"title": "Flipper Performance Plugin", "url": "https://fbflipper.com/", "type": "docs"},
                ],
                "additional": [
                    {"title": "React DevTools Profiler", "url": "https://react.dev/learn/react-developer-tools", "type": "docs"},
                    {"title": "Callstack RN Performance", "url": "https://www.callstack.com/blog/the-ultimate-guide-to-react-native-optimization", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "RN Architecture & Bridge", "description": "JS thread, UI thread, bridge, New Architecture (Fabric/TurboModules).", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Profiling Tools", "description": "React DevTools profiler, Flipper, systrace, Performance Monitor.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "Render Optimization", "description": "React.memo, useMemo, useCallback, avoiding re-renders.", "phase": 1, "order": 3, "estimated_minutes": 25},
                {"title": "List Performance", "description": "FlatList optimization, getItemLayout, windowSize, removeClippedSubviews.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "Image Optimization", "description": "Image caching, resizing, progressive loading, FastImage.", "phase": 2, "order": 5, "estimated_minutes": 20},
                {"title": "Bundle Size Reduction", "description": "Metro bundle analysis, tree shaking, lazy loading.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "Startup Time Optimization", "description": "Hermes engine, lazy imports, splash screen strategy.", "phase": 3, "order": 7, "estimated_minutes": 25},
                {"title": "Memory Management", "description": "Memory leaks, event listener cleanup, navigation memory.", "phase": 3, "order": 8, "estimated_minutes": 25},
            ],
        },

        # ── 10  App Store & Distribution ──────────────────────────
        {
            "label": "App Store & Distribution",
            "description": "Get your app to users. App Store Connect, Google Play Console, code signing, CI/CD for mobile, and over-the-air updates.",
            "market_value": "Med",
            "node_type": "core",
            "connections": [12, 13],
            "project_prompt": "Publish an app to both stores: configure signing, build with EAS, submit for review, set up OTA updates, and create a beta testing channel.",
            "resources": {
                "primary": [
                    {"title": "EAS Build Docs", "url": "https://docs.expo.dev/build/introduction/", "type": "docs"},
                    {"title": "Apple App Store Guide", "url": "https://developer.apple.com/distribute/", "type": "docs"},
                ],
                "additional": [
                    {"title": "Google Play Console", "url": "https://play.google.com/console/about/", "type": "docs"},
                    {"title": "Fastlane", "url": "https://docs.fastlane.tools/", "type": "docs"},
                    {"title": "EAS Update (OTA)", "url": "https://docs.expo.dev/eas-update/introduction/", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "iOS Code Signing", "description": "Certificates, provisioning profiles, App Store Connect setup.", "phase": 1, "order": 1, "estimated_minutes": 30},
                {"title": "Android Signing", "description": "Keystore, build.gradle config, Google Play Console setup.", "phase": 1, "order": 2, "estimated_minutes": 25},
                {"title": "EAS Build & Submit", "description": "eas.json config, building for both platforms, submission.", "phase": 1, "order": 3, "estimated_minutes": 30},
                {"title": "App Store Optimization", "description": "Screenshots, description, keywords, ratings strategy.", "phase": 2, "order": 4, "estimated_minutes": 20},
                {"title": "Beta Testing (TestFlight/Internal)", "description": "Internal testing tracks, TestFlight, collecting feedback.", "phase": 2, "order": 5, "estimated_minutes": 20},
                {"title": "Over-the-Air Updates", "description": "EAS Update, CodePush, update policies, rollbacks.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "CI/CD for Mobile", "description": "GitHub Actions for RN, automated builds, auto-submit.", "phase": 3, "order": 7, "estimated_minutes": 30},
                {"title": "Versioning & Release Management", "description": "Semver, changelogs, release branches, staged rollouts.", "phase": 3, "order": 8, "estimated_minutes": 20},
            ],
        },

        # ── 11  UI/UX Design for Mobile ───────────────────────────
        {
            "label": "UI/UX Design for Mobile",
            "description": "Design mobile-first experiences. Platform conventions, design systems, accessibility, and prototyping for iOS and Android.",
            "market_value": "Med",
            "node_type": "core",
            "connections": [12, 13],
            "project_prompt": "Create a design system for a React Native app: themed components (light/dark), spacing scale, typography scale, and accessibility compliance.",
            "resources": {
                "primary": [
                    {"title": "Apple Human Interface Guidelines", "url": "https://developer.apple.com/design/human-interface-guidelines/", "type": "docs"},
                    {"title": "Material Design 3", "url": "https://m3.material.io/", "type": "docs"},
                ],
                "additional": [
                    {"title": "React Native Paper", "url": "https://callstack.github.io/react-native-paper/", "type": "docs"},
                    {"title": "NativeBase", "url": "https://nativebase.io/", "type": "docs"},
                    {"title": "Figma for Developers", "url": "https://www.youtube.com/watch?v=wDBimkhsLqE", "type": "video"},
                ],
            },
            "lessons": [
                {"title": "iOS vs Android Conventions", "description": "Navigation patterns, gestures, typography, platform expectations.", "phase": 1, "order": 1, "estimated_minutes": 25},
                {"title": "Design Systems for RN", "description": "Theme provider, design tokens, spacing, typography scales.", "phase": 1, "order": 2, "estimated_minutes": 30},
                {"title": "Dark Mode Implementation", "description": "useColorScheme, themed components, dynamic colors.", "phase": 1, "order": 3, "estimated_minutes": 20},
                {"title": "Responsive Design", "description": "Dimensions, useWindowDimensions, tablet layouts, orientation.", "phase": 2, "order": 4, "estimated_minutes": 25},
                {"title": "Mobile Accessibility", "description": "accessibilityLabel, roles, screen readers, contrast, font scaling.", "phase": 2, "order": 5, "estimated_minutes": 25},
                {"title": "Component Libraries", "description": "React Native Paper, Gluestack, Tamagui — choosing and customizing.", "phase": 2, "order": 6, "estimated_minutes": 25},
                {"title": "Reading Figma Designs", "description": "Dev mode, extracting specs, assets, communicating with designers.", "phase": 3, "order": 7, "estimated_minutes": 20},
                {"title": "Micro-interactions & Polish", "description": "Loading states, skeleton screens, error states, empty states.", "phase": 3, "order": 8, "estimated_minutes": 25},
            ],
        },

        # ── 12  Mobile Capstone ───────────────────────────────────
        {
            "label": "Mobile Capstone Project",
            "description": "Build a production-ready mobile app from idea to App Store. Real users, real feedback, real deployment.",
            "market_value": "High",
            "node_type": "core",
            "connections": [],
            "project_prompt": "Build and publish a complete mobile app: authentication, API integration, offline support, push notifications, dark mode, and both store submissions.",
            "resources": {
                "primary": [
                    {"title": "Expo Examples", "url": "https://docs.expo.dev/guides/overview/", "type": "docs"},
                    {"title": "React Native Directory", "url": "https://reactnative.directory/", "type": "docs"},
                ],
                "additional": [
                    {"title": "App Ideas Collection", "url": "https://github.com/florinpop17/app-ideas", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Planning & Design", "description": "User stories, wireframes, tech stack decisions, timeline.", "phase": 1, "order": 1, "estimated_minutes": 40},
                {"title": "Core Feature Development", "description": "Authentication, main screens, API integration.", "phase": 1, "order": 2, "estimated_minutes": 50},
                {"title": "Advanced Features", "description": "Notifications, offline support, animations, native APIs.", "phase": 2, "order": 3, "estimated_minutes": 50},
                {"title": "Testing & Polish", "description": "Unit tests, E2E tests, bug fixes, performance tuning.", "phase": 2, "order": 4, "estimated_minutes": 45},
                {"title": "App Store Submission", "description": "Build, screenshots, metadata, submit to both stores.", "phase": 3, "order": 5, "estimated_minutes": 40},
                {"title": "Launch & Iterate", "description": "User feedback, analytics, crash monitoring, first update.", "phase": 3, "order": 6, "estimated_minutes": 35},
            ],
        },

        # ── 13  Communication & Career Skills ─────────────────────
        {
            "label": "Communication & Career Skills",
            "description": "Collaborate with designers, product managers, and backend teams. Interview prep and portfolio building for mobile roles.",
            "market_value": "Med",
            "node_type": "soft_skill",
            "connections": [12],
            "project_prompt": "Create your mobile dev portfolio: 3 published/demo apps, a blog post about a mobile challenge, and a recorded technical presentation.",
            "resources": {
                "primary": [
                    {"title": "Technical Writing (Google)", "url": "https://developers.google.com/tech-writing", "type": "docs"},
                    {"title": "STAR Method for Interviews", "url": "https://www.themuse.com/advice/star-interview-method", "type": "docs"},
                ],
                "additional": [
                    {"title": "Mobile Dev Interview Questions", "url": "https://roadmap.sh/questions/react-native", "type": "docs"},
                ],
            },
            "lessons": [
                {"title": "Working with Design Teams", "description": "Understanding mockups, providing technical feedback, iteration.", "phase": 1, "order": 1, "estimated_minutes": 20},
                {"title": "Cross-Platform Communication", "description": "Explaining mobile constraints, platform differences, tradeoffs.", "phase": 1, "order": 2, "estimated_minutes": 20},
                {"title": "Technical Documentation", "description": "Component docs, API docs, architecture decision records.", "phase": 2, "order": 3, "estimated_minutes": 20},
                {"title": "Code Review for Mobile", "description": "RN-specific review points, performance, accessibility checks.", "phase": 2, "order": 4, "estimated_minutes": 20},
                {"title": "Mobile Interview Prep", "description": "RN internals, system design for mobile, live coding tips.", "phase": 3, "order": 5, "estimated_minutes": 30},
                {"title": "Building Your Mobile Portfolio", "description": "App demos, GitHub repos, blog, conference talks.", "phase": 3, "order": 6, "estimated_minutes": 25},
            ],
        },
    ],
}
