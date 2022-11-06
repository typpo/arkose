import store from 'store';
import { Schema, Node as ProseMirrorNode } from 'prosemirror-model';
import { Extension, getText, getTextSerializersFromSchema } from '@tiptap/core';
import { Configuration, OpenAIApi } from 'openai';
import { toast } from 'react-toastify';

import Config from './config';

function getTextFromDocument(schema: Schema, node: ProseMirrorNode) {
  // https://github.com/ueberdosis/tiptap/blob/4851fc5e9b6daccc15a1839e471db489401eca0c/packages/core/src/Editor.ts#L428
  return getText(node, {
    blockSeparator: '\n\n',
    textSerializers: {
      ...getTextSerializersFromSchema(schema),
    },
  });
}

const aiKeyboardShortcut = Extension.create({
  name: 'GPT-3 extension',
  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => {
        const { editor } = this;
        async function run() {
          // TODO(ian): Handle selections
          const pos = editor.state.selection.$anchor.pos;
          const before = getTextFromDocument(editor.schema, editor.state.doc.cut(0, pos));
          const after = getTextFromDocument(
            editor.schema,
            editor.state.doc.cut(pos, editor.state.doc.content.size),
          );
          console.log(`Before: "${before}"`);
          console.log(`After: "${after}"`);

          editor.setEditable(false);
          const loadingToast = toast.loading('Generating text...');
          const configuration = new Configuration({
            apiKey: Config.OpenAI.apiKey || store.get('openAiApiKey'),
          });
          const openai = new OpenAIApi(configuration);
          const completion = await openai.createCompletion({
            model: 'text-davinci-002',
            prompt: before.trim(),
            suffix: after.trim() ? after.trim() : undefined,
            max_tokens: Number(store.get('openAiMaxTokens')) || 256,
            temperature: Number(store.get('openAiTemperature')) || 0.7,
            best_of: 1,
            presence_penalty: 0,
          });
          toast.dismiss(loadingToast);
          editor.setEditable(true);
          const completedText = completion.data.choices[0].text;
          if (!completedText?.trim()) {
            toast.error("The AI didn't have anything to say. Try writing a bit more.", {
              hideProgressBar: true,
            });
            return;
          }
          console.log(`completion "${completedText}"`);
          const shouldAddSpace = !before.endsWith(' ') && !before.endsWith('\n');
          console.log('shouldAddSpace?', shouldAddSpace);
          editor.commands.insertContent((shouldAddSpace ? ' ' : '') + completedText.trim());
        }
        run();
        return true;
      },
    };
  },
});

export default aiKeyboardShortcut;
