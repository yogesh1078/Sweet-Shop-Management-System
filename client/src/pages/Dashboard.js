import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Cake as CakeIcon,
  ShoppingCart as ShoppingCartIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import api from '../config/axios';

function Dashboard() {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSweets, setFilteredSweets] = useState([]);

  useEffect(() => {
    fetchSweets();
  }, []);

  useEffect(() => {
    const filtered = sweets.filter(sweet =>
      sweet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sweet.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSweets(filtered);
  }, [sweets, searchTerm]);

  const fetchSweets = async () => {
    try {
      console.log('Fetching sweets...');
      const response = await api.get('/api/sweets');
      console.log('Sweets response:', response.data);
      setSweets(response.data.data.sweets);
    } catch (error) {
      console.error('Error fetching sweets:', error);
      console.error('Error response:', error.response);
      setError('Failed to fetch sweets: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (sweetId, quantity = 1) => {
    try {
      await api.post(`/api/inventory/sweets/${sweetId}/purchase`, { quantity });
      // Refresh sweets data
      fetchSweets();
    } catch (error) {
      setError(error.response?.data?.message || 'Purchase failed');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      chocolate: '#8B4513',
      candy: '#FF69B4',
      cake: '#FFB6C1',
      cookie: '#DEB887',
      'ice-cream': '#87CEEB',
      pastry: '#F0E68C',
      other: '#D3D3D3'
    };
    return colors[category] || colors.other;
  };

  const totalSweets = sweets.length;
  const totalValue = sweets.reduce((sum, sweet) => sum + (sweet.price * sweet.quantity), 0);
  const lowStockItems = sweets.filter(sweet => sweet.quantity <= 10).length;
  const outOfStockItems = sweets.filter(sweet => sweet.quantity === 0).length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sweet Shop Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to your sweet inventory management system
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CakeIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Sweets
                  </Typography>
                  <Typography variant="h4">
                    {totalSweets}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon color="secondary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Value
                  </Typography>
                  <Typography variant="h4">
                    ${totalValue.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ShoppingCartIcon color="warning" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Low Stock
                  </Typography>
                  <Typography variant="h4">
                    {lowStockItems}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ShoppingCartIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Out of Stock
                  </Typography>
                  <Typography variant="h4">
                    {outOfStockItems}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search sweets by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Sweets Grid */}
      <Grid container spacing={3}>
        {filteredSweets.map((sweet) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={sweet._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h3" noWrap>
                    {sweet.name}
                  </Typography>
                  <Chip
                    label={sweet.category}
                    size="small"
                    sx={{
                      backgroundColor: getCategoryColor(sweet.category),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
                
                <Typography variant="h5" color="primary" gutterBottom>
                  ${sweet.price.toFixed(2)}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {sweet.description || 'No description available'}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2">
                    Stock: <strong>{sweet.quantity}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Value: ${(sweet.price * sweet.quantity).toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
              
              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<ShoppingCartIcon />}
                  disabled={sweet.quantity === 0}
                  onClick={() => handlePurchase(sweet._id)}
                  sx={{ mb: 1 }}
                >
                  {sweet.quantity === 0 ? 'Out of Stock' : 'Purchase'}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredSweets.length === 0 && !loading && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm ? 'No sweets found matching your search' : 'No sweets available'}
          </Typography>
        </Box>
      )}
    </Container>
  );
}

export default Dashboard;