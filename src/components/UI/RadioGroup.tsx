import React from "react";

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  label?: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function RadioGroup({
  label,
  options,
  value,
  onChange,
  className = "",
}: RadioGroupProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-4">
          {label}
        </label>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {options.map((option) => (
          <label
            key={option.value}
            className={`border-2 rounded-2xl p-4 md:p-6 cursor-pointer transition-all duration-300 ${
              value === option.value
                ? "border-primary bg-primary/10 scale-[1.02]"
                : "border-border hover:border-primary/30 hover:scale-[1.02]"
            }`}
          >
            <input
              type="radio"
              name={label}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="sr-only"
            />
            <div className="text-center">
              <div className="text-lg md:text-xl font-medium text-foreground">
                {option.label}
              </div>
              {option.description && (
                <div className="text-xs md:text-sm text-muted-foreground mt-1">
                  {option.description}
                </div>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
