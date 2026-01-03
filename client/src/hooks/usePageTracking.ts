import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

const SESSION_KEY = "analytics_session_id";

function getSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function usePageTracking() {
  const [location] = useLocation();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Avoid tracking the same page twice
    if (lastTrackedPath.current === location) return;
    lastTrackedPath.current = location;

    // Don't track admin page views
    if (location.startsWith("/admin")) return;

    const sessionId = getSessionId();

    fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: location,
        referrer: document.referrer || null,
        sessionId,
      }),
    }).catch((err) => {
      console.error("Failed to track page view:", err);
    });
  }, [location]);
}
