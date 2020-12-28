require('./config/config')
const express = require('express')
const mongoose = require('mongoose');

const app = express()
const bodyParser = require('body-parser')

require("dotenv").config();


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

app.use(require('./routes/person'))

// parse application/json
app.use(bodyParser.json())



try {
    mongoose.connect(process.env.DB_CN, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    });
    console.log("DB Online");
} catch (error) {
    console.log(error);
    throw new Error("Error en la base de datos - Hable con el admin");
}

app.listen(process.env.PORT, () => {
    console.log(`Server listening on ${process.env.PORT} port`)
})