const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe(`Protected Endpoints`, () => {
    let db;

    const testUsers = helpers.makeUserFixture();
    const testUser = testUsers[0];

    before(`Make a connection`, () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        });
        app.set('db', db);
    });

    before(`Clean tables before all tests`, () => helpers.truncateAllTables(db));
    beforeEach(`Seed user table before each test`, () => helpers.seedUsersTable(db, testUsers));
    afterEach(`Clean tables after each test`, () => helpers.truncateAllTables(db));
    after(`Destroy the connection`, () => db.destroy());

    describe(`Protected GET Endpoints`, () => {
        it(`GET /api/disaster responds with 401 and 'Missing bearer token' error when no token`, () => {
            return supertest(app)
                .get('/api/disaster')
                .expect(401, {error: 'Missing bearer token'})
        });

        it(`GET /api/disaster responds with 401 and 'Unauthorized' error when invalid user_name`, () => {
            const invalidUserName = {user_id: 1, user_name: 'Meow'}

            return supertest(app)
                .get('/api/disaster')
                .set('Authorization', helpers.makeJWTAuthHeader(invalidUserName))
                .expect(401, {error: 'Unauthorized'})
        });

        it(`GET /api/disaster responds with 401 and 'Unauthorized' error when invalid secret/token`, () => {
            return supertest(app)
                .get('/api/disaster')
                .set('Authorization', helpers.makeJWTAuthHeader(testUser, 'minh-meow'))
                .expect(401, {error: 'Unauthorized'})
        });
    });

});