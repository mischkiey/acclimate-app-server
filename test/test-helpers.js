const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUserFixture() {
    return [
        {
            user_id: 1,
            user_name: 'Minh',
            user_password: 'myamazingpassword',
            user_full_name: 'Minh N',
        },
        {
            user_id: 2,
            user_name: 'Nick',
            user_password: 'mylastnameissomarvel',
            user_full_name: 'Nick T',
        },
        {
            user_id: 3,
            user_name: 'Wesley',
            user_password: 'itsrounotroux',
            user_full_name: 'Wesley R',
        },
        {
            user_id: 4,
            user_name: 'MattR',
            user_password: 'noidontliveinaspaceship',
            user_full_name: 'Matt R',
        },
        {
            user_id: 5,
            user_name: 'Muhajir',
            user_password: '3rdpartyapi',
            user_full_name: 'Muhajir S',
        },
        {
            user_id: 6,
            user_name: 'Ronnie',
            user_password: 'igobyjj',
            user_full_name: 'Ronnie H',
        },
    ];
};

function makeDisasterFixture() {
    return [
        {
            disaster_id: 1,
            disaster_name: 'Blizzard/Winter Storm',
            disaster_type: 'Natural',
            disaster_description: 'Each year, hundreds of Americans are injured or killed by exposure to cold, vehicle accidents on wintry roads, and fires caused by the improper use of heaters. Learn what to do to keep your loved ones safe during blizzards and other winter storms! (Taken from redcross.org)',
            disaster_image: 'https://images.unsplash.com/photo-1579405151434-df6c3f05d9ff?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=3934&q=80'
        },
        {
            disaster_id: 2,
            disaster_name: 'Wildfire',
            disaster_type: 'Natural',
            disaster_description: 'A wildfire can spread quickly across forests and fields, giving you little time to evacuate to safety. Drought, dry conditions, and the careless use of fire all contribute to increased risk of wildfire. Get the facts about wildfires and learn what to do to keep your loved ones safe! (Taken from redcross.org)',
            disaster_image: 'https://images.unsplash.com/photo-1551207004-3e38b4f52ba6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1300&q=80'
        },
        {
            disaster_id: 3,
            disaster_name: 'Nuclear Explosion',
            disaster_type: 'Man-made or Hybrid',
            disaster_description: 'Three factors for protecting yourself from radiation and fallout are distance, shielding and time. (Taken from redcross.org)',
            disaster_image: 'https://images.unsplash.com/photo-1576673195903-bb573ef5a755?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=967&q=80'
        },
        {
            disaster_id: 4,
            disaster_name: 'Lost-at-Sea',
            disaster_type: 'Bonus',
            disaster_description: 'Wrestling with savage seas? Stranded without fuel or water? Return to shore in one piece with these seven sure-fire survival tips. (Taken from cnn.com)',
            disaster_image: 'https://images.unsplash.com/photo-1542824202-31b6eae33e02?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1287&q=80'
        },
    ]
};

function makeDisasterProgramFixture() {
    return [
        {
            disaster_program_id: 1,
            disaster_program_information: 'About the blizzard disaster program',
            disaster_id: 1
        },
        {
            disaster_program_id: 2,
            disaster_program_information: 'About the wildfire disaster program',
            disaster_id: 2
        },
        {
            disaster_program_id: 3,
            disaster_program_information: 'About the nuclear explosion disaster program',
            disaster_id: 3
        },
        {
            disaster_program_id: 4,
            disaster_program_information: 'About the lost-at-sea situation program',
            disaster_id: 4
        },
    ];
};

function makeDisasterPlanStepFixture() {
    return [
        {
            disaster_plan_step_id: 1,
            disaster_plan_step: 'Blizzard readiness step',
            disaster_plan_step_stage: 'Readiness',
            disaster_program_id: 1
        },
        {
            disaster_plan_step_id: 2,
            disaster_plan_step: 'Blizzard response step',
            disaster_plan_step_stage: 'Response',
            disaster_program_id: 1
        },
        {
            disaster_plan_step_id: 3,
            disaster_plan_step: 'Blizzard recovery step',
            disaster_plan_step_stage: 'Recovery',
            disaster_program_id: 1
        },
        {
            disaster_plan_step_id: 4,
            disaster_plan_step: 'Wildfire readiness step',
            disaster_plan_step_stage: 'Readiness',
            disaster_program_id: 2
        },
        {
            disaster_plan_step_id: 5,
            disaster_plan_step: 'Wildfire response step',
            disaster_plan_step_stage: 'Response',
            disaster_program_id: 2
        },
        {
            disaster_plan_step_id: 6,
            disaster_plan_step: 'Wildfire recoveru step',
            disaster_plan_step_stage: 'Recovery',
            disaster_program_id: 2
        },
        {
            disaster_plan_step_id: 7,
            disaster_plan_step: 'Nuclear explosion readiness step',
            disaster_plan_step_stage: 'Readiness',
            disaster_program_id: 3
        },
        {
            disaster_plan_step_id: 8,
            disaster_plan_step: 'Nuclear explosion response step',
            disaster_plan_step_stage: 'Response',
            disaster_program_id: 3
        },
        {
            disaster_plan_step_id: 9,
            disaster_plan_step: 'Nuclear explosion recovery step',
            disaster_plan_step_stage: 'Recovery',
            disaster_program_id: 3
        },
        {
            disaster_plan_step_id: 10,
            disaster_plan_step: 'Lost-at-Sea readiness step',
            disaster_plan_step_stage: 'Readiness',
            disaster_program_id: 4
        },
        {
            disaster_plan_step_id: 11,
            disaster_plan_step: 'Lost-at-Sea response step',
            disaster_plan_step_stage: 'Response',
            disaster_program_id: 4
        },
        {
            disaster_plan_step_id: 12,
            disaster_plan_step: 'Lost-at-Sea recovery step',
            disaster_plan_step_stage: 'Recovery',
            disaster_program_id: 4
        },
    ];
};

