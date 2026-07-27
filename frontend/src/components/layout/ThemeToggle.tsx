"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // The resolved theme is only known client-side, so render a neutral
  // placeholder until after mount to avoid a server/client markup mismatch.
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="fixed bottom-4 right-4 z-40 h-9 w-9" aria-hidden />;
  }

  const CurrentIcon = resolvedTheme === "dark" ? Moon : Sun;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label="Change theme"
        className="fixed bottom-4 right-4 z-40 rounded-full border border-gray-200 bg-white p-2 text-gray-600 shadow-md hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <CurrentIcon className="h-5 w-5" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="top"
          align="end"
          sideOffset={8}
          className="z-50 w-36 rounded-md border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-800 dark:bg-gray-900"
        >
          {options.map(({ value, label, icon: Icon }) => (
            <DropdownMenu.Item
              key={value}
              onSelect={() => setTheme(value)}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 outline-none data-[highlighted]:bg-gray-100 dark:text-gray-300 dark:data-[highlighted]:bg-gray-800"
            >
              <Icon className="h-4 w-4" />
              {label}
              {theme === value && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
