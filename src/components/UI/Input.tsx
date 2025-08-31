import React from "react";
import { LucideIcon } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  variant?: "default" | "glass";
}

export function Input({
  label,
  error,
  icon: Icon,
  iconPosition = "left",
  variant = "default",
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const baseClasses =
    "w-full bg-card/50 border border-border/50 text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 backdrop-blur-sm";
  const variantClasses = variant === "glass" ? "glass" : "";
  const errorClasses = error
    ? "border-destructive/50 focus:border-destructive/50 focus:ring-destructive/20"
    : "";
  const iconPadding = Icon ? (iconPosition === "left" ? "pl-12" : "pr-12") : "";

  const classes = `${baseClasses} ${variantClasses} ${errorClasses} ${iconPadding} ${className}`;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && iconPosition === "left" && (
          <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
        )}

        <input
          id={inputId}
          className={`${classes} px-4 py-3 rounded-2xl`}
          {...props}
        />

        {Icon && iconPosition === "right" && (
          <Icon className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
        )}
      </div>

      {error && <p className="text-sm text-destructive/80">{error}</p>}
    </div>
  );
}
