const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe(`Disasters CRUD Endpoints`, () => {
    let db;

    const { testUsers, testDisasters, testDisasterPrograms, testDisasterPlanSteps, testUserPrograms, testUserTasks, testUserShoppingItems } = helpers.makeAllFixtures();
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

            it(`GET /api/disaster responds with 200 and an empty array`, () => {
                return supertest(app)
                    .get('/api/disaster')
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(200, [])
            });
        });

        context(`Given data in database`, () => {
            beforeEach(`Seed all tables before each test in this context`, () => {
                return helpers.seedAllTables(db, testUsers, testDisasters, testDisasterPrograms, testDisasterPlanSteps, testUserPrograms, testUserTasks, testUserShoppingItems)
            });

            it(`GET /api/disaster responds with 200 and disasters array`, () => {
                return supertest(app)
                    .get('/api/disaster')
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(200, testDisasters)
            });

            it(`GET /api/disaster/program/:disasterID responds with 400 and 'Invalid ID' error when invalid ID`, () => {
                const disasterID = 12345;
                return supertest(app)
                    .get(`/api/disaster/program/${disasterID}`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(400, {error: 'Invalid ID'})
            })

            it(`GET /disaster/program/:disasterID responds with 200 and disaster program with steps`, () => {
                const disasterID = 1;
                const expectedDisasterPlanSteps = testDisasterPlanSteps.filter(step => step.disaster_program_id === disasterID);
                const expectedDisasterProgram = {
                    disaster_id: testDisasterPrograms[0].disaster_id,
                    disaster_program_id: testDisasterPrograms[0].disaster_program_id,
                    disaster_program_information: testDisasterPrograms[0].disaster_program_information,
                    disaster_plan_steps: expectedDisasterPlanSteps,
                };
                return supertest(app)
                    .get(`/api/disaster/program/${disasterID}`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(200, expectedDisasterProgram)
                    .expect(res => {
                    })
            });
        });
    });
});