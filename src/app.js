require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

const { NODE_ENV } = require('./config');
const DisastersRoute = require('./disasters/disasters-router');

const app = express();

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use('/api/disaster', DisastersRoute);

// Change error format?
app.use(function errorHandler(error, req, res, next) { 
    let response;
    if (NODE_ENV === 'production') {
        // Overwrite error object with custom message
        response = { error: { message: 'Internal server error' } };
    } else {
        // Print error and send res.message = error.message, error
        // What can be deduced: error is an object with a message property
        // Pay attention to how error looks like
        console.log(error);
        response = { message: error.message, error }
    };
    res.status(500).json(response);
});

module.exports = app;