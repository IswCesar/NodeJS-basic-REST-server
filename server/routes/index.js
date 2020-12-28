const express = require('express')
const app = express()

app.use(require('./person'))
app.use(require('./login'))

module.exports = app