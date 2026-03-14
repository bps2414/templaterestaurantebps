// Vercel serverless function entry point.
// The buildCommand in vercel.json compiles server/src → server/dist before this runs.
// Vercel wraps Express apps automatically — just export the app instance.
const app = require('../server/dist/app').default;
module.exports = app;
