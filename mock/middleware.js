module.exports = (req, res, next) => {
  // Handle login
  if (req.method === 'POST' && req.path === '/api/auth/login') {
    const { email, password } = req.body;
    const user = require('./db.json').users.find(u => u.email === email && u.password === password);
    
    if (user) {
      const token = `mock-jwt-token-${Date.now()}`;
      // In a real app, you would store this token in the database
      
      res.status(200).json({
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          is_active: user.is_active,
          phone_number: user.phone_number,
          preferred_language: user.preferred_language,
          preferred_currency: user.preferred_currency
        }
      });
    } else {
      res.status(401).json({
        message: 'Invalid email or password'
      });
    }
  }
  // Handle registration
  else if (req.method === 'POST' && req.path === '/api/auth/register') {
    const { email, password, full_name, phone_number, role, preferred_language, preferred_currency } = req.body;
    const db = require('./db.json');
    
    // Check if user exists
    if (db.users.some(u => u.email === email)) {
      return res.status(400).json({
        message: 'User already exists'
      });
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      password, // In a real app, you should hash the password
      full_name,
      phone_number,
      role: role || 'tenant',
      is_active: true,
      preferred_language: preferred_language || 'en',
      preferred_currency: preferred_currency || 'USD',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // In a real app, you would save this to the database
    db.users.push(newUser);
    
    // Generate token
    const token = `mock-jwt-token-${Date.now()}`;
    
    res.status(201).json({
      access_token: token,
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        is_active: newUser.is_active,
        phone_number: newUser.phone_number,
        preferred_language: newUser.preferred_language,
        preferred_currency: newUser.preferred_currency
      }
    });
  }
  // Handle protected routes
  else if (req.path.startsWith('/api/me')) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    // In a real app, you would validate the token against the database
    if (!token.startsWith('mock-jwt-token-')) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Continue to the next middleware
    next();
  } else {
    // Continue to the next middleware
    next();
  }
};
