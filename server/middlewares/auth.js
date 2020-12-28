const jwt = require('jsonwebtoken')

// =================================
// Verify token
// =================================

let checkToken = (req, res, next) => {
    let token = req.get('token')

    jwt.verify(token, process.env.TOKEN_SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token not valid'
                }
            })
        }

        req.person = decoded.person;
        next();
    })
}


// =================================
// Verify token for img
// =================================
let checkTokenImg = (req, res, next) => {
    let token = req.query.token

    jwt.verify(token, process.env.TOKEN_SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token not valid'
                }
            })
        }

        req.person = decoded.person;
        next();
    })
}


// =================================
// Verify admin role
// =================================

let checkAdminRole = (req, res, next) => {
    let person = req.person
    if (person.role === 'ADMIN_ROLE') {
        next()
    } else {
        return res.json({
            ok: false,
            err: {
                message: 'User is not admin'
            }
        })
    }
}


module.exports = {
    checkToken,
    checkAdminRole,
    checkTokenImg
}