import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, CircularProgress, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Input
} from '@mui/material';
import { Delete, Edit, Add, PhotoCamera } from '@mui/icons-material';
import api from '../services/api';
import { useSnackbar } from 'notistack';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });
  const [imageFile, setImageFile] = useState(null);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await api.post('/products', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setProducts([...products, res.data]);
      setOpen(false);
      setFormData({ name: '', description: '', price: '', category: '' });
      setImageFile(null);
      enqueueSnackbar('Product added successfully!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Error saving product', { variant: 'error' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        setProducts(products.filter(p => p._id !== id));
        enqueueSnackbar('Product deleted', { variant: 'success' });
      } catch (err) {
        enqueueSnackbar('Error deleting product', { variant: 'error' });
      }
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Products</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Add Product</Button>
      </Box>
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Image</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id} hover>
                <TableCell>
                  <img src={`http://localhost:3000${product.image}`} alt={product.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                </TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{product.name}</TableCell>
                <TableCell>
                  <Chip label={product.category?.name || 'Uncategorized'} size="small" variant="outlined" />
                </TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>
                  <IconButton size="small" color="primary" disabled={saveLoading}><Edit /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(product._id)} disabled={saveLoading}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus margin="dense" label="Product Name" fullWidth variant="outlined"
            value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mt: 1 }} disabled={saveLoading}
          />
          <TextField
            margin="dense" label="Description" fullWidth multiline rows={3} variant="outlined"
            value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={saveLoading}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              margin="dense" label="Price" type="number" fullWidth variant="outlined"
              value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              disabled={saveLoading}
            />
            <TextField
              select margin="dense" label="Category" fullWidth variant="outlined"
              value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              disabled={saveLoading}
            >
              {categories.map((option) => (
                <MenuItem key={option._id} value={option._id}>
                  {option.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button variant="outlined" component="label" startIcon={<PhotoCamera />} disabled={saveLoading}>
              Upload Image
              <input type="file" hidden accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
            </Button>
            {imageFile && <Typography variant="caption">{imageFile.name}</Typography>}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} disabled={saveLoading}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saveLoading}>
            {saveLoading ? <CircularProgress size={24} /> : 'Save Product'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
