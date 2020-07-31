const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.skip(`Unused Disasters CRUD Endpoints`, () => {
    let db;

    const { testUsers, testDisasters, testDisasterPrograms, testDisasterPlanSteps, testUserPrograms, testUserTaskItems, testUserShoppingItems } = helpers.makeAllFixtures();
    const testUser = testUsers[0];

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

    describe(`GET Endpoints`, () => {
        context(`Given no data in database`, () => {
            beforeEach(`Seed user table before each test in this context`, () => helpers.seedUsersTable(db, testUsers));

            it(`GET /api/disaster/:disasterID responds with 400 and 'Invalid ID' error`, () => {
                const disasterID = 12345;
                return supertest(app)
                    .get(`/api/disaster/${disasterID}`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(400, {error: 'Invalid ID'})
            });
        });

        context(`Given data in database`, () => {
            beforeEach(`Seed all tables before each test in this context`, () => {
                return helpers.seedAllTables(db, testUsers, testDisasters, testDisasterPrograms, testDisasterPlanSteps, testUserPrograms)
            });

            it(`GET /api/disaster/:disasterID responds with 400 and 'Invalid ID' error when invalid ID`, () => {
                const disasterID = 12345;
                return supertest(app)
                    .get(`/api/disaster/${disasterID}`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(400, {error: 'Invalid ID'})
            });

            it(`GET /api/disaster/:disasterID responds with 200 and disaster`, () => {
                const disasterID = 1;
                return supertest(app)
                    .get(`/api/disaster/${disasterID}`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(200, testDisasters[0])
            });
        });
    });
});