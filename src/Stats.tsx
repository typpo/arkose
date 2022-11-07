import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useSnapshot } from 'valtio';

import { statsStore } from './stores';

import type { Editor } from '@tiptap/core';

export default function Stats({
  open,
  onClose,
  editor,
}: {
  open: boolean;
  onClose: () => void;
  editor: Editor;
}) {
  const { tokensUsed } = useSnapshot(statsStore);
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Stats</DialogTitle>
      <DialogContent>
        <Box marginBottom={4}>
          <DialogContentText>Word count: {editor.getText().split(/\s/).length}</DialogContentText>
          <DialogContentText>OpenAI tokens used: {tokensUsed}</DialogContentText>
          <DialogContentText>
            Cost estimate: ${((tokensUsed / 1000.0) * 0.02).toFixed(2)}
          </DialogContentText>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>OK</Button>
      </DialogActions>
    </Dialog>
  );
}
