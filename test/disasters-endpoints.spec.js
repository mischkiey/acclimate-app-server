const express = require('express');
const knex = require('knex');

const app = require('..src/app');
const { DATABASE_URL } = require('../src/config');
const helpers = require('./test-helpers');

// Create a function to clean all tables

describe(`Disasters Endpoints`, () => {
    let db;

    before('Make a connection', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        });
        app.set('db', db);
    });

    before('Clean tables before all tests', () => db('acclimate_disasters').truncate());
    afterEach('Clean tables after each test', () => db('acclimate_disasters').truncate());
    after('Destroy the connection', () => db.destroy());

    

});