const express = require('express');

const DisastersRoute = express.Router();
const jsonParser = express.json();

const DisastersServices = require('./disasters-services');

// Todo: XSS/

DisastersRoute
    .route('/')
    .get((req, res, next) => {
        return DisastersServices.getDisasters(req.app.get('db'))
            .then(disasters => {
                return res.json(disasters);
            })
            .catch(next)
    })

DisastersRoute
    .route('/:disasterID')
    .get((req, res, next) => {
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
    .get((req, res, next) => {
        const disaster_id = req.params.disasterID;
        return DisastersServices.getDisasterProgramByID(req.app.get('db'), disaster_id)
            .then(program => {
                console.log(program)
                if(!program)
                    return res.status(400).json({error: 'Invalid ID'})

                return DisastersServices.getDisasterPlanStepsByID(req.app.get('db'), program.disaster_program_id)
                    .then(steps => {
                        console.log(steps)

                        const disasterProgram = {
                            disaster_id: program.disaster_id,
                            disaster_program_information: program.disaster_program_information,
                            disaster_plan_steps: steps,
                        };

                        return res.json(disasterProgram)
                    })
                    .catch(next)
            })
            .catch(next)
    })

module.exports = DisastersRoute;