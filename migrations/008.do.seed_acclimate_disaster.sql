BEGIN;

TRUNCATE acclimate_disaster, acclimate_disaster_program, acclimate_disaster_plan_step, acclimate_user, acclimate_user_program, acclimate_user_task, acclimate_user_shopping_item RESTART IDENTITY CASCADE;

INSERT INTO acclimate_disaster (disaster_name, disaster_type, disaster_description, disaster_image)
VALUES
    ('Blizzard/Winter Storm', 'Natural', 'Each year, hundreds of Americans are injured or killed by exposure to cold, vehicle accidents on wintry roads, and fires caused by the improper use of heaters. Learn what to do to keep your loved ones safe during blizzards and other winter storms! (Taken from redcross.org)', 'https://images.unsplash.com/photo-1579405151434-df6c3f05d9ff?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=3934&q=80'),
    ('Wildfire', 'Natural', 'A wildfire can spread quickly across forests and fields, giving you little time to evacuate to safety. Drought, dry conditions, and the careless use of fire all contribute to increased risk of wildfire. Get the facts about wildfires and learn what to do to keep your loved ones safe! (Taken from redcross.org)', 'https://images.unsplash.com/photo-1551207004-3e38b4f52ba6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1300&q=80'),
    ('Nuclear Explosion', 'Man-made or Hybrid', 'Three factors for protecting yourself from radiation and fallout are distance, shielding and time. (Taken from redcross.org)', 'https://images.unsplash.com/photo-1576673195903-bb573ef5a755?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=967&q=80'),
    ('Lost-at-Sea', 'Bonus', 'Wrestling with savage seas? Stranded without fuel or water? Return to shore in one piece with these seven sure-fire survival tips. (Taken from cnn.com)', 'https://images.unsplash.com/photo-1542824202-31b6eae33e02?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1287&q=80');

INSERT INTO acclimate_disaster_program (disaster_program_information, disaster_id)
VALUES
    ('About the blizzard disaster program', 1),
    ('About the wildfire disaster program', 2),
    ('About the nuclear explosion disaster program', 3),
    ('About the lost-at-sea situation program', 4);

INSERT INTO acclimate_disaster_plan_step (disaster_plan_step, disaster_plan_step_stage, disaster_program_id)
VALUES
    ('Blizzard readiness step', 'Readiness', 1),
    ('Blizzard response step', 'Response', 1),
    ('Blizzard recovery step', 'Recovery', 1),
    ('Wildfire readiness step', 'Readiness', 2),
    ('Wildfire response step', 'Response', 2),
    ('Wildfire recovery step', 'Recovery', 2),
    ('Nuclear explosion readiness step', 'Readiness', 3),
    ('Nuclear explosion response step', 'Response', 3),
    ('Nuclear explosion recovery step', 'Recovery', 3),
    ('Lost-at-Sea readiness step', 'Readiness', 4),
    ('Lost-at-Sea response step', 'Response', 4),
    ('Lost-at-Sea recovery step', 'Recovery', 4);

    COMMIT;