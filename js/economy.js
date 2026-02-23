// ============================================================
// ECONOMY SYSTEM
// ============================================================
LIFE.economy = {};

// Career paths with promotion tiers
LIFE.CAREERS = {
    none:       { title: 'Unemployed',   income: 0,   workText: '...' },
    parttime:   { title: 'Part-time',    income: 8,   workText: '*stocking shelves*' },
    worker:     { title: 'Worker',       income: 15,  workText: '*working hard*' },
    artist:     { title: 'Artist',       income: 12,  workText: '*creating art*', hapBonus: 3 },
    scientist:  { title: 'Scientist',    income: 35,  workText: '*researching*', intBonus: 2, reqInt: 40 },
    business:   { title: 'Businessman',  income: 45,  workText: '*closing deals*', chaBonus: 1, reqInt: 25, reqCha: 30 },
    doctor:     { title: 'Doctor',       income: 55,  workText: '*saving lives*', hpBonus: 2, reqInt: 50 },
    teacher:    { title: 'Teacher',      income: 22,  workText: '*teaching class*', hapBonus: 2, intBonus: 1, reqInt: 30 },
    // fame careers
    musician:   { title: 'Musician',     income: 20,  workText: '*performing*', hapBonus: 2, chaBonus: 2, reqCha: 25, fame: true },
    actor:      { title: 'Actor',        income: 25,  workText: '*acting*', hapBonus: 1, chaBonus: 3, reqCha: 35, fame: true },
    athlete:    { title: 'Athlete',      income: 30,  workText: '*training*', hpBonus: 3, chaBonus: 1, reqInt: 15, fame: true },
    streamer:   { title: 'Streamer',     income: 18,  workText: '*streaming*', hapBonus: 2, chaBonus: 2, reqCha: 20, fame: true },
    // executive tier
    ceo:        { title: 'CEO',          income: 120, workText: '*running the company*', chaBonus: 1, intBonus: 1, reqInt: 50, reqCha: 50 },
    surgeon:    { title: 'Surgeon',      income: 90,  workText: '*performing surgery*', hpBonus: 3, reqInt: 65 },
    professor:  { title: 'Professor',    income: 45,  workText: '*lecturing*', intBonus: 2, hapBonus: 1, reqInt: 55 }
};

// Career promotion paths: from -> to (with requirements)
LIFE.CAREER_PROMOTIONS = {
    parttime:  { next: 'worker',    reqInt: 0,  reqCha: 0 },
    worker:    { next: 'business',  reqInt: 25, reqCha: 20 },
    artist:    { next: 'musician',  reqInt: 0,  reqCha: 30 },
    musician:  { next: 'actor',     reqInt: 0,  reqCha: 45 },
    business:  { next: 'ceo',       reqInt: 50, reqCha: 50 },
    doctor:    { next: 'surgeon',   reqInt: 65, reqCha: 0 },
    teacher:   { next: 'professor', reqInt: 55, reqCha: 0 },
    scientist: { next: 'professor', reqInt: 55, reqCha: 0 },
    streamer:  { next: 'actor',     reqInt: 0,  reqCha: 40 }
};

// Properties you can buy
LIFE.PROPERTIES = [
    { name: 'Small Apartment',  cost: 15000,  rent: 200,  hapBonus: 5,  minAge: 20 },
    { name: 'Condo',            cost: 40000,  rent: 500,  hapBonus: 8,  minAge: 23 },
    { name: 'House',            cost: 80000,  rent: 900,  hapBonus: 12, minAge: 25 },
    { name: 'Luxury House',     cost: 200000, rent: 2000, hapBonus: 18, minAge: 28 },
    { name: 'Mansion',          cost: 500000, rent: 5000, hapBonus: 25, minAge: 30 },
    { name: 'Commercial Space', cost: 60000,  rent: 800,  hapBonus: 3,  minAge: 25 },
    { name: 'Office Building',  cost: 150000, rent: 2500, hapBonus: 5,  minAge: 30 },
    { name: 'Beach House',      cost: 250000, rent: 3000, hapBonus: 20, minAge: 28 }
];

// Investments
LIFE.INVESTMENTS = [
    { name: 'Savings Account',  cost: 500,   returnRate: 0.03, risk: 0,    minAge: 18 },
    { name: 'Index Fund',       cost: 1000,  returnRate: 0.08, risk: 0.1,  minAge: 18 },
    { name: 'Tech Stocks',      cost: 2000,  returnRate: 0.15, risk: 0.25, minAge: 20 },
    { name: 'Crypto',           cost: 500,   returnRate: 0.30, risk: 0.45, minAge: 18 },
    { name: 'Startup',          cost: 5000,  returnRate: 0.40, risk: 0.50, minAge: 22 },
    { name: 'Real Estate Fund', cost: 10000, returnRate: 0.10, risk: 0.12, minAge: 25 },
    { name: 'Gold',             cost: 3000,  returnRate: 0.05, risk: 0.08, minAge: 20 },
    { name: 'Side Business',    cost: 8000,  returnRate: 0.20, risk: 0.20, minAge: 22 }
];

// Fame levels
LIFE.FAME_LEVELS = [
    { min: 0,   title: 'Unknown',    color: '#999' },
    { min: 10,  title: 'Local Star', color: '#4fc3f7' },
    { min: 30,  title: 'Rising Star', color: '#29b6f6' },
    { min: 50,  title: 'Famous',     color: '#ff9800' },
    { min: 75,  title: 'Superstar',  color: '#ffeb3b' },
    { min: 90,  title: 'Icon',       color: '#ff1744' },
    { min: 100, title: 'Legend',     color: '#e040fb' }
];

