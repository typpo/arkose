import store from 'store';
import { proxy, subscribe, useSnapshot } from 'valtio';

import Config from './config';

import type { JSONContent } from '@tiptap/core';

export const statsStore = proxy(
  store.get('stats') || {
    tokensUsed: 0,
  },
);

subscribe(statsStore, () => {
  store.set('stats', statsStore);
});

export const settingsStore = proxy(
  store.get('settings') || {
    apiKey: Config.OpenAI.apiKey || 'YOUR_API_KEY',
    lookbackTokens: 800,
    maxTokens: 256,
    temperature: 0.7,
  },
);

subscribe(settingsStore, () => {
  store.set('settings', settingsStore);
});

export const documentStore = proxy<{ content: JSONContent | null }>(
  store.get('document') || {
    content: null,
  },
);

subscribe(documentStore, () => {
  store.set('document', documentStore);
});
