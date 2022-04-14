require('dotenv').config({ path: __dirname + '/.env' });
process.env.APP_DIR = __dirname;
require('./app/index');