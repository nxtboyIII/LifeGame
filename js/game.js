// ============================================================
// GAME STATE
// ============================================================
LIFE.state = {
    age: -1, yearTimer: 0, gamePhase: 'start', currentStage: 'womb',
    playerRotY: 0, cameraPitch: 0.4, playerVelY: 0, isGrounded: true,
    walkTime: 0, actionCooldown: 0, popupTimer: 0, stageTextTimer: 0,
    wombTimer: 0, birthTimer: 0, bounds: 20, locked: false,
    deathTriggered: false, deathCause: '',
    actionAnim: { type: null, timer: 0 }, nearestNPC: null, shopOpen: false,
    // economy
    money: 0, career: null, careerLevel: 0, careerXP: 0,
    married: false, hasKids: false,
    stats: { intelligence: 5, happiness: 50, charisma: 5, health: 80, beauty: 50 },
    // properties & investments
    properties: [], investments: [],
    // fame
    fame: 0,
    // social
    reputation: 0, friends: 0, enemies: 0,
    relationships: {},
    friendsOpen: false,
    // romance
    playerGender: null, // 'M' or 'F', chosen at birth
    spouseName: null, romanceTarget: null, romanceLevel: 0, childCount: 0, childNames: [], firstChildBornAge: null,
    // combat & crime
    hasGun: false, hasSwitchblade: false, kills: 0, shootCooldown: 0,
    wantedLevel: 0, wantedTimer: 0, wantedCooldown: 0,
    policeDispatchTimer: 0, policeDispatching: false,
    swatDispatching: false, swatDispatchTimer: 0, swatDispatched: false,
    criminalRecord: false, timesJailed: 0,
    crimeLog: [], // tracks crimes for jail sentencing display
    bounty: 0, // Skyrim-style persistent bounty
    // family violence tracking
    familyAbuser: false, familyKiller: false, killedFamily: [],
    // day cycle (school ages)
    dayPhase: null, // 'classroom', 'schoolyard', 'home' or null
    timeSkipOpen: false,
    timeSpeed: 72, // game-seconds per real second (72x = default)
    // inventory
    inventory: ['Fists'], equippedIndex: 0,
    // health
    drugUses: 0,
    // jail
    jailTimer: 0, jailYears: 0, jailFine: 0, jailEventTimer: 0,
    // execution
    executionTimer: 0, executionPhase: 0,
    // hospital
    hospitalReason: null, // 'illness', 'injury', 'parentCheckin', 'nearDeath', 'foodPoisoning'
    hospitalReturnStage: null,
    hospitalReturnPos: null,
    hospitalTimer: 0,
    // infant
    heldByParent: false,
    _birthHospital: false,
    _baseBeauty: 50,
    // car
    ownedCar: null, // { name, speed, color, modelIndex }
    inCar: false,
    carStallTimer: 0, // time car has been stationary (for police arrest check)
    carParkedAt: null, // { x, z } world position where car is parked
    purchasedOnce: [], // one-time purchase tracking
    // life achievement tracking
    livesHelped: 0,        // people you directly helped/saved
    charitableDonations: 0,// total $ donated to charity
    volunteerHours: 0,     // how many times you volunteered
    peopleMentored: 0,     // people you taught/mentored
    livesImproved: 0,      // indirect positive impact
    totalThefts: 0,        // theft attempts
    totalExtortions: 0,    // times you extorted someone
    arsonCount: 0,         // buildings burned
    totalBribery: 0,       // times you bribed someone
    innocentsHarmed: 0,    // non-criminal NPCs hurt
    organsBlackMarket: 0,  // dark economy participation
    speechesGiven: 0,      // inspirational speeches
    scholarshipsGiven: 0,  // education funded
    addictionRecoveries: 0,// times beaten addiction
    betrayals: 0,          // people you betrayed
    // life milestones (set as they happen)
    milestones: []         // array of {age, text, type:'good'|'bad'|'neutral'}
};

// ============================================================
// EVENT SYSTEM
// ============================================================
LIFE.EVENT_TYPES = [
    { name: 'Rock Concert', cost: 50, hapBonus: 10, minAge: 12, flavor: "The crowd goes wild!", description: "A local rock band is playing their biggest hits tonight!", fame: 2 },
    { name: 'Pop Concert', cost: 80, hapBonus: 12, minAge: 10, flavor: "Amazing performance!", description: "A famous pop star is in town for a one-night show!", fame: 3 },
    { name: 'Jazz Night', cost: 40, hapBonus: 8, minAge: 18, flavor: "Smooth vibes all evening.", description: "An intimate jazz session with talented local musicians.", fame: 0 },
    { name: 'Comedy Show', cost: 35, hapBonus: 10, minAge: 14, flavor: "Your sides are hurting from laughing!", description: "Stand-up comedians are performing tonight - prepare to laugh!", fame: 1 },
    { name: 'EDM Festival', cost: 100, hapBonus: 15, minAge: 16, flavor: "The bass drops hit different!", description: "A massive electronic music festival with lights and lasers!", fame: 2 },
    { name: 'Classical Concert', cost: 60, hapBonus: 8, minAge: 10, flavor: "A truly moving experience.", description: "The city orchestra performs timeless classical masterpieces.", fame: 1 },
    { name: 'Hip Hop Show', cost: 70, hapBonus: 12, minAge: 14, flavor: "Bars were absolutely fire!", description: "Top hip hop artists performing live on stage!", fame: 2 },
    { name: 'Charity Gala', cost: 150, hapBonus: 8, minAge: 20, flavor: "You feel great about contributing.", description: "A formal charity event raising money for a good cause.", fame: 3, rep: 10 },
    { name: 'Food Festival', cost: 25, hapBonus: 10, minAge: 5, flavor: "So much delicious food!", description: "Dozens of food vendors with cuisines from around the world.", fame: 0 },
    { name: 'Art Exhibition', cost: 30, hapBonus: 6, minAge: 8, flavor: "Some pieces really spoke to you.", description: "Local and international artists showcase their work.", fame: 1 },
    { name: 'Sports Match', cost: 45, hapBonus: 10, minAge: 8, flavor: "What a game!", description: "The home team is playing a big rivalry match tonight!", fame: 1 },
    { name: 'Movie Premiere', cost: 40, hapBonus: 8, minAge: 10, flavor: "That was an incredible film!", description: "A new blockbuster movie is having its premiere screening!", fame: 2 },
    { name: 'Magic Show', cost: 30, hapBonus: 8, minAge: 5, flavor: "How did they DO that?!", description: "A world-famous magician performing mind-bending tricks!", fame: 1 },
    { name: 'Rap Battle', cost: 20, hapBonus: 10, minAge: 14, flavor: "Bars on bars!", description: "Underground rap battle tournament - who will win?", fame: 1 },
    { name: 'Dance Competition', cost: 35, hapBonus: 9, minAge: 10, flavor: "Those moves were insane!", description: "Dance crews from across the city compete for the title!", fame: 1 }
];

LIFE.events = {
    current: null,      // current active event { name, cost, hapBonus, ... }
    timer: 0,           // countdown to next event (in game seconds)
    duration: 0,        // how long current event lasts
    _scheduleInterval: 300 // check every ~5 game-minutes
};

LIFE.events.scheduleEvent = function() {
    var state = LIFE.state;
    var eligible = [];
    for (var i = 0; i < LIFE.EVENT_TYPES.length; i++) {
        var e = LIFE.EVENT_TYPES[i];
        if (state.age >= e.minAge) eligible.push(e);
    }
    if (eligible.length === 0) return;
    var evt = eligible[Math.floor(Math.random() * eligible.length)];
    LIFE.events.current = evt;
    LIFE.events.duration = 400 + Math.random() * 200; // lasts 400-600 game seconds
    LIFE.news.add(evt.name + ' happening at the Event Center! Tickets: $' + evt.cost, 'event');
};

LIFE.events.update = function(dt) {
    if (LIFE.state.gamePhase !== 'playing') return;
    if (LIFE.state.age < 3) return;
    LIFE.events.timer -= dt;
    if (LIFE.events.current) {
        LIFE.events.duration -= dt;
        if (LIFE.events.duration <= 0) {
            LIFE.events.current = null;
            LIFE.events._crowdSpawned = false;
            LIFE.events.timer = 200 + Math.random() * 300;
        }
        // Spawn extra crowd NPCs at event center when event is active
        if (!LIFE.events._crowdSpawned && LIFE.world.built && LIFE.world.zones.eventcenter) {
            LIFE.events._crowdSpawned = true;
            var zone = LIFE.world.zones.eventcenter;
            var def = LIFE.ZONE_DEFS.eventcenter;
            var crowdTypes = ['Stranger', 'Stranger', 'Stranger', 'Stranger', 'Stranger'];
            for (var ci = 0; ci < crowdTypes.length; ci++) {
                var cx = def.cx + (Math.random() - 0.5) * 20;
                var cz = def.cz + (Math.random() - 0.5) * 20;
                var crowd = LIFE.createNPC(crowdTypes[ci], cx, cz);
                crowd._zoneCenter = new THREE.Vector3(def.cx, 0, def.cz);
                crowd._zoneRadius = def.radius;
                crowd._eventCrowd = true;
                zone.npcs.push(crowd);
            }
        }
    } else if (LIFE.events.timer <= 0) {
        if (Math.random() < 0.6) {
            LIFE.events.scheduleEvent();
        }
        LIFE.events.timer = 200 + Math.random() * 300;
    }
};

// ============================================================
// NEWS BANNER SYSTEM (Plague Inc style)
// ============================================================
LIFE.news = {
    queue: [],          // pending news items [{text, type, color}]
    active: null,       // currently displaying
    _timer: 0,
    _gap: 8,            // seconds between news items
    _initialized: false
};

LIFE.NEWS_RANDOM = [
    // World news (flavor)
    "Scientists discover new species of deep-sea fish.",
    "Record-breaking heatwave sweeps across the country.",
    "Stock market hits all-time high amid economic growth.",
    "New smartphone model breaks pre-order records.",
    "Local park wins 'Best Community Space' award.",
    "City announces new public transportation routes.",
    "Internet speeds to double following infrastructure upgrade.",
    "Astronomers discover potentially habitable exoplanet.",
    "National sports team advances to championship finals.",
    "Celebrity couple announces surprise wedding.",
    "New study finds coffee may actually be good for you.",
    "Housing prices continue to rise in major cities.",
    "Tech giant announces revolutionary AI assistant.",
    "Local bakery wins national award for best pastries.",
    "Space agency plans manned mission to Mars by 2040.",
    "Global music streaming hits 1 billion users.",
    "City council approves new waterfront development.",
    "Electric vehicle sales surpass gas cars for first time.",
    "Famous artist's painting sells for record $50 million.",
    "Unemployment rate drops to historic low.",
    "New social media platform gains 100 million users in a week.",
    "World population projected to reach 9 billion.",
    "Scientists develop promising new cancer treatment.",
    "Major airline announces budget flights to 50 new cities.",
    "Video game industry revenue exceeds film and music combined.",
    "Local school wins national robotics competition.",
    "New restaurant trend: insect-based cuisine goes mainstream.",
    "City celebrates 200th anniversary with massive parade.",
    "Climate summit agrees on new carbon reduction targets."
];

LIFE.news.add = function(text, type) {
    var colors = {
        event: '#ce93d8', milestone: '#4fc3f7', crime: '#ef5350',
        career: '#66bb6a', world: '#90a4ae', social: '#ffeb3b',
        fame: '#ff9800'
    };
    LIFE.news.queue.push({ text: text, type: type || 'world', color: colors[type] || '#90a4ae' });
};

LIFE.news.addGameNews = function() {
    var state = LIFE.state;
    // Context-sensitive game news based on player's life
    if (state.kills > 0 && Math.random() < 0.3) {
        LIFE.news.add('Police search for suspect in string of violent attacks.', 'crime');
    }
    if (state.wantedLevel > 2 && Math.random() < 0.4) {
        LIFE.news.add('Manhunt underway after dangerous fugitive spotted in city.', 'crime');
    }
    if (state.fame > 50 && Math.random() < 0.3) {
        var fameLevel = LIFE.economy.getFameLevel();
        LIFE.news.add(fameLevel.title + ' spotted at local venue - fans go wild!', 'fame');
    }
    if (state.reputation > 60 && Math.random() < 0.2) {
        LIFE.news.add('Community honors local hero for outstanding contributions.', 'social');
    }
    if (state.reputation < -50 && Math.random() < 0.3) {
        LIFE.news.add('Residents express concern over rising crime in neighborhood.', 'crime');
    }
    if (state.married && Math.random() < 0.1) {
        LIFE.news.add('Study finds married couples live longer on average.', 'world');
    }
    if (state.career && state.career !== 'none' && Math.random() < 0.15) {
        var career = LIFE.economy.getCareer();
        if (career) LIFE.news.add(career.title + ' sector sees record growth this quarter.', 'career');
    }
    if (state.money > 100000 && Math.random() < 0.15) {
        LIFE.news.add('Local economy booms as real estate investments surge.', 'career');
    }
    if (state.drugUses > 3 && Math.random() < 0.2) {
        LIFE.news.add('Health officials warn about rising substance abuse rates.', 'crime');
    }
    // Career-specific news
    if (state.career === 'doctor' || state.career === 'surgeon') {
        if (Math.random() < 0.15) LIFE.news.add('Hospital reports record patient satisfaction scores.', 'career');
    }
    if (state.career === 'athlete' && Math.random() < 0.15) {
        LIFE.news.add('Local athlete breaks personal record in training.', 'fame');
    }
    // Property owner news
    if (state.properties && state.properties.length > 0 && Math.random() < 0.1) {
        var propNews = [
            'Property values surge in local housing market.',
            'City announces zoning changes that may affect property owners.',
            'New development planned near residential areas.'
        ];
        LIFE.news.add(propNews[Math.floor(Math.random() * propNews.length)], 'career');
    }
    // Age milestone news
    if (state.age === 50 && Math.random() < 0.5) LIFE.news.add('Studies show life begins at 50.', 'world');
    if (state.age === 70 && Math.random() < 0.5) LIFE.news.add('Record number of seniors living active lifestyles.', 'world');
    // Criminal underworld news
    if (state.criminalRecord && state.bounty > 0 && Math.random() < 0.2) {
        LIFE.news.add('Police increase patrols following reports of criminal activity.', 'crime');
    }
    // Always add random world news
    if (Math.random() < 0.5) {
        var rn = LIFE.NEWS_RANDOM[Math.floor(Math.random() * LIFE.NEWS_RANDOM.length)];
        LIFE.news.add(rn, 'world');
    }
};

LIFE.news.update = function(dt) {
    if (LIFE.state.gamePhase !== 'playing') return;
    var el = document.getElementById('newsBanner');
    if (!el) return;

    if (LIFE.news.active) {
        // Active news is being shown - CSS animation handles it
        LIFE.news._timer -= dt;
        if (LIFE.news._timer <= 0) {
            LIFE.news.active = null;
            el.classList.remove('show');
        }
    } else {
        LIFE.news._gap -= dt;
        if (LIFE.news._gap <= 0) {
            if (LIFE.news.queue.length > 0) {
                var item = LIFE.news.queue.shift();
                LIFE.news.active = item;
                LIFE.news._timer = 12; // show for 12 seconds (matches CSS animation)
                // Force animation restart by removing and re-adding class
                el.classList.remove('show');
                var textEl = el.querySelector('.newsText');
                var iconEl = el.querySelector('.newsIcon');
                if (textEl) textEl.textContent = item.text;
                if (iconEl) iconEl.style.color = item.color;
                // Force reflow to restart animation
                void el.offsetWidth;
                el.classList.add('show');
            }
            LIFE.news._gap = 5 + Math.random() * 8;
        }
    }
};

// ============================================================
// CURSOR LOCK / UNLOCK
// ============================================================
LIFE.lockCursor = function() { LIFE.canvas.requestPointerLock(); };
LIFE.unlockCursor = function() {
    if (document.pointerLockElement) document.exitPointerLock();
    document.body.classList.remove('locked');
    document.body.classList.add('unlocked');
};

// ============================================================
// RELATIONSHIP TRACKING
// ============================================================
LIFE.updateRelationship = function(name, change) {
    if (!name) return;
    if (!LIFE.state.relationships[name]) {
        LIFE.state.relationships[name] = { level: 0, interactions: 0, stage: LIFE.state.currentStage };
    }
    var rel = LIFE.state.relationships[name];
    rel.level = Math.max(-100, Math.min(100, rel.level + change));
    rel.interactions++;
};

// ============================================================
// WANTED LEVEL / POLICE
// ============================================================
// LIFE.police = active pursuing cops (subset of persistent world cops + SWAT)
LIFE.police = [];

// ---- PERSISTENT POLICE SYSTEM ----
LIFE.POLICE_MAX = 6; // max regular officers in the world
LIFE.SWAT_WAVE_SIZE = 4; // SWAT per wave
LIFE.swat = []; // active SWAT units

LIFE.logCrime = function(crime) {
    if (!LIFE.state.crimeLog) LIFE.state.crimeLog = [];
    LIFE.state.crimeLog.push(crime);
};

// Log a life milestone (shown on death screen)
LIFE.logMilestone = function(text, type) {
    if (!LIFE.state.milestones) LIFE.state.milestones = [];
    LIFE.state.milestones.push({ age: LIFE.state.age, text: text, type: type || 'neutral' });
};

LIFE.addWanted = function(amount) {
    if (LIFE.state.age < 10) return;
    var state = LIFE.state;
    var old = state.wantedLevel;
    state.wantedLevel = Math.min(10, state.wantedLevel + amount);
    state.bounty += amount * 500;
    state.wantedTimer = 0;
    state.wantedCooldown = 0;
    // Start dispatch timer (someone calling the police)
    if (state.wantedLevel > 0 && !state.policeDispatching) {
        var alreadyPursuing = 0;
        if (LIFE.world.policeCops) {
            for (var i = 0; i < LIFE.world.policeCops.length; i++) {
                if (LIFE.world.policeCops[i].aiState === 'pursuing' || LIFE.world.policeCops[i].aiState === 'driving') alreadyPursuing++;
            }
        }
        // Scale cops dispatched: 1-2 for minor, 3-4 for moderate, 5-6 for serious
        var copsNeeded = Math.min(LIFE.POLICE_MAX, Math.ceil(state.wantedLevel / 2));
        if (alreadyPursuing < copsNeeded) {
            state.policeDispatching = true;
            // First offense: 5-8 seconds (someone has to witness, call, dispatcher sends cops)
            // Escalation while cops already out: 2-4 seconds (cops radio for backup)
            state.policeDispatchTimer = old === 0 ? (5 + Math.random() * 3) : (2 + Math.random() * 2);
            if (old === 0) LIFE.ui.showPopup('Someone is calling the police!', '#f44336');
        }
    }
    // SWAT check - evaluated every time wanted rises, independent of regular police dispatch
    if (state.wantedLevel >= 7 && state.kills >= 2 && !state.swatDispatching && !state.swatDispatched) {
        state.swatDispatching = true;
        state.swatDispatchTimer = 15 + Math.random() * 10;
        LIFE.ui.showPopup('SWAT team has been called in!', '#f44336');
    }
};

