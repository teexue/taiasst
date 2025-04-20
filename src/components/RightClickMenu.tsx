import React, { useEffect, useState } from "react";
import {
  useContextMenu,
  MenuItem as MenuItemType,
} from "../context/RightClickMenuContext";

// 菜单项组件
const MenuItem: React.FC<{
  item: MenuItemType;
  closeMenu: () => void;
}> = ({ item, closeMenu }) => {
  const [showSubmenu, setShowSubmenu] = useState(false);

  // 如果是分隔线
  if (item.divider) {
    return (
      <div
        className="h-px my-1"
        style={{ backgroundColor: "var(--color-border-light)" }}
      />
    );
  }

  const handleClick = () => {
    if (item.disabled) return;
    if (item.onClick) {
      item.onClick();
      closeMenu();
    }
  };

  const handleMouseEnter = () => {
    if (item.children && item.children.length > 0) {
      setShowSubmenu(true);
    }
  };

  const handleMouseLeave = () => {
    setShowSubmenu(false);
  };

  // 基本样式
  const baseClasses = "flex items-center px-3 py-2 text-sm relative";

  // 禁用状态样式
  const disabledStyle = {
    color: "var(--color-text-muted)",
    cursor: "not-allowed",
  };

  // 正常状态样式
  const normalStyle = {
    color: "var(--color-text-primary)",
    cursor: "pointer",
  };

  // 悬浮/选中背景样式
  const activeStyle = {
    backgroundColor: "var(--color-bg-tertiary)",
  };

  // 组合样式
  const combinedStyle = {
    ...(item.disabled ? disabledStyle : normalStyle),
    ...(showSubmenu ? activeStyle : {}),
  };

  // 创建悬停样式类名
  const hoverClass = item.disabled ? "" : "hover-effect";

  // 添加内联样式到document.head以支持悬停效果
  useEffect(() => {
    const styleId = "rightclick-menu-style";

    // 检查是否已经添加了样式
    if (!document.getElementById(styleId)) {
      const styleSheet = document.createElement("style");
      styleSheet.id = styleId;
      styleSheet.innerHTML = `
        .hover-effect:hover {
          background-color: var(--color-bg-tertiary);
        }
      `;
      document.head.appendChild(styleSheet);
    }

    return () => {
      // 组件卸载时不需要删除样式，因为它可能还在被使用
    };
  }, []);

  return (
    <div
      key={item.key}
      className={`${baseClasses} ${hoverClass}`}
      style={combinedStyle}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {item.icon && <span className="mr-2">{item.icon}</span>}
      <span>{item.label}</span>
      {item.children && item.children.length > 0 && (
        <span className="ml-auto">›</span>
      )}

      {showSubmenu && item.children && item.children.length > 0 && (
        <div
          className="absolute top-0 left-full min-w-[160px] rounded overflow-hidden z-10 py-1"
          style={{
            backgroundColor: "var(--color-bg-card)",
            boxShadow: "0 3px 6px rgba(0, 0, 0, 0.16)",
            border: "1px solid var(--color-border)",
          }}
        >
          {item.children.map((childItem) => (
            <MenuItem
              key={childItem.key}
              item={childItem}
              closeMenu={closeMenu}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 全局右键菜单组件
const RightClickMenu: React.FC = () => {
  const { contextMenu, hideContextMenu } = useContextMenu();
  const { visible, x, y, menuItems } = contextMenu;

  // 点击外部关闭菜单
  useEffect(() => {
    const handleOutsideClick = () => {
      if (visible) {
        hideContextMenu();
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [visible, hideContextMenu]);

  if (!visible) {
    return null;
  }

  // 调整菜单位置，确保不超出屏幕边界
  const adjustPosition = () => {
    const menuWidth = 160; // 预估菜单宽度
    const menuHeight = menuItems.length * 32; // 预估菜单高度

    let adjustedX = x;
    let adjustedY = y;

    // 检查右边界
    if (x + menuWidth > window.innerWidth) {
      adjustedX = window.innerWidth - menuWidth - 5;
    }

    // 检查下边界
    if (y + menuHeight > window.innerHeight) {
      adjustedY = window.innerHeight - menuHeight - 5;
    }

    return { adjustedX, adjustedY };
  };

  const { adjustedX, adjustedY } = adjustPosition();

  return (
    <div
      className="fixed z-50 min-w-[160px] py-1 rounded-md overflow-hidden"
      style={{
        top: adjustedY,
        left: adjustedX,
        backgroundColor: "var(--color-bg-card)",
        boxShadow:
          "0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)",
        border: "1px solid var(--color-border)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {menuItems.map((item) => (
        <MenuItem key={item.key} item={item} closeMenu={hideContextMenu} />
      ))}
    </div>
  );
};

export default RightClickMenu;
