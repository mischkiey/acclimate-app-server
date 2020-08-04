const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const { expect } = require('chai');

describe.skip(`Users CRUD Endpoint`, () => {
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
    beforeEach(`Seed users table`, () => helpers.seedUsersTable(db, testUsers));
    afterEach(`Clean tables after each test`, () => helpers.truncateAllTables(db));
    after(`Destroy the connection`, () => db.destroy());

    describe(`GET Endpoints`, function() {
        context(`Given data in database`, () => {
            beforeEach(`Seed all tables before each test in this context`, () => {
                return helpers.seedAllTables(db, testUsers, testDisasters, testDisasterPrograms, testDisasterPlanSteps, testUserPrograms, testUserTasks, testUserShoppingItems);
            });

            it(`GET /api/user/program responds with 200 and empty array when user has not selected programs prior`, () => {
                return supertest(app)
                    .get(`/api/user/program`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUsers[5]))
                    .expect(200, []);
            });
            
            it(`GET /api/user/program responds with 200 and all user programs`, () => {
                return supertest(app)
                    .get(`/api/user/program`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(200)
            });   
            
            it(`GET /api/user/task responds with 200 and all user tasks`, () => {
                return supertest(app)
                    .get(`/api/user/task`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(200);
            });

            it(`GET /api/user/shopping responds with 200 and all user shopping items`, () => {
                return supertest(app)
                    .get(`/api/user/shopping`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(200);
            });
        });
    });

    describe(`POST Endpoints`, function() {
        this.retries(3);

        context(`New/Signup User Validation`, () => {
            const requiredFields = ['user_name', 'user_password', 'user_full_name'];

            requiredFields.forEach(field => {
                const signUpInputs = {
                    user_name: 'Miki',
                    user_password: '!!!AAaa00',
                    user_full_name: 'Michelle Colacion Francisco'
                };

                delete signUpInputs[field];

                it(`POST /api/user responds with 400 and 'Missing '${field}' in body' error`, () => {
                    return supertest(app)
                        .post('/api/user')
                        .send(signUpInputs)
                        .expect(400, {error: `Missing '${field}' in body`})
                });
            });

            it(`POST /api/user responds with 400 and 'Password must be longer than 8 characters' error`, () => {
                const shortUserPassword = {
                    user_name: 'Miki',
                    user_password: '!!AAaa00',
                    user_full_name: 'Michelle Colacion Francisco'
                };

                return supertest(app)
                    .post('/api/user')
                    .send(shortUserPassword)
                    .expect(400, {error: 'Password must be longer than 8 characters'})
            });

            it(`POST /api/user responds with 400 and 'Password must be shorter than 72 characters' error`, () => {
                const longUserPassword = {
                    user_name: 'Miki',
                    user_password: '!'.repeat(73),
                    user_full_name: 'Michelle Colacion Francisco'
                };

                return supertest(app)
                    .post('/api/user')
                    .send(longUserPassword)
                    .expect(400, {error: 'Password must be shorter than 72 characters'})
            });

            it(`POST /api/user responds with 400 and 'Password must must not start or end with spaces' error when password starts with spaces`, () => {
                const ambiguousUserPassword = {
                    user_name: 'Miki',
                    user_password: ' !!!AAaa00',
                    user_full_name: 'Michelle Colacion Francisco'
                };

                return supertest(app)
                    .post('/api/user')
                    .send(ambiguousUserPassword)
                    .expect(400, {error: 'Password must must not start or end with spaces'})
            });

            it(`POST /api/user responds with 400 and 'Password must must not start or end with spaces' error when password ends with spaces`, () => {
                const ambiguousUserPassword = {
                    user_name: 'Miki',
                    user_password: '!!!AAaa00 ',
                    user_full_name: 'Michelle Colacion Francisco'
                };

                return supertest(app)
                    .post('/api/user')
                    .send(ambiguousUserPassword)
                    .expect(400, {error: 'Password must must not start or end with spaces'})
            });

            it(`POST /api/user responds with 400 and 'Password must contain 1 upper case, 1 lower case, 1 number, and 1 special character' error`, () => {
                const weakUserPassword = {
                    user_name: 'Miki',
                    user_password: '*********',
                    user_full_name: 'Michelle Colacion Francisco'
                };

                return supertest(app)
                    .post('/api/user')
                    .send(weakUserPassword)
                    .expect(400, {error: 'Password must contain 1 upper case, 1 lower case, 1 number, and 1 special character'})
            });

            it(`POST /api/user responds with 400 and 'Username not available' error when duplicate user_name`, () => {
                const duplicateUserName = {
                    user_name: testUser.user_name,
                    user_password: '!!!AAaa00',
                    user_full_name: 'Michelle Colacion Francisco'
                };

                return supertest(app)
                    .post('/api/user')
                    .send(duplicateUserName)
                    .expect(400, {error: 'Username not available'})
            });

            it(`POST /api/user responds with 201 and new user object`, () => {
                const validSignUpInputs = {
                    user_name: 'Miki',
                    user_password: '!!!AAaa00',
                    user_full_name: 'Michelle Colacion Francisco'
                };

                return supertest(app)
                    .post('/api/user')
                    .send(validSignUpInputs)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.user_name).to.eql(validSignUpInputs.user_name);
                        expect(res.body.user_full_name).to.eql(validSignUpInputs.user_full_name);
                        expect(res.body.user_id).to.exist;
                        const actualDate = new Date(res.body.user_date_created).toLocaleString();
                        const expectedDate = new Date().toLocaleString();
                        expect(actualDate).to.eql(expectedDate);
                        expect(res.headers.location).to.equal(`/api/user/${res.body.user_id}`);
                    })
            });
        });
    });
});