export type UserRole = "physician" | "cdi" | "coder" | "admin";

export const roleLanding: Record<UserRole, string> = {
  physician: "/physician",
  cdi: "/cdi",
  coder: "/coder",
  admin: "/templates",
};

export const roleLabels: Record<UserRole, string> = {
  physician: "Physician",
  cdi: "CDI Specialist",
  coder: "Coder",
  admin: "Admin",
};
