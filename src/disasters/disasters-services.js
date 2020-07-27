const DisastersServices = {
    getDisasters(db) {
        return db('acclimate_disaster')
            .select('*')
    },
};

module.exports = DisastersServices;