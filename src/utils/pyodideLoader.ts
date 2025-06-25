let pyodideInstance: any = null;
let pyodideLoadingPromise: Promise<any> | null = null;

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
          if (!(window as any).loadPyodide) {
            throw new Error("loadPyodide not found on window after script load.");
          }
          const pyodideModule = await (window as any).loadPyodide({
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