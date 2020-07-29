const express = require('express');

const DisastersRoute = express.Router();

const DisastersService = require('./disasters-services');
const { requireAuth } = require('../middleware/jwt-auth');

// Todo: XSS/

DisastersRoute
    .route('/')
    .get(requireAuth, (req, res, next) => {
        return DisastersService.getDisasters(req.app.get('db'))
            .then(disasters => {
                return res.json(disasters);
            })
            .catch(next)
    })

DisastersRoute
    .route('/:disasterID')
    .get(requireAuth, (req, res, next) => {
        const disaster_id = req.params.disasterID;
        return DisastersService.getDisasterByID(req.app.get('db'), disaster_id)
            .then(disaster => {
                if(!disaster)
                    return res.status(400).json({error: 'Invalid ID'})

                res.json(disaster);
            })
            .catch(next)
    })

DisastersRoute
    .route('/program/:disasterID')
    .get(requireAuth, (req, res, next) => {
        const disaster_id = req.params.disasterID;
        return DisastersService.getDisasterProgramByID(req.app.get('db'), disaster_id)
            .then(program => {
                if(!program)
                    return res.status(400).json({error: 'Invalid ID'})

                return DisastersService.getDisasterPlanStepsByID(req.app.get('db'), program.disaster_program_id)
                    .then(steps => {
                        // if(!steps.length)
                        //     return res.status(400).json({error: 'No program details found'})

                        const disasterProgram = {
                            disaster_id: program.disaster_id,
                            disaster_program_id: program.disaster_program_id,
                            disaster_program_information: program.disaster_program_information,
                            disaster_plan_steps: steps,
                        };
                        return res.json(disasterProgram)
                    })
                    .catch(next)
            })
            .catch(next)
    })

DisastersRoute
    .route('/user/program')
    .get(requireAuth, (req, res, next) => {
        return DisastersService.getUserPrograms(req.app.get('db'), req.user.user_id)
            .then(async userProgramList => {
                if(!userProgramList.length)
                    return res.status(400).json({error: 'No user programs found'})
                
                const userProgramListDetails = await Promise.all(userProgramList.map(async userProgram => {
                    
                    const program = await DisastersService.getDisasterProgramByID(req.app.get('db'), userProgram.disaster_program_id)

                    const steps = await DisastersService.getDisasterPlanStepsByID(req.app.get('db'), program.disaster_program_id)        
                    
                    return {
                        disaster_id: program.disaster_id,
                        disaster_program_id: program.disaster_program_id,
                        disaster_program_information: program.disaster_program_information,
                        disaster_plan_steps: steps,
                    };

                }))
                
                console.log(userProgramListDetails, 'Boo!')
                return res.json(userProgramListDetails)
            })
            .catch(next)
    })

module.exports = DisastersRoute;