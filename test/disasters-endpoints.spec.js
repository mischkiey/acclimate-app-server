const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const { makeAllFixtures } = require('./test-helpers');

describe('Disasters Endpoints', () => {
    let db;

    const { testUsers, testDisasters, testDisasterPrograms, testDisasterPlanSteps, testUserPrograms } = makeAllFixtures();

    before('Make a connection', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        });
        app.set('db', db);
    });

    before('Clean tables before all tests', () => helpers.truncateAllTables(db));
    afterEach('Clean tables after each test', () => helpers.truncateAllTables(db));
    after('Destroy the connection', () => db.destroy());

    describe('GET Endpoints', () => {
        context('Given no data in database', () => {
            it('GET /disaster responds with 200 and an empty array', () => {
                return supertest(app)
                    .get('/disaster')
                    .expect(200, [])
            });
        });
    });
});