import debounce from 'debounce';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useAtom } from 'jotai';
import { useEditor } from '@tiptap/react';
import { ToastContainer } from 'react-toastify';

import Document from './Document';
import Toolbar from './Toolbar';
import NavMenu from './NavMenu';
import aiKeyboardShortcut from './aiKeyboardShortcut';
import { documentContentsAtom } from './Settings';

import 'react-toastify/dist/ReactToastify.css';
import styles from './App.module.css';

function App() {
  const [documentContents, setDocumentContents] = useAtom(documentContentsAtom);
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
    content: documentContents,
    autofocus: 'end',
  });
  if (!editor) {
    return <div>Loading...</div>;
  }

  editor.on(
    'update',
    debounce(() => {
      const content = editor.getJSON();
      setDocumentContents(content);
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
