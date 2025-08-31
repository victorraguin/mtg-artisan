import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  border?: boolean;
}

export function Card({
  children,
  className = "",
  hover = false,
  glass = false,
  border = true,
}: CardProps) {
  const baseClasses = "bg-card rounded-3xl overflow-hidden";
  const borderClasses = border ? "border border-border/30" : "";
  const glassClasses = glass ? "glass" : "";
  const hoverClasses = hover
    ? "hover:border-primary/30 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500"
    : "";

  const classes = `${baseClasses} ${borderClasses} ${glassClasses} ${hoverClasses} ${className}`;

  return <div className={classes}>{children}</div>;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return <div className={`p-6 pb-0 ${className}`}>{children}</div>;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}
