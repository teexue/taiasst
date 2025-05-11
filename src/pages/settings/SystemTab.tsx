import React, { useState, useEffect } from "react";
import {
  Switch,
  // RadioGroup, // Removed as ThemeCard is used
  // Radio, // Removed as ThemeCard is used
  Card,
  CardHeader,
  CardBody,
  Tooltip,
  SwitchProps, // Import SwitchProps type
} from "@heroui/react";
import { useTheme } from "@heroui/use-theme";
import { themeNames, ThemeName, themes } from "../../themes";
import { RiCheckLine } from "@remixicon/react"; // Icon for selected theme
import { motion } from "framer-motion"; // For theme card animation
import {
  getAllSystemSettings,
  saveAllSystemSettings,
} from "../../services/db/system";
import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import { toast } from "sonner";
// Define props type for SettingItem
interface SettingItemProps {
  label: string;
  description?: string;
  control: React.ReactNode;
}

// Reusable component for setting items (Matches design doc)
const SettingItem: React.FC<SettingItemProps> = ({
  label,
  description,
  control,
}) => (
  <div className="flex items-center justify-between p-4">
    <div>
      <p className="text-sm font-medium">{label}</p>
      {description && (
        <p className="text-xs text-foreground/60">{description}</p>
      )}
    </div>
    {control}
  </div>
);

// Define type for theme object used in ThemeCard
interface ThemeObject {
  id: ThemeName;
  name: string;
  colors: {
    primary?: string;
    secondary?: string;
    background?: string;
  };
  isDark: boolean;
}

// Define props type for ThemeCard
interface ThemeCardProps {
  theme: ThemeObject;
  isActive: boolean;
  onSelect: () => void;
}

// Reusable theme card component (Matches design doc)
const ThemeCard: React.FC<ThemeCardProps> = ({ theme, isActive, onSelect }) => {
  const getColorValue = (color?: string | { DEFAULT?: string }): string => {
    if (typeof color === "object" && color?.DEFAULT) {
      return color.DEFAULT;
    }
    return (color as string) || "#cccccc";
  };

  // 获取背景色和主色
  const backgroundColor = getColorValue(theme.colors.background);
  const primaryColor = getColorValue(theme.colors.primary);

  // 调整渐变，让 primary 颜色范围更大
  const gradientEffect = `linear-gradient(135deg, ${primaryColor} 0%, transparent 80%)`; // 调整为 80%

  return (
    <Tooltip content={theme.name} placement="top" delay={0}>
      <motion.div
        onClick={onSelect}
        className={`
        relative overflow-hidden rounded-lg cursor-pointer group
        transition-all duration-200
        border-2 hover:scale-105 hover:shadow-md
        ${
          isActive
            ? `border-primary shadow-md shadow-${theme.id}/20`
            : `border-primary/20` // 非激活状态使用低透明度主色边框
        }
      `}
        style={{ aspectRatio: "16/9", position: "relative" }} // 添加 relative 定位
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
      >
        {/* 底色使用主题背景色 */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{ background: backgroundColor }}
        ></div>
        {/* 叠加渐变效果层 - 增加透明度 */}
        <div
          className="absolute inset-0 w-full h-full opacity-60 mix-blend-overlay" // 增加到 opacity-60
          style={{ background: gradientEffect }}
        ></div>

        {/* 选中状态图标等保持不变 */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity">
          {isActive && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center shadow"
            >
              <RiCheckLine className="w-4 h-4 text-primary" />
            </motion.div>
          )}
        </div>
        <span className="sr-only">{theme.name}</span>
      </motion.div>
    </Tooltip>
  );
};

