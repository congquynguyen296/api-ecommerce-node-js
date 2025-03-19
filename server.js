const app = require("./src/app");
const config = require("./src/configs/config.mongodb");

const PORT = config.app.port || 3000;

const server = app.listen(PORT, () => {
    console.log(`Start with port ${PORT} in ${config.app.mode} mode`);
});

process.on('SIGINT', () => {
    server.close(() => {
        console.log("Exit server");
    });
});
