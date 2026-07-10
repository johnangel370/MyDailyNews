type LoginSearchParams = { next?: string; error?: string };

function LoginPage({ searchParams }: { searchParams?: LoginSearchParams }) {
  const next = searchParams?.next || "/";
  const hasError = searchParams?.error === "1";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b0d12",
        color: "#e6e8eb",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <form
        action="/api/login"
        method="POST"
        style={{
          background: "#151821",
          padding: "2.5rem",
          borderRadius: "12px",
          width: "320px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
        }}
      >
        <h1 style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>
          Daily AI Briefing
        </h1>
        <p style={{ color: "#9aa0aa", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
          Enter the password to view the archive.
        </p>
        <input type="hidden" name="next" value={next} />
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoFocus
          style={{
            width: "100%",
            padding: "0.6rem 0.75rem",
            borderRadius: "8px",
            border: "1px solid #2a2f3a",
            background: "#0b0d12",
            color: "#e6e8eb",
            marginBottom: "1rem",
            fontSize: "0.95rem",
            boxSizing: "border-box",
          }}
        />
        {hasError && (
          <p style={{ color: "#ff6b6b", fontSize: "0.85rem", marginBottom: "1rem" }}>
            Incorrect password.
          </p>
        )}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "0.6rem",
            borderRadius: "8px",
            border: "none",
            background: "#4c8dff",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Enter
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
