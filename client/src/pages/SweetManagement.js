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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Alert,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import api from '../config/axios';

function SweetManagement() {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSweet, setEditingSweet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    description: '',
    imageUrl: ''
  });

  const categories = [
    'chocolate',
    'candy',
    'cake',
    'cookie',
    'ice-cream',
    'pastry',
    'other'
  ];

  useEffect(() => {
    fetchSweets();
  }, []);

  const fetchSweets = async () => {
    try {
      const response = await api.get('/api/sweets');
      setSweets(response.data.data.sweets);
    } catch (error) {
      setError('Failed to fetch sweets');
      console.error('Error fetching sweets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (sweet = null) => {
    if (sweet) {
      setEditingSweet(sweet);
      setFormData({
        name: sweet.name,
        category: sweet.category,
        price: sweet.price.toString(),
        quantity: sweet.quantity.toString(),
        description: sweet.description || '',
        imageUrl: sweet.imageUrl || ''
      });
    } else {
      setEditingSweet(null);
      setFormData({
        name: '',
        category: '',
        price: '',
        quantity: '',
        description: '',
        imageUrl: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSweet(null);
    setFormData({
      name: '',
      category: '',
      price: '',
      quantity: '',
      description: '',
      imageUrl: ''
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const sweetData = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        ...(formData.description && { description: formData.description }),
        ...(formData.imageUrl && { imageUrl: formData.imageUrl })
      };

      if (editingSweet) {
        await api.put(`/api/sweets/${editingSweet._id}`, sweetData);
      } else {
        await api.post('/api/sweets', sweetData);
      }

      handleCloseDialog();
      fetchSweets();
    } catch (error) {
      const apiErrors = error.response?.data?.errors;
      const message = apiErrors?.length
        ? apiErrors.map(e => e.msg).join(', ')
        : (error.response?.data?.message || 'Operation failed');
      setError(message);
    }
  };

  const handleDelete = async (sweetId) => {
    if (window.confirm('Are you sure you want to delete this sweet?')) {
      try {
        await api.delete(`/api/sweets/${sweetId}`);
        fetchSweets();
      } catch (error) {
        setError(error.response?.data?.message || 'Delete failed');
      }
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', width: 200 },
    { 
      field: 'category', 
      headerName: 'Category', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          sx={{ textTransform: 'capitalize' }}
        />
      )
    },
    { 
      field: 'price', 
      headerName: 'Price', 
      width: 100,
      renderCell: (params) => `$${params.value.toFixed(2)}`
    },
    { field: 'quantity', headerName: 'Stock', width: 100 },
    { 
      field: 'description', 
      headerName: 'Description', 
      width: 200,
      renderCell: (params) => params.value || 'No description'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleOpenDialog(params.row)}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(params.row._id)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Sweet Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add New Sweet
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Manage your sweet inventory - add, edit, and delete sweets
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={sweets}
          columns={columns}
          getRowId={(row) => row._id}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5',
            },
          }}
        />
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSweet ? 'Edit Sweet' : 'Add New Sweet'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Sweet Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    label="Category"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Image URL"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingSweet ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}

export default SweetManagement;

