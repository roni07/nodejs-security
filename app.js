const express = require('express');
const app = express();

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! Shutting down....');
    console.log(err.name, err.message);
    process.exit(1);
});

require('./routes/api-routes')(app);

const port = process.env.PORT || 8080;
const server = app.listen(port, () => console.log(`App is running at port ${port}...`));

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! Shutting down....');
    console.log(err.name, err.message);
    server.close(() => { // before shutting down the server it will execute all it's request
        process.exit(1);//when app is crashed node js application stayed unclean state sot that
        // we need to terminate the process
    });
});
