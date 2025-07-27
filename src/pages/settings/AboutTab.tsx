import { useState } from "react";
import {
  Button,
  Chip,
  Card,
  CardBody,
  CardHeader,
  Divider,
} from "@heroui/react";
import { toast } from "sonner";
import { open } from "@tauri-apps/plugin-shell";
import {
  RiGithubFill,
  RiInformationLine,
  RiRefreshLine,
  RiExternalLinkLine,
  RiHeartFill,
  RiCodeLine,
} from "react-icons/ri";
import { check } from "@tauri-apps/plugin-updater";
import Logo from "../../components/common/Logo";

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
      console.error(error);
      toast.error(`检查更新失败: 请检查网络连接！`);
    } finally {
      setCheckUpdateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 应用信息 */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <RiInformationLine className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">应用信息</h2>
              <p className="text-sm text-foreground/60">关于此应用程序</p>
            </div>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 flex items-center justify-center">
              <Logo
                width={80}
                height={80}
                animated={true}
                colorMode="primary"
                className="drop-shadow-lg"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {APP_NAME}
              </h1>
              <div className="flex items-center justify-center gap-2 mb-3">
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
              <div className="flex items-center justify-center gap-2 mb-3">
                <Chip color="secondary" variant="flat" size="sm">
                  版本 {APP_VERSION}
                </Chip>
              </div>
              <p className="text-sm text-foreground/70 max-w-md">
                {APP_DESCRIPTION}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 操作按钮 */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <RiCodeLine className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">开发者选项</h2>
              <p className="text-sm text-foreground/60">源代码和更新</p>
            </div>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="pt-6">
          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            <Button
              color="primary"
              variant="flat"
              startContent={<RiGithubFill />}
              endContent={<RiExternalLinkLine />}
              onPress={openGitHub}
              className="w-full"
            >
              查看源代码
            </Button>

            <Button
              color="secondary"
              variant="flat"
              startContent={<RiRefreshLine />}
              onPress={checkUpdate}
              isLoading={checkUpdateLoading}
              className="w-full"
            >
              检查更新
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* 版权信息 */}
      <Card className="bg-default/5 border-default/20">
        <CardBody className="p-4">
          <div className="text-center">
            <p className="text-sm text-foreground/70 flex items-center justify-center gap-1">
              © 2024 {APP_NAME}. Made with{" "}
              <RiHeartFill className="text-danger" />
            </p>
            <p className="text-xs text-foreground/50 mt-1">
              基于 Tauri + React + TypeScript 构建
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default AboutTab;
