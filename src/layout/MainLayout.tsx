import React, { useState } from "react";
import { useLocation, useNavigate, useOutlet } from "react-router";
import { Button, Chip, Tooltip } from "@heroui/react";
import {
  RiHome4Line,
  RiPuzzle2Line,
  RiRobot2Line,
  RiSettingsLine,
  RiToolsLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
} from "@remixicon/react";
import WindowControls from "@/components/WindowControls";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { open } from "@tauri-apps/plugin-shell";
import { motion, AnimatePresence } from "framer-motion";

function MainLayout() {
  const APP_VERSION = import.meta.env.VITE_APP_VERSION;
  const APP_NAME = import.meta.env.VITE_APP_NAME;
  const location = useLocation();
  const navigate = useNavigate();
  const outlet = useOutlet();
  const appWindow = getCurrentWindow();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const menuItems = [
    { key: "/", icon: <RiHome4Line size={20} />, label: "首页" },
    { key: "/tool", icon: <RiToolsLine size={20} />, label: "工具" },
    { key: "/ai", icon: <RiRobot2Line size={20} />, label: "AI" },
    { key: "/plugins", icon: <RiPuzzle2Line size={20} />, label: "插件" },
    { key: "/settings", icon: <RiSettingsLine size={20} />, label: "设置" },
  ];

  const getCurrentKey = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    if (pathSegments.length === 0) return "/";
    return `/${pathSegments[0]}`;
  };
  const currentKey = getCurrentKey();

  const handleMinimize = () => appWindow.minimize();

  const handleMaximize = async () => {
    const isMaximized = await appWindow.isMaximized();
    if (isMaximized) {
      await appWindow.unmaximize();
    } else {
      await appWindow.maximize();
    }
  };

  const handleClose = () => appWindow.hide();

  const updateApp = async () => {
    await open(import.meta.env.VITE_APP_GITHUB + "/releases");
  };

  const sidebarVariants = {
    expanded: { width: 160, transition: { duration: 0.3, ease: "easeInOut" } },
    collapsed: { width: 60, transition: { duration: 0.3, ease: "easeInOut" } },
  };

  const labelVariants = {
    visible: { opacity: 1, x: 0, transition: { delay: 0.15, duration: 0.2 } },
    hidden: { opacity: 0, x: -10, transition: { duration: 0.1 } },
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <motion.aside
        initial={false}
        animate={isSidebarCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        className="h-full flex flex-col flex-shrink-0 border-r border-divider/30 glass-light dark:glass-dark"
      >
        <div
          className={`flex items-center h-[40px] px-4 ${
            isSidebarCollapsed ? "justify-center" : "justify-start"
          } flex-shrink-0`}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <img src="/logo.png" alt="logo" width={28} height={28} />
            {!isSidebarCollapsed && (
              <span className="text-lg font-semibold">{APP_NAME}</span>
            )}
          </motion.div>
        </div>

        <nav className="flex-1 flex flex-col gap-1 p-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = currentKey === item.key;
            const navItemContent = (
              <motion.div
                key={item.key}
                className={`
                  relative flex items-center px-3 h-10 rounded-lg cursor-pointer
                  transition-colors duration-150 group
                  ${isSidebarCollapsed ? "justify-center" : ""}
                  ${
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "text-foreground/70 hover:text-foreground hover:bg-default-100/50"
                  }
                `}
                onClick={() => navigate(item.key)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                {React.cloneElement(item.icon, {
                  className: `flex-shrink-0 w-5 h-5 ${
                    isActive ? "" : "opacity-80"
                  } group-hover:opacity-100`,
                })}
                <AnimatePresence>
                  {!isSidebarCollapsed && (
                    <motion.span
                      variants={labelVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="ml-3 text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            );

            return isSidebarCollapsed ? (
              <Tooltip content={item.label} placement="right" delay={0}>
                <span className="inline-block">{navItemContent}</span>
              </Tooltip>
            ) : (
              navItemContent
            );
          })}
        </nav>

        <div
          className={`px-3 py-2 border-t border-divider/30 mt-auto flex items-center ${
            isSidebarCollapsed ? "justify-center" : "justify-between"
          } flex-shrink-0`}
        >
          {!isSidebarCollapsed && (
            <Button
              variant="light"
              size="sm"
              onPress={updateApp}
              className={`text-xs h-8 text-foreground/60 hover:text-foreground`}
            >
              <Chip color="secondary" size="sm" variant="flat">
                V{APP_VERSION}
              </Chip>
            </Button>
          )}
          <Button
            isIconOnly
            variant="light"
            size="sm"
            radius="full"
            onPress={toggleSidebar}
            className="text-foreground/60 hover:text-foreground"
            aria-label={isSidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
          >
            {isSidebarCollapsed ? <RiMenuUnfoldLine /> : <RiMenuFoldLine />}
          </Button>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col overflow-hidden">
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
              onMinimize={handleMinimize}
              onMaximize={handleMaximize}
              onClose={handleClose}
            />
          </div>
        </div>

        <main className="p-4 md:p-6 overflow-y-auto overflow-x-hidden flex-1">
          <AnimatePresence initial={false} mode="sync">
            <motion.div
              key={location.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
