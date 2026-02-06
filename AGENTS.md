# AGENTS.md

## Overview
This file serves as a guide for agents working on the `imgexpress` project. The goal is to ensure consistency in development practices, code style, and the use of build, lint, and test tools.

### Key Tools and Frameworks
- **Framework**: Next.js 16.1.6 (App Router)
- **UI Library**: React 19.2.0
- **Animation**: Framer Motion 12.30.0
- **Image Compression**: browser-image-compression
- **Linting**: ESLint with Next.js config
- **State Management**: React Hooks (useState, useEffect, etc.)

## Project Structure
```
imgexpress/
├── src/
│   ├── app/              # Next.js App Router pages and API routes
│   │   ├── api/          # API endpoints
│   │   │   ├── auth/     # Authentication
│   │   │   ├── contacts/ # Contact form
│   │   │   ├── images/   # Image listing API
│   │   │   ├── music/    # Music data
│   │   │   ├── posts/    # Blog posts
│   │   │   └── upload/   # File upload
│   │   ├── blog/         # Blog pages
│   │   ├── imgcompress/  # Image compression tool
│   │   ├── layout.js     # Root layout
│   │   └── page.js       # Home page
│   ├── components/       # Reusable React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   ├── utils/            # Helper functions
│   ├── data/             # Static data
│   ├── assets/           # Static assets
│   └── *.css             # Global styles
├── public/               # Static files (images, fonts, etc.)
│   ├── img/              # Photo gallery images
│   └── font/             # Custom fonts
├── data/                 # JSON data files
│   ├── contacts.json     # Contact submissions
│   └── posts.json        # Blog posts
├── next.config.mjs       # Next.js configuration
├── package.json          # Dependencies and scripts
└── .env.local            # Environment variables

```

## Commands
### Development
- **Start Development Server**:
  ```bash
  npm run dev
  ```
  Runs Next.js development server with hot reload on http://localhost:3000

### Build
- **Build for Production**:
  ```bash
  npm run build
  ```
  Creates optimized production build in `.next/` directory

### Production
- **Start Production Server**:
  ```bash
  npm run start
  ```
  Starts the Next.js production server

### Lint
- **Run ESLint**:
  ```bash
  npm run lint
  ```
  Checks code for linting issues using Next.js ESLint config

---

## Code Style Guidelines
### General
- **Language**: JavaScript/JSX with ES Modules
- **ECMAScript Version**: ES2020+
- **File Extensions**: `.js` and `.jsx`
- **Framework**: Next.js 16 with React 19
- **Directory Convention**: Use lowercase with hyphens for Next.js routes

### Imports
- Group imports logically:
  1. **React and Next.js** first (e.g., `'react'`, `'next/link'`)
  2. **Third-party libraries** second (e.g., `'framer-motion'`, `'lucide-react'`)
  3. **Internal components and utilities** third
  4. **CSS imports** last
- Use absolute imports where applicable
- Example:
  ```js
  'use client';
  
  import React, { useState } from 'react';
  import Link from 'next/link';
  import { motion } from 'framer-motion';
  import PhotoGallery from '../components/PhotoGallery';
  import './styles.css';
  ```

### Client vs Server Components
- **Server Components** (default): Use for data fetching and static content
- **Client Components**: Use `'use client'` directive for:
  - Interactive features (useState, useEffect)
  - Event handlers
  - Browser APIs
  - Animation libraries (Framer Motion)

### Formatting
- Indentation: 2 spaces
- Line Length: 100 characters recommended
- Quotes: Single quotes (`'`) for JavaScript, double quotes (`"`) for JSX props
- Semicolons: Optional but consistent
- Trailing Commas: Use for multi-line objects/arrays

### Naming Conventions
- **Files**: 
  - Use kebab-case for route files: `img-compress/page.js`
  - Use PascalCase for React components: `PhotoGallery.jsx`
  - Use camelCase for utilities: `compressor.js`
- **Variables**: Use camelCase
  - Example: `const imageCache = {}`
- **Constants**: Use UPPER_SNAKE_CASE
  - Example: `const MAX_FILE_SIZE = 10`
- **Components**: Use PascalCase
  - Example: `function PhotoGallery() {}`

### Error Handling
- Always handle async operations with `try/catch`:
  ```js
  try {
    const data = await fetch('/api/images/list');
    const json = await data.json();
  } catch (error) {
    console.error('Failed to load:', error);
  }
  ```
- Use meaningful error messages
- Display user-friendly error states in UI

### React-specific Patterns
- **Component Structure**:
  - Prefer function components with hooks
  - Use `'use client'` for client-side interactivity
- **Hooks**:
  - Follow the [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
  - Use `useCallback` and `useMemo` for optimization
  - Example:
    ```js
    const handleClick = useCallback(() => {
      // handler logic
    }, [dependencies]);
    ```
- **JSX**:
  - Always close JSX tags
  - Use meaningful `key` props for lists:
    ```jsx
    {items.map((item) => (
      <div key={item.id}>{item.name}</div>
    ))}
    ```
  - Use fragments (`<>`) when needed

### Next.js-specific Patterns
- **API Routes**: Place in `src/app/api/`
  - Use route handlers: `export async function GET() {}`
  - Return `NextResponse.json(data)`
- **Metadata**: Export metadata object in page files
- **Image Optimization**: Use Next.js `<Image>` component when possible
- **Dynamic Routes**: Use `[param]` folder naming

### ESLint Rules
- Extends:
  - `eslint:recommended`
  - `next/core-web-vitals`
- Specific Configurations:
  - Warn on unused variables
  - Allow JSX in `.js` extensions
  - Enforce component naming conventions

### Mobile Optimization
- Always consider mobile-first responsive design
- Use media queries for breakpoints:
  - `@media (max-width: 768px)` - Tablet and mobile
  - `@media (max-width: 480px)` - Small mobile
- Ensure touch-friendly button sizes (min 44px)
- Add viewport meta tags
- Use touch gestures where appropriate

---

## API Endpoints

### Images
- `GET /api/images/list` - Returns array of compressed images from `/public/img/`
  - Filters: Only `compressed-*` files
  - Returns: `[{ src: '/img/...', caption: '...' }]`

### Blog
- `GET /api/posts` - List all blog posts
- `GET /api/posts/[id]` - Get single post
- `POST /api/posts` - Create new post

### Contacts
- `POST /api/contacts` - Submit contact form

### Music
- `GET /api/music` - Get music playlist data

---

This document ensures consistency for both human and agent contributors. Update as the project evolves.