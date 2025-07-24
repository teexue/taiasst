/**
 * Logo 组件
 *
 * 使用 SVG 内联显示应用 Logo，支持主题颜色自动跟随和动画效果。
 *
 * 特性：
 * - 🎨 自动跟随主题颜色变化（使用 currentColor）
 * - 📱 响应式尺寸支持
 * - ✨ 可选的悬停动画效果
 * - 🎯 多种颜色模式（主题色、前景色、自定义色）
 *
 * @example
 * ```tsx
 * // 基础用法
 * <Logo width={32} height={32} />
 *
 * // 带动画效果
 * <Logo width={48} height={48} animated={true} />
 *
 * // 使用前景色
 * <Logo width={24} height={24} colorMode="foreground" />
 *
 * // 自定义颜色
 * <Logo width={64} height={64} colorMode="custom" className="text-success" />
 * ```
 */

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  /** 是否启用悬停动画效果 */
  animated?: boolean;
  /** 颜色模式 - primary: 使用主题主色, foreground: 使用前景色, custom: 使用className指定 */
  colorMode?: "primary" | "foreground" | "custom";
}

function Logo({
  width = 28,
  height = 28,
  className = "",
  animated = false,
  colorMode = "primary",
}: LogoProps) {
  // 根据颜色模式确定类名
  const getColorClassName = () => {
    switch (colorMode) {
      case "primary":
        return "text-primary";
      case "foreground":
        return "text-foreground";
      case "custom":
        return "";
      default:
        return "text-primary";
    }
  };

  const combinedClassName = [
    getColorClassName(),
    animated
      ? "transition-all duration-300 hover:scale-110 hover:rotate-6"
      : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 1024 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={combinedClassName}
    >
      <rect width="1024.000000" height="1024.000000" fill="transparent" />
      <g>
        <rect
          x="87.000000"
          y="87.000000"
          rx="10.000000"
          width="400.000000"
          height="400.000000"
          fill="currentColor"
        />
        <rect
          x="87.000000"
          y="537.000000"
          rx="10.000000"
          width="400.000000"
          height="400.000000"
          fill="currentColor"
        />
        <rect
          x="537.000000"
          y="537.000000"
          rx="50.000000"
          width="400.000000"
          height="400.000000"
          fill="currentColor"
        />
        <rect
          x="537.000000"
          y="87.000000"
          rx="10.000000"
          width="400.000000"
          height="400.000000"
          fill="currentColor"
        />
        <circle cx="737.000000" cy="737.000000" r="100.000000" fill="white" />
        <rect
          x="712.000000"
          y="612.000000"
          width="50.000000"
          height="50.000000"
          fill="white"
        />
        <rect
          x="712.000000"
          y="812.000000"
          width="50.000000"
          height="50.000000"
          fill="white"
        />
        <rect
          x="862.000000"
          y="712.000000"
          width="50.000000"
          height="50.000000"
          transform="rotate(90 862.000000 712.000000)"
          fill="white"
        />
        <rect
          x="612.000000"
          y="762.000000"
          width="50.000000"
          height="50.000000"
          transform="rotate(-90 612.000000 762.000000)"
          fill="white"
        />
        <rect
          x="630.934021"
          y="666.289307"
          width="50.000000"
          height="50.000000"
          transform="rotate(-45 630.934021 666.289307)"
          fill="white"
        />
        <rect
          x="772.355347"
          y="807.710693"
          width="50.000000"
          height="50.000000"
          transform="rotate(-45 772.355347 807.710693)"
          fill="white"
        />
        <rect
          x="807.710693"
          y="630.933960"
          width="50.000000"
          height="50.000000"
          transform="rotate(45 807.710693 630.933960)"
          fill="white"
        />
        <rect
          x="666.289307"
          y="843.066040"
          width="50.000000"
          height="50.000000"
          transform="rotate(-135 666.289307 843.066040)"
          fill="white"
        />
      </g>
    </svg>
  );
}

export default Logo;
