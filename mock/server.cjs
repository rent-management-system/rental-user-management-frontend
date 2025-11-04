const jsonServer = require('json-server');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

// Add custom routes for authentication
server.use(jsonServer.bodyParser);

// Login endpoint
server.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = router.db.get('users').find({ email, password }).value();
  
  if (user) {
    const token = `mock-jwt-token-${Date.now()}`;
    // Store token in the tokens array
    router.db.get('tokens').push({ token, userId: user.id }).write();
    
    res.jsonp({
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
    res.status(401).jsonp({
      message: 'Invalid email or password'
    });
  }
});

// Register endpoint
server.post('/api/auth/register', (req, res) => {
  const { email, password, full_name, phone_number, role, preferred_language, preferred_currency } = req.body;
  
  // Check if user already exists
  const existingUser = router.db.get('users').find({ email }).value();
  if (existingUser) {
    return res.status(400).jsonp({
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
  
  router.db.get('users').push(newUser).write();
  
  // Generate token
  const token = `mock-jwt-token-${Date.now()}`;
  router.db.get('tokens').push({ token, userId: newUser.id }).write();
  
  res.status(201).jsonp({
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
});

// Middleware to check authentication
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).jsonp({ message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  const tokenData = router.db.get('tokens').find({ token }).value();
  
  if (!tokenData) {
    return res.status(401).jsonp({ message: 'Invalid token' });
  }
  
  req.userId = tokenData.userId;
  next();
}

// Protected route example
server.get('/api/me', requireAuth, (req, res) => {
  const user = router.db.get('users').find({ id: req.userId }).value();
  if (!user) {
    return res.status(404).jsonp({ message: 'User not found' });
  }
  
  // Don't send password hash back
  const { password, ...userData } = user;
  res.jsonp(userData);
});

// Use default middlewares
server.use(middlewares);

// Use router
server.use('/api', router);

// Start server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
});
