import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Chip, Tooltip } from "@heroui/react";
import { RiMenuFoldLine, RiMenuUnfoldLine } from "react-icons/ri";
import { useNavigate } from "react-router";
import Logo from "../components/common/Logo";

interface MenuItem {
  key: string;
  icon: React.ReactElement;
  label: string;
}

interface SiderBarLayoutProps {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  menuItems: MenuItem[];
  currentKey: string;
  APP_NAME: string;
  APP_VERSION: string;
}

const sidebarVariants = {
  expanded: { width: 160, transition: { duration: 0.3, ease: "easeInOut" } },
  collapsed: { width: 60, transition: { duration: 0.3, ease: "easeInOut" } },
};

const labelVariants = {
  visible: { opacity: 1, x: 0, transition: { delay: 0.15, duration: 0.2 } },
  hidden: { opacity: 0, x: -10, transition: { duration: 0.1 } },
};

function SiderBarLayout({
  isSidebarCollapsed,
  toggleSidebar,
  menuItems,
  currentKey,
  APP_NAME,
  APP_VERSION,
}: SiderBarLayoutProps) {
  const navigate = useNavigate();

  return (
    <motion.aside
      initial={false}
      animate={isSidebarCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      className="h-full flex flex-col flex-shrink-0 border-r border-divider/30"
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
          <Logo
            width={28}
            height={28}
            className="flex-shrink-0"
            animated={true}
            colorMode="primary"
          />
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
          <Chip color="secondary" size="sm" variant="flat" radius="full">
            V{APP_VERSION}
          </Chip>
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
  );
}

export default SiderBarLayout;
