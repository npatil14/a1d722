<immersive type="text/markdown" title="Journey Builder UI - Project Wiki">

# Journey Builder UI - Project Wiki

Welcome to the Journey Builder UI project! This application provides a user interface to visualize and manage form journeys, including the configuration of prefill data between forms.

## Table of Contents

1.  [Prerequisites](#prerequisites)
2.  [Running Locally](#running-locally)
    * [Mock Server Setup](#mock-server-setup)
    * [React App Setup](#react-app-setup)
3.  [Project Structure](#project-structure)
4.  [Extending with New Data Sources](#extending-with-new-data-sources)
5.  [Architectural Patterns & Concepts](#architectural-patterns--concepts)
6.  [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

Before you begin, ensure you have the following installed:
* Node.js (which includes npm) or Yarn.

---

## 2. Running Locally

The application consists of two main parts:
* A mock server (`frontendchallengeserver`) to provide the journey graph data.
* The React frontend application (`journey-builder`).

Both need to be running concurrently.

### Mock Server Setup

The mock server provides the necessary API endpoints that the React application will call.

1.  **Navigate to the server directory:**
    ```bash
    cd misc/frontendchallengeserver
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the server:**
    ```bash
    npm start
    ```
    This will typically run the server on `http://localhost:3000`. The server serves data from `graph.json`.

### React App Setup

This is the main user interface.

1.  **Navigate to the React app directory:**
    ```bash
    cd misc/journey-builder
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    This command, found in `package.json`, will start the Vite development server, typically on a port like `http://localhost:5173` (Vite's default) or another available port. Check your terminal output for the exact URL.

Once both are running, you can open the React app URL in your browser. The app will fetch data from the mock server.

---

## 3. Project Structure

The `misc/journey-builder/src/` directory contains the core source code:

* **`main.tsx`**: The entry point of the React application.
* **`App.tsx`**: The main application component, responsible for layout, data fetching, and overall state management.
* **`components/`**: Contains reusable React components (e.g., `FormList.tsx`, `FieldList.tsx`, `PrefillModal.tsx`).
* **`types/index.ts`**: Defines TypeScript interfaces and types used throughout the application (e.g., `Form`, `Field`, `DataSource`, `PrefillConfig`).
* **`datasources/`**: (Assumed to be created as part of the challenge solution)
    * Contains implementations for different prefill data sources.
    * `index.ts` in this folder would typically export `availableDataSources`, an array of all configured data source providers.
* **`utils/`**: (Assumed to be created as part of the challenge solution)
    * Contains utility functions, such as those for graph traversal (`graphUtils.ts`).
* **`assets/`**: Static assets like images (if any).
* **CSS Files**: Component-specific CSS files (e.g., `FormList.css`, `FieldList.css`) are co-located with their components or in a general `styles` folder. `App.css` and `index.css` provide global styles.

---

## 4\. Extending with New Data Sources

The application is designed to be extensible with new sources for prefilling form fields. This is managed by the `DataSource` interface and the `availableDataSources` array.

**Steps to Add a New Data Source:**

1\. **Create a New Provider Class:**

* In the `src/datasources/` directory, create a new TypeScript file (e.g., `MyCustomProvider.ts`).
* Define a class that implements the `DataSource` interface.
  * `id`: Provide a unique string ID for your data source (e.g., "userProfile").
  * `name`: Provide a user-friendly name (e.g., "User Profile Data").
  * `getOptions`: Implement this asynchronous method to return an array of `FieldOption` objects.

2\. **Register the New Provider:**

* Open `src/datasources/index.ts`.
* Import your new provider class.
* Add an instance of your provider to the `availableDataSources` array:

```typescript
import { MyCustomProvider } from './MyCustomProvider'; // Your new provider
import { DataSource } from '../types';

export const availableDataSources: DataSource[] = [
  new MyCustomProvider(), // Add your new provider here
];
```

The `PrefillModal` component automatically picks up new data sources from this array.


-----

## 5\. Architectural Patterns & Concepts

Understanding these patterns will help maintain and extend the application:

* **Component-Based Architecture (React)**: UI built as React components managing their own states.
* **Type Safety (TypeScript)**: Static typing using TypeScript for early error catching.
* **State Management (React Hooks)**: Application state managed via `useState` and `useEffect` hooks.
* **Data Fetching (axios in App.tsx)**: Initial data fetched using axios.
* **Dependency Graph Traversal (utils/graphUtils.ts)**: Functions for graph data processing.
* **Extensible Data Source Pattern**: Prefill system designed to easily add new sources.
* **Styling (Component-Specific CSS)**: CSS files imported directly in components.
* **Controlled Components (Forms/Inputs)**: Inputs controlled by React state.

-----

## 6\. Troubleshooting

* **Failed to load form data / Error fetching forms:**
  * Ensure mock server (`frontendchallengeserver`) runs at `http://localhost:3000`.
  * Verify API URL matches in `App.tsx`.
* **UI Not Updating:**
  * Confirm state changes trigger re-renders.
  * Check prop drilling correctness.
  * Use React Developer Tools.
* **Styling Issues:**
  * Verify CSS selectors and imports.
  * Check for style conflicts.
  * Inspect styles in browser developer tools.

</immersive>
