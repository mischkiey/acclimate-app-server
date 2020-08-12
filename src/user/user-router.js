const express = require('express');
const path = require('path')
const xss = require('xss');

const UserService = require('./user-services');
const DisasterService = require('../disasters/disasters-services')
const { requireAuth } = require('../middleware/jwt-auth');

const UserRoute = express.Router();

UserRoute
    .route('/')
    .post(express.json(), (req, res, next) => {
        const {user_name, user_password } = req.body;

        for(const field of ['user_name', 'user_password', 'user_full_name'])
            if(!req.body[field])
                return res.status(400).json({error: `Missing '${field}' in body`})

        const passwordError = UserService.validateUserPassword(user_password);

        if(passwordError)
            return res.status(400).json({error: passwordError})
        
        return UserService.hasUserWithUserName(req.app.get('db'), user_name)
            .then(hasUserWithUserName => {
                if(hasUserWithUserName) {
                    return res.status(400).json({error: 'Username not available'})
                }

                return UserService.hashUserPassword(user_password)
                    .then(hashedUserPassword => {

                        const newUser = {
                            ...req.body,
                            user_password: hashedUserPassword,
                        }
        
                        return UserService.insertUser(req.app.get('db'), newUser)
                            .then(user => {
                                return res
                                .status(201)
                                .location(path.posix.join(req.originalUrl, `/${user.user_id}`))
                                .json(UserService.serializeUser(user))
                            })
                            .catch(next)
                    })
            })
            .catch(next)
    });

UserRoute
    .route('/program')
    .get(requireAuth, async(req, res, next) => {
        try {
            const userProgramsList = await UserService.getUserProgramsByID(req.app.get('db'), {user_id: req.user.user_id});

            if(!userProgramsList.length)
                return res.status(200).json([]);

            const userProgramsListDetails = await Promise.all(userProgramsList.map(async userProgram => { 
                const program = await DisasterService.getDisasterProgramByID(req.app.get('db'), userProgram.disaster_program_id);

                const { disaster_name } = await DisasterService.getDisasterByID(req.app.get('db'), program.disaster_id);

                const steps = await DisasterService.getDisasterPlanStepsByID(req.app.get('db'), program.disaster_program_id);
                
                const sanitizedSteps = steps.map(step => ({
                    disaster_plan_step_id: step.disaster_plan_step_id,
                    disaster_plan_step: xss(step.disaster_plan_step),
                    disaster_plan_step_stage: xss(step.disaster_plan_step_stage),
                    disaster_plan_step_itemable_type: xss(step.disaster_plan_step_itemable_type),
                    disaster_plan_step_itemable_shorthand: xss(step.disaster_plan_step_itemable_shorthand),
                }));

                
                return {
                    disaster_id: program.disaster_id,
                    disaster_name: xss(disaster_name),
                    disaster_program_id: program.disaster_program_id,
                    disaster_program_information: xss(program.disaster_program_information),
                    disaster_plan_steps: sanitizedSteps,
                };
            }));
            return res.json(userProgramsListDetails);
        } catch(error) {
            next(error);
        };
    })
    .post(requireAuth, express.json(), async(req, res, next) => {
        const disaster_program_id = Number(req.body.disaster_program_id);
        try {
            if(disaster_program_id === 0)
                return res.status(400).json({error: 'No program selected'});

            const program = await DisasterService.getDisasterProgramByID(req.app.get('db'), disaster_program_id);

            if(!program)
                return res.status(400).json({error: 'No program found'});

            const duplicateProgram = await UserService.getUserProgram(req.app.get('db'), req.user.user_id, disaster_program_id)
            
            if(duplicateProgram.length)
                return res.status(400).json({error: 'Program already added'});

            const insertUserProgram = {
                user_id: req.user.user_id,
                disaster_program_id
            };

            const newUserProgram = await UserService.insertUserProgram(req.app.get('db'), insertUserProgram);

            if(newUserProgram)
                return res.status(201).json(newUserProgram);
        } catch(error) {
            next(error);
        };
    });

UserRoute
    .route('/program/:disasterProgramID')
    .delete(requireAuth, async(req, res, next) => {
        const disaster_program_id = req.params.disasterProgramID;

        try {
            const row = await UserService.deleteUserProgram(req.app.get('db'), req.user.user_id, disaster_program_id)

            if(row)
                return res.json({});
        
            return res.json({error: 'Program not found and thus not deleted'})
        } catch(error) {
            next(error);
        };
    });

