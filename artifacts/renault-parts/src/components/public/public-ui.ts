export const publicTheme = {
  page: "#f7f4ee",
  pageAlt: "#edf3f8",
  surface: "#fffdfa",
  surfaceAlt: "#f8f3ea",
  surfaceSoft: "#fff5de",
  border: "#e7e1d5",
  borderStrong: "#d8d3c8",
  text: "#172033",
  textSoft: "#43506a",
  muted: "#6b7588",
  mutedSoft: "#9aa3b2",
  brand: "#c8974a",
  brandStrong: "#b78337",
  brandSoft: "rgba(200, 151, 74, 0.16)",
  brandGradient: "linear-gradient(135deg,#c8974a 0%, #e4b76d 100%)",
  info: "#2563eb",
  infoSoft: "rgba(37, 99, 235, 0.11)",
  success: "#18794e",
  successSoft: "rgba(24, 121, 78, 0.12)",
  warning: "#c46b18",
  warningSoft: "rgba(196, 107, 24, 0.12)",
  violet: "#7c63d6",
  violetSoft: "rgba(124, 99, 214, 0.12)",
  shadow: "0 18px 40px rgba(15, 23, 42, 0.07)",
  shadowSoft: "0 10px 24px rgba(15, 23, 42, 0.05)",
};

export const publicStyles = {
  hero: {
    background:
      "linear-gradient(180deg, rgba(255,252,246,1) 0%, rgba(255,246,226,0.78) 44%, rgba(238,244,250,0.96) 100%)",
    borderBottom: `1px solid ${publicTheme.border}`,
  },
  heroGlow: {
    background:
      "radial-gradient(circle at 30% 40%, rgba(200,151,74,0.18), transparent 58%), radial-gradient(circle at 72% 28%, rgba(37,99,235,0.08), transparent 54%)",
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
      "linear-gradient(180deg, rgba(255,253,250,1), rgba(251,247,240,0.96))",
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
