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
        { name: 'Hot Dog',         cost: 3,     stat: 'happiness',    amount: 2,  minAge: 5 },
        { name: 'Pizza Slice',     cost: 5,     stat: 'happiness',    amount: 3,  minAge: 5 },
        { name: 'Smoothie',        cost: 8,     stat: 'health',       amount: 2,  minAge: 8 },
        { name: 'Full Meal',       cost: 20,    stat: 'happiness',    amount: 5,  minAge: 10 },
        { name: 'Protein Shake',   cost: 15,    stat: 'health',       amount: 4,  minAge: 14 },
        { name: 'Fancy Dinner',    cost: 80,    stat: 'happiness',    amount: 8,  minAge: 18 }
    ],
    'Clothes Shop': [
        { name: 'T-Shirt',         cost: 15,    stat: 'charisma',     amount: 1,  minAge: 5 },
        { name: 'Nice Outfit',     cost: 60,    stat: 'charisma',     amount: 3,  minAge: 12 },
        { name: 'Designer Clothes',cost: 200,   stat: 'charisma',     amount: 6,  minAge: 16 },
        { name: 'Formal Suit',     cost: 400,   stat: 'charisma',     amount: 8,  minAge: 20 },
        { name: 'Luxury Watch',    cost: 1500,  stat: 'charisma',     amount: 5,  minAge: 25, once: true },
        { name: 'Designer Shoes',  cost: 300,   stat: 'charisma',     amount: 4,  minAge: 16 }
    ],
    'Pharmacist': [
        { name: 'Vitamins',        cost: 10,    stat: 'health',       amount: 3,  minAge: 5 },
        { name: 'Cold Medicine',   cost: 15,    stat: 'health',       amount: 4,  minAge: 8 },
        { name: 'Pain Killers',    cost: 20,    stat: 'health',       amount: 5,  minAge: 14 },
        { name: 'Supplements',     cost: 40,    stat: 'health',       amount: 6,  minAge: 16 },
        { name: 'Prescription',    cost: 100,   stat: 'health',       amount: 10, minAge: 18 },
        { name: 'First Aid Kit',   cost: 50,    stat: 'health',       amount: 8,  minAge: 10, once: true }
    ],
    'Bookstore': [
        { name: 'Comic Book',      cost: 5,     stat: 'happiness',    amount: 2,  minAge: 5 },
        { name: 'Novel',           cost: 12,    stat: 'intelligence', amount: 2,  minAge: 8 },
        { name: 'Textbook',        cost: 40,    stat: 'intelligence', amount: 4,  minAge: 12 },
        { name: 'Self-Help Book',  cost: 25,    stat: 'charisma',     amount: 3,  minAge: 14 },
        { name: 'Encyclopedia Set',cost: 150,   stat: 'intelligence', amount: 8,  minAge: 16, once: true },
        { name: 'Online Course',   cost: 200,   stat: 'intelligence', amount: 6,  minAge: 18 }
    ],
    'Gym Trainer': [
        { name: 'Workout Session', cost: 15,    stat: 'health',       amount: 3,  minAge: 12 },
        { name: 'Personal Training',cost: 50,   stat: 'health',       amount: 6,  minAge: 16 },
        { name: 'Gym Membership',  cost: 120,   stat: 'health',       amount: 10, minAge: 14, once: true },
        { name: 'Yoga Class',      cost: 25,    stat: 'happiness',    amount: 4,  minAge: 14 },
        { name: 'Martial Arts',    cost: 80,    stat: 'health',       amount: 8,  minAge: 16 },
        { name: 'Sports Equipment',cost: 200,   stat: 'health',       amount: 5,  minAge: 10, once: true }
    ],
    'Ticket Seller': [
        { name: 'Event T-Shirt',   cost: 20,    stat: 'happiness',    amount: 3,  minAge: 5 },
        { name: 'Concert Poster',  cost: 15,    stat: 'happiness',    amount: 2,  minAge: 5 },
        { name: 'VIP Upgrade',     cost: 100,   stat: 'happiness',    amount: 8,  minAge: 16 },
        { name: 'Season Pass',     cost: 200,   stat: 'happiness',    amount: 10, minAge: 14, once: true },
        { name: 'Backstage Pass',  cost: 150,   stat: 'charisma',     amount: 6,  minAge: 18 },
        { name: 'Signed Merch',    cost: 80,    stat: 'happiness',    amount: 5,  minAge: 10 }
    ],
    'Electronics': [
        { name: 'Phone Case',      cost: 10,    stat: 'happiness',    amount: 1,  minAge: 10 },
        { name: 'Headphones',      cost: 30,    stat: 'happiness',    amount: 3,  minAge: 10, once: true },
        { name: 'Tablet',          cost: 200,   stat: 'intelligence', amount: 4,  minAge: 12, once: true },
        { name: 'Laptop',          cost: 600,   stat: 'intelligence', amount: 6,  minAge: 14, once: true },
        { name: 'Gaming Console',  cost: 400,   stat: 'happiness',    amount: 8,  minAge: 10, once: true },
        { name: 'Smartphone',      cost: 500,   stat: 'charisma',     amount: 5,  minAge: 14, once: true }
    ]
};

