import { Schema, Node as ProseMirrorNode } from 'prosemirror-model';
import { Extension, getText, getTextSerializersFromSchema } from '@tiptap/core';
import { toast } from 'react-toastify';
import { snapshot } from 'valtio/vanilla';

import { settingsStore, statsStore } from './stores';

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
          const { apiKey, lookbackTokens, maxTokens, temperature } = snapshot(settingsStore);
          const { tokensUsed } = snapshot(statsStore);
          // TODO(ian): Handle selections
          // TODO(ian): This relies on a hack that assumes the jotai atomWithStorage stores in a localStorage key with the same name as the atom.
          const pos = editor.state.selection.$anchor.pos;
          // FIXME this counts characters, not tokens
          const start = lookbackTokens ? Math.max(0, pos - lookbackTokens) : 0;
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

          const apiUrl =
            !apiKey || apiKey === 'YOUR_API_KEY'
              ? '/api/complete'
              : 'https://api.openai.com/v1/completions';
          const resp = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: 'text-davinci-002',
              prompt: before.trim(),
              suffix: after.trim() ? after : undefined,
              max_tokens: maxTokens,
              temperature: temperature,
              best_of: 1,
              presence_penalty: 0,
            }),
          });

          const completion = await resp.json();
          toast.dismiss(loadingToast);
          editor.setEditable(true);
          const completedText = completion.choices[0].text as string | null;
          if (!completedText?.trim()) {
            toast.error("The AI didn't have anything to say. Try writing a bit more.", {
              hideProgressBar: true,
            });
            return;
          }

          console.log('%c Completion:', 'font-size: 18px; font-weight: bold');
          console.log(completedText);
          const paragraphTexts = completedText.trim().split(/\n\n/g);
          if (!before.endsWith(' ') && !before.endsWith('\n')) {
            // Add a space
            paragraphTexts[0] = paragraphTexts[0] + ' ';
          }
          let nodes = paragraphTexts.map((text) => ({
            type: 'paragraph',
            content: [{ type: 'text', text }],
          }));
          if (!before.endsWith('\n') && !completedText.startsWith('\n')) {
            // Insert the text in the current paragraph
            editor.commands.insertContent(paragraphTexts[0]);
            nodes = nodes.slice(1);
          }
          console.log('nodes', nodes);
          editor.commands.insertContent(nodes);

          const numTokensBefore = before.split(/\s/).length;
          const generated = completedText.split(/\s/).length;
          statsStore.tokensUsed = tokensUsed + generated;
        }
        run();
        return true;
      },
    };
  },
});

export default aiKeyboardShortcut;
