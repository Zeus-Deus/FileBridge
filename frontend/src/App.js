import React, { useState } from 'react';
import { generateSalt, generateKeyFromPassword, encryptData } from './utils/crypto';
import DecryptFile from './DecryptFile';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [encryptionPassword, setEncryptionPassword] = useState("");

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handlePasswordChange = (e) => {
    setEncryptionPassword(e.target.value);
  };

  const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach((b) => binary += String.fromCharCode(b));
    return window.btoa(binary);
  };

  const handleUpload = async () => {
    if (!selectedFile || !encryptionPassword) {
      alert("Please select a file and enter an encryption password.");
      return;
    }

    try {
      console.log("Starting file upload process...");
      console.log("File selected:", selectedFile.name, "Size:", selectedFile.size);
      
      // Read the file as an ArrayBuffer
      const fileArrayBuffer = await selectedFile.arrayBuffer();
      console.log("File read as ArrayBuffer, length:", fileArrayBuffer.byteLength);
      
      // Generate a random salt per file encryption (16 bytes)
      const salt = generateSalt();
      // Derive a key from the user-provided password and generated salt
      const key = await generateKeyFromPassword(encryptionPassword, salt);
      console.log("Encryption key generated");
      
      // Encrypt the file data
      const { encrypted, iv } = await encryptData(fileArrayBuffer, key);
      console.log("File encrypted successfully, length:", encrypted.byteLength);
      
      // Convert encrypted data to Blob for upload
      const blob = new Blob([encrypted], { type: selectedFile.type });
      const saltString = arrayBufferToBase64(salt);
      const ivString = arrayBufferToBase64(iv);
      console.log("Preparing form data with encrypted blob");

      // Prepare FormData
      const formData = new FormData();
      formData.append("file", blob, selectedFile.name);
      formData.append("salt", saltString);
      formData.append("iv", ivString);

      console.log("Sending request to API...");
      // Get API token from environment
      const API_TOKEN = process.env.REACT_APP_API_TOKEN;
      console.log("Using API token (first few chars):", API_TOKEN ? API_TOKEN.substring(0, 5) + "..." : "undefined");
      
      // Upload using fetch
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_TOKEN}`
        },
        body: formData
      });
      
      console.log("Response status:", response.status);
      const result = await response.json();
      console.log("Response data:", result);
      
      if (response.ok) {
        alert("File uploaded successfully");
      } else {
        alert(`Upload failed: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(`An error occurred during upload: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Encrypted File Transfer</h2>
      <input type="file" onChange={handleFileChange} />
      <br />
      <input 
        type="password" 
        placeholder="Enter Encryption Password" 
        value={encryptionPassword}
        onChange={handlePasswordChange}
      />
      <br />
      <button onClick={handleUpload}>Upload Encrypted File</button>
      <DecryptFile />
    </div>
  );
}

export default App;
