CREATE TABLE IF NOT EXISTS acclimate_user_program (
    user_id INTEGER REFERENCES acclimate_user(user_id),
    disaster_program_id INTEGER REFERENCES acclimate_disaster_program(disaster_program_id),
    PRIMARY KEY (user_id, disaster_program_id)
);