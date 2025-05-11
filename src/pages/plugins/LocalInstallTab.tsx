import { useState, useCallback } from "react";
import { Button, Progress } from "@heroui/react";
import { toast } from "sonner";
import {
  RiUploadCloud2Line,
  RiFileZipLine,
  RiCloseCircleLine,
  RiCheckLine,
} from "@remixicon/react";
import { error } from "@tauri-apps/plugin-log";
import {
  installPluginWithProgress,
  type InstallProgressStage,
} from "@/utils/plugin";
import { motion } from "framer-motion";
import { open } from "@tauri-apps/plugin-dialog";
import { basename } from "@tauri-apps/api/path";

interface LocalInstallTabProps {
  onCancel: () => void;
  onSuccess: () => void;
}

function LocalInstallTab({ onCancel, onSuccess }: LocalInstallTabProps) {
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [installProgress, setInstallProgress] = useState<{
    stage: InstallProgressStage;
    msg?: string;
  } | null>(null);

  const handleSelectFile = useCallback(async () => {
    console.log("handleSelectFile called");
    setSelectedFilePath(null);
    setSelectedFileName(null);
    setInstallProgress(null);

    try {
      const selected = await open({
        multiple: false,
        directory: false,
        filters: [{ name: "Plugin Package", extensions: ["zip"] }],
      });
      console.log("Tauri open dialog returned:", selected);

      if (typeof selected === "string" && selected) {
        const filePath = selected;
        console.log("Attempting to set file path:", filePath);
        setSelectedFilePath(filePath);

        try {
          const fileName = await basename(filePath);
          console.log("Attempting to set file name:", fileName);
          setSelectedFileName(fileName);
        } catch (basenameError) {
          error(`无法从路径提取文件名: ${String(basenameError)}`);
          setSelectedFileName(filePath);
        }

        console.log("State setters called.");
      } else {
        console.log(
          "File selection cancelled or invalid response type:",
          typeof selected,
        );
        setSelectedFilePath(null);
        setSelectedFileName(null);
      }
    } catch (err) {
      error(`选择文件失败: ${String(err)}`);
      toast.error("选择文件失败");
      console.error("Error in handleSelectFile:", err);
    }
  }, []);

  const handleInstallUpload = useCallback(async () => {
    if (!selectedFilePath) {
      toast.error("请选择插件文件");
      return;
    }

    setUploadLoading(true);
    setInstallProgress(null);

    try {
      await installPluginWithProgress(
        selectedFilePath,
        "local",
        (stage: InstallProgressStage, msg?: string) => {
          setInstallProgress({ stage, msg });
          setUploadLoading(stage === "start" || stage === "installing");

          if (stage === "complete") {
            setTimeout(() => {
              setSelectedFilePath(null);
              setSelectedFileName(null);
              onSuccess();
            }, 500);
          } else if (stage === "error" || stage === "already_installed") {
            setUploadLoading(false);
          }
        },
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      error(`安装插件失败: ${errorMsg}`);
      setInstallProgress({ stage: "error", msg: `安装失败: ${errorMsg}` });
      setUploadLoading(false);
    }
  }, [selectedFilePath, onSuccess]);

  const handleCancel = useCallback(() => {
    setSelectedFilePath(null);
    setSelectedFileName(null);
    setInstallProgress(null);
    setUploadLoading(false);
    onCancel();
  }, [onCancel]);

  const isInstalling =
    installProgress?.stage === "installing" ||
    installProgress?.stage === "start";
  const installComplete = installProgress?.stage === "complete";
  const installFailed =
    installProgress?.stage === "error" ||
    installProgress?.stage === "already_installed";

  return (
    <div className="flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg
          transition-all duration-200 ease-in-out mb-4
          glass-light dark:glass-dark relative overflow-hidden min-h-[150px]
          border-divider/50 hover:border-primary/50 hover:bg-primary/5
        `}
      >
        {selectedFileName && !installProgress && (
          <div className="text-center z-10 flex flex-col items-center">
            <RiFileZipLine className="w-10 h-10 mb-2 text-warning" />
            <p className="font-medium text-sm truncate max-w-xs">
              {selectedFileName}
            </p>
            <Button
              size="sm"
              variant="shadow"
              color="danger"
              isIconOnly
              radius="full"
              onPress={() => {
                setSelectedFilePath(null);
                setSelectedFileName(null);
              }}
              className="mt-2 opacity-70 hover:opacity-100"
              aria-label="移除文件"
            >
              <RiCloseCircleLine size={18} />
            </Button>
          </div>
        )}

        {!selectedFilePath && !installProgress && (
          <div className="text-center z-10 flex flex-col items-center">
            <RiUploadCloud2Line
              className={`w-10 h-10 mb-2 text-foreground/40`}
            />
            <p className={`text-sm font-medium text-foreground/70`}>
              点击下方按钮选择插件包 (.zip)
            </p>
            <Button
              size="sm"
              variant="shadow"
              radius="full"
              onPress={handleSelectFile}
              className="border-default-300/70 text-foreground/70 hover:border-primary hover:text-primary mt-2"
            >
              选择文件
            </Button>
          </div>
        )}

        {installProgress && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4 text-center">
            {installComplete ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-12 h-12 rounded-full bg-success flex items-center justify-center mb-2"
                >
                  <RiCheckLine className="w-8 h-8 text-white" />
                </motion.div>
                <p className="font-medium text-success-600">
                  {installProgress.msg || "安装完成!"}
                </p>
              </>
            ) : installFailed ? (
              <>
                <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mb-2 text-danger">
                  <RiCloseCircleLine className="w-8 h-8" />
                </div>
                <p className="font-medium text-danger-600">安装失败</p>
                <p className="text-xs text-danger/80 mt-1">
                  {installProgress.msg || "未知错误"}
                </p>
              </>
            ) : (
              <>
                <Progress
                  isIndeterminate={installProgress.stage === "start"}
                  aria-label="安装进度"
                  size="sm"
                  className="max-w-xs w-full mb-2"
                />
                <p className="text-sm text-foreground/80">
                  {installProgress.msg || "正在准备安装..."}
                </p>
              </>
            )}
          </div>
        )}
      </motion.div>

      <div className="flex justify-end items-center gap-2 mt-4">
        <Button
          variant="shadow"
          size="sm"
          radius="md"
          onPress={handleCancel}
          disabled={isInstalling}
        >
          {installComplete || installFailed ? "关闭" : "取消"}
        </Button>
        {!installProgress && selectedFilePath && (
          <Button
            color="primary"
            variant="shadow"
            size="sm"
            radius="md"
            isLoading={uploadLoading}
            onPress={handleInstallUpload}
            disabled={
              isInstalling || installComplete || installFailed || uploadLoading
            }
            className="shadow-sm hover:shadow-primary/30 click-scale"
          >
            开始安装
          </Button>
        )}
        {(installComplete || installFailed) && (
          <Button
            color="primary"
            variant="shadow"
            size="sm"
            radius="md"
            onPress={handleCancel}
            className="shadow-sm hover:shadow-primary/30 click-scale"
          >
            {installComplete ? "完成" : "确定"}
          </Button>
        )}
      </div>
    </div>
  );
}

export default LocalInstallTab;
