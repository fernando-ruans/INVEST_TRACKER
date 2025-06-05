const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost/investment_tracker';

// Create Sequelize instance
const sequelize = new Sequelize(process.env.DATABASE_URL || 'sqlite::memory:', {
  dialect: process.env.DATABASE_URL ? 'postgres' : 'sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' && process.env.DATABASE_URL ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  storage: process.env.DATABASE_URL ? undefined : ':memory:'
});

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = {
  sequelize,
  testConnection
};