LIFE.SHOP_ITEMS = [
    { name: 'Snack',          cost: 5,     stat: 'happiness',    amount: 1,  minAge: 5 },
    { name: 'Lunch',          cost: 12,    stat: 'happiness',    amount: 2,  minAge: 10 },
    { name: 'New Clothes',    cost: 60,    stat: 'charisma',     amount: 3,  minAge: 12 },
    { name: 'Gym Pass',       cost: 80,    stat: 'health',       amount: 5,  minAge: 16, once: true },
    { name: 'Online Course',  cost: 150,   stat: 'intelligence', amount: 5,  minAge: 18, once: true },
    { name: 'Vacation',       cost: 500,   stat: 'happiness',    amount: 10, minAge: 23 },
    { name: 'Bicycle',         cost: 200,   stat: 'health',       amount: 5,  minAge: 10, once: true },
    // good items
    { name: 'Self-Help Book', cost: 80,    stat: 'intelligence', amount: 4,  minAge: 12, once: true },
    { name: 'Gift Basket',    cost: 100,   stat: 'charisma',     amount: 5,  minAge: 14, rep: 5 },
    { name: 'First Aid Kit',  cost: 150,   stat: 'health',       amount: 8,  minAge: 14, once: true },
    { name: 'Therapy',        cost: 500,   stat: 'happiness',    amount: 12, minAge: 18 },
    { name: 'Volunteer Kit',  cost: 50,    stat: 'charisma',     amount: 3,  minAge: 14, rep: 10, once: true },
    { name: 'Charity Donation',cost: 1000, stat: 'happiness',    amount: 8,  minAge: 20, rep: 15 },
    { name: 'Community Meal', cost: 200,   stat: 'happiness',    amount: 5,  minAge: 16, rep: 8 }
];

// Vendor-specific items (keyed by vendor type)
LIFE.VENDOR_ITEMS = {
    'Food Vendor': [
        { name: 'Hot Dog',         cost: 3,     stat: 'happiness',    amount: 2,  minAge: 5,  physical: true },
        { name: 'Pizza Slice',     cost: 5,     stat: 'happiness',    amount: 3,  minAge: 5,  physical: true },
        { name: 'Smoothie',        cost: 8,     stat: 'health',       amount: 2,  minAge: 8,  physical: true },
        { name: 'Full Meal',       cost: 20,    stat: 'happiness',    amount: 5,  minAge: 10, physical: true },
        { name: 'Protein Shake',   cost: 15,    stat: 'health',       amount: 4,  minAge: 14, physical: true },
        { name: 'Fancy Dinner',    cost: 80,    stat: 'happiness',    amount: 8,  minAge: 18, physical: true }
    ],
    'Clothes Shop': [
        { name: 'T-Shirt',         cost: 15,    stat: 'charisma',     amount: 1,  minAge: 5,  physical: true },
        { name: 'Nice Outfit',     cost: 60,    stat: 'charisma',     amount: 3,  minAge: 12, physical: true },
        { name: 'Designer Clothes',cost: 200,   stat: 'charisma',     amount: 6,  minAge: 16, physical: true },
        { name: 'Formal Suit',     cost: 400,   stat: 'charisma',     amount: 8,  minAge: 20, physical: true },
        { name: 'Luxury Watch',    cost: 1500,  stat: 'charisma',     amount: 5,  minAge: 25, once: true, physical: true },
        { name: 'Designer Shoes',  cost: 300,   stat: 'charisma',     amount: 4,  minAge: 16, physical: true }
    ],
    'Pharmacist': [
        { name: 'Vitamins',        cost: 10,    stat: 'health',       amount: 3,  minAge: 5,  physical: true },
        { name: 'Cold Medicine',   cost: 15,    stat: 'health',       amount: 4,  minAge: 8,  physical: true },
        { name: 'Pain Killers',    cost: 20,    stat: 'health',       amount: 5,  minAge: 14, physical: true },
        { name: 'Supplements',     cost: 40,    stat: 'health',       amount: 6,  minAge: 16, physical: true },
        { name: 'Prescription',    cost: 100,   stat: 'health',       amount: 10, minAge: 18, physical: true },
        { name: 'First Aid Kit',   cost: 50,    stat: 'health',       amount: 8,  minAge: 10, once: true, physical: true }
    ],
    'Bookstore': [
        { name: 'Comic Book',      cost: 5,     stat: 'happiness',    amount: 2,  minAge: 5,  physical: true },
        { name: 'Novel',           cost: 12,    stat: 'intelligence', amount: 2,  minAge: 8,  physical: true },
        { name: 'Textbook',        cost: 40,    stat: 'intelligence', amount: 4,  minAge: 12, physical: true },
        { name: 'Self-Help Book',  cost: 25,    stat: 'charisma',     amount: 3,  minAge: 14, physical: true },
        { name: 'Encyclopedia Set',cost: 150,   stat: 'intelligence', amount: 8,  minAge: 16, once: true, physical: true },
        { name: 'Online Course',   cost: 200,   stat: 'intelligence', amount: 6,  minAge: 18 }
    ],
    'Gym Trainer': [
        { name: 'Workout Session', cost: 15,    stat: 'health',       amount: 3,  minAge: 12 },
        { name: 'Personal Training',cost: 50,   stat: 'health',       amount: 6,  minAge: 16 },
        { name: 'Gym Membership',  cost: 120,   stat: 'health',       amount: 10, minAge: 14, once: true },
        { name: 'Yoga Class',      cost: 25,    stat: 'happiness',    amount: 4,  minAge: 14 },
        { name: 'Martial Arts',    cost: 80,    stat: 'health',       amount: 8,  minAge: 16 },
        { name: 'Sports Equipment',cost: 200,   stat: 'health',       amount: 5,  minAge: 10, once: true, physical: true }
    ],
    'Ticket Seller': [
        { name: 'Event T-Shirt',   cost: 20,    stat: 'happiness',    amount: 3,  minAge: 5,  physical: true },
        { name: 'Concert Poster',  cost: 15,    stat: 'happiness',    amount: 2,  minAge: 5,  physical: true },
        { name: 'VIP Upgrade',     cost: 100,   stat: 'happiness',    amount: 8,  minAge: 16 },
        { name: 'Season Pass',     cost: 200,   stat: 'happiness',    amount: 10, minAge: 14, once: true },
        { name: 'Backstage Pass',  cost: 150,   stat: 'charisma',     amount: 6,  minAge: 18 },
        { name: 'Signed Merch',    cost: 80,    stat: 'happiness',    amount: 5,  minAge: 10, physical: true }
    ],
    'Electronics': [
        { name: 'Phone Case',      cost: 10,    stat: 'happiness',    amount: 1,  minAge: 10, physical: true },
        { name: 'Headphones',      cost: 30,    stat: 'happiness',    amount: 3,  minAge: 10, once: true, physical: true },
        { name: 'Tablet',          cost: 200,   stat: 'intelligence', amount: 4,  minAge: 12, once: true, physical: true },
        { name: 'Laptop',          cost: 600,   stat: 'intelligence', amount: 6,  minAge: 14, once: true, physical: true },
        { name: 'Gaming Console',  cost: 400,   stat: 'happiness',    amount: 8,  minAge: 10, once: true, physical: true },
        { name: 'Smartphone',      cost: 500,   stat: 'charisma',     amount: 5,  minAge: 14, once: true, physical: true }
    ]
};

