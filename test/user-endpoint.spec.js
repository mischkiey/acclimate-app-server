const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe(`Users CRUD Endpoint`, () => {
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
        context(`New User/User Signup Validation`, () => {
            beforeEach(`Seed users table`, () => helpers.seedUsersTable(db, testUsers));
            this.retries(3);
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
        
        context(`Add program to user programs`, () => {
            beforeEach(`Seed all tables before each test in context`, () => {
                return helpers.seedAllTables(db, testUsers, testDisasters, testDisasterPrograms, testDisasterPlanSteps, testUserPrograms, testUserTasks, testUserShoppingItems)
            });

            it(`POST /api/user/program responds with 400 and 'No program selected' error when no program selected`, () => {
                const disaster_program_id = '0';
                return supertest(app)
                    .post('/api/user/program')
                    .send({disaster_program_id})
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(400, {error: 'No program selected'})
            });

            it(`POST /api/user/program responds with 400 and 'No program found' error when no program found`, () => {
                const disaster_program_id = '12345';
                return supertest(app)
                    .post('/api/user/program')
                    .send({disaster_program_id})
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(400, {error: 'No program found'})
            });

            it(`POST /api/user/program responds with 201`, () => {
                const disaster_program_id = 4;
                return supertest(app)
                    .post('/api/user/program')
                    .send({disaster_program_id})
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(201)
                    .then(() => {
                        return supertest(app)
                            .get(`/api/user/program`)
                            .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                            .expect(200)
                            .expect(res => {
                                const newUserProgram = res.body.filter(userProgram => userProgram.disaster_program_id === disaster_program_id);
                                expect(newUserProgram).to.exist;
                            });
                    });
            });

            it(`POST /api/user/task responds with 400 and 'Missing 'task details' in body' error`, () => {
                const invalidUserTask = {
                    user_id: testUser.user_id,
                    user_task: '',
                };
                return supertest(app)
                    .post(`/api/user/task`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .send(invalidUserTask)
                    .expect(400, {error: `Missing 'task details' in body`})
            });

            it(`POST /api/user/task responds with 201 and new user task object`, () => {
                const newUserTask = {
                    user_task: 'Minh was here!',
                };
                return supertest(app)
                    .post(`/api/user/task`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .send(newUserTask)
                    .expect(201)
                    .then(res => {
                        expect(res.body.user_id).to.eql(testUser.user_id);
                        expect(res.body.user_task).to.eql(newUserTask.user_task);
                        expect(res.body.user_task_id).to.exist;
                    })
            });

            it(`POST /api/user/shopping responds with 400 and 'Missing 'shopping details' in body' error`, () => {
                const invalidUserShoppingItem = {
                    user_shopping_item: '',
                };
                return supertest(app)
                    .post(`/api/user/shopping`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .send(invalidUserShoppingItem)
                    .expect(400, {error: `Missing 'shopping details' in body`})
            });

            it(`POST /api/user/shopping responds with 201 and new user shopping object`, () => {
                const newUserShoppingItem = {
                    user_shopping_item: 'Minh was here!',
                };
                return supertest(app)
                    .post(`/api/user/shopping`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .send(newUserShoppingItem)
                    .expect(201)
                    .then(res => {
                        expect(res.body.user_id).to.eql(testUser.user_id);
                        expect(res.body.user_shopping_item).to.eql(newUserShoppingItem.user_shopping_item);
                        expect(res.body.user_shopping_item_id).to.exist;
                    });
            });
        });
    });

    describe(`PATCH Endpoints`, () => {
        context(`Update item in user list`, () => {
            beforeEach(`Seed all tables before each test in this context`, () => {
                return helpers.seedAllTables(db, testUsers, testDisasters, testDisasterPrograms, testDisasterPlanSteps, testUserPrograms, testUserTasks, testUserShoppingItems)
            });

            it(`PATCH /api/user/task/:userTaskID responds with 200 and 'Task successfully updated'`, () => {
                const newUserTask = {
                    user_task_id: 1,
                    user_task: 'Minh was here!',
                    user_task_completed: false,
                };
                return supertest(app)
                    .patch(`/api/user/task/${newUserTask.user_task_id}`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .send(newUserTask)
                    .expect(200, {message: 'Task successfully updated'})
                    .then(() => {
                        return supertest(app)
                            .get(`/api/user/task`)
                            .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                            .expect(200)
                            .then(res => {
                                const insertedUserTask = res.body.filter(userTask => userTask.user_task_id === newUserTask.user_task_id);

                                expect(insertedUserTask[0].user_id).to.eql(testUser.user_id);
                                expect(insertedUserTask[0].user_task).to.eql(newUserTask.user_task);
                                expect(insertedUserTask[0].user_task_id).to.eql(newUserTask.user_task_id);
                            });
                    });
            });

            it(`PATCH /api/user/shopping/:userShoppingItemID responds with 200 and 'Shopping successfully updated'`, () => {
                const newUserShoppingItem = {
                    user_shopping_item_id: 1,
                    user_shopping_item: 'Minh was here!',
                    user_shopping_item_completed: false,
                };
                return supertest(app)
                    .patch(`/api/user/shopping/${newUserShoppingItem.user_shopping_item_id}`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .send(newUserShoppingItem)
                    .expect(200, {message: 'Shopping successfully updated'})
                    .then(() => {
                        return supertest(app)
                            .get(`/api/user/shopping`)
                            .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                            .expect(200)
                            .then(res => {
                                const insertedUserShoppingItem = res.body.filter(userShoppingItem => userShoppingItem.user_shopping_item_id === newUserShoppingItem.user_shopping_item_id);

                                expect(insertedUserShoppingItem[0].user_id).to.eql(testUser.user_id);
                                expect(insertedUserShoppingItem[0].user_shopping_item).to.eql(newUserShoppingItem.user_shopping_item);
                                expect(insertedUserShoppingItem[0].user_shopping_item_id).to.eql(newUserShoppingItem.user_shopping_item_id);
                            });
                    });
            });

        });
    });

    describe(`DELETE Endpoints`, () => {
        context(`Remove program from user programs`, () => {
            beforeEach(`Seed all tables before each test in this context`, () => {
                return helpers.seedAllTables(db, testUsers, testDisasters, testDisasterPrograms, testDisasterPlanSteps, testUserPrograms, testUserTasks, testUserShoppingItems)
            });
            
            it(`DELETE /api/user/:disasterProgramID responds with 200`, () => {
                const disasterProgramID = 1;
                return supertest(app)
                    .delete(`/api/user/program/${disasterProgramID}`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(200)
                    .then(() => {
                        return supertest(app)
                            .get(`/api/user/program`)
                            .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                            .expect(200)
                            .expect(res => {
                                const deletedUserProgram = res.body.filter(userProgram => userProgram.user_id === testUser.user_id).filter(userProgram => userProgram.disaster_program_id === disasterProgramID);
                                
                                expect(deletedUserProgram).to.be.empty;
                            })
                    })
            });
        });

        context(`Remove item from user list`, () => {
            beforeEach(`Seed all tables before each test in this context`, () => {
                return helpers.seedAllTables(db, testUsers, testDisasters, testDisasterPrograms, testDisasterPlanSteps, testUserPrograms, testUserTasks, testUserShoppingItems)
            });

            it(`DELETE /api/user/task/:userTaskID responds with 200`, () => {
                const userTaskID = 1;
                return supertest(app)
                    .delete(`/api/user/task/${userTaskID}`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(200)
                    .then(() => {
                        return supertest(app)
                            .get(`/api/user/task`)
                            .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                            .expect(200)
                            .expect(res => {
                                const deletedUserTask = res.body.filter(userTask => userTask.user_task_id === userTaskID)
                           
                                expect(deletedUserTask).to.be.empty;
                            });
                    });
            });
            
            it(`DELETE /api/user/shopping/:userShoppingItemID responds with 200`, () => {
                const userShoppingItemID = 1;
                return supertest(app)
                    .delete(`/api/user/shopping/${userShoppingItemID}`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(200)
                    .then(() => {
                        return supertest(app)
                            .get(`/api/user/shopping`)
                            .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                            .expect(200)
                            .expect(res => {
                                const deletedUserShoppingItem = res.body.filter(userShoppingItem => userShoppingItem.user_shopping_item_id === userShoppingItemID)
                           
                                expect(deletedUserShoppingItem).to.be.empty;
                            });
                    });
            });
        });
    });
});