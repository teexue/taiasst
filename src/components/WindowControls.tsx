import React, { useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";

interface WindowControlsProps {
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}

const WindowControls: React.FC<WindowControlsProps> = ({
  onMinimize,
  onMaximize,
  onClose,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);

  listen("tauri://resize", async () => {
    setIsMaximized(await getCurrentWindow().isMaximized());
  });

  const handleMaximize = () => {
    onMaximize();
  };

  return (
    <div className="flex items-center">
      <div
        className="w-[50px] h-[40px] flex items-center justify-center cursor-pointer transition-colors duration-200 hover:bg-gray-800 dark:hover:bg-gray-700/30"
        onClick={onMinimize}
      >
        <svg
          width="11"
          height="1"
          viewBox="0 0 11 1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,0.5 L11,0.5" stroke="currentColor" />
        </svg>
      </div>
      <div
        className="w-[50px] h-[40px] flex items-center justify-center cursor-pointer transition-colors duration-200 hover:bg-gray-800 dark:hover:bg-gray-700/30"
        onClick={handleMaximize}
      >
        {isMaximized ? (
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1,3 v6 h6 v-6 h-6 M3,1 h6 v6"
              fill="none"
              stroke="currentColor"
            />
          </svg>
        ) : (
          <svg
            width="12"
            height="12"
            viewBox="0 0 10 10"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              width="10"
              height="10"
              rx="0"
              fill="none"
              stroke="currentColor"
            />
          </svg>
        )}
      </div>
      <div
        className="w-[50px] h-[40px] flex items-center justify-center cursor-pointer transition-colors duration-200 hover:bg-red-600 group"
        onClick={onClose}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,0 L10,10 M10,0 L0,10" stroke="currentColor" />
        </svg>
      </div>
    </div>
  );
};

export default WindowControls;
