import type { Stores } from 'hook/useStore';
import { Provider } from 'mobx-react';
import type { PlasmoCSConfig, PlasmoGetInlineAnchor, PlasmoMountShadowHost } from 'plasmo';
import React from 'react';
import { AuthStore, GithubStore } from 'store';

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
    authStore: new AuthStore(),
    githubStore: new GithubStore()
  };
}

export const store = window.stores;

const Content: React.FC = () => {
  return (
    <>
      <React.StrictMode>
        <Provider {...store}>asdf</Provider>
      </React.StrictMode>
    </>
  );
};

export const getInlineAnchor: PlasmoGetInlineAnchor = () => {
  return document.querySelector('div.PageLayout-columns > div.PageLayout-pane');
};

export const mountShadowHost: PlasmoMountShadowHost = ({ shadowHost, anchor }) => {
  anchor.element.innerHTML = '';
  anchor.element.appendChild(shadowHost);
};

export default Content;