// Contraband - only available from Dealers
LIFE.DEALER_ITEMS = [
    { name: 'Switchblade',    cost: 200,   stat: 'charisma',     amount: 2,  minAge: 12, rep: -5,  type: 'switchblade', once: true },
    { name: 'Pistol',         cost: 2500,  stat: 'charisma',     amount: 2,  minAge: 12, rep: -10, type: 'gun', once: true },
    { name: 'AK-47',          cost: 8000,  stat: 'charisma',     amount: 3,  minAge: 12, rep: -15, type: 'rifle', once: true },
    { name: 'Party Drugs',    cost: 50,    stat: 'happiness',    amount: 15, minAge: 16, rep: -5,  type: 'drug', healthCost: 10 },
    { name: 'Steroids',       cost: 300,   stat: 'health',       amount: 15, minAge: 18, rep: -3,  type: 'drug', healthCost: 5 },
    { name: 'Shady Deal',     cost: 100,   stat: 'charisma',     amount: 2,  minAge: 16, rep: -8,  type: 'drug', moneyBonus: 500 }
];

// Organ Buyer shop items (things they sell)
LIFE.ORGAN_BUYER_ITEMS = [
    { name: 'Adrenaline Shot', cost: 200,  stat: 'health', amount: 60, minAge: 16, physical: true },
    { name: 'Morphine',        cost: 150,  stat: 'health', amount: 80, minAge: 16, physical: true, healthCost: 5 }
];

// Fence shop items
LIFE.FENCE_ITEMS = [
    { name: 'Fake ID',        cost: 500,   stat: 'charisma', amount: 0, minAge: 16, physical: true, reducesWanted: 2 },
    { name: 'Lockpick Set',   cost: 100,   stat: 'intelligence', amount: 2, minAge: 16, physical: true }
];

// Arms Dealer shop items
LIFE.ARMS_DEALER_ITEMS = [
    { name: 'Shotgun',        cost: 5000,  stat: 'charisma', amount: 2, minAge: 16, physical: true, type: 'weapon' },
    { name: 'Body Armor',     cost: 3000,  stat: 'health',   amount: 10, minAge: 16, physical: true, type: 'armor' },
    { name: 'Ammo Crate',     cost: 500,   stat: 'charisma', amount: 1, minAge: 16, physical: true }
];

LIFE.economy.getCareer = function() {
    var c = LIFE.state.career || 'none';
    var career = LIFE.CAREERS[c];
    if (!career) return LIFE.CAREERS['none'];
    // check requirements
    if (career.reqInt && LIFE.state.stats.intelligence < career.reqInt) return LIFE.CAREERS['worker'];
    if (career.reqCha && LIFE.state.stats.charisma < career.reqCha) return LIFE.CAREERS['worker'];
    return career;
};

LIFE.economy.getFameLevel = function() {
    var fame = LIFE.state.fame || 0;
    var result = LIFE.FAME_LEVELS[0];
    for (var i = 0; i < LIFE.FAME_LEVELS.length; i++) {
        if (fame >= LIFE.FAME_LEVELS[i].min) result = LIFE.FAME_LEVELS[i];
    }
    return result;
};

// Kid/teen jobs for children and young teens
LIFE.KID_JOBS = [
    { name: 'Lemonade Stand',    income: 3,   minAge: 6,  maxAge: 14, stat: 'charisma',     amount: 0.5, text: '*selling lemonade*' },
    { name: 'Chores',            income: 5,   minAge: 5,  maxAge: 17, stat: 'intelligence',  amount: 0.3, text: '*doing chores*' },
    { name: 'Lawn Mowing',       income: 8,   minAge: 8,  maxAge: 17, stat: 'health',        amount: 0.5, text: '*mowing lawns*' },
    { name: 'Newspaper Delivery', income: 6,  minAge: 10, maxAge: 17, stat: 'health',        amount: 0.3, text: '*delivering papers*' },
    { name: 'Babysitting',       income: 10,  minAge: 12, maxAge: 17, stat: 'charisma',      amount: 0.5, text: '*babysitting*' },
    { name: 'Dog Walking',       income: 7,   minAge: 8,  maxAge: 17, stat: 'health',        amount: 0.4, text: '*walking dogs*' },
    { name: 'Tutoring',          income: 12,  minAge: 14, maxAge: 22, stat: 'intelligence',  amount: 0.5, text: '*tutoring kids*' },
    { name: 'Car Wash',          income: 10,  minAge: 12, maxAge: 17, stat: 'charisma',      amount: 0.3, text: '*washing cars*' }
];

// Do a kid job (age 5-17 earning)
LIFE.economy.doKidJob = function() {
    var state = LIFE.state;
    var eligible = [];
    for (var i = 0; i < LIFE.KID_JOBS.length; i++) {
        var job = LIFE.KID_JOBS[i];
        if (state.age >= job.minAge && state.age <= job.maxAge) eligible.push(job);
    }
    if (eligible.length === 0) return 0;
    var job = eligible[Math.floor(Math.random() * eligible.length)];
    var earned = job.income + Math.floor(Math.random() * 3);
    // intelligence bonus
    earned = Math.round(earned * (1 + state.stats.intelligence * 0.005));
    state.money += earned;
    if (job.stat && state.stats[job.stat] !== undefined) {
        state.stats[job.stat] = Math.min(100, state.stats[job.stat] + job.amount);
    }
    return { earned: earned, job: job };
};

