require('./config/config')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/person', function(req, res) {
    res.json('GET person')
})

app.post('/person', function(req, res) {

    let body = req.body;

    if (body.name == undefined) {
        res.status(400).json({
            ok: false,
            message: 'Name needed'
        })
    } else {
        res.json({
            person: body
        })
    }

})


app.put('/person/:id', function(req, res) {
    let id = req.params.id;
    res.json({
        id
    })
})


app.delete('/person', function(req, res) {
    res.json('DELETE person')
})

app.listen(process.env.PORT, () => {
    console.log(`Server listening on ${process.env.PORT} port`)
})