import React from 'react';

import * as quillToWord from 'quill-to-word';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Turndown from 'turndown';
import { saveAs } from 'file-saver';
import { ToastContainer, toast } from 'react-toastify';

import Settings from './Settings';

import type ReactQuill from 'react-quill';
import type { DeltaStatic as QuillDelta } from 'quill';

import styles from './NavMenu.module.css';

interface NavMenuProps {
  quillRef: React.MutableRefObject<ReactQuill | null>;
  docContents: QuillDelta | null;
  onCreateNewDocument: () => void;
  saved: boolean;
}

export default function NavMenu({
  docContents,
  saved,
  onCreateNewDocument,
  quillRef,
}: NavMenuProps) {
  const [settingsOpen, setSettingsOpen] = React.useState<boolean>(false);
  const [fileAnchorEl, setFileAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClose = () => {
    setFileAnchorEl(null);
    quillRef.current?.focus();
  };

  const handleCreateNewDocument = () => {
    const resp = confirm(
      'Are you sure you want to create a new document, overwriting your current one?',
    );
    if (resp) {
      onCreateNewDocument();
    }
    handleClose();
  };

  const handleSaveHtml = () => {
    const html = quillRef.current?.editor?.root.innerHTML;
    if (!html || !docContents || !docContents.ops) {
      toast.error('Cowardly refusing to save an empty document');
      return;
    }
    const htmlStyles = `<style>
:root {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  padding: 4rem;
  max-width: 960px;
  margin: 0 auto;

  color-scheme: light dark;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}
</style>
    `;
    saveAs(new Blob([`<html>${htmlStyles}${html}</html>`]), 'document.html');
    handleClose();
  };

  const handleSaveMarkdown = () => {
    const html = quillRef.current?.editor?.root.innerHTML;
    if (!html || !docContents || !docContents.ops) {
      toast.error('Cowardly refusing to save an empty document');
      return;
    }
    const md = new Turndown().turndown(html);
    saveAs(md, 'document.md');
    handleClose();
  };

  const handleSaveDocx = async () => {
    if (!docContents || !docContents.ops) {
      toast.error('Cowardly refusing to save an empty document');
      return;
    }

    // @ts-expect-error: It works
    const docAsBlob = await quillToWord.generateWord(docContents, {
      exportAs: 'blob',
    });

    // @ts-expect-error: It works
    saveAs(docAsBlob, 'document.docx');
    handleClose();
  };

  return (
    <div className={styles.navbar}>
      <div className={styles.menus}>
        <div
          id="file-menu"
          className={styles.menuTopLevel}
          onClick={(event) =>
            fileAnchorEl ? setFileAnchorEl(null) : setFileAnchorEl(event.currentTarget)
          }
        >
          File
        </div>
        <Menu
          elevation={2}
          anchorEl={fileAnchorEl}
          open={!!fileAnchorEl}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'file-menu',
          }}
        >
          <MenuItem onClick={handleCreateNewDocument}>New document</MenuItem>
          <Divider />
          <MenuItem onClick={handleSaveHtml}>Save as HTML</MenuItem>
          <MenuItem onClick={handleSaveMarkdown}>Save as Markdown</MenuItem>
          <MenuItem onClick={handleSaveDocx}>Save as DOCX</MenuItem>
        </Menu>
        <div
          id="settings-menu"
          className={styles.menuTopLevel}
          onClick={(event) => setSettingsOpen(true)}
        >
          Settings
        </div>
        <Settings
          open={settingsOpen}
          onClose={() => {
            setSettingsOpen(false);
            handleClose();
          }}
        />
        {/*
        <div className={styles.saveStatus}>
          {saved ? <span className={styles.success}>✓ Saved</span> : null}
        </div>
        */}
      </div>
      <ToastContainer />
    </div>
  );
}
