import React from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';

const ReimbursementForm: React.FC = () => {
  return (
    <Box sx={{ 
      backgroundColor: 'var(--background-secondary)',
      color: 'var(--text-primary)',
      padding: '24px',
      borderRadius: '8px',
      border: '1px solid var(--border-color)'
    }}>
      <Typography 
        variant="h5" 
        sx={{ 
          color: 'var(--text-primary)',
          mb: 3,
          fontWeight: 700
        }}
      >
        Submit Reimbursement Request
      </Typography>
      
      {/* Form fields */}
      <TextField
        sx={{
          '& .MuiInputLabel-root': {
            color: 'var(--text-secondary)',
          },
          '& .MuiOutlinedInput-root': {
            color: 'var(--text-primary)',
            '& fieldset': {
              borderColor: 'var(--border-color)',
            },
            '&:hover fieldset': {
              borderColor: 'var(--accent-primary)',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'var(--accent-primary)',
            },
          },
        }}
        // ... other props
      />
      
      <Button
        sx={{
          backgroundColor: 'var(--accent-primary)',
          color: 'var(--text-primary)',
          '&:hover': {
            backgroundColor: 'var(--accent-hover)',
          },
        }}
        // ... other props
      >
        Submit Request
      </Button>
    </Box>
  );
};

export default ReimbursementForm; 