// Create a police car model (dark blue with red/blue lights)
LIFE.createPoliceCar = function() {
    var group = LIFE.createCarModel(0x1a237e);
    // Light bar on roof
    var barBase = LIFE.makeBox(1.2, 0.08, 0.4, 0x333333, 0, 1.3, -0.3);
    group.add(barBase);
    var redLight = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.15, 0.25),
        new THREE.MeshPhongMaterial({ color: 0xff1744, emissive: 0xff1744, emissiveIntensity: 0.8 })
    );
    redLight.position.set(-0.35, 1.38, -0.3);
    group.add(redLight);
    var blueLight = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.15, 0.25),
        new THREE.MeshPhongMaterial({ color: 0x2979ff, emissive: 0x2979ff, emissiveIntensity: 0.8 })
    );
    blueLight.position.set(0.35, 1.38, -0.3);
    group.add(blueLight);
    group._redLight = redLight;
    group._blueLight = blueLight;
    group._lightTimer = 0;
    return group;
};

// Create a SWAT truck model (black armored, larger)
LIFE.createSwatTruck = function() {
    var group = new THREE.Group();
    var bodyMat = new THREE.MeshPhongMaterial({ color: 0x212121 });
    // Larger armored body
    var body = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.4, 5.5), bodyMat);
    body.position.y = 0.8; body.castShadow = true; group.add(body);
    // Cabin top
    var cabin = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 2.5), bodyMat);
    cabin.position.set(0, 1.9, -0.8); cabin.castShadow = true; group.add(cabin);
    // Armored windshield (small slit)
    var winMat = new THREE.MeshPhongMaterial({ color: 0x445566, emissive: 0x223344, emissiveIntensity: 0.3 });
    var win = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 0.05), winMat);
    win.position.set(0, 2.0, 0.46); group.add(win);
    // Wheels (6 wheels - 3 per side)
    var wheelMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
    var wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 8);
    var positions = [[-1.2,0.4,1.8],[1.2,0.4,1.8],[-1.2,0.4,0],[1.2,0.4,0],[-1.2,0.4,-1.8],[1.2,0.4,-1.8]];
    for (var i = 0; i < 6; i++) {
        var w = new THREE.Mesh(wheelGeo, wheelMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(positions[i][0], positions[i][1], positions[i][2]);
        w.castShadow = true; group.add(w);
    }
    // SWAT label
    var labelCanvas = document.createElement('canvas');
    labelCanvas.width = 128; labelCanvas.height = 32;
    var ctx = labelCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SWAT', 64, 24);
    var tex = new THREE.CanvasTexture(labelCanvas);
    var label = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    label.position.set(0, 2.6, 0); label.scale.set(1.5, 0.4, 1);
    group.add(label);
    // Red/blue lights
    var redLight = new THREE.Mesh(new THREE.BoxGeometry(0.3,0.2,0.3),
        new THREE.MeshPhongMaterial({ color: 0xff1744, emissive: 0xff1744, emissiveIntensity: 0.8 }));
    redLight.position.set(-0.6, 2.35, -0.8); group.add(redLight);
    var blueLight = new THREE.Mesh(new THREE.BoxGeometry(0.3,0.2,0.3),
        new THREE.MeshPhongMaterial({ color: 0x2979ff, emissive: 0x2979ff, emissiveIntensity: 0.8 }));
    blueLight.position.set(0.6, 2.35, -0.8); group.add(blueLight);
    group._redLight = redLight;
    group._blueLight = blueLight;
    group._lightTimer = 0;
    return group;
};

// Dispatch idle cops toward the player
LIFE.dispatchPolice = function() {
    var state = LIFE.state;
    if (!LIFE.world.policeCops || !LIFE.player) return;
    var px = LIFE.player.group.position.x;
    var pz = LIFE.player.group.position.z;

    // Count how many are already pursuing
    var pursuing = 0;
    for (var i = 0; i < LIFE.world.policeCops.length; i++) {
        if (LIFE.world.policeCops[i].aiState === 'pursuing' || LIFE.world.policeCops[i].aiState === 'driving') pursuing++;
    }
    var copsNeeded = Math.min(LIFE.POLICE_MAX, Math.ceil(state.wantedLevel / 2));
    var needed = copsNeeded - pursuing;

    // Sort idle cops by distance to player (nearest first)
    var idle = [];
    for (var j = 0; j < LIFE.world.policeCops.length; j++) {
        var cop = LIFE.world.policeCops[j];
        if (cop.aiState === 'idle' || cop.aiState === 'patrolling' || cop.aiState === 'returning') {
            if (!cop.npc.alive) continue;
            var cdx = cop.npc.char.group.position.x - px;
            var cdz = cop.npc.char.group.position.z - pz;
            cop._distToPlayer = Math.sqrt(cdx * cdx + cdz * cdz);
            idle.push(cop);
        }
    }
    idle.sort(function(a, b) { return a._distToPlayer - b._distToPlayer; });

    for (var k = 0; k < Math.min(needed, idle.length); k++) {
        var c = idle[k];
        if (c._distToPlayer < 30) {
            // Close enough to chase on foot
            c.aiState = 'pursuing';
            c.npc.speed = LIFE.getSpeedForAge(state.age) * 1.5;
            if (LIFE.police.indexOf(c.npc) < 0) LIFE.police.push(c.npc);
        } else {
            // Far away - get in police car and drive
            c.aiState = 'driving';
            c.npc.char.group.visible = false; // hide cop (they're in the car)
            var car = LIFE.createPoliceCar();
            car.position.copy(c.npc.char.group.position);
            car.position.y = 0;
            car.rotation.y = Math.atan2(px - car.position.x, pz - car.position.z);
            LIFE.scene.add(car);
            c.car = car;
            c.carSpeed = 0;
        }
    }

    LIFE.sounds.siren();
    state.policeDispatching = false;
};

// Dispatch SWAT from the edge of the world
LIFE.dispatchSWAT = function() {
    var state = LIFE.state;
    var px = LIFE.player ? LIFE.player.group.position.x : 0;
    var pz = LIFE.player ? LIFE.player.group.position.z : 0;
    // Spawn from a far edge, heading toward player
    var spawnDist = 200;
    var angle = Math.random() * Math.PI * 2;
    var sx = px + Math.cos(angle) * spawnDist;
    var sz = pz + Math.sin(angle) * spawnDist;

    var truck = LIFE.createSwatTruck();
    truck.position.set(sx, 0, sz);
    truck.rotation.y = Math.atan2(px - sx, pz - sz);
    LIFE.scene.add(truck);

    var swatUnit = {
        truck: truck,
        truckSpeed: 0,
        state: 'driving', // driving, deployed
        members: [],
        deployDist: 25 // distance from player to deploy
    };

    // Create SWAT members (hidden for now, riding in truck)
    for (var i = 0; i < LIFE.SWAT_WAVE_SIZE; i++) {
        var npc = LIFE.createNPC('Police', sx, sz);
        npc.speed = LIFE.getSpeedForAge(state.age) * 1.7; // SWAT are faster
        npc.health = 350; npc.maxHealth = 350; // armored
        npc.isPolice = true; npc.isSWAT = true;
        npc.shootTimer = 0;
        npc.char.group.visible = false;
        // Darken SWAT gear color
        if (npc.char.parts.body) npc.char.parts.body.material = new THREE.MeshPhongMaterial({ color: 0x111111 });
        if (npc.char.parts.leftArm) npc.char.parts.leftArm.material = new THREE.MeshPhongMaterial({ color: 0x111111 });
        if (npc.char.parts.rightArm) npc.char.parts.rightArm.material = new THREE.MeshPhongMaterial({ color: 0x111111 });
        if (npc.char.parts.leftLeg) npc.char.parts.leftLeg.material = new THREE.MeshPhongMaterial({ color: 0x111111 });
        if (npc.char.parts.rightLeg) npc.char.parts.rightLeg.material = new THREE.MeshPhongMaterial({ color: 0x111111 });
        // SWAT helmet
        var helmet = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.15, 0.3),
            new THREE.MeshPhongMaterial({ color: 0x111111 })
        );
        helmet.position.y = (npc.char.height || 1.8) + 0.26;
        npc.char.group.add(helmet);
        swatUnit.members.push(npc);
    }

    LIFE.swat.push(swatUnit);
    LIFE.ui.showPopup('SWAT team dispatched!', '#f44336');
};

LIFE.despawnPolice = function() {
    // Return all persistent cops to patrol (don't remove them from scene)
    if (LIFE.world.policeCops) {
        for (var i = 0; i < LIFE.world.policeCops.length; i++) {
            var cop = LIFE.world.policeCops[i];
            if (cop.car) { LIFE.scene.remove(cop.car); cop.car = null; }
            if (cop._parkedCar) { LIFE.scene.remove(cop._parkedCar); cop._parkedCar = null; }
            if (cop.npc.alive) {
                cop.aiState = 'returning';
                cop.returnTimer = 0;
                cop.npc.char.group.visible = true;
                cop.npc.speed = 0;
            }
        }
    }
    // Remove SWAT completely (they leave the area)
    for (var s = 0; s < LIFE.swat.length; s++) {
        var su = LIFE.swat[s];
        if (su.truck) LIFE.scene.remove(su.truck);
        for (var m = 0; m < su.members.length; m++) {
            LIFE.scene.remove(su.members[m].char.group);
        }
    }
    LIFE.swat = [];
    LIFE.police = [];
    LIFE.state.swatDispatching = false;
    LIFE.state.swatDispatched = false;
    LIFE.sounds.stopSiren();
};

// Force-remove all police (for jail/death transitions)
LIFE.removeAllPolice = function() {
    if (LIFE.world.policeCops) {
        for (var i = 0; i < LIFE.world.policeCops.length; i++) {
            var cop = LIFE.world.policeCops[i];
            if (cop.car) { LIFE.scene.remove(cop.car); cop.car = null; }
            if (cop._parkedCar) { LIFE.scene.remove(cop._parkedCar); cop._parkedCar = null; }
            cop.npc.char.group.visible = false;
            cop.aiState = 'idle';
        }
    }
    for (var s = 0; s < LIFE.swat.length; s++) {
        var su = LIFE.swat[s];
        if (su.truck) LIFE.scene.remove(su.truck);
        for (var m = 0; m < su.members.length; m++) {
            LIFE.scene.remove(su.members[m].char.group);
        }
    }
    LIFE.swat = [];
    LIFE.police = [];
    LIFE.state.swatDispatching = false;
    LIFE.state.swatDispatched = false;
    LIFE.sounds.stopSiren();
};

// Respawn dead cops over time (called from game loop)
LIFE.policeRespawnTimer = 0;
LIFE.updatePoliceRespawn = function(dt) {
    if (!LIFE.world.policeCops) return;
    LIFE.policeRespawnTimer += dt;
    // Check every ~60 seconds for dead cops to respawn (simulates hiring)
    if (LIFE.policeRespawnTimer < 60) return;
    LIFE.policeRespawnTimer = 0;
    for (var i = 0; i < LIFE.world.policeCops.length; i++) {
        var cop = LIFE.world.policeCops[i];
        if (!cop.npc.alive) {
            cop.respawnMonths = (cop.respawnMonths || 0) + 1;
            // Takes 2-4 "months" (check cycles) to hire a replacement
            if (cop.respawnMonths >= 2 + Math.floor(Math.random() * 3)) {
                // Respawn as new officer at patrol position
                LIFE.scene.remove(cop.npc.char.group);
                var newNpc = LIFE.createNPC('Police', cop.patrolPos.x, cop.patrolPos.z);
                newNpc.speed = 0;
                newNpc.health = 200; newNpc.maxHealth = 200;
                newNpc.isPolice = true; newNpc.shootTimer = 0;
                cop.npc = newNpc;
                cop.aiState = 'idle';
                cop.respawnMonths = 0;
            }
        }
    }
};

