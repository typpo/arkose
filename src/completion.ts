import { toast } from 'react-toastify';
import { snapshot } from 'valtio/vanilla';
import { getText, getTextSerializersFromSchema } from '@tiptap/core';

import { settingsStore, statsStore, userStore } from './stores';

import type { Schema, Node as ProseMirrorNode } from 'prosemirror-model';
import type { Editor } from '@tiptap/core';

export enum CompletionResult {
  Success = 1,
  Empty = 2,
  Error = 3,
  AlreadyGenerating = 4,
}

const MIN_NUM_WORDS = 4;

function getTextFromDocument(schema: Schema, node: ProseMirrorNode) {
  // https://github.com/ueberdosis/tiptap/blob/4851fc5e9b6daccc15a1839e471db489401eca0c/packages/core/src/Editor.ts#L428
  return getText(node, {
    blockSeparator: '\n\n',
    textSerializers: {
      ...getTextSerializersFromSchema(schema),
    },
  });
}

let isGenerating = false;

export async function doCompletion(editor: Editor) {
  if (isGenerating) {
    console.info('Refusing to do completion, already generating');
    return CompletionResult.AlreadyGenerating;
  }
  isGenerating = true;

  const { apiKey, lookbackChars, maxTokens, temperature } = snapshot(settingsStore);
  const { tokensUsed } = snapshot(statsStore);
  const { uuid } = snapshot(userStore);
  // TODO(ian): Handle selections
  const pos = editor.state.selection.$anchor.pos;
  const start = lookbackChars ? Math.max(0, pos - lookbackChars) : 0;
  const before = getTextFromDocument(editor.schema, editor.state.doc.cut(start, pos));
  const beforeTrimmed = before.trim();
  if (!beforeTrimmed || beforeTrimmed.split(/\s/).length < MIN_NUM_WORDS) {
    toast.error('AI completion works best if you write more.');
    isGenerating = false;
    return;
  }
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
      : 'https://api.openai.com/v1/engines/text-davinci-003/completions';
  let completion;
  try {
    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: before.trim(),
        suffix: after.trim() ? after : undefined,
        max_tokens: maxTokens,
        temperature: temperature,
        best_of: 1,
        presence_penalty: 0,
        user: uuid,
      }),
    });
    const remaining = resp.headers.get('X-RateLimit-Remaining');
    if (remaining) {
      console.log('updating remaining', remaining);
      userStore.remainingCompletions = parseInt(remaining, 10);
    }
    if (resp.status === 429) {
      throw new Error(
        `You've run out of requests for today. Sign up for OpenAI and add your API key in Settings.`,
      );
    } else if (!resp.ok) {
      throw new Error(`Error talking to OpenAI (${resp.status}). Check the console for more info.`);
    }
    completion = await resp.json();
  } catch (err: any) {
    console.error(err);
    toast.error(err.toString(), {
      hideProgressBar: true,
    });
    return CompletionResult.Error;
  } finally {
    toast.dismiss(loadingToast);
    editor.setEditable(true);
    isGenerating = false;
  }
  const completedText = completion.choices[0].text as string | null;
  if (!completedText?.trim()) {
    toast.error("The AI didn't have anything to say. Try writing a bit more.", {
      hideProgressBar: true,
    });
    return CompletionResult.Empty;
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
  editor.commands.insertContent(nodes);

  // Approximate ratio of tokens:words is 1000:750
  const numTokensBefore = Math.round(before.split(/\s/).length * 1.33);
  const generated = Math.round(completedText.split(/\s/).length * 1.33);
  statsStore.tokensUsed = tokensUsed + generated + numTokensBefore;

  return CompletionResult.Success;
}