function SystemTab() {
  const [minimizeToTray, setMinimizeToTray] = useState(false);
  const [autoStart, setAutoStart] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { theme: currentTheme, setTheme } = useTheme();

  // 从数据库加载设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const settings = await getAllSystemSettings();

        // 设置状态
        setMinimizeToTray(settings.minimizeToTray);
        setAutoStart(settings.autoStart);
        setAutoUpdate(settings.autoUpdate);

        // 如果数据库中存储的主题与当前不同，则更新主题
        if (settings.currentTheme && settings.currentTheme !== currentTheme) {
          setTheme(settings.currentTheme as ThemeName);
        }
      } catch (error) {
        console.error("加载系统设置失败:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [currentTheme, setTheme]);

  // 当任何设置改变时保存到数据库
  const saveSettings = async (settings: {
    minimizeToTray?: boolean;
    autoStart?: boolean;
    autoUpdate?: boolean;
    currentTheme?: string;
  }) => {
    try {
      // 合并现有设置和新设置
      const updatedSettings = {
        minimizeToTray:
          "minimizeToTray" in settings
            ? settings.minimizeToTray!
            : minimizeToTray,
        autoStart: "autoStart" in settings ? settings.autoStart! : autoStart,
        autoUpdate:
          "autoUpdate" in settings ? settings.autoUpdate! : autoUpdate,
        currentTheme: settings.currentTheme || currentTheme,
      };

      // 保存到数据库
      await saveAllSystemSettings(updatedSettings);

      // 更新状态
      if ("minimizeToTray" in settings)
        setMinimizeToTray(settings.minimizeToTray!);
      if ("autoStart" in settings) setAutoStart(settings.autoStart!);
      if ("autoUpdate" in settings) setAutoUpdate(settings.autoUpdate!);
      if (settings.currentTheme) setTheme(settings.currentTheme as ThemeName);
    } catch (error) {
      console.error("保存系统设置失败:", error);
    }
  };

  // 更新最小化到托盘设置
  const handleMinimizeToTrayChange = async (value: boolean) => {
    saveSettings({ minimizeToTray: value });
    toast.success("最小化到托盘设置已保存");
  };

  // 更新开机自启动设置
  const handleAutoStartChange = async (value: boolean) => {
    if (value) {
      await enable();
      if (await isEnabled()) {
        saveSettings({ autoStart: value });
        toast.success("开机自启动已启用");
      } else {
        toast.error("开机自启动启用失败");
      }
    } else {
      await disable();
      if (!(await isEnabled())) {
        saveSettings({ autoStart: value });
        toast.success("开机自启动已禁用");
      } else {
        toast.error("开机自启动禁用失败");
      }
    }
  };

  // 更新自动更新设置
  const handleAutoUpdateChange = (value: boolean) => {
    saveSettings({ autoUpdate: value });
    toast.success("自动更新设置已保存");
  };

  // 更新主题设置
  const handleThemeChange = (newTheme: ThemeName) => {
    saveSettings({ currentTheme: newTheme });
    toast.success("主题设置已保存");
  };

  // 修改这里：确保将 background 放入 theme.colors
  const allThemeObjects = (Object.keys(themes) as ThemeName[]).map(
    (themeId) => {
      const config = themes[themeId]; // 获取配置对象
      const primaryColor =
        typeof config.colors?.primary === "object"
          ? config.colors.primary.DEFAULT
          : config.colors?.primary;
      const secondaryColor =
        typeof config.colors?.secondary === "object"
          ? config.colors.secondary.DEFAULT
          : config.colors?.secondary;
      // 获取 background 颜色值
      const backgroundColor =
        typeof config.colors?.background === "object"
          ? config.colors.background.DEFAULT
          : config.colors?.background;

      return {
        id: themeId,
        name: themeNames[themeId] || "未知主题",
        colors: {
          primary: primaryColor || "#cccccc",
          secondary: secondaryColor || "#aaaaaa",
          background:
            backgroundColor ||
            (themeId.startsWith("dark") ? "#1f1d2c" : "#f8f9fc"), // 添加 background 并提供 fallback
        },
        isDark: config.extend === "dark" || themeId.startsWith("dark"),
      };
    },
  );

  const lightThemes = allThemeObjects.filter((t) => !t.isDark);
  const darkThemes = allThemeObjects.filter((t) => t.isDark);

  // Define common Switch props, using imported SwitchProps type
  const switchProps: Partial<SwitchProps> = {
    size: "sm", // Smaller switch as per design
    color: "primary",
    classNames: {
      wrapper: "group-data-[selected=true]:bg-primary", // Correct class for selected state
    },
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">加载中...</div>
    );
  }

  return (
    // Use space-y for vertical spacing between cards
    <div className="space-y-6">
      {/* Basic Settings Card - Applying Glassmorphism */}
      <Card className="glass-light dark:glass-dark overflow-hidden shadow-sm">
        <CardHeader className="border-b border-divider/30 bg-black/5 dark:bg-white/5 p-4">
          <h2 className="text-base font-medium">基本设置</h2>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-divider/30">
            <SettingItem
              label="最小化到托盘"
              description="关闭窗口时最小化到系统托盘而非退出应用"
              control={
                <Switch
                  {...switchProps}
                  isSelected={minimizeToTray}
                  onValueChange={handleMinimizeToTrayChange}
                  aria-label="最小化到托盘"
                />
              }
            />
            <SettingItem
              label="开机自启动"
              description="系统启动时自动启动应用"
              control={
                <Switch
                  {...switchProps}
                  isSelected={autoStart}
                  onValueChange={handleAutoStartChange}
                  aria-label="开机自启动"
                />
              }
            />
            <SettingItem
              label="自动更新"
              description="有新版本时自动下载并安装更新"
              control={
                <Switch
                  {...switchProps}
                  isSelected={autoUpdate}
                  onValueChange={handleAutoUpdateChange}
                  aria-label="自动更新"
                />
              }
            />
          </div>
        </CardBody>
      </Card>

      {/* Theme Settings Card - Applying Glassmorphism */}
      <Card className="glass-light dark:glass-dark overflow-hidden shadow-sm">
        <CardHeader className="border-b border-divider/30 bg-black/5 dark:bg-white/5 p-4">
          <h2 className="text-base font-medium">应用主题</h2>
        </CardHeader>
        <CardBody className="p-4 md:p-6 space-y-6">
          {/* Light Themes Section */}
          <div>
            <h3 className="text-sm font-medium mb-3">浅色主题</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {lightThemes.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  isActive={currentTheme === theme.id}
                  onSelect={() => handleThemeChange(theme.id)}
                />
              ))}
            </div>
          </div>

          {/* Dark Themes Section */}
          <div>
            <h3 className="text-sm font-medium mb-3">深色主题</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {darkThemes.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  isActive={currentTheme === theme.id}
                  onSelect={() => handleThemeChange(theme.id)}
                />
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default SystemTab;
