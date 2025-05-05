import { Button } from "@heroui/react";
import { Avatar, Chip } from "@heroui/react";
import { toast } from "sonner";
import { open } from "@tauri-apps/plugin-shell";
import { RiGithubFill } from "@remixicon/react";
import APP_LOGO from "/logo.png";
import { check } from "@tauri-apps/plugin-updater";
import { useState } from "react";

interface AboutTabProps {
  onUpdate?: () => void;
}

function AboutTab({ onUpdate }: AboutTabProps) {
  const [checkUpdateLoading, setCheckUpdateLoading] = useState(false);

  const APP_NAME = import.meta.env.VITE_APP_NAME;
  const APP_VERSION = import.meta.env.VITE_APP_VERSION;
  const APP_DESCRIPTION = import.meta.env.VITE_APP_DESCRIPTION;
  const APP_GITHUB = import.meta.env.VITE_APP_GITHUB;

  const openGitHub = async () => {
    // 使用系统默认浏览器打开 GitHub 项目
    await open(APP_GITHUB);
  };

  const checkUpdate = async () => {
    try {
      setCheckUpdateLoading(true);
      const update = await check();
      console.log(update);
      if (onUpdate) {
        onUpdate();
      }
      toast.info("请在设置的更新选项卡查看更新信息。");
    } catch (error) {
      toast.error(`检查更新失败: 请检查网络连接！`);
    } finally {
      setCheckUpdateLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center w-full mb-6">
        <Avatar
          src={APP_LOGO}
          size="lg"
          radius="md"
          className="w-24 h-24 mb-2"
        />
        <h3 className="text-xl font-semibold my-1">{APP_NAME}</h3>
        <div className="flex gap-2 items-center">
          <Chip color="primary" size="sm">
            轻量级
          </Chip>
          <Chip color="success" size="sm">
            无广告
          </Chip>
          <Chip color="secondary" size="sm">
            开源
          </Chip>
        </div>
      </div>
      <div className="flex flex-col items-center w-full mx-auto">
        <p className="text-center">{APP_DESCRIPTION}</p>
        <p className="text-center">
          当前版本：
          <Chip color="secondary" variant="flat" size="sm">
            V{APP_VERSION}
          </Chip>
        </p>
        <div className="flex gap-2 items-center">
          <Button onPress={checkUpdate} isLoading={checkUpdateLoading}>
            检查更新
          </Button>
          <Button
            color="primary"
            onPress={openGitHub}
            startContent={<RiGithubFill />}
          >
            访问项目
          </Button>
        </div>
      </div>
    </>
  );
}

export default AboutTab;