// Yearly salary - paid automatically each year advance
LIFE.economy.getYearlySalary = function() {
    var state = LIFE.state;
    if (state.age < 14 || state.age > 64) return 0;
    var career = LIFE.economy.getCareer();
    if (!career || career.income <= 0) return 0;
    var salary = career.income * 100; // base annual salary
    // career level bonus
    salary += (state.careerLevel || 0) * 500;
    // fame multiplier for fame careers
    if (career.fame && state.fame > 20) salary = Math.round(salary * (1 + state.fame * 0.02));
    // reputation bonus
    if (state.reputation > 50) salary = Math.round(salary * 1.15);
    else if (state.reputation < -30) salary = Math.round(salary * 0.85);
    // criminal record penalty
    if (state.criminalRecord) salary = Math.round(salary * 0.7);
    return Math.round(salary);
};

// Get a breakdown of yearly finances for the info menu
LIFE.economy.getFinanceBreakdown = function() {
    var state = LIFE.state;
    var income = {};
    var expenses = {};

    // Salary
    var salary = LIFE.economy.getYearlySalary();
    if (salary > 0) income['Salary (' + (LIFE.economy.getCareer().title || 'Job') + ')'] = salary;

    // Kid job estimate (if applicable)
    if (state.age >= 5 && state.age < 23 && salary === 0) {
        income['Odd Jobs (est.)'] = 50 + state.age * 5;
    }

    // Property rental income
    var rentalIncome = 0;
    if (state.properties && state.properties.length > 0) {
        state.properties.forEach(function(p) { rentalIncome += p.rent; });
    }
    if (rentalIncome > 0) income['Rental Income'] = rentalIncome;

    // Investment returns estimate (average)
    if (state.investments && state.investments.length > 0) {
        var estReturn = 0;
        state.investments.forEach(function(inv) {
            estReturn += Math.round(inv.value * inv.returnRate * 0.5);
        });
        if (estReturn > 0) income['Investment Returns (est.)'] = estReturn;
    }

    // Expenses
    if (state.married) expenses['Spouse Upkeep'] = 200;
    if (state.hasKids) expenses['Child Upkeep (' + (state.childCount || 1) + ' kids)'] = 400 * (state.childCount || 1);

    // continuous expenses estimate (passiveIncome drain over a year)
    if (state.married) expenses['Daily Living (married)'] = Math.round(0.12 * LIFE.YEAR_DURATION);
    if (state.hasKids) expenses['Daily Living (kids)'] = Math.round(0.2 * LIFE.YEAR_DURATION);

    var totalIncome = 0;
    for (var k in income) totalIncome += income[k];
    var totalExpenses = 0;
    for (var k2 in expenses) totalExpenses += expenses[k2];

    return {
        income: income,
        expenses: expenses,
        totalIncome: totalIncome,
        totalExpenses: totalExpenses,
        net: totalIncome - totalExpenses,
        savings: Math.floor(Math.max(0, state.money))
    };
};

LIFE.economy.doWork = function() {
    var state = LIFE.state;
    if (state.age < 14 || state.age > 64) return 0;
    var career = LIFE.economy.getCareer();
    if (!career || career.income <= 0) return 0;
    var earned = career.income;
    // career level bonus
    earned += (state.careerLevel || 0) * 5;
    // intelligence bonus
    earned = Math.round(earned * (1 + state.stats.intelligence * 0.01));
    // charisma bonus for business/ceo
    if (state.career === 'business' || state.career === 'ceo') earned = Math.round(earned * (1 + state.stats.charisma * 0.005));
    // fame multiplier for fame careers
    if (career.fame && state.fame > 20) earned = Math.round(earned * (1 + state.fame * 0.02));
    // happiness penalty
    if (state.stats.happiness < 20) earned = Math.round(earned * 0.6);
    // reputation bonus/penalty
    if (state.reputation > 50) earned = Math.round(earned * 1.15);
    else if (state.reputation < -30) earned = Math.round(earned * 0.8);
    // criminal record penalty
    if (state.criminalRecord) earned = Math.round(earned * 0.7);

    state.money += earned;
    // career XP for promotion
    state.careerXP = (state.careerXP || 0) + 1;
    if (career.hapBonus) state.stats.happiness = Math.min(100, state.stats.happiness + career.hapBonus * 0.3);
    if (career.intBonus) state.stats.intelligence = Math.min(100, state.stats.intelligence + career.intBonus * 0.3);
    if (career.chaBonus) state.stats.charisma = Math.min(100, state.stats.charisma + career.chaBonus * 0.3);
    if (career.hpBonus)  state.stats.health = Math.min(100, state.stats.health + career.hpBonus * 0.3);
    // fame growth for fame careers
    if (career.fame) {
        state.fame = Math.min(100, (state.fame || 0) + 0.5 + state.stats.charisma * 0.01);
    }
    return earned;
};

LIFE.economy.passiveIncome = function(dt) {
    var state = LIFE.state;
    // family expenses always apply
    if (state.married) state.money -= 0.12 * dt;
    if (state.hasKids) state.money -= 0.2 * dt;

    // property income
    if (state.properties && state.properties.length > 0) {
        for (var i = 0; i < state.properties.length; i++) {
            var prop = state.properties[i];
            state.money += (prop.rent / LIFE.YEAR_DURATION) * dt;
        }
    }

    // investment returns (per year tick in advanceYear, not per frame)

    if (state.age < 23 || state.age > 64) return;
    var career = LIFE.economy.getCareer();
    if (!career || career.income <= 0) return;
    var rate = career.income * 0.04 * dt;
    if (state.stats.happiness < 20) rate *= 0.6;
    if (state.reputation > 50) rate *= 1.15;
    if (state.criminalRecord) rate *= 0.7;
    state.money += rate;
};

