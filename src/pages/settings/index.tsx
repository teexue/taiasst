import { Tabs, Tab } from "@heroui/react";
import {
  RiSettings4Line,
  RiComputerLine,
  RiInformationLine,
  RiRobot2Line,
  RiShieldLine,
} from "react-icons/ri";
import AboutTab from "./AboutTab";
import SystemTab from "./SystemTab";
import AISettingsTab from "./components/AISettingsTab";
import SecuritySettings from "./security";

function Settings() {
  return (
    <div className="flex flex-col gap-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl text-white shadow-lg">
          <RiSettings4Line className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">应用设置</h1>
          <p className="text-foreground/70 text-sm mt-1">
            配置应用功能、安全设置和个人偏好
          </p>
        </div>
      </div>

      {/* 设置标签页 */}
      <Tabs
        variant="underlined"
        color="primary"
        className="flex flex-col gap-4"
        defaultSelectedKey="system"
      >
        <Tab
          key="system"
          title={
            <div className="flex items-center gap-2">
              <RiComputerLine size={18} />
              <span>系统设置</span>
            </div>
          }
        >
          <SystemTab />
        </Tab>

        <Tab
          key="ai"
          title={
            <div className="flex items-center gap-2">
              <RiRobot2Line size={18} />
              <span>AI助手</span>
            </div>
          }
        >
          <AISettingsTab />
        </Tab>

        <Tab
          key="security"
          title={
            <div className="flex items-center gap-2">
              <RiShieldLine size={18} />
              <span>安全设置</span>
            </div>
          }
        >
          <SecuritySettings />
        </Tab>

        <Tab
          key="about"
          title={
            <div className="flex items-center gap-2">
              <RiInformationLine size={18} />
              <span>关于</span>
            </div>
          }
        >
          <AboutTab />
        </Tab>
      </Tabs>
    </div>
  );
}

export default Settings;
