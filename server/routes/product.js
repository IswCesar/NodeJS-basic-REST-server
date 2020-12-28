const express = require('express')

let { checkToken, checkAdminRole } = require('../middlewares/auth')

let app = express()

let Product = require('../models/product')

// ==============================
// GET ALL PRODUCTS
// ==============================
app.get('/products', checkToken, (req, res) => {
    // GET All products
    // populate; person category
    // paginated

    let from = req.query.from || 0
    from = Number(from)

    let limit = req.query.limit || 5
    limit = Number(limit)

    Product.find({ available: true })
        .skip(from)
        .limit(limit)
        .populate('person', 'name email')
        .populate('category', 'description')
        .exec((err, products) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                products
            })
        })
})

// ==============================
// GET PRODUCT BY ID
// ==============================
app.get('/products/:id', checkToken, (req, res) => {
    // populate; person category
    let id = req.params.id
    Product.findById(id)
        .populate('person', 'name email')
        .populate('category', 'description')
        .exec((err, productDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            if (!productDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Product not exist'
                    }
                })
            }

            res.json({
                ok: true,
                product: productDB
            })
        })
})

// ==============================
// FIND PRODUCT
// ==============================
app.get('/products/search/:value', checkToken, (req, res) => {
    let value = req.params.value
    let regex = new RegExp(value, 'i')
    Product.find({ name: regex })
        .populate('category', 'name')
        .exec((err, products) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            res.json({
                ok: true,
                products
            })
        })
})


// ==============================
// POST PRODUCT
// ==============================
app.post('/products', checkToken, (req, res) => {
    // save user
    // save category from list
    let body = req.body;
    let product = new Product({
        person: req.person._id,
        name: body.name,
        unitPrice: body.unitPrice,
        description: body.description,
        available: body.available,
        category: body.category
    })

    product.save((err, productDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        res.status(201).json({
            ok: true,
            product: productDB
        })
    })
})

// ==============================
// UPDATE PRODUCT BY ID
// ==============================
app.put('/products/:id', checkToken, (req, res) => {
    // save user
    // save category from list
    let id = req.params.id
    let body = req.body

    Product.findById(id, (err, productDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!productDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Product not founded'
                }
            })
        }

        productDB.name = body.name
        productDB.unitPrice = body.unitPrice
        productDB.category = body.category
        productDB.available = body.available
        productDB.description = body.description

        productDB.save((err, productSaved) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                product: productSaved
            })
        })
    })
})

// ==============================
// DELETE PRODUCT BY ID
// ==============================
app.delete('/products/:id', [checkToken, checkAdminRole], (req, res) => {
    // save user
    // save category from list
    // just pass to unavailable

    let id = req.params.id


    Product.findById(id, (err, productDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!productDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Product not founded'
                }
            })
        }

        productDB.available = false;
        productDB.save((err, productDeleted) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                productDeleted,
                message: 'Product deleted'
            })
        })
    })
})

module.exports = app