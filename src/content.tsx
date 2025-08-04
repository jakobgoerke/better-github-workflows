import type { PlasmoCSConfig, PlasmoCSUIProps, PlasmoGetInlineAnchor, PlasmoMountShadowHost } from 'plasmo';
import React from 'react';
import { RouterProvider } from 'react-router';
import { StyleSheetManager } from 'styled-components';

import { GlobalStyles } from '~components/GlobalStyles';
import { ThemeProvider } from '~components/ThemeProvider';
import { RootStoreProvider } from '~hooks/useStore';
import { router } from '~utils/router';

export const config: PlasmoCSConfig = {
  matches: ['https://github.com/*/*/actions', 'https://github.com/*/*/actions/runs/*', 'https://github.com/*/*/actions/workflows/*.yml'],
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

export const getInlineAnchor: PlasmoGetInlineAnchor = () => {
  return document.querySelector('div.PageLayout-columns > div.PageLayout-pane');
};

export const mountShadowHost: PlasmoMountShadowHost = ({ shadowHost, anchor }) => {
  anchor.element.innerHTML = '';
  anchor.element.appendChild(shadowHost);
  anchor.element.firstElementChild.shadowRoot.appendChild(styles);
};

export default Content;
