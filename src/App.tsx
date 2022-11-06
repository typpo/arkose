import store from 'store';
import debounce from 'debounce';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useEditor } from '@tiptap/react';
import { ToastContainer } from 'react-toastify';

import Document from './Document';
import Toolbar from './Toolbar';
import NavMenu from './NavMenu';
import aiKeyboardShortcut from './aiKeyboardShortcut';

import 'react-toastify/dist/ReactToastify.css';
import styles from './App.module.css';

function App() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
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
    content: store.get('documentContents', ''),
    autofocus: 'end',
  });
  if (!editor) {
    return <div>Something has gone terribly wrong, please try again later.</div>;
  }

  editor.on(
    'update',
    debounce(() => {
      const content = editor.getJSON();
      store.set('documentContents', content);
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
