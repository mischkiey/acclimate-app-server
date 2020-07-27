const express = require('express');

const DisastersRoute = express.Router();
const jsonParser = express.json();

const DisastersServices = require('./disasters-services');

// Todo: XSS/

DisastersRoute
    .route('/')
    .get((req, res, next) => {
        return DisastersServices.getDisasters(req.app.get('db'))
            .then(disasters => {
                return res.json(disasters);
            })
            .catch(next)
    })

module.exports = DisastersRoute;