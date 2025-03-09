"use strict"

// Môi trường dev
const dev = {
    app: {
        mode: 'dev',
        port: process.env.DEV_APP_PORT
    },
    db: {
        host: process.env.DEV_DB_HOST,
        port: process.env.DEV_DB_PORT,
        name: process.env.DEV_DB_NAME,
        user: process.env.DEV_DB_USER,
        password: process.env.DEV_DB_PASSWORD
    }
}

// Môi trường production
const prod = {
    app: {
        mode: 'prod',
        port: process.env.PROD_APP_PORT
    },
    db: {
        host: process.env.PROD_DB_HOST, // Sẽ thay host khi được thuê khi triển khai
        port: process.env.PROD_DB_PORT, // Port được thuê cũng sẽ được thay
        name: process.env.PROD_DB_NAME,
        user: process.env.PROD_DB_USER,
        password: process.env.PROD_DB_PASSWORD
    }
}
const config = { dev, prod };
const env = process.env.NODE_ENV || 'dev';

module.exports = config[env];