const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const Person = require('../models/person')
const Product = require('../models/product')
const fs = require('fs')
const path = require('path')

// default options
app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:type/:id', function(req, res) {

    let type = req.params.type
    let id = req.params.id

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No files were uploaded.'
                }
            })
    }

    // Validate types
    let allowedTypes = ['persons', 'products']
    if (allowedTypes.indexOf(type) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Allowed types are ' + allowedTypes.join(', '),
                type
            }
        })
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let file = req.files.file;
    let fileName = file.name.split('.')
    let extention = fileName[fileName.length - 1]

    // Extension allowed

    let allowedExtensions = ['png', 'jpg', 'gif', 'jpeg']

    if (allowedExtensions.indexOf(extention) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Allowed extensions are ' + allowedExtensions.join(', '),
                extention
            }
        })
    }

    // Change filename
    let newFileName = `${id}-${new Date().getMilliseconds()}.${extention}`

    // Use the mv() method to place the file somewhere on your server
    file.mv(`uploads/${type}/${newFileName}`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Assign image to Person or Product
        if (type === 'persons') {
            personImage(id, res, newFileName)
        } else {
            productImage(id, res, newFileName)
        }
    });
})

function personImage(id, res, filename) {
    Person.findById(id, (err, personDB) => {
        if (err) {
            deleteFile(filename, 'persons')
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!personDB) {
            deleteFile(filename, 'persons')
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Person not founded'
                }
            })
        }

        deleteFile(personDB.img, 'persons')


        personDB.img = filename
        personDB.save((err, personSaved) => {
            res.json({
                ok: true,
                person: personSaved,
                img: filename
            })
        })
    })
}

function productImage(id, res, filename) {
    Product.findById(id, (err, productDB) => {
        if (err) {
            deleteFile(filename, 'products')
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!productDB) {
            deleteFile(filename, 'products')
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Person not founded'
                }
            })
        }

        deleteFile(productDB.img, 'products')


        productDB.img = filename
        productDB.save((err, productSaved) => {
            res.json({
                ok: true,
                product: productSaved,
                img: filename
            })
        })
    })
}

function deleteFile(filename, type) {
    // Delete old image

    // Generate path form old image
    let pathImg = path.resolve(__dirname, `../../uploads/${type}/${filename}`)

    // Check if file exists
    if (fs.existsSync(pathImg)) {
        // Delete file
        fs.unlinkSync(pathImg)
    }
}

module.exports = app