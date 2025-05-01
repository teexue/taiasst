import React from "react";
import { Button } from "antd";
import { RiMoonLine, RiSunFill } from "@remixicon/react";
import { useTheme } from "../context/ThemeContext";

const ThemeSwitcher: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Button
      type="text"
      className="flex items-center justify-center w-[32px] h-[32px] p-0 transition-colors duration-200"
      style={{
        paddingInline: 0,
        paddingBlock: 0,
      }}
      onClick={toggleTheme}
    >
      {isDarkMode ? (
        <RiSunFill className="w-[20px] h-[20px] text-white" />
      ) : (
        <RiMoonLine className="w-[20px] h-[20px] text-color-text-primary" />
      )}
    </Button>
  );
};

export default ThemeSwitcher;
