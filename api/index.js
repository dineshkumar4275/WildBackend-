// Vercel serverless entry point
const serverless = require('@vendia/serverless-express');
const app = require('../src/app');

module.exports = serverless({ app });