// Setup type definitions for the worker scope
/// <reference lib="webworker" />

// @ts-expect-error self is needed for worker scope but conflicts with DOM types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const self: any;

// Import Pyodide from CDN
importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.0/full/pyodide.js");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pyodide: any = null;

const loadPyodideAndPackages = async () => {
  try {
    pyodide = await self.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.0/full/",
    });
    await pyodide.loadPackage(["micropip"]);
    self.postMessage({ type: "READY" });
  } catch (error) {
    self.postMessage({
      type: "ERROR",
      error: `Failed to load Pyodide: ${error}`,
    });
  }
};

const pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event) => {
  await pyodideReadyPromise;
  const { id, type, code, packageName } = event.data;

  try {
    if (type === "RUN_CODE") {
      pyodide.setStdout({
        batched: (s: string) => {
          self.postMessage({ type: "OUTPUT", output: s, id });
        },
      });

      // Ensure stdin/stdout flows nicely
      pyodide.runPython('import os; os.environ["PYTHONUNBUFFERED"] = "1"');

      await pyodide.runPythonAsync(code);
      self.postMessage({ type: "COMPLETE", id });
    } else if (type === "INSTALL_PACKAGE") {
      await pyodide.runPythonAsync(`
        import micropip
        await micropip.install('${packageName}')
      `);
      self.postMessage({ type: "PACKAGE_INSTALLED", packageName, id });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    self.postMessage({ type: "ERROR", error: error.toString(), id });
  }
};
