// ============================================================
// GAME CONFIGURATION & CONSTANTS
// ============================================================
const LIFE = {};

LIFE.YEAR_DURATION = 438000; // 365 days * 20 min * 60 sec
LIFE.DAY_DURATION = 1200;    // 20 real minutes per in-game day
LIFE.MAX_AGE = 80;
LIFE.GRAVITY = -25;

// ============================================================
// STAGE DEFINITIONS
// ============================================================
LIFE.STAGES = {
    womb:       { ages: [-1, -1], bg: 0x1a0000, fog: [0x1a0000, 1, 8],    ground: 0x330000 },
    nursery:    { ages: [0, 1],   bg: 0xfff8e1, fog: [0xfff8e1, 15, 40],  ground: 0xf5deb3 },
    home:       { ages: [2, 4],   bg: 0x87ceeb, fog: [0x87ceeb, 40, 120],  ground: 0x4a7c3f },
    school:     { ages: [5, 11],  bg: 0x87ceeb, fog: [0x87ceeb, 50, 160],  ground: 0x4a7c3f },
    highschool: { ages: [12, 17], bg: 0x6eb5e0, fog: [0x6eb5e0, 50, 160],  ground: 0x556b2f },
    college:    { ages: [18, 22], bg: 0x6db3d1, fog: [0x6db3d1, 55, 170],  ground: 0x3d6b35 },
    city:       { ages: [23, 64], bg: 0x8899aa, fog: [0x8899aa, 60, 200],  ground: 0x555555 },
    retirement: { ages: [65, 79], bg: 0xaed6f1, fog: [0xaed6f1, 45, 140],  ground: 0x5a8f4a },
    playerhome: { ages: [-4, -4], bg: 0xfff8e1, fog: [0xfff8e1, 10, 30],  ground: 0xdeb887 },
    jail:       { ages: [-2, -2], bg: 0x1a1a1a, fog: [0x1a1a1a, 5, 15],   ground: 0x3e2723 },
    execution:  { ages: [-3, -3], bg: 0x1a1a1a, fog: [0x1a1a1a, 8, 25],   ground: 0x2e2e2e },
    death:      { ages: [80, 80], bg: 0x000000, fog: [0x000000, 1, 20],   ground: 0x111111 },
    // school day sub-stages (not age-mapped, used by day cycle)
    classroom:    { ages: [-5, -5], bg: 0xfff8e1, fog: [0xfff8e1, 10, 25], ground: 0xf5deb3 },
    hsclassroom:  { ages: [-6, -6], bg: 0xf0f0f0, fog: [0xf0f0f0, 10, 25], ground: 0xbdbdbd },
    // hospital (teleported to, not age-mapped)
    hospital:     { ages: [-7, -7], bg: 0xf5f5f5, fog: [0xf5f5f5, 12, 30], ground: 0xe0e0e0 },
    // event center (in open world, not age-mapped)
    eventcenter:  { ages: [-8, -8], bg: 0x87ceeb, fog: [0x87ceeb, 50, 160], ground: 0x555555 },
    // workplace interiors (entered via doors on career buildings)
    workplace:    { ages: [-9, -9], bg: 0xf0f0f0, fog: [0xf0f0f0, 10, 25], ground: 0xbdbdbd }
};

// ============================================================
// ACTION DEFINITIONS
// ============================================================
LIFE.ACTION_DEFS = {
    cry:        { label: 'Cry',        text: 'WAAHH!!',         color: '#64b5f6' },
    laugh:      { label: 'Laugh',      text: 'Hahaha!',         color: '#fff176' },
    talk:       { label: 'Talk',       text: 'Hello!',          color: '#fff' },
    babble:     { label: 'Babble',     text: 'Goo goo!',        color: '#f8bbd0' },
    punch:      { label: 'Punch',      text: 'POW!',            color: '#ef5350' },
    dance:      { label: 'Dance',      text: '♪♫♪',            color: '#ce93d8' },
    wave:       { label: 'Wave',       text: '*waves*',         color: '#81c784' },
    work:       { label: 'Work',       text: '*working*',       color: '#90a4ae' },
    sit:        { label: 'Sit',        text: '*sits down*',     color: '#a1887f' },
    play:       { label: 'Play',       text: 'Wheee!',          color: '#ffab40' },
    shop:       { label: 'Shop',       text: 'Shopping...',     color: '#ab47bc' },
    study:      { label: 'Study',      text: '*studying...*',   color: '#42a5f5' },
    exercise:   { label: 'Exercise',   text: '*working out*',   color: '#66bb6a' },
    volunteer:  { label: 'Volunteer',  text: '*helping out*',   color: '#ffb74d' },
    steal:      { label: 'Steal',      text: '*sneaking...*',   color: '#b71c1c' },
    intimidate: { label: 'Threaten',   text: '*glares*',        color: '#880e4f' },
    meditate:   { label: 'Meditate',   text: '*meditating...*', color: '#80cbc4' },
    beg:        { label: 'Beg',        text: 'Spare change?',   color: '#bcaaa4' },
    pickpocket: { label: 'Pickpocket', text: '*reaches in...*', color: '#d32f2f' },
    preach:     { label: 'Inspire',    text: '*speaks up*',     color: '#ffd54f' }
};

// ============================================================
// NPC DEFINITIONS PER STAGE
// ============================================================
LIFE.NPC_NAMES = {
    nursery:    ['Mom', 'Dad'],
    home:       ['Mom', 'Dad', 'Sibling'],
    school:     ['Teacher', 'Kid', 'Kid', 'Kid', 'Kid', 'Kid'],
    highschool: ['Teacher', 'Student', 'Student', 'Student', 'Student', 'Student', 'Student', 'Student', 'Dealer'],
    college:    ['Professor', 'Student', 'Student', 'Student', 'Student', 'Student', 'Student', 'Dealer', 'Bookstore', 'Gym Trainer'],
    city:       ['Stranger', 'Stranger', 'Stranger', 'Stranger', 'Stranger', 'Neighbor', 'Neighbor', 'Dealer', 'Food Vendor', 'Clothes Shop', 'Electronics', 'Real Estate Agent', 'Organ Buyer', 'Fence', 'Arms Dealer'],
    retirement: ['Neighbor', 'Stranger', 'Stranger', 'Pharmacist'],
    classroom:  ['Teacher', 'Kid', 'Kid', 'Kid'],
    hsclassroom:['Teacher', 'Student', 'Student', 'Student', 'Student'],
    hospital:   ['Doctor', 'Nurse', 'Nurse'],
    dealership: ['Car Salesman'],
    eventcenter: ['Ticket Seller', 'Food Vendor', 'Stranger', 'Stranger'],
    workplace: ['Coworker', 'Coworker', 'Boss'],
    police_interior: ['Police', 'Police']
};

