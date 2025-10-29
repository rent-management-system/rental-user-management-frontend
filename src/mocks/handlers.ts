import { http, HttpResponse, delay } from 'msw';

export const handlers = [
  http.post('http://localhost:8000/api/v1/users/register', async ({ request }) => {
    const body = await request.json() as { email?: string };
    
    // Simulate network delay
    await delay(150);
    
    // Simulate successful registration
    if (body.email && body.email.includes('@')) {
      return HttpResponse.json({
        id: '123',
        email: body.email,
        name: 'Test User',
        role: 'tenant',
        token: 'mock-jwt-token-123'
      }, { status: 201 });
    }
    
    // Simulate error for invalid email
    return HttpResponse.json(
      { detail: 'Invalid email format' },
      { status: 400 }
    );
  }),
];
