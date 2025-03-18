import React, { useState, useEffect } from 'react';
import { generateKeyFromPassword } from './utils/crypto';
import { Container, Typography, TextField, Button, Box, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function DecryptFile() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [password, setPassword] = useState("");
  const [decryptedData, setDecryptedData] = useState(null);
  const [decryptedUrl, setDecryptedUrl] = useState(null);
  
  useEffect(() => {
    fetch("http://localhost:5000/files", {
      headers: { "Authorization": `Bearer ${process.env.REACT_APP_API_TOKEN}` }
    })
      .then(res => res.json())
      .then(data => setFiles(data.files));
  }, []);

  const handleDecrypt = async (fileRecord) => {
    if (!password) {
      alert("Enter password for decryption");
      return;
    }
    // Download the encrypted file
    const response = await fetch(`http://localhost:5000/download/${fileRecord.unique_filename}`, {
      headers: { "Authorization": `Bearer ${process.env.REACT_APP_API_TOKEN}` }
    });
    const encryptedBlob = await response.blob();
    const encryptedBuffer = await encryptedBlob.arrayBuffer();

    // Convert salt and iv from base64 to Uint8Array
    const salt = Uint8Array.from(atob(fileRecord.salt), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(fileRecord.iv), c => c.charCodeAt(0));
    
    // Derive the decryption key
    const key = await generateKeyFromPassword(password, salt);
    // Decrypt the encrypted buffer
    try {
      const decryptedBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encryptedBuffer);
      // Create a Blob URL for the decrypted data
      const decryptedBlob = new Blob([decryptedBuffer], { type: fileRecord.original_filename.split('.').pop() });
      const url = URL.createObjectURL(decryptedBlob);
      setDecryptedUrl(url);
      setDecryptedData(null); // Clear text data if any
    } catch(e) {
      alert("Decryption failed: " + e.message);
    }
  };

  const handleDelete = async (fileRecord) => {
    const response = await fetch(`http://localhost:5000/confirm/${fileRecord.unique_filename}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.REACT_APP_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ confirmed: true })
    });
    if (response.ok) {
      setFiles(files.filter(file => file.unique_filename !== fileRecord.unique_filename));
      alert("File deleted successfully");
    } else {
      alert("Failed to delete file");
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h5" component="h2" gutterBottom>
        Download and Decrypt File
      </Typography>
      <List>
        {files.map(file => (
          <ListItem key={file.unique_filename} button onClick={() => setSelectedFile(file)}>
            <ListItemText primary={file.original_filename} />
            <IconButton edge="end" aria-label="delete" onClick={(e) => { e.stopPropagation(); handleDelete(file); }}>
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
      {selectedFile && (
        <Box mt={2}>
          <Typography variant="h6" component="h3">
            Decrypt {selectedFile.original_filename}
          </Typography>
          <TextField 
            type="password" 
            label="Enter decryption password" 
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Box mt={2}>
            <Button variant="contained" color="primary" onClick={() => handleDecrypt(selectedFile)}>
              Decrypt
            </Button>
          </Box>
        </Box>
      )}
      {decryptedUrl && (
        <Box mt={2}>
          <Typography variant="h6" component="h3">
            Decrypted File:
          </Typography>
          {/* Instead of embedding the file, provide a download link */}
          <Button 
            variant="contained" 
            color="primary" 
            component="a" 
            href={decryptedUrl}
            download={selectedFile ? selectedFile.original_filename : "decrypted_file"}>
            Download Decrypted File
          </Button>
        </Box>
      )}
    </Container>
  );
}

export default DecryptFile;
