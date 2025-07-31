import { PaletteIcon } from "lucide-react";
import useThemeStore from "../store/useThemeStore";
import { THEMES } from "../constants";

const ThemeSelector = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="dropdown dropdown-end">
      {/* DROPDOWN TRIGGER */}
      <button
        tabIndex={0}
        className="btn btn-ghost btn-circle hover:bg-primary/10 focus:ring-2 focus:ring-primary"
        aria-label="Open theme selector"
      >
        <PaletteIcon className="size-5 text-primary" />
      </button>

      <div
        tabIndex={0}
        className="dropdown-content mt-2 p-2 shadow-xl bg-base-200 border border-primary/50 rounded-lg w-64 max-h-80 overflow-y-auto z-50"
      >
        <div className="space-y-2">
          {THEMES.map(themeOption => (
            <button
              key={themeOption.name}
              className={`
                w-full px-4 py-2 rounded-lg flex items-center gap-3 transition-all duration-200
                ${
                  theme === themeOption.name
                    ? "bg-gradient-to-r from-primary to-secondary text-white"
                    : "hover:bg-base-300 text-base-content"
                }
              `}
              onClick={() => setTheme(themeOption.name)}
              aria-label={`Select ${themeOption.label} theme`}
            >
              <PaletteIcon className="size-4" />
              <span className="text-sm font-medium flex-1 text-left">
                {themeOption.label}
              </span>
              {/* THEME PREVIEW COLORS */}
              <div className="flex gap-1">
                {themeOption.colors.map((color, i) => (
                  <span
                    key={i}
                    className="size-3 rounded-full border border-base-300"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
