import React, { useState, useEffect } from "react";
import {
  Switch,
  Card,
  CardBody,
  Tooltip,
  SwitchProps,
  Chip,
  Divider,
} from "@heroui/react";
import { useTheme } from "@heroui/use-theme";
import { themeNames, ThemeName, themes } from "../../themes";
import {
  RiCheckLine,
  RiComputerLine,
  RiSettings4Line,
  RiToggleLine,
} from "react-icons/ri";
import { motion } from "framer-motion";
import {
  getAllSystemSettings,
  saveAllSystemSettings,
} from "../../services/db/system";
import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import { toast } from "sonner";
interface SettingItemProps {
  label: string;
  description?: string;
  control: React.ReactNode;
  icon?: React.ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({
  label,
  description,
  control,
  icon,
}) => (
  <div className="flex items-center justify-between py-4 px-1">
    <div className="flex items-center gap-4">
      {icon && (
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <div className="text-primary">{icon}</div>
        </div>
      )}
      <div className="flex-1">
        <h4 className="font-medium text-foreground">{label}</h4>
        {description && (
          <p className="text-sm text-foreground/60 mt-1">{description}</p>
        )}
      </div>
    </div>
    <div className="flex-shrink-0">{control}</div>
  </div>
);

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

interface ThemeCardProps {
  theme: ThemeObject;
  isActive: boolean;
  onSelect: () => void;
}

const ThemeCard: React.FC<ThemeCardProps> = ({ theme, isActive, onSelect }) => {
  const getColorValue = (color?: string | { DEFAULT?: string }): string => {
    if (typeof color === "object" && color?.DEFAULT) {
      return color.DEFAULT;
    }
    return (color as string) || "#cccccc";
  };

  const backgroundColor = getColorValue(theme.colors.background);
  const primaryColor = getColorValue(theme.colors.primary);

  return (
    <Tooltip content={theme.name} placement="top" delay={0}>
      <motion.div
        onClick={onSelect}
        className={`
          relative overflow-hidden rounded-xl cursor-pointer group
          transition-all duration-300 ease-out
          border-2 hover:scale-105 hover:shadow-lg
          ${
            isActive
              ? "border-primary shadow-md ring-2 ring-primary/20"
              : "border-default-200 hover:border-primary/40"
          }
        `}
        style={{ aspectRatio: "3/2" }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <div
          className="absolute inset-0 w-full h-full"
          style={{ background: backgroundColor }}
        />
        <div
          className="absolute inset-0 w-full h-full opacity-40"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, transparent 70%)`,
          }}
        />

        {/* 主题名称 */}
        <div className="absolute bottom-2 left-2 right-2">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg px-2 py-1">
            <p className="text-xs font-medium text-white truncate">
              {theme.name}
            </p>
          </div>
        </div>

        {/* 选中状态 */}
        {isActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg"
          >
            <RiCheckLine className="w-4 h-4 text-white" />
          </motion.div>
        )}
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
        // 添加安全相关的默认值（已清理功能，但保持类型兼容）
        autoLockEnabled: false,
        autoLockTime: 30,
        lockOnSystemSleep: false,
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
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-foreground/60">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 基本设置 */}
      <div>
        <Card className="shadow-sm">
          <CardBody className="p-6">
            <div className="space-y-6">
              <SettingItem
                icon={<RiToggleLine size={20} />}
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
              <Divider />
              <SettingItem
                icon={<RiComputerLine size={20} />}
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
              <Divider />
              <SettingItem
                icon={<RiSettings4Line size={20} />}
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
      </div>

      {/* 主题设置 */}
      <div>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                应用主题
              </h2>
              <p className="text-foreground/60 mt-1">
                选择您喜欢的界面主题风格
              </p>
            </div>
            <Chip
              variant="flat"
              color="primary"
              size="md"
              className="font-medium"
            >
              {themeNames[currentTheme as ThemeName] || currentTheme}
            </Chip>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardBody className="p-6 space-y-8">
            {/* 浅色主题 */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-sm font-semibold">浅色主题</h3>
                <Chip size="sm" variant="flat" color="default">
                  {lightThemes.length} 个
                </Chip>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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

            {/* 深色主题 */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-sm font-semibold">深色主题</h3>
                <Chip size="sm" variant="flat" color="default">
                  {darkThemes.length} 个
                </Chip>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
    </div>
  );
}

export default SystemTab;
