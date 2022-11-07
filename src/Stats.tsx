import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useSnapshot } from 'valtio';

import { statsStore } from './stores';

export default function Stats({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { tokensUsed } = useSnapshot(statsStore);
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>OpenAI GPT-3 Settings</DialogTitle>
      <DialogContent>
        <Box marginBottom={4}>
          <DialogContentText>Tokens used: {tokensUsed}</DialogContentText>
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
