import { Tabs, Tab } from "@heroui/react";
import * as RemixIcons from "@remixicon/react";
import AboutTab from "./AboutTab";
import SystemTab from "./SystemTab";
import PluginTab from "./PluginTab";
import SystemTools from "./SystemTools";
import AiTab from "./AiTab";

function Settings() {
  return (
    <Tabs
      aria-label="设置选项卡"
      defaultSelectedKey="system"
      color="primary"
      variant="underlined"
      classNames={{
        tabList: "px-4",
        panel: "p-0 pt-4",
      }}
      fullWidth
    >
      <Tab
        key="system"
        title={
          <span className="flex items-center gap-1.5 text-sm">
            <RemixIcons.RiComputerLine size={16} />
            <span>系统设置</span>
          </span>
        }
      >
        <SystemTab />
      </Tab>
      <Tab
        key="ai"
        title={
          <span className="flex items-center gap-1.5 text-sm">
            <RemixIcons.RiRobot2Line size={16} />
            <span>AI 设置</span>
          </span>
        }
      >
        <AiTab />
      </Tab>
      <Tab
        key="plugin"
        title={
          <span className="flex items-center gap-1.5 text-sm">
            <RemixIcons.RiPlugLine size={16} />
            <span>插件设置</span>
          </span>
        }
      >
        <PluginTab />
      </Tab>
      <Tab
        key="system-tools"
        title={
          <span className="flex items-center gap-1.5 text-sm">
            <RemixIcons.RiToolsLine size={16} />
            <span>系统工具</span>
          </span>
        }
      >
        <SystemTools />
      </Tab>
      <Tab
        key="about"
        title={
          <span className="flex items-center gap-1.5 text-sm">
            <RemixIcons.RiInformationLine size={16} />
            <span>关于</span>
          </span>
        }
      >
        <AboutTab />
      </Tab>
    </Tabs>
  );
}

export default Settings;
