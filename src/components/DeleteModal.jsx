import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography
} from '@mui/material';
import { Trash2, X } from 'lucide-react';

const DeleteModal = ({ open, onClose, onConfirm, title = 'Delete Item', message = 'Are you sure you want to delete this item?', loading = false }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            bgcolor: '#fee2e2',
            p: 3,
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Trash2 size={28} color="#ef4444" />
          </Box>
        </Box>
        <Button
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            minWidth: 'auto',
            p: 0.5,
            color: '#6b7280',
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.05)'
            }
          }}
        >
          <X size={20} />
        </Button>
      </Box>

      <DialogContent sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#111827' }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.5 }}>
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          fullWidth
          variant="outlined"
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            py: 1.5,
            borderColor: '#e5e7eb',
            color: '#374151',
            '&:hover': {
              bgcolor: '#f9fafb',
              borderColor: '#d1d5db'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          fullWidth
          variant="contained"
          color="error"
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            py: 1.5,
            '&:hover': {
              bgcolor: '#dc2626'
            }
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteModal;
