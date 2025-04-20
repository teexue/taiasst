import React, { ReactNode, useEffect } from "react";
import { useContextMenu, MenuItem } from "../context/RightClickMenuContext";

interface RightClickMenuAreaProps {
  children: ReactNode;
  menuItems?: MenuItem[];
  onContextMenu?: (e: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 自定义右键菜单区域组件
 * 使用此组件包裹的内容将使用自定义的右键菜单
 */
const RightClickMenuArea: React.FC<RightClickMenuAreaProps> = ({
  children,
  menuItems,
  onContextMenu,
  className = "",
  style,
}) => {
  const { showContextMenu, setIsCustomMenuArea } = useContextMenu();

  // 进入区域时设置标记
  useEffect(() => {
    setIsCustomMenuArea(true);

    return () => {
      setIsCustomMenuArea(false);
    };
  }, [setIsCustomMenuArea]);

  // 处理右键菜单
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();

    // 如果有自定义的处理函数，调用它
    if (onContextMenu) {
      onContextMenu(e);
      return;
    }

    // 如果有菜单项，显示自定义菜单
    if (menuItems && menuItems.length > 0) {
      showContextMenu(e.clientX, e.clientY, menuItems);
    }
  };

  return (
    <div
      className={`custom-context-menu-area ${className}`}
      onContextMenu={handleContextMenu}
      style={style}
    >
      {children}
    </div>
  );
};

export default RightClickMenuArea;
