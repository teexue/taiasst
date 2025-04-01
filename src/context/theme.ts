import { theme as antdTheme } from 'antd';

// 基础主题定义（包含公共部分）
const baseTheme = {
  token: {
    colorPrimary: '#9A8EDA', // 主色调
    colorLink: '#9A8EDA', // 链接色
    colorSuccess: '#88C9A1', // 成功色
    colorWarning: '#FFB28B', // 警告色
    colorError: '#F37F89', // 错误色
    colorInfo: '#9A8EDA', // 信息色
    borderRadius: 8, // 边框圆角
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  components: {
    Layout: {
      headerHeight: 40,
      headerPadding: '0 0 0 5px',
    },
    Menu: {
      itemSelectedColor: '#fff',
      itemHoverColor: '#fff',
      horizontalItemSelectedColor: '#9A8EDA',
      horizontalItemHoverColor: '#9A8EDA',
    },
    Button: {
      primaryColor: '#fff',
    },
  },
};

// 亮色主题定义（只包含差异部分）
const lightThemeOverrides = {
  algorithm: antdTheme.defaultAlgorithm,
  components: {
    Layout: {
      headerBg: '#fff',
      headerColor: '#4A4A4A',
      bodyBg: '#F5F7FA', 
    },
    Menu: {
      itemColor: '#6A6293',
      itemBg: '#D4D1F2',
      itemActiveBg: '#b8b3e9',
      itemSelectedBg: '#9a8eda',
      itemHoverBg: '#b8b3e9',
    },
    Button: {
      defaultBg: '#fff',
      defaultColor: '#4A4A4A',
      defaultBorderColor: '#E0E0E5',
    },
    Card: {
      colorBgContainer: '#fff',
      colorBorderSecondary: '#E0E0E5',
    },
    Typography: {
      colorText: '#4A4A4A',
      colorTextSecondary: '#6E6E6E',
    },
  },
};

// 暗色主题定义（只包含差异部分）
const darkThemeOverrides = {
  algorithm: antdTheme.darkAlgorithm,
  components: {
    Layout: {
      headerBg: '#252336',
      headerColor: '#fff',
      siderBg: '#1A1825',
      bodyBg: '#1F1D2C', 
    },
    Menu: {
      itemColor: '#fff',
      itemBg: '#252336',
      itemSelectedBg: '#2E2A45',
      itemHoverBg: '#2E2A45',
    },
    Button: {
      defaultBg: '#2A2840',
      defaultColor: '#fff',
      defaultBorderColor: '#3A3654',
    },
    Card: {
      colorBgContainer: '#252336',
      colorBorderSecondary: '#3A3654',
    },
    Typography: {
      colorText: '#F0F0F0',
      colorTextSecondary: '#C0C0D0',
    },
  },
};

// 深度合并函数，用于合并嵌套对象
const deepMerge = (target: any, source: any) => {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
};

// 导出完整主题，将基础主题与特定主题合并
export const lightTheme = deepMerge(baseTheme, lightThemeOverrides);
export const darkTheme = deepMerge(baseTheme, darkThemeOverrides); 