import 'styled-components';

export interface AppTheme {
  fg: string;
  bg: string;
  hoverBg: string;
  border: string;
  focusColor: string;
}

declare module 'styled-components' {
  export interface DefaultTheme extends AppTheme {}
}
