type GapBadgeProps = {
  value: string;
  tone: "severity" | "status";
};

const severityColors: Record<string, { bg: string; color: string }> = {
  low: { bg: "#eef5ff", color: "#1f4a7c" },
  medium: { bg: "#fff4e5", color: "#8a5a00" },
  high: { bg: "#fdecec", color: "#8a2b2b" },
};

const statusColors: Record<string, { bg: string; color: string }> = {
  open: { bg: "#fff4e5", color: "#8a5a00" },
  converted: { bg: "#e8f1ff", color: "#1f4a7c" },
  closed: { bg: "#e7f5ef", color: "#1b5a3b" },
};

export function GapBadge({ value, tone }: GapBadgeProps) {
  const normalized = value.toLowerCase();
  const palette =
    tone === "severity"
      ? severityColors[normalized] ?? { bg: "#f0f0f0", color: "#444" }
      : statusColors[normalized] ?? { bg: "#f0f0f0", color: "#444" };

  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 600,
        textTransform: "capitalize",
        background: palette.bg,
        color: palette.color,
      }}
    >
      {value.replace(/_/g, " ")}
    </span>
  );
}
