import { message, MessageDialogOptions } from "@tauri-apps/plugin-dialog";
import {
  checkDirExists,
  createSubDir,
  getAppDataDir,
} from "@/utils/file-manager";
import { PLUGIN_DIR } from "@/types/plugin";
import { getPluginBaseDir } from "@/utils/plugin/config";
import { injectGlobalDependencies } from "@/utils/plugin/script";
import { loadAllPlugins } from "@/utils/plugin/operations";
import { error } from "@tauri-apps/plugin-log";

/**
 * 初始化插件系统
 */
export async function initializePluginSystem(): Promise<void> {
  try {
    // 确保插件目录存在
    const pluginDir = await getPluginBaseDir();
    if (!(await checkDirExists(pluginDir))) {
      await createSubDir(await getAppDataDir(), PLUGIN_DIR);
    }

    // 注入全局依赖
    await injectGlobalDependencies();

    // 加载所有插件
    await loadAllPlugins();
  } catch (err) {
    error("插件系统初始化过程中发生严重错误:" + String(err));
    const options: MessageDialogOptions = {
      title: "插件系统错误",
    };
    await message(
      "插件系统初始化失败，部分插件可能无法正常工作: " + String(err),
      options,
    );
  }
}
