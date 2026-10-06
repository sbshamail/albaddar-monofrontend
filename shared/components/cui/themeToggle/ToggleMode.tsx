"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "../../ui/button";
import { useTheme } from "../../../providers/theme/themeContext";

const ToggleMode = () => {
  const { mode, toggleMode } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleMode}
      aria-label={
        mode === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
      className="relative overflow-hidden"
    >
      <Sun className="size-[1.15rem] rotate-0 scale-100 transition-transform duration-500 ease-out dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-[1.15rem] rotate-90 scale-0 transition-transform duration-500 ease-out dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ToggleMode;
