import React from "react";
import WindowControls from "@/components/WindowControls";

interface MenuItem {
  key: string;
  icon: React.ReactElement;
  label: string;
}

interface HeaderLayoutProps {
  currentKey: string;
  menuItems: MenuItem[];
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}

const HeaderLayout: React.FC<HeaderLayoutProps> = ({
  currentKey,
  menuItems,
  onMinimize,
  onMaximize,
  onClose,
}) => {
  return (
    <div
      data-tauri-drag-region
      className="flex items-center justify-between h-[40px] pl-6 flex-shrink-0 
                 border-b border-divider/30 
                 backdrop-blur-md backdrop-saturate-150 
                 bg-background/70 shadow-sm 
                 dark:bg-background/40 dark:shadow-md dark:shadow-black/10"
    >
      <div className="flex items-center text-base font-medium">
        {menuItems.find((item) => item.key === currentKey)?.label}
      </div>

      <div className="flex items-center gap-x-2">
        <WindowControls
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default HeaderLayout;