// Contraband - only available from Dealers
LIFE.DEALER_ITEMS = [
    { name: 'Switchblade',    cost: 200,   stat: 'charisma',     amount: 2,  minAge: 14, rep: -5,  type: 'switchblade', once: true },
    { name: 'Pistol',         cost: 2500,  stat: 'charisma',     amount: 2,  minAge: 18, rep: -10, type: 'gun', once: true },
    { name: 'Party Drugs',    cost: 50,    stat: 'happiness',    amount: 15, minAge: 16, rep: -5,  type: 'drug', healthCost: 10 },
    { name: 'Steroids',       cost: 300,   stat: 'health',       amount: 15, minAge: 18, rep: -3,  type: 'drug', healthCost: 5 },
    { name: 'Shady Deal',     cost: 100,   stat: 'charisma',     amount: 2,  minAge: 16, rep: -8,  type: 'drug', moneyBonus: 500 }
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
            LIFE.player.group.position.x = playerPos.x;
            LIFE.player.group.position.z = playerPos.z;
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
    // check once-only
    if (item.once && LIFE.state.purchasedOnce && LIFE.state.purchasedOnce.indexOf(item.name) >= 0) return false;
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
        LIFE.addWanted(1); // buying a gun illegally
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
        if (!LIFE.state.purchasedOnce) LIFE.state.purchasedOnce = [];
        LIFE.state.purchasedOnce.push(item.name);
    }
    return true;
};

LIFE.economy.buyVendorItem = function(vendorType, index) {
    var items = LIFE.VENDOR_ITEMS[vendorType];
    if (!items) return false;
    var item = items[index];
    if (!item || item.minAge > LIFE.state.age) return false;
    // check once-only
    if (item.once && LIFE.state.purchasedOnce && LIFE.state.purchasedOnce.indexOf(item.name) >= 0) return false;
    var price = item.cost;
    if (LIFE.state.stats.charisma > 50) price = Math.round(price * 0.9);
    if (!LIFE.economy.spend(price)) return false;
    LIFE.state.stats[item.stat] = Math.min(100, LIFE.state.stats[item.stat] + item.amount);
    if (item.rep) {
        LIFE.state.reputation = Math.max(-100, Math.min(100, LIFE.state.reputation + item.rep));
        LIFE.ui.showRepChange(item.rep);
    }
    // track once-only purchases
    if (item.once) {
        if (!LIFE.state.purchasedOnce) LIFE.state.purchasedOnce = [];
        LIFE.state.purchasedOnce.push(item.name);
    }
    return true;
};

LIFE.economy.buyDealerItem = function(index) {
    var item = LIFE.DEALER_ITEMS[index];
    if (!item || item.minAge > LIFE.state.age) return false;
    if (item.once && LIFE.state.purchasedOnce && LIFE.state.purchasedOnce.indexOf(item.name) >= 0) return false;
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
        LIFE.addWanted(1);
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
        if (!LIFE.state.purchasedOnce) LIFE.state.purchasedOnce = [];
        LIFE.state.purchasedOnce.push(item.name);
    }
    return true;
};

