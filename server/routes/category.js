const express = require('express')

let { checkToken, checkAdminRole } = require('../middlewares/auth')

let app = express()

let Category = require('../models/category')

// Populate check ObjectID or connection with collections
// the query has, and allow us to use it information
// instead of show just it ID
app.get('/category', checkToken, (req, res) => {
    Category.find({})
        .sort('description')
        .populate('person', 'name email')
        .exec((err, categories) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                categories
            })
        })
})


app.get('/category/:id', checkToken, (req, res) => {

    let id = req.params.id
    Category.findById(id, (err, categoryDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!categoryDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Category not exist'
                }
            })
        }

        res.json({
            ok: true,
            category: categoryDB
        })
    })
})


app.post('/category', checkToken, (req, res) => {
    let body = req.body

    let category = new Category({
        description: body.description,
        person: req.person._id
    })

    category.save((err, categoryDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!categoryDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            category: categoryDB
        })
    })
})


app.put('/category/:id', checkToken, (req, res) => {
    let id = req.params.id
    let body = req.body

    let descCategory = {
        description: body.description
    }

    Category.findByIdAndUpdate(id, descCategory, { new: true, runValidator: true }, (err, categoryDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!categoryDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            category: categoryDB
        })
    })
})


app.delete('/category/:id', [checkToken, checkAdminRole], (req, res) => {
    let id = req.params.id

    Category.findByIdAndRemove(id, (err, categoryDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!categoryDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Category not exist'
                }
            })
        }

        res.json({
            ok: true,
            message: 'Category deleted'
        })
    })
})

module.exports = app