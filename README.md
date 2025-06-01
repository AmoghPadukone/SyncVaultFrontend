 
# 💻 SyncVault Frontend Prototype

This is the **frontend prototype** for **SyncVault** — a next-gen cloud orchestration platform. Built with **Next.js**, it offers a clean, reactive UI to showcase the platform’s **core features** like file management, multi-cloud interaction, and user authentication.

> ⚠️ This is a **work-in-progress (WIP)** prototype designed to run and demo the backend APIs and Nubilo SDK integrations.

---

## 🧱 Tech Stack

| Layer         | Tech Used                      |
|---------------|--------------------------------|
| Framework     | [Next.js](https://nextjs.org)  |
| Language      | TypeScript                     |
| Styling       | Tailwind CSS                   |
| State Mgmt    | React Hooks + Local State (WIP for Zustand) |
| Auth          | JWT-based (client-side session)|
| UI Components | Custom + Headless UI (WIP)     |

---

## ⚙️ Core Features

- 🔐 **JWT Auth Integration** with backend
- 📁 **File Upload Interface** using `FormData` and `multer` endpoint
- ☁️ **Multi-cloud Interaction** using Nubilo SDK (AWS/GCP)
- 🗂️ **File Browsing UI** (read-only prototype)
- 📊 **Storage Metrics Preview** (mocked for now)
- 🧪 **Developer Playground** to test SDK endpoints visually

---

## 🧩 Project Structure

```plaintext
.
├── pages/              # Next.js route pages
│   ├── index.tsx       # Landing page
│   ├── dashboard.tsx   # Main file management view
│   └── api/            # API routes (if needed for proxying)
├── components/         # UI components
├── lib/                # SDK wrappers, utils, fetch clients
├── hooks/              # Custom React hooks
├── styles/             # Tailwind and global CSS
└── types/              # Shared TypeScript types
```

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/your-org/syncvault-frontend.git
cd syncvault-frontend
npm install
```

### 2. Setup `.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

### 3. Run the App

```bash
npm run dev
```

App should be available at [http://localhost:3000](http://localhost:3000)

---

## 🔄 Backend Integration

Ensure your backend is running on `http://localhost:5000` (or update the `API_BASE_URL` in your `.env.local` file).

---

## 🎯 Development Goals

This frontend prototype focuses on:

* ✅ Connecting with the backend APIs
* ✅ Demonstrating the Nubilo SDK file operations
* 🧪 Previewing basic UI/UX workflows
* 🛠 Experimenting with developer tools & interactions
* 🚧 Gathering feedback before scaling up

---

## 🛠 Dev Scripts

| Script           | Description                 |
| ---------------- | --------------------------- |
| `npm run dev`    | Start dev server            |
| `npm run build`  | Build production bundle     |
| `npm start`      | Run production build        |
| `npm run lint`   | Lint codebase using ESLint  |
| `npm run format` | Format files using Prettier |

---

## 🧭 Roadmap (Frontend)

* [x] Authentication flow
* [x] File upload & listing
* [ ] Dynamic storage visualizations
* [ ] Cloud provider selector & toggle
* [ ] File preview/download support
* [ ] Role-based frontend UI (admin/user)

---

## 🧩 Design Principles

* 🧼 Clean and minimal UI (Tailwind CSS based)
* 🧠 Clear user intent: visibility, control, and insight
* ⚙️ Modular hooks and service separation
* 📦 Easy integration with Nubilo SDK (plug-and-play)

---

## 🤝 Contributing

This is an early-phase prototype. If you're interested in contributing or suggesting UI improvements, please open an issue or submit a PR!

---

## 📄 License

MIT © 2025 SyncVault Team

```