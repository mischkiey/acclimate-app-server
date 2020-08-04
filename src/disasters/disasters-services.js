const xss = require('xss');

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

    getUserTasks(db, user_id) {
        return db('acclimate_user_task')
            .select('*')
            .where({user_id})
            .orderBy('user_task_id')
    },

    insertUserTask(db, newUserTask) {
        return db('acclimate_user_task')
            .insert(newUserTask)
            .returning('*')
            .then(([res]) => res)
    },

    updateUserTask(db, user_task_id, newUserTask) {
        return db('acclimate_user_task')
            .where({user_task_id})
            .update(newUserTask, ['*'])
    },

    deleteUserTask(db, user_task_id) {
        return db('acclimate_user_task')
            .delete()
            .where({user_task_id})
    },

    getUserShoppingItem(db, user_id) {
        return db('acclimate_user_shopping_item')
            .select('*')
            .where({user_id})
            .orderBy('user_shopping_item_id')
    },

    insertUserShoppingItem(db, newUserShoppingItem) {
        return db('acclimate_user_shopping_item')
            .insert(newUserShoppingItem)
            .returning('*')
            .then(([res]) => res)
    },

    updateUserShoppingItem(db, user_shopping_item_id, newUserShoppingItem) {
        return db('acclimate_user_shopping_item')
            .where({user_shopping_item_id})
            .update(newUserShoppingItem, ['*'])
    },

    deleteUserShoppingItem(db, user_shopping_item_id) {
        return db('acclimate_user_shopping_item')
            .delete()
            .where({user_shopping_item_id})
    },

};


module.exports = DisasterService;