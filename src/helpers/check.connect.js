"use strict"

const mongoose = require("mongoose");
const os = require("os");
const process = require("process");

const _SECONDS = 5000;

// Count connect
const countConnect = () => {
    const numberConnection = mongoose.connections.length;
    console.log(`Number connection of db is ${numberConnection} (this check in helper)`);
    return numberConnection;
}

// Check overload connect
const checkOverload = () => {
    setInterval(() => {
        const numberConnection = mongoose.connections.length;
        const numberCore = os.cpus().length;
        const memoryUse = process.memoryUsage().rss;

        // Giả xử mỗi core chịu được tối đa 5 connection
        const maxConnections = numberCore * 5;

        // Các connect được active
        console.log(`Active connection: ${numberConnection}`);

        // Tính bộ nhớ được sử dụng
        console.log(`Memmory use: ${memoryUse / 1024 / 1024} MB`);

        // Báo động overload
        if (numberConnection > maxConnections) {
            console.log(`Overload detected by connetion`)
        }

    }, _SECONDS);   // Kiểm tra mỗi 5 giây một lần
}

module.exports = {
    countConnect,
    checkOverload
}