LIFE.updatePolice = function(dt) {
    var state = LIFE.state;
    var player = LIFE.player;
    if (!player || state.gamePhase !== 'playing') return;

    // Always update police respawn timer (even when not wanted)
    LIFE.updatePoliceRespawn(dt);

    // Idle cop patrol behavior (when no wanted level)
    if (LIFE.world.policeCops) {
        for (var pi = 0; pi < LIFE.world.policeCops.length; pi++) {
            var pcop = LIFE.world.policeCops[pi];
            if (!pcop.npc.alive) continue;
            // Return to patrol position
            if (pcop.aiState === 'returning') {
                pcop.returnTimer = (pcop.returnTimer || 0) + dt;
                var rPos = pcop.npc.char.group.position;
                var rdx = pcop.patrolPos.x - rPos.x;
                var rdz = pcop.patrolPos.z - rPos.z;
                var rDist = Math.sqrt(rdx * rdx + rdz * rdz);
                if (rDist > 2) {
                    // Use A* pathfinding for returning
                    if (!pcop._returnPath) {
                        pcop._returnPath = LIFE.pathfinding.findPath(rPos.x, rPos.z, pcop.patrolPos.x, pcop.patrolPos.z);
                        pcop._returnPathIdx = 0;
                    }
                    var rTarget = null;
                    if (pcop._returnPath && pcop._returnPathIdx < pcop._returnPath.length) {
                        rTarget = pcop._returnPath[pcop._returnPathIdx];
                        var rwdx = rTarget.x - rPos.x, rwdz = rTarget.z - rPos.z;
                        var rwDist = Math.sqrt(rwdx * rwdx + rwdz * rwdz);
                        if (rwDist < 1.5) {
                            pcop._returnPathIdx++;
                            if (pcop._returnPathIdx >= pcop._returnPath.length) rTarget = null;
                            else rTarget = pcop._returnPath[pcop._returnPathIdx];
                        }
                    }
                    if (rTarget) { rdx = rTarget.x - rPos.x; rdz = rTarget.z - rPos.z; }
                    var rnDist = Math.sqrt(rdx * rdx + rdz * rdz);
                    if (rnDist > 0.5) {
                        var rs = 4 * dt;
                        rPos.x += (rdx / rnDist) * rs;
                        rPos.z += (rdz / rnDist) * rs;
                        LIFE.resolveCollisions(rPos);
                        pcop.npc.char.group.rotation.y = Math.atan2(rdx, rdz);
                        pcop.npc.walkTime += dt * 6;
                        var rsw = Math.sin(pcop.npc.walkTime) * 0.5;
                        pcop.npc.char.parts.leftLeg.rotation.x = rsw;
                        pcop.npc.char.parts.rightLeg.rotation.x = -rsw;
                    }
                } else {
                    pcop.aiState = 'idle';
                    pcop.npc.speed = 0;
                    pcop._returnPath = null;
                }
            }
            // Idle patrol wander near patrol position
            if (pcop.aiState === 'idle' || pcop.aiState === 'patrolling') {
                pcop.patrolTimer = (pcop.patrolTimer || 0) + dt;
                if (pcop.patrolTimer > 5 + Math.random() * 5) {
                    pcop.patrolTimer = 0;
                    pcop.aiState = 'patrolling';
                    pcop._patrolTarget = {
                        x: pcop.patrolPos.x + (Math.random() - 0.5) * 16,
                        z: pcop.patrolPos.z + (Math.random() - 0.5) * 16
                    };
                    pcop._patrolPath = null; // clear old path for new target
                }
                if (pcop.aiState === 'patrolling' && pcop._patrolTarget) {
                    var ptPos = pcop.npc.char.group.position;
                    // Use A* pathfinding for patrol
                    if (!pcop._patrolPath) {
                        pcop._patrolPath = LIFE.pathfinding.findPath(ptPos.x, ptPos.z, pcop._patrolTarget.x, pcop._patrolTarget.z);
                        pcop._patrolPathIdx = 0;
                    }
                    var ptWp = null;
                    if (pcop._patrolPath && pcop._patrolPathIdx < pcop._patrolPath.length) {
                        ptWp = pcop._patrolPath[pcop._patrolPathIdx];
                        var ptwdx = ptWp.x - ptPos.x, ptwdz = ptWp.z - ptPos.z;
                        if (Math.sqrt(ptwdx * ptwdx + ptwdz * ptwdz) < 1.5) {
                            pcop._patrolPathIdx++;
                            ptWp = pcop._patrolPathIdx < pcop._patrolPath.length ? pcop._patrolPath[pcop._patrolPathIdx] : null;
                        }
                    }
                    var ptdx, ptdz;
                    if (ptWp) { ptdx = ptWp.x - ptPos.x; ptdz = ptWp.z - ptPos.z; }
                    else { ptdx = pcop._patrolTarget.x - ptPos.x; ptdz = pcop._patrolTarget.z - ptPos.z; }
                    var ptDist = Math.sqrt(ptdx * ptdx + ptdz * ptdz);
                    if (ptDist > 1) {
                        var ps = 2 * dt;
                        ptPos.x += (ptdx / ptDist) * ps;
                        ptPos.z += (ptdz / ptDist) * ps;
                        LIFE.resolveCollisions(ptPos);
                        pcop.npc.char.group.rotation.y = Math.atan2(ptdx, ptdz);
                        pcop.npc.walkTime += dt * 4;
                        var psw = Math.sin(pcop.npc.walkTime) * 0.35;
                        pcop.npc.char.parts.leftLeg.rotation.x = psw;
                        pcop.npc.char.parts.rightLeg.rotation.x = -psw;
                        pcop.npc.char.parts.leftArm.rotation.x = -psw * 0.3;
                        pcop.npc.char.parts.rightArm.rotation.x = psw * 0.3;
                    } else {
                        pcop.aiState = 'idle';
                        pcop._patrolPath = null;
                        pcop.npc.char.parts.leftLeg.rotation.x *= 0.8;
                        pcop.npc.char.parts.rightLeg.rotation.x *= 0.8;
                    }
                }
            }
        }
    }

    if (state.wantedLevel <= 0) {
        LIFE.sounds.stopSiren();
        return;
    }

    // 3D siren - start if not playing, update position from nearest police car
    LIFE.sounds.startSiren();
    var nearestCarPos = null;
    var nearestCarDist = Infinity;
    var px = player.group.position.x, pz = player.group.position.z;
    if (LIFE.world.policeCops) {
        for (var sci = 0; sci < LIFE.world.policeCops.length; sci++) {
            var sc = LIFE.world.policeCops[sci];
            var sirenPos = sc.car ? sc.car.position : (sc._parkedCar ? sc._parkedCar.position : null);
            if (sirenPos) {
                var sdx = px - sirenPos.x, sdz = pz - sirenPos.z;
                var sd = sdx * sdx + sdz * sdz;
                if (sd < nearestCarDist) { nearestCarDist = sd; nearestCarPos = sirenPos; }
            }
        }
    }
    for (var swi = 0; swi < LIFE.swat.length; swi++) {
        if (LIFE.swat[swi].truck) {
            var stPos = LIFE.swat[swi].truck.position;
            var stdx = px - stPos.x, stdz = pz - stPos.z;
            var std = stdx * stdx + stdz * stdz;
            if (std < nearestCarDist) { nearestCarDist = std; nearestCarPos = stPos; }
        }
    }
    if (nearestCarPos) {
        LIFE.sounds.updateSirenPosition(nearestCarPos.x, 1.5, nearestCarPos.z);
    } else {
        // Fallback: place siren on nearest cop
        var nearCop = null, ncDist = Infinity;
        LIFE.police.forEach(function(c) {
            if (!c.alive) return;
            var cdx = px - c.char.group.position.x, cdz = pz - c.char.group.position.z;
            var cd = cdx * cdx + cdz * cdz;
            if (cd < ncDist) { ncDist = cd; nearCop = c; }
        });
        if (nearCop) LIFE.sounds.updateSirenPosition(nearCop.char.group.position.x, 1.5, nearCop.char.group.position.z);
    }
    // Update listener position to match player/camera
    var cam = LIFE.camera;
    if (cam) {
        var camDir = new THREE.Vector3();
        cam.getWorldDirection(camDir);
        LIFE.sounds.updateListenerPosition(px, 1.5, pz, camDir.x, camDir.y, camDir.z);
    }

    // Dispatch timer countdown
    if (state.policeDispatching) {
        state.policeDispatchTimer -= dt;
        if (state.policeDispatchTimer <= 0) {
            LIFE.dispatchPolice();
        }
        return; // don't chase yet, cops still on the way
    }

    // SWAT dispatch timer (separate from regular police - takes longer to mobilize)
    if (state.swatDispatching) {
        state.swatDispatchTimer -= dt;
        if (state.swatDispatchTimer <= 0) {
            state.swatDispatching = false;
            state.swatDispatched = true;
            LIFE.dispatchSWAT();
        }
    }

    // track car stall time for arrest immunity while driving
    if (state.inCar && LIFE.car.model) {
        if (Math.abs(LIFE.car.currentSpeed) < 0.5) {
            state.carStallTimer += dt;
        } else {
            state.carStallTimer = 0;
        }
    } else {
        state.carStallTimer = 0;
    }

    // Update driving cops (persistent cops in cars approaching player)
    var px = player.group.position.x, pz = player.group.position.z;
    if (LIFE.world.policeCops) {
        for (var di = 0; di < LIFE.world.policeCops.length; di++) {
            var dcop = LIFE.world.policeCops[di];
            if (dcop.aiState !== 'driving' || !dcop.car) continue;
            // Drive car toward player
            var cdx = px - dcop.car.position.x;
            var cdz = pz - dcop.car.position.z;
            var cDist = Math.sqrt(cdx * cdx + cdz * cdz);
            // Accelerate
            dcop.carSpeed = Math.min(18, dcop.carSpeed + 12 * dt);
            // Steer
            dcop.car.rotation.y = Math.atan2(cdx, cdz);
            dcop.car.position.x += Math.sin(dcop.car.rotation.y) * dcop.carSpeed * dt;
            dcop.car.position.z += Math.cos(dcop.car.rotation.y) * dcop.carSpeed * dt;
            // Flash lights
            dcop.car._lightTimer = (dcop.car._lightTimer || 0) + dt;
            var flash = Math.sin(dcop.car._lightTimer * 8) > 0;
            if (dcop.car._redLight) dcop.car._redLight.visible = flash;
            if (dcop.car._blueLight) dcop.car._blueLight.visible = !flash;

            // Close enough - cop exits car
            if (cDist < 20) {
                dcop.npc.char.group.position.copy(dcop.car.position);
                dcop.npc.char.group.position.y = 0;
                dcop.npc.char.group.visible = true;
                dcop.npc.speed = LIFE.getSpeedForAge(state.age) * 1.5;
                // Leave car parked (stays in scene as static prop)
                dcop.car._redLight.visible = true;
                dcop.car._blueLight.visible = true;
                dcop._parkedCar = dcop.car; // remember to clean up later
                dcop.car = null;
                dcop.aiState = 'pursuing';
                if (LIFE.police.indexOf(dcop.npc) < 0) LIFE.police.push(dcop.npc);
            }
        }
    }

    // Update SWAT truck driving
    for (var si = 0; si < LIFE.swat.length; si++) {
        var su = LIFE.swat[si];
        if (su.state !== 'driving' || !su.truck) continue;
        var sdx = px - su.truck.position.x;
        var sdz = pz - su.truck.position.z;
        var sDist = Math.sqrt(sdx * sdx + sdz * sdz);
        su.truckSpeed = Math.min(22, su.truckSpeed + 10 * dt);
        su.truck.rotation.y = Math.atan2(sdx, sdz);
        su.truck.position.x += Math.sin(su.truck.rotation.y) * su.truckSpeed * dt;
        su.truck.position.z += Math.cos(su.truck.rotation.y) * su.truckSpeed * dt;
        // Flash lights
        su.truck._lightTimer = (su.truck._lightTimer || 0) + dt;
        var sflash = Math.sin(su.truck._lightTimer * 8) > 0;
        if (su.truck._redLight) su.truck._redLight.visible = sflash;
        if (su.truck._blueLight) su.truck._blueLight.visible = !sflash;

        // Deploy SWAT when close
        if (sDist < su.deployDist) {
            su.state = 'deployed';
            // Spread SWAT members around truck
            for (var sm = 0; sm < su.members.length; sm++) {
                var swNpc = su.members[sm];
                var sAngle = (sm / su.members.length) * Math.PI * 2;
                swNpc.char.group.position.set(
                    su.truck.position.x + Math.cos(sAngle) * 3,
                    0,
                    su.truck.position.z + Math.sin(sAngle) * 3
                );
                swNpc.char.group.visible = true;
                swNpc.speed = LIFE.getSpeedForAge(state.age) * 1.7;
                if (LIFE.police.indexOf(swNpc) < 0) LIFE.police.push(swNpc);
            }
        }
    }

    // check if all active cops are dead - you escaped by fighting them off
    var aliveCops = 0;
    LIFE.police.forEach(function(c) { if (c.alive) aliveCops++; });
    // Also count driving cops that haven't arrived yet
    var enRoute = 0;
    if (LIFE.world.policeCops) {
        for (var ei = 0; ei < LIFE.world.policeCops.length; ei++) {
            if (LIFE.world.policeCops[ei].aiState === 'driving') enRoute++;
        }
    }
    for (var esi = 0; esi < LIFE.swat.length; esi++) {
        if (LIFE.swat[esi].state === 'driving') enRoute++;
    }
    if (aliveCops === 0 && enRoute === 0 && !state.swatDispatching && LIFE.police.length > 0) {
        LIFE.ui.showPopup('Cops eliminated! Bounty: $' + state.bounty, '#ff9800');
        state.wantedLevel = 0;
        state.policeDispatching = false;
        LIFE.despawnPolice();
        return;
    }

    // check escape by distance
    var allFar = true;
    LIFE.police.forEach(function(c) {
        if (!c.alive) return;
        var edx = player.group.position.x - c.char.group.position.x;
        var edz = player.group.position.z - c.char.group.position.z;
        if (Math.sqrt(edx * edx + edz * edz) < 30) allFar = false;
    });

    // wanted decay - faster if outrunning cops
    state.wantedTimer += dt * (allFar ? 3 : 1);
    if (allFar && state.wantedTimer > 5) {
        LIFE.ui.showPopup('Escaping...', '#ffeb3b');
    }
    if (state.wantedTimer >= 30) {
        state.wantedTimer = 0;
        state.wantedLevel = Math.max(0, state.wantedLevel - 1);
        if (state.wantedLevel <= 0) {
            state.policeDispatching = false;
            LIFE.despawnPolice();
            LIFE.ui.showPopup('Escaped! Bounty: $' + state.bounty, '#ff9800');
            return;
        }
        // More cops needed? re-dispatch
        LIFE.state.policeDispatching = true;
        LIFE.state.policeDispatchTimer = 1;
    }

    // Chase logic for all active pursuing cops
    LIFE.police.forEach(function(cop) {
        if (!cop.alive) return;
        var copPos = cop.char.group.position;
        var dx = player.group.position.x - copPos.x;
        var dz = player.group.position.z - copPos.z;
        var dist = Math.sqrt(dx * dx + dz * dz);

        if (dist > 1.8) {
            // Recompute A* path periodically (player is moving)
            cop._chasePathTimer = (cop._chasePathTimer || 0) + dt;
            if (!cop._chasePath || cop._chasePathTimer > 1.0) {
                cop._chasePathTimer = 0;
                cop._chasePath = LIFE.pathfinding.findPath(copPos.x, copPos.z, player.group.position.x, player.group.position.z);
                cop._chasePathIdx = 0;
            }
            // Follow A* waypoints
            var chaseDx = dx, chaseDz = dz;
            if (cop._chasePath && cop._chasePathIdx < cop._chasePath.length) {
                var cwp = cop._chasePath[cop._chasePathIdx];
                var cwdx = cwp.x - copPos.x, cwdz = cwp.z - copPos.z;
                var cwDist = Math.sqrt(cwdx * cwdx + cwdz * cwdz);
                if (cwDist < 1.5) {
                    cop._chasePathIdx++;
                    if (cop._chasePathIdx < cop._chasePath.length) {
                        cwp = cop._chasePath[cop._chasePathIdx];
                        cwdx = cwp.x - copPos.x; cwdz = cwp.z - copPos.z;
                    }
                }
                if (cop._chasePathIdx < cop._chasePath.length) {
                    chaseDx = cwdx; chaseDz = cwdz;
                }
            }
            var chaseNorm = Math.sqrt(chaseDx * chaseDx + chaseDz * chaseDz);
            if (chaseNorm > 0.1) {
                var s = cop.speed * dt;
                copPos.x += (chaseDx / chaseNorm) * s;
                copPos.z += (chaseDz / chaseNorm) * s;
                LIFE.resolveCollisions(copPos);
                cop.char.group.rotation.y = Math.atan2(chaseDx, chaseDz);
            }
            cop.walkTime += dt * cop.speed * 3;
            var sw = Math.sin(cop.walkTime) * 0.5;
            cop.char.parts.leftLeg.rotation.x = sw;
            cop.char.parts.rightLeg.rotation.x = -sw;
            cop.char.parts.leftArm.rotation.x = -sw * 0.4;
            cop.char.parts.rightArm.rotation.x = sw * 0.4;
        } else {
            // Can't arrest player in a moving vehicle - must be stalled 5+ seconds
            if (state.inCar && state.carStallTimer < 5) {
                // cop stays near but can't grab player from moving car
            } else {
                LIFE.arrestPlayer();
                return;
            }
        }

        // police shoot at high wanted (5+) / SWAT always shoot
        var shouldShoot = cop.isSWAT ? (dist < 30) : (state.wantedLevel >= 5 && dist < 20);
        var shootRate = cop.isSWAT ? 1.0 : 2.5; // SWAT fires faster (machine guns)
        if (shouldShoot) {
            cop.shootTimer += dt;
            if (cop.shootTimer >= shootRate) {
                cop.shootTimer = 0;
                LIFE.sounds.gunshot();
                var h = cop.char.height || 1.8;
                var origin = new THREE.Vector3(
                    cop.char.group.position.x, h * 0.7, cop.char.group.position.z
                );
                var dir = new THREE.Vector3(dx, 0, dz).normalize();
                var spread = cop.isSWAT ? 0.08 : 0.12;
                dir.x += (Math.random() - 0.5) * spread;
                dir.z += (Math.random() - 0.5) * spread;
                dir.normalize();
                LIFE.createBullet(origin, dir, true);
                LIFE.createMuzzleFlash(origin);
                // SWAT fires burst (2-3 shots)
                if (cop.isSWAT) {
                    for (var bi = 0; bi < 2; bi++) {
                        var bdir = new THREE.Vector3(dx, 0, dz).normalize();
                        bdir.x += (Math.random() - 0.5) * 0.1;
                        bdir.z += (Math.random() - 0.5) * 0.1;
                        bdir.normalize();
                        LIFE.createBullet(origin.clone(), bdir, true);
                    }
                }
            }
        }
    });
};

LIFE.arrestPlayer = function() {
    if (LIFE.state.gamePhase === 'jail' || LIFE.state.gamePhase === 'execution') return;
    var state = LIFE.state;

    // Force exit car if driving
    if (state.inCar) {
        state.inCar = false;
        if (LIFE.car.model) { LIFE.scene.remove(LIFE.car.model); LIFE.car.model = null; }
        LIFE.car.currentSpeed = 0;
        if (LIFE.player) LIFE.player.group.visible = true;
        // Car gets impounded (removed)
        if (LIFE.car.parkedModel) { LIFE.scene.remove(LIFE.car.parkedModel); LIFE.car.parkedModel = null; }
    }

    // DEATH PENALTY check - too many kills or max wanted with high kill count (adults only)
    if (state.age >= 18 && (state.kills >= 5 || (state.wantedLevel >= 8 && state.kills >= 3))) {
        LIFE.cleanupBullets();
        LIFE.removeAllPolice();
        state.wantedLevel = 0;
        state.policeDispatching = false;
        state.swatDispatching = false; state.swatDispatched = false;
        state.bounty = 0;
        state.criminalRecord = true;

        // confiscate items
        state.inventory = ['Fists'];
        state.equippedIndex = 0;
        state.hasGun = false;
        state.hasSwitchblade = false;
        LIFE.updateHeldWeapon();

        // enter execution phase
        state.gamePhase = 'execution';
        state.executionTimer = 0;
        state.executionPhase = 0;
        // hide world zones if built
        if (LIFE.world.built) {
            if (LIFE.world.insideInterior) {
                LIFE.npcs.forEach(function(n) {
                    if (!n._isZoneNPC) LIFE.scene.remove(n.char.group);
                });
                LIFE.npcs = [];
                if (LIFE.world._interiorGroup) {
                    LIFE.scene.remove(LIFE.world._interiorGroup);
                    LIFE.world._interiorGroup = null;
                }
                LIFE.clearEnvironment();
                LIFE.world.insideInterior = null;
            }
            LIFE.world.hideAllZones();
        }
        state.bounds = LIFE.getBoundsForStage('execution');
        LIFE.buildEnvironment('execution');
        LIFE.updatePlayerSize();

        // position player at bottom of stairs
        LIFE.player.group.position.set(4.5, 0, -4);
        LIFE.player.group.rotation.y = Math.PI * 0.5;

        // hide most UI, show only sentencing text
        LIFE.ui.hideGameUI();
        LIFE.ui.hideJailScreen();
        LIFE.ui.$.ageBox.style.display = 'block';
        LIFE.ui.$.controls.style.display = 'block';
        LIFE.ui.$.controls.textContent = 'SENTENCED TO DEATH BY HANGING';
        LIFE.ui.$.controls.style.color = '#ff1744';
        LIFE.ui.$.cross.style.display = 'none';

        // Big sentencing popup for death penalty
        LIFE.ui.showSentencePopup(99, 0, state.crimeLog || []);
        state.crimeLog = [];

        LIFE.lockCursor();
        LIFE.sounds.arrest();
        return;
    }

    var years = Math.ceil(state.wantedLevel / 3) + state.kills * 12;
    if (years < 1) years = 1;
    // juveniles get much lighter sentences
    if (state.age < 18) {
        if (state.age < 10) {
            years = Math.min(1, Math.ceil(years * 0.1)); // young kids: slap on the wrist
        } else if (state.age < 14) {
            years = Math.max(1, Math.ceil(years * 0.25)); // preteens: juvenile detention
        } else {
            years = Math.max(1, Math.ceil(years * 0.5)); // teens: reduced sentence
        }
    }
    var fine = Math.min(state.money, 300 * state.wantedLevel + 5000 * state.kills);
    if (state.age < 18) fine = Math.floor(fine * 0.3); // juveniles pay less fines

    state.gamePhase = 'jail';
    state.jailYears = years;
    state.jailFine = Math.floor(fine);
    // Jail timer: 8s/year for first 6, then 2s/year after (long sentences don't drag)
    state.jailTimer = Math.min(years, 6) * 8 + Math.max(0, years - 6) * 2 + 3;
    state._jailStartTimer = state.jailTimer;
    state._jailStartAge = state.age;
    state.jailEventTimer = 5 + Math.random() * 8;
    state.money = Math.max(0, state.money - fine);
    state.career = null;
    state.criminalRecord = true;
    state.timesJailed++;
    state.wantedLevel = 0;
    state.policeDispatching = false;
    state.swatDispatching = false; state.swatDispatched = false;
    state.bounty = 0; // bounty cleared by serving time
    state.reputation = Math.max(-100, state.reputation - 15);
    // Crime log is used by jail screen, clear after display
    // (cleared below after showJailScreen call)
    // Display sentence text
    var sentenceText;
    if (years >= 50) sentenceText = 'multiple life sentences';
    else if (years >= 25) sentenceText = 'life in prison';
    else sentenceText = years + ' years';
    if (LIFE.news) {
        var crimeMsg = state.kills > 0
            ? 'Suspect apprehended after violent crime spree - sentenced to ' + sentenceText + '.'
            : 'Local resident arrested and sentenced to ' + sentenceText + '.';
        LIFE.news.add(crimeMsg, 'crime');
    }
    state.stats.happiness = Math.max(0, state.stats.happiness - 20);

    // CONFISCATE contraband items
    state.inventory = ['Fists'];
    state.equippedIndex = 0;
    state.hasGun = false;
    state.hasSwitchblade = false;
    LIFE.updateHeldWeapon();

    // clean up bullets
    LIFE.cleanupBullets();
    LIFE.removeAllPolice();

    // hide world zones if built
    if (LIFE.world.built) {
        if (LIFE.world.insideInterior) {
            // Clean up current interior NPCs
            LIFE.npcs.forEach(function(n) {
                if (!n._isZoneNPC) LIFE.scene.remove(n.char.group);
            });
            LIFE.npcs = [];
            if (LIFE.world._interiorGroup) {
                LIFE.scene.remove(LIFE.world._interiorGroup);
                LIFE.world._interiorGroup = null;
            }
            LIFE.clearEnvironment();
            LIFE.world.insideInterior = null;
        }
        LIFE.world.hideAllZones();
    }

    if (LIFE.world.built) {
        // Build jail at police station world position using interior system
        var jailPos = LIFE.world.INTERIOR_POSITIONS.jail || { x: -60, z: -80 };
        var cfg = LIFE.STAGES.jail;
        if (cfg) {
            LIFE.scene.background.set(cfg.bg);
            LIFE.scene.fog.color.set(cfg.fog[0]);
            LIFE.scene.fog.near = cfg.fog[1];
            LIFE.scene.fog.far = cfg.fog[2];
        }
        state.bounds = LIFE.getBoundsForStage('jail');

        var jailGroup = new THREE.Group();
        jailGroup.position.set(jailPos.x, 0, jailPos.z);
        LIFE.scene.add(jailGroup);
        LIFE.world._interiorGroup = jailGroup;

        var origAddEnv = LIFE.addEnv;
        var origAddCollider = LIFE.addCollider;
        LIFE.addEnv = function(obj) { jailGroup.add(obj); return obj; };
        LIFE.addCollider = function(x, z, w, d) {
            LIFE.colliders.push({
                minX: (x + jailPos.x) - w / 2, maxX: (x + jailPos.x) + w / 2,
                minZ: (z + jailPos.z) - d / 2, maxZ: (z + jailPos.z) + d / 2
            });
        };
        LIFE.buildJail();
        LIFE.addEnv = origAddEnv;
        LIFE.addCollider = origAddCollider;

        LIFE.world.insideInterior = 'jail';
        LIFE.world._interiorNPCOffset = jailPos;
        LIFE.spawnNPCs('jail');
        LIFE.world._interiorNPCOffset = null;
        LIFE.updatePlayerSize();
        LIFE.player.group.position.set(jailPos.x, 0, jailPos.z);
    } else {
        // Legacy non-world path
        state.bounds = LIFE.getBoundsForStage('jail');
        LIFE.buildEnvironment('jail');
        LIFE.spawnNPCs('jail');
        LIFE.updatePlayerSize();
        LIFE.player.group.position.set(0, 0, 0);
    }

    // show jail HUD
    var crimesCopy = (state.crimeLog || []).slice();
    LIFE.ui.showJailScreen(years, state.jailFine);
    LIFE.ui.showSentencePopup(years, state.jailFine, crimesCopy);
    state.crimeLog = []; // clear crime log after displaying
    LIFE.ui.hideGameUI();
    LIFE.ui.$.ageBox.style.display = 'block';
    LIFE.ui.$.playerHpBar.style.display = 'block';
    LIFE.ui.$.controls.style.display = 'block';
    LIFE.ui.$.controls.textContent = 'WASD: Move | Mouse: Look | Click/1: Punch | T: Talk';
    LIFE.ui.$.actions.style.display = 'flex';
    LIFE.ui.updateJailActions();
    LIFE.ui.updateWeapon();

    // lock cursor for 3D jail
    LIFE.lockCursor();
    LIFE.sounds.arrest();
};

