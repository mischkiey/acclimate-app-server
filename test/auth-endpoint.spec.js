const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const jwt = require('jsonwebtoken');

describe(`Auth Endpoint`, () => {
    let db;

    const { testUsers, testDisasters, testDisasterPrograms, testDisasterPlanSteps, testUserPrograms } = helpers.makeAllFixtures();

    before(`Make a connection`, () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        });
        app.set('db', db);
    });

    before(`Clean tables before all tests`, () => helpers.truncateAllTables(db));
    afterEach(`Clean tables after each test`, () => helpers.truncateAllTables(db));
    after(`Destroy the connection`, () => db.destroy());

    describe(`POST /login endpoint`, () => {
        beforeEach(`Seed user table before each test`, () => helpers.seedUsersTable(db, testUsers));

        const requiredLoginFields = ['user_name', 'user_password']

        requiredLoginFields.forEach(field => {
            const loginInputs = {
                user_name: testUsers[0].user_name,
                user_password: testUsers[0].user_password,
            };

            delete loginInputs[field]

            it(`POST /api/auth/login responds with 400 and 'Missing ${field} in body' error`, () => {
                return supertest(app)
                    .post('/api/auth/login')
                    .send(loginInputs)
                    .expect(400, {error: `Missing ${field} in body`})
            });
        });

        it(`POST /api/auth/login responds with 401 and 'Invalid username or password' error when invalid user_name`, () => {
            const invalidUserName = {user_name: 'Meow', user_password: testUsers[0].user_password}

            return supertest(app)
                .post('/api/auth/login')
                .send(invalidUserName)
                .expect(401, {error: 'Invalid username or password'})
        });

        it(`POST /api/auth/login responds with 401 and 'Invalid username or password' error when invalid user_password`, () => {
            const invalidUserPassword = {user_name: testUsers[0].user_name, user_password: 'yournotsoamazingpassword'}

            return supertest(app)
                .post('/api/auth/login')
                .send(invalidUserPassword)
                .expect(401, {error: 'Invalid username or password'})
        });

        it(`POST /api/auth/login responds with 200 and token when valid user_name and user_password`, () => {
            const token = jwt.sign(
                { user_id: testUsers[0].user_id },
                process.env.JWT_SECRET,
                {
                    subject: testUsers[0].user_name,
                    algorithm: 'HS256',
                }
            );

            return supertest(app)
                .post('/api/auth/login')
                .send(testUsers[0])
                .expect(200, {authToken: token})
        });
    });
});