// Process yearly investment returns (called from advanceYear)
LIFE.economy.processInvestments = function() {
    var state = LIFE.state;
    if (!state.investments || state.investments.length === 0) return;
    var totalReturn = 0;
    for (var i = state.investments.length - 1; i >= 0; i--) {
        var inv = state.investments[i];
        var roll = Math.random();
        if (roll < inv.risk) {
            // bad year - lose some
            var loss = Math.floor(inv.value * (0.1 + Math.random() * 0.3));
            inv.value = Math.max(0, inv.value - loss);
            if (inv.value <= 0) {
                LIFE.ui.showPopup(inv.name + ' went bust!', '#ef5350');
                state.investments.splice(i, 1);
            }
        } else {
            // good year - gain returns
            var gain = Math.floor(inv.value * inv.returnRate * (0.5 + Math.random()));
            inv.value += gain;
            totalReturn += gain;
        }
    }
    if (totalReturn > 0) {
        state.money += totalReturn;
        LIFE.ui.showPopup('Investments: +$' + totalReturn.toLocaleString(), '#4caf50');
    }
};

// Check for career promotion
LIFE.economy.checkPromotion = function() {
    var state = LIFE.state;
    if (!state.career || state.career === 'none') return;
    var promo = LIFE.CAREER_PROMOTIONS[state.career];
    if (!promo) {
        // no promotion path - just level up
        if ((state.careerXP || 0) >= 8 + (state.careerLevel || 0) * 4) {
            state.careerLevel = (state.careerLevel || 0) + 1;
            state.careerXP = 0;
            LIFE.ui.showPopup('Promoted! Level ' + state.careerLevel, '#4caf50');
            state.money += 200 * state.careerLevel;
        }
        return;
    }
    if ((state.careerXP || 0) >= 10 &&
        state.stats.intelligence >= promo.reqInt &&
        state.stats.charisma >= promo.reqCha) {
        state.career = promo.next;
        state.careerLevel = 0;
        state.careerXP = 0;
        var newCareer = LIFE.CAREERS[promo.next];
        LIFE.ui.showPopup('Promoted to ' + newCareer.title + '!', '#ffeb3b');
        if (LIFE.news) LIFE.news.add('Local resident promoted to ' + newCareer.title + ' - career on the rise!', 'career');
        state.money += 1000;
        state.stats.happiness = Math.min(100, state.stats.happiness + 8);
    }
};

// Buy a property
LIFE.economy.buyProperty = function(index) {
    var prop = LIFE.PROPERTIES[index];
    if (!prop || prop.minAge > LIFE.state.age) return false;
    if (!LIFE.economy.spend(prop.cost)) return false;
    if (!LIFE.state.properties) LIFE.state.properties = [];
    LIFE.state.properties.push({ name: prop.name, cost: prop.cost, rent: prop.rent });
    LIFE.state.stats.happiness = Math.min(100, LIFE.state.stats.happiness + prop.hapBonus);
    if (LIFE.news) LIFE.news.add(prop.name + ' sold for $' + prop.cost.toLocaleString() + ' - real estate market stays hot.', 'career');

    // If buying a home-type property, set homeDoor immediately so G key works
    if (LIFE.PROPERTY_BUILDINGS) {
        for (var i = 0; i < LIFE.PROPERTY_BUILDINGS.length; i++) {
            var pb = LIFE.PROPERTY_BUILDINGS[i];
            if (pb.isHome && pb.propIdx === index) {
                LIFE.state.homeDoor = { x: pb.x, z: pb.z + pb.d / 2 + 1, propName: prop.name };
                break;
            }
        }
    }

    // Rebuild city to update property signs (show OWNED + G prompt)
    if (LIFE.state.currentStage === 'city') {
        var playerPos = LIFE.player ? {
            x: LIFE.player.group.position.x,
            z: LIFE.player.group.position.z
        } : { x: 0, z: 0 };
        LIFE.buildEnvironment('city');
        LIFE.spawnNPCs('city');
        if (LIFE.player) {
            LIFE.teleportPlayer(playerPos.x, LIFE.player.group.position.y, playerPos.z);
        }
    }

    return true;
};

// Buy an investment
LIFE.economy.buyInvestment = function(index) {
    var inv = LIFE.INVESTMENTS[index];
    if (!inv || inv.minAge > LIFE.state.age) return false;
    if (!LIFE.economy.spend(inv.cost)) return false;
    if (!LIFE.state.investments) LIFE.state.investments = [];
    LIFE.state.investments.push({ name: inv.name, value: inv.cost, returnRate: inv.returnRate, risk: inv.risk });
    return true;
};

LIFE.economy.canAfford = function(cost) { return LIFE.state.money >= cost; };

LIFE.economy.spend = function(cost) {
    if (!LIFE.economy.canAfford(cost)) return false;
    LIFE.state.money -= cost;
    LIFE.sounds.spend();
    return true;
};

LIFE.economy.buyItem = function(index) {
    var item = LIFE.SHOP_ITEMS[index];
    if (!item || item.minAge > LIFE.state.age) return false;
    // check sold out (restocking)
    if (item.once && LIFE.economy.isItemSoldOut(item.name)) return false;
    // price modifier from charisma/reputation
    var price = item.cost;
    if (LIFE.state.stats.charisma > 50) price = Math.round(price * 0.9);
    if (LIFE.state.reputation < -30) price = Math.round(price * 1.2);
    if (!LIFE.economy.spend(price)) return false;

    LIFE.state.stats[item.stat] = Math.min(100, LIFE.state.stats[item.stat] + item.amount);
    if (item.rep) {
        LIFE.state.reputation = Math.max(-100, Math.min(100, LIFE.state.reputation + item.rep));
        LIFE.ui.showRepChange(item.rep);
    }
    if (item.type === 'gun') {
        LIFE.state.hasGun = true;
        if (LIFE.state.inventory.indexOf('Pistol') < 0) LIFE.state.inventory.push('Pistol');
        LIFE.logCrime('Illegal firearm purchase');
        LIFE.addWanted(1, 'Illegal firearm purchase');
    }
    if (item.type === 'switchblade') {
        LIFE.state.hasSwitchblade = true;
        if (LIFE.state.inventory.indexOf('Switchblade') < 0) LIFE.state.inventory.push('Switchblade');
    }
    if (item.healthCost) LIFE.state.stats.health = Math.max(0, LIFE.state.stats.health - item.healthCost);
    if (item.moneyBonus) LIFE.state.money += item.moneyBonus;
    if (item.type === 'drug') {
        LIFE.state.drugUses++;
        LIFE.sounds.drug();
    }
    if (item.once) {
        LIFE.economy.markPurchased(item.name);
    }
    return true;
};

