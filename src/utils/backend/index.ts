import * as systemFunctions from "./system";
import * as httpFunctions from "./http";
import * as fileFunctions from "./file";
import * as pluginFunctions from "./plugin";

// 导出所有根据Rust后端代码定义的类型
export * from "./system";
export * from "./http";
export * from "./file";
export * from "./plugin";

// 系统信息相关接口
export const system = {
  /**
   * 获取系统基础信息
   * 对应 src-tauri/src/system/info.rs -> get_system_info
   * @returns 系统信息对象
   */
  getSystemInfo: systemFunctions.getSystemInfo,

  /**
   * 获取完整的系统使用情况 (CPU, 内存, 磁盘, GPU)
   * 对应 src-tauri/src/system/metrics.rs -> get_system_metrics
   * @returns 包含所有指标的对象
   */
  getSystemMetrics: systemFunctions.getSystemMetrics,

  /**
   * 获取CPU使用情况
   * 对应 src-tauri/src/system/metrics.rs -> get_cpu_metrics
   * @returns CPU使用情况对象
   */
  getCpuMetrics: systemFunctions.getCpuMetrics,

  /**
   * 获取内存使用情况
   * 对应 src-tauri/src/system/metrics.rs -> get_memory_metrics
   * @returns 内存使用情况对象
   */
  getMemoryMetrics: systemFunctions.getMemoryMetrics,

  /**
   * 获取所有磁盘的使用情况
   * 对应 src-tauri/src/system/metrics.rs -> get_disk_metrics
   * @returns 磁盘使用情况数组
   */
  getDiskMetrics: systemFunctions.getDiskMetrics,

  /**
   * 获取所有GPU的使用情况
   * 对应 src-tauri/src/system/metrics.rs -> get_gpu_metrics
   * @returns GPU使用情况数组
   */
  getGpuMetrics: systemFunctions.getGpuMetrics,
};

// HTTP 相关接口
export const http = {
  /**
   * 发送 HTTP GET 请求
   * 对应 src-tauri/src/http/client.rs -> http_get
   * @param url 请求 URL
   * @param headers 可选的请求头
   * @param params 可选的查询参数
   * @returns 响应体文本内容
   * @throws 如果请求失败或读取响应失败，则抛出错误信息字符串
   */
  get: httpFunctions.get,

  /**
   * 发送 HTTP POST 请求
   * 对应 src-tauri/src/http/client.rs -> http_post
   * @param url 请求 URL
   * @param body 请求体 (必须是字符串)
   * @param headers 可选的请求头
   * @param params 可选的查询参数
   * @returns 响应体文本内容
   * @throws 如果请求失败或读取响应失败，则抛出错误信息字符串
   */
  post: httpFunctions.post,

  /**
   * 发送 HTTP PUT 请求
   * 对应 src-tauri/src/http/client.rs -> http_put
   * @param url 请求 URL
   * @param body 请求体 (必须是字符串)
   * @param headers 可选的请求头
   * @param params 可选的查询参数
   * @returns 响应体文本内容
   * @throws 如果请求失败或读取响应失败，则抛出错误信息字符串
   */
  put: httpFunctions.put,

  /**
   * 发送 HTTP DELETE 请求
   * 对应 src-tauri/src/http/client.rs -> http_delete
   * @param url 请求 URL
   * @param headers 可选的请求头
   * @param params 可选的查询参数
   * @returns 响应体文本内容
   * @throws 如果请求失败或读取响应失败，则抛出错误信息字符串
   */
  delete: httpFunctions.delete_,

  /**
   * 下载文件
   * 对应 src-tauri/src/http/client.rs -> http_download_file
   * @param url 文件 URL
   * @param savePath 保存路径
   * @param headers 可选的请求头
   * @returns 成功时返回包含保存路径的成功信息字符串
   * @throws 如果下载失败、创建文件失败或写入失败，则抛出错误信息字符串
   */
  downloadFile: httpFunctions.downloadFile,
};