LIFE.exitJail = function() {
    var state = LIFE.state;
    // age already advanced during jail stay, just make sure final age is correct
    var finalAge = (state._jailStartAge || state.age) + state.jailYears;
    if (finalAge > LIFE.MAX_AGE) { state.deathCause = 'died in prison'; LIFE.triggerDeath(); return; }
    state.age = finalAge;
    state._jailStartTimer = null;
    state._jailStartAge = null;
    state.kills = 0;
    state.gamePhase = 'playing';
    LIFE.ui.hideJailScreen();
    LIFE.ui.showGameUI();
    LIFE.ui.$.controls.textContent = 'WASD: Move | Mouse: Look | Space: Jump | 1-4: Actions | E: Skip Year | R: Time Skip | T: Talk | Q: Switch Item | F: Info | G: Enter Home';
    var newStage = LIFE.getStageForAge(state.age);
    state.currentStage = newStage;

    if (LIFE.world.built) {
        // Remove jail NPCs from scene (zone NPCs stay)
        LIFE.npcs.forEach(function(n) {
            if (!n._isZoneNPC) LIFE.scene.remove(n.char.group);
        });
        LIFE.npcs = [];
        // Remove jail interior group
        if (LIFE.world._interiorGroup) {
            LIFE.scene.remove(LIFE.world._interiorGroup);
            LIFE.world._interiorGroup = null;
        }
        // Clear remaining jail objects
        LIFE.clearEnvironment();
        // Restore world zones
        LIFE.world.showNearbyZones();
        LIFE.world.insideInterior = null;
        // Teleport to correct zone
        var zonePos = LIFE.world.getZonePos(newStage);
        LIFE.player.group.position.set(zonePos.x, 0, zonePos.z + 5);
        state.bounds = 400;
        // Restore atmosphere
        LIFE.scene.background.set(0x87ceeb);
        LIFE.scene.fog.color.set(0x87ceeb);
        LIFE.scene.fog.near = 50;
        LIFE.scene.fog.far = 200;
        // Restore persistent police (show them at patrol positions)
        if (LIFE.world.policeCops) {
            for (var ri = 0; ri < LIFE.world.policeCops.length; ri++) {
                var rcop = LIFE.world.policeCops[ri];
                if (rcop.npc.alive) {
                    rcop.npc.char.group.visible = true;
                    rcop.npc.char.group.position.set(rcop.patrolPos.x, 0, rcop.patrolPos.z);
                    rcop.aiState = 'idle';
                }
            }
        }
        // Refresh NPCs and force culling update
        LIFE.world.spawnZoneNPCs(newStage);
        LIFE.world._cullingTimer = 999;
        LIFE.world.updateCulling(0);
        // Re-spawn parked car if owned
        if (state.ownedCar) LIFE.spawnParkedCar();
    } else {
        LIFE.buildEnvironment(newStage);
        LIFE.spawnNPCs(newStage);
        LIFE.player.group.position.set(0, 0, 0);
    }

    LIFE.updatePlayerSize();
    LIFE.ui.updateActionButtons();
    LIFE.ui.$.age.textContent = state.age;
    LIFE.ui.showStageMessage('Released from prison. Age ' + state.age);
};

// ============================================================
// BULLET CLEANUP
// ============================================================
LIFE.cleanupBullets = function() {
    if (LIFE.bullets) {
        for (var i = 0; i < LIFE.bullets.length; i++) {
            LIFE.scene.remove(LIFE.bullets[i].mesh);
            LIFE.scene.remove(LIFE.bullets[i].trail);
        }
        LIFE.bullets = [];
    }
    if (LIFE.impactEffects) {
        for (var j = 0; j < LIFE.impactEffects.length; j++) {
            LIFE.scene.remove(LIFE.impactEffects[j].mesh);
        }
        LIFE.impactEffects = [];
    }
};

// ============================================================
// INVENTORY
// ============================================================
LIFE.cycleInventory = function() {
    var inv = LIFE.state.inventory;
    if (inv.length <= 1) return;
    LIFE.state.equippedIndex = (LIFE.state.equippedIndex + 1) % inv.length;
    LIFE.ui.showPopup('Equipped: ' + inv[LIFE.state.equippedIndex], '#4fc3f7');
    LIFE.updateHeldWeapon();
};

LIFE.getEquipped = function() {
    return LIFE.state.inventory[LIFE.state.equippedIndex] || 'Fists';
};

// ============================================================
// HELD WEAPON VISUALS
// ============================================================
LIFE._weaponMesh = null;
LIFE._currentWeaponType = null;

LIFE.createWeaponMesh = function(type, playerHeight) {
    var group = new THREE.Group();
    var h = playerHeight || 1.7;
    var armH = h * 0.28;
    if (type === 'Switchblade') {
        // Blade: thin flat rectangle
        var blade = new THREE.Mesh(
            new THREE.BoxGeometry(0.02, h * 0.12, 0.04),
            new THREE.MeshPhongMaterial({ color: 0xcccccc, shininess: 80 })
        );
        blade.position.y = -h * 0.06;
        group.add(blade);
        // Handle: small dark rectangle
        var handle = new THREE.Mesh(
            new THREE.BoxGeometry(0.03, h * 0.05, 0.05),
            new THREE.MeshPhongMaterial({ color: 0x333333 })
        );
        handle.position.y = h * 0.025;
        group.add(handle);
        // Position at end of arm, pointing down
        group.position.set(0, -armH - h * 0.02, 0);
        group.rotation.x = -0.3; // slight tilt forward
    } else if (type === 'Pistol') {
        // Gun body: blocky rectangle
        var body = new THREE.Mesh(
            new THREE.BoxGeometry(0.035, 0.04, h * 0.1),
            new THREE.MeshPhongMaterial({ color: 0x222222 })
        );
        body.position.z = h * 0.04;
        group.add(body);
        // Barrel: thin cylinder-ish box
        var barrel = new THREE.Mesh(
            new THREE.BoxGeometry(0.025, 0.025, h * 0.06),
            new THREE.MeshPhongMaterial({ color: 0x111111 })
        );
        barrel.position.set(0, 0.01, h * 0.1);
        group.add(barrel);
        // Grip: angled handle
        var grip = new THREE.Mesh(
            new THREE.BoxGeometry(0.03, h * 0.05, 0.035),
            new THREE.MeshPhongMaterial({ color: 0x333333 })
        );
        grip.position.set(0, -h * 0.02, h * 0.01);
        grip.rotation.x = 0.2;
        group.add(grip);
        // Position at end of arm, pointing forward
        group.position.set(0, -armH * 0.9, 0.02);
    }
    return group;
};

LIFE.updateHeldWeapon = function() {
    var player = LIFE.player;
    if (!player || !player.parts || !player.parts.rightArm) return;
    var equipped = LIFE.getEquipped();

    // Remove current weapon mesh if type changed
    if (LIFE._weaponMesh && LIFE._currentWeaponType !== equipped) {
        player.parts.rightArm.remove(LIFE._weaponMesh);
        LIFE._weaponMesh = null;
        LIFE._currentWeaponType = null;
    }

    // Fists = no weapon
    if (equipped === 'Fists' || !equipped) {
        // Reset right arm rotation to default
        player.parts.rightArm.rotation.x = 0;
        return;
    }

    // Create new weapon mesh
    if (!LIFE._weaponMesh) {
        LIFE._weaponMesh = LIFE.createWeaponMesh(equipped, player.height);
        LIFE._currentWeaponType = equipped;
        player.parts.rightArm.add(LIFE._weaponMesh);
    }

    // Arm pose based on weapon
    if (equipped === 'Switchblade') {
        // Hold arm slightly out and down
        player.parts.rightArm.rotation.x = -0.4;
        player.parts.rightArm.rotation.z = -0.15;
    } else if (equipped === 'Pistol') {
        // Hold arm forward, pointing gun ahead
        player.parts.rightArm.rotation.x = -1.4; // arm extended forward
        player.parts.rightArm.rotation.z = -0.1;
    }
};

// ============================================================
// RANDOM LIFE EVENTS
// ============================================================
LIFE.triggerRandomEvent = function() {
    if (LIFE.dialogue.active) return;
    var state = LIFE.state;
    var age = state.age;

    // gather all eligible events - static + context-aware
    var allEvents = LIFE.RANDOM_EVENTS.concat(LIFE.getContextEvents());
    var eligible = [];
    allEvents.forEach(function(evt) {
        if (age < evt.minAge) return;
        if (evt.maxAge && age > evt.maxAge) return;
        // state-based conditions
        if (evt.reqMarried && !state.married) return;
        if (evt.reqKids && !state.hasKids) return;
        if (evt.reqFame && (state.fame || 0) < evt.reqFame) return;
        if (evt.reqRep && state.reputation < evt.reqRep) return;
        if (evt.reqBadRep && state.reputation > evt.reqBadRep) return;
        if (evt.reqCareer && state.career !== evt.reqCareer) return;
        if (evt.reqAnyCareer && (!state.career || state.career === 'none')) return;
        if (evt.reqRich && state.money < evt.reqRich) return;
        if (evt.reqPoor && state.money > evt.reqPoor) return;
        if (evt.reqCriminal && !state.criminalRecord) return;
        if (evt.reqProperty && (!state.properties || state.properties.length === 0)) return;
        if (Math.random() < (evt.chance || 0.15)) {
            eligible.push(evt);
        }
    });
    if (eligible.length === 0) return;
    var evt = eligible[Math.floor(Math.random() * eligible.length)];
    setTimeout(function() {
        if (!LIFE.dialogue.active && LIFE.state.gamePhase === 'playing') {
            LIFE.dialogue.open('Life Event', evt.text, evt.options, true);
        }
    }, 800);
};

// Context-aware random events based on current player state
LIFE.getContextEvents = function() {
    var events = [];
    var state = LIFE.state;

    // MARRIAGE events
    events.push(
        { text: "Your spouse planned a surprise anniversary dinner!", minAge: 20, maxAge: 80, chance: 0.15, reqMarried: true,
          options: [
            { text: "This is amazing! Best night ever!", effects: { happiness: 8 }, rep: 3 },
            { text: "I forgot our anniversary... ($200 gift)", effects: { happiness: 5 }, cost: 200, rep: 2 }
        ]},
        { text: "Your spouse wants to go on a couple's vacation. ($1,000)", minAge: 22, maxAge: 70, chance: 0.12, reqMarried: true,
          options: [
            { text: "Book it! We deserve this!", effects: { happiness: 10, charisma: 2 }, cost: 1000, rep: 3 },
            { text: "We can't afford that right now", effects: { happiness: -3 }, rep: -2 },
            { text: "Let's do a staycation instead", effects: { happiness: 5 }, rep: 1 }
        ]},
        { text: "You and your spouse had a big argument.", minAge: 20, maxAge: 80, chance: 0.12, reqMarried: true,
          options: [
            { text: "Apologize and make up", effects: { happiness: 3, charisma: 2 }, rep: 3 },
            { text: "Give each other space", effects: { happiness: -3 }, rep: 0 },
            { text: "Sleep on the couch", effects: { happiness: -5, health: -2 }, rep: -2 }
        ]}
    );

    // KIDS events
    events.push(
        { text: "Your kid got into trouble at school! The principal called.", minAge: 25, maxAge: 60, chance: 0.15, reqKids: true,
          options: [
            { text: "Ground them for a week", effects: { happiness: -2 }, rep: 3 },
            { text: "Talk to them about it calmly", effects: { charisma: 2, happiness: 1 }, rep: 5 },
            { text: "Defend your kid to the principal", effects: { charisma: 1 }, rep: -3 }
        ]},
        { text: "Your child won first place at the science fair!", minAge: 25, maxAge: 55, chance: 0.12, reqKids: true,
          options: [
            { text: "I'm so proud! Ice cream for everyone! ($20)", effects: { happiness: 8 }, cost: 20, rep: 3 },
            { text: "They get that from me!", effects: { happiness: 5, charisma: 1 }, rep: 1 }
        ]},
        { text: "Your kid asked for an expensive toy. ($100)", minAge: 25, maxAge: 55, chance: 0.12, reqKids: true,
          options: [
            { text: "Sure, you deserve it!", effects: { happiness: 3 }, cost: 100, rep: 2 },
            { text: "Let's save up for it together", effects: { intelligence: 1 }, rep: 3 },
            { text: "We can't afford that", effects: { happiness: -2 }, rep: -1 }
        ]}
    );

    // FAME events
    events.push(
        { text: "A fan recognized you on the street and asked for a selfie!", minAge: 18, maxAge: 70, chance: 0.2, reqFame: 30,
          options: [
            { text: "Of course! Say cheese!", effects: { happiness: 3, charisma: 2 }, rep: 5, fame: 3 },
            { text: "Sorry, I'm in a hurry", effects: {}, rep: -3, fame: -2 },
            { text: "Sure, and let me sign something!", effects: { charisma: 3 }, rep: 8, fame: 5 }
        ]},
        { text: "A magazine wants to feature you on their cover!", minAge: 20, maxAge: 60, chance: 0.12, reqFame: 50,
          options: [
            { text: "I'd be honored!", effects: { happiness: 5, charisma: 5 }, rep: 10, fame: 15 },
            { text: "Only if the price is right ($5,000)", effects: { charisma: 2 }, money: 5000, fame: 10 },
            { text: "I value my privacy", effects: { happiness: 2 }, rep: 2 }
        ]},
        { text: "Paparazzi are following you everywhere!", minAge: 18, maxAge: 70, chance: 0.15, reqFame: 40,
          options: [
            { text: "Wave and smile!", effects: { charisma: 3 }, rep: 3, fame: 5 },
            { text: "Confront them angrily", effects: { charisma: -2 }, rep: -8, fame: 3 },
            { text: "Hire a bodyguard ($500)", effects: { happiness: 2 }, cost: 500, rep: 2 }
        ]},
        { text: "A brand wants you as their spokesperson! ($3,000)", minAge: 20, maxAge: 55, chance: 0.1, reqFame: 60,
          options: [
            { text: "Sign the deal!", effects: { charisma: 3, happiness: 3 }, money: 3000, fame: 8, rep: 3 },
            { text: "Negotiate for more ($6,000)", effects: { charisma: 2 }, money: 6000, fame: 5 },
            { text: "I don't do endorsements", effects: { happiness: 2 }, rep: 5 }
        ]}
    );

    // BAD REPUTATION events
    events.push(
        { text: "Someone keyed your car because of your reputation!", minAge: 18, maxAge: 70, chance: 0.15, reqBadRep: -30,
          options: [
            { text: "File a police report", effects: { happiness: -3 }, rep: 3 },
            { text: "Find out who did it", effects: { charisma: 1, happiness: -2 }, rep: -5 },
            { text: "I probably deserved that...", effects: { happiness: -1 }, rep: 5 }
        ]},
        { text: "A store refused to serve you due to your reputation!", minAge: 16, maxAge: 80, chance: 0.15, reqBadRep: -50,
          options: [
            { text: "Quietly leave", effects: { happiness: -3 }, rep: 2 },
            { text: "Cause a scene", effects: { charisma: -2 }, rep: -10 },
            { text: "Apologize and try to make amends", effects: { happiness: 1 }, rep: 8 }
        ]},
        { text: "Anonymous threats were left at your door!", minAge: 18, maxAge: 80, chance: 0.1, reqBadRep: -60,
          options: [
            { text: "Call the police", effects: { happiness: -5 }, rep: 3 },
            { text: "Ignore it, I can handle myself", effects: { charisma: 1 }, rep: -2 },
            { text: "Maybe I should change my ways...", effects: { happiness: 2 }, rep: 10 }
        ]}
    );

    // GOOD REPUTATION events
    events.push(
        { text: "The community wants to give you an award for your contributions!", minAge: 25, maxAge: 80, chance: 0.12, reqRep: 50,
          options: [
            { text: "I'm honored to accept!", effects: { happiness: 8, charisma: 3 }, rep: 10 },
            { text: "I couldn't have done it without everyone's support", effects: { happiness: 5, charisma: 5 }, rep: 15 }
        ]},
        { text: "A local newspaper wants to write a story about your good deeds!", minAge: 20, maxAge: 80, chance: 0.1, reqRep: 40,
          options: [
            { text: "Happy to share my story!", effects: { charisma: 3 }, rep: 8, fame: 5 },
            { text: "I prefer to stay humble", effects: { happiness: 3 }, rep: 5 }
        ]}
    );

    // RICH events
    events.push(
        { text: "A charity gala invited you as a VIP guest! ($2,000 donation)", minAge: 25, maxAge: 80, chance: 0.12, reqRich: 50000,
          options: [
            { text: "Attend and donate generously!", effects: { happiness: 5, charisma: 5 }, cost: 2000, rep: 15, fame: 5 },
            { text: "Send the check but skip the event", effects: { happiness: 1 }, cost: 2000, rep: 8 },
            { text: "Politely decline", effects: {}, rep: -3 }
        ]},
        { text: "A financial advisor suggests diversifying your portfolio.", minAge: 25, maxAge: 70, chance: 0.1, reqRich: 20000,
          options: [
            { text: "Good idea! Invest $5,000", effects: { intelligence: 2 }, cost: 5000, money: 7000 },
            { text: "I'll manage my own money", effects: { intelligence: 1 }, rep: 0 }
        ]}
    );

    // POOR events
    events.push(
        { text: "You're struggling to pay rent this month...", minAge: 23, maxAge: 65, chance: 0.2, reqPoor: 500,
          options: [
            { text: "Ask a friend for help", effects: { happiness: -3 }, money: 200, rep: -3 },
            { text: "Pick up odd jobs to make ends meet", effects: { health: -3, happiness: -2 }, money: 150, rep: 2 },
            { text: "Skip rent this month", effects: { happiness: -5 }, rep: -5 }
        ]},
        { text: "A food bank in the neighborhood is offering free meals.", minAge: 18, maxAge: 80, chance: 0.15, reqPoor: 200,
          options: [
            { text: "Accept the help gratefully", effects: { happiness: 2, health: 3 }, rep: 2 },
            { text: "I'm too proud for charity", effects: { happiness: -2 }, rep: -1 }
        ]}
    );

    // CRIMINAL RECORD events
    events.push(
        { text: "A background check revealed your criminal record to a potential employer.", minAge: 23, maxAge: 65, chance: 0.15, reqCriminal: true,
          options: [
            { text: "Be honest about your past", effects: { charisma: 2 }, rep: 5 },
            { text: "Try to explain the circumstances", effects: { charisma: 1 }, rep: 2 },
            { text: "Walk out of the interview", effects: { happiness: -3 }, rep: -2 }
        ]},
        { text: "Someone from your past recognized you as an ex-convict.", minAge: 20, maxAge: 80, chance: 0.12, reqCriminal: true,
          options: [
            { text: "I've changed my ways", effects: { charisma: 2 }, rep: 5 },
            { text: "Mind your own business", effects: {}, rep: -5 },
            { text: "Yeah, and I'm not proud of it", effects: { happiness: -2 }, rep: 3 }
        ]}
    );

    // PROPERTY OWNER events
    events.push(
        { text: "Your rental property needs emergency repairs! ($800)", minAge: 23, maxAge: 80, chance: 0.15, reqProperty: true,
          options: [
            { text: "Fix it right away", effects: { happiness: -2 }, cost: 800, rep: 3 },
            { text: "Do a temporary patch job ($200)", effects: {}, cost: 200, rep: -2 },
            { text: "Tell the tenants to deal with it", effects: {}, rep: -8 }
        ]},
        { text: "Property values in your area have gone up! Your investments are worth more.", minAge: 23, maxAge: 80, chance: 0.1, reqProperty: true,
          options: [
            { text: "Great news! Time to celebrate!", effects: { happiness: 5 }, money: 1500 },
            { text: "Maybe I should buy more property", effects: { intelligence: 2 }, money: 1500, rep: 1 }
        ]}
    );

    return events;
};

