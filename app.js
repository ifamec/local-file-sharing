#!/usr/bin/env node

const { startServer } = require('./src/server');
const { setupCLI } = require('./src/config/cli');

const options = setupCLI();
startServer(options);