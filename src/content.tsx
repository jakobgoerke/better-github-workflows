import { GlobalStyles } from 'components/GlobalStyles';
import { useStore, type Stores } from 'hook/useStore';
import { Provider } from 'mobx-react';
import { SetupPage } from 'page/SetupPage';
import { WorkflowPage } from 'page/WorkflowPage';
import type { PlasmoCSConfig, PlasmoCSUIProps, PlasmoGetInlineAnchor, PlasmoMountShadowHost } from 'plasmo';
import React from 'react';
import { AppStore } from 'store';
import { StyleSheetManager } from 'styled-components';

export const config: PlasmoCSConfig = {
  matches: ['https://github.com/*/*/actions*'],
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

const App: React.FC = () => {
  const { appStore } = useStore();

  if (!appStore.token) {
    return <SetupPage />;
  }

  return <WorkflowPage />;
};

const styles = document.createElement('style');

const Content: React.FC<PlasmoCSUIProps> = ({ anchor }) => {
  return (
    <>
      <StyleSheetManager target={styles}>
        <React.StrictMode>
          <Provider {...store}>
            <GlobalStyles />
            <App />
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
