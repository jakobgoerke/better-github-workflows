import React, { type PropsWithChildren } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

type Theme = 'light' | 'dark';

interface AppTheme {
  fg: string;
  bg: string;
  hoverBg: string;
  border: string;
}

const dark: AppTheme = {
  fg: '#e6edf3',
  bg: '#161b22',
  hoverBg: 'rgba(177, 186, 196, 0.12)',
  border: '#30363d'
};

const light: AppTheme = {
  fg: '#1F2328',
  bg: '#f6f8fa',
  hoverBg: 'rgba(208,215,222,0.32)',
  border: '#d0d7de'
};

const themes: Map<Theme, AppTheme> = new Map([
  ['dark', dark],
  ['light', light]
]);

const getSelectedGithubTheme = (): Theme => {
  const colorMode = document.documentElement.getAttribute('data-color-mode');
  const lightTheme = document.documentElement.getAttribute('data-light-theme');
  const darkTheme = document.documentElement.getAttribute('data-dark-theme');

  return (colorMode === 'light' ? lightTheme : darkTheme) as unknown as Theme;
};

export const theme = () => themes.get(getSelectedGithubTheme()) || dark;

const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return <StyledThemeProvider theme={theme()}>{children}</StyledThemeProvider>;
};

export { ThemeProvider };
