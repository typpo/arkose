import React from 'react';

import Document from './Document';
import NavMenu from './NavMenu';
import store from 'store';
import debounce from 'debounce';

import type ReactQuill from 'react-quill';
import type { DeltaStatic as QuillDelta } from 'quill';

import styles from './App.module.css';

function App() {
  const quillRef = React.useRef<ReactQuill>(null);

  const [contents, setContents] = React.useState<QuillDelta | null>(
    store.get('documentContents', null),
  );
  const [saved, setSaved] = React.useState<boolean>(true);

  React.useEffect(() => {
    quillRef.current?.focus();
  }, []);

  const handleChange = (html: string, delta: QuillDelta) => {
    setSaved(false);
    setContents(delta);
    doHandleDeltaChange(html, delta);
  };

  const doHandleDeltaChange = debounce((html: string, delta: QuillDelta) => {
    store.set('documentContents', delta);
    setSaved(true);
  }, 100);

  const handleNewDocument = () => {
    setContents(null);
  };

  return (
    <div className={styles.app}>
      <NavMenu
        quillRef={quillRef}
        docContents={contents}
        onCreateNewDocument={handleNewDocument}
        saved={saved}
      />
      <div className={styles.documentContainer}>
        <Document quillRef={quillRef} quillDelta={contents} onChange={handleChange} />
      </div>
    </div>
  );
}

export default App;
