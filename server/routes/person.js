const express = require('express')
const app = express()
const Person = require('../models/person')
const bcrypt = require('bcrypt')
const _ = require('underscore')

const { checkToken, checkAdminRole } = require('../middlewares/auth')

app.get('/person', checkToken, (req, res) => {

    /*
    return res.json({
        person: req.person,
        name: req.person.name,
        email: req.person.email
    })
    */
    let from = req.query.from || 0
    from = Number(from)

    let limit = req.query.limit || 0
    limit = Number(limit)

    Person.find({ state: true }, 'name email role state google img')
        .skip(from)
        .limit(limit)
        .exec((err, persons) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }
            Person.count({ state: true }, (err, count) => {
                res.json({
                    ok: true,
                    persons,
                    count
                })
            })
        })
})

app.post('/person', [checkToken, checkAdminRole], (req, res) => {

    let body = req.body;

    let person = new Person({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    })

    person.save((err, personDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        res.json({
            ok: true,
            person: personDB
        })
    })

})


app.put('/person/:id', [checkToken, checkAdminRole], (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['name', 'email', 'img', 'role', 'state']);

    Person.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, personDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            person: personDB
        })
    })


})


app.delete('/person/:id', [checkToken, checkAdminRole], (req, res) => {
    let id = req.params.id;

    // Delete record
    // Person.findByIdAndRemove(id, (err, personDeleted) => {

    // Just deactivate persons state
    let changeState = { state: false }
    Person.findByIdAndUpdate(id, changeState, { new: true }, (err, personDeleted) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if (!personDeleted) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Person not founded'
                }
            })
        }

        res.json({
            ok: true,
            personDeleted
        })
    })
})

module.exports = app