// ============================================================
// HOME ENTER / EXIT
// ============================================================
LIFE.tryEnterExitHome = function() {
    var state = LIFE.state;

    // EXIT HOSPITAL → back to where we were
    if (state.currentStage === 'hospital' || LIFE.world.insideInterior === 'hospital') {
        LIFE.exitHospital();
        return;
    }

    // In open world: use world door system
    if (LIFE.world.built) {
        // EXIT any interior
        if (LIFE.world.insideInterior) {
            var interiorName = LIFE.world.insideInterior;
            var friendlyNames = { classroom: 'the classroom', hsclassroom: 'the classroom', playerhome: 'your home', hospital: 'the hospital' };
            LIFE.world.exitInterior();
            LIFE.ui.showPopup('Left ' + (friendlyNames[interiorName] || interiorName), '#ff9800');
            return;
        }
        // ENTER a door
        LIFE.world.tryEnterDoor();
        return;
    }

    // --- Legacy (non-world) behavior ---
    // EXIT HOME → back to city
    if (state.currentStage === 'playerhome') {
        var cityPos = state._cityReturnPos || { x: 0, z: 0 };
        state.currentStage = 'city';
        state.bounds = LIFE.getBoundsForStage('city');
        LIFE.buildEnvironment('city');
        LIFE.spawnNPCs('city');
        LIFE.updatePlayerSize();
        LIFE.player.group.position.set(cityPos.x, 0, cityPos.z + 2);
        LIFE.ui.showPopup('Left your home', '#ff9800');
        return;
    }

    // ENTER HOME from city
    if (state.currentStage !== 'city') return;
    if (!state.homeDoor) {
        LIFE.ui.showPopup("You don't own a home to enter!", '#ef5350');
        return;
    }

    var px = LIFE.player.group.position.x;
    var pz = LIFE.player.group.position.z;
    var dx = px - state.homeDoor.x;
    var dz = pz - state.homeDoor.z;
    var dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > 6) {
        LIFE.ui.showPopup('Get closer to your home door (G)', '#ff9800');
        return;
    }

    // save city position for return
    state._cityReturnPos = { x: state.homeDoor.x, z: state.homeDoor.z };
    state.currentStage = 'playerhome';
    state.bounds = LIFE.getBoundsForStage('playerhome');
    LIFE.buildEnvironment('playerhome');
    LIFE.updatePlayerSize();
    LIFE.player.group.position.set(0, 0, 3);

    // spawn family NPCs inside home
    LIFE.spawnHomeNPCs();

    LIFE.ui.showPopup('Welcome home!', '#4caf50');
};

LIFE.spawnHomeNPCs = function() {
    // clear current NPCs first
    LIFE.npcs.forEach(function(n) { LIFE.scene.remove(n.char.group); });
    LIFE.npcs = [];
    var state = LIFE.state;

    // Spouse
    if (state.married && state.spouseName) {
        var spouse = LIFE.createNPC('Spouse', -1, -1, state.spouseName);
        spouse.speed = 0.3;
        spouse.stayNear = new THREE.Vector3(-1, 0, -1);
        LIFE.npcs.push(spouse);
    }

    // Children
    if (state.hasKids && state.childCount > 0) {
        var kidsToShow = Math.min(state.childCount, 3);
        for (var i = 0; i < kidsToShow; i++) {
            var cx = -2 + i * 2;
            var cz = 1 + Math.random();
            var childName = (state.childNames && state.childNames[i]) ? state.childNames[i] : null;
            var child = LIFE.createNPC('Your Child', cx, cz, childName);
            child.speed = 0.5;
            child.stayNear = new THREE.Vector3(cx, 0, cz);
            LIFE.npcs.push(child);
        }
    }
};

// ============================================================
// HOSPITAL SYSTEM
// ============================================================
LIFE.sendToHospital = function(reason) {
    var state = LIFE.state;
    if (state.gamePhase !== 'playing') return;
    if (state.currentStage === 'hospital' || LIFE.world.insideInterior === 'hospital') return;

    // save where we were
    state.hospitalReason = reason;
    state.hospitalReturnStage = state.currentStage;
    state.hospitalReturnPos = {
        x: LIFE.player.group.position.x,
        z: LIFE.player.group.position.z
    };
    state.hospitalTimer = 0;

    if (LIFE.world.built) {
        state.currentStage = 'hospital';
        LIFE.world.enterInterior('hospital');
    } else {
        // transition to hospital
        state.currentStage = 'hospital';
        state.bounds = LIFE.getBoundsForStage('hospital');
        LIFE.buildEnvironment('hospital');
        LIFE.spawnNPCs('hospital');
        LIFE.updatePlayerSize();
        LIFE.player.group.position.set(0, 0, 3);
    }

    var msgs = {
        nearDeath: 'Rushed to the hospital!',
        illness: 'You feel sick... going to the hospital',
        parentCheckin: 'Your parents took you to the hospital',
        overdose: 'Rushed to the hospital!',
        foodPoisoning: 'Going to the hospital...',
        injury: 'Taken to the hospital',
        carAccident: 'Ambulance to the hospital!'
    };
    LIFE.ui.showStageMessage(msgs[reason] || 'Admitted to hospital');

    // doctor will talk based on reason
    setTimeout(function() {
        if (state.gamePhase === 'playing' && state.currentStage === 'hospital') {
            LIFE.dialogue.openHospitalDialogue(reason);
        }
    }, 1500);
};

LIFE.exitHospital = function() {
    var state = LIFE.state;
    var returnStage = state.hospitalReturnStage || LIFE.getStageForAge(state.age);
    var returnPos = state.hospitalReturnPos || { x: 0, z: 0 };

    state.hospitalReason = null;
    state.hospitalReturnStage = null;
    state.hospitalReturnPos = null;
    state.currentStage = returnStage;

    if (LIFE.world.built) {
        // Save return pos so exitInterior uses it
        LIFE.world._savedPlayerPos = { x: returnPos.x, z: returnPos.z };
        LIFE.world.exitInterior();

        // if school age, restore day phase
        if (LIFE.isSchoolAge(state.age)) {
            var dayTimer = state.yearTimer % LIFE.DAY_DURATION;
            var phase = 'home';
            for (var i = 0; i < LIFE.SCHOOL_PHASES.length; i++) {
                var sp = LIFE.SCHOOL_PHASES[i];
                if (dayTimer >= sp.start && dayTimer < sp.end) { phase = sp.name; break; }
            }
            state.dayPhase = phase;
            LIFE.transitionDayPhase(phase);
        }
    } else {
        state.bounds = LIFE.getBoundsForStage(returnStage);
        LIFE.buildEnvironment(returnStage);
        LIFE.spawnNPCs(returnStage);
        LIFE.updatePlayerSize();
        LIFE.player.group.position.set(returnPos.x, 0, returnPos.z);

        // if school age, restore day phase
        if (LIFE.isSchoolAge(state.age)) {
            var dayTimer2 = state.yearTimer % LIFE.DAY_DURATION;
            var phase2 = 'home';
            for (var j = 0; j < LIFE.SCHOOL_PHASES.length; j++) {
                var sp2 = LIFE.SCHOOL_PHASES[j];
                if (dayTimer2 >= sp2.start && dayTimer2 < sp2.end) { phase2 = sp2.name; break; }
            }
            state.dayPhase = phase2;
            LIFE.transitionDayPhase(phase2);
        }
    }

    LIFE.ui.showPopup('Discharged from hospital', '#4caf50');
};

// ============================================================
// SCHOOL DAY CYCLE
// ============================================================
// School day phases within a single 20-minute day (1200 seconds)
// School day: 8am-2pm class, 2-4pm recess, 4-10pm home, 10pm-8am sleep
// dayTimer 0-1200 maps to full 24 hours (same as non-school)
// Phase ranges in dayTimer units: 1200/24 = 50 per hour
LIFE.SCHOOL_PHASES = [
    { name: 'sleep',      start: 0,    end: 400 },    // 12am-8am (sleep)
    { name: 'classroom',  start: 400,  end: 700 },    // 8am-2pm (school)
    { name: 'schoolyard', start: 700,  end: 800 },    // 2pm-4pm (recess)
    { name: 'home',       start: 800,  end: 1100 },   // 4pm-10pm (home free time)
    { name: 'sleep',      start: 1100, end: 1200 }    // 10pm-12am (sleep)
];

LIFE.isSchoolAge = function(age) {
    return age >= 5 && age <= 17;
};

LIFE.getSimDate = function() {
    var state = LIFE.state;
    var dayDur = LIFE.DAY_DURATION;
    var yearProgress = Math.max(0, state.yearTimer / LIFE.YEAR_DURATION);
    var dayOfYear = Math.floor(yearProgress * 365) + 1;
    dayOfYear = Math.max(1, Math.min(365, dayOfYear));

    var monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var rem = dayOfYear;
    var month = 0;
    for (var i = 0; i < 12; i++) {
        if (rem <= monthDays[i]) { month = i; break; }
        rem -= monthDays[i];
        month = i;
    }
    if (rem < 1) rem = 1;

    // time within current day
    var dayTimer = state.yearTimer % dayDur; // 0 to 1200
    var hour, minutes;

    // All ages use same 24-hour clock: dayTimer 0-1200 = 0:00-23:59
    var dayFrac = dayTimer / dayDur;
    var totalMin4 = dayFrac * 1440; // 24 * 60
    hour = Math.floor(totalMin4 / 60);
    minutes = Math.floor(totalMin4 % 60);
    hour = Math.max(0, Math.min(23, hour));
    minutes = Math.max(0, Math.min(59, minutes));
    var ampm = hour >= 12 ? 'PM' : 'AM';
    var displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    var minStr = minutes < 10 ? '0' + minutes : '' + minutes;

    return {
        text: monthNames[month] + ' ' + rem + ', ' + (2006 + state.age) + ' - ' + displayHour + ':' + minStr + ' ' + ampm,
        dayOfYear: dayOfYear,
        month: month,
        day: rem,
        hour: hour,
        minutes: minutes
    };
};

// ============================================================
// WEATHER SYSTEM
// ============================================================
LIFE.weather = {
    current: 'clear',   // clear, cloudy, rain, storm, fog, windy
    timer: 0,           // time until next weather change
    intensity: 0,       // 0-1 for visual effects
    _transitionTimer: 0,
    _targetIntensity: 0
};

LIFE.WEATHER_TYPES = [
    { name: 'clear',  weight: 40, fogMod: 0,    lightMod: 0,    happinessMod: 0.005 },
    { name: 'cloudy', weight: 25, fogMod: -30,  lightMod: -0.1, happinessMod: -0.002 },
    { name: 'rain',   weight: 15, fogMod: -50,  lightMod: -0.2, happinessMod: -0.005 },
    { name: 'storm',  weight: 5,  fogMod: -80,  lightMod: -0.3, happinessMod: -0.01 },
    { name: 'fog',    weight: 10, fogMod: -100, lightMod: -0.15, happinessMod: -0.003 },
    { name: 'windy',  weight: 5,  fogMod: -20,  lightMod: -0.05, happinessMod: 0 }
];

LIFE.weather.changeWeather = function() {
    var totalWeight = 0;
    for (var i = 0; i < LIFE.WEATHER_TYPES.length; i++) totalWeight += LIFE.WEATHER_TYPES[i].weight;
    var roll = Math.random() * totalWeight;
    var cumulative = 0;
    for (var j = 0; j < LIFE.WEATHER_TYPES.length; j++) {
        cumulative += LIFE.WEATHER_TYPES[j].weight;
        if (roll <= cumulative) {
            LIFE.weather.current = LIFE.WEATHER_TYPES[j].name;
            LIFE.weather._targetIntensity = 0.3 + Math.random() * 0.7;
            break;
        }
    }
    LIFE.weather.timer = 120 + Math.random() * 300; // 2-7 minutes
    LIFE.weather._transitionTimer = 5; // 5 second transition
};

LIFE.weather.getWeatherData = function() {
    for (var i = 0; i < LIFE.WEATHER_TYPES.length; i++) {
        if (LIFE.WEATHER_TYPES[i].name === LIFE.weather.current) return LIFE.WEATHER_TYPES[i];
    }
    return LIFE.WEATHER_TYPES[0];
};

LIFE.weather.update = function(dt) {
    if (LIFE.state.gamePhase !== 'playing') return;
    var skip = { hospital: true, jail: true, execution: true, death: true, womb: true };
    if (skip[LIFE.state.currentStage]) return;
    // Don't weather indoors
    if (LIFE.world.built && LIFE.world.insideInterior) return;

    LIFE.weather.timer -= dt;
    if (LIFE.weather.timer <= 0) LIFE.weather.changeWeather();

    // Smooth intensity transition
    if (LIFE.weather._transitionTimer > 0) {
        LIFE.weather._transitionTimer -= dt;
        var t = 1 - Math.max(0, LIFE.weather._transitionTimer / 5);
        LIFE.weather.intensity += (LIFE.weather._targetIntensity - LIFE.weather.intensity) * t * dt;
    }

    // Apply weather effects to scene
    var wd = LIFE.weather.getWeatherData();
    if (LIFE.scene.fog) {
        LIFE.scene.fog.far = Math.max(30, (LIFE.scene.fog.far || 200) + wd.fogMod * LIFE.weather.intensity * dt * 0.5);
        // Slowly normalize fog when clear
        if (wd.name === 'clear') {
            LIFE.scene.fog.far = Math.min(200, LIFE.scene.fog.far + 2 * dt);
        }
    }

    // Mood effects from weather
    if (wd.happinessMod !== 0) {
        LIFE.state.stats.happiness = Math.max(0, Math.min(100,
            LIFE.state.stats.happiness + wd.happinessMod * LIFE.weather.intensity * dt));
    }

    // Rain/storm darkens ambient slightly
    if (wd.name === 'rain' || wd.name === 'storm') {
        if (LIFE.ambientLight) {
            LIFE.ambientLight.intensity = Math.max(0.1, LIFE.ambientLight.intensity + wd.lightMod * 0.01);
        }
    }
};

// ============================================================
// DAY / NIGHT CYCLE
// ============================================================
LIFE._dayNightTimer = 0;
LIFE.updateDayNight = function(dt) {
    var state = LIFE.state;
    if (state.gamePhase !== 'playing') return;
    // skip indoor-only / special stages
    var skip = { hospital: true, jail: true, execution: true, death: true, womb: true };
    if (skip[state.currentStage]) return;

    LIFE._dayNightTimer += dt;
    if (LIFE._dayNightTimer < 0.4) return;
    LIFE._dayNightTimer = 0;

    var sim = LIFE.getSimDate();
    var h = sim.hour + (sim.minutes || 0) / 60;
    var c1 = new THREE.Color(), c2 = new THREE.Color(), sky = new THREE.Color();
    var stg = LIFE.STAGES[state.currentStage];
    var defaultSky = stg ? stg.bg : 0x87ceeb;
    var ambInt, dirInt;

    if (h < 5) {
        // deep night
        ambInt = 0.08; dirInt = 0.03;
        LIFE.dirLight.color.setHex(0x334466);
        sky.setHex(0x050510);
    } else if (h < 6.5) {
        // dawn
        var t = (h - 5) / 1.5;
        ambInt = 0.08 + t * 0.35; dirInt = 0.03 + t * 0.5;
        c1.setHex(0x334466); c2.setHex(0xffaa66);
        LIFE.dirLight.color.copy(c1.clone().lerp(c2, t));
        c1.setHex(0x050510); c2.setHex(0xff7733);
        sky.copy(c1.clone().lerp(c2, t));
    } else if (h < 8) {
        // sunrise to morning
        var t2 = (h - 6.5) / 1.5;
        ambInt = 0.35 + t2 * 0.15; dirInt = 0.4 + t2 * 0.2;
        c1.setHex(0xffaa66); c2.setHex(0xffeedd);
        LIFE.dirLight.color.copy(c1.clone().lerp(c2, t2));
        c1.setHex(0xff7733); c2.setHex(defaultSky);
        sky.copy(c1.clone().lerp(c2, t2));
    } else if (h < 17) {
        // full day - use stage default
        ambInt = 0.5; dirInt = 0.6;
        LIFE.dirLight.color.setHex(0xffeedd);
        sky.setHex(defaultSky);
    } else if (h < 19) {
        // sunset
        var t3 = (h - 17) / 2;
        ambInt = 0.5 - t3 * 0.3; dirInt = 0.6 - t3 * 0.35;
        c1.setHex(0xffffff); c2.setHex(0xff6633);
        LIFE.dirLight.color.copy(c1.clone().lerp(c2, t3));
        c1.setHex(defaultSky); c2.setHex(0xff4400);
        sky.copy(c1.clone().lerp(c2, t3));
    } else if (h < 20.5) {
        // dusk
        var t4 = (h - 19) / 1.5;
        ambInt = 0.2 - t4 * 0.12; dirInt = 0.25 - t4 * 0.22;
        c1.setHex(0xff6633); c2.setHex(0x334466);
        LIFE.dirLight.color.copy(c1.clone().lerp(c2, t4));
        c1.setHex(0xff4400); c2.setHex(0x050510);
        sky.copy(c1.clone().lerp(c2, t4));
    } else {
        // night
        ambInt = 0.08; dirInt = 0.03;
        LIFE.dirLight.color.setHex(0x334466);
        sky.setHex(0x050510);
    }

    LIFE.ambientLight.intensity = ambInt;
    LIFE.dirLight.intensity = dirInt;
    LIFE.scene.background.copy(sky);
    if (LIFE.scene.fog) LIFE.scene.fog.color.copy(sky);

    // sun position arcs across sky
    var sunAngle = ((h - 6) / 12) * Math.PI;
    var sunY = Math.sin(sunAngle) * 20;
    LIFE.dirLight.position.set(Math.cos(sunAngle) * 20, Math.max(0.5, sunY), 10);
};

