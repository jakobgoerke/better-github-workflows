import { GlobalStyles } from 'components/GlobalStyles';
import { createMemoryHistory } from 'history';
import { useStore, type Stores } from 'hook/useStore';
import { Provider } from 'mobx-react';
import { RouterStore } from 'mobx-react-router';
import { SetupPage } from 'page/SetupPage';
import { WorkflowPage } from 'page/WorkflowPage';
import type { PlasmoCSConfig, PlasmoCSUIProps, PlasmoGetInlineAnchor, PlasmoMountShadowHost } from 'plasmo';
import React, { useEffect } from 'react';
import { createMemoryRouter, Router, RouterProvider, type RouteObject } from 'react-router';
import { AppStore } from 'store';
import { StyleSheetManager } from 'styled-components';
import { router } from 'util/router';

export const config: PlasmoCSConfig = {
  matches: ['https://github.com/*'],
  run_at: 'document_start'
};

declare global {
  interface Window {
    stores: Stores;
  }
}

if (!window.stores) {
  window.stores = {
    appStore: new AppStore()
  };
}

export const store = window.stores;

const styles = document.createElement('style');

const Content: React.FC<PlasmoCSUIProps> = () => {
  useEffect(() => {
    console.log('Content mounted');
  });

  return (
    <>
      <StyleSheetManager target={styles}>
        <React.StrictMode>
          <Provider {...store}>
            <GlobalStyles />
            <RouterProvider router={router} />
          </Provider>
        </React.StrictMode>
      </StyleSheetManager>
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
