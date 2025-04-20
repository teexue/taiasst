import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

// 菜单项类型
export interface MenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  children?: MenuItem[];
  divider?: boolean;
}

// 上下文菜单类型
interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  menuItems: MenuItem[];
}

// 上下文菜单上下文类型
interface ContextMenuContextType {
  contextMenu: ContextMenuState;
  showContextMenu: (x: number, y: number, items: MenuItem[]) => void;
  hideContextMenu: () => void;
  isCustomMenuArea: boolean;
  setIsCustomMenuArea: (value: boolean) => void;
}

// 创建上下文
const ContextMenuContext = createContext<ContextMenuContextType>({
  contextMenu: { visible: false, x: 0, y: 0, menuItems: [] },
  showContextMenu: () => {},
  hideContextMenu: () => {},
  isCustomMenuArea: false,
  setIsCustomMenuArea: () => {},
});

// 上下文提供者属性
interface ContextMenuProviderProps {
  children: ReactNode;
  defaultMenuItems?: MenuItem[];
}

// 上下文提供者组件
export const ContextMenuProvider: React.FC<ContextMenuProviderProps> = ({
  children,
  defaultMenuItems = [],
}) => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    menuItems: [],
  });

  const [isCustomMenuArea, setIsCustomMenuArea] = useState(false);

  const showContextMenu = (
    x: number,
    y: number,
    items: MenuItem[] = defaultMenuItems
  ) => {
    setContextMenu({
      visible: true,
      x,
      y,
      menuItems: items,
    });
  };

  const hideContextMenu = () => {
    setContextMenu({
      ...contextMenu,
      visible: false,
    });
  };

  // 处理全局右键菜单
  useEffect(() => {
    const handleGlobalContextMenu = (e: MouseEvent) => {
      // 阻止所有区域的默认右键菜单
      e.preventDefault();

      const target = e.target as HTMLElement;

      // 检查是否在内容区域内
      const isInContentArea = !!target.closest(".content-area");

      if (isInContentArea) {
        // 如果在内容区域内，检查是否有特定的自定义菜单区域
        const hasCustomMenu = !!target.closest(".custom-context-menu-area");

        if (!hasCustomMenu) {
          // 在内容区域但不在自定义菜单区域，显示默认的自定义菜单
          showContextMenu(e.clientX, e.clientY);
        }
        // 如果在自定义菜单区域内，由该区域自己处理
      }
      // 如果不在内容区域内，只阻止默认行为，不显示任何菜单
    };

    document.addEventListener("contextmenu", handleGlobalContextMenu);

    return () => {
      document.removeEventListener("contextmenu", handleGlobalContextMenu);
    };
  }, [defaultMenuItems]);

  return (
    <ContextMenuContext.Provider
      value={{
        contextMenu,
        showContextMenu,
        hideContextMenu,
        isCustomMenuArea,
        setIsCustomMenuArea,
      }}
    >
      {children}
    </ContextMenuContext.Provider>
  );
};

// 使用上下文的钩子
export const useContextMenu = () => useContext(ContextMenuContext);

export default ContextMenuContext;
