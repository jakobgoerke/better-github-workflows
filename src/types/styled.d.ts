import 'styled-components';

export interface AppTheme {
  fg: string;
  bg: string;
  hoverBg: string;
  border: string;
}

declare module 'styled-components' {
  export interface DefaultTheme extends AppTheme {}
}
