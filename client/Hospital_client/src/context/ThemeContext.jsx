import React, { createContext, useState } from 'react';
import { ConfigProvider, theme } from 'antd';

export const ThemeContext = createContext();

export const CustomThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const antdTheme = {
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 6,
      colorBgBase: isDark ? '#141414' : '#ffffff',
    },
    components: {
      Layout: {
        bodyBg: isDark ? '#141414' : '#f0f2f5',
        headerBg: isDark ? '#1f1f1f' : '#ffffff',
        siderBg: isDark ? '#1f1f1f' : '#ffffff',
      },
      Menu: {
        darkItemBg: '#1f1f1f',
        darkSubMenuItemBg: '#141414',
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <ConfigProvider theme={antdTheme}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};