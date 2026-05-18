import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { ShoppingBag, Category, ShoppingCart, People } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const StatCard = ({ title, count, icon, color, onClick }) => (
  <Paper 
    onClick={onClick}
    elevation={0} 
    sx={{ 
      p: 3, display: 'flex', alignItems: 'center', borderRadius: 2, border: '1px solid #e0e0e0',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s',
      '&:hover': onClick ? { borderColor: color, boxShadow: `0 4px 12px ${color}20` } : {}
    }}
  >
    <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: `${color}15`, color: color, mr: 2 }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        {count}
      </Typography>
    </Box>
  </Paper>
);

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch them individually using Promise.allSettled so one failure (like 403 on orders) doesn't break the others
        const [prodRes, catRes, ordRes] = await Promise.allSettled([
          api.get('/products'),
          api.get('/categories'),
          api.get('/orders')
        ]);

        setStats({
          products: prodRes.status === 'fulfilled' ? (prodRes.value.data.pagination?.total || prodRes.value.data.products?.length || 0) : 0,
          categories: catRes.status === 'fulfilled' ? catRes.value.data.length : 0,
          orders: ordRes.status === 'fulfilled' ? ordRes.value.data.length : 0
        });

        if (prodRes.status === 'rejected' || catRes.status === 'rejected' || ordRes.status === 'rejected') {
          setError("Some statistics could not be loaded due to permission issues or network errors.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Dashboard Overview</Typography>
      </Box>
      
      {error && (
        <Typography color="error" sx={{ mb: 3, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Products" count={stats.products} icon={<ShoppingBag />} color="#2196f3" onClick={() => navigate('/products')} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Categories" count={stats.categories} icon={<Category />} color="#4caf50" onClick={() => navigate('/categories')} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Total Orders" count={stats.orders} icon={<ShoppingCart />} color="#ff9800" onClick={() => navigate('/orders')} />
        </Grid>
      </Grid>
    </Box>
  );
}
