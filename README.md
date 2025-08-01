# form-pdf-ui

Form PDF UI is a modern frontend application built with React, Vite, and TailwindCSS, designed for creating, editing, and previewing PDF forms. It integrates rich text editing via Editor.js plugins and PDF manipulation tools to provide a seamless document workflow.

## Purpose

- Provide a user interface for generating and editing PDF-based forms.
- Demonstrate how to structure a React + Vite project with Bun as the runtime.
- Showcase integration of Editor.js with PDF handling in a frontend environment.

## Technologies Used

- **React 19**: UI library for building components.
- **Vite 6**: Fast development and build tool.
- **TailwindCSS 4**: Utility-first CSS framework.
- **Bun**: JavaScript/TypeScript runtime for dev/build scripts.
- **TypeScript**: Type-safe JavaScript.
- **Editor.js**: Rich text and block-style editor.
- **PDF Tools**: react-pdf-viewer, pdf-lib, signature_pad.

## Directory Structure

```
form-pdf-ui/
├── public/                 # Static assets and public files
│   ├── assets/             # Images, fonts, etc.
│   ├── locales/            # Localization files
├── src/                    # Main source code
│   ├── @types/             # TypeScript type definitions
│   ├── components/         # React components
│   ├── lib/                # Utilities and shared logic
│   ├── pages/              # Application pages
│   └── styles/             # Global and TailwindCSS styles
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── bunfig.toml             # Bun configuration (if using Bun paths)
```

## Environment Configuration

Environment variables used by Vite are defined in `.env`:

```sh
# Port for the development server
VITE_PORT=35500

# Application version injected into the build
VITE_APP_VERSION=
```

## How to Run the Project

### Install Dependencies

```bash
bun install
```

### Development

```bash
bun run dev
```

### Build for Production

```bash
bun run build
```

### Preview Production Build

```bash
bun run preview
```

## Access

```bash
# Development server
http://localhost:35500

# Production preview (default)
http://localhost:35500
```