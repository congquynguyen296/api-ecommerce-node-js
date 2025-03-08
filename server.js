const app = require("./src/app");

const PORT = 3000;

const server = app.listen(PORT, () => {
    console.log(`Start with port ${PORT}`);
});

process.on('SIGINT', () => {
    server.close(() => {
        console.log("Exit server");
    });
    // app.notify("Crass app");
});