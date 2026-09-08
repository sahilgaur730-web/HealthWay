/**
 * Authentication & Authorization Express Routes
 * Government of Maharashtra - Integrated Rural Health Platform (HealthWay)
 * Strictly zero unicode emojis.
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const {
  UserRoleEnum,
  RolePermissions,
  RolePortals,
  findUserByUsername,
  findUserById,
  getAllUsers,
  verifyPassword,
  createUser,
  canAccessPortal
} = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'healthway-maharashtra-secret-key-2026';
const JWT_EXPIRES_IN = '7d';

/**
 * Helper to generate JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      facility: user.facility,
      subCentre: user.subCentre,
      village: user.village,
      permissions: user.permissions || RolePermissions[user.role] || []
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Helper to sanitize user object
 */
function sanitizeUser(user) {
  if (!user) return null;
  const { password, passwordHash, ...safe } = user;
  return safe;
}

/**
 * Helper to build session object compatible with frontend SessionRecord
 */
function buildSession(user, token) {
  return {
    id: 'ACTIVE_SESSION',
    userId: user.id,
    username: user.username,
    name: user.name,
    nameMr: user.nameMr,
    role: user.role,
    token: token || `hw_tk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    loginTime: new Date().toISOString(),
    village: user.village,
    villageMr: user.villageMr,
    subCentre: user.subCentre,
    subCentreMr: user.subCentreMr,
    facility: user.facility,
    designation: user.designation,
    designationMr: user.designationMr,
    abhaId: user.abhaId
  };
}

/**
 * Middleware: Verify Bearer JWT Token
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication token missing. Please log in.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired session token. Please log in again.'
      });
    }
    req.user = decoded;
    next();
  });
}

/**
 * Middleware: Require specific role or roles
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ success: false, error: 'Unauthorized user' });
    }
    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: `Access denied. Requires one of [${allowedRoles.join(', ')}] role.`
      });
    }
    next();
  };
}

// POST /api/auth/login - Authenticate user credentials
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};

  if (
    !username ||
    !password ||
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    !username.trim() ||
    !password.trim()
  ) {
    return res.status(400).json({
      success: false,
      error: 'Both username and password are required and must be valid non-empty strings.'
    });
  }

  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = password.trim();

  const user = findUserByUsername(cleanUsername);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'User not found. Please verify your username or sign up.'
    });
  }

  const isValid = verifyPassword(cleanPassword, user);
  if (!isValid) {
    return res.status(401).json({
      success: false,
      error: 'Invalid password. Please check your credentials.'
    });
  }

  const token = generateToken(user);
  const session = buildSession(user, token);
  const safeUser = sanitizeUser(user);

  return res.json({
    success: true,
    message: 'Login successful',
    token,
    user: safeUser,
    session,
    permissions: user.permissions || RolePermissions[user.role] || []
  });
});

// POST /api/auth/signup - Register new staff or citizen account
router.post('/signup', (req, res) => {
  const {
    username,
    password,
    role,
    name,
    nameMr,
    phone,
    email,
    village,
    villageMr,
    subCentre,
    subCentreMr,
    facility,
    designation,
    designationMr,
    abhaId,
    registrationNo
  } = req.body || {};

  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    return res.status(400).json({
      success: false,
      error: 'Username is required and must be a string of at least 3 characters.'
    });
  }

  if (!password || typeof password !== 'string' || password.trim().length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password is required and must be a string of at least 6 characters.'
    });
  }

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Full name is required and must be a string of at least 2 characters.'
    });
  }

  if (!role || typeof role !== 'string' || !UserRoleEnum.includes(role)) {
    return res.status(400).json({
      success: false,
      error: `Valid role is required: [${UserRoleEnum.join(', ')}]`
    });
  }

  const cleanUsername = username.trim().toLowerCase();
  const existing = findUserByUsername(cleanUsername);
  if (existing) {
    return res.status(409).json({
      success: false,
      error: 'This username is already taken. Please select a different username.'
    });
  }

  try {
    const newUser = createUser({
      username,
      password,
      role,
      name,
      nameMr,
      phone: phone || '',
      email: email || '',
      village: village || '',
      villageMr: villageMr || '',
      subCentre: subCentre || '',
      subCentreMr: subCentreMr || '',
      facility: facility || '',
      designation: designation || '',
      designationMr: designationMr || '',
      abhaId: abhaId || '',
      registrationNo: registrationNo || ''
    });

    const token = generateToken(newUser);
    const session = buildSession(newUser, token);
    const safeUser = sanitizeUser(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: safeUser,
      session,
      permissions: newUser.permissions
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Error occurred while creating user account.'
    });
  }
});

// GET /api/auth/me - Retrieve current authenticated profile
router.get('/me', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authenticated. Session token missing.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token.'
      });
    }

    const user = findUserById(decoded.id) || findUserByUsername(decoded.username);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User profile no longer exists.'
      });
    }

    const safeUser = sanitizeUser(user);
    return res.json({
      success: true,
      user: safeUser,
      permissions: user.permissions || RolePermissions[user.role] || [],
      allowedPortals: RolePortals[user.role] || []
    });
  });
});

// GET /api/auth/users - Retrieve sanitized registered users list
router.get('/users', (req, res) => {
  const users = getAllUsers(true);
  res.json({
    success: true,
    count: users.length,
    users
  });
});

// POST /api/auth/verify-permission - Role-based route permission check
router.post('/verify-permission', (req, res) => {
  const { role, portalPath, permission } = req.body || {};

  if (!role || typeof role !== 'string' || !UserRoleEnum.includes(role)) {
    return res.status(400).json({
      success: false,
      error: `Valid role is required: [${UserRoleEnum.join(', ')}]`
    });
  }

  const permissions = RolePermissions[role] || [];
  const allowedPortals = RolePortals[role] || [];

  let portalAllowed = true;
  if (portalPath) {
    portalAllowed = canAccessPortal(role, portalPath);
  }

  let permissionAllowed = true;
  if (permission) {
    permissionAllowed = role === 'admin' || permissions.includes(permission);
  }

  const allowed = portalAllowed && permissionAllowed;

  res.json({
    success: true,
    allowed,
    role,
    portalPath: portalPath || null,
    permission: permission || null,
    permissions,
    allowedPortals
  });
});

module.exports = {
  router,
  authenticateToken,
  requireRole
};