LIFE.economy.buyVendorItem = function(vendorType, index) {
    var items = LIFE.VENDOR_ITEMS[vendorType];
    if (!items) return false;
    var item = items[index];
    if (!item || item.minAge > LIFE.state.age) return false;
    // check sold out (restocking)
    if (item.once && LIFE.economy.isItemSoldOut(item.name)) return false;
    var price = item.cost;
    if (LIFE.state.stats.charisma > 50) price = Math.round(price * 0.9);
    if (!LIFE.economy.spend(price)) return false;

    if (item.physical) {
        // Physical item — add to inventory, stat boost deferred to Use
        LIFE.state.inventory.push(item.name);
    } else {
        // Service — instant stat boost
        LIFE.state.stats[item.stat] = Math.min(100, LIFE.state.stats[item.stat] + item.amount);
    }

    if (item.rep) {
        LIFE.state.reputation = Math.max(-100, Math.min(100, LIFE.state.reputation + item.rep));
        LIFE.ui.showRepChange(item.rep);
    }
    // track purchase for restocking
    if (item.once) {
        LIFE.economy.markPurchased(item.name);
    }
    return true;
};

LIFE.economy.buyDealerItem = function(index) {
    var item = LIFE.DEALER_ITEMS[index];
    if (!item || item.minAge > LIFE.state.age) return false;
    if (item.once && LIFE.economy.isItemSoldOut(item.name)) return false;
    var price = item.cost;
    if (LIFE.state.stats.charisma > 50) price = Math.round(price * 0.9);
    if (!LIFE.economy.spend(price)) return false;

    LIFE.state.stats[item.stat] = Math.min(100, LIFE.state.stats[item.stat] + item.amount);
    if (item.rep) {
        LIFE.state.reputation = Math.max(-100, Math.min(100, LIFE.state.reputation + item.rep));
        LIFE.ui.showRepChange(item.rep);
    }
    if (item.type === 'gun') {
        LIFE.state.hasGun = true;
        if (LIFE.state.inventory.indexOf('Pistol') < 0) LIFE.state.inventory.push('Pistol');
        LIFE.logCrime('Illegal firearm purchase');
    }
    if (item.type === 'rifle') {
        LIFE.state.hasRifle = true;
        if (LIFE.state.inventory.indexOf('AK-47') < 0) LIFE.state.inventory.push('AK-47');
        LIFE.logCrime('Illegal firearm purchase');
    }
    if (item.type === 'switchblade') {
        LIFE.state.hasSwitchblade = true;
        if (LIFE.state.inventory.indexOf('Switchblade') < 0) LIFE.state.inventory.push('Switchblade');
    }
    if (item.healthCost) LIFE.state.stats.health = Math.max(0, LIFE.state.stats.health - item.healthCost);
    if (item.moneyBonus) LIFE.state.money += item.moneyBonus;
    if (item.type === 'drug') {
        LIFE.state.drugUses++;
        LIFE.sounds.drug();
    }
    if (item.once) {
        LIFE.economy.markPurchased(item.name);
    }
    return true;
};

// Item restocking system - items restock after 7-20 game days
LIFE.economy.isItemSoldOut = function(itemName) {
    var ts = LIFE.state.purchaseTimestamps;
    if (!ts || !ts[itemName]) return false;
    // Calculate current game day: age * 365 + (yearTimer / YEAR_DURATION) * 365
    var currentDay = LIFE.state.age * 365 + (LIFE.state.yearTimer / LIFE.YEAR_DURATION) * 365;
    var purchaseDay = ts[itemName].day;
    var restockDays = ts[itemName].restock;
    return (currentDay - purchaseDay) < restockDays;
};

LIFE.economy.markPurchased = function(itemName) {
    if (!LIFE.state.purchaseTimestamps) LIFE.state.purchaseTimestamps = {};
    var currentDay = LIFE.state.age * 365 + (LIFE.state.yearTimer / LIFE.YEAR_DURATION) * 365;
    // Weapons/contraband restock slower (14-20 days), consumables faster (7-12 days)
    var isWeapon = (itemName === 'Pistol' || itemName === 'Switchblade');
    var restockDays = isWeapon ? (14 + Math.floor(Math.random() * 7)) : (7 + Math.floor(Math.random() * 6));
    LIFE.state.purchaseTimestamps[itemName] = { day: currentDay, restock: restockDays };
};

// Sell an item from inventory for its value
LIFE.economy.sellItem = function(itemName) {
    var idx = LIFE.state.inventory.indexOf(itemName);
    if (idx < 0) return false;
    var data = LIFE.ITEM_DATA[itemName];
    if (!data || !data.value) return false;
    LIFE.state.money += data.value;
    LIFE.state.inventory.splice(idx, 1);
    if (LIFE.state.equippedIndex === idx) {
        LIFE.state.equippedIndex = 0;
        LIFE.updateHeldWeapon();
    } else if (LIFE.state.equippedIndex > idx) {
        LIFE.state.equippedIndex--;
    }
    return true;
};

