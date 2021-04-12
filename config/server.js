const dotenv = require('dotenv');
const mongoose = require('mongoose');

module.exports = function () {
    dotenv.config({path: './config.env'});
    const DB = process.env.DATABASE_LOCAL;
    mongoose.connect(DB,
        {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: true,
            useUnifiedTopology: true
        }).then(() => console.log('DB connection successful'));
}
