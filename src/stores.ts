import store from 'store';
import { proxy, subscribe, useSnapshot } from 'valtio';
import { v4 as uuidv4 } from 'uuid';

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
    lookbackChars: 1024,
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

let currentUser = store.get('user');
if (!currentUser) {
  currentUser = {
    uuid: uuidv4(),
    remainingCompletions: 100,
  };
  store.set('user', currentUser);
}
export const userStore = proxy(currentUser);

subscribe(userStore, () => {
  store.set('user', userStore);
});