LIFE.economy.getLifeSummary = function() {
    var s = LIFE.state;
    var career = LIFE.economy.getCareer();
    var name = s.playerName || 'Unknown';
    var paras = [];

    // Compute moral alignment score
    var goodDeeds = (s.livesHelped || 0) * 3 + (s.volunteerHours || 0) * 2 + (s.peopleMentored || 0) * 3 +
                    (s.charitableDonations || 0) / 100 + (s.totalSpeeches || 0) + (s.scholarshipsGiven || 0) * 2;
    var badDeeds = (s.kills || 0) * 5 + (s.totalThefts || 0) * 2 + (s.totalExtortions || 0) * 3 +
                   (s.innocentsHarmed || 0) * 2 + (s.betrayals || 0) * 3 + (s.arsonCount || 0) * 4;
    var alignment = goodDeeds - badDeeds + s.reputation;
    var repInfo = LIFE.getRepTitle(s.reputation);

    // === OPENING PARAGRAPH: Death notice ===
    var opening = name + ' passed away at the age of ' + s.age;
    if (s.deathCause === 'health' || s.deathCause === 'poor health') opening += ' after a long struggle with failing health.';
    else if (s.deathCause === 'substance abuse') opening += ', succumbing to the effects of substance abuse.';
    else if (s.deathCause === 'Police') opening += ' in a fatal confrontation with law enforcement.';
    else if (s.deathCause === 'injuries') opening += ' from injuries sustained in an altercation.';
    else if (s.deathCause === 'died in prison') opening += ' while serving time in prison.';
    else if (s.deathCause === 'executed for crimes') opening += ' by execution, having been convicted of serious crimes.';
    else if (s.deathCause === 'inmate attack') opening += ' after being attacked by a fellow inmate.';
    else if (s.age >= 75) opening += ', passing peacefully after a long life.';
    else if (s.age >= 60) opening += '.';
    else opening += ', taken far too soon.';
    paras.push(opening);

    // === CAREER & FINANCES PARAGRAPH ===
    var careerPara = '';
    var careerTitle = career ? career.title : 'Unemployed';
    if (career && career.income > 0) {
        careerPara = 'In life, ' + name + ' worked as a ' + careerTitle;
        if (s.careerLevel > 0) careerPara += ', rising to level ' + s.careerLevel + ' in their field';
        careerPara += '.';
    } else {
        careerPara = name + ' never held a steady career.';
    }
    if (s.fame >= 75) {
        var fameInfo = LIFE.economy.getFameLevel();
        careerPara += ' They achieved ' + fameInfo.title.toLowerCase() + ' status, becoming a household name.';
    } else if (s.fame >= 30) {
        careerPara += ' They gained some measure of local fame along the way.';
    }
    var netWorth = Math.floor(Math.max(0, s.money));
    if (netWorth > 500000) careerPara += ' They amassed a fortune of $' + netWorth.toLocaleString() + '.';
    else if (netWorth > 50000) careerPara += ' They left behind $' + netWorth.toLocaleString() + ' in savings.';
    else if (netWorth < 100) careerPara += ' They died with virtually nothing to their name.';

    if (s.properties && s.properties.length > 0) {
        careerPara += ' They owned ' + s.properties.length + ' propert' + (s.properties.length > 1 ? 'ies' : 'y') + '.';
    }
    if (s.ownedCar) careerPara += ' They drove a ' + s.ownedCar.name + '.';
    paras.push(careerPara);

    // === FAMILY PARAGRAPH ===
    var familyPara = '';
    if (s.married && s.hasKids) {
        familyPara = name + ' is survived by ' + (s.spouseName ? 'their spouse ' + s.spouseName : 'a loving spouse');
        if (s.childCount > 0) {
            var kidNames = s.childNames && s.childNames.length > 0 ? s.childNames.join(', ') : '';
            familyPara += ' and ' + s.childCount + ' child' + (s.childCount > 1 ? 'ren' : '');
            if (kidNames) familyPara += ' (' + kidNames + ')';
        }
        familyPara += '.';
    } else if (s.married) {
        familyPara = name + ' is survived by ' + (s.spouseName ? 'their spouse ' + s.spouseName : 'a loving spouse') + '. They had no children.';
    } else if (s.hasKids && s.childCount > 0) {
        var kidNames2 = s.childNames && s.childNames.length > 0 ? s.childNames.join(', ') : '';
        familyPara = name + ' is survived by ' + s.childCount + ' child' + (s.childCount > 1 ? 'ren' : '') + (kidNames2 ? ' (' + kidNames2 + ')' : '') + '. They never married.';
    } else {
        familyPara = name + ' never married and had no children.';
    }

    if (s.friends > 5) familyPara += ' They were surrounded by many friends — ' + s.friends + ' people called them a friend.';
    else if (s.friends > 0) familyPara += ' They had ' + s.friends + ' close friend' + (s.friends > 1 ? 's' : '') + '.';
    else familyPara += ' They died alone, without any close friends.';

    if (s.enemies > 5) familyPara += ' They also made plenty of enemies — ' + s.enemies + ' people bore them a grudge.';
    else if (s.enemies > 0) familyPara += ' ' + s.enemies + ' person' + (s.enemies > 1 ? 's' : '') + ' considered them an enemy.';
    paras.push(familyPara);

    // === GOOD DEEDS PARAGRAPH ===
    var goodParts = [];
    if ((s.livesHelped || 0) > 0) goodParts.push('directly helped or saved ' + s.livesHelped + ' ' + (s.livesHelped > 1 ? 'lives' : 'life'));
    if ((s.peopleMentored || 0) > 0) goodParts.push('mentored ' + s.peopleMentored + ' ' + (s.peopleMentored > 1 ? 'people' : 'person'));
    if ((s.volunteerHours || 0) > 0) goodParts.push('volunteered their time on ' + s.volunteerHours + ' occasion' + (s.volunteerHours > 1 ? 's' : ''));
    if ((s.charitableDonations || 0) > 0) goodParts.push('donated $' + s.charitableDonations.toLocaleString() + ' to charitable causes');
    if ((s.totalSpeeches || 0) > 0) goodParts.push('gave ' + s.totalSpeeches + ' inspirational speech' + (s.totalSpeeches > 1 ? 'es' : ''));
    if ((s.addictionRecoveries || 0) > 0) goodParts.push('helped ' + s.addictionRecoveries + ' person' + (s.addictionRecoveries > 1 ? 's' : '') + ' recover from addiction');
    if ((s.scholarshipsGiven || 0) > 0) goodParts.push('supported ' + s.scholarshipsGiven + ' academic achievement' + (s.scholarshipsGiven > 1 ? 's' : ''));

    if (goodParts.length > 0) {
        var goodPara = 'Throughout their life, ' + name + ' ' + goodParts[0];
        for (var gi = 1; gi < goodParts.length; gi++) {
            goodPara += (gi === goodParts.length - 1) ? ', and ' : ', ';
            goodPara += goodParts[gi];
        }
        goodPara += '.';
        paras.push(goodPara);
    }

    // === DARK DEEDS PARAGRAPH ===
    var darkParts = [];
    if (s.kills > 0) darkParts.push('took ' + s.kills + ' ' + (s.kills > 1 ? 'lives' : 'life'));
    if ((s.totalThefts || 0) > 0) darkParts.push('committed ' + s.totalThefts + ' theft' + (s.totalThefts > 1 ? 's' : ''));
    if ((s.totalExtortions || 0) > 0) darkParts.push('extorted ' + s.totalExtortions + ' ' + (s.totalExtortions > 1 ? 'people' : 'person'));
    if ((s.betrayals || 0) > 0) darkParts.push('betrayed ' + s.betrayals + ' ' + (s.betrayals > 1 ? 'people' : 'person'));
    if ((s.innocentsHarmed || 0) > 0) darkParts.push('harmed ' + s.innocentsHarmed + ' innocent' + (s.innocentsHarmed > 1 ? 's' : ''));
    if (s.timesJailed > 0) darkParts.push('spent time in prison ' + s.timesJailed + ' time' + (s.timesJailed > 1 ? 's' : ''));
    if (s.drugUses > 0) darkParts.push('used drugs on ' + s.drugUses + ' occasion' + (s.drugUses > 1 ? 's' : ''));

    if (darkParts.length > 0) {
        var darkPara = 'However, ' + name + '\'s life was not without darkness. They ' + darkParts[0];
        for (var di = 1; di < darkParts.length; di++) {
            darkPara += (di === darkParts.length - 1) ? ', and ' : ', ';
            darkPara += darkParts[di];
        }
        darkPara += '.';
        if (s.bounty > 0) darkPara += ' An outstanding bounty of $' + s.bounty.toLocaleString() + ' remained on their head.';
        paras.push(darkPara);
    }

    // === FAMILY VIOLENCE ===
    if (s.familyKiller && s.killedFamily && s.killedFamily.length > 0) {
        paras.push('In perhaps the most tragic chapter of their story, ' + name + ' murdered members of their own family: ' + s.killedFamily.join(', ') + '.');
    } else if (s.familyAbuser) {
        paras.push(name + ' was known to be violent toward members of their own family.');
    }

    // === KEY MOMENTS PARAGRAPH ===
    if (s.milestones && s.milestones.length > 0) {
        var sorted = s.milestones.slice().sort(function(a,b) { return a.age - b.age; });
        var momentPara = 'Looking back, several moments defined ' + name + '\'s life: ';
        var shown = Math.min(sorted.length, 8);
        for (var mi = 0; mi < shown; mi++) {
            var m = sorted[mi];
            momentPara += 'At age ' + m.age + ', they ' + m.text.charAt(0).toLowerCase() + m.text.slice(1);
            if (mi < shown - 1) momentPara += '. ';
            else momentPara += '.';
        }
        paras.push(momentPara);
    }

    // === CHARACTER SUMMARY LINE ===
    var charDesc = [];
    if (s.stats.intelligence >= 80) charDesc.push('brilliant');
    else if (s.stats.intelligence >= 50) charDesc.push('sharp-minded');
    else if (s.stats.intelligence < 25) charDesc.push('simple');
    if (s.stats.charisma >= 80) charDesc.push('incredibly charismatic');
    else if (s.stats.charisma >= 50) charDesc.push('well-spoken');
    else if (s.stats.charisma < 20) charDesc.push('awkward');
    if (s.stats.happiness >= 80) charDesc.push('deeply content');
    else if (s.stats.happiness < 20) charDesc.push('profoundly unhappy');
    if (s.stats.beauty >= 80) charDesc.push('strikingly beautiful');

    if (charDesc.length > 0) {
        var charPara = 'Those who knew ' + name + ' would describe them as ' + charDesc.join(', ');
        if (repInfo.title) charPara += ', with a reputation as someone ' + repInfo.title.toLowerCase();
        charPara += '.';
        paras.push(charPara);
    } else if (repInfo.title) {
        paras.push('In the community, ' + name + ' was known as someone ' + repInfo.title.toLowerCase() + '.');
    }

    // === CLOSING EPITAPH ===
    var epitaph = '';
    if (alignment > 100 && s.reputation >= 70 && (s.livesHelped || 0) >= 5) {
        epitaph = 'The world lost a beacon of light today. ' + name + ' dedicated their life to making others\' lives better. Their name will be spoken with gratitude and reverence for generations to come.';
    } else if (alignment > 60 && s.reputation >= 40) {
        epitaph = 'A good person has left this world. They chose kindness when it would have been easier to look away. The community is poorer for their passing.';
    } else if (alignment < -100 && s.kills >= 5) {
        epitaph = 'A shadow has lifted from this world. ' + name + ' left behind a trail of suffering and broken lives. History will remember them as a cautionary tale of what happens when someone chooses darkness at every turn.';
    } else if (alignment < -60 && s.reputation <= -50) {
        epitaph = 'Few will mourn their passing. Their life was a series of choices that brought pain to those around them. The world moves on, scarred but unbowed.';
    } else if (s.kills === 0 && s.timesJailed === 0 && s.friends <= 2 && s.reputation > -10 && s.reputation < 10 && s.fame < 10) {
        epitaph = 'They came. They lived. They left. No headlines, no monuments, no great deeds or terrible sins. Just another life that passed through the world like a leaf on the wind.';
    } else if (s.fame >= 75 && s.reputation >= 30) {
        epitaph = 'A star has gone out. Millions knew their name, and many loved them. Their legacy will echo through the culture for years to come.';
    } else if (s.money > 1000000 && s.reputation > 0) {
        epitaph = 'They built an empire and left behind a fortune. Whether the world is better for it remains to be seen.';
    } else if (s.married && s.hasKids && s.reputation >= 0) {
        epitaph = 'They built a family, loved deeply, and left behind the most important legacy of all — the people whose lives they shaped.';
    } else if (s.stats.happiness >= 80 && s.reputation >= 0) {
        epitaph = 'They lived joyfully and without regret. Not everyone changes the world, but they enjoyed the one they were given.';
    } else if (s.kills > 0 && s.reputation < -30) {
        epitaph = 'Blood stains their legacy. The choices they made cannot be undone, and those they hurt will carry the scars long after today.';
    } else {
        epitaph = 'And so another life comes to an end. They were neither saint nor sinner — just human.';
    }
    paras.push(epitaph);

    return paras.join('\n\n');
};
