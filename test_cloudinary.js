
const fs = require('fs');

async function runTest() {
  try {
    const cookieJar = new Map();

    const updateCookies = (headers) => {
        if (headers.getSetCookie) {
            headers.getSetCookie().forEach(c => {
                const key = c.split('=')[0];
                cookieJar.set(key, c.split(';')[0]);
            });
        }
    };
    const getCookieHeader = () => Array.from(cookieJar.values()).join('; ');

    // 1. Get CSRF
    console.log("Fetching CSRF...");
    const csrfRes = await fetch('https://restaurante-teste-automacao.onrender.com/api/csrf-token');
    const csrfData = await csrfRes.json();
    const csrfToken = csrfData.csrfToken;
    updateCookies(csrfRes.headers);
    console.log("CSRF Token obtained.");

    // 2. Login
    console.log("Logging in...");
    const loginRes = await fetch('https://restaurante-teste-automacao.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
            'Cookie': getCookieHeader()
        },
        body: JSON.stringify({ email: 'admin@teste.com', password: 'Teste@123_ChangeMe' })
    });
    
    updateCookies(loginRes.headers);

    if (!loginRes.ok) {
        console.error('Login failed:', await loginRes.text());
        return;
    }
    
    const loginData = await loginRes.json();
    const token = loginData.data.accessToken;
    console.log('Login success!');

    // 3. Upload Image
    console.log("Uploading image...");
    const formData = new FormData();
    const fileBuffer = fs.readFileSync('public/favicon.svg');
    const blob = new Blob([fileBuffer], { type: 'image/svg+xml' });
    formData.append('image', blob, 'test_upload.svg');
    formData.append('alt', 'Start Automacao Test Upload');

    const uploadRes = await fetch('https://restaurante-teste-automacao.onrender.com/api/gallery', {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'X-CSRF-Token': csrfToken,
            'Cookie': getCookieHeader()
        },
        body: formData
    });

    if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        console.error('Upload failed with status:', uploadRes.status);
        console.error('Response:', errText);
    } else {
        const result = await uploadRes.json();
        console.log('Upload success! New image URL:', result.data.url);
    }

  } catch (error) {
    console.error("Test Error:", error);
  }
}

runTest();
