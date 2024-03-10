import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    font-family: 'Segoe UI';
    color: ${({ theme }) => theme.fg};
  }

  html,
  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #plasmo-inline {
    display: block !important;
  }

  #root {
    position: relative;
    font-family: 'Segoe UI';
    font-size: 16px;
    font-weight: 400;
    display: flex;
  }

  #plasmo-shadow-container {
    display: block;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
  }
`;
