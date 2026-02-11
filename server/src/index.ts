import app from './app';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🍽  Restaurant Template server running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Health check: http://localhost:${PORT}/healthz`);
    console.log(`   Admin panel:  http://localhost:${PORT}/admin\n`);
});