LIFE.transitionDayPhase = function(phase) {
    var state = LIFE.state;
    var isHS = state.age >= 12;

    if (LIFE.world.built) {
        if (phase === 'classroom') {
            LIFE.world.enterInterior(isHS ? 'hsclassroom' : 'classroom');
            LIFE.ui.showPopup('School time!', '#4fc3f7');
        } else if (phase === 'schoolyard') {
            if (LIFE.world.insideInterior) LIFE.world.exitInterior();
            var schoolZone = isHS ? 'highschool' : 'school';
            var def = LIFE.ZONE_DEFS[schoolZone];
            if (def) LIFE.player.group.position.set(def.cx, 0, def.cz + 5);
            LIFE.ui.showPopup('Recess!', '#66bb6a');
        } else if (phase === 'sleep') {
            if (LIFE.world.insideInterior) LIFE.world.exitInterior();
            LIFE.player.group.position.set(0, 0, -5);
            LIFE.ui.showPopup('Time for bed...', '#5c6bc0');
        } else {
            if (LIFE.world.insideInterior) LIFE.world.exitInterior();
            LIFE.player.group.position.set(0, 0, 5);
            LIFE.ui.showPopup('Home from school!', '#ff9800');
        }
        return;
    }

    var buildStage;
    if (phase === 'classroom') {
        buildStage = isHS ? 'hsclassroom' : 'classroom';
    } else if (phase === 'schoolyard') {
        buildStage = isHS ? 'highschool' : 'school';
    } else {
        buildStage = 'home';
    }

    // keep currentStage as base (school/highschool) for year advancement logic
    state.bounds = LIFE.getBoundsForStage(buildStage);
    LIFE.buildEnvironment(buildStage);
    LIFE.spawnNPCs(buildStage);
    LIFE.updatePlayerSize();
    LIFE.player.group.position.set(0, 0, 0);

    if (phase === 'classroom') {
        LIFE.ui.showPopup('School time!', '#4fc3f7');
    } else if (phase === 'schoolyard') {
        LIFE.ui.showPopup('Recess!', '#66bb6a');
    } else if (phase === 'sleep') {
        LIFE.ui.showPopup('Time for bed...', '#5c6bc0');
    } else {
        LIFE.ui.showPopup('Home from school!', '#ff9800');
    }
};

LIFE.updateSchoolDayCycle = function() {
    var state = LIFE.state;
    if (!LIFE.isSchoolAge(state.age)) {
        if (state.dayPhase) state.dayPhase = null;
        return;
    }
    // don't run during player home visit, hospital, or other special stages
    if (state.currentStage === 'playerhome' || state.currentStage === 'hospital') return;

    var dayTimer = state.yearTimer % LIFE.DAY_DURATION;
    var expectedPhase = null;
    for (var i = 0; i < LIFE.SCHOOL_PHASES.length; i++) {
        var sp = LIFE.SCHOOL_PHASES[i];
        if (dayTimer >= sp.start && dayTimer < sp.end) {
            expectedPhase = sp.name;
            break;
        }
    }
    if (!expectedPhase) expectedPhase = 'sleep'; // fallback to sleep (late night)

    if (expectedPhase !== state.dayPhase) {
        // don't transition during dialogue or shop
        if (LIFE.dialogue.active || state.shopOpen || state.friendsOpen || state.timeSkipOpen) return;
        state.dayPhase = expectedPhase;
        LIFE.transitionDayPhase(expectedPhase);
    }
};

LIFE.skipTime = function(hours) {
    var state = LIFE.state;
    if (state.gamePhase !== 'playing') return;
    if (state.wantedLevel > 0) {
        LIFE.ui.showPopup("Can't skip - police are after you!", '#ff1744');
        return;
    }
    if (LIFE.dialogue.active && LIFE.dialogue.blocking) return;

    // Convert displayed hours to yearTimer seconds
    // All ages: 1200 seconds = 1440 minutes (24 hours)
    var secsPerMin = LIFE.DAY_DURATION / 1440; // 0.833
    var secondsToAdd = hours * 60 * secsPerMin;

    // handle multi-year skips
    while (secondsToAdd > 0) {
        var remaining = LIFE.YEAR_DURATION - state.yearTimer;
        if (secondsToAdd >= remaining) {
            secondsToAdd -= remaining;
            LIFE.advanceYear();
            if (state.gamePhase !== 'playing') return; // died during advance
        } else {
            state.yearTimer += secondsToAdd;
            secondsToAdd = 0;
        }
    }

    // update day phase if in school
    if (LIFE.isSchoolAge(state.age) && state.gamePhase === 'playing') {
        var dayTimer = state.yearTimer % LIFE.DAY_DURATION;
        var newPhase = 'classroom';
        for (var i = 0; i < LIFE.SCHOOL_PHASES.length; i++) {
            var sp = LIFE.SCHOOL_PHASES[i];
            if (dayTimer >= sp.start && dayTimer < sp.end) {
                newPhase = sp.name;
                break;
            }
        }
        if (newPhase !== state.dayPhase) {
            state.dayPhase = newPhase;
            LIFE.transitionDayPhase(newPhase);
        }
    }

    LIFE.ui.closeTimeSkip();
    var simDate = LIFE.getSimDate();
    LIFE.ui.showPopup('Skipped to ' + simDate.text, '#ffeb3b');
};

// ============================================================
// INPUT
// ============================================================
LIFE.keys = {};

document.addEventListener('keydown', function(e) {
    LIFE.keys[e.code] = true;
    var state = LIFE.state;

    if (state.friendsOpen) {
        if (e.code === 'KeyF' || e.code === 'Escape') { LIFE.ui.closeFriends(); }
        return;
    }

    if (state.timeSkipOpen) {
        if (e.code === 'KeyR' || e.code === 'Escape') { LIFE.ui.closeTimeSkip(); }
        return;
    }

    if (LIFE.dialogue.active) {
        if (e.code === 'Space') { LIFE.dialogue.skipTypewriter(); return; }
        if (e.code >= 'Digit1' && e.code <= 'Digit4') {
            LIFE.dialogue.selectOption(parseInt(e.code[5]) - 1); return;
        }
        if (LIFE.dialogue.blocking) return;
    }

    if (state.shopOpen) {
        if (e.code === 'Escape' || e.code === 'KeyB') LIFE.ui.closeShop();
        return;
    }

    if (state.gamePhase !== 'playing' && state.gamePhase !== 'jail') return;

    if (e.code === 'KeyE' && state.gamePhase === 'playing') LIFE.advanceYear();
    if (e.code === 'KeyT' && state.nearestNPC && !LIFE.dialogue.active && !state.inCar) {
        LIFE.dialogue.talkToNPC(state.nearestNPC);
    }
    // punch works in jail too (Digit1 = punch)
    if (state.gamePhase === 'jail') {
        if (e.code === 'Digit1' && !LIFE.dialogue.active) {
            LIFE.performAction(0);
        }
    }
    // these only work while playing (not in jail)
    if (state.gamePhase === 'playing') {
        if (e.code === 'KeyQ') LIFE.cycleInventory();
        if (e.code === 'KeyF' && !LIFE.dialogue.active && !state.shopOpen) {
            LIFE.ui.openFriends();
        }
        if (e.code === 'KeyG' && !LIFE.dialogue.active && !state.shopOpen && !state.inCar) {
            LIFE.tryEnterExitHome();
        }
        if (e.code === 'KeyV' && !LIFE.dialogue.active && !state.shopOpen) {
            LIFE.toggleCar();
        }
        if (e.code === 'KeyR' && !LIFE.dialogue.active && !state.shopOpen && !state.friendsOpen) {
            LIFE.ui.openTimeSkip();
        }
        if (!LIFE.dialogue.active && e.code >= 'Digit1' && e.code <= 'Digit4') {
            LIFE.performAction(parseInt(e.code[5]) - 1);
        }
    }
});

document.addEventListener('keyup', function(e) { LIFE.keys[e.code] = false; });

document.addEventListener('mousemove', function(e) {
    if (!LIFE.state.locked) return;
    if (LIFE.state.gamePhase === 'execution') return; // cinematic camera
    LIFE.state.playerRotY -= e.movementX * 0.003;
    LIFE.state.cameraPitch = Math.max(0.1, Math.min(1.2, LIFE.state.cameraPitch + e.movementY * 0.003));
});

document.addEventListener('mousedown', function(e) {
    if (e.button !== 0 || !LIFE.state.locked) return;
    if (LIFE.dialogue.active && LIFE.dialogue.blocking) return;
    if (LIFE.state.shopOpen || LIFE.state.friendsOpen) return;
    // left-click punch in jail
    if (LIFE.state.gamePhase === 'jail') {
        if (!LIFE.dialogue.active && LIFE.state.actionCooldown <= 0) LIFE.performAction(0);
        return;
    }
    if (LIFE.state.gamePhase !== 'playing') return;
    if (LIFE.getEquipped() !== 'Pistol') return;
    if (LIFE.state.shootCooldown > 0) return;
    LIFE.shootGun();
});

document.addEventListener('pointerlockchange', function() {
    var wasLocked = LIFE.state.locked;
    LIFE.state.locked = (document.pointerLockElement === LIFE.canvas);
    if (LIFE.state.locked) {
        document.body.classList.add('locked');
        document.body.classList.remove('unlocked');
        if (LIFE.state.gamePhase !== 'execution') LIFE.ui.$.cross.style.display = 'block';
    } else {
        document.body.classList.remove('locked');
        document.body.classList.add('unlocked');
        LIFE.ui.$.cross.style.display = 'none';
    }
    if (!LIFE.state.locked && wasLocked &&
        LIFE.state.gamePhase !== 'start' && LIFE.state.gamePhase !== 'death' &&
        LIFE.state.gamePhase !== 'execution' &&
        !LIFE.dialogue.active && !LIFE.state.shopOpen && !LIFE.state.friendsOpen && !LIFE.state.timeSkipOpen) {
        LIFE.ui.$.start.style.display = 'flex';
        LIFE.ui.$.start.querySelector('h1').textContent = 'PAUSED';
        LIFE.ui.$.start.querySelector('p').textContent = 'Click to Resume';
        LIFE.ui.$.start.querySelector('.sub').textContent = 'Age: ' + LIFE.state.age +
            ' | $' + Math.floor(LIFE.state.money).toLocaleString();
    }
});

LIFE.dialogue.elements = {
    box: document.getElementById('dialogueBox'),
    name: document.getElementById('dlgName'),
    text: document.getElementById('dlgText'),
    options: document.getElementById('dlgOptions'),
    response: document.getElementById('dlgPlayerResponse')
};

// ============================================================
// GAME FLOW
// ============================================================
LIFE.startGame = function() {
    LIFE.ui.$.start.style.display = 'none';
    LIFE.canvas.requestPointerLock();
    LIFE.sounds.init(); LIFE.sounds.resume();
    if (LIFE.state.gamePhase === 'start') {
        LIFE.state.gamePhase = 'womb'; LIFE.state.wombTimer = 0; LIFE.state.age = -1;
        LIFE.buildEnvironment('womb'); LIFE.createPlayer();
        LIFE.player.group.position.set(0, 1.5, 0); LIFE.ui.hideGameUI();
    }
};

LIFE.advanceYear = function() {
    if (LIFE.state.gamePhase !== 'playing') return;
    if (LIFE.dialogue.active && LIFE.dialogue.blocking) return;

    var state = LIFE.state;

    // Exit car before advancing year
    if (state.inCar) LIFE.exitCar();

    // BLOCK YEAR SKIP during police chase
    if (state.wantedLevel > 0) {
        LIFE.ui.showPopup("Can't skip - police are after you!", '#ff1744');
        return;
    }

    // BLOCK during active combat (bullets in the air)
    if (LIFE.bullets && LIFE.bullets.length > 0) {
        LIFE.ui.showPopup("Not now!", '#ff9800');
        return;
    }

    state.age++;
    // start each year at 9:00 AM displayed time
    // 9AM = 9/24 * 1200 = 450
    state.yearTimer = 450;

    if (state.age > LIFE.MAX_AGE) { state.deathCause = 'old age'; LIFE.triggerDeath(); return; }

    // aging health loss - accelerates with age, offset by happiness
    var ageHealthLoss = 0;
    if (state.age > 70) ageHealthLoss = 3;
    else if (state.age > 60) ageHealthLoss = 1.5;
    else if (state.age > 50) ageHealthLoss = 0.8;
    else if (state.age > 40) ageHealthLoss = 0.3;
    // Happy people age slower, miserable people age faster
    if (state.stats.happiness > 70) ageHealthLoss *= 0.7;
    else if (state.stats.happiness < 20) ageHealthLoss *= 1.4;
    state.stats.health = Math.max(0, state.stats.health - ageHealthLoss);

    // intelligence degrades slowly in old age without stimulation
    if (state.age > 65) {
        var intLoss = (state.age - 65) * 0.15;
        if (state.career === 'professor' || state.career === 'scientist') intLoss *= 0.3;
        state.stats.intelligence = Math.max(5, state.stats.intelligence - intLoss);
    }

    // charisma shifts with age
    if (state.age > 55 && state.stats.charisma > 10) {
        state.stats.charisma = Math.max(10, state.stats.charisma - 0.3);
    }

    // reputation affects happiness
    if (state.reputation > 50) state.stats.happiness = Math.min(100, state.stats.happiness + 1.5);
    else if (state.reputation > 30) state.stats.happiness = Math.min(100, state.stats.happiness + 0.5);
    else if (state.reputation < -50) state.stats.happiness = Math.max(0, state.stats.happiness - 1.5);
    else if (state.reputation < -30) state.stats.happiness = Math.max(0, state.stats.happiness - 0.5);

    // criminal record = harder life
    if (state.criminalRecord && state.career === null) {
        if (Math.random() < 0.3) { state.career = 'worker'; }
    }

    // Loneliness penalty - no friends or family contact hurts
    var friendCount = 0;
    var rels = state.relationships;
    for (var rn in rels) { if (rels[rn].level >= 15) friendCount++; }
    state.friends = friendCount;
    if (friendCount === 0 && !state.married && state.age > 25) {
        state.stats.happiness = Math.max(0, state.stats.happiness - 2);
    }

    // Happy marriage boost
    if (state.married && state.stats.happiness > 40) {
        state.stats.health = Math.min(100, state.stats.health + 0.5);
    }

    // Active career boosts relevant stats
    if (state.career && state.career !== 'none') {
        var c = LIFE.economy.getCareer();
        if (c.intBonus) state.stats.intelligence = Math.min(100, state.stats.intelligence + c.intBonus * 0.3);
        if (c.chaBonus) state.stats.charisma = Math.min(100, state.stats.charisma + c.chaBonus * 0.3);
    }

    // yearly salary
    var yearlySalary = LIFE.economy.getYearlySalary();
    if (yearlySalary > 0) {
        state.money += yearlySalary;
    }

    // marriage/kids upkeep
    if (state.married) state.money -= 200;
    if (state.hasKids) state.money -= 400 * (state.childCount || 1);

    // process investments (yearly returns)
    LIFE.economy.processInvestments();

    // check career promotion
    LIFE.economy.checkPromotion();

    // fame decay if not in fame career
    var career = LIFE.economy.getCareer();
    if (career && !career.fame && state.fame > 0) {
        state.fame = Math.max(0, state.fame - 2);
    }

    // drug addiction worsens
    if (state.drugUses > 3) {
        state.stats.health = Math.max(0, state.stats.health - 2);
        state.stats.happiness = Math.max(0, state.stats.happiness - 1);
    }

    // relationship decay - nuanced by relationship strength
    for (var relName in state.relationships) {
        var r = state.relationships[relName];
        if (r.level > 50) r.level -= 0.5; // strong bonds fade slowly
        else if (r.level > 15) r.level -= 1; // casual friends fade
        else if (r.level > 5) r.level -= 1.5; // acquaintances fade faster
        else if (r.level < -60) r.level += 0.2; // deep grudges barely heal
        else if (r.level < -30) r.level += 0.3; // grudges heal very slowly
        else if (r.level < -5) r.level += 0.5;
    }
    // Count enemies
    var enemyCount = 0;
    for (var en in state.relationships) {
        if (state.relationships[en].level <= -30) enemyCount++;
    }
    state.enemies = enemyCount;

    // decision events
    if (LIFE.DECISIONS[state.age]) {
        setTimeout(function() {
            if (!LIFE.dialogue.active) LIFE.dialogue.triggerDecision(state.age);
        }, 500);
    } else {
        // random life events (BitLife-style)
        LIFE.triggerRandomEvent();
    }

    var newStage = LIFE.getStageForAge(state.age);
    if (newStage !== state.currentStage) {
        state.currentStage = newStage;
        if (LIFE.world.built) {
            // Open world: teleport to zone, refresh NPCs
            // nursery maps to home zone in open world (baby stays at home)
            var outdoorZones = { home: true, nursery: true, school: true, highschool: true, college: true, city: true, retirement: true, dealership: true, eventcenter: true };
            var zoneMapping = { nursery: 'home' };
            if (outdoorZones[newStage]) {
                if (LIFE.world.insideInterior) LIFE.world.exitInterior();
                var targetZone = zoneMapping[newStage] || newStage;
                var zonePos = LIFE.world.getZonePos(targetZone);
                LIFE.player.group.position.set(zonePos.x, 0, zonePos.z + 5);
                LIFE.world.spawnZoneNPCs(targetZone);
                // Force immediate culling update at new position
                LIFE.world._cullingTimer = 999;
                LIFE.world.updateCulling(0);
                if (LIFE.isSchoolAge(state.age)) {
                    // Determine correct phase for current time
                    var dt2 = state.yearTimer % LIFE.DAY_DURATION;
                    var startPhase = 'home';
                    for (var spi = 0; spi < LIFE.SCHOOL_PHASES.length; spi++) {
                        var sp2 = LIFE.SCHOOL_PHASES[spi];
                        if (dt2 >= sp2.start && dt2 < sp2.end) { startPhase = sp2.name; break; }
                    }
                    state.dayPhase = startPhase;
                    LIFE.transitionDayPhase(startPhase);
                } else {
                    state.dayPhase = null;
                }
            } else {
                state.dayPhase = null;
                LIFE.buildEnvironment(newStage);
                LIFE.spawnNPCs(newStage);
                LIFE.player.group.position.set(0, 0, 0);
            }
        } else {
            if (LIFE.isSchoolAge(state.age)) {
                // New year starts at dayTimer 0 = midnight, so start at home (sleep)
                state.dayPhase = 'home';
            } else {
                state.dayPhase = null;
                LIFE.buildEnvironment(newStage);
                LIFE.spawnNPCs(newStage);
            }
            LIFE.player.group.position.set(0, 0, 0);
        }
    } else if (LIFE.isSchoolAge(state.age)) {
        // same school stage, new year - yearTimer resets to 0 (midnight), so home phase
        state.dayPhase = 'home';
    } else {
        state.dayPhase = null;
    }
    if (state.age === 23 && !state.career) state.career = 'worker';

    LIFE.updatePlayerSize();
    LIFE.ui.updateActionButtons();
    LIFE.ui.$.age.textContent = state.age;

    LIFE.ambientLight.intensity = state.age >= 70 ? Math.max(0.15, 0.5 - (state.age - 70) * 0.03) : 0.5;
    LIFE.dirLight.intensity = state.age >= 70 ? Math.max(0.1, 0.8 - (state.age - 70) * 0.05) : 0.8;

    if (LIFE.STAGE_MESSAGES[state.age]) LIFE.ui.showStageMessage(LIFE.STAGE_MESSAGES[state.age]);

    // Generate news for the year
    if (state.age >= 3) {
        LIFE.news.addGameNews();
        // Milestone news
        if (LIFE.STAGE_MESSAGES[state.age] && state.age > 0) {
            var milestoneMsg = { 5: 'Local child begins elementary school.', 12: 'Teen starts high school - new chapter begins.', 18: 'Young adult heads off to college.', 23: 'Graduate enters the workforce.', 65: 'Long-time resident celebrates retirement.' };
            if (milestoneMsg[state.age]) LIFE.news.add(milestoneMsg[state.age], 'milestone');
        }
    }

    // bounty check - police may recognize you
    if (state.bounty > 0 && state.age >= 13 && Math.random() < Math.min(0.4, state.bounty / 5000)) {
        setTimeout(function() {
            if (state.gamePhase === 'playing' && state.wantedLevel === 0) {
                LIFE.ui.showPopup('Police recognized you! Bounty: $' + state.bounty, '#ff1744');
                LIFE.addWanted(Math.min(3, Math.ceil(state.bounty / 2000)));
            }
        }, 2000);
    }

    // HOSPITAL TRIGGERS
    if (state.currentStage !== 'hospital' && state.wantedLevel === 0) {
        // near death - emergency hospitalization
        if (state.stats.health > 0 && state.stats.health <= 10 && Math.random() < 0.6) {
            setTimeout(function() {
                if (state.gamePhase === 'playing' && state.currentStage !== 'hospital') {
                    LIFE.sendToHospital('nearDeath');
                }
            }, 1500);
        }
        // random illness (more likely as you age)
        else if (state.age > 5 && Math.random() < (state.age > 50 ? 0.12 : 0.04)) {
            setTimeout(function() {
                if (state.gamePhase === 'playing' && state.currentStage !== 'hospital' && !LIFE.dialogue.active) {
                    LIFE.sendToHospital('illness');
                }
            }, 2500);
        }
        // parents check in child for behavioral issues (low happiness + young)
        else if (state.age >= 3 && state.age <= 12 && state.stats.happiness < 15 && Math.random() < 0.3) {
            setTimeout(function() {
                if (state.gamePhase === 'playing' && state.currentStage !== 'hospital') {
                    LIFE.sendToHospital('parentCheckin');
                }
            }, 2000);
        }
        // drug use hospitalization
        else if (state.drugUses > 2 && Math.random() < 0.15) {
            setTimeout(function() {
                if (state.gamePhase === 'playing' && state.currentStage !== 'hospital') {
                    LIFE.sendToHospital('overdose');
                }
            }, 2000);
        }
    }

    // health death check
    if (state.stats.health <= 0 && !state.deathTriggered) {
        state.deathCause = state.drugUses > 3 ? 'substance abuse' : 'poor health';
        LIFE.triggerDeath();
    }
};

