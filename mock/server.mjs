import { create, router as _router, defaults } from 'json-server';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = create();
const router = _router(join(__dirname, 'db.json'));
const middlewares = defaults();

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
    res.status(401).jsonp({ error: 'Invalid credentials' });
  }
});

// Signup endpoint
server.post('/api/auth/signup', (req, res) => {
  const userData = req.body;
  
  // Check if user already exists
  const existingUser = router.db.get('users').find({ email: userData.email }).value();
  if (existingUser) {
    return res.status(400).jsonp({ error: 'User already exists' });
  }
  
  // Create new user
  const newUser = {
    id: Date.now().toString(),
    ...userData,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  router.db.get('users').push(newUser).write();
  
  const token = `mock-jwt-token-${Date.now()}`;
  router.db.get('tokens').push({ token, userId: newUser.id }).write();
  
  // Don't return the password in the response
  const { password, ...userWithoutPassword } = newUser;
  
  res.status(201).jsonp({
    access_token: token,
    user: userWithoutPassword
  });
});

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).jsonp({ error: 'Unauthorized' });
  }
  
  const token = authHeader.split(' ')[1];
  const tokenRecord = router.db.get('tokens').find({ token }).value();
  
  if (!tokenRecord) {
    return res.status(401).jsonp({ error: 'Invalid token' });
  }
  
  req.userId = tokenRecord.userId;
  next();
};

// Protected route example
server.get('/api/me', requireAuth, (req, res) => {
  const user = router.db.get('users').find({ id: req.userId }).value();
  if (!user) {
    return res.status(404).jsonp({ error: 'User not found' });
  }
  
  const { password, ...userWithoutPassword } = user;
  res.jsonp(userWithoutPassword);
});

// Use default middlewares and router
server.use(middlewares);
server.use('/api', router);

// Start server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Mock API Server is running on http://localhost:${PORT}`);
});
