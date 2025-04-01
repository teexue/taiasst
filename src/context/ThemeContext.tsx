import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ConfigProvider } from 'antd';
import { lightTheme, darkTheme } from './theme';
import { getLocalStorage, setLocalStorage } from '@/store/local';
import { getCssVariables } from './color';

// 定义主题上下文类型
interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// 创建主题上下文
const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
});

// 主题提供者属性
interface ThemeProviderProps {
  children: ReactNode;
}

// 应用CSS变量到文档根元素
const applyCssVariables = (isDark: boolean) => {
  const cssVars = getCssVariables(isDark);
  const root = document.documentElement;
  
  // 应用所有CSS变量
  Object.entries(cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};

// 主题提供者组件
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // 初始化主题
  useEffect(() => {
    // 检查本地存储中的主题设置
    const storedTheme = getLocalStorage('theme');
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 如果本地存储有主题设置，使用它；否则检查系统偏好
    const shouldUseDark = storedTheme === 'dark' || (storedTheme === null && prefersDarkMode);
    
    setIsDarkMode(shouldUseDark);
    
    // 应用主题到HTML元素
    if (shouldUseDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // 应用CSS变量
    applyCssVariables(shouldUseDark);
  }, []);
  
  // 切换主题函数
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      
      // 更新本地存储
      setLocalStorage('theme', newMode ? 'dark' : 'light');
      
      // 更新HTML类
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // 应用CSS变量
      applyCssVariables(newMode);
      
      return newMode;
    });
  };
  
  // 根据当前模式选择主题
  const currentTheme = isDarkMode ? darkTheme : lightTheme;
  
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <ConfigProvider theme={currentTheme}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

// 自定义Hook，用于在组件中使用主题
export const useTheme = () => useContext(ThemeContext);

export default ThemeContext; 