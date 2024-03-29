import { Provider } from 'mobx-react';
import type { PlasmoCSConfig, PlasmoCSUIProps, PlasmoGetInlineAnchor, PlasmoMountShadowHost } from 'plasmo';
import React from 'react';
import { RouterProvider } from 'react-router';
import { StyleSheetManager } from 'styled-components';

import { GlobalStyles } from '~components/GlobalStyles';
import { ThemeProvider } from '~components/ThemeProvider';
import { rootStore } from '~hook/useStore';
import { router } from '~util/router';

export const config: PlasmoCSConfig = {
  matches: ['https://github.com/*'],
  run_at: 'document_end'
};

const styles = document.createElement('style');

const Content: React.FC<PlasmoCSUIProps> = () => {
  return (
    <>
      <React.StrictMode>
        <StyleSheetManager target={styles}>
          <Provider value={rootStore}>
            <ThemeProvider>
              <GlobalStyles />
              <RouterProvider router={router} />
            </ThemeProvider>
          </Provider>
        </StyleSheetManager>
      </React.StrictMode>
    </>
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