// Job buildings placed in city (x, z, career, label)
LIFE.JOB_BUILDINGS = [
    { x: -30, z: -20, career: 'business', label: 'Office', color: 0x37474f },
    { x: -30, z: 20,  career: 'doctor',   label: 'Hospital', color: 0xffffff },
    { x: 30,  z: -20, career: 'teacher',  label: 'School', color: 0xc62828 },
    { x: 30,  z: 20,  career: 'artist',   label: 'Art Studio', color: 0x7b1fa2 },
    { x: 0,   z: 25,  career: 'scientist', label: 'Research Lab', color: 0x1565c0 },
    { x: -15, z: 25,  career: 'worker',   label: 'Store', color: 0x4caf50 },
    // fame careers
    { x: 15,  z: 25,  career: 'musician', label: 'Music Studio', color: 0x9c27b0 },
    { x: 0,   z: -25, career: 'athlete',  label: 'Sports Arena', color: 0xff5722 },
    { x: -15, z: -25, career: 'streamer', label: 'Media House', color: 0x00bcd4 },
    { x: 15,  z: -25, career: 'actor',    label: 'Theater', color: 0xffc107 }
];

// Property buildings placed in city (x, z, propertyIndex, label)
// Only some properties have physical buildings - others are "remote" purchases
LIFE.PROPERTY_BUILDINGS = [
    { x: -40, z: 15,  propIdx: 0, label: 'Apartment', color: 0x78909c, w: 8, h: 10, d: 6 },
    { x: -40, z: -15, propIdx: 1, label: 'Condo',     color: 0x90a4ae, w: 8, h: 12, d: 7 },
    { x: 40,  z: 15,  propIdx: 2, label: 'House',     color: 0xffcc80, w: 10, h: 5, d: 8, isHome: true },
    { x: 40,  z: -15, propIdx: 3, label: 'Luxury House', color: 0xffd54f, w: 12, h: 6, d: 10, isHome: true },
    { x: -25, z: 35,  propIdx: 5, label: 'Commercial', color: 0x607d8b, w: 10, h: 7, d: 8 }
];

// Cars available at dealership
LIFE.CAR_MODELS = [
    { name: 'Used Sedan',     cost: 3000,   speed: 12,  color: 0x78909c, minAge: 16 },
    { name: 'Compact',        cost: 8000,   speed: 14,  color: 0x42a5f5, minAge: 16 },
    { name: 'SUV',            cost: 18000,  speed: 13,  color: 0x2e7d32, minAge: 18 },
    { name: 'Sports Car',     cost: 45000,  speed: 20,  color: 0xef5350, minAge: 18 },
    { name: 'Luxury Sedan',   cost: 80000,  speed: 16,  color: 0x212121, minAge: 21 },
    { name: 'Supercar',       cost: 200000, speed: 25,  color: 0xffc107, minAge: 21 }
];

// NPC first names split by gender
LIFE.MALE_NAMES = [
    'Jack', 'Ethan', 'Noah', 'Logan', 'Ryan', 'Dylan', 'Owen', 'Cole',
    'Leo', 'Finn', 'Luke', 'Tyler', 'Max', 'Kai', 'Tommy', 'Drew',
    'Blake', 'Jesse', 'Parker', 'Reese', 'Alex', 'Sam', 'Charlie',
    'Marcus', 'Daniel', 'James', 'Aiden', 'Caleb', 'Mason', 'Hunter'
];
LIFE.FEMALE_NAMES = [
    'Zoe', 'Mia', 'Ruby', 'Ivy', 'Luna', 'Ella', 'Lily', 'Chloe',
    'Grace', 'Sophie', 'Maya', 'Nora', 'Riley', 'Harper', 'Avery',
    'Quinn', 'Kelly', 'Sky', 'Emma', 'Olivia', 'Aria', 'Stella',
    'Violet', 'Hazel', 'Clara', 'Willow', 'Ellie', 'Layla', 'Sadie'
];
// combined for backwards compat
LIFE.NPC_FIRST_NAMES = LIFE.MALE_NAMES.concat(LIFE.FEMALE_NAMES);
// Last names for NPCs
LIFE.LAST_NAMES = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson',
    'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Clark', 'Lewis', 'Robinson',
    'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Green', 'Baker',
    'Adams', 'Nelson', 'Hill', 'Ramirez', 'Campbell', 'Mitchell', 'Roberts',
    'Carter', 'Phillips', 'Evans', 'Turner', 'Torres', 'Parker', 'Collins',
    'Edwards', 'Stewart', 'Flores', 'Morris', 'Murphy', 'Rivera', 'Cook',
    'Rogers', 'Morgan', 'Peterson', 'Cooper', 'Reed', 'Bailey', 'Bell', 'Ward'
];
// Types that get individual first names (multiple NPCs of same type)
LIFE.NPC_NEEDS_NAME = { Kid: true, Student: true, Stranger: true, Neighbor: true, Coworker: true, Inmate: true, 'Old Friend': true };

// Types where nametag ALWAYS shows their role title (player can see their occupation/role)
LIFE.NPC_TITLE_VISIBLE = {
    Teacher: true, Professor: true, Doctor: true, Nurse: true, Police: true,
    Dealer: true, 'Car Salesman': true, 'Real Estate Agent': true, 'Food Vendor': true, 'Clothes Shop': true,
    'Pharmacist': true, 'Bookstore': true, 'Gym Trainer': true, 'Electronics': true,
    'Ticket Seller': true, Boss: true, 'Organ Buyer': true, 'Fence': true, 'Arms Dealer': true
};
// Types where nametag shows family relationship (always known)
LIFE.NPC_FAMILY_TITLE = {
    Mom: true, Dad: true, Sibling: true, Spouse: true, 'Your Child': true, Grandchild: true
};

LIFE.SKIN_COLORS = [0xffdbac, 0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0xffe0bd, 0xffd5b4];
LIFE.CLOTHES_COLORS = [0x2196f3, 0xf44336, 0x4caf50, 0xff9800, 0x9c27b0, 0x00bcd4, 0xe91e63, 0x795548, 0x607d8b, 0x3f51b5, 0xcddc39, 0xff5722];

// ============================================================
// NPC REGISTRY (persistent NPC identities across zone rebuilds)
// ============================================================
LIFE.npcRegistry = [];
LIFE._registryNextId = 1;

// How NPC types evolve as they age
LIFE.NPC_AGE_TYPE = function(age) {
    if (age < 5) return 'Kid';
    if (age < 12) return 'Kid';
    if (age < 18) return 'Student';
    if (age < 65) return 'Stranger';
    return 'Neighbor';
};

// Which zone an NPC type belongs to
LIFE.NPC_TYPE_ZONE = {
    Kid: 'school', Student: 'highschool',
    Stranger: 'city', Neighbor: 'retirement'
};

