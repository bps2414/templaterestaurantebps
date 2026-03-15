const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

// Mocking the middleware logic from csrf.ts
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

function csrfSetToken(req, res, next) {
    if (req.cookies[CSRF_COOKIE_NAME]) {
        res.locals.csrfToken = req.cookies[CSRF_COOKIE_NAME];
        return next();
    }
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie(CSRF_COOKIE_NAME, token, { httpOnly: false });
    res.locals.csrfToken = token;
    next();
}

function getCsrfToken(req, res) {
    const token = res.locals.csrfToken || req.cookies[CSRF_COOKIE_NAME];
    res.json({ success: true, token });
}

function csrfVerifyToken(req, res, next) {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const tokenFromCookie = req.cookies[CSRF_COOKIE_NAME];
    const tokenFromHeader = req.headers[CSRF_HEADER_NAME];
    if (!tokenFromCookie || !tokenFromHeader) return res.status(403).json({ success: false, error: 'missing' });
    if (tokenFromCookie !== tokenFromHeader) return res.status(403).json({ success: false, error: 'invalid' });
    next();
}

const app = express();
app.use(cookieParser());
app.use(express.json());

app.get('/api/csrf-token', csrfSetToken, getCsrfToken);
app.post('/api/auth/login', csrfVerifyToken, (req, res) => res.json({ success: true }));

const server = app.listen(0, async () => {
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;
    console.log(`Test server running on ${baseUrl}`);

    try {
        console.log('--- Test 1: First request to fetch token (no cookies) ---');
        const res1 = await fetch(`${baseUrl}/api/csrf-token`);
        const data1 = await res1.json();
        const cookie = res1.headers.get('set-cookie');
        console.log('Token received:', data1.token);
        console.log('Cookie set:', cookie);
        
        if (!data1.token) throw new Error('Token missing in response body!');
        if (!cookie || !cookie.includes(data1.token)) throw new Error('Token in body does not match cookie!');
        console.log('Test 1 PASSED');

        console.log('--- Test 2: Login request with token ---');
        const res2 = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [CSRF_HEADER_NAME]: data1.token,
                'Cookie': cookie.split(';')[0]
            },
            body: JSON.stringify({ email: 'test@test.com', password: 'password' })
        });
        const data2 = await res2.json();
        console.log('Login response:', data2);
        if (!data2.success) throw new Error('Login failed with valid token!');
        console.log('Test 2 PASSED');

        console.log('--- ALL TESTS PASSED ---');
        process.exit(0);
    } catch (err) {
        console.error('Test FAILED:', err.message);
        process.exit(1);
    }
});
