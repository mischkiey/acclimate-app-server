const DisastersServices = {
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
};

module.exports = DisastersServices;