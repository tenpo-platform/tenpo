"use client";

import * as Sentry from "@sentry/nextjs";

export default function SentryExamplePage() {
  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Sentry Example Page</h1>
      <p>Click the buttons below to test Sentry error tracking.</p>

      <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => {
            throw new Error("Sentry Frontend Test Error");
          }}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Throw Client Error
        </button>

        <button
          type="button"
          onClick={async () => {
            const res = await fetch("/api/sentry-example-api");
            if (!res.ok) {
              alert("API error triggered! Check Sentry.");
            }
          }}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#9b59b6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Trigger API Error
        </button>

        <button
          type="button"
          onClick={() => {
            Sentry.captureMessage("Test message from Sentry Example Page");
            alert("Message sent to Sentry!");
          }}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Send Test Message
        </button>
      </div>

      <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
        <h3 style={{ margin: "0 0 0.5rem 0" }}>What each button does:</h3>
        <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
          <li><strong>Throw Client Error</strong> - Throws an unhandled error in the browser</li>
          <li><strong>Trigger API Error</strong> - Calls an API route that throws a server error</li>
          <li><strong>Send Test Message</strong> - Sends a manual message to Sentry (not an error)</li>
        </ul>
      </div>
    </div>
  );
}
