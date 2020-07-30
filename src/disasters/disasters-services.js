const DisasterService = {
    getDisasters(db) {
        return db('acclimate_disaster')
            .select('*')
    },

    getDisasterByID(db, disaster_id) {
        return db('acclimate_disaster')
            .select('*')
            .where({disaster_id})
            .first()
    },

    getDisasterProgramByID(db, disaster_id) {
        return db('acclimate_disaster_program')
            .select('*')
            .where({disaster_id})
            .first()
    },

    getDisasterPlanStepsByID(db, disaster_program_id) {
        return db('acclimate_disaster_plan_step')
            .select('*')
            .where({disaster_program_id})
    },

    getUserProgramsByUserID(db, user_id) {
        return db('acclimate_user_program')
            .select('*')
            .where({user_id})
    },

    getUserProgramsByProgramID(db, disaster_program_id) {
        return db('acclimate_user_program')
            .select('*')
            .where({disaster_program_id})
    },

    getUserProgram(db, user_id, disaster_program_id) {
        return db('acclimate_user_program')
            .select('*')
            .where({user_id, disaster_program_id})
    },

    insertUserProgram(db, newUserProgram) {
        return db('acclimate_user_program')
            .insert(newUserProgram)
            .returning('*')
            .then(([res]) => res)
    },

    deleteUserProgram(db, user_id, disaster_program_id) {
        return db('acclimate_user_program')
            .where({user_id, disaster_program_id})
            .del()
    },
};

// SELECT acclimate_disaster_program.disaster_id, acclimate_disaster_program.disaster_program_information, acclimate_disaster_plan_step.disaster_plan_step, acclimate_disaster_plan_step.disaster_plan_step_stage FROM  acclimate_disaster_program JOIN acclimate_disaster_plan_step ON acclimate_disaster_program.disaster_program_id = acclimate_disaster_plan_step.disaster_program_id WHERE acclimate_disaster_plan_step.disaster_program_id = 1
// ;


module.exports = DisasterService;