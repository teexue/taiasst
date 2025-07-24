/**
 * 密码学工具函数
 */

/**
 * 生成随机盐值
 */
export function generateSalt(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

/**
 * 使用PBKDF2算法哈希密码
 */
export async function hashPassword(
  password: string,
  salt?: string,
): Promise<{ hash: string; salt: string }> {
  const actualSalt = salt || generateSalt();
  const encoder = new TextEncoder();

  // 将密码和盐值转换为ArrayBuffer
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = encoder.encode(actualSalt);

  // 导入密码作为密钥材料
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );

  // 使用PBKDF2派生密钥
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: 100000, // 10万次迭代
      hash: "SHA-256",
    },
    keyMaterial,
    256, // 256位输出
  );

  // 转换为十六进制字符串
  const hashArray = new Uint8Array(derivedBits);
  const hash = Array.from(hashArray, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  return { hash, salt: actualSalt };
}

/**
 * 验证密码
 */
export async function verifyPassword(
  password: string,
  hash: string,
  salt: string,
): Promise<boolean> {
  try {
    const { hash: computedHash } = await hashPassword(password, salt);
    return computedHash === hash;
  } catch (error) {
    console.error("密码验证失败:", error);
    return false;
  }
}

/**
 * 生成安全的随机字符串
 */
export function generateSecureRandom(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

/**
 * 简单的字符串加密（用于会话令牌等）
 */
export async function encryptString(
  text: string,
  key: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  // 生成随机IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // 导入密钥
  const keyBuffer = encoder.encode(key.padEnd(32, "0").slice(0, 32));
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );

  // 加密
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    data,
  );

  // 组合IV和加密数据
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  // 转换为base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * 解密字符串
 */
export async function decryptString(
  encryptedText: string,
  key: string,
): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // 从base64解码
    const combined = new Uint8Array(
      atob(encryptedText)
        .split("")
        .map((char) => char.charCodeAt(0)),
    );

    // 分离IV和加密数据
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    // 导入密钥
    const keyBuffer = encoder.encode(key.padEnd(32, "0").slice(0, 32));
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: "AES-GCM" },
      false,
      ["decrypt"],
    );

    // 解密
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      encrypted,
    );

    return decoder.decode(decrypted);
  } catch (error) {
    console.error("解密失败:", error);
    throw new Error("解密失败");
  }
}

/**
 * 检查密码强度
 */
export function checkPasswordStrength(password: string): {
  score: number;
  level: "weak" | "fair" | "good" | "strong";
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];

  // 长度检查
  if (password.length >= 8) score += 20;
  else feedback.push("密码长度至少需要8位");

  if (password.length >= 12) score += 10;
  else feedback.push("建议密码长度至少12位");

  // 字符类型检查
  if (/[a-z]/.test(password)) score += 15;
  else feedback.push("建议包含小写字母");

  if (/[A-Z]/.test(password)) score += 15;
  else feedback.push("建议包含大写字母");

  if (/[0-9]/.test(password)) score += 15;
  else feedback.push("建议包含数字");

  if (/[^a-zA-Z0-9]/.test(password)) score += 25;
  else feedback.push("建议包含特殊字符");

  // 确定强度等级
  let level: "weak" | "fair" | "good" | "strong";
  if (score < 40) level = "weak";
  else if (score < 60) level = "fair";
  else if (score < 80) level = "good";
  else level = "strong";

  return { score, level, feedback };
}

/**
 * 生成强密码
 */
export function generateStrongPassword(length: number = 16): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  const allChars = lowercase + uppercase + numbers + symbols;

  let password = "";

  // 确保至少包含每种类型的字符
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // 填充剩余长度
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // 打乱字符顺序
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}
