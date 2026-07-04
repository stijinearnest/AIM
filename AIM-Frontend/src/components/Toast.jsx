export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isError = toast.type === "error";

  return (
    <div style={styles.wrap} role="status" aria-live="polite">
      <div
        style={{
          ...styles.toast,
          borderColor: isError ? "rgba(248, 113, 113, 0.35)" : "rgba(52, 211, 153, 0.35)",
          color: isError ? "#fecaca" : "#d1fae5",
        }}
      >
        <span
          style={{
            ...styles.dot,
            background: isError ? "#f87171" : "#34d399",
          }}
        />
        <span style={styles.message}>{toast.message}</span>
        <button type="button" style={styles.close} onClick={onClose} aria-label="Dismiss notification">
          x
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    position: "fixed",
    top: "22px",
    right: "22px",
    zIndex: 100000,
    maxWidth: "min(420px, calc(100vw - 32px))",
  },
  toast: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 14px",
    background: "rgba(5, 9, 7, 0.94)",
    border: "1px solid",
    borderRadius: "10px",
    boxShadow: "0 18px 50px rgba(0,0,0,0.42)",
    backdropFilter: "blur(12px)",
    fontSize: "14px",
    fontWeight: 500,
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  message: {
    minWidth: 0,
    lineHeight: 1.35,
  },
  close: {
    width: "26px",
    height: "26px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "4px",
    border: "none",
    borderRadius: "6px",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.75)",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "14px",
    lineHeight: 1,
  },
};