LIFE.startPlaying = function() {
    LIFE.state.gamePhase = 'playing'; LIFE.state.age = 0; LIFE.state.yearTimer = 450; // start at 9:00 AM
    // randomize beauty at birth (bell curve 15-85, centered ~50)
    LIFE.state.stats.beauty = Math.floor(Math.random() * 25 + Math.random() * 25 + Math.random() * 25 + 10);
    LIFE.state._baseBeauty = LIFE.state.stats.beauty;
    // start in hospital birth scene
    LIFE.state.currentStage = 'hospital';
    LIFE.state.bounds = LIFE.getBoundsForStage('hospital');
    LIFE.buildEnvironment('hospital'); LIFE.createPlayer();
    // baby starts in Mom's arms
    LIFE.state.heldByParent = true;
    // Spawn Mom on hospital bed (reclined) and Doctor for birth scene
    LIFE.npcs.forEach(function(n) { LIFE.scene.remove(n.char.group); });
    LIFE.npcs = [];
    var birthMom = LIFE.createNPC('Mom', -3, -2, 'Mom', true);
    birthMom.speed = 0;
    // position Mom on the hospital bed mattress, reclined
    birthMom.char.group.position.set(-3, 0.5, -2);
    birthMom.char.group.rotation.y = Math.PI / 2; // face along bed
    birthMom.char.group.rotation.x = -0.7; // reclined back on bed
    birthMom.waiting = true; birthMom.waitTimer = 99999;
    LIFE.npcs.push(birthMom);
    var birthDoc = LIFE.createNPC('Doctor', -1, -0.5, 'Doctor', false);
    birthDoc.speed = 0;
    birthDoc.char.group.position.set(-1, 0, -0.5);
    birthDoc.char.group.rotation.y = -Math.PI / 2; // facing toward bed
    birthDoc.waiting = true; birthDoc.waitTimer = 99999;
    LIFE.npcs.push(birthDoc);
    LIFE.ui.showGameUI(); LIFE.ui.updateActionButtons();
    LIFE.ui.showStageMessage('You are born!'); LIFE.ui.$.age.textContent = '0';
    LIFE.sounds.birth();

    // Gender selection at birth - in hospital
    setTimeout(function() {
        if (!LIFE.dialogue.active && LIFE.state.gamePhase === 'playing') {
            LIFE.dialogue.open('Doctor', "Congratulations! It's a healthy baby! Welcome to the world, little one.", [
                { text: "It's a Boy!", effects: { happiness: 5 }, setGender: 'M', response: {
                    text: "A beautiful baby boy! Mom and baby are both doing great. Let's get you home.",
                    options: [
                        { text: "*yawn*", effects: { happiness: 3 } },
                        { text: "*tiny cry*", effects: { happiness: 2 }, sound: 'cry' }
                    ]
                }},
                { text: "It's a Girl!", effects: { happiness: 5 }, setGender: 'F', response: {
                    text: "A beautiful baby girl! Mom and baby are both doing great. Let's get you home.",
                    options: [
                        { text: "*yawn*", effects: { happiness: 3 } },
                        { text: "*tiny cry*", effects: { happiness: 2 }, sound: 'cry' }
                    ]
                }}
            ], true);
            // transition to nursery after dialogue closes
            LIFE.state._birthHospital = true;
        }
    }, 1500);
};

LIFE.triggerDeath = function(cause) {
    var state = LIFE.state;
    if (state.deathTriggered) return;
    state.deathTriggered = true;
    if (cause) state.deathCause = cause;
    state.gamePhase = 'death';
    LIFE.executionData = null;
    // Exit car if driving
    if (state.inCar) {
        state.inCar = false;
        if (LIFE.car.model) { LIFE.scene.remove(LIFE.car.model); LIFE.car.model = null; }
        if (LIFE.player) LIFE.player.group.visible = true;
    }
    if (LIFE.car.parkedModel) { LIFE.scene.remove(LIFE.car.parkedModel); LIFE.car.parkedModel = null; }
    LIFE.ui.hideGameUI(); LIFE.ui.hideJailScreen(); LIFE.removeAllPolice(); LIFE.cleanupBullets();
    if (LIFE.ui.$.controls) LIFE.ui.$.controls.style.color = '';
    LIFE.buildEnvironment('death'); LIFE.sounds.death();
    setTimeout(function() {
        var summary = LIFE.economy.getLifeSummary();
        LIFE.ui.$.deathSummary.textContent = summary;
        var msg = 'You lived a full life of ' + state.age + ' years.';
        if (state.deathCause === 'health' || state.deathCause === 'poor health')
            msg = 'Your body gave out at age ' + state.age + '.';
        else if (state.deathCause === 'substance abuse')
            msg = 'Substance abuse claimed your life at age ' + state.age + '.';
        else if (state.deathCause === 'Police')
            msg = 'You were killed by police at age ' + state.age + '.';
        else if (state.deathCause === 'injuries')
            msg = 'You succumbed to your injuries at age ' + state.age + '.';
        else if (state.deathCause === 'died in prison')
            msg = 'You died in prison at age ' + state.age + '.';
        else if (state.deathCause === 'executed for crimes')
            msg = 'You were hanged for your crimes at age ' + state.age + '.';
        else if (state.deathCause === 'inmate attack')
            msg = 'You were killed by an inmate at age ' + state.age + '.';
        LIFE.ui.$.death.querySelector('p').textContent = msg;
        LIFE.ui.$.death.style.display = 'flex';
        requestAnimationFrame(function() { LIFE.ui.$.death.classList.add('active'); });
        document.exitPointerLock();
    }, 1500);
};

// ============================================================
// WOMB & BIRTH
// ============================================================
LIFE.updateWomb = function(dt) {
    var state = LIFE.state; state.wombTimer += dt;
    LIFE.sounds.heartbeatTimer = (LIFE.sounds.heartbeatTimer || 0) + dt;
    if (LIFE.sounds.heartbeatTimer > 1.0) { LIFE.sounds.heartbeatTimer = 0; LIFE.sounds.heartbeat(); }
    LIFE.envObjects.forEach(function(obj) {
        if (obj._isWomb) { var p = 1 + Math.sin(state.wombTimer * 2) * 0.05; obj.scale.set(p, p, p); }
        if (obj._isWombLight) obj.intensity = 0.4 + Math.sin(state.wombTimer * 3) * 0.3;
    });
    LIFE.camera.position.set(Math.sin(state.wombTimer*0.3)*0.5, 2+Math.sin(state.wombTimer*0.5)*0.3, Math.cos(state.wombTimer*0.3)*0.5);
    LIFE.camera.lookAt(0, 2, 2);
    if (state.wombTimer > 5) LIFE.ui.showStageMessage('A new life begins...');
    if (state.wombTimer > 7) { state.gamePhase = 'birth'; state.birthTimer = 0; LIFE.scene.background.set(0xffffff); }
};

LIFE.updateBirth = function(dt) {
    var state = LIFE.state; state.birthTimer += dt;
    var bg = new THREE.Color(0xfff8e1), white = new THREE.Color(0xffffff);
    LIFE.scene.background.copy(white.lerp(bg, 1 - Math.max(0, 1 - state.birthTimer / 2)));
    LIFE.camera.position.set(0, 2, -3); LIFE.camera.lookAt(0, 1, 0);
    if (state.birthTimer > 1) LIFE.ui.showStageMessage('WAAHH!!');
    if (state.birthTimer > 3) LIFE.startPlaying();
};

// ============================================================
// EXECUTION SCENE
// ============================================================
LIFE.updateExecution = function(dt) {
    var state = LIFE.state;
    var player = LIFE.player;
    if (!player || !LIFE.executionData) return;
    var ed = LIFE.executionData;

    state.executionTimer += dt;
    var t = state.executionTimer;

    // Phase 0 (0-3s): Camera pans to show gallows, player walks toward stairs
    if (state.executionPhase === 0) {
        // cinematic camera - wide shot of gallows
        var camAngle = t * 0.15;
        LIFE.camera.position.set(
            Math.sin(camAngle) * 10 + 2,
            4,
            8 + Math.cos(camAngle) * 2
        );
        LIFE.camera.lookAt(0, ed.platY + 1, 0);

        // walk player toward stairs
        var targetX = 3.5, targetZ = -2.5;
        var dx = targetX - player.group.position.x;
        var dz = targetZ - player.group.position.z;
        var dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > 0.2) {
            var spd = 1.8 * dt;
            player.group.position.x += (dx / dist) * spd;
            player.group.position.z += (dz / dist) * spd;
            player.group.rotation.y = Math.atan2(dx, dz);
            // walk anim
            state.walkTime += dt * 4;
            var sw = Math.sin(state.walkTime) * 0.4;
            player.parts.leftLeg.rotation.x = sw;
            player.parts.rightLeg.rotation.x = -sw;
        }

        if (t >= 3) {
            state.executionPhase = 1;
            LIFE.ui.showPopup('Walking to the gallows...', '#ff5722');
        }
    }
    // Phase 1 (3-7s): Player walks up stairs onto platform
    else if (state.executionPhase === 1) {
        var climbT = (t - 3) / 4; // 0 to 1 over 4 seconds
        climbT = Math.min(climbT, 1);

        // interpolate from bottom of stairs to trapdoor position
        var startX = 3.5, startZ = -2.5, startY = 0;
        var endX = 0, endZ = 0, endY = ed.platY + 0.15;

        player.group.position.x = startX + (endX - startX) * climbT;
        player.group.position.z = startZ + (endZ - startZ) * climbT;
        player.group.position.y = startY + (endY - startY) * climbT;

        // face forward as climbing
        player.group.rotation.y = Math.PI * 0.5 + climbT * Math.PI * 0.5;

        // walk anim
        state.walkTime += dt * 3;
        var sw2 = Math.sin(state.walkTime) * 0.5;
        player.parts.leftLeg.rotation.x = sw2;
        player.parts.rightLeg.rotation.x = -sw2;

        // camera follows from the side
        LIFE.camera.position.set(
            -6 + climbT * 2,
            3 + climbT * 2,
            2 + climbT * 2
        );
        LIFE.camera.lookAt(player.group.position.x, player.group.position.y + 0.8, player.group.position.z);

        if (t >= 7) {
            state.executionPhase = 2;
            player.group.position.set(0, endY, 0);
            player.group.rotation.y = Math.PI; // face crowd
            // stop walk anim
            player.parts.leftLeg.rotation.x = 0;
            player.parts.rightLeg.rotation.x = 0;
            player.parts.leftArm.rotation.x = 0;
            player.parts.rightArm.rotation.x = 0;
        }
    }
    // Phase 2 (7-10s): Standing on trapdoor, camera zooms in, dramatic pause
    else if (state.executionPhase === 2) {
        var standT = (t - 7) / 3; // 0 to 1 over 3 seconds

        // player stands still, slight head movement (fear)
        if (player.parts.head) {
            player.parts.head.position.x = Math.sin(t * 4) * 0.015;
        }

        // camera slowly zooms in from front
        var camDist = 6 - standT * 2;
        LIFE.camera.position.set(
            0,
            ed.platY + 1.5 + standT * 0.5,
            4 + camDist
        );
        LIFE.camera.lookAt(0, ed.platY + 1.2, 0);

        if (standT > 0.3 && standT < 0.5) {
            LIFE.ui.showPopup('The noose is placed...', '#ff1744');
        }

        // executioner pulls lever at the end
        if (standT > 0.8 && ed.lever) {
            ed.lever.rotation.x = Math.min(Math.PI * 0.6, (standT - 0.8) * Math.PI * 3);
        }

        if (t >= 10) {
            state.executionPhase = 3;
            LIFE.sounds.punch(); // trapdoor sound
        }
    }
    // Phase 3 (10-11.5s): Trapdoor opens, body drops, hangs from rope
    else if (state.executionPhase === 3) {
        var dropT = (t - 10) / 1.5; // 0 to 1 over 1.5s
        dropT = Math.min(dropT, 1);

        // trapdoor swings open (rotates around front edge)
        if (ed.trapdoor) {
            ed.trapdoor.rotation.x = Math.min(Math.PI * 0.8, dropT * Math.PI * 1.6);
            ed.trapdoor.position.y = ed.platY - 0.08 - Math.sin(ed.trapdoor.rotation.x) * 0.5;
        }

        // player drops through trapdoor, then jerks to stop (rope catches)
        var dropDist = 1.5; // how far they drop before rope catches
        if (dropT < 0.4) {
            // falling
            var fallT = dropT / 0.4;
            player.group.position.y = ed.platY + 0.15 - fallT * dropDist;
            // arms flail during fall
            player.parts.leftArm.rotation.x = -Math.PI * 0.5 * fallT;
            player.parts.rightArm.rotation.x = -Math.PI * 0.5 * fallT;
        } else {
            // hanging - slight swing
            var hangY = ed.platY + 0.15 - dropDist;
            var swingT = (dropT - 0.4) / 0.6;
            player.group.position.y = hangY + Math.sin(swingT * 6) * 0.05 * (1 - swingT);
            player.group.position.x = Math.sin(swingT * 4) * 0.1 * (1 - swingT);
            player.group.rotation.z = Math.sin(swingT * 4) * 0.1 * (1 - swingT);

            // limp body
            player.parts.leftArm.rotation.x = Math.PI * 0.15;
            player.parts.rightArm.rotation.x = Math.PI * 0.15;
            player.parts.leftLeg.rotation.x = 0.1;
            player.parts.rightLeg.rotation.x = 0.05;
            player.parts.head.position.x = 0.03;

            // extend rope to match player position
            if (ed.rope) {
                var newRopeLen = ed.beamY - player.group.position.y - player.height + 0.1;
                ed.rope.scale.y = newRopeLen / ed.ropeLen;
                ed.rope.position.y = ed.beamY - newRopeLen / 2;
            }
            if (ed.noose) {
                ed.noose.position.y = player.group.position.y + player.height - 0.1;
            }
        }

        // camera watches from below/front
        LIFE.camera.position.set(
            1.5,
            1.5,
            6
        );
        LIFE.camera.lookAt(0, ed.platY - 0.5, 0);

        if (t >= 11.5) {
            state.executionPhase = 4;
        }
    }
    // Phase 4 (11.5-14s): Linger, then death
    else if (state.executionPhase === 4) {
        // slow zoom out, body swaying gently
        var lingerT = (t - 11.5) / 2.5;

        // gentle sway
        player.group.position.x = Math.sin(t * 1.5) * 0.03;
        player.group.rotation.z = Math.sin(t * 1.5) * 0.04;

        // camera slowly pulls back
        LIFE.camera.position.set(
            Math.sin(t * 0.3) * 2,
            2 + lingerT * 0.5,
            6 + lingerT * 3
        );
        LIFE.camera.lookAt(0, ed.platY - 0.5, 0);

        // dim the lights
        LIFE.ambientLight.intensity = Math.max(0.05, 0.2 - lingerT * 0.15);

        if (t >= 14) {
            state.deathCause = 'executed for crimes';
            LIFE.triggerDeath();
        }
    }
};

