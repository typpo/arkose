import React from 'react';

import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import GithubIcon from '@mui/icons-material/GitHub';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { saveAs } from 'file-saver';
import { ToastContainer } from 'react-toastify';
import { useSnapshot } from 'valtio';

import Settings from './Settings';
import Stats from './Stats';
import { userStore } from './stores';

import Logo from '../public/favicon.png';

import type { Editor } from '@tiptap/core';

import styles from './NavMenu.module.css';
import { doCompletion } from './completion';

interface NavMenuProps {
  editor: Editor;
  onCreateNewDocument: () => void;
  saved: boolean;
}

export default function NavMenu({ editor, saved, onCreateNewDocument }: NavMenuProps) {
  const { remainingCompletions } = useSnapshot(userStore);
  const [settingsOpen, setSettingsOpen] = React.useState<boolean>(false);
  const [statsOpen, setStatsOpen] = React.useState<boolean>(false);
  const [fileAnchorEl, setFileAnchorEl] = React.useState<null | HTMLElement>(null);
  const [aboutAnchorEl, setAboutAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClose = () => {
    setFileAnchorEl(null);
    setAboutAnchorEl(null);
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
          <div className={styles.menuLeft}>
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
              PaperProps={{
                style: {
                  width: 250,
                },
              }}
            >
              <MenuItem onClick={handleCreateNewDocument}>New</MenuItem>
              <Divider />
              <MenuItem onClick={handleOpenDocument}>Open</MenuItem>
              <MenuItem onClick={handleSaveJson}>Save</MenuItem>
              <Divider />
              <MenuItem onClick={handleSaveHtml}>Export HTML</MenuItem>
              <MenuItem onClick={handleSaveMarkdown}>Export Markdown</MenuItem>
              <MenuItem onClick={handleSaveDocx}>Export DOCX</MenuItem>
            </Menu>
            <div
              id="settings-menu"
              className={styles.menuTopLevel}
              onClick={() => setSettingsOpen(true)}
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
            <div id="stats-menu" className={styles.menuTopLevel} onClick={() => setStatsOpen(true)}>
              Stats
            </div>
            <Stats
              editor={editor}
              open={statsOpen}
              onClose={() => {
                setStatsOpen(false);
                handleClose();
              }}
            />
            <div
              id="about-menu"
              className={styles.menuTopLevel}
              onClick={(event) =>
                aboutAnchorEl ? setAboutAnchorEl(null) : setAboutAnchorEl(event.currentTarget)
              }
            >
              About
            </div>
            <Menu
              elevation={2}
              anchorEl={aboutAnchorEl}
              open={!!aboutAnchorEl}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'about-menu',
              }}
              PaperProps={{
                style: {
                  width: 200,
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  window.open('https://github.com/typpo/arkose/wiki', '_blank');
                }}
              >
                <ListItemIcon>
                  <HelpOutlineIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>User manual</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  window.open('https://github.com/typpo/arkose', '_blank');
                }}
              >
                <ListItemIcon>
                  <GithubIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Source code</ListItemText>
              </MenuItem>
            </Menu>
            {remainingCompletions <= 5 && (
              <div className={styles.notice}>
                {remainingCompletions} completions remaining.{' '}
                <a
                  target="_blank"
                  href="https://github.com/typpo/arkose/wiki/Obtaining-a-GPT-3-API-key"
                >
                  Learn more
                </a>
              </div>
            )}
          </div>
          <div className={styles.menuRight}>
            <div className={styles.brand} onClick={() => doCompletion(editor)}>
              Arkose
              <img src={Logo} alt="Arkose logo" />
            </div>
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
