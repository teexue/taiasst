import { useState, useCallback } from "react";
import { Input, Button, Progress } from "@heroui/react";
import { toast } from "sonner";
import { error } from "@tauri-apps/plugin-log";
import { installPluginFromUrl } from "@/utils/plugin";
import { motion } from "framer-motion";

interface NetworkInstallTabProps {
  onCancel: () => void;
  onSuccess: () => void;
}

function NetworkInstallTab({ onCancel, onSuccess }: NetworkInstallTabProps) {
  const [pluginUrl, setPluginUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressData, setProgressData] = useState<{
    stage: string;
    progress: number;
    msg?: string;
  } | null>(null);

  // Validate URL
  const validateUrl = useCallback((url: string): string | null => {
    if (!url) return "请输入插件URL";
    try {
      new URL(url);
    } catch (_) {
      return "请输入有效的URL地址";
    }
    if (!url.endsWith(".zip")) return "URL必须指向.zip文件";
    return null;
  }, []);

  // Install handler
  const handleNetworkInstall = useCallback(async () => {
    const validationError = validateUrl(pluginUrl);
    setUrlError(validationError);
    if (validationError) return;

    setIsLoading(true);
    setProgressData({ stage: "start", progress: 0 });

    try {
      await installPluginFromUrl(pluginUrl, (stage, progress, msg) => {
        // Update progress state
        setProgressData({
          stage,
          progress:
            progress ??
            (stage === "downloaded" ? 100 : (progressData?.progress ?? 0)),
          msg,
        });

        // Show toast for final states or important steps
        if (stage === "installing") {
          toast.loading(msg || "正在安装...", {
            id: "networkInstall",
            duration: Infinity,
          });
        } else if (stage === "complete") {
          toast.success(msg || "安装完成!", { id: "networkInstall" });
          setTimeout(() => {
            setPluginUrl("");
            onSuccess();
          }, 300);
        } else if (stage === "error") {
          toast.error(msg || "安装失败", { id: "networkInstall" });
        }
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      error(`从网络安装插件失败: ${errorMsg}`);
      setProgressData({
        stage: "error",
        progress: 0,
        msg: `安装失败: ${errorMsg}`,
      });
      toast.error(`安装失败: ${errorMsg}`, { id: "networkInstall" });
    } finally {
      // Keep loading true until success/error state is final in progressData
      // setIsLoading(false);
    }
  }, [pluginUrl, validateUrl, onSuccess, progressData]);

  const handleCancel = useCallback(() => {
    setPluginUrl("");
    setUrlError(null);
    setProgressData(null);
    setIsLoading(false);
    onCancel();
  }, [onCancel]);

  // Determine button/progress state
  const isWorking =
    isLoading ||
    progressData?.stage === "downloading" ||
    progressData?.stage === "installing";
  const isFinished =
    progressData?.stage === "complete" || progressData?.stage === "error";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">插件 URL</label>
        <Input
          placeholder="https://.../plugin.zip"
          value={pluginUrl}
          onValueChange={(value) => {
            setPluginUrl(value);
            if (urlError) setUrlError(null);
          }}
          isRequired
          isClearable
          errorMessage={urlError}
          isInvalid={!!urlError}
          variant="bordered"
          radius="md"
          isDisabled={isWorking || isFinished}
          classNames={{
            inputWrapper:
              "bg-background/80 dark:bg-default-100/50 border-default-300/50 dark:border-default-200/30 group-data-[focus=true]:border-primary h-10",
            input: "py-2 text-sm",
            errorMessage: "text-xs text-danger",
          }}
        />
        <p className="text-xs text-foreground/60 mt-1">
          输入插件的 .zip 包下载链接 (例如从 GitHub Releases 获取)
        </p>
      </div>

      {/* Example Link (Optional) */}
      {/* <div className="flex items-center gap-1 text-xs">
        <span className="text-foreground/60">示例:</span>
        <Button
          variant="light"
          size="sm"
          className="text-primary h-auto p-0"
          startContent={<RiGithubFill size={14} />}
          onPress={() => setPluginUrl("EXAMPLE_URL")}
        >
          Tauri Plugins
        </Button>
      </div> */}

      {/* Progress Bar Area */}
      {progressData && progressData.stage !== "error" && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="mt-2"
        >
          <Progress
            aria-label="下载/安装进度"
            value={progressData.progress}
            size="sm"
            color={
              progressData.stage === "complete"
                ? "success"
                : progressData.stage === "error"
                  ? "danger"
                  : "primary"
            }
            isIndeterminate={
              progressData.stage === "start" ||
              progressData.stage === "installing"
            }
            showValueLabel={progressData.stage === "downloading"}
            label={
              <span className="text-xs text-foreground/70">
                {progressData.msg || ""}
              </span>
            }
            className="w-full"
            classNames={{ label: "mt-1 text-center" }}
          />
        </motion.div>
      )}

      {/* Show error message specifically */}
      {progressData?.stage === "error" && (
        <p className="text-danger text-xs mt-2 text-center">
          {progressData.msg || "安装失败"}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end items-center gap-2 mt-4">
        <Button
          variant="shadow"
          size="sm"
          radius="md"
          onPress={handleCancel}
          // disabled={isWorking} // Allow cancel anytime maybe?
        >
          {isFinished ? "关闭" : "取消"}
        </Button>
        <Button
          color="primary"
          variant="shadow"
          size="sm"
          radius="md"
          isLoading={isWorking}
          onPress={handleNetworkInstall}
          isDisabled={!pluginUrl || !!urlError || isWorking || isFinished}
          className="shadow-sm hover:shadow-primary/30 click-scale"
        >
          {isWorking
            ? progressData?.stage === "downloading"
              ? "下载中"
              : "安装中"
            : "下载并安装"}
        </Button>
      </div>
    </motion.div>
  );
}

export default NetworkInstallTab;
