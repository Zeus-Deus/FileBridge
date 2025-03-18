import React, { useRef, useState } from 'react';
import { Button } from '@mui/material';
import { generateSalt, generateKeyFromPassword, encryptData } from '../utils/crypto';
import JSZip from 'jszip';
import PasswordDialog from './PasswordDialog';

const FileUploader = ({ uploadType, label }) => {
  const inputRef = useRef(null);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [pendingFiles, setPendingFiles] = useState(null);

  const handleClick = () => {
    inputRef.current && inputRef.current.click();
  };

  const handleChange = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    // Instead of window.prompt, save files to state and open password dialog:
    setPendingFiles(files);
    setOpenPasswordDialog(true);
  };

  // Function to convert ArrayBuffer to Base64 remains unchanged:
  const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach((b) => binary += String.fromCharCode(b));
    return window.btoa(binary);
  };

  const onPasswordSubmit = async (password) => {
    setOpenPasswordDialog(false);
    if (!password) {
      alert("Encryption password is required.");
      return;
    }
    try {
      let fileBlob, fileName, mimeType;
      if (uploadType === 'folder') {
        const zip = new JSZip();
        // Add all files preserving folder structure if available.
        Array.from(pendingFiles).forEach(file => {
          zip.file(file.webkitRelativePath ? file.webkitRelativePath : file.name, file);
        });
        // Extract folder name from the first file's relative path.
        const folderName = pendingFiles[0].webkitRelativePath
          ? pendingFiles[0].webkitRelativePath.split('/')[0]
          : 'folder';
        const zipBuffer = await zip.generateAsync({ type: "arraybuffer" });
        fileBlob = new Blob([zipBuffer], { type: "application/zip" });
        fileName = `${folderName}.zip`;
        mimeType = "application/zip";
      } else {
        const file = pendingFiles[0];
        fileBlob = file;
        fileName = file.name;
        mimeType = file.type;
      }
      const arrayBuffer = await fileBlob.arrayBuffer();
      const salt = generateSalt();
      const key = await generateKeyFromPassword(password, salt);
      const { encrypted, iv } = await encryptData(arrayBuffer, key);
      const encryptedBlob = new Blob([encrypted], { type: mimeType });
      const saltString = arrayBufferToBase64(salt);
      const ivString = arrayBufferToBase64(iv);
      const formData = new FormData();
      formData.append("file", encryptedBlob, fileName);
      formData.append("salt", saltString);
      formData.append("iv", ivString);
      const API_TOKEN = process.env.REACT_APP_API_TOKEN;
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_TOKEN}`
        },
        body: formData
      });
      const result = await response.json();
      if (!response.ok) {
        alert(`Upload failed for ${fileName}: ${result.error || "Unknown error"}`);
      } else {
        alert(`Uploaded ${fileName} successfully.`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Upload error: ${error.message}`);
    }
  };

  const onPasswordClose = () => {
    setOpenPasswordDialog(false);
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleClick}>
        {label}
      </Button>
      <input
        type="file"
        ref={inputRef}
        style={{ display: 'none' }}
        onChange={handleChange}
        {...(uploadType === 'folder' ? { webkitdirectory: "true" } : {})}
      />
      <PasswordDialog open={openPasswordDialog} onClose={onPasswordClose} onSubmit={onPasswordSubmit} />
    </>
  );
};

export default FileUploader;