// 文件操作相关接口
export const file = {
  /**
   * 创建目录
   * 对应 src-tauri/src/file/base.rs -> create_directory
   * @param path 目录路径
   * @throws 如果创建失败，则抛出错误信息字符串
   */
  createDirectory: fileFunctions.createDirectory,

  /**
   * 删除文件或目录 (递归删除目录)
   * 对应 src-tauri/src/file/base.rs -> delete_file
   * @param path 文件或目录路径
   * @throws 如果删除失败，则抛出错误信息字符串
   */
  deleteFile: fileFunctions.deleteFile,

  /**
   * 重命名文件或目录
   * 对应 src-tauri/src/file/base.rs -> rename_file
   * @param oldPath 原路径
   * @param newPath 新路径
   * @throws 如果重命名失败，则抛出错误信息字符串
   */
  renameFile: fileFunctions.renameFile,

  /**
   * 复制文件
   * 对应 src-tauri/src/file/base.rs -> copy_file
   * @param source 源文件路径
   * @param destination 目标文件路径
   * @throws 如果复制失败，则抛出错误信息字符串
   */
  copyFile: fileFunctions.copyFile,

  /**
   * 检查文件是否存在
   * 对应 src-tauri/src/file/base.rs -> file_exists
   * @param path 文件路径
   * @returns 文件是否存在
   */
  fileExists: fileFunctions.fileExists,

  /**
   * 获取文件信息
   * 对应 src-tauri/src/file/base.rs -> get_file_info
   * @param path 文件路径
   * @returns 文件信息对象
   * @throws 如果文件不存在或获取信息失败，则抛出错误信息字符串
   */
  getFileInfo: fileFunctions.getFileInfo,

  /**
   * 读取应用配置
   * 对应 src-tauri/src/file/config.rs -> read_app_config
   * @param configType 配置类型
   * @returns 应用配置对象
   * @throws 如果读取或解析失败，则抛出错误信息字符串
   */
  readAppConfig: fileFunctions.readAppConfig,

  /**
   * 写入应用配置
   * 对应 src-tauri/src/file/config.rs -> write_app_config
   * @param configType 配置类型
   * @param config 应用配置对象
   * @throws 如果创建目录、序列化或写入失败，则抛出错误信息字符串
   */
  writeAppConfig: fileFunctions.writeAppConfig,

  /**
   * 读取本地应用配置
   * 对应 src-tauri/src/file/config.rs -> read_local_app_config
   * @returns 应用配置对象
   * @throws 如果读取或解析失败，则抛出错误信息字符串
   */
  readLocalAppConfig: fileFunctions.readLocalAppConfig,

  /**
   * 写入本地应用配置
   * 对应 src-tauri/src/file/config.rs -> write_local_app_config
   * @param config 应用配置对象
   * @throws 如果创建目录、序列化或写入失败，则抛出错误信息字符串
   */
  writeLocalAppConfig: fileFunctions.writeLocalAppConfig,

  /**
   * 读取本地工具配置
   * 对应 src-tauri/src/file/config.rs -> read_local_tools_config
   * @returns 工具配置对象
   * @throws 如果读取或解析失败，则抛出错误信息字符串
   */
  readLocalToolsConfig: fileFunctions.readLocalToolsConfig,

  /**
   * 写入本地工具配置
   * 对应 src-tauri/src/file/config.rs -> write_local_tools_config
   * @param config 工具配置对象
   * @throws 如果创建目录、序列化或写入失败，则抛出错误信息字符串
   */
  writeLocalToolsConfig: fileFunctions.writeLocalToolsConfig,
};

