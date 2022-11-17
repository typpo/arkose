import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { settingsStore } from './stores';
import { useSnapshot } from 'valtio';

export default function Settings({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { apiKey, lookbackChars, maxTokens, temperature } = useSnapshot(settingsStore);

  const [hasErrorLookbackChars, setHasErrorLookbackChars] = React.useState<boolean>(false);
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
              settingsStore.apiKey = e.target.value;
            }}
            value={apiKey}
          />
        </Box>
        <Box marginBottom={4}>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Max lookback characters"
            helperText="Approx. maximum number of characters to provide as context to the AI (up to 4000)"
            type="number"
            InputProps={{ inputProps: { min: 1, max: 4000 } }}
            fullWidth
            variant="standard"
            error={hasErrorLookbackChars}
            onChange={(e) => {
              const newVal = parseInt(e.target.value, 10);
              if (!isNaN(newVal) && newVal >= 1 && newVal <= 4000) {
                settingsStore.lookbackChars = newVal;
                setHasErrorLookbackChars(false);
              } else {
                setHasErrorLookbackChars(true);
              }
            }}
            defaultValue={lookbackChars}
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
                settingsStore.maxTokens = newVal;
                setHasErrorMaxTokens(false);
              } else {
                setHasErrorMaxTokens(true);
              }
            }}
            defaultValue={maxTokens}
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
                settingsStore.temperature = newVal;
                setHasErrorTemperature(false);
              } else {
                setHasErrorTemperature(true);
              }
            }}
            defaultValue={temperature}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Continue</Button>
      </DialogActions>
    </Dialog>
  );
}
