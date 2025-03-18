import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, IconButton, Typography, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import PasswordDialog from './PasswordDialog'; // New import for download password prompt

// Helper function to convert ArrayBuffer to Base64 remains unchanged
const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((b) => binary += String.fromCharCode(b));
  return window.btoa(binary);
};

const FileManager = () => {
  const [files, setFiles] = useState([]);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [selectedForDownload, setSelectedForDownload] = useState(null);
  
  const fetchFiles = async () => {
    try {
      const response = await fetch('http://localhost:5000/files', {
        headers: { "Authorization": `Bearer ${process.env.REACT_APP_API_TOKEN}` }
      });
      const data = await response.json();
      setFiles(data.files);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDelete = async (file) => {
    try {
      const response = await fetch(`http://localhost:5000/confirm/${file.unique_filename}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.REACT_APP_API_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ confirmed: true })
      });
      const result = await response.json();
      if (response.ok) {
        setFiles(files.filter(f => f.unique_filename !== file.unique_filename));
        alert("File deleted successfully");
      } else {
        alert(`Delete failed: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Delete error: " + error.message);
    }
  };

  // When download button is clicked, open the password dialog
  const openDownloadDialog = (file) => {
    setSelectedForDownload(file);
    setDownloadDialogOpen(true);
  };

  // This function is called when the user submits the password in the dialog.
  const handleDownloadPasswordSubmit = async (password) => {
    setDownloadDialogOpen(false);
    if (!password) {
      alert("Decryption password is required.");
      return;
    }
    try {
      // Fetch encrypted file from backend
      const response = await fetch(`http://localhost:5000/download/${selectedForDownload.unique_filename}`, {
        headers: { "Authorization": `Bearer ${process.env.REACT_APP_API_TOKEN}` }
      });
      if (!response.ok) {
        alert("Download failed");
        return;
      }
      const encryptedBlob = await response.blob();
      const encryptedBuffer = await encryptedBlob.arrayBuffer();

      // Convert salt and iv from base64 to Uint8Array
      const salt = Uint8Array.from(atob(selectedForDownload.salt), c => c.charCodeAt(0));
      const iv = Uint8Array.from(atob(selectedForDownload.iv), c => c.charCodeAt(0));

      // Derive the decryption key using the provided password
      const key = await window.crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: salt,
          iterations: 100000,
          hash: "SHA-256"
        },
        await window.crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]),
        { name: "AES-GCM", length: 256 },
        true,
        ["decrypt"]
      );

      // Decrypt the encrypted buffer
      const decryptedBuffer = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encryptedBuffer);

      // Create a Blob URL for the decrypted data and trigger download
      const decryptedBlob = new Blob([decryptedBuffer], { type: selectedForDownload.mimeType || "application/octet-stream" });
      const url = window.URL.createObjectURL(decryptedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedForDownload.original_filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Decryption/download error:", error);
      alert("Decryption failed: " + error.message);
    }
  };

  const handleDownloadDialogClose = () => {
    setDownloadDialogOpen(false);
  };

  return (
    <>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Uploaded Files
        </Typography>
        {files.length === 0 ? (
          <Typography variant="body1">No files uploaded yet.</Typography>
        ) : (
          <List>
            {files.map(file => (
              <ListItem 
                key={file.unique_filename} 
                secondaryAction={
                  <>
                    <IconButton edge="end" aria-label="download" onClick={() => openDownloadDialog(file)}>
                      <DownloadIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(file)}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                }
              >
                <ListItemText 
                  primary={file.original_filename} 
                  secondary={`Uploaded: ${new Date(file.upload_time).toLocaleString()}`} 
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
      {/* PasswordDialog for entering decryption password when downloading */}
      <PasswordDialog 
        open={downloadDialogOpen} 
        onClose={handleDownloadDialogClose}
        onSubmit={handleDownloadPasswordSubmit} 
      />
    </>
  );
};

export default FileManager;
