import {
  tempDir,
  appConfigDir,
  appDataDir,
  downloadDir,
  appCacheDir,
  join,
} from "@tauri-apps/api/path";
import {
  exists,
  mkdir,
  readFile,
  readTextFile,
  remove,
  stat,
  writeFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import { error } from "@tauri-apps/plugin-log";

const TEMP_DIR = "TaiASST";

// 获取临时目录
export async function getTempDir() {
  const tempDirPath = await tempDir();
  const tempDirPathWithTaiASST = await join(tempDirPath, TEMP_DIR);
  return tempDirPathWithTaiASST;
}

export async function createTempDir() {
  const tempDirPath = await getTempDir();
  if (!(await checkDirExists(tempDirPath))) {
    await mkdir(tempDirPath, { recursive: true });
  }
}

// 获取应用数据目录
export async function getAppDataDir() {
  const appDataDirPath = await appDataDir();
  return appDataDirPath;
}

// 获取下载目录
export async function getDownloadDir() {
  const downloadDirPath = await downloadDir();
  return downloadDirPath;
}

// 获取应用配置目录
export async function getAppConfigDir() {
  const appConfigDirPath = await appConfigDir();
  return appConfigDirPath;
}

// 获取应用缓存目录
export async function getAppCacheDir() {
  const appCacheDirPath = await appCacheDir();
  return appCacheDirPath;
}

// 获取子目录
export async function getSubDir(dirPath: string, subDirName: string) {
  const subDirPath = await join(dirPath, subDirName);
  return subDirPath;
}

// 创建子目录
export async function createSubDir(dirPath: string, subDirName: string) {
  const subDirPath = await join(dirPath, subDirName);
  await mkdir(subDirPath, { recursive: true });
  return subDirPath;
}

// 删除子目录
export async function deleteSubDir(
  dirPath: string,
  subDirName: string,
  recursive: boolean = false
) {
  const subDirPath = await join(dirPath, subDirName);
  await remove(subDirPath, { recursive });
}

// 检查目录是否存在
export async function checkDirExists(dirPath: string) {
  const dirExists = await exists(dirPath);
  return dirExists;
}

// 写入文件到目录
export async function writeFileToDir(dirPath: string, file: File) {
  const filePath = await join(dirPath, file.name);
  await writeFile(filePath, new Uint8Array(await file.arrayBuffer()));
}

// 从目录读取文件
export async function readFileFromDir(dirPath: string, fileName: string) {
  const filePath = await join(dirPath, fileName);
  const content = await readFile(filePath);
  return content;
}

// 从目录读取文本文件
export async function readTextFileFromDir(dirPath: string, fileName: string) {
  const filePath = await join(dirPath, fileName);
  const content = await readTextFile(filePath);
  return content;
}

// 写入文本文件到目录
export async function writeTextFileToDir(
  dirPath: string,
  fileName: string,
  content: string
) {
  const filePath = await join(dirPath, fileName);
  await writeTextFile(filePath, content);
}

// 删除文件
export async function deleteFile(filePath: string) {
  await remove(filePath);
}

// 检查文件是否存在
export async function checkFileExists(filePath: string) {
  const fileExists = await exists(filePath);
  return fileExists;
}

// 获取文件信息
export async function getFileInfo(filePath: string) {
  const fileInfo = await stat(filePath);
  return fileInfo;
}

// 从网络URL下载文件到临时目录
export async function downloadFileFromUrl(
  url: string,
  fileName?: string
): Promise<string> {
  try {
    // 确保临时目录存在
    await createTempDir();
    const tempDirPath = await getTempDir();

    // 从URL获取文件名（如果未提供）
    const urlFileName =
      fileName || url.split("/").pop() || `plugin-${Date.now()}.zip`;

    // 保证文件名唯一性
    const uniqueFileName = `${Date.now()}-${urlFileName}`;
    const filePath = await join(tempDirPath, uniqueFileName);

    // 使用fetch下载文件
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status} ${response.statusText}`);
    }

    // 获取文件内容并写入临时目录
    const fileData = await response.arrayBuffer();
    await writeFile(filePath, new Uint8Array(fileData));

    return filePath;
  } catch (err) {
    error(`下载文件失败: ${String(err)}`);
    throw new Error(`下载文件失败: ${err}`);
  }
}
