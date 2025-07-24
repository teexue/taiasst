import {
  PasswordGenerateOptions,
  PasswordStrength,
  PasswordStrengthResult,
  DEFAULT_GENERATE_OPTIONS,
} from "@/types/password";

// 重新导出 DEFAULT_GENERATE_OPTIONS 以保持向后兼容
export { DEFAULT_GENERATE_OPTIONS };

/**
 * 生成随机密码
 */
export function generatePassword(options: PasswordGenerateOptions): string {
  let charset = "";

  if (options.includeLowercase) {
    charset += "abcdefghijklmnopqrstuvwxyz";
  }

  if (options.includeUppercase) {
    charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  }

  if (options.includeNumbers) {
    charset += "0123456789";
  }

  if (options.includeSymbols) {
    charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";
  }

  // 排除相似字符
  if (options.excludeSimilar) {
    charset = charset.replace(/[il1Lo0O]/g, "");
  }

  // 排除模糊字符
  if (options.excludeAmbiguous) {
    charset = charset.replace(/[{}[\]()\/\\'"~,;.<>]/g, "");
  }

  if (charset.length === 0) {
    throw new Error("至少需要选择一种字符类型");
  }

  let password = "";
  for (let i = 0; i < options.length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
}

/**
 * 检测密码强度
 */
export function checkPasswordStrength(
  password: string,
): PasswordStrengthResult {
  let score = 0;
  const feedback: string[] = [];
  const suggestions: string[] = [];

  // 长度检查
  if (password.length >= 12) {
    score += 25;
  } else if (password.length >= 8) {
    score += 15;
    suggestions.push("建议密码长度至少12位");
  } else {
    score += 5;
    feedback.push("密码太短");
    suggestions.push("密码长度至少8位");
  }

  // 字符类型检查
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSymbols = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);

  let charTypeCount = 0;
  if (hasLowercase) charTypeCount++;
  if (hasUppercase) charTypeCount++;
  if (hasNumbers) charTypeCount++;
  if (hasSymbols) charTypeCount++;

  score += charTypeCount * 15;

  if (charTypeCount < 3) {
    feedback.push("缺少字符类型多样性");
    if (!hasLowercase) suggestions.push("添加小写字母");
    if (!hasUppercase) suggestions.push("添加大写字母");
    if (!hasNumbers) suggestions.push("添加数字");
    if (!hasSymbols) suggestions.push("添加特殊符号");
  }

  // 重复字符检查
  const repeatedChars = /(.)\1{2,}/.test(password);
  if (repeatedChars) {
    score -= 10;
    feedback.push("包含重复字符");
    suggestions.push("避免连续重复字符");
  }

  // 连续字符检查
  const sequentialChars =
    /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789)/i.test(
      password,
    );
  if (sequentialChars) {
    score -= 10;
    feedback.push("包含连续字符");
    suggestions.push("避免连续的字母或数字");
  }

  // 常见密码检查
  const commonPasswords = [
    "password",
    "123456",
    "123456789",
    "qwerty",
    "abc123",
    "password123",
    "admin",
    "letmein",
    "welcome",
    "monkey",
  ];

  if (
    commonPasswords.some((common) => password.toLowerCase().includes(common))
  ) {
    score -= 20;
    feedback.push("包含常见密码模式");
    suggestions.push("避免使用常见密码");
  }

  // 确保分数在0-100范围内
  score = Math.max(0, Math.min(100, score));

  // 确定强度等级
  let strength: PasswordStrength;
  if (score >= 80) {
    strength = PasswordStrength.STRONG;
  } else if (score >= 60) {
    strength = PasswordStrength.GOOD;
  } else if (score >= 40) {
    strength = PasswordStrength.FAIR;
  } else {
    strength = PasswordStrength.WEAK;
  }

  return {
    strength,
    score,
    feedback,
    suggestions,
  };
}

/**
 * 获取密码强度颜色
 */
export function getPasswordStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case PasswordStrength.WEAK:
      return "danger";
    case PasswordStrength.FAIR:
      return "warning";
    case PasswordStrength.GOOD:
      return "primary";
    case PasswordStrength.STRONG:
      return "success";
    default:
      return "default";
  }
}

/**
 * 获取密码强度文本
 */
export function getPasswordStrengthText(strength: PasswordStrength): string {
  switch (strength) {
    case PasswordStrength.WEAK:
      return "弱";
    case PasswordStrength.FAIR:
      return "一般";
    case PasswordStrength.GOOD:
      return "良好";
    case PasswordStrength.STRONG:
      return "强";
    default:
      return "未知";
  }
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 降级方案
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand("copy");
      textArea.remove();
      return result;
    }
  } catch (error) {
    console.error("复制到剪贴板失败:", error);
    return false;
  }
}

/**
 * 格式化时间戳
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "今天";
  } else if (diffDays === 1) {
    return "昨天";
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}周前`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months}个月前`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years}年前`;
  }
}

/**
 * 验证URL格式
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 从URL提取域名
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

/**
 * 生成网站图标URL
 */
export function getFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
  } catch {
    return "";
  }
}
