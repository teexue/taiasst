import { warn } from "@tauri-apps/plugin-log";

/**
 * 转换字节为可读的大小 (KB, MB, GB...)
 * @param bytes - 要格式化的字节数 (可以为 null 或 undefined)
 * @param decimals - 保留的小数位数 (默认为 2)
 * @returns 格式化后的字符串，例如 "1.23 MB"
 */
export const formatBytes = (
  bytes: number | null | undefined,
  decimals = 2
): string => {
  if (bytes === null || bytes === undefined || bytes === 0) return "0 字节";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["字节", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  // 修复：处理负数或非数字输入
  if (typeof bytes !== "number" || !isFinite(bytes) || bytes < 0) {
    warn(`Invalid input to formatBytes: ${bytes}`);
    return "N/A";
  }

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // 修复：确保不会访问 sizes[-1]
  if (i < 0) return "0 字节"; // bytes < 1
  // 确保索引在范围内
  const index = Math.min(i, sizes.length - 1);

  return (
    parseFloat((bytes / Math.pow(k, index)).toFixed(dm)) + " " + sizes[index]
  );
};

/**
 * 格式化系统运行时间 (秒)
 * @param seconds - 总秒数 (可以为 null 或 undefined)
 * @returns 格式化后的字符串，例如 "1天 2小时 3分钟" 或 "N/A"
 */
export const formatUptime = (seconds: number | null | undefined): string => {
  if (
    seconds === undefined ||
    seconds === null ||
    typeof seconds !== "number" ||
    !isFinite(seconds) ||
    seconds < 0
  ) {
    return "N/A";
  }
  // 处理 0 秒的情况
  if (seconds === 0) return "0秒";

  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  let result = "";
  if (days > 0) {
    result += `${days}天 `;
  }
  if (hours > 0) {
    result += `${hours}小时 `;
  }
  if (minutes > 0) {
    result += `${minutes}分钟`;
  }
  // 如果总时间小于一分钟，显示秒
  if (days === 0 && hours === 0 && minutes === 0 && remainingSeconds >= 0) {
    result = `${remainingSeconds}秒`;
  }
  // 如果刚好是整分钟且无剩余秒数，并且时间大于0
  else if (days === 0 && hours === 0 && minutes > 0 && remainingSeconds === 0) {
    result = `${minutes}分钟`;
  }
  // 处理超过一分钟但有剩余秒数的情况
  else if (minutes > 0 && remainingSeconds > 0) {
    result += ` ${remainingSeconds}秒`;
  }

  // 如果结果为空字符串（非常小的秒数被 floor 为 0），则至少显示 0 秒
  return result.trim() || "0秒";
};
