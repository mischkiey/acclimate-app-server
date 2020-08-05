const bcrypt = require('bcryptjs');
const xss = require('xss');
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const UserService = {

    // New User/ User Signup Services

    validateUserPassword(user_password) {
        if (user_password.length <= 8) 
            return 'Password must be longer than 8 characters';

        if (user_password.length >= 72)
            return 'Password must be shorter than 72 characters';

        if (user_password.startsWith(' ') || user_password.endsWith(' '))
            return 'Password must must not start or end with spaces';

        if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(user_password))
            return 'Password must contain 1 upper case, 1 lower case, 1 number, and 1 special character';
        
        return null;
    },

    hasUserWithUserName(db, user_name) {
        return db('acclimate_user')
            .select('user_name')
            .where({user_name})
            .first()
    },

    hashUserPassword(user_password) {
        return bcrypt.hash(user_password, 12);
    },

    insertUser(db, user) {
        return db('acclimate_user')
            .insert(user)
            .returning('*')
            .then(([user]) => user)
    },

    serializeUser(user) {
        return {
            user_id: user.user_id,
            user_name: xss(user.user_name),
            user_full_name: xss(user.user_full_name),
            user_date_created: user.user_date_created,
        }
    },

    // Main User Services

    getUserProgramsByID(db, id) {
        return db('acclimate_user_program')
            .select('*')
            .where(id)
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

    getUserShoppingItems(db, user_id) {
        return db('acclimate_user_shopping_item')
            .select('*')
            .where({user_id})
            .orderBy('user_shopping_item_id')
    },

    insertUserShoppingItem(db, newUserShoppingItem) {
        return db('acclimate_user_shopping_item')
            .insert(newUserShoppingItem)
            .returning('*')
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

module.exports = UserService;