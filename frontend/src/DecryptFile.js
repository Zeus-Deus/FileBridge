import React, { useState, useEffect } from 'react';
import { generateKeyFromPassword } from './utils/crypto';

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

  return (
    <div>
      <h2>Download and Decrypt File</h2>
      <ul>
        {files.map(file => (
          <li key={file.unique_filename}>
            {file.original_filename} 
            <button onClick={() => setSelectedFile(file)}>Select</button>
          </li>
        ))}
      </ul>
      {selectedFile && (
        <div>
          <h3>Decrypt {selectedFile.original_filename}</h3>
          <input 
            type="password" 
            placeholder="Enter decryption password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={() => handleDecrypt(selectedFile)}>Decrypt</button>
        </div>
      )}
      {decryptedUrl && (
        <div>
          <h3>Decrypted File:</h3>
          <img src={decryptedUrl} alt="Decrypted File" />
        </div>
      )}
    </div>
  );
}

export default DecryptFile;
