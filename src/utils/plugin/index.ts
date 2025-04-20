// 重新导出所有内容以保持API兼容性

// 从types.ts导出
export {
  PLUGIN_DIR,
  PLUGIN_CONFIG_FILE,
  PLUGIN_SCRIPT_ID_PREFIX,
  PLUGIN_GLOBAL_VAR,
  PLUGIN_INIT_DELAY,
  type PluginConfig,
  type InstallProgressStage,
  type DownloadProgressStage,
} from "./types";

// 从script.ts导出
export {
  getPluginScriptId,
  removePluginScript,
  clearPluginGlobal,
  pluginInitDelay,
  getPluginScriptUrl,
  injectGlobalDependencies,
  loadPluginScript,
} from "./script";

// 从config.ts导出
export {
  getDefaultPluginConfig,
  getPluginBaseDir,
  getPluginConfig,
  setPluginConfig,
  getPluginConfigDir,
  getPluginConfigPath,
  getPluginConfigFile,
  savePluginConfigFile,
  addPluginToConfig,
  removePluginFromConfig,
} from "./config";

// 从operations.ts导出
export {
  loadPlugin,
  unloadPlugin,
  getPluginList,
  loadAllPlugins,
  restartPluginSystem,
} from "./operations";

// 从install.ts导出
export {
  uploadPlugin,
  uninstallPlugin,
  installPluginWithProgress,
  installPluginFromUrl,
} from "./install";

// 从system.ts导出
export { initializePluginSystem } from "./system";
