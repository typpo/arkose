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
          const numLookback = Number(store.get('openAiLookbackTokens'));
          const start = numLookback ? Math.max(0, pos - numLookback) : 0;
          const before = getTextFromDocument(editor.schema, editor.state.doc.cut(start, pos));
          const after = getTextFromDocument(
            editor.schema,
            editor.state.doc.cut(pos, editor.state.doc.content.size),
          );
          console.log('%c Text before:', 'font-size: 18px; font-weight: bold');
          console.log(before);
          console.log('%c Text after:', 'font-size: 18px; font-weight: bold');
          console.log(after);

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

          console.log('%c Completion:', 'font-size: 18px; font-weight: bold');
          console.log(completedText);
          const paragraphTexts = completedText.trim().split(/\n\n/g);
          const shouldAddSpace = !before.endsWith(' ') && !before.endsWith('\n');
          if (shouldAddSpace) {
            paragraphTexts[0] = paragraphTexts[0] + ' ';
          }
          const nodes = paragraphTexts.map(text => ({type: 'paragraph', content: [{type: 'text', text,}]}));
          console.log('nodes', nodes);
          editor.commands.insertContent(nodes);
        }
        run();
        return true;
      },
    };
  },
});

export default aiKeyboardShortcut;
