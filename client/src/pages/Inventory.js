import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import axios from 'axios';

function Inventory() {
  const [sweets, setSweets] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSweet, setSelectedSweet] = useState(null);
  const [actionType, setActionType] = useState(''); // 'purchase' or 'restock'
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sweetsResponse, lowStockResponse, analyticsResponse] = await Promise.all([
        axios.get('/api/sweets'),
        axios.get('/api/inventory/stock'),
        axios.get('/api/inventory/analytics')
      ]);

      setSweets(sweetsResponse.data.data.sweets);
      setLowStockItems(lowStockResponse.data.data.lowStockItems);
      setAnalytics(analyticsResponse.data.data);
    } catch (error) {
      setError('Failed to fetch inventory data');
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (sweet, type) => {
    setSelectedSweet(sweet);
    setActionType(type);
    setQuantity('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSweet(null);
    setActionType('');
    setQuantity('');
  };

  const handleAction = async () => {
    if (!selectedSweet || !quantity) return;

    try {
      const endpoint = actionType === 'purchase' 
        ? `/api/inventory/sweets/${selectedSweet._id}/purchase`
        : `/api/inventory/sweets/${selectedSweet._id}/restock`;

      await axios.post(endpoint, { quantity: parseInt(quantity) });
      handleCloseDialog();
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Operation failed');
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { status: 'Out of Stock', color: 'error' };
    if (quantity <= 10) return { status: 'Low Stock', color: 'warning' };
    return { status: 'In Stock', color: 'success' };
  };

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
          Inventory Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor stock levels and manage inventory operations
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Analytics Cards */}
      {analytics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <InventoryIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Items
                    </Typography>
                    <Typography variant="h4">
                      {analytics.overview.totalSweets}
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
                      ${analytics.overview.totalValue.toFixed(2)}
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
                  <WarningIcon color="warning" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Low Stock
                    </Typography>
                    <Typography variant="h4">
                      {analytics.overview.lowStock}
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
                  <WarningIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Out of Stock
                    </Typography>
                    <Typography variant="h4">
                      {analytics.overview.outOfStock}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Low Stock Alert
          </Typography>
          <Typography>
            {lowStockItems.length} item(s) are running low on stock. Consider restocking soon.
          </Typography>
        </Alert>
      )}

      {/* Inventory Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            All Items
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sweets.map((sweet) => {
                  const stockStatus = getStockStatus(sweet.quantity);
                  return (
                    <TableRow key={sweet._id}>
                      <TableCell>{sweet.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={sweet.category} 
                          size="small" 
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>${sweet.price.toFixed(2)}</TableCell>
                      <TableCell>{sweet.quantity}</TableCell>
                      <TableCell>
                        <Chip 
                          label={stockStatus.status}
                          color={stockStatus.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>${(sweet.price * sweet.quantity).toFixed(2)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(sweet, 'purchase')}
                            color="primary"
                            disabled={sweet.quantity === 0}
                          >
                            <ShoppingCartIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(sweet, 'restock')}
                            color="secondary"
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'purchase' ? 'Purchase Item' : 'Restock Item'}
        </DialogTitle>
        <DialogContent>
          {selectedSweet && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6">{selectedSweet.name}</Typography>
              <Typography color="text.secondary">
                Current Stock: {selectedSweet.quantity}
              </Typography>
              <Typography color="text.secondary">
                Price: ${selectedSweet.price.toFixed(2)}
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            label={`${actionType === 'purchase' ? 'Purchase' : 'Restock'} Quantity`}
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            inputProps={{ min: 1 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleAction} 
            variant="contained"
            disabled={!quantity || parseInt(quantity) <= 0}
          >
            {actionType === 'purchase' ? 'Purchase' : 'Restock'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Inventory;




