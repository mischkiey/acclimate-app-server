const express = require('express');
const path = require('path');
const xss = require('xss');

const DisasterService = require('./disasters-services');
const { requireAuth } = require('../middleware/jwt-auth');

const DisastersRoute = express.Router();

DisastersRoute
    .route('/')
    .get(requireAuth, (req, res, next) => {
        return DisasterService.getDisasters(req.app.get('db'))
            .then(disasters => {
                // Return an array of disasters data objects
                return res.json(disasters);
            })
            .catch(next)
    })

DisastersRoute
    .route('/:disasterID')
    .get(requireAuth, (req, res, next) => {
        const disaster_id = req.params.disasterID;
        // Retrieve data on desired disaster
        // If there is no match in database, return 400 Bad Request and appropriate error message
        // Return an array of desired disaster data object
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
        // Retrieve data on desired disaster program
        // If there is no match in database, return 400 Bad Request and appropriate error message
        // Return an array containing desired disaster program data object
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

module.exports = DisastersRoute;

