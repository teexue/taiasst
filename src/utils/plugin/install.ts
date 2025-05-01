import { join } from "@tauri-apps/api/path";
import backend from "@/utils/backend";
import { PluginMetadata, Origin } from "@/types/plugin";
import { InstallProgressStage, DownloadProgressStage } from "./types";
import { loadAllPlugins } from "./operations";
import { error, info, warn } from "@tauri-apps/plugin-log";
import {
  addPluginToConfig,
  getPluginConfigFile,
  removePluginFromConfig,
} from "./config";
import {
  getTempDir,
  createTempDir,
  checkDirExists,
  writeFileToDir,
  checkFileExists,
  deleteFile,
} from "../file-manager";

/**
 * 上传插件文件并返回临时文件路径
 * @param file 上传的文件对象
 * @returns 保存后的临时文件路径
 */
export async function uploadPlugin(file: File): Promise<string> {
  try {
    const tempDirPath = await getTempDir();
    const uniqueFileName = `${Date.now()}-${file.name}`;
    const filePath = await join(tempDirPath, uniqueFileName);
    if (!(await checkDirExists(tempDirPath))) {
      await createTempDir();
    }
    const buffer = await file.arrayBuffer();
    await writeFileToDir(tempDirPath, new File([buffer], uniqueFileName));
    return filePath;
  } catch (error) {
    throw new Error(`上传插件文件失败: ${error}`);
  }
}

/**
 * 卸载插件 (包括删除文件和更新配置)
 * @param pluginId 插件ID
 */
export async function uninstallPlugin(pluginId: string): Promise<boolean> {
  try {
    await backend.plugin.uninstallPlugin(pluginId);
    await removePluginFromConfig(pluginId);
    return true;
  } catch (err) {
    error(`卸载插件 ${pluginId} 时出错: ${String(err)}`);
    return false;
  }
}

/**
 * 带进度回调的从本地 ZIP 文件安装插件
 * @param filePath 插件ZIP文件路径
 * @param progressCallback 进度回调函数
 * @returns 安装后的插件元数据
 * @throws 如果插件已安装或安装过程中发生错误
 */
export async function installPluginWithProgress(
  filePath: string,
  origin: Origin,
  progressCallback?: (stage: InstallProgressStage, message?: string) => void,
): Promise<PluginMetadata> {
  try {
    progressCallback?.("start", "开始安装插件...");

    // 1. 预检查：获取元数据并检查是否已安装
    let metadata: PluginMetadata;
    try {
      metadata = await backend.plugin.getPluginMetadataFromZip(filePath);

      const config = await getPluginConfigFile();

      const existingPlugin = config.plugins.find(
        (p: PluginMetadata) => p.id === metadata.id,
      );
      if (existingPlugin) {
        progressCallback?.(
          "already_installed",
          `插件 '${metadata.name}' (ID: ${metadata.id}) 已经安装。`,
        );
        info(`插件 '${metadata.name}' (ID: ${metadata.id}) 已经安装。`);
        return existingPlugin; // 如果已安装，直接返回现有元数据
      }
    } catch (metaError: any) {
      const errorMsg = String(metaError?.message || metaError);
      error(
        `[installPluginWithProgress] Error during metadata check: ${errorMsg}`,
      );
      progressCallback?.("error", `安装失败: ${errorMsg}`);
      throw metaError; // 如果元数据检查严重失败则重新抛出
    }

    // 2. 执行实际安装（解压文件等）
    progressCallback?.("installing", "正在解压和安装文件...");

    const installedMetadata =
      await backend.plugin.installPluginFromZip(filePath);

    // 3. 更新配置文件
    progressCallback?.("installing", "正在更新配置...");

    await addPluginToConfig(installedMetadata, origin);

    // 4. 重新加载插件
    progressCallback?.("installing", "正在加载插件...");

    await loadAllPlugins();

    progressCallback?.("complete", `插件 '${installedMetadata.name}' 安装成功`);
    return installedMetadata;
  } catch (err: any) {
    const errorMsg = String(err?.message || err);
    error(`installPluginWithProgress 失败: ${errorMsg}`);
    // 检查是否是"已经安装"的特定错误（可能由 installPluginFromZip 抛出）
    if (errorMsg.includes("已经安装")) {
      progressCallback?.("already_installed", errorMsg);
      // 尝试再次获取并返回现有元数据
      try {
        if (filePath) {
          // 需要下载的文件路径来获取元数据
          const meta = await backend.plugin.getPluginMetadataFromZip(filePath);
          const conf = await getPluginConfigFile();
          const existing = conf.plugins.find(
            (p: PluginMetadata) => p.id === meta.id,
          );
          if (existing) return existing;
        }
      } catch {}
      throw err; // 如果无法找到现有插件，重新抛出
    } else {
      progressCallback?.("error", `安装失败: ${errorMsg}`);
      throw err; // 重新抛出其他错误
    }
  }
}

