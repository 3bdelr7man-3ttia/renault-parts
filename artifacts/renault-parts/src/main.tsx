import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/responsive.css";

const STAGING_SSLIP_SUFFIX = ".72.60.104.30.sslip.io";
const STAGING_API_ORIGIN = "http://jcww080googo4wkooc80wso4.72.60.104.30.sslip.io";

function getApiOrigin() {
  if (typeof window === "undefined") return "";

  const host = window.location.hostname;
  if (host.endsWith(STAGING_SSLIP_SUFFIX)) {
    return STAGING_API_ORIGIN;
  }

  return "";
}

function rewriteApiTarget(input: RequestInfo | URL): RequestInfo | URL {
  const apiOrigin = getApiOrigin();
  if (!apiOrigin) return input;

  if (typeof input === "string") {
    if (input.startsWith("/api/") || input.startsWith("/uploads/")) {
      return `${apiOrigin}${input}`;
    }
    return input;
  }

  if (input instanceof URL) {
    if (input.origin === window.location.origin && (input.pathname.startsWith("/api/") || input.pathname.startsWith("/uploads/"))) {
      return new URL(`${apiOrigin}${input.pathname}${input.search}`);
    }
    return input;
  }

  const requestUrl = new URL(input.url, window.location.origin);
  if (requestUrl.origin === window.location.origin && (requestUrl.pathname.startsWith("/api/") || requestUrl.pathname.startsWith("/uploads/"))) {
    return new Request(`${apiOrigin}${requestUrl.pathname}${requestUrl.search}`, input);
  }

  return input;
}

if (typeof window !== "undefined" && !(window as Window & { __renopackFetchPatched__?: boolean }).__renopackFetchPatched__) {
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => originalFetch(rewriteApiTarget(input), init);
  (window as Window & { __renopackFetchPatched__?: boolean }).__renopackFetchPatched__ = true;
}

createRoot(document.getElementById("root")!).render(<App />);
