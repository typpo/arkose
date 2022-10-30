import React from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import store from 'store';

export default function Settings({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [apiKey, setApiKey] = React.useState<string>(store.get('apiKey') || 'YOUR_API_KEY');
  const [MaxTokens, setMaxTokens] = React.useState<number>(store.get('MaxTokens') || 256);
  const [temperature, setTemperature] = React.useState<number>(store.get('temperature') || 0.7);

  const [hasErrorMaxTokens, setHasErrorMaxTokens] = React.useState<boolean>(false);
  const [hasErrorTemperature, setHasErrorTemperature] = React.useState<boolean>(false);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>OpenAI GPT-3 Settings</DialogTitle>
      <DialogContent>
        <Box marginBottom={4}>
          <DialogContentText>
            This AI-enabled word processor uses GPT-3 from OpenAI. You may use it for free, but you
            must provide your own API key.
          </DialogContentText>
        </Box>
        <Box marginBottom={4}>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="API key"
            type="text"
            fullWidth
            variant="standard"
            error={!apiKey.trim()}
            onChange={(e) => {
              setApiKey(e.target.value);
              store.set('openAiApiKey', e.target.value);
            }}
            value={apiKey}
          />
        </Box>
        <Box marginBottom={4}>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Max tokens"
            helperText="Maximum number of tokens to generate (up to 4000)"
            type="number"
            InputProps={{ inputProps: { min: 1, max: 4000 } }}
            fullWidth
            variant="standard"
            error={hasErrorMaxTokens}
            onChange={(e) => {
              const newVal = parseInt(e.target.value, 10);
              if (!isNaN(newVal) && newVal >= 1 && newVal <= 4000) {
                store.set('openAiMaxTokens', newVal);
                setHasErrorMaxTokens(false);
              } else {
                setHasErrorMaxTokens(true);
              }
              setMaxTokens(newVal);
            }}
            value={MaxTokens}
          />
        </Box>
        <Box marginBottom={4}>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Temperature"
            helperText="Higher values lead to more creative results, but can also lead to less coherent output (between 0 and 1)"
            type="number"
            InputProps={{ inputProps: { min: 0, max: 1, step: 0.1 } }}
            fullWidth
            variant="standard"
            error={hasErrorTemperature}
            onChange={(e) => {
              const newVal = Number(e.target.value);
              if (!isNaN(newVal) && newVal >= 0 && newVal <= 1) {
                store.set('openAiTemperature', newVal);
                setHasErrorTemperature(false);
              } else {
                setHasErrorTemperature(true);
              }
              setTemperature(newVal);
            }}
            value={temperature}
            defaultValue="0.7"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Continue</Button>
      </DialogActions>
    </Dialog>
  );
}
