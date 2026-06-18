import React from "react";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "alta"
  | "media"
  | "baja"
  | "recibida"
  | "en-revision"
  | "resuelta";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
  // Urgencia
  alta: "bg-red-100 text-red-700",
  media: "bg-yellow-100 text-yellow-700",
  baja: "bg-green-100 text-green-700",
  // Estado
  recibida: "bg-blue-100 text-blue-700",
  "en-revision": "bg-orange-100 text-orange-700",
  resuelta: "bg-green-100 text-green-700",
};

export default function Badge({
  variant = "default",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}

/** Maps urgencia string to its Badge variant */
export function urgenciaBadgeVariant(
  urgencia: string
): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    Alta: "alta",
    Media: "media",
    Baja: "baja",
  };
  return map[urgencia] ?? "default";
}

/** Maps estado string to its Badge variant */
export function estadoBadgeVariant(estado: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    Recibida: "recibida",
    "En revisión": "en-revision",
    Resuelta: "resuelta",
  };
  return map[estado] ?? "default";
}
