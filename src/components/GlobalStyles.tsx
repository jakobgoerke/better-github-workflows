import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;

    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
    color: ${({ theme }) => theme.fg};
  }

  #plasmo-inline {
    display: block !important;
  }

  :host {
    display: block !important;
    height: 100%;
    overflow: hidden;
  }

  #plasmo-shadow-container {
    display: block;
    height: 100%;
  }

  #plasmo-shadow-container > * {
    height: 100%;
  }

  #root {
    position: relative;
    font-family: 'Segoe UI';
    font-size: 16px;
    font-weight: 400;
    display: flex;
    height: 100%;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
  }
`;