UserRoute
    .route('/task')
    .get(requireAuth, async(req, res, next) => {
        try {
            const tasks = await UserService.getUserTasks(req.app.get('db'), req.user.user_id)

            if(!tasks)
                return res.json([]);

            return res.json(tasks);
        } catch(error) {
            next(error);
        };
    })
    .post(requireAuth, express.json(), async(req, res, next) => {
        const newUserTasks = req.body

        // Maybe have a mixin service object
        for(let i = 0; i < newUserTasks.length; i++ ) {
            newUserTasks[i].user_id = req.user.user_id;
        };
        
        const invalidUserTasks = newUserTasks.filter(task => !task.user_task.length);

        if(invalidUserTasks.length) {
            return res.status(400).json({error: `Missing 'task details' in body`});
        };

        try {
            const insertedUserTasks = await UserService.insertUserTask(req.app.get('db'), newUserTasks);

            return res.status(201).json(insertedUserTasks);
        } catch(error) {
            next(error);
        };
    });

UserRoute
    .route('/task/:userTaskID')
    .patch(requireAuth, express.json(), async(req, res, next) => {
        const newUserTask = {
            user_task_id: req.body.user_task_id,
            user_task: req.body.user_task,
            user_task_completed: req.body.user_task_completed,
            user_id: req.user.user_id,
        };

        try {
            const row = await UserService.updateUserTask(req.app.get('db'), req.body.user_task_id, newUserTask);
            
            if(!row)
                return res.json({error: 'Task not found and thus not updated'});
        
            return res.json({message: 'Task successfully updated'});
        } catch(error) {
            next(error);
        };
    })
    .delete(requireAuth, async(req, res, next) => {
        const user_task_id = req.params.userTaskID;

        try {
            const row = await UserService.deleteUserTask(req.app.get('db'), user_task_id)
            
            if(!row)
                return res.json({error: 'Task not found and thus not deleted'})
        
            return res.json({});
        } catch(error) {
            next(error);
        };
    });

UserRoute
    .route('/shopping')
    .get(requireAuth, async(req, res, next) => {
        try {
            const items = await UserService.getUserShoppingItems(req.app.get('db'), req.user.user_id)

            if(!items)
                return res.json([]);

            return res.json(items);
        } catch(error) {
            next(error);
        };
    })
    .post(requireAuth, express.json(), async(req, res, next) => {
        const newUserShoppingItems = req.body;

        for(let i = 0; i < newUserShoppingItems.length; i++ ) {
            newUserShoppingItems[i].user_id = req.user.user_id;
        };

        const invalidUserShoppingItems = newUserShoppingItems.filter(shoppingItem => !shoppingItem.user_shopping_item.length);

        if(invalidUserShoppingItems.length) {
            return res.status(400).json({error: `Missing 'shopping item details' in body`});
        };

        try {
            const insertedUserShoppingItems = await UserService.insertUserShoppingItem(req.app.get('db'), newUserShoppingItems);

            return res.status(201).json(insertedUserShoppingItems);
        } catch(error) {
            next(error);
        };
    });

UserRoute
    .route('/shopping/:userShoppingItemID')
    .patch(requireAuth, express.json(), async(req, res, next) => {
        const newUserShoppingItem = {
            user_shopping_item_id: req.body.user_shopping_item_id,
            user_shopping_item: req.body.user_shopping_item,
            user_shopping_item_completed: req.body.user_shopping_item_completed,
            user_id: req.user.user_id,
        };

        try {
            const row = await UserService.updateUserShoppingItem(req.app.get('db'), req.body.user_shopping_item_id, newUserShoppingItem);
            
            if(!row)
                return res.json({error: 'Shopping not found and thus not updated'});
        
            return res.json({message: 'Shopping successfully updated'});
        } catch(error) {
            next(error);
        };
    })
    .delete(requireAuth, async(req, res, next) => {
        const user_shopping_item_id = req.params.userShoppingItemID;

        try {
            const row = await UserService.deleteUserShoppingItem(req.app.get('db'), user_shopping_item_id)
            
            if(!row)
                return res.json({error: 'Shopping not found and thus not deleted'})
        
            return res.json({});
        } catch(error) {
            next(error);
        };
    });

module.exports = UserRoute;