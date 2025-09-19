const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Sweet = require('../models/Sweet');

describe('Sweets Routes', () => {
  let adminToken;
  let userToken;
  let adminUser;
  let regularUser;

  beforeEach(async () => {
    // Create admin user
    const adminData = {
      username: 'admin',
      email: 'admin@example.com',
      password: 'Admin123!',
      role: 'admin'
    };
    const admin = new User(adminData);
    await admin.save();
    adminUser = admin;

    // Create regular user
    const userData = {
      username: 'user',
      email: 'user@example.com',
      password: 'User123!'
    };
    const user = new User(userData);
    await user.save();
    regularUser = user;

    // Login admin
    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: adminData.email,
        password: adminData.password
      });
    adminToken = adminLoginResponse.body.data.token;

    // Login regular user
    const userLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: userData.email,
        password: userData.password
      });
    userToken = userLoginResponse.body.data.token;
  });

  describe('POST /api/sweets', () => {
    it('should create a new sweet as admin', async () => {
      const sweetData = {
        name: 'Chocolate Cake',
        category: 'cake',
        price: 25.99,
        quantity: 10,
        description: 'Delicious chocolate cake',
        imageUrl: 'https://example.com/cake.jpg'
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sweetData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.sweet.name).toBe(sweetData.name);
      expect(response.body.data.sweet.category).toBe(sweetData.category);
      expect(response.body.data.sweet.price).toBe(sweetData.price);
    });

    it('should not create sweet without authentication', async () => {
      const sweetData = {
        name: 'Chocolate Cake',
        category: 'cake',
        price: 25.99,
        quantity: 10
      };

      const response = await request(app)
        .post('/api/sweets')
        .send(sweetData)
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    it('should not create sweet as regular user', async () => {
      const sweetData = {
        name: 'Chocolate Cake',
        category: 'cake',
        price: 25.99,
        quantity: 10
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(sweetData)
        .expect(403);

      expect(response.body.status).toBe('error');
    });

    it('should not create sweet with invalid data', async () => {
      const sweetData = {
        name: 'A', // Too short
        category: 'invalid', // Invalid category
        price: -10, // Negative price
        quantity: -5 // Negative quantity
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sweetData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/sweets', () => {
    beforeEach(async () => {
      // Create some test sweets
      const sweets = [
        {
          name: 'Chocolate Cake',
          category: 'cake',
          price: 25.99,
          quantity: 10
        },
        {
          name: 'Vanilla Ice Cream',
          category: 'ice-cream',
          price: 5.99,
          quantity: 20
        },
        {
          name: 'Chocolate Chip Cookie',
          category: 'cookie',
          price: 2.99,
          quantity: 50
        }
      ];

      for (const sweet of sweets) {
        const sweetDoc = new Sweet(sweet);
        await sweetDoc.save();
      }
    });

    it('should get all sweets with authentication', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.sweets).toHaveLength(3);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter sweets by category', async () => {
      const response = await request(app)
        .get('/api/sweets?category=cake')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.sweets).toHaveLength(1);
      expect(response.body.data.sweets[0].category).toBe('cake');
    });

    it('should filter sweets by price range', async () => {
      const response = await request(app)
        .get('/api/sweets?minPrice=5&maxPrice=10')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.sweets).toHaveLength(1);
      expect(response.body.data.sweets[0].name).toBe('Vanilla Ice Cream');
    });

    it('should not get sweets without authentication', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/sweets/search', () => {
    beforeEach(async () => {
      const sweets = [
        {
          name: 'Chocolate Cake',
          category: 'cake',
          price: 25.99,
          quantity: 10,
          description: 'Rich chocolate cake'
        },
        {
          name: 'Vanilla Cake',
          category: 'cake',
          price: 22.99,
          quantity: 15,
          description: 'Classic vanilla cake'
        }
      ];

      for (const sweet of sweets) {
        const sweetDoc = new Sweet(sweet);
        await sweetDoc.save();
      }
    });

    it('should search sweets by name', async () => {
      const response = await request(app)
        .get('/api/sweets/search?q=chocolate')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.sweets).toHaveLength(1);
      expect(response.body.data.sweets[0].name).toBe('Chocolate Cake');
    });

    it('should search sweets by description', async () => {
      const response = await request(app)
        .get('/api/sweets/search?q=rich')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.sweets).toHaveLength(1);
      expect(response.body.data.sweets[0].description).toContain('rich');
    });
  });

  describe('PUT /api/sweets/:id', () => {
    let sweet;

    beforeEach(async () => {
      sweet = new Sweet({
        name: 'Original Cake',
        category: 'cake',
        price: 20.99,
        quantity: 5
      });
      await sweet.save();
    });

    it('should update sweet as admin', async () => {
      const updateData = {
        name: 'Updated Cake',
        price: 30.99,
        quantity: 15
      };

      const response = await request(app)
        .put(`/api/sweets/${sweet._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.sweet.name).toBe(updateData.name);
      expect(response.body.data.sweet.price).toBe(updateData.price);
    });

    it('should not update sweet as regular user', async () => {
      const updateData = {
        name: 'Updated Cake',
        price: 30.99
      };

      const response = await request(app)
        .put(`/api/sweets/${sweet._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.status).toBe('error');
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    let sweet;

    beforeEach(async () => {
      sweet = new Sweet({
        name: 'To Delete Cake',
        category: 'cake',
        price: 20.99,
        quantity: 5
      });
      await sweet.save();
    });

    it('should delete sweet as admin', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweet._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Sweet deleted successfully');

      // Verify sweet is deleted
      const deletedSweet = await Sweet.findById(sweet._id);
      expect(deletedSweet).toBeNull();
    });

    it('should not delete sweet as regular user', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweet._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.status).toBe('error');
    });
  });
});