/**
 * 从网络URL安装插件 (使用更新后的函数)
 */
export async function installPluginFromUrl(
  url: string,
  progressCallback?: (
    stage: DownloadProgressStage,
    progress?: number, // progress 现在是可选的，因为后端下载不提供进度
    message?: string,
  ) => void,
): Promise<PluginMetadata> {
  let downloadedFilePath: string | null = null;
  try {
    progressCallback?.("downloading", undefined, "开始下载插件..."); // 进度设为 undefined

    const tempDir = await getTempDir();
    const fileName = `plugin-download-${Date.now()}.zip`;
    const savePath = await join(tempDir, fileName);
    downloadedFilePath = savePath;

    if (!(await checkDirExists(tempDir))) {
      await createTempDir();
    }

    await backend.http.downloadFile(url, savePath);

    progressCallback?.("downloaded", 100, "下载完成，准备安装...");

    // 使用内部带进度的安装流程，它现在会处理"已安装"的情况
    const result = await installPluginWithProgress(
      savePath,
      "network",
      (stage, message) => {
        // stage 类型现在匹配 DownloadProgressStage，因为 DownloadProgressStage 包含了 InstallProgressStage
        progressCallback?.(stage, undefined, message);
      },
    );

    // 清理下载的临时文件
    try {
      if (await checkFileExists(savePath)) {
        await deleteFile(savePath);
      }
    } catch (cleanupError) {
      warn(`清理临时下载文件 ${savePath} 失败: ${String(cleanupError)}`);
    }

    return result;
  } catch (err: any) {
    const errorMsg = String(err?.message || err);
    error(`installPluginFromUrl 失败: ${errorMsg}`);

    // 如果错误是"已经安装"，则回调 already_installed
    if (errorMsg.includes("已经安装")) {
      // 修复：将 progress 设为 undefined
      progressCallback?.("already_installed", undefined, errorMsg);
      // 尝试返回已安装的插件元数据
      try {
        if (downloadedFilePath) {
          // 需要下载的文件路径来获取元数据
          const meta =
            await backend.plugin.getPluginMetadataFromZip(downloadedFilePath);
          const conf = await getPluginConfigFile();
          const existing = conf.plugins.find(
            (p: PluginMetadata) => p.id === meta.id,
          );
          if (existing) return existing;
        }
      } catch {}
      throw err; // 如果无法获取元数据，重新抛出错误
    } else if (errorMsg.includes("请求失败") || errorMsg.includes("下载失败")) {
      progressCallback?.("error", undefined, `下载失败: ${errorMsg}`);
    } else {
      progressCallback?.("error", undefined, `安装失败: ${errorMsg}`);
    }

    // 清理可能残留的下载文件
    if (downloadedFilePath) {
      try {
        if (await checkFileExists(downloadedFilePath)) {
          await deleteFile(downloadedFilePath);
        }
      } catch (cleanupError) {
        warn(
          `出错后清理临时下载文件 ${downloadedFilePath} 失败: ${String(
            cleanupError,
          )}`,
        );
      }
    }

    throw err;
  }
}
