const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const supertest = require('supertest');

describe(`Disasters Endpoints`, () => {
    let db;

    const { testUsers, testDisasters, testDisasterPrograms, testDisasterPlanSteps, testUserPrograms } = helpers.makeAllFixtures();
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
            beforeEach(`Seed user table before each test in this context`, () => helpers.seedUsersTable(db, testUsers))

            it(`GET /api/disaster responds with 200 and an empty array`, () => {
                return supertest(app)
                    .get('/api/disaster')
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(200, [])
            });

            it(`GET /api/disaster/:disasterID responds with 400 and 'Invalid ID' error`, () => {
                const disasterID = 12345;
                return supertest(app)
                    .get(`/api/disaster/${disasterID}`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(400, {error: 'Invalid ID'})
            });
        });

        context(`Given data in database`, () => {
            // Return promise object from async function to 'block' the rest of the code
            // Without returning promise object, JS ran the code following the async
            // The test captured this behavior when it reported the actual result to be an empty array
            beforeEach(`Seed all tables before each test in context`, () => {
                return helpers.seedAllTables(db, testUsers, testDisasters, testDisasterPrograms, testDisasterPlanSteps, testUserPrograms)
            })

            it(`GET /api/disaster responds with 200 and disasters array`, () => {
                return supertest(app)
                    .get('/api/disaster')
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(200, testDisasters)
            });

            it(`GET /api/disaster/:disasterID responds with 400 and 'Invalid ID' error`, () => {
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

            it(`GET /api/disaster/program/:disasterID responds with 400 and 'Invalid ID' error`, () => {
                const disasterID = 12345;
                return supertest(app)
                    .get(`/api/disaster/program/${disasterID}`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(400, {error: 'Invalid ID'})
            })

            it(`GET /disaster/program/:disasterID responds with 200 and disaster program with steps`, () => {
                const disasterID = 1;
                const expectedDisasterPlan = testDisasterPlanSteps.filter(step => step.disaster_program_id === disasterID);
                const expectedDisasterProgram = {
                    disaster_id: testDisasterPrograms[0].disaster_id,
                    disaster_program_id: testDisasterPrograms[0].disaster_program_id,
                    disaster_program_information: testDisasterPrograms[0].disaster_program_information,
                    disaster_plan_steps: expectedDisasterPlan,
                }
                return supertest(app)
                    .get(`/api/disaster/program/${disasterID}`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(200, expectedDisasterProgram)
            });

            it(`GET /api/disaster/user/program responds with 400 and 'No user programs found' error`, () => {
                return supertest(app)
                    .get(`/api/disaster/user/program`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUsers[5]))
                    .expect(400, {error: 'No user programs found'})
            })
            
            it(`GET /api/disaster/user/program responds with 200 and all user-selected programs`, () => {

                return supertest(app)
                    .get(`/api/disaster/user/program`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(200)
            });

            // it(`GET /disaster/user/:disasterProgramID responds with 200 and user-selected program`, () => {
            //     const disasterProgramID = 1 //disaster_program_id
                 
            // });
            
        });

    });
});