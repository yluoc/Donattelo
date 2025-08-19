"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

export const SwitchTheme = ({ className }: { className?: string }) => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const isDarkMode = resolvedTheme === "dark";

  const handleToggle = () => {
    if (isDarkMode) {
      setTheme("light");
      return;
    }
    setTheme("dark");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={`flex flex-col items-center justify-center gap-2 pb-3 ${className}`}>
      <div className="flex flex-col items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-2">
          <input
            id="theme-toggle"
            type="checkbox"
            className="toggle bg-gradient-to-r from-purple-300 to-blue-300 dark:from-purple-600 dark:to-blue-600 border-purple-400 hover:from-purple-400 hover:to-blue-400 transition-all duration-300"
            onChange={handleToggle}
            checked={isDarkMode}
          />
          <label
            htmlFor="theme-toggle"
            className={`swap swap-rotate cursor-pointer ${!isDarkMode ? "swap-active" : ""}`}
          >
            <SunIcon className="swap-on h-5 w-5 text-orange-500 hover:text-orange-400 transition-colors" />
            <MoonIcon className="swap-off h-5 w-5 text-indigo-600 hover:text-indigo-500 transition-colors" />
          </label>
        </div>
      </div>
    </div>
  );
};
