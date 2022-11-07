import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import Config from './config';

import type { JSONContent } from '@tiptap/core';

export const openAiApiKeyAtom = atomWithStorage(
  'openAiApiKey',
  Config.OpenAI.apiKey || 'YOUR_API_KEY',
);
export const openAiLookbackTokensAtom = atomWithStorage<number>('openAiLookbackTokens', 800);
export const openAiMaxTokensAtom = atomWithStorage<number>('openAiMaxTokens', 256);
export const openAiTemperatureAtom = atomWithStorage<number>('openAiTemperature', 0.7);
export const documentContentsAtom = atomWithStorage<JSONContent | null>('documentContents', null);

export default function Settings({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [apiKey, setApiKey] = useAtom(openAiApiKeyAtom);
  const [lookbackTokens, setLookbackTokens] = useAtom(openAiLookbackTokensAtom);
  const [maxTokens, setMaxTokens] = useAtom(openAiMaxTokensAtom);
  const [temperature, setTemperature] = useAtom(openAiTemperatureAtom);

  const [hasErrorLookbackTokens, setHasErrorLookbackTokens] = React.useState<boolean>(false);
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
            }}
            value={apiKey}
          />
        </Box>
        <Box marginBottom={4}>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Max lookback tokens"
            helperText="Approx. maximum number of tokens to provide as context to the AI (up to 4000)"
            type="number"
            InputProps={{ inputProps: { min: 1, max: 4000 } }}
            fullWidth
            variant="standard"
            error={hasErrorLookbackTokens}
            onChange={(e) => {
              const newVal = parseInt(e.target.value, 10);
              if (!isNaN(newVal) && newVal >= 1 && newVal <= 4000) {
                setLookbackTokens(newVal);
                setHasErrorLookbackTokens(false);
              } else {
                setHasErrorLookbackTokens(true);
              }
            }}
            defaultValue={lookbackTokens}
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
                setMaxTokens(newVal);
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
                setTemperature(newVal);
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
