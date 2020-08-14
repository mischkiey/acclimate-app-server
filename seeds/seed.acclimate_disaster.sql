BEGIN;

TRUNCATE acclimate_disaster, acclimate_disaster_program, acclimate_disaster_plan_step, acclimate_user, acclimate_user_program, acclimate_user_task, acclimate_user_shopping_item RESTART IDENTITY CASCADE;

INSERT INTO acclimate_disaster (disaster_name, disaster_type, disaster_description, disaster_image)
VALUES
    ('Blizzard', 'Natural', 'Each year, hundreds of Americans are injured or killed by exposure to cold, vehicle accidents on wintry roads, and fires caused by the improper use of heaters. Learn what to do to keep your loved ones safe during blizzards and other winter storms! (Taken from redcross.org)', 'blizzard'),

    ('Hurricane', 'Natural', 'Hurricanes are strong storms that can be life-threatening as well as cause serious hazards such as flooding, storm surge, high winds and tornadoes. Learn what to do to keep your loved ones safe! (Taken from redcross.org)', 'hurricane'),

    ('Volcanic Eruption', 'Natural', 'An erupting volcano can blast ash, lava, solid rocks and gases into the air, creating hazards that can kill people, disrupt air travel and destroy property many miles away. If you live near a known volcano, active or dormant, following these tips will help you keep your loved ones safe. (Taken from redcross.org)', 'volcanic-eruption'),

    ('Wildfire', 'Natural', 'A wildfire can spread quickly across forests and fields, giving you little time to evacuate to safety. Drought, dry conditions, and the careless use of fire all contribute to increased risk of wildfire. Get the facts about wildfires and learn what to do to keep your loved ones safe! (Taken from redcross.org)', 'wildfire'),

    ('Nuclear Explosion', 'Man-made or Hybrid', 'Three factors for protecting yourself from radiation and fallout are distance, shielding and time. (Taken from redcross.org)', 'nuclear-explosion'),

    ('Terrorism', 'Man-made or Hybrid', 'Terrorist attacks like the ones we experienced on September 11, 2001 have left many concerned about the possibility of future incidents of terrorism in the United States and their potential impact. They have raised uncertainty about what might happen next, increasing stress levels. There are things you can do to prepare for terrorist attacks and reduce the stress that you may feel now and later should another emergency arise. Taking preparatory action can reassure you and your children that you can exert a measure of control even in the face of such events. (Taken from redcross.org)', 'terrorism'),

    ('Pandemic', 'Man-made or Hybrid', 'Protect yourself from the pandemic by following this disaster management plan', 'pandemic'),
    
    ('Stuck-in-Elevator', 'Bonus', 'It may seem uncommon but you never know when tragedy strikes! Read on to know what to do in such a situation.', 'stuck-in-elevator'),

    ('Lost-at-Sea', 'Bonus', 'Wrestling with savage seas? Stranded without fuel or water? Return to shore in one piece with these seven sure-fire survival tips. (Taken from cnn.com)', 'lost-at-sea'),

    ('Lost Hiker', 'Bonus', 'It may seem uncommon but you never know when tragedy strikes! Read on to know what to do in such a situation.', 'lost-hiker');

INSERT INTO acclimate_disaster_program (disaster_program_information, disaster_id)
VALUES
    ('About the blizzard disaster program', 1),
    ('About the hurricane disaster program', 2),
    ('About the volcanic eruption disaster program', 3),
    ('About the wildfire disaster program', 4),
    ('About the nuclear explosion disaster program', 5),
    ('About the political unrest disaster program', 6),
    ('About the pandemic disaster program', 7),
    ('About the stuck-in-elevator guide', 8),
    ('About the lost-at-sea guide', 9),
    ('About the lost hiker guide', 10);

