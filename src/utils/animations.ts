/**
 * 全局动画配置
 * 统一管理应用中的动画效果，确保一致的用户体验
 */

// 缓动函数
export const easings = {
  // 平滑的缓动函数，适合页面过渡
  smooth: [0.25, 0.46, 0.45, 0.94] as const,
  // 弹性缓动，适合交互反馈
  spring: [0.68, -0.55, 0.265, 1.55] as const,
  // 快速缓动，适合微交互
  quick: [0.4, 0, 0.2, 1] as const,
  // 标准缓动
  standard: [0.4, 0, 0.6, 1] as const,
};

// 动画持续时间
export const durations = {
  // 快速动画 - 用于微交互
  fast: 0.15,
  // 标准动画 - 用于大部分交互
  normal: 0.25,
  // 慢速动画 - 用于页面过渡
  slow: 0.4,
  // 超慢动画 - 用于复杂过渡
  slower: 0.6,
};

// 页面过渡动画配置
export const pageTransitions = {
  // 主页面过渡 - 使用缩放效果
  main: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.02 },
    transition: {
      duration: durations.slow,
      ease: easings.smooth,
    },
  },

  // 模态框过渡
  modal: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: {
      duration: durations.normal,
      ease: easings.smooth,
    },
  },

  // 侧边栏过渡
  sidebar: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: {
      duration: durations.normal,
      ease: easings.smooth,
    },
  },
};

// 卡片动画变体
export const cardVariants = {
  // 隐藏状态
  hidden: {
    opacity: 0,
    scale: 0.95,
  },

  // 显示状态（支持交错动画）
  visible: (index: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: index * 0.03, // 交错延迟
      duration: durations.normal,
      ease: easings.smooth,
    },
  }),

  // 悬停状态
  hover: {
    y: -2,
    scale: 1.01,
    transition: {
      duration: durations.fast,
      ease: easings.quick,
    },
  },

  // 点击状态
  tap: {
    scale: 0.99,
    transition: {
      duration: durations.fast,
      ease: easings.quick,
    },
  },
};

// 列表项动画变体
export const listItemVariants = {
  hidden: {
    opacity: 0,
    x: -10,
  },

  visible: (index: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: index * 0.02,
      duration: durations.normal,
      ease: easings.smooth,
    },
  }),
};

// 淡入动画
export const fadeInVariants = {
  hidden: {
    opacity: 0,
  },

  visible: {
    opacity: 1,
    transition: {
      duration: durations.normal,
      ease: easings.smooth,
    },
  },
};

// 滑入动画（从上方）
export const slideInFromTop = {
  hidden: {
    opacity: 0,
    y: -20,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.normal,
      ease: easings.smooth,
    },
  },
};

// 滑入动画（从下方）
export const slideInFromBottom = {
  hidden: {
    opacity: 0,
    y: 20,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.normal,
      ease: easings.smooth,
    },
  },
};

// 滑入动画（从左侧）
export const slideInFromLeft = {
  hidden: {
    opacity: 0,
    x: -20,
  },

  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: durations.normal,
      ease: easings.smooth,
    },
  },
};

// 滑入动画（从右侧）
export const slideInFromRight = {
  hidden: {
    opacity: 0,
    x: 20,
  },

  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: durations.normal,
      ease: easings.smooth,
    },
  },
};

// 缩放动画
export const scaleVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },

  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: durations.normal,
      ease: easings.smooth,
    },
  },

  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: durations.fast,
      ease: easings.quick,
    },
  },
};

// 弹性动画
export const springVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },

  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: durations.slow,
      ease: easings.spring,
    },
  },
};

// 交错容器动画
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.1,
    },
  },
};

// 通用的动画预设
export const animations = {
  pageTransitions,
  cardVariants,
  listItemVariants,
  fadeInVariants,
  slideInFromTop,
  slideInFromBottom,
  slideInFromLeft,
  slideInFromRight,
  scaleVariants,
  springVariants,
  staggerContainer,
};

// 导出默认配置
export default animations;
