# JWT Secret Generator

Secure JWT secret generation and token handling utilities for Node.js applications.

## Generate Secure JWT Secret

```javascript
const crypto = require('crypto');

// Generate a cryptographically secure random secret
function generateJWTSecret(length = 64) {
    return crypto.randomBytes(length).toString('hex');
}

// Usage
const jwtSecret = generateJWTSecret();
console.log('JWT Secret:', jwtSecret);

// For environment variables
console.log(`JWT_SECRET=${jwtSecret}`);
```

## JWT Token Creation & Verification

```javascript
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class JWTManager {
    constructor(secret = null) {
        this.secret = secret || crypto.randomBytes(64).toString('hex');
    }
    
    // Generate access token
    generateAccessToken(payload, expiresIn = '15m') {
        return jwt.sign(payload, this.secret, { 
            expiresIn,
            issuer: 'your-app-name',
            audience: 'your-app-users'
        });
    }
    
    // Generate refresh token
    generateRefreshToken(payload, expiresIn = '7d') {
        return jwt.sign(payload, this.secret, { 
            expiresIn,
            issuer: 'your-app-name',
            audience: 'your-app-users'
        });
    }
    
    // Verify token
    verifyToken(token) {
        try {
            return jwt.verify(token, this.secret);
        } catch (error) {
            throw new Error(`Token verification failed: ${error.message}`);
        }
    }
    
    // Decode token without verification (for debugging)
    decodeToken(token) {
        return jwt.decode(token, { complete: true });
    }
}

// Usage
const jwtManager = new JWTManager();

const user = { id: 123, email: 'user@example.com', role: 'user' };
const accessToken = jwtManager.generateAccessToken(user);
const refreshToken = jwtManager.generateRefreshToken({ id: user.id });

console.log('Access Token:', accessToken);
console.log('Refresh Token:', refreshToken);
```

## Express Middleware

```javascript
const jwt = require('jsonwebtoken');

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
        return res.status(401).json({ 
            error: 'Access token required' 
        });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                error: 'Invalid or expired token' 
            });
        }
        
        req.user = user;
        next();
    });
}

// Role-based authorization middleware
function authorizeRole(roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                error: 'Authentication required' 
            });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 'Insufficient permissions' 
            });
        }
        
        next();
    };
}

// Usage in routes
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'Protected route accessed', user: req.user });
});

app.get('/admin', authenticateToken, authorizeRole(['admin']), (req, res) => {
    res.json({ message: 'Admin route accessed' });
});
```

## Environment Configuration

```
# .env file
JWT_SECRET=your-super-secure-secret-key-here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
JWT_ISSUER=your-app-name
JWT_AUDIENCE=your-app-users
```

```javascript
// config/jwt.js
require('dotenv').config();

module.exports = {
    secret: process.env.JWT_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    issuer: process.env.JWT_ISSUER || 'your-app',
    audience: process.env.JWT_AUDIENCE || 'users'
};
```
