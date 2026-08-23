"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: "serif", backgroundColor: "#FBF9F5", color: "#111111" }}>
        <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: "1.5rem", textAlign: "center" }}>
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E6DCB8", borderRadius: "1rem", padding: "2.5rem", maxWidth: "28rem", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
            <h1 style={{ fontSize: "1.875rem", margin: "0 0 0.75rem 0", color: "#111111" }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#2D3748", marginBottom: "1.5rem", lineHeight: 1.6 }}>
              A critical application error occurred. Click below to refresh the application.
            </p>
            <button
              onClick={() => reset()}
              style={{
                background: "linear-gradient(135deg, #C5A059, #9A7B38)",
                color: "#FFFFFF",
                fontWeight: 600,
                borderRadius: "9999px",
                padding: "0.75rem 2rem",
                border: "none",
                cursor: "pointer",
                textTransform: "uppercase",
                fontSize: "0.8125rem",
                letterSpacing: "0.05em",
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