// Register a persistent NPC identity, returns the registry ID
LIFE.registerNPC = function(opts) {
    var entry = {
        rid: LIFE._registryNextId++,
        firstName: opts.firstName || 'Unknown',
        lastName: opts.lastName || LIFE.LAST_NAMES[Math.floor(Math.random() * LIFE.LAST_NAMES.length)],
        gender: opts.gender || (Math.random() < 0.5 ? 'M' : 'F'),
        birthYear: opts.birthYear !== undefined ? opts.birthYear : 0,
        deathAge: opts.deathAge || (65 + Math.floor(Math.random() * 30)),
        currentType: opts.currentType || 'Stranger',
        homeZone: opts.homeZone || 'city',
        skinColor: opts.skinColor !== undefined ? opts.skinColor : LIFE.SKIN_COLORS[Math.floor(Math.random() * LIFE.SKIN_COLORS.length)],
        clothesColor: opts.clothesColor !== undefined ? opts.clothesColor : LIFE.CLOTHES_COLORS[Math.floor(Math.random() * LIFE.CLOTHES_COLORS.length)],
        alive: true,
        isFamily: opts.isFamily || false,
        familyRole: opts.familyRole || null,
        gang: opts.gang || null,
        met: opts.met || false
    };
    LIFE.npcRegistry.push(entry);
    return entry;
};

// Find a registry entry by family role
LIFE.findRegistryByRole = function(role) {
    for (var i = 0; i < LIFE.npcRegistry.length; i++) {
        if (LIFE.npcRegistry[i].familyRole === role) return LIFE.npcRegistry[i];
    }
    return null;
};

// Find a registry entry by rid
LIFE.findRegistryById = function(rid) {
    for (var i = 0; i < LIFE.npcRegistry.length; i++) {
        if (LIFE.npcRegistry[i].rid === rid) return LIFE.npcRegistry[i];
    }
    return null;
};

// Get all alive registry entries for a given zone
LIFE.getRegistryForZone = function(zone) {
    var results = [];
    for (var i = 0; i < LIFE.npcRegistry.length; i++) {
        var e = LIFE.npcRegistry[i];
        if (e.alive && e.homeZone === zone && !e.isFamily) results.push(e);
    }
    return results;
};

// ============================================================
// GANG DEFINITIONS
// ============================================================
LIFE.GANGS = {
    serpents: {
        name: 'The Serpents',
        color: 0x4caf50,
        clothesColor: 0x2e7d32,
        labelColor: 'rgba(46,125,50,0.8)',
        territory: 'city',
        initiation: 'steal',
        minAge: 16,
        greeting: 'You look like you got some nerve. We could use that.',
        recruited: 'Welcome to the family, snake.'
    },
    reapers: {
        name: 'The Reapers',
        color: 0xf44336,
        clothesColor: 0xb71c1c,
        labelColor: 'rgba(183,28,28,0.8)',
        territory: 'city',
        initiation: 'kill',
        minAge: 18,
        greeting: 'Death walks with us. You ready to prove yourself?',
        recruited: 'Blood in, blood out. You\'re one of us now.'
    },
    shadows: {
        name: 'The Shadows',
        color: 0x7b1fa2,
        clothesColor: 0x4a148c,
        labelColor: 'rgba(74,20,140,0.8)',
        territory: 'highschool',
        initiation: 'deliver',
        minAge: 14,
        greeting: 'We move in silence. Interested in making some real money?',
        recruited: 'You\'re a shadow now. Move quiet, move smart.'
    }
};

// Gang rank thresholds
LIFE.GANG_RANKS = [
    { minRep: 0,  title: 'Prospect' },
    { minRep: 20, title: 'Member' },
    { minRep: 50, title: 'Lieutenant' },
    { minRep: 80, title: 'Boss' }
];

LIFE.getGangRank = function(rep) {
    var rank = LIFE.GANG_RANKS[0];
    for (var i = 0; i < LIFE.GANG_RANKS.length; i++) {
        if (rep >= LIFE.GANG_RANKS[i].minRep) rank = LIFE.GANG_RANKS[i];
    }
    return rank;
};

LIFE.STAGE_MESSAGES = {
    0:  'You are born!',
    1:  'Your first steps!',
    2:  'Growing up at home...',
    5:  'First day of school!',
    12: 'High school begins!',
    13: 'Teenager life!',
    16: 'Sweet sixteen!',
    18: 'Off to college!',
    21: 'Twenty-one!',
    23: 'Time to get a job!',
    30: 'Thirty already...',
    40: 'The big 4-0!',
    50: 'Half a century!',
    60: 'Getting older...',
    65: 'Retirement!',
    70: 'Seventy years young!',
    75: 'Slowing down...',
    80: '...'
};

// ============================================================
// AGE-BASED HELPER FUNCTIONS
// ============================================================
LIFE.getPunchDamage = function(age) {
    // babies/toddlers do basically nothing
    if (age <= 0) return 0;
    if (age < 3)  return 1;
    if (age < 6)  return 2;
    if (age < 10) return 4;
    if (age < 14) return 8;
    if (age < 18) return 14;
    if (age < 30) return 20; // peak damage
    if (age < 50) return 18;
    if (age < 65) return 14;
    if (age < 75) return 10;
    return 6; // elderly
};

LIFE.getActionsForAge = function(a) {
    if (a < 1)  return ['cry', 'laugh', 'punch'];
    if (a < 3)  return ['cry', 'punch', 'wave', 'laugh'];
    if (a < 5)  return ['talk', 'punch', 'play', 'wave'];
    if (a < 6)  return ['talk', 'punch', 'play', 'work'];
    if (a < 12) return ['talk', 'punch', 'work', 'dance'];
    if (a < 14) return ['talk', 'punch', 'work', 'dance'];
    if (a < 18) return ['talk', 'punch', 'work', 'shop'];
    if (a < 23) return ['talk', 'punch', 'work', 'shop'];
    if (a < 65) return ['talk', 'punch', 'work', 'shop'];
    return ['talk', 'punch', 'wave', 'shop'];
};

LIFE.getSpeedForAge = function(a, yearTimer) {
    // newborns cannot move at all, then slowly crawl
    if (a === 0 && yearTimer !== undefined && yearTimer < 20) return 0;
    if (a < 1)  return 0.6;
    if (a < 2)  return 1.5;
    if (a < 5)  return 3.0;
    if (a < 13) return 4.5;
    if (a < 30) return 6.0;
    if (a < 60) return 5.0;
    if (a < 70) return 3.5;
    return 2.0;
};

LIFE.getHeightForAge = function(a) {
    if (a < 0)  return 0.25;
    if (a < 1)  return 0.3;
    if (a < 2)  return 0.45;
    if (a < 5)  return 0.4 + a * 0.1;
    if (a < 13) return 0.7 + (a - 5) * 0.08;
    if (a < 18) return 1.34 + (a - 13) * 0.08;
    if (a < 25) return 1.7 + (a - 18) * 0.014;
    if (a < 70) return 1.77;
    return 1.77 - (a - 70) * 0.015;
};

