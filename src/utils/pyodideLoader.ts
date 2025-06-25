export interface PyodideInterface {
  loadPackage: (packages: string[]) => Promise<void>;
  runPythonAsync: (code: string) => Promise<void>;
  setStdout: (options: { batched: (s: string) => void }) => void;
  runPython: (code: string) => void;
  version: string;
  // Add other properties/methods of pyodide as needed
}

declare global {
  interface Window {
    loadPyodide: (options: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

let pyodideInstance: PyodideInterface | null = null;
let pyodideLoadingPromise: Promise<PyodideInterface> | null = null;

export const getPyodide = async () => {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  if (pyodideLoadingPromise) {
    return pyodideLoadingPromise;
  }

  pyodideLoadingPromise = new Promise(async (resolve, reject) => {
    try {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.0/full/pyodide.js';
      script.async = true;

      script.onload = async () => {
        try {
          if (!window.loadPyodide) {
            throw new Error("loadPyodide not found on window after script load.");
          }
          const pyodideModule = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.0/full/'
          });
          await pyodideModule.loadPackage(['micropip']);
          console.log("Pyodide version:", pyodideModule.version);
          pyodideInstance = pyodideModule;
          resolve(pyodideInstance);
        } catch (e) {
          console.error("Error initializing Pyodide:", e);
          reject(e);
        }
      };
      script.onerror = (e) => {
        console.error("Error loading Pyodide script:", e);
        reject(new Error("Failed to load Pyodide script."));
      };

      document.head.appendChild(script);
    } catch (e) {
      reject(e);
    }
  });

  return pyodideLoadingPromise;
};