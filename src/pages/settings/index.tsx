import { Tabs, Space } from "antd";
import * as RemixIcons from "@remixicon/react";
import AboutTab from "./AboutTab";
import SystemTab from "./SystemTab";
import PluginTab from "./PluginTab";
import SystemTools from "./SystemTools";

function Settings() {
  return (
    <Tabs
      defaultActiveKey="system"
      items={[
        {
          key: "system",
          label: (
            <Space size={4}>
              <RemixIcons.RiComputerLine size={16} />
              <span>系统设置</span>
            </Space>
          ),
          children: <SystemTab />,
        },
        {
          key: "plugin",
          label: (
            <Space size={4}>
              <RemixIcons.RiPlugLine size={16} />
              <span>插件设置</span>
            </Space>
          ),
          children: <PluginTab />,
        },
        {
          key: "system-tools",
          label: (
            <Space size={4}>
              <RemixIcons.RiToolsLine size={16} />
              <span>系统工具</span>
            </Space>
          ),
          children: <SystemTools />,
        },
        {
          key: "about",
          label: (
            <Space size={4}>
              <RemixIcons.RiInformationLine size={16} />
              <span>关于</span>
            </Space>
          ),
          children: <AboutTab />,
        },
        // 可以根据需要添加更多标签页
        // {
        //   key: "preferences",
        //   label: (
        //     <Space size={4}>
        //       <RemixIcons.RiSettings3Line size={16} />
        //       <span>偏好设置</span>
        //     </Space>
        //   ),
        //   children: <PreferencesTab />,
        // },
      ]}
    />
  );
}

export default Settings;
