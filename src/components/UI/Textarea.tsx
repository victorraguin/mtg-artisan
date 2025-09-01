import React from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  variant?: "default" | "glass";
}

export function Textarea({
  label,
  error,
  variant = "default",
  className = "",
  id,
  ...props
}: TextareaProps) {
  const textareaId =
    id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  const baseClasses =
    "w-full bg-card/50 border border-border/50 text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 backdrop-blur-sm";
  const variantClasses = variant === "glass" ? "glass" : "";
  const errorClasses = error
    ? "border-destructive/50 focus:border-destructive/50 focus:ring-destructive/20"
    : "";

  const classes = `${baseClasses} ${variantClasses} ${errorClasses} ${className}`;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}

      <textarea
        id={textareaId}
        className={`${classes} px-4 py-3 rounded-2xl resize-vertical`}
        {...props}
      />

      {error && <p className="text-sm text-destructive/80">{error}</p>}
    </div>
  );
}