LIFE.economy.getLifeSummary = function() {
    var s = LIFE.state;
    var career = LIFE.economy.getCareer();
    var lines = [];
    lines.push('Died at age ' + s.age + (s.deathCause ? ' (' + s.deathCause + ')' : ''));
    lines.push('');
    lines.push('Career: ' + (career ? career.title : 'Unemployed') + (s.careerLevel > 0 ? ' (Lvl ' + s.careerLevel + ')' : ''));
    if (s.fame > 0) {
        var fameInfo = LIFE.economy.getFameLevel();
        lines.push('Fame: ' + fameInfo.title + ' (' + Math.floor(s.fame) + ')');
    }
    lines.push('Married: ' + (s.married ? (s.spouseName || 'Yes') : 'No'));
    lines.push('Children: ' + (s.childCount || 0));
    lines.push('Savings: $' + Math.floor(Math.max(0, s.money)).toLocaleString());
    if (s.ownedCar) lines.push('Car: ' + s.ownedCar.name);
    if (s.properties && s.properties.length > 0) {
        lines.push('Properties: ' + s.properties.length);
        var totalRent = 0;
        s.properties.forEach(function(p) { totalRent += p.rent; });
        lines.push('Rental Income: $' + totalRent.toLocaleString() + '/year');
    }
    if (s.investments && s.investments.length > 0) {
        var totalInv = 0;
        s.investments.forEach(function(inv) { totalInv += inv.value; });
        lines.push('Investment Portfolio: $' + totalInv.toLocaleString());
    }
    lines.push('Friends: ' + s.friends + '  |  Enemies: ' + s.enemies);
    if (s.kills > 0) lines.push('Kills: ' + s.kills);
    if (s.timesJailed > 0) lines.push('Times Jailed: ' + s.timesJailed);
    if (s.bounty > 0) lines.push('Outstanding Bounty: $' + s.bounty);
    if (s.drugUses > 0) lines.push('Drug Uses: ' + s.drugUses);
    lines.push('');
    lines.push('Intelligence: ' + Math.floor(s.stats.intelligence));
    lines.push('Happiness: ' + Math.floor(s.stats.happiness));
    lines.push('Charisma: ' + Math.floor(s.stats.charisma));
    lines.push('Health: ' + Math.floor(Math.max(0, s.stats.health)));
    lines.push('');
    var repInfo = LIFE.getRepTitle(s.reputation);
    lines.push('Reputation: ' + (repInfo.title || 'Neutral') + ' (' + (s.reputation > 0 ? '+' : '') + Math.floor(s.reputation) + ')');
    lines.push('');
    var best = 'happiness', bestVal = s.stats.happiness;
    for (var k in s.stats) { if (s.stats[k] > bestVal) { bestVal = s.stats[k]; best = k; } }
    var epitaphs = {
        happiness: 'You lived a joyful life full of laughter.',
        intelligence: 'You dedicated your life to knowledge and discovery.',
        charisma: 'You were loved by all who knew you.',
        health: 'You lived a strong and active life.'
    };
    if (s.money > 100000) lines.push('You left behind a comfortable fortune.');
    else if (s.money > 10000) lines.push('You lived comfortably within your means.');
    else if (s.money < 0) lines.push('You died in debt.');
    else lines.push('Money was never your priority.');
    lines.push(epitaphs[best] || '');
    if (s.fame >= 75) lines.push('Your name will be remembered by millions.');
    else if (s.fame >= 50) lines.push('You achieved the fame you always dreamed of.');
    if (s.reputation >= 80) lines.push('You will be remembered as a true hero.');
    else if (s.reputation >= 50) lines.push('People will speak fondly of you.');
    else if (s.reputation <= -80) lines.push('Your name will be feared for generations.');
    else if (s.reputation <= -50) lines.push('Many breathed a sigh of relief.');
    else if (s.reputation <= -25) lines.push('You left behind a troubled legacy.');
    if (s.familyKiller && s.killedFamily && s.killedFamily.length > 0) {
        lines.push('You murdered your own family... ' + s.killedFamily.join(', ') + '.');
    } else if (s.familyAbuser) {
        lines.push('You were violent toward your own family.');
    }
    if (s.kills > 0) lines.push('Blood stains your legacy... ' + s.kills + ' lives taken.');
    if (s.timesJailed > 0) lines.push('You spent years behind bars.');
    if (s.friends > 5) lines.push('You were surrounded by friends until the end.');
    if (s.enemies > 5) lines.push('You made many enemies along the way.');
    if (s.drugUses > 5) lines.push('Addiction haunted your final days.');
    return lines.join('\n');
};
