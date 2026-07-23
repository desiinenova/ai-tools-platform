"use client";

import * as Popover from "@radix-ui/react-popover";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check, ChevronDown } from "lucide-react";
import { useId } from "react";
import { cn } from "@/lib/cn";

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  label?: string;
  placeholder?: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  error?: string;
}

export function MultiSelect({
  label,
  placeholder = "Select…",
  options,
  selected,
  onChange,
  error,
}: MultiSelectProps) {
  const id = useId();

  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  const summary =
    selected.length === 0
      ? placeholder
      : options
          .filter((o) => selected.includes(o.value))
          .map((o) => o.label)
          .join(", ");

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <Popover.Root>
        <Popover.Trigger
          id={id}
          type="button"
          className={cn(
            "flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm",
            "border-gray-300 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            selected.length === 0 && "text-gray-400 dark:text-gray-500",
            error && "border-red-500",
          )}
        >
          <span className="truncate">{summary}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="z-50 w-[--radix-popover-trigger-width] rounded-md border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-800 dark:bg-gray-900"
            sideOffset={4}
          >
            <div className="max-h-60 overflow-y-auto">
              {options.map((option) => {
                const checked = selected.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
                  >
                    <Checkbox.Root
                      checked={checked}
                      onCheckedChange={() => toggle(option.value)}
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-gray-400 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                    >
                      <Checkbox.Indicator>
                        <Check className="h-3 w-3 text-white" />
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                    {option.label}
                  </label>
                );
              })}
              {options.length === 0 && (
                <p className="px-2 py-1.5 text-sm text-gray-400">No options available</p>
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
