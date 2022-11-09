import { Extension } from '@tiptap/core';

import { doCompletion } from './completion';

const aiKeyboardShortcut = Extension.create({
  name: 'GPT-3 extension',
  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => {
        doCompletion(this.editor);
        return true;
      },
    };
  },
});

export default aiKeyboardShortcut;
