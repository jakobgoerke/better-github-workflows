import type { PlasmoCSConfig, PlasmoCSUIProps, PlasmoGetInlineAnchor, PlasmoMountShadowHost } from 'plasmo';
import React from 'react';
import { RouterProvider } from 'react-router';
import { StyleSheetManager } from 'styled-components';

import { GlobalStyles } from '~components/GlobalStyles';
import { ThemeProvider } from '~components/ThemeProvider';
import { RootStoreProvider } from '~hooks/useStore';
import { router } from '~utils/router';

export const config: PlasmoCSConfig = {
  matches: ['https://github.com/*'],
  run_at: 'document_end',
};

const styles = document.createElement('style');

const Content: React.FC<PlasmoCSUIProps> = () => {
  return (
    <React.StrictMode>
      <StyleSheetManager target={styles}>
        <RootStoreProvider>
          <ThemeProvider>
            <GlobalStyles />
            <RouterProvider router={router} />
          </ThemeProvider>
        </RootStoreProvider>
      </StyleSheetManager>
    </React.StrictMode>
  );
};

export const getShadowHostId = () => 'better-github-workflows';

const SIDEBAR_NAV_SELECTOR =
  'section[style*="--sidebar-page-layout-top-offset"] aside[aria-label="Actions"] nav[aria-label="Actions workflows"]';

export const getInlineAnchor: PlasmoGetInlineAnchor = () => {
  return document.querySelector(SIDEBAR_NAV_SELECTOR);
};

const sidebarStyles = document.createElement('style');
sidebarStyles.textContent = `
  aside[aria-label="Actions"] div:has(> #better-github-workflows) { display: flex; flex-direction: column; flex: 1; min-height: 0; }
  aside[aria-label="Actions"] #better-github-workflows { box-sizing: border-box; padding: 8px; }
  aside[aria-label="Actions"] div:has(> #better-github-workflows) > nav[aria-label="Actions workflows"] { display: none; }
  aside[aria-label="Actions"] :has(> div > #better-github-workflows) { display: flex; flex-direction: column; overflow-y: hidden; scrollbar-gutter: auto; }
`;
document.head.appendChild(sidebarStyles);

export const mountShadowHost: PlasmoMountShadowHost = ({ shadowHost, anchor }) => {
  // the sidebar is rendered by React, so leave its nodes alone and only hide the native list via sidebarStyles
  anchor.element.before(shadowHost);
  shadowHost.shadowRoot.appendChild(styles);
};

export default Content;
