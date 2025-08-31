import React from "react";
import { LucideIcon } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gradient";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeClasses = {
    sm: "px-4 py-2 text-sm rounded-xl",
    md: "px-6 py-3 text-sm rounded-2xl",
    lg: "px-8 py-4 text-base rounded-2xl",
  };

  const variantClasses = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl hover:shadow-primary/20",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline:
      "border border-border/30 text-foreground hover:border-primary/30 hover:text-primary glass",
    ghost: "text-muted-foreground hover:text-primary hover:bg-card/50",
    gradient: "gradient-border overflow-hidden",
  };

  const gradientContentClasses =
    variant === "gradient" ? "bg-card text-foreground hover:text-primary" : "";

  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  const content = (
    <>
      {loading && (
        <div className="mr-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {Icon && iconPosition === "left" && !loading && (
        <Icon className="mr-2 h-4 w-4" />
      )}
      <span className={variant === "gradient" ? gradientContentClasses : ""}>
        {children}
      </span>
      {Icon && iconPosition === "right" && <Icon className="ml-2 h-4 w-4" />}
    </>
  );

  if (variant === "gradient") {
    return (
      <button className={classes} disabled={disabled || loading} {...props}>
        <span
          className={`block ${sizeClasses[size]} ${gradientContentClasses}`}
        >
          {content}
        </span>
      </button>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
}