LIFE.getStageForAge = function(a) {
    if (a < 0) return 'womb';
    for (var name in LIFE.STAGES) {
        var s = LIFE.STAGES[name];
        if (a >= s.ages[0] && a <= s.ages[1]) return name;
    }
    return 'death';
};

LIFE.getBoundsForStage = function(s) {
    var map = { womb: 3, nursery: 8, home: 20, school: 30, highschool: 35, college: 40, city: 50, retirement: 30, playerhome: 10, jail: 4, execution: 15, death: 15, classroom: 8, hsclassroom: 10, hospital: 10 };
    return map[s] || 20;
};

// Reputation title thresholds
LIFE.getRepTitle = function(rep) {
    if (rep <= -500) return { title: 'PURE EVIL', color: '#4a0000' };
    if (rep <= -300) return { title: 'MONSTER', color: '#6d0000' };
    if (rep <= -150) return { title: 'INFAMOUS', color: '#8b0000' };
    if (rep <= -80)  return { title: 'VILLAIN', color: '#b71c1c' };
    if (rep <= -50)  return { title: 'FEARED', color: '#e53935' };
    if (rep <= -25)  return { title: 'TROUBLEMAKER', color: '#ef5350' };
    if (rep <= -10)  return { title: 'DISLIKED', color: '#ef9a9a' };
    if (rep < 10)    return { title: '', color: '#999' };
    if (rep < 25)    return { title: 'LIKED', color: '#a5d6a7' };
    if (rep < 50)    return { title: 'RESPECTED', color: '#66bb6a' };
    if (rep < 80)    return { title: 'BELOVED', color: '#43a047' };
    if (rep < 150)   return { title: 'HERO', color: '#1b5e20' };
    if (rep < 300)   return { title: 'LEGEND', color: '#0d4f0d' };
    if (rep < 500)   return { title: 'ICON', color: '#ffd700' };
    return { title: 'SAINT', color: '#ffd700' };
};

