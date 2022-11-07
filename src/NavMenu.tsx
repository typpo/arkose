import React from 'react';

import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { saveAs } from 'file-saver';
import { ToastContainer, toast } from 'react-toastify';

import Settings from './Settings';
import Stats from './Stats';

import Logo from '../public/favicon.png';

import type { Editor } from '@tiptap/core';

import styles from './NavMenu.module.css';

interface NavMenuProps {
  editor: Editor;
  onCreateNewDocument: () => void;
  saved: boolean;
}

export default function NavMenu({ editor, saved, onCreateNewDocument }: NavMenuProps) {
  const [settingsOpen, setSettingsOpen] = React.useState<boolean>(false);
  const [statsOpen, setStatsOpen] = React.useState<boolean>(false);
  const [fileAnchorEl, setFileAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClose = () => {
    setFileAnchorEl(null);
    editor.commands.focus();
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

  const handleOpenDocument = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.click();
    input.onchange = (e: Event) => {
      const files = (e?.target as HTMLInputElement)?.files;
      if (!files) {
        return;
      }
      const file = files[0];
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.readAsText(file, 'utf-8');
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const text = e?.target?.result;
        if (!text) {
          return;
        }
        editor.commands.setContent(JSON.parse(text as string));
      };
    };
    handleClose();
  };

  const handleSaveHtml = () => {
    const html = editor.getHTML();
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

  const handleSaveMarkdown = async () => {
    const Turndown = (await import('turndown')).default;
    const html = editor.getHTML();
    const md = new Turndown().turndown(html);
    saveAs(new Blob([md]), 'document.md');
    handleClose();
  };

  const handleSaveDocx = async () => {
    const { defaultDocxSerializer, writeDocx } = await import('prosemirror-docx');
    const { Packer } = await import('docx');
    const wordDocument = defaultDocxSerializer.serialize(editor.state.doc, {
      getImageBuffer: () => Buffer.from([]),
    });

    saveAs(await Packer.toBlob(wordDocument), 'document.docx');
    handleClose();
  };

  const handleSaveJson = () => {
    saveAs(new Blob([JSON.stringify(editor.getJSON())]), 'document.json');
    handleClose();
  };

  return (
    <div className={styles.navbar}>
      <div className={styles.gutter}>
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
            <MenuItem onClick={handleOpenDocument}>Open JSON</MenuItem>
            <Divider />
            <MenuItem onClick={handleSaveHtml}>Save as HTML</MenuItem>
            <MenuItem onClick={handleSaveMarkdown}>Save as Markdown</MenuItem>
            <MenuItem onClick={handleSaveDocx}>Save as DOCX</MenuItem>
            <MenuItem onClick={handleSaveJson}>Save as JSON</MenuItem>
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
          <div
            id="stats-menu"
            className={styles.menuTopLevel}
            onClick={(event) => setStatsOpen(true)}
          >
            Stats
          </div>
          <Stats
            open={statsOpen}
            onClose={() => {
              setStatsOpen(false);
              handleClose();
            }}
          />
          <div className={styles.brand}>
            Arkose AI
            <img src={Logo} alt="Arkose AI logo" />
          </div>
          {/*
        <div className={styles.saveStatus}>
          {saved ? <span className={styles.success}>✓ Saved</span> : null}
        </div>
        */}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