function makeUserProgramFixture() {
    return [
        {
            user_id: 1,
            disaster_program_id: 1
        },
        {
            user_id: 1,
            disaster_program_id: 2
        },
        {
            user_id: 1,
            disaster_program_id: 3
        },
        {
            user_id: 2,
            disaster_program_id: 2
        },
    ]
};

function makeUserTaskItemFixture() {
    return [
        {
            user_task_item_id: 1,
            user_task_item: `Minh's Task Item 1`,
            user_id: 1,
        },
        {
            user_task_item_id: 2,
            user_task_item: `Minh's Task Item 2`,
            user_id: 1,
        },
        {
            user_task_item_id: 3,
            user_task_item: `Nick's Task Item 1`,
            user_id: 2,
        },
        {
            user_task_item_id: 4,
            user_task_item: `Wesley's Task Item 1`,
            user_id: 3,
        },
    ]
};

function makeUserShoppingItemFixture() {
    return [
        {
            user_shopping_item_id: 1,
            user_shopping_item: `Minh's Shopping Item 1`,
            user_id: 1,
        },
        {
            user_shopping_item_id: 2,
            user_shopping_item: `Minh's Shopping Item 2`,
            user_id: 1,
        },
        {
            user_shopping_item_id: 3,
            user_shopping_item: `Nick's Shopping Item 1`,
            user_id: 2,
        },
        {
            user_shopping_item_id: 4,
            user_shopping_item: `Wesley's Shopping Item 1`,
            user_id: 3,
        },
    ]
};

function makeAllFixtures() {
    const testUsers = makeUserFixture();
    const testDisasters = makeDisasterFixture();
    const testDisasterPrograms = makeDisasterProgramFixture();
    const testDisasterPlanSteps = makeDisasterPlanStepFixture();
    const testUserPrograms = makeUserProgramFixture();
    const testUserTaskItems = makeUserTaskItemFixture();
    const testUserShoppingItems = makeUserShoppingItemFixture()

    return {testUsers, testDisasters, testDisasterPrograms, testDisasterPlanSteps, testUserPrograms, testUserTaskItems, testUserShoppingItems};
};

async function seedUsersTable(db, users) {
    const preppedUsers = users.map(user => ({
        ...user,
        user_password: bcrypt.hashSync(user.user_password, 1)
    }));

    await db('acclimate_user').insert(preppedUsers);
    await db.raw(`SELECT setval('acclimate_user_user_id_seq', ?)`, users[users.length-1].user_id)
};

function seedAllTables(db, users, disasters, programs, planSteps, userPrograms) {
    return db.transaction(async (trx) => {
        await seedUsersTable(trx, users); 
        await trx('acclimate_disaster').insert(disasters);
        await trx('acclimate_disaster_program').insert(programs);
        await trx('acclimate_disaster_plan_step').insert(planSteps);
        await trx('acclimate_user_program').insert(userPrograms);
    });
};

function truncateAllTables(db) {
    return db.raw(
        `TRUNCATE acclimate_user, acclimate_disaster, acclimate_disaster_program, acclimate_disaster_plan_step, acclimate_user_program RESTART IDENTITY CASCADE;`
    );
};

// Todo: Function to create auth token

function makeJWTAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign(
        { user_id: user.user_id },
        secret,
        {
            subject: user.user_name,
            algorithm: 'HS256',
        }
    );

    return `Bearer ${token}`;
};

module.exports = {
    makeUserFixture,
    makeDisasterFixture,
    makeDisasterProgramFixture,
    makeDisasterPlanStepFixture,
    makeUserProgramFixture,
    makeUserTaskItemFixture,
    makeUserShoppingItemFixture,
    makeAllFixtures,

    seedUsersTable,
    seedAllTables,
    truncateAllTables,

    makeJWTAuthHeader,
};