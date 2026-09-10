# Binaire Freznel - Model Selection Utility Assessment

A high-performance, responsive **Model Selection Utility** web app created with **React 18**, **TypeScript**, **Adobe Spectrum Design System**, **Firebase Authentication**, **IndexedDB Offline Caching**, and **Object-Oriented Programming (OOP)**.

---

## Technical Architecture & Core OOP Services

The project functional logic is structured strictly using OOP classes and principles:

- **`ModelEntity` (`src/core/models/ModelEntity.ts`)**: Represents AI model metadata with getters, formatters, and serialization methods.
- **`SearchEngine` (`src/core/services/SearchEngine.ts`)**: Implements query parameter searches (Model Name & Model Family) supporting prefix and middle substring matching.
- **`Debouncer` & `Throttler` (`src/core/services/Debouncer.ts`, `Throttler.ts`)**: Custom OOP timing control classes without external dependencies.
- **`FilterEngine` (`src/core/services/FilterEngine.ts`)**: Tag filter manager supporting Pipeline, Family, Architecture, Weight tags, and Safetensor min-to-max range boundaries.
- **`SortEngine` (`src/core/services/SortEngine.ts`)**: Comparator engine supporting Safetensor file counts and alphabetical Model Name sorting (A-Z, Z-A).
- **`AuthService` (`src/core/services/AuthService.ts`)**: Singleton class wrapping Firebase Authentication with fallback session state for offline operation.
- **`NetworkMonitor` (`src/core/services/NetworkMonitor.ts`)**: Connection listener with interactive offline simulation toggle.
- **`CacheManager` (`src/core/services/CacheManager.ts`)**: IndexedDB cache manager for full offline model access.
- **`BackgroundFetcher` (`src/core/services/BackgroundFetcher.ts`)**: Background fetch service addressing Task 2.9 (1).
- **`LargeFileStreamer` (`src/core/services/LargeFileStreamer.ts`)**: Chunked streaming and SHA-256 integrity manager addressing Task 2.9 (2).

---

## Solutions to Task 2.9 Questions

### 1. How will you solve background fetch without using async-await?
We solve this through three distinct technical mechanisms implemented in `BackgroundFetcher.ts`:
1. **ES6 Promise Chaining**: Utilizing raw `.then()`, `.catch()`, and `.finally()` promise callbacks to handle asynchronous HTTP resolution without async/await syntax.
2. **XMLHttpRequest (XHR) Event Handlers**: Utilizing classical `xhr.onload`, `xhr.onprogress`, and `xhr.onerror` event listeners for background network processing.
3. **Dedicated Web Worker Threads**: Offloading network fetch calls to a background `Worker` thread (`postMessage` & `onmessage`), keeping the browser main UI thread completely unblocked.

### 2. If the JSON file is large, how will you assure its safety and prevent corruption during download?
We guarantee file safety and anti-corruption in `LargeFileStreamer.ts` using:
1. **Chunked `ReadableStream` Reader**: Consuming response body bytes incrementally via `reader.read()` and `TextDecoder` to avoid high memory spikes.
2. **Cryptographic SHA-256 Hash Verification**: Computing `crypto.subtle.digest('SHA-256')` over accumulated binary byte buffers before parsing.
3. **Content-Length Byte Length Checks**: Verifying total received byte size against the HTTP `Content-Length` header.
4. **Atomic Commit**: Transactionally committing dataset records to IndexedDB only after passing all cryptographic and structural validations.

---

## UI Design & Theme

- Built strictly following **Adobe Spectrum** guidelines (Spectrum colors, dark/light surface tokens, typography, tag pills, action buttons, cards, and modal dialogs).
- Screen transitions and filter card layout re-orderings animated using **Framer Motion**.

---

## Getting Started

### Prerequisites
- Node.js (v18+) & npm

### Development
```bash
# Install dependencies
npm install

# Run Vite dev server
npm run dev

# Run Vitest test suite
npm test

# Production build
npm run build
```

---

## Task 1 & GitHub Submission Workflow

### 1. Star & Fork Assessment Repo via GitHub CLI:
```bash
# Star repository
gh repo star <ASSESSMENT_REPO_URL>

# Fork repository as Binaire-FreznelAI-Assessment
gh repo fork <ASSESSMENT_REPO_URL> --fork-name Binaire-FreznelAI-Assessment
```

### 2. Upload Project to GitHub under `Binaire_Freznel_Assessment`:
```bash
git init
git add .
git commit -m "feat: complete Model Selection Utility assessment"
git remote add origin https://github.com/<YOUR_USERNAME>/Binaire_Freznel_Assessment.git
git push -u origin main
```
*(Or run `scripts/github_submission.bat` on Windows)*