INSERT INTO acclimate_disaster_plan_step (disaster_plan_step, disaster_plan_step_stage, disaster_plan_step_itemable_type, disaster_plan_step_itemable_shorthand, disaster_program_id)
VALUES
    ('Talk with your family about what to do if a winter storm watch or warning is issued. Discussing winter storms ahead of time helps reduce fear, particularly for young children.', 'Readiness', 'Task', 'Discuss specifics with family', 1),
    ('Have your vehicle winterized before the winter storm season to decrease your chance of being stranded in cold weather.', 'Readiness', 'Task', 'Winterize vehicle', 1),
    ('Have a mechanic check your battery, antifreeze, wipers and windshield washer fluid, ignition system, thermostat, lights, flashing hazard lights, exhaust system, heater, brakes, defroster, and oil', 'Readiness', 'Task', 'Have a mechanic check vehicle', 1),
    ('Install good winter tires with adequate tread. All-weather radials are usually adequate but some jurisdictions require vehicles to be equipped with chains or snow tires with studs', 'Readiness', 'Task', 'Install winter tires', 1),

    ('Hurricane response step', 'Readiness', NULL, NULL, 2),
    ('Hurricane response step', 'Response', NULL, NULL, 2),
    ('Hurricane recovery step', 'Recovery', NULL, NULL, 2),

    ('Volcanic eruption response step', 'Readiness', NULL, NULL, 3),
    ('Volcanic eruption response step', 'Response', NULL, NULL, 3),
    ('Volcanic eruption recovery step', 'Recovery', NULL, NULL, 3),

    ('Wildfire response step', 'Readiness', NULL, NULL, 4),
    ('Wildfire response step', 'Response', NULL, NULL, 4),
    ('Wildfire recovery step', 'Recovery', NULL, NULL, 4),

    ('Nuclear explosion readiness step', 'Readiness', 'Shopping Item', 'Shorthand nuclear explosion readiness step', 5),
    ('Nuclear explosion response step', 'Response', NULL, NULL, 5),
    ('Nuclear explosion recovery step', 'Recovery', NULL, NULL, 5),

    ('Political unrest readiness step', 'Readiness', 'Shopping Item', 'Shorthand political unrest readiness step', 6),
    ('Political unrest response step', 'Response', NULL, NULL, 6),
    ('Political unrest recovery step', 'Recovery', NULL, NULL, 6),

    ('Pandemic readiness step', 'Readiness', 'Shopping Item', 'Shorthand pandemic readiness step', 7),
    ('Pandemic response step', 'Response', NULL, NULL, 7),
    ('Pandemic recovery step', 'Recovery', NULL, NULL, 7),

    ('Stuck-in-elevator readiness step', 'Readiness', 'Task', 'Shorthand stuck-in-elevator readiness step', 8),
    ('Stuck-in-elevator response step', 'Response', 'Task', 'Shorthand stuck-in-elevator response step', 8),
    ('Stuck-in-elevator recovery step', 'Recovery', NULL, NULL, 8),

    ('Lost-at-Sea readiness step', 'Readiness', 'Task', 'Shorthand lost-at-sea readiness step', 9),
    ('Lost-at-Sea response step', 'Response', NULL, NULL, 9),
    ('Lost-at-Sea recovery step', 'Recovery', NULL, NULL, 9),
    
    ('Lost hiker readiness step', 'Readiness', 'Task', 'Shorthand lost hiker readiness step', 10),
    ('Lost hiker response step', 'Response', 'Task', 'Shorthand lost hiker response step', 10),
    ('Lost hiker recovery step', 'Recovery', NULL, NULL, 10);


INSERT INTO acclimate_user (user_name, user_password, user_full_name)
VALUES
    ('Miki', '$2a$04$LQekyIOhNY5dUUFzwIpt4u1sr2kTNulOvDXAWafNpm/hnqKFgVnfy', 'Miki'),
    ('test', '$2a$04$Z6M1pOBcgxsiNfGlLv1yA.P0gXrzrZvOKH12/x1uY5VHX6x/goz4u', 'Test');

-- INSERT INTO acclimate_user_program (user_id, disaster_program_id)
-- VALUES
--     (1, 1),
--     (2, 2);

-- INSERT INTO acclimate_user_task (user_task, user_id)
-- VALUES
--     ('Minhs Task Item 1', 1),
--     ('Minhs Task Item 2', 1),
--     ('Nicks Task Item 1', 2),
--     ('Wesleys Task Item 1', 3);

-- INSERT INTO acclimate_user_shopping_item (user_shopping_item, user_id)
-- VALUES
--     ('Minhs Shopping Item 1', 1),
--     ('Minhs Shopping Item 2', 1),
--     ('Nicks Shopping Item 1', 2),
--     ('Wesleys Shopping Item 1', 3);

COMMIT;