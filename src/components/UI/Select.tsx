import React from "react";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
  variant?: "default" | "glass";
}

export function Select({
  label,
  error,
  options,
  placeholder,
  onChange,
  variant = "default",
  className = "",
  id,
  value,
  ...props
}: SelectProps) {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  const baseClasses =
    "w-full bg-card/50 border border-border/50 text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 backdrop-blur-sm";
  const variantClasses = variant === "glass" ? "glass" : "";
  const errorClasses = error
    ? "border-destructive/50 focus:border-destructive/50 focus:ring-destructive/20"
    : "";

  const classes = `${baseClasses} ${variantClasses} ${errorClasses} ${className}`;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          className={`${classes} px-4 py-3 rounded-2xl appearance-none pr-10`}
          value={value}
          onChange={handleChange}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
      </div>

      {error && <p className="text-sm text-destructive/80">{error}</p>}
    </div>
  );
}
