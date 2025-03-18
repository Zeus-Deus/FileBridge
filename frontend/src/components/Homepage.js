import React from 'react';
import { Box, Container, Typography, Button, Paper, Link, Grid } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FileUploader from './FileUploader'; // new import
import FileManager from './FileManager';

const Homepage = () => {
  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(to bottom, #f0f4f8, #d9e2ec)', 
        fontFamily: '"Inter", "Roboto", sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          FileBridge
        </Typography>
        <Box sx={{ minWidth: '120px', textAlign: 'right' }}>
          {/* Reserved space for future login button */}
        </Box>
      </Box>

      {/* Main Upload Section with two upload bubbles */}
      <Container 
        maxWidth="md"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Grid container spacing={4}>
          {/* File Upload Bubble */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={3}
              sx={{
                p: { xs: 3, md: 5 },
                border: '2px dashed #007BFF',
                borderRadius: '16px',
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  borderColor: '#0056b3',
                  boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.15)',
                }
              }}
            >
              <CloudUploadIcon 
                sx={{ 
                  fontSize: 64, 
                  color: '#007BFF', 
                  mb: 2, 
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'translateY(-4px)' }
                }} 
              />
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>
                Drag & Drop your files here, or
              </Typography>
              <FileUploader uploadType="file" label="Select Files" />
            </Paper>
          </Grid>

          {/* Folder Upload Bubble */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={3}
              sx={{
                p: { xs: 3, md: 5 },
                border: '2px dashed #007BFF',
                borderRadius: '16px',
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  borderColor: '#0056b3',
                  boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.15)',
                }
              }}
            >
              <FolderOpenIcon 
                sx={{ 
                  fontSize: 64, 
                  color: '#007BFF', 
                  mb: 2, 
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'translateY(-4px)' }
                }} 
              />
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#333' }}>
                Upload your folder as one item
              </Typography>
              <FileUploader uploadType="folder" label="Select Folder" />
            </Paper>
          </Grid>
        </Grid>
        {/* NEW: FileManager Component to show and manage uploaded files */}
        <FileManager />
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          textAlign: 'center',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Typography variant="body2" color="#6c757d">
          <>
            <Link href="#" underline="hover" sx={{ mx: 1, color: '#6c757d' }}>
              Terms
            </Link>
            |
            <Link href="#" underline="hover" sx={{ mx: 1, color: '#6c757d' }}>
              Privacy
            </Link>
          </>
        </Typography>
      </Box>
    </Box>
  );
};

export default Homepage;
