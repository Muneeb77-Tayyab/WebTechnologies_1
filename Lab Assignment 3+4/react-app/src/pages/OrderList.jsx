import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, CircularProgress, Chip, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider, Grid
} from '@mui/material';
import { Visibility, ShoppingCart } from '@mui/icons-material';
import api from '../services/api';
import { useSnackbar } from 'notistack';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await api.put(`/orders/${id}/status`, { status: newStatus });
      setOrders(orders.map(o => o._id === id ? { ...o, status: res.data.status } : o));
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder({ ...selectedOrder, status: res.data.status });
      }
      enqueueSnackbar('Order status updated', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Error updating status', { variant: 'error' });
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Orders</Typography>
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id} hover>
                <TableCell><code>#{order._id.substring(0, 8)}...</code></TableCell>
                <TableCell>{order.user?.name}</TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Select
                    size="small"
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    sx={{ 
                      minWidth: 120,
                      '& .MuiSelect-select': { py: 0.5, fontSize: '0.875rem' }
                    }}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="shipped">Shipped</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    color="primary" 
                    onClick={() => { setSelectedOrder(order); setOpen(true); }}
                  >
                    <Visibility />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Order Details Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShoppingCart color="primary" /> Order Details #{selectedOrder?._id.substring(0, 8)}...
        </DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Customer Info</Typography>
                <Typography variant="body1"><strong>Name:</strong> {selectedOrder.user?.name}</Typography>
                <Typography variant="body1"><strong>Email:</strong> {selectedOrder.user?.email}</Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>Shipping Address</Typography>
                  <Typography variant="body1">{selectedOrder.shippingInfo?.address}</Typography>
                  <Typography variant="body1">
                    {selectedOrder.shippingInfo?.city}, {selectedOrder.shippingInfo?.zip}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Order Summary</Typography>
                <Box sx={{ backgroundColor: '#f8fafc', p: 2, borderRadius: 2 }}>
                  {selectedOrder.items.map((item, idx) => (
                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{item.product?.name} x {item.quantity}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Total</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      ${selectedOrder.total.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
