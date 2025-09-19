const mongoose = require('mongoose');

// Setup test database
beforeAll(async () => {
  const mongoURI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/sweet-shop-test';
  await mongoose.connect(mongoURI);
});

// Clean up after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});