// 插件系统相关接口
export const plugin = {
  /**
   * 初始化插件系统
   * 对应 src-tauri/src/plugin/api.rs -> init_plugin_system
   * @returns 初始化结果
   * @throws 如果初始化失败，则抛出错误信息字符串
   */
  initPluginSystem: pluginFunctions.initPluginSystem,

  /**
   * 获取插件基础目录的路径
   * 对应 src-tauri/src/plugin/utils.rs -> get_plugin_base_dir
   * @returns 插件目录路径字符串
   * @throws 如果获取失败，则抛出错误信息字符串
   */
  getPluginBaseDir: pluginFunctions.getPluginBaseDir,

  /**
   * 获取插件全局配置文件路径
   * 对应 src-tauri/src/plugin/utils.rs -> get_plugin_global_config_path
   * @returns 配置文件路径字符串
   * @throws 如果获取失败，则抛出错误信息字符串
   */
  getPluginGlobalConfigPath: pluginFunctions.getPluginGlobalConfigPath,

  /**
   * 获取特定插件的目录路径
   * 对应 src-tauri/src/plugin/utils.rs -> get_plugin_path
   * @param pluginId 插件ID
   * @returns 插件目录路径字符串
   * @throws 如果获取失败或插件不存在，则抛出错误信息字符串
   */
  getPluginPath: pluginFunctions.getPluginPath,

  /**
   * 获取特定插件的元数据
   * 对应 src-tauri/src/plugin/utils.rs -> get_plugin_metadata
   * @param pluginId 插件ID
   * @returns 插件元数据对象
   * @throws 如果获取失败或插件不存在，则抛出错误信息字符串
   */
  getPluginMetadata: pluginFunctions.getPluginMetadata,

  /**
   * 加载指定的插件
   * 对应 src-tauri/src/plugin/api.rs -> load_plugin
   * @param metadata 插件元数据对象
   * @throws 如果插件已加载或加载失败，则抛出错误信息字符串
   */
  loadPlugin: pluginFunctions.loadPlugin,

  /**
   * 卸载指定的插件
   * 对应 src-tauri/src/plugin/api.rs -> unload_plugin
   * @param pluginId 要卸载的插件ID
   * @throws 如果插件未加载或卸载失败，则抛出错误信息字符串
   */
  unloadPlugin: pluginFunctions.unloadPlugin,

  /**
   * 获取当前已加载的所有插件的元数据列表
   * 对应 src-tauri/src/plugin/api.rs -> get_loaded_plugins
   * @returns 插件元数据数组
   * @throws 如果获取失败，则抛出错误信息字符串
   */
  getLoadedPlugins: pluginFunctions.getLoadedPlugins,

  /**
   * 调用已加载插件的后端函数
   * 对应 src-tauri/src/plugin/api.rs -> call_plugin_function
   * @param pluginId 目标插件的ID
   * @param functionName 要调用的函数名 (不含插件入口前缀)
   * @param args 传递给函数的参数数组 (i32类型的数组)
   * @returns 函数的返回值 (i32)
   * @throws 如果插件未加载、函数未找到或插件无后端库，则抛出错误信息字符串
   */
  callPluginFunction: pluginFunctions.callPluginFunction,

  /**
   * 从ZIP压缩包安装插件
   * 对应 src-tauri/src/plugin/api.rs -> install_plugin_from_zip
   * @param zipPath ZIP文件的路径
   * @returns 安装成功的插件元数据
   * @throws 如果解压失败、找不到metadata.json、解析失败或插件已存在，则抛出错误信息字符串
   */
  installPluginFromZip: pluginFunctions.installPluginFromZip,

  /**
   * 从插件目录删除插件
   * 对应 src-tauri/src/plugin/api.rs -> uninstall_plugin
   * @param pluginId 要删除的插件ID
   * @throws 如果插件未加载或删除失败，则抛出错误信息字符串
   */
  uninstallPlugin: pluginFunctions.uninstallPlugin,
  /**
   * 从ZIP文件中读取插件元数据，不执行安装
   * 对应 src-tauri/src/plugin/api.rs -> get_plugin_metadata_from_zip
   * @param zipPath ZIP文件的路径
   * @returns 插件元数据对象
   * @throws 如果文件不存在、不是ZIP文件、缺少metadata.json或解析失败，则抛出错误信息字符串
   */
  getPluginMetadataFromZip: pluginFunctions.getPluginMetadataFromZip,
};

// 直接导出所有模块以方便使用
export default {
  system,
  http,
  file,
  plugin,
};
