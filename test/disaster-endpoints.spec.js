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

            it(`GET /api/disaster/user/program responds with 200 and empty array when user has not selected programs prior`, () => {
                return supertest(app)
                    .get(`/api/disaster/user/program`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUsers[5]))
                    .expect(200, [])
            });
            
            it(`GET /api/disaster/user/program responds with 200 and all user programs`, () => {
                return supertest(app)
                    .get(`/api/disaster/user/program`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(200)
            });   
            
            it(`GET /api/disaster/user/task responds with 200 and all user tasks`, () => {
                return supertest(app)
                    .get(`/api/disaster/user/task`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(200)
            });

            it(`GET /api/disaster/user/shopping responds with 200 and all user shopping items`, () => {
                return supertest(app)
                    .get(`/api/disaster/user/shopping`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(200)
            });
        });
    });

    describe(`POST Endpoints`, () => {
        context(`Add program to user programs`, () => {
            beforeEach(`Seed all tables before each test in context`, () => {
                return helpers.seedAllTables(db, testUsers, testDisasters, testDisasterPrograms, testDisasterPlanSteps, testUserPrograms, testUserTasks, testUserShoppingItems)
            });

            it(`POST /api/disaster/user/program responds with 400 and 'No program selected' error when no program selected`, () => {
                const disaster_program_id = '0';
                return supertest(app)
                    .post('/api/disaster/user/program')
                    .send({disaster_program_id})
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(400, {error: 'No program selected'})
            });

            it(`POST /api/disaster/user/program responds with 400 and 'No program found' error when no program found`, () => {
                const disaster_program_id = '12345';
                return supertest(app)
                    .post('/api/disaster/user/program')
                    .send({disaster_program_id})
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(400, {error: 'No program found'})
            });

            it(`POST /api/disaster/user/program responds with 201`, () => {
                const disaster_program_id = 4;
                return supertest(app)
                    .post('/api/disaster/user/program')
                    .send({disaster_program_id})
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(201)
                    .then(() => {
                        return supertest(app)
                            .get(`/api/disaster/user/program`)
                            .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                            .expect(200)
                            .expect(res => {
                                const newUserProgram = res.body.filter(userProgram => userProgram.disaster_program_id === disaster_program_id);
                                expect(newUserProgram).to.exist;
                            });
                    });
            });

            it(`POST /api/disaster/user/task responds with 400 and 'Missing 'task details' in body' error`, () => {
                const invalidUserTask = {
                    user_id: testUser.user_id,
                    user_task: '',
                };
                return supertest(app)
                    .post(`/api/disaster/user/task`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .send(invalidUserTask)
                    .expect(400, {error: `Missing 'task details' in body`})
            });

            it(`POST /api/disaster/user/task responds with 201 and new user task object`, () => {
                const newUserTask = {
                    user_task: 'Minh was here!',
                };
                return supertest(app)
                    .post(`/api/disaster/user/task`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .send(newUserTask)
                    .expect(201)
                    .then(res => {
                        expect(res.body.user_id).to.eql(testUser.user_id);
                        expect(res.body.user_task).to.eql(newUserTask.user_task);
                        expect(res.body.user_task_id).to.exist;
                    })
            });

            it(`POST /api/disaster/user/shopping responds with 400 and 'Missing 'shopping details' in body' error`, () => {
                const invalidUserShoppingItem = {
                    user_id: testUser.user_id,
                    user_shopping_item: '',
                };
                return supertest(app)
                    .post(`/api/disaster/user/shopping`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .send(invalidUserShoppingItem)
                    .expect(400, {error: `Missing 'shopping details' in body`})
            });

            it(`POST /api/disaster/user/shopping responds with 201 and new user shopping object`, () => {
                const newUserShoppingItem = {
                    user_shopping_item: 'Minh was here!',
                };
                return supertest(app)
                    .post(`/api/disaster/user/shopping`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .send(newUserShoppingItem)
                    .expect(201)
                    .then(res => {
                        expect(res.body.user_id).to.eql(testUser.user_id);
                        expect(res.body.user_shopping_item).to.eql(newUserShoppingItem.user_shopping_item);
                        expect(res.body.user_shopping_item_id).to.exist;
                    })
            });
        });
    });

    describe(`PATCH Endpoints`, () => {
        context(`Update item in user list`, () => {
            beforeEach(`Seed all tables before each test in this context`, () => {
                return helpers.seedAllTables(db, testUsers, testDisasters, testDisasterPrograms, testDisasterPlanSteps, testUserPrograms, testUserTasks, testUserShoppingItems)
            });

            it(`PATCH /api/disaster/user/task/:userTaskID responds with 200 and 'Task successfully updated'`, () => {
                const newUserTask = {
                    user_task_id: 1,
                    user_task: 'Minh was here!',
                };
                return supertest(app)
                    .patch(`/api/disaster/user/task/${newUserTask.user_task_id}`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .send(newUserTask)
                    .expect(200, {message: 'Task successfully updated'})
                    .then(() => {
                        return supertest(app)
                            .get(`/api/disaster/user/task`)
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

            it(`PATCH /api/disaster/user/shopping/:userShoppingItemID responds with 200 and 'Shopping successfully updated'`, () => {
                const newUserShoppingItem = {
                    user_shopping_item_id: 1,
                    user_shopping_item: 'Minh was here!',
                };
                return supertest(app)
                    .patch(`/api/disaster/user/shopping/${newUserShoppingItem.user_shopping_item_id}`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .send(newUserShoppingItem)
                    .expect(200, {message: 'Shopping successfully updated'})
                    .then(() => {
                        return supertest(app)
                            .get(`/api/disaster/user/shopping`)
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
            
            it(`DELETE /api/disaster/user/:disasterProgramID responds with 200`, () => {
                const disasterProgramID = 1;
                return supertest(app)
                    .delete(`/api/disaster/user/program/${disasterProgramID}`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(200)
                    .then(() => {
                        return supertest(app)
                            .get(`/api/disaster/user/program`)
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

            it(`DELETE /api/disaster/user/task/:userTaskID responds with 200`, () => {
                const userTaskID = 1;
                return supertest(app)
                    .delete(`/api/disaster/user/task/${userTaskID}`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(200)
                    .then(() => {
                        return supertest(app)
                            .get(`/api/disaster/user/task`)
                            .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                            .expect(200)
                            .expect(res => {
                                const deletedUserTask = res.body.filter(userTask => userTask.user_task_id === userTaskID)
                           
                                expect(deletedUserTask).to.be.empty;
                            });
                    });
            });
            
            it(`DELETE /api/disaster/user/shopping/:userShoppingItemID responds with 200`, () => {
                const userShoppingItemID = 1;
                return supertest(app)
                    .delete(`/api/disaster/user/shopping/${userShoppingItemID}`)
                    .set('Authorization', helpers.makeJWTAuthHeader(testUser))
                    .expect(200)
                    .then(() => {
                        return supertest(app)
                            .get(`/api/disaster/user/shopping`)
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