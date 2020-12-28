const express = require('express')
const app = express()
const Person = require('../models/person')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


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

// Google config

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

}

app.post('/google', async(req, res) => {

    // Get google token grom google auth
    let token = req.body.idtoken

    // Verify google token
    let googlePerson = await verify(token).catch(e => {
        return res.status(403).json({
            ok: false,
            err: e
        })
    })

    // Find if DB has a person with that email
    Person.findOne({ email: googlePerson.email }, (err, personDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        // Person with that email exist
        if (personDB) {
            // Person not had been auth with google
            // it registered with email and password
            // and we must not leave it enters with google auth
            // Must enter with email and password
            if (personDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Must use normal auth system'
                    }
                })
            } else {
                // Person registered with google
                // renew it token and send it in the request
                let token = jwt.sign({ personDB, },
                    process.env.TOKEN_SEED, { expiresIn: process.env.TOKEN_EXPIRES }
                )

                res.json({
                    ok: true,
                    person: personDB,
                    token
                })
            }
        } else {
            // Person not exist, first time that person auth in system

            let person = new Person()
            person.name = googlePerson.name
            person.email = googlePerson.email
            person.img = googlePerson.img
            person.google = true
            person.password = ':)'

            person.save((err, personDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                }

                let token = jwt.sign({ person, },
                    process.env.TOKEN_SEED, { expiresIn: process.env.TOKEN_EXPIRES }
                )

                res.json({
                    ok: true,
                    person: personDB,
                    token
                })
            })

        }
    })
})

module.exports = app