// ============================================================
// RANDOM LIFE EVENTS (BitLife-style)
// ============================================================
LIFE.RANDOM_EVENTS = [
    // CHILDHOOD (5-12)
    { text: "You found a lost puppy on the way home from school!", minAge: 5, maxAge: 12, chance: 0.2, stages: ['home', 'school', 'city'],
      options: [
        { text: "Keep it! I'll take care of it!", effects: { happiness: 8 }, rep: 5 },
        { text: "Find the owner and return it", effects: { happiness: 3 }, rep: 12 },
        { text: "Leave it, not my problem", effects: {}, rep: -5 }
      ]},
    { text: "A bully is picking on a smaller kid at school!", minAge: 6, maxAge: 14, chance: 0.2, stages: ['school', 'classroom', 'highschool', 'hsclassroom'],
      options: [
        { text: "Stand up to the bully!", effects: { charisma: 5, health: -3 }, rep: 15, friend: true,
            onSelect: function() { LIFE.state.livesHelped++; LIFE.logMilestone('Stood up to a bully to protect another kid', 'good'); }},
        { text: "Tell a teacher", effects: { intelligence: 2 }, rep: 5 },
        { text: "Join the bully", effects: { charisma: -3 }, rep: -15, enemy: true,
            onSelect: function() { LIFE.state.innocentsHarmed++; LIFE.logMilestone('Joined a bully in tormenting a smaller kid', 'bad'); }},
        { text: "Walk away", effects: {}, rep: -3 }
      ]},
    { text: "You won a spelling bee at school!", minAge: 6, maxAge: 12, chance: 0.15, stages: ['school', 'classroom'],
      options: [
        { text: "Thank my teacher for helping me!", effects: { intelligence: 5, happiness: 3 }, rep: 8 },
        { text: "Brag about it to everyone!", effects: { happiness: 5, charisma: -2 }, rep: -3 }
      ]},
    // TEEN (13-17)
    { text: "Someone offered you a cigarette at a party.", minAge: 13, maxAge: 19, chance: 0.2, stages: ['city', 'highschool', 'college'],
      options: [
        { text: "No thanks, I'm good", effects: { health: 2 }, rep: 3 },
        { text: "Sure, why not?", effects: { happiness: 2, health: -5 }, rep: -1 },
        { text: "That stuff will kill you!", effects: { charisma: 2 }, rep: 5 }
      ]},
    { text: "You got caught cheating on a test!", minAge: 12, maxAge: 22, chance: 0.12, stages: ['school', 'classroom', 'highschool', 'hsclassroom', 'college'],
      options: [
        { text: "Apologize and accept the consequences", effects: { intelligence: -3, happiness: -5 }, rep: 3 },
        { text: "Deny everything", effects: { charisma: 2 }, rep: -5 },
        { text: "Blame someone else", effects: {}, rep: -8, enemy: true }
      ]},
    { text: "Your friend is in trouble and needs $100.", minAge: 14, maxAge: 70, chance: 0.15,
      options: [
        { text: "Of course! Here's the money.", effects: { happiness: 3 }, rep: 10, cost: 100, friend: true },
        { text: "Sorry, I can't afford it", effects: {}, rep: -3 },
        { text: "Only if you pay me back double", effects: { charisma: -2 }, rep: -3 }
      ]},
    // YOUNG ADULT (18-30)
    { text: "A stranger just collapsed on the street! They need help!", minAge: 16, maxAge: 80, chance: 0.12, stages: ['city', 'college', 'retirement'],
      options: [
        { text: "Rush over and help immediately!", effects: { happiness: 5 }, rep: 20,
            onSelect: function() { LIFE.state.livesHelped++; LIFE.logMilestone('Rushed to help a stranger who collapsed on the street', 'good'); }},
        { text: "Call 911 and stay with them", effects: { happiness: 3 }, rep: 12,
            onSelect: function() { LIFE.state.livesHelped++; }},
        { text: "Someone else will help them", effects: {}, rep: -5,
            onSelect: function() { LIFE.state.innocentsHarmed++; }}
      ]},
    { text: "You've been offered a promotion at work!", minAge: 25, maxAge: 60, chance: 0.15, stages: ['city'],
      options: [
        { text: "Accept it gladly!", effects: { happiness: 5, intelligence: 3 }, money: 500, rep: 5 },
        { text: "Negotiate for more money", effects: { charisma: 3 }, money: 800, rep: 2 },
        { text: "Decline - I'm happy where I am", effects: { happiness: 3 }, rep: 0 }
      ]},
    { text: "You got into a car accident!", minAge: 16, maxAge: 80, chance: 0.1, stages: ['city', 'home', 'school', 'highschool', 'college'],
      options: [
        { text: "It wasn't my fault! File insurance.", effects: { health: -10, happiness: -5 }, cost: 200 },
        { text: "Go to the hospital", effects: { health: -5, happiness: -3 }, hospital: 'carAccident' },
        { text: "Drive away before anyone sees", effects: { health: -5 }, rep: -15 }
      ]},
    { text: "You found a wallet on the ground with $500 inside!", minAge: 8, maxAge: 80, chance: 0.12, stages: ['city', 'college', 'school', 'highschool'],
      options: [
        { text: "Return it to the owner", effects: { happiness: 5 }, rep: 15,
            onSelect: function() { LIFE.logMilestone('Returned a wallet with $500 to the owner', 'good'); }},
        { text: "Keep the cash", effects: {}, money: 500, rep: -3,
            onSelect: function() { LIFE.state.totalThefts++; }},
        { text: "Turn it into the police", effects: { happiness: 2 }, rep: 10 }
      ]},
    // ADULT (30-60)
    { text: "A coworker is spreading rumors about you.", minAge: 23, maxAge: 60, chance: 0.12, stages: ['city'],
      options: [
        { text: "Confront them calmly", effects: { charisma: 3 }, rep: 5 },
        { text: "Spread rumors back", effects: { charisma: -3 }, rep: -5, enemy: true },
        { text: "Report to HR", effects: { intelligence: 2 }, rep: 3 },
        { text: "Let it go", effects: { happiness: -3 }, rep: 0 }
      ]},
    { text: "You received a surprise inheritance from a distant relative! $2,000!", minAge: 20, maxAge: 80, chance: 0.08,
      options: [
        { text: "Save it for the future", effects: { intelligence: 2 }, money: 2000 },
        { text: "Donate half to charity", effects: { happiness: 5 }, money: 1000, rep: 15,
            onSelect: function() { LIFE.state.charitableDonations += 1000; LIFE.logMilestone('Donated half of a $2000 inheritance to charity', 'good'); }},
        { text: "Spend it all on a party!", effects: { happiness: 8, charisma: 3 }, money: 2000, rep: 3 }
      ]},
    { text: "You got food poisoning from a restaurant!", minAge: 10, maxAge: 80, chance: 0.12,
      options: [
        { text: "Rest and recover", effects: { health: -8, happiness: -3 } },
        { text: "Go to the hospital", effects: { health: -3 }, hospital: 'foodPoisoning' },
        { text: "Sue the restaurant!", effects: { health: -6 }, money: 1000, rep: -3 }
      ]},
    { text: "A mugger approaches you in a dark alley!", minAge: 16, maxAge: 80, chance: 0.1, stages: ['city'],
      options: [
        { text: "Hand over your money", effects: { happiness: -8 }, cost: 200 },
        { text: "Fight back!", effects: { health: -15, charisma: 3 }, rep: 5 },
        { text: "Run away!", effects: { health: 2, happiness: -3 }, rep: 0 },
        { text: "Call for help!", effects: { happiness: -2 }, rep: 3 }
      ]},
    // SENIOR (60-80)
    { text: "You had a health scare. The doctor says you need to take better care of yourself.", minAge: 45, maxAge: 80, chance: 0.15,
      options: [
        { text: "Start exercising and eating better", effects: { health: 8, happiness: 3 }, rep: 2 },
        { text: "Go to the hospital for a full checkup", effects: { health: 5 }, hospital: 'illness' },
        { text: "Ignore the doctor's advice", effects: { health: -5, happiness: 2 }, rep: -2 }
      ]},
    { text: "An old friend from school reached out to you!", minAge: 30, maxAge: 80, chance: 0.12,
      options: [
        { text: "Meet up for coffee!", effects: { happiness: 6, charisma: 2 }, rep: 5, friend: true },
        { text: "Chat on the phone", effects: { happiness: 3 }, rep: 3 },
        { text: "Ignore the message", effects: {}, rep: -5 }
      ]},
    { text: "Your neighbor asked you to watch their house while they're away.", minAge: 20, maxAge: 80, chance: 0.1,
      options: [
        { text: "Of course! Happy to help!", effects: { happiness: 3 }, rep: 10 },
        { text: "Only if they pay me ($50)", effects: {}, money: 50, rep: -3 },
        { text: "I'm too busy, sorry", effects: {}, rep: -5 }
      ]},
    { text: "You won $200 in a scratch lottery ticket!", minAge: 18, maxAge: 80, chance: 0.1,
      options: [
        { text: "Nice! Save it.", effects: { happiness: 3 }, money: 200 },
        { text: "Buy more tickets! ($100)", effects: { happiness: -2 }, money: -100, cost: 100 },
        { text: "Treat someone to dinner!", effects: { happiness: 5, charisma: 2 }, money: 100, rep: 8 }
      ]},
    { text: "Someone broke into your car and stole your stuff!", minAge: 18, maxAge: 80, chance: 0.08, stages: ['city', 'home', 'college', 'highschool'],
      options: [
        { text: "File a police report", effects: { happiness: -5 }, rep: 3 },
        { text: "Hunt them down yourself", effects: { happiness: -3, health: -5 }, rep: -5 },
        { text: "Just accept the loss and move on", effects: { happiness: -8 } }
      ]},
    { text: "A charity asked you to volunteer this weekend.", minAge: 14, maxAge: 80, chance: 0.12,
      options: [
        { text: "Absolutely! I'd love to help!", effects: { happiness: 5, charisma: 3 }, rep: 15,
            onSelect: function() { LIFE.state.volunteerHours++; LIFE.logMilestone('Volunteered for charity work', 'good'); }},
        { text: "Donate money instead ($200)", effects: { happiness: 3 }, cost: 200, rep: 10,
            onSelect: function() { LIFE.state.charitableDonations += 200; }},
        { text: "I don't have time for that", effects: {}, rep: -3 }
      ]},
    // FAME EVENTS
    { text: "A talent agent noticed you! They want to represent you.", minAge: 18, maxAge: 45, chance: 0.1, stages: ['city'],
      options: [
        { text: "Sign with them! (+Fame)", effects: { charisma: 5, happiness: 3 }, rep: 5, fame: 15 },
        { text: "I'm not interested in fame", effects: { happiness: 2 }, rep: 2 },
        { text: "Only if the money is right ($500 fee)", effects: { charisma: 3 }, cost: 500, fame: 20 }
      ]},
    { text: "You went viral on social media!", minAge: 16, maxAge: 50, chance: 0.08,
      options: [
        { text: "Ride the wave! Post more!", effects: { charisma: 5, happiness: 5 }, rep: 8, fame: 10 },
        { text: "Keep a low profile", effects: { happiness: 2 }, rep: 2 },
        { text: "Monetize it! Start a brand!", effects: { charisma: 3 }, money: 1000, fame: 12 }
      ]},
    // INVESTMENT EVENTS
    { text: "A friend tells you about a hot stock tip!", minAge: 20, maxAge: 70, chance: 0.1,
      options: [
        { text: "Invest $1000!", effects: {}, cost: 1000, money: 3000 },
        { text: "Too risky for me", effects: { intelligence: 1 }, rep: 0 },
        { text: "Report insider trading", effects: { intelligence: 2 }, rep: 10 }
      ]},
    { text: "The economy is booming! Great time to invest.", minAge: 22, maxAge: 65, chance: 0.1,
      options: [
        { text: "Invest heavily! ($2000)", effects: { intelligence: 2 }, cost: 2000, money: 4000 },
        { text: "Play it safe", effects: { happiness: 1 }, rep: 0 },
        { text: "Save for a rainy day", effects: { intelligence: 1, happiness: 1 } }
      ]},
    // ROMANCE EVENTS
    { text: "Someone attractive catches your eye at a social event.", minAge: 18, maxAge: 50, chance: 0.12, stages: ['city', 'college'],
      options: [
        { text: "Go introduce yourself!", effects: { charisma: 3, happiness: 2 }, rep: 2 },
        { text: "Admire from afar", effects: { happiness: 1 }, rep: 0 },
        { text: "Ask a friend to introduce you", effects: { charisma: 2, happiness: 1 }, rep: 1 }
      ]},
    { text: "Your partner surprised you with a romantic dinner!", minAge: 20, maxAge: 80, chance: 0.1,
      options: [
        { text: "This is the best night ever!", effects: { happiness: 8 }, rep: 3 },
        { text: "Plan something even bigger next time!", effects: { happiness: 5, charisma: 2 }, rep: 2 }
      ]},
    // EARLY CHILDHOOD MONEY EVENTS
    { text: "You set up a lemonade stand on the sidewalk!", minAge: 6, maxAge: 12, chance: 0.2, stages: ['home', 'city'],
      options: [
        { text: "Sell cups for 50 cents!", effects: { charisma: 3, happiness: 3 }, money: 5, rep: 3 },
        { text: "Give it away for free", effects: { happiness: 5, charisma: 2 }, rep: 8 },
        { text: "Charge $5 a cup (entrepreneur!)", effects: { charisma: 1, intelligence: 2 }, money: 8, rep: -2 }
      ]},
    { text: "Your neighbor offered you $10 to help with yard work!", minAge: 8, maxAge: 15, chance: 0.2, stages: ['home'],
      options: [
        { text: "Sure! Hard work pays off!", effects: { health: 2, happiness: 2 }, money: 10, rep: 5 },
        { text: "Only if you pay $20!", effects: { charisma: 1 }, money: 20, rep: -3 },
        { text: "Nah, I'd rather play", effects: { happiness: 1 }, rep: -2 }
      ]},
    { text: "You found some coins in the couch cushions!", minAge: 3, maxAge: 10, chance: 0.2, stages: ['home', 'playerhome'],
      options: [
        { text: "Yay! Into the piggy bank!", effects: { happiness: 3 }, money: 2, rep: 1 },
        { text: "Give them to Mom/Dad", effects: { happiness: 1 }, rep: 5 }
      ]},
    { text: "Tooth fairy left money under your pillow!", minAge: 5, maxAge: 9, chance: 0.2,
      options: [
        { text: "Woohoo! $5!", effects: { happiness: 5 }, money: 5 },
        { text: "Save it for something special", effects: { happiness: 2, intelligence: 1 }, money: 5 }
      ]},
    { text: "Your allowance has arrived! Your parents give you some spending money.", minAge: 6, maxAge: 15, chance: 0.2,
      options: [
        { text: "Save it!", effects: { intelligence: 1 }, money: 8 },
        { text: "Buy candy!", effects: { happiness: 3 }, money: 3, rep: 0 },
        { text: "Share with a friend", effects: { charisma: 2, happiness: 1 }, money: 4, rep: 5 }
      ]},
    { text: "A kid at school is selling homemade bracelets. They want you to help!", minAge: 7, maxAge: 13, chance: 0.15, stages: ['school', 'classroom', 'home', 'city'],
      options: [
        { text: "Sure, I'll help sell! ($8 cut)", effects: { charisma: 3, happiness: 2 }, money: 8, rep: 5, friend: true },
        { text: "I'll buy one! ($3)", effects: { happiness: 2 }, cost: 3, rep: 3 },
        { text: "That's dumb", effects: {}, rep: -2 }
      ]},
    // KID SWITCHBLADE EVENTS
    { text: "While snooping around your parents' closet, you found something hidden in a box... it's a switchblade!", minAge: 7, maxAge: 14, chance: 0.06, stages: ['home', 'playerhome'],
      options: [
        { text: "Take it and hide it in your backpack", effects: { charisma: 1 }, rep: -3, giveSwitchblade: true },
        { text: "Put it back, that's dangerous", effects: { intelligence: 2, happiness: 1 }, rep: 3 },
        { text: "Tell Mom and Dad you found it", effects: { happiness: 1 }, rep: 5 }
      ]},
    // WORKPLACE DRAMA
    { text: "Your boss accused you of slacking off in front of everyone.", minAge: 23, maxAge: 65, chance: 0.12, stages: ['city'],
      reqAnyCareer: true,
      options: [
        { text: "Apologize and work harder", effects: { happiness: -5, intelligence: 2 }, rep: 2 },
        { text: "Stand up for yourself", effects: { charisma: 3, happiness: 2 }, rep: 5 },
        { text: "Quit on the spot", effects: { happiness: 5, charisma: 5 }, rep: -3, quitJob: true },
        { text: "Start looking for a new job quietly", effects: { intelligence: 2 }, rep: 0 }
      ]},
    { text: "A coworker confided in you about embezzlement at work.", minAge: 23, maxAge: 60, chance: 0.08, stages: ['city'],
      reqAnyCareer: true,
      options: [
        { text: "Report it to the authorities", effects: { intelligence: 2 }, rep: 15, money: 1000,
            onSelect: function() { LIFE.logMilestone('Reported workplace embezzlement to authorities', 'good'); }},
        { text: "Confront the embezzler", effects: { charisma: 3 }, rep: 5 },
        { text: "Get a cut of the action", effects: { charisma: -3 }, rep: -15, money: 5000,
            onSelect: function() { LIFE.state.totalThefts++; LIFE.logCrime('Embezzlement'); LIFE.logMilestone('Participated in workplace embezzlement', 'bad'); }},
        { text: "Mind your own business", effects: {}, rep: -3 }
      ]},
    // HEALTH SCARES
    { text: "You collapsed while walking down the street!", minAge: 35, maxAge: 80, chance: 0.06, stages: ['city', 'college', 'retirement'],
      options: [
        { text: "Go to the hospital", effects: { health: -5 }, hospital: 'illness' },
        { text: "Rest at home and hope for the best", effects: { health: -12, happiness: -5 } },
        { text: "It's probably nothing...", effects: { health: -8 } }
      ]},
    { text: "You discovered a lump during a self-exam. Your heart drops.", minAge: 30, maxAge: 80, chance: 0.05,
      options: [
        { text: "Rush to the doctor immediately", effects: { health: 5, happiness: -3 }, hospital: 'illness' },
        { text: "Wait and see if it goes away", effects: { health: -10, happiness: -8 } },
        { text: "Research symptoms online (bad idea)", effects: { happiness: -10, intelligence: 1 } }
      ]},
    // NEIGHBORHOOD / SOCIAL
    { text: "Your neighbor's house was broken into last night. They're shaken up.", minAge: 18, maxAge: 80, chance: 0.1, stages: ['home', 'playerhome', 'city'],
      options: [
        { text: "Bring them food and offer to help", effects: { happiness: 3, charisma: 2 }, rep: 10,
            onSelect: function() { LIFE.state.livesHelped++; }},
        { text: "Install security cameras on your own house ($300)", effects: { intelligence: 1 }, cost: 300, rep: 2 },
        { text: "Offer to patrol the neighborhood", effects: { health: -2, charisma: 3 }, rep: 12 },
        { text: "Not my problem", effects: {}, rep: -5 }
      ]},
    { text: "A stray dog keeps following you around everywhere.", minAge: 8, maxAge: 70, chance: 0.1, stages: ['home', 'city', 'school', 'highschool', 'college', 'retirement'],
      options: [
        { text: "Adopt it! ($50 for supplies)", effects: { happiness: 8, charisma: 2 }, cost: 50, rep: 8 },
        { text: "Take it to the shelter", effects: { happiness: 2 }, rep: 5 },
        { text: "Shoo it away", effects: {}, rep: -3 }
      ]},
    // MORAL DILEMMAS
    { text: "You saw someone shoplifting at the store. They noticed you watching.", minAge: 14, maxAge: 80, chance: 0.1, stages: ['city'],
      options: [
        { text: "Tell the store manager", effects: { intelligence: 1 }, rep: 8, enemy: true },
        { text: "Pretend you didn't see anything", effects: {}, rep: -2 },
        { text: "Confront them directly", effects: { charisma: 2, health: -3 }, rep: 5 },
        { text: "Join in", effects: { happiness: 2 }, rep: -15, money: 30 }
      ]},
    { text: "You found a phone on a park bench. It keeps buzzing with messages.", minAge: 12, maxAge: 80, chance: 0.08, stages: ['city', 'college', 'retirement', 'school', 'highschool'],
      options: [
        { text: "Wait for the owner to come back", effects: { happiness: 3, charisma: 2 }, rep: 12 },
        { text: "Turn it in to the police", effects: {}, rep: 8 },
        { text: "Snoop through their messages", effects: { charisma: -2 }, rep: -5 },
        { text: "Sell it ($200)", effects: {}, money: 200, rep: -10 }
      ]},
    // ADDICTION / TEMPTATION
    { text: "Someone at a party offered you something 'that'll make you feel amazing'.", minAge: 16, maxAge: 40, chance: 0.1, stages: ['city', 'college'],
      options: [
        { text: "No way, I'm good", effects: { charisma: 2, health: 1 }, rep: 3 },
        { text: "Just this once...", effects: { happiness: 10, health: -8 }, rep: -5, drugUse: true },
        { text: "Walk away from this party", effects: { happiness: -2 }, rep: 2 }
      ]},
    // UNEXPECTED WINDFALLS / LOSSES
    { text: "Your car broke down and needs major repairs. ($600)", minAge: 18, maxAge: 75, chance: 0.1, stages: ['city', 'home'],
      options: [
        { text: "Pay for repairs", effects: { happiness: -3 }, cost: 600 },
        { text: "Try to fix it yourself", effects: { intelligence: 2, health: -3 }, cost: 100 },
        { text: "Can't afford it, take the bus", effects: { happiness: -5 } }
      ]},
    { text: "You received a letter saying you owe back taxes! ($1500)", minAge: 25, maxAge: 80, chance: 0.06,
      options: [
        { text: "Pay it immediately", effects: { happiness: -5 }, cost: 1500, rep: 3 },
        { text: "Hire an accountant to fight it ($500)", effects: { intelligence: 2 }, cost: 500, money: 800 },
        { text: "Ignore it", effects: {}, rep: -5, cost: 2000 }
      ]},
    // MIDLIFE CRISIS
    { text: "You looked in the mirror and barely recognized yourself. Where did the years go?", minAge: 40, maxAge: 55, chance: 0.1,
      options: [
        { text: "Hit the gym and reinvent yourself", effects: { health: 5, happiness: 3, beauty: 2 }, rep: 2 },
        { text: "Buy something expensive to feel better ($2000)", effects: { happiness: 5 }, cost: 2000 },
        { text: "Call an old friend and reminisce", effects: { happiness: 4, charisma: 2 }, rep: 3, friend: true },
        { text: "Accept aging gracefully", effects: { happiness: 3, intelligence: 2 }, rep: 5 }
      ]},
    // LATE LIFE
    { text: "Your grandchild asked you to teach them something you're good at.", minAge: 55, maxAge: 80, chance: 0.12,
      reqKids: true,
      options: [
        { text: "Spend the whole afternoon teaching them", effects: { happiness: 10, charisma: 3 }, rep: 5,
            onSelect: function() { LIFE.state.peopleMentored++; }},
        { text: "Buy them a book about it ($20)", effects: { happiness: 3 }, cost: 20, rep: 2 },
        { text: "I'm too tired today...", effects: { happiness: -3 }, rep: -2 }
      ]},
    { text: "A young person asked for your life advice. They look up to you.", minAge: 50, maxAge: 80, chance: 0.1,
      options: [
        { text: "Share everything you've learned", effects: { happiness: 8, charisma: 5 }, rep: 10,
            onSelect: function() { LIFE.state.peopleMentored++; LIFE.logMilestone('Mentored a young person who looked up to you', 'good'); }},
        { text: "Tell them to figure it out themselves", effects: { charisma: -2 }, rep: -3 },
        { text: "Warn them about the mistakes you made", effects: { happiness: 3, intelligence: 2 }, rep: 8,
            onSelect: function() { LIFE.state.peopleMentored++; }}
      ]},
    // DEEP MORAL EVENTS
    { text: "A house is on fire down the street! You can hear screaming from inside!", minAge: 14, maxAge: 70, chance: 0.05, stages: ['home', 'city', 'retirement'],
      options: [
        { text: "Run inside to help them!", effects: { health: -20, charisma: 5 }, rep: 30,
            onSelect: function() { LIFE.state.livesHelped += 2; LIFE.logMilestone('Ran into a burning building to save a family', 'good'); if (LIFE.news) LIFE.news.add('Local hero rushes into burning building, saves trapped residents.', 'social'); }},
        { text: "Call 911 and try to guide them out from the door", effects: { health: -5, charisma: 3 }, rep: 18,
            onSelect: function() { LIFE.state.livesHelped++; LIFE.logMilestone('Helped rescue people from a house fire', 'good'); }},
        { text: "Call 911 and wait for the firefighters", effects: {}, rep: 5 },
        { text: "It's not my problem. Walk away.", effects: {}, rep: -15,
            onSelect: function() { LIFE.state.innocentsHarmed++; LIFE.logMilestone('Walked away while people were trapped in a fire', 'bad'); }}
      ]},
    { text: "You witnessed a hit-and-run. The driver is fleeing and the victim is on the ground bleeding.", minAge: 16, maxAge: 80, chance: 0.06, stages: ['city'],
      options: [
        { text: "Run to the victim, apply pressure, call an ambulance!", effects: { health: -3, charisma: 3, happiness: 5 }, rep: 25,
            onSelect: function() { LIFE.state.livesHelped++; LIFE.logMilestone('Saved a hit-and-run victim by applying first aid', 'good'); if (LIFE.news) LIFE.news.add('Bystander saves hit-and-run victim with quick first aid response.', 'social'); }},
        { text: "Chase after the driver and get their plate number", effects: { health: -5, charisma: 2 }, rep: 20,
            onSelect: function() { LIFE.state.livesHelped++; LIFE.logMilestone('Chased down a hit-and-run driver and reported them', 'good'); }},
        { text: "Call 911 from a distance", effects: {}, rep: 8 },
        { text: "Keep walking. You don't want to get involved.", effects: {}, rep: -12,
            onSelect: function() { LIFE.state.innocentsHarmed++; }}
      ]},
    { text: "An elderly woman is being scammed by a fake charity door-to-door salesman. You overhear him pressuring her.", minAge: 16, maxAge: 80, chance: 0.07, stages: ['city', 'retirement'],
      options: [
        { text: "Intervene! 'Ma'am, this is a scam. Sir, leave now.'", effects: { charisma: 5, happiness: 3 }, rep: 18,
            onSelect: function() { LIFE.state.livesHelped++; LIFE.logMilestone('Protected an elderly woman from a scammer', 'good'); }},
        { text: "Call the police on the scammer", effects: { intelligence: 2 }, rep: 12,
            onSelect: function() { LIFE.state.livesHelped++; }},
        { text: "It's none of my business", effects: {}, rep: -5 },
        { text: "Learn the scam technique for later use", effects: { intelligence: 2, charisma: -3 }, rep: -10,
            onSelect: function() { LIFE.logMilestone('Learned scam techniques from watching an elderly woman get conned', 'bad'); }}
      ]},
    { text: "You found a stash of drugs hidden behind a dumpster. Looks worth thousands.", minAge: 16, maxAge: 60, chance: 0.05, stages: ['city', 'highschool'],
      options: [
        { text: "Call the police and report it", effects: { intelligence: 2 }, rep: 12,
            onSelect: function() { LIFE.logMilestone('Reported a drug stash to police', 'good'); }},
        { text: "Leave it alone. Not worth the risk.", effects: { intelligence: 1 } },
        { text: "Take it and sell it ($3000)", effects: {}, money: 3000, rep: -20,
            onSelect: function() { LIFE.state.totalThefts++; LIFE.logCrime('Drug dealing'); LIFE.logMilestone('Sold a found drug stash for $3000', 'bad'); if (Math.random() < 0.3) { LIFE.addWanted(3, 'Drug dealing'); }}},
        { text: "Destroy it so nobody gets hurt", effects: { happiness: 3 }, rep: 8,
            onSelect: function() { LIFE.logMilestone('Destroyed a drug stash to protect the community', 'good'); }}
      ]},
    { text: "A homeless veteran is sitting outside the store, holding a sign that says 'Please help. God bless.'", minAge: 14, maxAge: 80, chance: 0.08, stages: ['city'],
      options: [
        { text: "Sit down and talk to them. Buy them a meal.", effects: { happiness: 5, charisma: 3 }, rep: 12, cost: 15,
            onSelect: function() { LIFE.state.livesHelped++; LIFE.logMilestone('Sat with a homeless veteran and bought them a meal', 'good'); }},
        { text: "Give them $50 and thank them for their service", effects: { happiness: 3 }, rep: 8, cost: 50,
            onSelect: function() { LIFE.state.charitableDonations += 50; LIFE.state.livesHelped++; }},
        { text: "Walk past", effects: {} },
        { text: "Tell them to get a job", effects: { charisma: -2 }, rep: -8,
            onSelect: function() { LIFE.state.innocentsHarmed++; }}
      ]},
    { text: "A neighbor kid is crying outside. Their parents are screaming and throwing things inside.", minAge: 16, maxAge: 80, chance: 0.05, stages: ['home', 'city'],
      options: [
        { text: "Take the child somewhere safe and call child services", effects: { charisma: 5, happiness: 3 }, rep: 20,
            onSelect: function() { LIFE.state.livesHelped++; LIFE.logMilestone('Rescued a child from a violent household', 'good'); }},
        { text: "Call the police", effects: { intelligence: 1 }, rep: 10,
            onSelect: function() { LIFE.state.livesHelped++; }},
        { text: "Comfort the child until things calm down", effects: { charisma: 2, happiness: 2 }, rep: 8,
            onSelect: function() { LIFE.state.livesHelped++; }},
        { text: "Not my family, not my problem", effects: {}, rep: -10,
            onSelect: function() { LIFE.state.innocentsHarmed++; LIFE.logMilestone('Ignored a child being abused next door', 'bad'); }}
      ]},
    { text: "You found an envelope full of cash — $2,000 — in a bathroom stall. No one's around.", minAge: 16, maxAge: 80, chance: 0.05, stages: ['city', 'college', 'highschool'],
      options: [
        { text: "Turn it in to management. Someone is devastated right now.", effects: { happiness: 5, charisma: 3 }, rep: 18,
            onSelect: function() { LIFE.logMilestone('Returned $2000 found in a bathroom', 'good'); }},
        { text: "Wait around to see if someone comes looking", effects: { charisma: 2 }, rep: 10 },
        { text: "Keep it. Finders keepers.", effects: {}, money: 2000, rep: -5,
            onSelect: function() { LIFE.state.totalThefts++; }},
        { text: "Take some, leave some. Split the difference.", effects: {}, money: 1000, rep: -3,
            onSelect: function() { LIFE.state.totalThefts++; }}
      ]},
    { text: "At the grocery store, the cashier accidentally gave you $50 too much in change.", minAge: 12, maxAge: 80, chance: 0.08, stages: ['city'],
      options: [
        { text: "Point out the mistake and return the $50", effects: { happiness: 3, charisma: 2 }, rep: 10,
            onSelect: function() { LIFE.logMilestone('Returned extra change to an honest cashier', 'good'); }},
        { text: "Keep it. Their mistake.", effects: {}, money: 50, rep: -3 },
        { text: "Tell them... but only because someone was watching", effects: { intelligence: 1 }, rep: 2 }
      ]}
];
