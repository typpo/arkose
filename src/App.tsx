import debounce from 'debounce';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { useEditor } from '@tiptap/react';
import { ToastContainer } from 'react-toastify';

import Document from './Document';
import Toolbar from './Toolbar';
import NavMenu from './NavMenu';
import aiKeyboardShortcut from './aiKeyboardShortcut';

import { documentStore } from './stores';
import { useSnapshot } from 'valtio';

import 'react-toastify/dist/ReactToastify.css';
import styles from './App.module.css';

function App() {
  const { content } = useSnapshot(documentStore);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: true,
      }),
      Placeholder.configure({
        placeholder: `Start writing... then press ${
          window.navigator.platform.startsWith('Mac') ? 'Cmd' : 'Ctrl'
        }+Enter to generate text with AI`,
      }),
      aiKeyboardShortcut,
    ],
    content: JSON.parse(JSON.stringify(content)),
    autofocus: 'end',
  });
  if (!editor) {
    return <div>Loading...</div>;
  }

  editor.on(
    'update',
    debounce(() => {
      const content = editor.getJSON();
      documentStore.content = content;
    }, 100),
  );

  const handleNewDocument = () => {
    editor.commands.setContent('');
    editor.commands.focus(0);
  };

  return (
    <div className={styles.app}>
      <ToastContainer />
      <NavMenu editor={editor} onCreateNewDocument={handleNewDocument} saved={false} />
      <Toolbar editor={editor} />
      <div className={styles.documentContainer}>
        <Document editor={editor} />
      </div>
    </div>
  );
}

export default App;
