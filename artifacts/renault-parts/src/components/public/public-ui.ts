export const publicTheme = {
  page: "#f6f7fb",
  pageAlt: "#eef2f7",
  surface: "#ffffff",
  surfaceAlt: "#f8fafc",
  surfaceSoft: "#fffaf1",
  border: "#e2e8f0",
  borderStrong: "#d7dee8",
  text: "#0f172a",
  textSoft: "#334155",
  muted: "#64748b",
  mutedSoft: "#94a3b8",
  brand: "#c8974a",
  brandStrong: "#b78337",
  brandSoft: "rgba(200, 151, 74, 0.12)",
  info: "#2563eb",
  infoSoft: "rgba(37, 99, 235, 0.1)",
  success: "#15803d",
  successSoft: "rgba(21, 128, 61, 0.1)",
  warning: "#d97706",
  warningSoft: "rgba(217, 119, 6, 0.1)",
  shadow: "0 18px 40px rgba(15, 23, 42, 0.07)",
  shadowSoft: "0 10px 24px rgba(15, 23, 42, 0.05)",
};

export const publicStyles = {
  hero: {
    background:
      "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(250,248,243,0.88) 48%, rgba(246,247,251,1) 100%)",
    borderBottom: `1px solid ${publicTheme.border}`,
  },
  heroGlow: {
    background:
      "radial-gradient(ellipse, rgba(200,151,74,0.12), transparent 68%)",
  },
  shell: {
    background: publicTheme.page,
  },
  card: {
    background: publicTheme.surface,
    border: `1px solid ${publicTheme.border}`,
    boxShadow: publicTheme.shadowSoft,
    borderRadius: 24,
  },
  cardMuted: {
    background:
      "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.96))",
    border: `1px solid ${publicTheme.border}`,
    boxShadow: publicTheme.shadowSoft,
    borderRadius: 24,
  },
  input: {
    background: publicTheme.surface,
    border: `1px solid ${publicTheme.borderStrong}`,
    color: publicTheme.text,
  },
};
