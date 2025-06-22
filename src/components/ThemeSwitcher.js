import React, { useContext, useCallback } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/outline";
import { ThemeContext } from "../context/ThemeContext";

const ThemeSwitcher = React.memo(() => {
  const themeContext = useContext(ThemeContext);
  
  if (!themeContext) {
    throw new Error('ThemeSwitcher deve ser usado dentro de um ThemeContext.Provider');
  }
  
  const { theme, setTheme } = themeContext;

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <button
      className="p-1 rounded-full bg-transparent focus:outline-none text-black hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white mr-4 transition-colors duration-200"
      onClick={toggleTheme}
      aria-label={`Mudar para tema ${theme === "dark" ? "claro" : "escuro"}`}
      title={`Tema atual: ${theme === "dark" ? "Escuro" : "Claro"}`}
    >
      {theme === "dark" ? (
        <SunIcon className="h-6 w-6" />
      ) : (
        <MoonIcon className="h-6 w-6" />
      )}
    </button>
  );
});

ThemeSwitcher.displayName = 'ThemeSwitcher';

export default ThemeSwitcher;