// ============================================================
// MAIN GAME LOOP
// ============================================================
LIFE.animate = function() {
    requestAnimationFrame(LIFE.animate);
    var dt = Math.min(LIFE.clock.getDelta(), 0.05);
    var state = LIFE.state;
    LIFE.sounds.updateCooldowns(dt);

    switch (state.gamePhase) {
        case 'womb': LIFE.updateWomb(dt); break;
        case 'birth': LIFE.updateBirth(dt); break;
        case 'playing':
            LIFE.dialogue.update(dt);
            if ((!LIFE.dialogue.active || !LIFE.dialogue.blocking) && !state.shopOpen && !state.friendsOpen && !state.timeSkipOpen) {
                state.yearTimer += dt * (state.timeSpeed / 72);
                // timer bar shows day progress (fills once per 20-min day)
                var dayProgress = (state.yearTimer % LIFE.DAY_DURATION) / LIFE.DAY_DURATION;
                LIFE.ui.$.timer.style.width = (dayProgress * 100) + '%';
                if (state.yearTimer >= LIFE.YEAR_DURATION) LIFE.advanceYear();
            }
            // school day phase transitions
            LIFE.updateSchoolDayCycle();
            // day/night lighting cycle
            LIFE.updateDayNight(dt);
            // weather system
            LIFE.weather.update(dt);
            // update date/time display
            LIFE.ui.updateDateTime();
            LIFE.economy.passiveIncome(dt);
            LIFE.updatePlayer(dt);
            LIFE.updateNPCs(dt);
            LIFE.pathfinding.updateCache(dt);
            LIFE.updatePolice(dt);
            LIFE.updateBullets(dt);
            LIFE.updateActionAnim(dt);
            LIFE.updateCamera();

            // Event and news systems
            LIFE.events.update(dt);
            LIFE.news.update(dt);

            // Open world culling and shadow following
            if (LIFE.world.built && !LIFE.world.insideInterior) {
                LIFE.world.updateCulling(dt);
                if (LIFE.player) {
                    var px = LIFE.player.group.position.x;
                    var pz = LIFE.player.group.position.z;
                    LIFE.dirLight.target.position.set(px, 0, pz);
                }
            }

            // stat cascades - interconnected systems
            // Depression: deep unhappiness damages health
            if (state.stats.happiness < 15) state.stats.health = Math.max(0, state.stats.health - 0.08 * dt);
            else if (state.stats.happiness < 30) state.stats.health = Math.max(0, state.stats.health - 0.02 * dt);
            // Joy: high happiness slowly heals
            if (state.stats.happiness > 80) state.stats.health = Math.min(100, state.stats.health + 0.01 * dt);

            // Drug addiction cascade
            if (state.drugUses > 3) {
                state.stats.happiness = Math.max(0, state.stats.happiness - 0.04 * dt);
                state.stats.health = Math.max(0, state.stats.health - 0.03 * dt);
                state.stats.beauty = Math.max(0, state.stats.beauty - 0.01 * dt);
                state.stats.charisma = Math.max(0, state.stats.charisma - 0.005 * dt);
            }
            // beauty degrades slowly with old age
            if (state.age >= 50) {
                var beautyDecay = (state.age - 50) * 0.0003;
                state.stats.beauty = Math.max(5, state.stats.beauty - beautyDecay * dt);
            }
            // High health = slight beauty maintenance
            if (state.stats.health > 80 && state.stats.beauty < state._baseBeauty) {
                state.stats.beauty = Math.min(state._baseBeauty, state.stats.beauty + 0.003 * dt);
            }

            // Social isolation hurts
            if (state.friends === 0 && state.enemies > 3 && state.age > 10)
                state.stats.happiness = Math.max(0, state.stats.happiness - 0.02 * dt);
            // Many enemies = stress
            if (state.enemies > 5) state.stats.happiness = Math.max(0, state.stats.happiness - 0.01 * dt);

            // Relationships boost happiness
            if (state.married) state.stats.happiness = Math.min(100, state.stats.happiness + 0.008 * dt);
            if (state.hasKids) state.stats.happiness = Math.min(100, state.stats.happiness + 0.006 * dt);
            // Good friends boost charisma
            if (state.friends > 5) state.stats.charisma = Math.min(100, state.stats.charisma + 0.003 * dt);

            // Criminal life takes a toll
            if (state.criminalRecord) {
                state.stats.happiness = Math.max(0, state.stats.happiness - 0.005 * dt);
            }
            // family violence permanent trauma
            if (state.familyKiller) {
                state.stats.happiness = Math.max(0, state.stats.happiness - 0.05 * dt);
                state.stats.health = Math.max(0, state.stats.health - 0.02 * dt);
            } else if (state.familyAbuser) {
                state.stats.happiness = Math.max(0, state.stats.happiness - 0.02 * dt);
            }

            // Wealth/poverty effects
            if (state.money < -1000 && state.age > 18) {
                state.stats.happiness = Math.max(0, state.stats.happiness - 0.015 * dt);
            }
            if (state.money > 200000) {
                state.stats.happiness = Math.min(100, state.stats.happiness + 0.003 * dt);
            }

            // health death check
            if (state.stats.health <= 0 && !state.deathTriggered) {
                state.deathCause = state.drugUses > 3 ? 'substance abuse' : 'poor health';
                LIFE.triggerDeath();
            }

            LIFE.ui.updateAgeColor(); LIFE.ui.updateMoney(); LIFE.ui.updateStats();
            LIFE.ui.updateNPCHint(); LIFE.ui.updateWeapon(); LIFE.ui.updatePlayerHealth();
            LIFE.ui.updateWanted();
            break;
        case 'jail':
            state.jailTimer -= dt;
            state.stats.health = Math.max(0, state.stats.health - 0.15 * dt);
            state.stats.happiness = Math.max(0, state.stats.happiness - 0.08 * dt);

            // age advances in prison - scale jail time to years
            if (!state._jailStartTimer) state._jailStartTimer = state.jailTimer + dt;
            var jailProgress = 1 - (state.jailTimer / state._jailStartTimer);
            var expectedAge = state._jailStartAge + Math.floor(jailProgress * state.jailYears);
            if (expectedAge > state.age && expectedAge <= 80) {
                state.age = expectedAge;
                if (state.age >= 80 && !state.deathTriggered) {
                    state.deathCause = 'died of old age in prison';
                    LIFE.triggerDeath();
                }
            }

            // allow movement in jail cell
            LIFE.updatePlayer(dt);
            LIFE.updateNPCs(dt);
            LIFE.pathfinding.updateCache(dt);
            LIFE.updateActionAnim(dt);
            LIFE.updateCamera();
            LIFE.dialogue.update(dt);
            LIFE.ui.updatePlayerHealth();
            LIFE.ui.updateAgeColor();
            LIFE.ui.updateNPCHint();

            // RANDOM INMATE EVENTS
            state.jailEventTimer -= dt;
            if (state.jailEventTimer <= 0 && !LIFE.dialogue.active) {
                state.jailEventTimer = 8 + Math.random() * 15;
                var eventRoll = Math.random();
                if (eventRoll < 0.15) {
                    // inmate demands food rations
                    LIFE.dialogue.open('Inmate', "Hey fresh meat... give me your food rations or else.", [
                        { text: "Back off!", effects: { charisma: 2 }, rep: -2, response: {
                            text: "Tough guy, huh? We'll see how long that lasts in here.", options: [
                                { text: "Try me.", effects: { charisma: 1 }, rep: -1 },
                                { text: "Just leave me alone.", effects: {}, rep: 0 }
                            ]
                        }},
                        { text: "Fine, take it.", effects: { happiness: -5, health: -3 }, rep: -5 },
                        { text: "Try me.", effects: { health: -8, charisma: 3 }, rep: 3 }
                    ], true);
                } else if (eventRoll < 0.25) {
                    // random attack
                    LIFE.ui.showPopup('An inmate attacked you!', '#ff1744');
                    LIFE.damagePlayer(10 + Math.floor(Math.random() * 10), 'inmate attack');
                    LIFE.sounds.punch();
                } else if (eventRoll < 0.35) {
                    // gang recruitment
                    LIFE.dialogue.open('Inmate', "You want to join my gang? Could use someone like you.", [
                        { text: "Sure, I'm in.", effects: { charisma: 3 }, rep: -10, response: {
                            text: "Smart move. We look out for our own in here. First task: deliver this to Block C.", options: [
                                { text: "Consider it done.", effects: { charisma: 2 }, rep: -5 },
                                { text: "What is it?", effects: { intelligence: 1 }, rep: -3 }
                            ]
                        }},
                        { text: "No thanks.", effects: {}, rep: 2 },
                        { text: "I work alone.", effects: { charisma: 1 }, rep: 0 }
                    ], true);
                } else if (eventRoll < 0.42) {
                    // guard lights out
                    LIFE.dialogue.open('Guard', "Lights out! Get to your bed.", [
                        { text: "Yes sir.", effects: { happiness: -2 } },
                        { text: "Make me.", effects: { health: -5 }, rep: -5, response: {
                            text: "That's it! Solitary confinement for you!", options: [
                                { text: "Worth it.", effects: { happiness: -3, charisma: 1 }, rep: -3 },
                                { text: "I'm sorry, I didn't mean it.", effects: { happiness: -1 }, rep: 1 }
                            ]
                        }}
                    ], true);
                } else if (eventRoll < 0.50) {
                    // workout opportunity
                    LIFE.dialogue.open('Inmate', "Hey, I'm hitting the yard for some reps. Wanna join? Gotta stay strong in here.", [
                        { text: "Yeah, let's do it.", effects: { health: 5, happiness: 2 }, rep: 2, response: {
                            text: "Not bad! You're stronger than you look. Keep it up and nobody will mess with you.", options: [
                                { text: "Thanks for the workout.", effects: { charisma: 1, health: 1 }, rep: 2 },
                                { text: "Same time tomorrow?", effects: { happiness: 1 }, rep: 3, friend: true }
                            ]
                        }},
                        { text: "Nah, I'm good.", effects: {}, rep: 0 },
                        { text: "Working out is pointless in here.", effects: { happiness: -1 }, rep: -2 }
                    ], true);
                } else if (eventRoll < 0.57) {
                    // contraband offer
                    LIFE.dialogue.open('Inmate', "Psst... I got a phone smuggled in. 5 minutes for a favor later. Deal?", [
                        { text: "Deal. Let me make a call.", effects: { happiness: 5 }, rep: -5, response: {
                            text: "Make it quick. Guards switch shifts in 3 minutes.", options: [
                                { text: "*call family*", effects: { happiness: 5 }, rep: 2 },
                                { text: "*call old contact*", effects: { charisma: 2 }, rep: -3 }
                            ]
                        }},
                        { text: "No thanks, not worth the risk.", effects: { intelligence: 1 }, rep: 3 },
                        { text: "I'll tell the guards.", effects: { charisma: -1 }, rep: 5, response: {
                            text: "You snitch on me and you won't survive the night. Think carefully.", options: [
                                { text: "I won't say anything.", effects: { happiness: -2 }, rep: 0 },
                                { text: "I'm not afraid of you.", effects: { charisma: 2, health: -5 }, rep: 3 }
                            ]
                        }}
                    ], true);
                } else if (eventRoll < 0.64) {
                    // friendly inmate shares advice
                    LIFE.dialogue.open('Inmate', "Listen kid, I've been watching you. You don't belong in here. Want some advice?", [
                        { text: "Sure, I'm listening.", effects: { intelligence: 2 }, rep: 2, response: {
                            text: "When you get out, don't look back. Get a job, even a bad one. Stay clean. Trust me, I wish I had.", options: [
                                { text: "I appreciate that. Really.", effects: { happiness: 3, intelligence: 1 }, rep: 3, friend: true },
                                { text: "Thanks... I'll try.", effects: { happiness: 1 }, rep: 2 }
                            ]
                        }},
                        { text: "What do you know about my life?", effects: { charisma: 1 }, rep: -2 },
                        { text: "Save the lecture.", effects: {}, rep: -3 }
                    ], true);
                } else if (eventRoll < 0.71) {
                    // guard offers good behavior deal
                    LIFE.dialogue.open('Guard', "You've been keeping your head down. The warden noticed. There might be a reduced sentence if you cooperate.", [
                        { text: "I'll do whatever it takes.", effects: { happiness: 3, intelligence: 1 }, rep: 5, response: {
                            text: "Good. Keep it up. No fights, no trouble. We'll see what happens.", options: [
                                { text: "Yes sir.", effects: { happiness: 1 }, rep: 3 },
                                { text: "Thank you for the chance.", effects: { charisma: 1 }, rep: 2 }
                            ]
                        }},
                        { text: "I don't cooperate with guards.", effects: { charisma: 1 }, rep: -5 }
                    ], true);
                } else if (eventRoll < 0.78) {
                    // prison food event
                    var foodEvents = [
                        { text: "Cafeteria today: mystery meat. Looks worse than usual.", opts: [
                            { text: "Eat it. Food is food.", effects: { health: -2, happiness: -1 }, rep: 0 },
                            { text: "Skip the meal.", effects: { health: -1 }, rep: 0 },
                            { text: "Trade it for something better.", effects: { charisma: 1, happiness: 1 }, rep: -1 }
                        ]},
                        { text: "Another inmate accidentally spilled their tray on you.", opts: [
                            { text: "It's fine, accidents happen.", effects: { charisma: 2 }, rep: 3 },
                            { text: "Watch it!", effects: { charisma: -1 }, rep: -2 },
                            { text: "Spill yours on them.", effects: { health: -3 }, rep: -5 }
                        ]}
                    ];
                    var fe = foodEvents[Math.floor(Math.random() * foodEvents.length)];
                    LIFE.dialogue.open('Narrator', fe.text, fe.opts, true);
                } else if (eventRoll < 0.85) {
                    // visitation
                    var visitor = state.married ? 'Spouse' : (state.hasKids ? 'Your Child' : 'Old Friend');
                    LIFE.dialogue.open(visitor, "I came to see you... How are you holding up in here?", [
                        { text: "I'm okay. Thanks for coming.", effects: { happiness: 8 }, rep: 2, response: {
                            text: "I miss you so much. Please stay safe in there.", options: [
                                { text: "I miss you too. I'll be home soon.", effects: { happiness: 5 }, rep: 3 },
                                { text: "Don't worry about me.", effects: { happiness: 2 }, rep: 1 }
                            ]
                        }},
                        { text: "It's terrible. I hate it here.", effects: { happiness: 3 }, rep: 1, response: {
                            text: "I'm sorry... Just hang in there. Time will pass.", options: [
                                { text: "I know. Thank you.", effects: { happiness: 3 }, rep: 2 },
                                { text: "Easy for you to say.", effects: { happiness: -2 }, rep: -3 }
                            ]
                        }},
                        { text: "Don't come back. Forget about me.", effects: { happiness: -5 }, rep: -5 }
                    ], true);
                } else if (eventRoll < 0.92) {
                    // prison library / self-improvement
                    LIFE.dialogue.open('Guard', "Library is open for the next hour. Want to go?", [
                        { text: "Yes, I'd like to read.", effects: { intelligence: 3, happiness: 2 }, rep: 3, response: {
                            text: "Good choice. Education is the best way to spend your time in here.", options: [
                                { text: "*read about law*", effects: { intelligence: 2 }, rep: 1 },
                                { text: "*read fiction*", effects: { happiness: 2 }, rep: 0 }
                            ]
                        }},
                        { text: "No, I'll stay in my cell.", effects: {}, rep: 0 }
                    ], true);
                } else {
                    // random health event in prison
                    var prisonHealth = Math.random();
                    if (prisonHealth < 0.4) {
                        LIFE.ui.showPopup('You caught a cold from the damp cell...', '#ff9800');
                        state.stats.health = Math.max(0, state.stats.health - 5);
                    } else if (prisonHealth < 0.7) {
                        LIFE.ui.showPopup('Bad night - barely slept.', '#ff9800');
                        state.stats.happiness = Math.max(0, state.stats.happiness - 3);
                    } else {
                        LIFE.ui.showPopup('Found a book in your cell.', '#4fc3f7');
                        state.stats.intelligence = Math.min(100, state.stats.intelligence + 1);
                    }
                }
            }

            // advance yearTimer during jail so date/time display progresses
            var jailTimeScale = state.jailYears * LIFE.YEAR_DURATION / (state._jailStartTimer || 1);
            state.yearTimer += dt * jailTimeScale;
            if (state.yearTimer >= LIFE.YEAR_DURATION) state.yearTimer = state.yearTimer % LIFE.YEAR_DURATION;
            LIFE.ui.updateDateTime();

            // update jail countdown display
            var jailFrac = state.jailTimer / (state._jailStartTimer || 1);
            var yearsLeft = Math.max(1, Math.ceil(jailFrac * state.jailYears));
            if (LIFE.ui.$.jailText) {
                var jailDisplayText;
                if (state.jailYears >= 50) jailDisplayText = 'Multiple life sentences remaining';
                else if (state.jailYears >= 25) jailDisplayText = 'Life sentence remaining';
                else jailDisplayText = yearsLeft + ' year' + (yearsLeft > 1 ? 's' : '') + ' remaining';
                LIFE.ui.$.jailText.textContent = jailDisplayText;
            }

            if (state.stats.health <= 0 && !state.deathTriggered) {
                state.deathCause = 'died in prison'; LIFE.triggerDeath();
            }
            if (state.jailTimer <= 0 && !state.deathTriggered) LIFE.exitJail();
            break;
        case 'execution':
            LIFE.updateExecution(dt);
            break;
        case 'death': break;
    }

    if (state.actionCooldown > 0) state.actionCooldown -= dt;
    if (state.shootCooldown > 0) state.shootCooldown -= dt;
    LIFE.ui.updateTimers(dt);
    LIFE.renderer.render(LIFE.scene, LIFE.camera);
};

// ============================================================
// INIT
// ============================================================
LIFE.init = function() {
    document.body.classList.add('unlocked');
    LIFE.ui.$.start.addEventListener('click', function() {
        LIFE.sounds.init(); LIFE.sounds.resume(); LIFE.startGame();
    });
    var speedEl = document.getElementById('speedDisplay');
    if (speedEl) speedEl.addEventListener('click', function() {
        if (LIFE.state.gamePhase === 'playing') LIFE.ui.openTimeSkip();
    });
    LIFE.canvas.addEventListener('click', function() {
        LIFE.sounds.resume();
        if (!LIFE.state.locked && LIFE.state.gamePhase !== 'start' && LIFE.state.gamePhase !== 'death'
            && !LIFE.dialogue.active && !LIFE.state.shopOpen && !LIFE.state.friendsOpen && !LIFE.state.timeSkipOpen) {
            LIFE.canvas.requestPointerLock();
            LIFE.ui.$.start.style.display = 'none';
        }
    });
    window.addEventListener('resize', function() {
        LIFE.camera.aspect = window.innerWidth / window.innerHeight;
        LIFE.camera.updateProjectionMatrix();
        LIFE.renderer.setSize(window.innerWidth, window.innerHeight);
    });
    LIFE.animate();
};
LIFE.init();
