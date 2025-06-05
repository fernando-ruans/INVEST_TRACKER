const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  hashed_password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Portfolio Model
const Portfolio = sequelize.define('Portfolio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  tableName: 'portfolios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Portfolio Asset Model
const PortfolioAsset = sequelize.define('PortfolioAsset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  portfolio_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Portfolio,
      key: 'id'
    }
  },
  symbol: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.DECIMAL(15, 8),
    allowNull: false
  },
  average_price: {
    type: DataTypes.DECIMAL(15, 8),
    allowNull: false
  }
}, {
  tableName: 'portfolio_assets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Watchlist Model
const Watchlist = sequelize.define('Watchlist', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  symbol: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'watchlist',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Email Verification Model
const EmailVerification = sequelize.define('EmailVerification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  verification_code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  is_used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'email_verifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Password Reset Model
const PasswordReset = sequelize.define('PasswordReset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  reset_token: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  is_used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'password_resets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define associations
User.hasMany(Portfolio, { foreignKey: 'user_id', as: 'portfolios' });
Portfolio.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Portfolio.hasMany(PortfolioAsset, { foreignKey: 'portfolio_id', as: 'assets' });
PortfolioAsset.belongsTo(Portfolio, { foreignKey: 'portfolio_id', as: 'portfolio' });

User.hasMany(Watchlist, { foreignKey: 'user_id', as: 'watchlist' });
Watchlist.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(EmailVerification, { foreignKey: 'user_id', as: 'email_verifications' });
EmailVerification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(PasswordReset, { foreignKey: 'user_id', as: 'password_resets' });
PasswordReset.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  User,
  Portfolio,
  PortfolioAsset,
  Watchlist,
  EmailVerification,
  PasswordReset,
  sequelize
};