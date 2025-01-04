import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer, Outlet, Meta, Links, ScrollRestoration, Scripts } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { useState, useRef, useEffect } from "react";
import { InteractiveBrowserCredential } from "@azure/identity";
import axios from "axios";
const ABORT_DELAY = 5e3;
function handleRequest$1(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  return isbot(request.headers.get("user-agent") || "") ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest$1
}, Symbol.toStringTag, { value: "Module" }));
const links = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous"
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
  }
];
function Layout({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Layout,
  default: App,
  links
}, Symbol.toStringTag, { value: "Module" }));
const endpoint = process.env.ENDPOINT_URL || "https://analyze23456.openai.azure.com/";
const deployment = process.env.DEPLOYMENT_NAME || "gpt-4o";
async function getAccessToken() {
  const credential = new InteractiveBrowserCredential({
    clientId: process.env.CLIENT_ID || "046506ff-553c-44a6-9555-1ce5c4b594d1",
    redirectUri: process.env.REDIRECT_URI || "http://localhost:3000"
  });
  const scope = "https://cognitiveservices.azure.com/.default";
  try {
    const tokenResponse = await credential.getToken(scope);
    return (tokenResponse == null ? void 0 : tokenResponse.token) || "";
  } catch (error) {
    console.error("Error obtaining access token:", error);
    throw new Error("Authentication failed");
  }
}
async function analyzeCode(req, res, code) {
  try {
    const accessToken = await getAccessToken();
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "api-version": "2024-05-01-preview"
    };
    const payload = {
      prompt: `Analyze the following code:

${code}`,
      max_tokens: 150
    };
    const response = await axios.post(
      `${endpoint}/openai/deployments/${deployment}/completions`,
      payload,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error("Error analyzing code:", error.message);
    throw new Error("Error analyzing code");
  }
}
async function generateTestCases(req, res) {
  const { code } = req.body;
  if (!code) {
    res.status(400).json({ error: "Code is required" });
    return;
  }
  try {
    const accessToken = await getAccessToken();
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "api-version": "2024-05-01-preview"
    };
    const payload = {
      prompt: `Generate test cases for the following code:

${code}`,
      max_tokens: 150
    };
    const response = await axios.post(
      `${endpoint}/openai/deployments/${deployment}/completions`,
      payload,
      { headers }
    );
    const testCases = response.data.choices.map((choice) => choice.text.trim());
    res.status(200).json({ testCases });
  } catch (error) {
    console.error("Error generating test cases:", error.message);
    res.status(500).json({ error: "Error generating test cases" });
  }
}
async function handleRequest(req, res, callback) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const { code } = req.body;
  if (!code) {
    res.status(400).json({ error: "Code is required" });
    return;
  }
  try {
    const analysisResult = await analyzeCode(req, res, code);
    res.status(200).json({
      analysis: analysisResult
    });
    callback == null ? void 0 : callback();
  } catch (error) {
    res.status(500).json({
      error: "Error analyzing code",
      details: error.message || "Unknown error"
    });
  }
}
const Home = () => {
  const [code, setCode] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [testCases, setTestCases] = useState(null);
  const fileInputRef = useRef(null);
  const openFile = (event) => {
    var _a;
    const file = (_a = event.target.files) == null ? void 0 : _a[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        var _a2;
        setCode((_a2 = e.target) == null ? void 0 : _a2.result);
      };
      reader.readAsText(file);
    }
  };
  const analyzeFile = async () => {
    if (!code) {
      setAnalysisResult({ error: "No code to analyze" });
      setTestCases(null);
      return;
    }
    try {
      const req = { body: { code }, method: "POST" };
      const res = {
        status: (statusCode) => ({
          json: (data) => {
            if (statusCode === 200) {
              setAnalysisResult(data.analysis);
            } else {
              setAnalysisResult({ error: data.error || "Error analyzing code" });
            }
          }
        })
      };
      await handleRequest(req, res);
      const testCasesResult = await generateTestCases(req, code);
      setTestCases(testCasesResult);
    } catch (error) {
      setAnalysisResult({ error: "Error analyzing code" });
      setTestCases(null);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center p-8 bg-background min-h-screen", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-4xl font-extrabold text-primary mb-6", children: "Code Analyzer" }),
    /* @__PURE__ */ jsx("p", { className: "text-lg text-textSecondary mb-10", children: "Easily analyze and debug your JavaScript/TypeScript code!" }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => {
          var _a;
          return (_a = fileInputRef.current) == null ? void 0 : _a.click();
        },
        className: "w-full max-w-md px-6 py-3 bg-primary text-white rounded-lg shadow-md hover:bg-indigo-600 transition-all ease-in-out duration-300 transform hover:scale-105 mb-4",
        children: "Open File"
      }
    ),
    /* @__PURE__ */ jsx(
      "input",
      {
        ref: fileInputRef,
        type: "file",
        className: "hidden",
        onChange: openFile,
        accept: ".js,.jsx,.ts,.tsx"
      }
    ),
    /* @__PURE__ */ jsx(
      "textarea",
      {
        value: code,
        readOnly: true,
        className: "w-full max-w-3xl h-64 p-4 bg-gray-100 border border-borderColor rounded-md text-sm font-mono text-gray-700 resize-none shadow-sm mb-6"
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: analyzeFile,
        className: "w-full max-w-md px-6 py-3 bg-secondary text-white rounded-lg shadow-md hover:bg-orange-600 transition-all ease-in-out duration-300 transform hover:scale-105",
        children: "Analyze Code"
      }
    ),
    analysisResult && /* @__PURE__ */ jsxs("div", { className: "w-full max-w-3xl p-6 bg-white shadow-lg rounded-lg mt-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-primary mb-4", children: "Analysis Results" }),
      /* @__PURE__ */ jsx("pre", { className: "text-sm text-textPrimary whitespace-pre-wrap", children: JSON.stringify(analysisResult, null, 2) })
    ] }),
    testCases && /* @__PURE__ */ jsxs("div", { className: "w-full max-w-3xl p-6 bg-white shadow-lg rounded-lg mt-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-secondary mb-4", children: "Generated Test Cases" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          value: JSON.stringify(testCases, null, 2),
          readOnly: true,
          className: "w-full h-64 p-4 bg-gray-100 border border-borderColor rounded-md text-sm font-mono text-gray-700 resize-none shadow-sm"
        }
      )
    ] })
  ] });
};
const fetchData = async () => {
  try {
    const req = {
      method: "POST",
      body: { code: 'console.log("Hello, World!");' }
      // Example code for testing
    };
    let response = {};
    const res = {
      status: (statusCode) => {
        response.statusCode = statusCode;
        return res;
      },
      json: (data) => {
        response.data = data;
      }
    };
    await handleRequest(req, res);
    if (response.statusCode !== 200) {
      throw new Error(response.data.error || "Error fetching data");
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error instanceof Error ? error.message : "Unknown error");
    return { message: "Error fetching data" };
  }
};
function Index() {
  const [data, setData] = useState({ message: "" });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  useEffect(() => {
    const getData = async () => {
      setIsAnalyzing(true);
      const result = await fetchData();
      setData(result);
      setIsAnalyzing(false);
    };
    getData();
  }, []);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h1", { children: data.message || "Welcome to the Code Analyzer App" }),
    isAnalyzing && /* @__PURE__ */ jsx("p", { children: "Analyzing code, please wait..." }),
    /* @__PURE__ */ jsx(Home, {})
  ] });
}
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index,
  fetchData
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-s0_UPgK4.js", "imports": ["/assets/jsx-runtime-56DGgGmo.js", "/assets/components-Bc0t_XVM.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-Cd3TL2Vr.js", "imports": ["/assets/jsx-runtime-56DGgGmo.js", "/assets/components-Bc0t_XVM.js"], "css": ["/assets/root-e-Nby2fg.css"] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-Ca5oQdzn.js", "imports": ["/assets/jsx-runtime-56DGgGmo.js"], "css": [] } }, "url": "/assets/manifest-c4a69666.js", "version": "c4a69666" };
const mode = "production";
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "v3_fetcherPersist": true, "v3_relativeSplatPath": true, "v3_throwAbortReason": true, "v3_routeConfig": false, "v3_singleFetch": true, "v3_lazyRouteDiscovery": true, "unstable_optimizeDeps": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
