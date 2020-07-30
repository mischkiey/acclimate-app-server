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
            const userProgramList = await DisasterService.getUserProgramsByUserID(req.app.get('db'), req.user.user_id);

            if(!userProgramList.length)
                return res.status(400).json({error: 'No user programs found'});

            const userProgramListDetails = await Promise.all(userProgramList.map(async userProgram => { 
                const program = await DisasterService.getDisasterProgramByID(req.app.get('db'), userProgram.disaster_program_id);

                const steps = await DisasterService.getDisasterPlanStepsByID(req.app.get('db'), program.disaster_program_id);        
                
                return {
                    disaster_id: program.disaster_id,
                    disaster_program_id: program.disaster_program_id,
                    disaster_program_information: program.disaster_program_information,
                    disaster_plan_steps: steps,
                };
            }));
            return res.json(userProgramListDetails);
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

            const duplicateProgram = await DisasterService.findUserProgram(req.app.get('db'), req.user.user_id, disaster_program_id)
            
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

module.exports = DisastersRoute;

