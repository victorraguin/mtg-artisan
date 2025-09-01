import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="glass w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-border/30">
        <Icon className="h-10 w-10 text-muted-foreground/60" />
      </div>

      <h3 className="text-xl font-light text-foreground mb-2 tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="text-muted-foreground/70 text-sm mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button
          variant="gradient"
          size="lg"
          icon={ActionIcon}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
