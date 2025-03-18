import React, { useState } from 'react';
import { generateSalt, generateKeyFromPassword, encryptData } from './utils/crypto';
import DecryptFile from './DecryptFile';
import Layout from './components/Layout';
import { Typography, TextField, Button, Box } from '@mui/material';
import Homepage from './components/Homepage';

function App() {
  return <Homepage />;
}

export default App;
