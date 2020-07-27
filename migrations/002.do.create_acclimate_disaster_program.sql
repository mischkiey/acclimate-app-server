CREATE TABLE IF NOT EXISTS acclimate_disaster_program (
    disaster_program_id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    disaster_program_information VARCHAR NOT NULL,
    disaster_id INTEGER REFERENCES acclimate_disaster(disaster_id)
);