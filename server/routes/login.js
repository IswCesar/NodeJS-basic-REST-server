const express = require('express')
const app = express()
const Person = require('../models/person')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
app.post('/login', (req, res) => {

    let body = req.body;

    Person.findOne({ email: body.email }, (err, person) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!person) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Email) or password wrong'
                }
            })
        }

        if (!bcrypt.compareSync(body.password, person.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Email or (password) wrong'
                }
            })
        }

        let token = jwt.sign({
            person,
        }, process.env.TOKEN_SEED, { expiresIn: process.env.TOKEN_EXPIRES })

        res.json({
            ok: true,
            person,
            token
        })
    })
})

module.exports = app