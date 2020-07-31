const express = require('express');

const DisasterService = require('./disasters-services');
const { requireAuth } = require('../middleware/jwt-auth');

const DisastersRoute = express.Router();

// Todo: XSS

DisastersRoute
    .route('/')
    .get(requireAuth, (req, res, next) => {
        return DisasterService.getDisasters(req.app.get('db'))
            .then(disasters => {
                return res.json(disasters);
            })
            .catch(next)
    })

DisastersRoute
    .route('/:disasterID')
    .get(requireAuth, (req, res, next) => {
        const disaster_id = req.params.disasterID;
        return DisasterService.getDisasterByID(req.app.get('db'), disaster_id)
            .then(disaster => {
                if(!disaster)
                    return res.status(400).json({error: 'Invalid ID'})

                res.json(disaster);
            })
            .catch(next)
    })

DisastersRoute
    .route('/program/:disasterID')
    .get(requireAuth, async(req, res, next) => {
        const disaster_id = req.params.disasterID;
        try {
            const program = await DisasterService.getDisasterProgramByID(req.app.get('db'), disaster_id);

            if(!program)
                return res.status(400).json({error: 'Invalid ID'})
        
            const steps = await DisasterService.getDisasterPlanStepsByID(req.app.get('db'), program.disaster_program_id)

            const disasterProgram = {
                disaster_id: program.disaster_id,
                disaster_program_id: program.disaster_program_id,
                disaster_program_information: program.disaster_program_information,
                disaster_plan_steps: steps,
            };
            return res.json(disasterProgram)
        } catch(error) {
            next(error)
        };
    });

DisastersRoute
    .route('/user/program')
    .get(requireAuth, async(req, res, next) => {
        try {
            const userProgramsList = await DisasterService.getUserProgramsByUserID(req.app.get('db'), req.user.user_id);

            if(!userProgramsList.length)
                return res.status(200).json([]);

            const userProgramsListDetails = await Promise.all(userProgramsList.map(async userProgram => { 
                const program = await DisasterService.getDisasterProgramByID(req.app.get('db'), userProgram.disaster_program_id);

                const steps = await DisasterService.getDisasterPlanStepsByID(req.app.get('db'), program.disaster_program_id);        
                
                return {
                    disaster_id: program.disaster_id,
                    disaster_program_id: program.disaster_program_id,
                    disaster_program_information: program.disaster_program_information,
                    disaster_plan_steps: steps,
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

            const duplicateProgram = await DisasterService.getUserProgram(req.app.get('db'), req.user.user_id, disaster_program_id)
            
            if(duplicateProgram.length)
                return res.status(400).json({error: 'Program already added'});

            const insertUserProgram = {
                user_id: req.user.user_id,
                disaster_program_id
            };

            const newUserProgram = await DisasterService.insertUserProgram(req.app.get('db'), insertUserProgram);

            if(newUserProgram)
                return res.status(201).json(newUserProgram);
        } catch(error) {
            next(error);
        };
    });

DisastersRoute
    .route('/user/program/:disasterProgramID')
    .delete(requireAuth, async(req, res, next) => {
        const disaster_program_id = req.params.disasterProgramID;

        try {
            const row = await DisasterService.deleteUserProgram(req.app.get('db'), req.user.user_id, disaster_program_id)

            if(row)
                return res.json({});
        
            return res.json({error: 'Program not found and thus not deleted'})
        } catch(error) {
            next(error);
        };
    });

DisastersRoute
    .route('/user/task')
    .get(requireAuth, async(req, res, next) => {
        try {
            const tasks = await DisasterService.getUserTasks(req.app.get('db'), req.user.user_id)

            console.log(tasks)
            if(!tasks)
                return res.json([]);

            return res.json(tasks);
        } catch(error) {
            next(error);
        };
    })
    .post(requireAuth, express.json(), async(req, res, next) => {
        const { user_task_item } = req.body;

        if (!user_task_item.length)
            return res.status(400).json({error: `Missing 'task details' in body`});

        const newUserTask = {
            user_id: req.user.user_id,
            user_task_item
        };

        try {
            const insertedUserTask = await DisasterService.insertUserTask(req.app.get('db'), newUserTask);
            console.log(insertedUserTask)
            return res.status(201).json(insertedUserTask);
        } catch(error) {
            next(error);
        };
    });

DisastersRoute
    .route('/user/task/:userTaskID')
    .patch(requireAuth, express.json(), async(req, res, next) => {
        const newUserTask = req.body;
        newUserTask.user_id = req.user.user_id;

        try {
            const user = await DisasterService.updateUserTask(req.app.get('db'), req.user.user_id, newUserTask);

            console.log(user);
            
            if(!user)
                return res.json({error: 'Task not found and thus not updated'});
        
            return res.json({message: 'Task successfully updated'});
        } catch(error) {
            next(error);
        };
    })
    .delete(requireAuth, async(req, res, next) => {
        const user_task_item_id = req.params.userTaskID;

        try {
            const row = await DisasterService.deleteUserTask(req.app.get('db'), user_task_item_id)
            
            if(!row)
                return res.json({error: 'Task not found and thus not deleted'})
        
            return res.json({});
        } catch(error) {
            next(error);
        };
    });

module.exports = DisastersRoute;

