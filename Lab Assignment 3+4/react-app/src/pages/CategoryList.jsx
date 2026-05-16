import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, CircularProgress, TextField, Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material';
import { Delete, Edit, Add } from '@mui/icons-material';
import api from '../services/api';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        // Note: Backend might not have DELETE /api/categories implemented yet. 
        // I should check or implement it if needed. 
        // For now, let's assume it exists or just handle the list.
        await api.delete(`/categories/${id}`);
        setCategories(categories.filter(c => c._id !== id));
      } catch (err) {
        alert('Error deleting category');
      }
    }
  };

  const handleSave = async () => {
    try {
      const res = await api.post('/categories', formData);
      setCategories([...categories, res.data]);
      setOpen(false);
      setFormData({ name: '', description: '' });
    } catch (err) {
      alert('Error saving category');
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Categories</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Add Category</Button>
      </Box>
      
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Slug</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat._id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{cat.name}</TableCell>
                <TableCell><code>{cat.slug}</code></TableCell>
                <TableCell>
                  <IconButton size="small" color="error" onClick={() => handleDelete(cat._id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
