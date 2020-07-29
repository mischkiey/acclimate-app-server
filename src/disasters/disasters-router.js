const express = require('express');

const DisastersRoute = express.Router();

const DisastersServices = require('./disasters-services');
const { requireAuth } = require('../middleware/jwt-auth');

// Todo: XSS/

DisastersRoute
    .route('/')
    .get(requireAuth, (req, res, next) => {
        return DisastersServices.getDisasters(req.app.get('db'))
            .then(disasters => {
                return res.json(disasters);
            })
            .catch(next)
    })

DisastersRoute
    .route('/:disasterID')
    .get(requireAuth, (req, res, next) => {
        const disaster_id = req.params.disasterID;
        return DisastersServices.getDisasterByID(req.app.get('db'), disaster_id)
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
        return DisastersServices.getDisasterProgramByID(req.app.get('db'), disaster_id)
            .then(program => {
                if(!program)
                    return res.status(400).json({error: 'Invalid ID'})

                return DisastersServices.getDisasterPlanStepsByID(req.app.get('db'), program.disaster_program_id)
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
        return DisastersServices.getUserPrograms(req.app.get('db'), req.user.user_id)
            .then(async userProgramList => {
                if(!userProgramList.length)
                    return res.status(400).json({error: 'No user programs found'})
                
                const userProgramListDetails = await Promise.all(userProgramList.map(async userProgram => {
                    
                    const program = await DisastersServices.getDisasterProgramByID(req.app.get('db'), userProgram.disaster_program_id)

                    const steps = await DisastersServices.getDisasterPlanStepsByID(req.app.get('db'), program.disaster_program_id)        
                    
                    return {
                        disaster_id: program.disaster_id,
                        disaster_program_id: program.disaster_program_id,
                        disaster_program_information: program.disaster_program_information,
                        disaster_plan_steps: steps,
                    };

                }))
                
                console.log(userProgramListDetails, 'BOO');
                return res.json(userProgramListDetails)
            })
            .catch(next)
    })

module.exports = DisastersRoute;