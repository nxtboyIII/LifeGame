// ============================================================
// GAME STATE
// ============================================================
LIFE.state = {
    age: -1, yearTimer: 0, gamePhase: 'start', currentStage: 'womb',
    playerRotY: 0, cameraPitch: 0.4, playerVelY: 0, isGrounded: true,
    walkTime: 0, actionCooldown: 0, popupTimer: 0, stageTextTimer: 0,
    wombTimer: 0, birthTimer: 0, bounds: 20, locked: false,
    deathTriggered: false, deathCause: '',
    actionAnim: { type: null, timer: 0 }, nearestNPC: null, nearestDeadNPC: null, shopOpen: false,
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
    playerName: null, // set at birth based on gender
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
    milestones: [],        // array of {age, text, type:'good'|'bad'|'neutral'}
    // NPC lifecycle
    familyDeaths: [],      // [{name, role, age, playerAge}]
    // gang system
    gang: null,            // 'serpents', 'reapers', 'shadows', or null
    gangRep: 0,            // 0-100 reputation within gang
    gangJoinedAge: null
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
// CONTROLS DISPLAY HELPER
// ============================================================
LIFE._ctrlHtml = function(pairs) {
    var html = '';
    for (var i = 0; i < pairs.length; i += 2) {
        html += '<span class="ctrl-item"><span class="ctrl-key">' + pairs[i] + '</span> ' + pairs[i+1] + '</span>';
    }
    return html;
};
LIFE._defaultControls = function() {
    return LIFE._ctrlHtml([
        'WASD','Move', 'Space','Jump', '1-4','Actions', 'E','Skip Year',
        'R','Time Skip', 'T','Talk', 'Q','Switch Item', 'I','Inventory',
        'J','Quests', 'F','Info', 'G','Enter/Exit', 'V','Drive', 'X','Pickup'
    ]);
};

// ============================================================
// CURSOR LOCK / UNLOCK
// ============================================================
LIFE._suppressPause = false;
LIFE.lockCursor = function() {
    LIFE._suppressPause = true;
    setTimeout(function() {
        LIFE.canvas.requestPointerLock();
    }, 100);
    // Keep suppression for a bit longer so the re-lock + any ESC bounce doesn't trigger pause
    setTimeout(function() { LIFE._suppressPause = false; }, 400);
};
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

LIFE._debugPoliceLog = []; // { time, reason, wanted, caller }

LIFE.addWanted = function(amount, reason, witness) {
    if (LIFE.state.age < 10) return;
    var state = LIFE.state;
    var old = state.wantedLevel;
    state.wantedLevel = Math.min(10, state.wantedLevel + amount);
    state.bounty += amount * 500;
    state.wantedTimer = 0;
    state.wantedCooldown = 0;
    // Record last known position (where witnesses saw the player)
    if (LIFE.player) {
        state.lastKnownPos = { x: LIFE.player.group.position.x, z: LIFE.player.group.position.z };
    }
    // Start dispatch timer (someone calling the police)
    if (state.wantedLevel > 0 && !state.policeDispatching) {
        var alreadyPursuing = 0;
        if (LIFE.world.policeCops) {
            for (var i = 0; i < LIFE.world.policeCops.length; i++) {
                var ais = LIFE.world.policeCops[i].aiState;
                if (ais === 'pursuing' || ais === 'driving' || ais === 'investigating') alreadyPursuing++;
            }
        }
        // Scale cops dispatched: 1-2 for minor, 3-4 for moderate, 5-6 for serious
        var copsNeeded = Math.min(LIFE.POLICE_MAX, Math.ceil(state.wantedLevel / 2));
        if (alreadyPursuing < copsNeeded) {
            state.policeDispatching = true;
            if (old === 0) {
                // First offense: find a civilian to call police, dispatch AFTER the call finishes
                var callerNpc = null;
                var callerName = 'A bystander';
                if (LIFE.player && LIFE.npcs) {
                    var px = LIFE.player.group.position.x, pz = LIFE.player.group.position.z;
                    var bestDist = Infinity;
                    for (var wi = 0; wi < LIFE.npcs.length; wi++) {
                        var wn = LIFE.npcs[wi];
                        if (!wn.alive || wn.isPolice || wn._callingPolice) continue;
                        // Kids under 12 don't have phones — they flee instead
                        var wnAge = wn.npcAge !== null ? wn.npcAge : (wn.type === 'Kid' ? 8 : 25);
                        if (wnAge < 12) continue;
                        // Low reputation NPCs won't snitch (dealers, shady characters)
                        var wnRep = wn.npcReputation !== undefined ? wn.npcReputation : 30;
                        if (wnRep <= -30) continue;
                        // Skip NPCs recently attacked — they need 15s to recover before calling
                        if (wn._lastAttackedTime && (Date.now() - wn._lastAttackedTime) < 15000) continue;
                        var dx = wn.char.group.position.x - px;
                        var dz = wn.char.group.position.z - pz;
                        var d2 = dx * dx + dz * dz;
                        if (d2 < bestDist) { bestDist = d2; callerNpc = wn; callerName = wn.name; }
                    }
                }
                // Phone call takes 4-6 seconds, then dispatch timer starts (3-5 more seconds)
                // Total: 7-11 seconds from crime to cops arriving
                if (callerNpc && LIFE.npcStartPhoneCall) {
                    LIFE.npcStartPhoneCall(callerNpc);
                    // Dispatch timer = phone call time + response time
                    state.policeDispatchTimer = 7 + Math.random() * 4;
                } else {
                    // No visible caller — shorter delay (e.g. police spotted it directly)
                    state.policeDispatchTimer = 5 + Math.random() * 3;
                }
                LIFE.ui.showPopup(callerName + ' is calling the police!', '#f44336');
            } else {
                // Escalation while cops already out: backup arrives faster (radio)
                state.policeDispatchTimer = 2 + Math.random() * 2;
            }
        }
    }
    // SWAT check - evaluated every time wanted rises, independent of regular police dispatch
    if (state.wantedLevel >= 7 && state.kills >= 2 && !state.swatDispatching && !state.swatDispatched) {
        state.swatDispatching = true;
        state.swatDispatchTimer = 15 + Math.random() * 10;
        LIFE.ui.showPopup('SWAT team has been called in!', '#f44336');
    }

    // Debug log entry
    var now = Date.now();
    LIFE._debugPoliceLog.push({
        time: now,
        reason: reason || 'unknown',
        witness: witness || null,
        wanted: old + ' -> ' + state.wantedLevel,
        amount: amount,
        dispatching: state.policeDispatching,
        timer: state.policeDispatchTimer ? state.policeDispatchTimer.toFixed(1) : '0'
    });
    // Keep last 10 entries
    if (LIFE._debugPoliceLog.length > 10) LIFE._debugPoliceLog.shift();
};

// Create a police car model (dark blue with red/blue lights)
LIFE.createPoliceCar = function() {
    var group = LIFE.createCarModel(0x1a237e);
    // Light bar on roof
    var barBase = LIFE.makeBox(1.2, 0.08, 0.4, 0x333333, 0, 1.3, -0.3);
    group.add(barBase);
    var redLight = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.15, 0.25),
        LIFE.getMaterial({ color: 0xff1744, emissive: 0xff1744, emissiveIntensity: 0.8 })
    );
    redLight.position.set(-0.35, 1.38, -0.3);
    group.add(redLight);
    var blueLight = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.15, 0.25),
        LIFE.getMaterial({ color: 0x2979ff, emissive: 0x2979ff, emissiveIntensity: 0.8 })
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
    var bodyMat = LIFE.getMaterial({ color: 0x212121 });
    // Larger armored body
    var body = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.4, 5.5), bodyMat);
    body.position.y = 0.8; body.castShadow = true; group.add(body);
    // Cabin top
    var cabin = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 2.5), bodyMat);
    cabin.position.set(0, 1.9, -0.8); cabin.castShadow = true; group.add(cabin);
    // Armored windshield (small slit)
    var winMat = LIFE.getMaterial({ color: 0x445566, emissive: 0x223344, emissiveIntensity: 0.3 });
    var win = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 0.05), winMat);
    win.position.set(0, 2.0, 0.46); group.add(win);
    // Wheels (6 wheels - 3 per side)
    var wheelMat = LIFE.getMaterial({ color: 0x222222 });
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
        LIFE.getMaterial({ color: 0xff1744, emissive: 0xff1744, emissiveIntensity: 0.8 }));
    redLight.position.set(-0.6, 2.35, -0.8); group.add(redLight);
    var blueLight = new THREE.Mesh(new THREE.BoxGeometry(0.3,0.2,0.3),
        LIFE.getMaterial({ color: 0x2979ff, emissive: 0x2979ff, emissiveIntensity: 0.8 }));
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
    // Target last known position instead of real-time player pos
    var targetX = state.lastKnownPos ? state.lastKnownPos.x : LIFE.player.group.position.x;
    var targetZ = state.lastKnownPos ? state.lastKnownPos.z : LIFE.player.group.position.z;

    // Count how many are already pursuing/driving/investigating
    var active = 0;
    for (var i = 0; i < LIFE.world.policeCops.length; i++) {
        var as = LIFE.world.policeCops[i].aiState;
        if (as === 'pursuing' || as === 'driving' || as === 'investigating') active++;
    }
    var copsNeeded = Math.min(LIFE.POLICE_MAX, Math.ceil(state.wantedLevel / 2));
    var needed = copsNeeded - active;

    // Sort idle cops by distance to target (nearest first)
    var idle = [];
    for (var j = 0; j < LIFE.world.policeCops.length; j++) {
        var cop = LIFE.world.policeCops[j];
        if (cop.aiState === 'idle' || cop.aiState === 'patrolling' || cop.aiState === 'returning') {
            if (!cop.npc.alive) continue;
            var cdx = cop.npc.char.group.position.x - targetX;
            var cdz = cop.npc.char.group.position.z - targetZ;
            cop._distToTarget = Math.sqrt(cdx * cdx + cdz * cdz);
            idle.push(cop);
        }
    }
    idle.sort(function(a, b) { return a._distToTarget - b._distToTarget; });

    for (var k = 0; k < Math.min(needed, idle.length); k++) {
        var c = idle[k];
        if (c._distToTarget < 30) {
            // Close enough to go on foot — investigate the area (not direct pursuit)
            c.aiState = 'investigating';
            c._investigateTimer = 0;
            c._investigateCenter = { x: targetX, z: targetZ };
            c.npc.speed = LIFE.getSpeedForAge(state.age) * 1.0;
        } else {
            // Far away - get in police car and drive to last known pos
            c.aiState = 'driving';
            c.npc.char.group.visible = false;
            var car = LIFE.createPoliceCar();
            car.position.copy(c.npc.char.group.position);
            car.position.y = 0;
            car.rotation.y = Math.atan2(targetX - car.position.x, targetZ - car.position.z);
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
        if (npc.char.parts.body) npc.char.parts.body.material = LIFE.getMaterial({ color: 0x111111 });
        if (npc.char.parts.leftArm) npc.char.parts.leftArm.material = LIFE.getMaterial({ color: 0x111111 });
        if (npc.char.parts.rightArm) npc.char.parts.rightArm.material = LIFE.getMaterial({ color: 0x111111 });
        if (npc.char.parts.leftLeg) npc.char.parts.leftLeg.material = LIFE.getMaterial({ color: 0x111111 });
        if (npc.char.parts.rightLeg) npc.char.parts.rightLeg.material = LIFE.getMaterial({ color: 0x111111 });
        // SWAT helmet
        var helmet = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.15, 0.3),
            LIFE.getMaterial({ color: 0x111111 })
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
                cop.npc._frozen = false;
                cop.npc._hostile = false;
            }
            // Clear investigation state
            cop._investigateTimer = 0;
            cop._investigateCenter = null;
            cop._investigateTarget = null;
            cop._investigatePath = null;
            cop._losCheckTimer = 0;
            // Clear LOS state on the npc too
            cop.npc._losLostTime = 0;
            cop.npc._hasLOS = false;
            cop.npc._losTimer = 0;
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
    LIFE.state.policeConfronting = false;
    LIFE.state.swatDispatching = false;
    LIFE.state.swatDispatched = false;
    LIFE.state.lastKnownPos = null;
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

            // Investigating state — cop wanders near last known pos, checks LOS for player
            if (pcop.aiState === 'investigating') {
                pcop._investigateTimer = (pcop._investigateTimer || 0) + dt;
                var invPos = pcop.npc.char.group.position;

                // Check LOS to player every 0.5s (performance)
                pcop._losCheckTimer = (pcop._losCheckTimer || 0) + dt;
                if (pcop._losCheckTimer > 0.5) {
                    pcop._losCheckTimer = 0;
                    var invPx = player.group.position.x, invPz = player.group.position.z;
                    var invDistToPlayer = Math.sqrt((invPx - invPos.x) * (invPx - invPos.x) + (invPz - invPos.z) * (invPz - invPos.z));
                    if (invDistToPlayer < 80 && LIFE.hasLineOfSight(invPos.x, invPos.z, invPx, invPz)) {
                        // SPOTTED — switch to pursuing
                        pcop.aiState = 'pursuing';
                        pcop.npc.speed = LIFE.getSpeedForAge(state.age) * 1.2;
                        if (LIFE.police.indexOf(pcop.npc) < 0) LIFE.police.push(pcop.npc);
                        // Update last known pos to current player pos
                        state.lastKnownPos = { x: invPx, z: invPz };
                        pcop._investigateTimer = 0;
                        pcop._investigateCenter = null;
                        pcop._investigateTarget = null;
                        pcop._investigatePath = null;
                        continue;
                    }
                }

                // Wander around the investigate area (last known pos)
                var investCenter = pcop._investigateCenter || state.lastKnownPos || { x: invPos.x, z: invPos.z };
                if (!pcop._investigateCenter) pcop._investigateCenter = { x: investCenter.x, z: investCenter.z };

                if (!pcop._investigateTarget || pcop._investigateWanderTimer <= 0) {
                    pcop._investigateTarget = {
                        x: investCenter.x + (Math.random() - 0.5) * 30,
                        z: investCenter.z + (Math.random() - 0.5) * 30
                    };
                    pcop._investigateWanderTimer = 3 + Math.random() * 3;
                    pcop._investigatePath = null;
                }
                pcop._investigateWanderTimer -= dt;

                // Walk toward investigate target using pathfinding
                if (!pcop._investigatePath) {
                    pcop._investigatePath = LIFE.pathfinding.findPath(invPos.x, invPos.z, pcop._investigateTarget.x, pcop._investigateTarget.z);
                    pcop._investigatePathIdx = 0;
                }
                var invWp = null;
                if (pcop._investigatePath && pcop._investigatePathIdx < pcop._investigatePath.length) {
                    invWp = pcop._investigatePath[pcop._investigatePathIdx];
                    var invwdx = invWp.x - invPos.x, invwdz = invWp.z - invPos.z;
                    if (Math.sqrt(invwdx * invwdx + invwdz * invwdz) < 1.5) {
                        pcop._investigatePathIdx++;
                        invWp = pcop._investigatePathIdx < pcop._investigatePath.length ? pcop._investigatePath[pcop._investigatePathIdx] : null;
                    }
                }
                var invdx, invdz;
                if (invWp) { invdx = invWp.x - invPos.x; invdz = invWp.z - invPos.z; }
                else { invdx = pcop._investigateTarget.x - invPos.x; invdz = pcop._investigateTarget.z - invPos.z; }
                var invDist = Math.sqrt(invdx * invdx + invdz * invdz);
                if (invDist > 1) {
                    var invSpd = 3 * dt;
                    invPos.x += (invdx / invDist) * invSpd;
                    invPos.z += (invdz / invDist) * invSpd;
                    LIFE.resolveCollisions(invPos);
                    pcop.npc.char.group.rotation.y = Math.atan2(invdx, invdz);
                    pcop.npc.walkTime += dt * 5;
                    var invsw = Math.sin(pcop.npc.walkTime) * 0.4;
                    pcop.npc.char.parts.leftLeg.rotation.x = invsw;
                    pcop.npc.char.parts.rightLeg.rotation.x = -invsw;
                    pcop.npc.char.parts.leftArm.rotation.x = -invsw * 0.3;
                    pcop.npc.char.parts.rightArm.rotation.x = invsw * 0.3;
                }

                // Give up after 45-60 seconds
                if (pcop._investigateTimer > 45 + Math.random() * 15) {
                    pcop.aiState = 'returning';
                    pcop._investigateTimer = 0;
                    pcop._investigateCenter = null;
                    pcop._investigateTarget = null;
                    pcop._investigatePath = null;
                    // Remove from LIFE.police array if present
                    var invPidx = LIFE.police.indexOf(pcop.npc);
                    if (invPidx >= 0) LIFE.police.splice(invPidx, 1);
                }
            }
        }
    }

    if (state.wantedLevel <= 0) {
        LIFE.sounds.stopSiren();
        return;
    }

    // 3D siren - only play once police are actually dispatched and have cars/cops en route
    var hasActiveCops = LIFE.police.length > 0 || LIFE.swat.length > 0;
    if (!hasActiveCops && LIFE.world.policeCops) {
        for (var pci = 0; pci < LIFE.world.policeCops.length; pci++) {
            var pciState = LIFE.world.policeCops[pci].aiState;
            if (pciState === 'driving' || pciState === 'pursuing' || pciState === 'investigating') {
                hasActiveCops = true; break;
            }
        }
    }
    if (hasActiveCops) {
        LIFE.sounds.startSiren();
    } else {
        LIFE.sounds.stopSiren();
    }
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

    // Update driving cops (persistent cops in cars approaching last known pos)
    var px = player.group.position.x, pz = player.group.position.z;
    var driveTargetX = state.lastKnownPos ? state.lastKnownPos.x : px;
    var driveTargetZ = state.lastKnownPos ? state.lastKnownPos.z : pz;
    if (LIFE.world.policeCops) {
        for (var di = 0; di < LIFE.world.policeCops.length; di++) {
            var dcop = LIFE.world.policeCops[di];
            if (dcop.aiState !== 'driving' || !dcop.car) continue;
            // Drive car toward last known position
            var cdx = driveTargetX - dcop.car.position.x;
            var cdz = driveTargetZ - dcop.car.position.z;
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

            // Close enough to target - cop exits car and investigates
            if (cDist < 20) {
                dcop.npc.char.group.position.copy(dcop.car.position);
                dcop.npc.char.group.position.y = 0;
                dcop.npc.char.group.visible = true;
                dcop.npc.speed = LIFE.getSpeedForAge(state.age) * 1.0;
                // Leave car parked (stays in scene as static prop)
                dcop.car._redLight.visible = true;
                dcop.car._blueLight.visible = true;
                dcop._parkedCar = dcop.car;
                dcop.car = null;
                // Exit into investigating state (not direct pursuit)
                dcop.aiState = 'investigating';
                dcop._investigateTimer = 0;
                dcop._investigateCenter = { x: driveTargetX, z: driveTargetZ };
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

    // Check if all cops have given up — investigation-based escape
    var anyPursuingOrDriving = false;
    var anyInvestigating = false;
    var anyActive = false;
    if (LIFE.world.policeCops) {
        for (var ci = 0; ci < LIFE.world.policeCops.length; ci++) {
            var cs = LIFE.world.policeCops[ci].aiState;
            if (cs === 'pursuing' || cs === 'driving') { anyPursuingOrDriving = true; anyActive = true; }
            if (cs === 'investigating') { anyInvestigating = true; anyActive = true; }
        }
    }
    for (var swi = 0; swi < LIFE.swat.length; swi++) {
        if (LIFE.swat[swi].state === 'driving') { anyPursuingOrDriving = true; anyActive = true; }
    }

    // All cops gave up investigating or returned — fully escaped
    if (LIFE.police.length === 0 && !anyActive && !state.policeDispatching && !state.swatDispatching) {
        state.policeDispatching = false;
        state.lastKnownPos = null;
        LIFE.despawnPolice();
        LIFE.ui.showPopup('Escaped! Bounty: $' + state.bounty, '#ff9800');
        state.wantedLevel = 0;
        return;
    }

    // Distance-based escape timer (secondary — faster decay when all pursuing cops are far)
    var allFar = true;
    LIFE.police.forEach(function(c) {
        if (!c.alive) return;
        var edx = player.group.position.x - c.char.group.position.x;
        var edz = player.group.position.z - c.char.group.position.z;
        if (Math.sqrt(edx * edx + edz * edz) < 30) allFar = false;
    });

    // wanted decay - faster if outrunning cops, fastest if only investigating (no pursuers)
    var decayMult = allFar ? 3 : 1;
    if (!anyPursuingOrDriving && anyInvestigating) decayMult = 5;
    state.wantedTimer += dt * decayMult;
    // Chase status is now shown persistently in the wanted level UI
    if (state.wantedTimer >= 30) {
        state.wantedTimer = 0;
        state.wantedLevel = Math.max(0, state.wantedLevel - 1);
        if (state.wantedLevel <= 0) {
            state.policeDispatching = false;
            state.lastKnownPos = null;
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
        if (cop._frozen) return; // frozen during confrontation dialogue
        var copPos = cop.char.group.position;
        var dx = player.group.position.x - copPos.x;
        var dz = player.group.position.z - copPos.z;
        var dist = Math.sqrt(dx * dx + dz * dz);

        // LOS tracking — check if cop can see player
        cop._losTimer = (cop._losTimer || 0) + dt;
        if (cop._losTimer > 0.3) {
            cop._losTimer = 0;
            cop._hasLOS = LIFE.hasLineOfSight(copPos.x, copPos.z, px, pz);
            if (cop._hasLOS) {
                cop._losLostTime = 0;
                // Update last known pos while cop can see player
                state.lastKnownPos = { x: px, z: pz };
            }
        }
        if (!cop._hasLOS) {
            cop._losLostTime = (cop._losLostTime || 0) + dt;
            if (cop._losLostTime > 6) {
                // Lost visual for 6+ seconds — switch to investigating at last seen pos
                for (var fci = 0; fci < LIFE.world.policeCops.length; fci++) {
                    if (LIFE.world.policeCops[fci].npc === cop) {
                        LIFE.world.policeCops[fci].aiState = 'investigating';
                        LIFE.world.policeCops[fci]._investigateTimer = 0;
                        LIFE.world.policeCops[fci]._investigateCenter = state.lastKnownPos ?
                            { x: state.lastKnownPos.x, z: state.lastKnownPos.z } : null;
                        LIFE.world.policeCops[fci]._investigateTarget = null;
                        LIFE.world.policeCops[fci]._investigatePath = null;
                        break;
                    }
                }
                // Remove from LIFE.police
                var ridx = LIFE.police.indexOf(cop);
                if (ridx >= 0) LIFE.police.splice(ridx, 1);
                cop._losLostTime = 0;
                cop._hasLOS = false;
                return; // skip chase this frame
            }
        }

        // Determine chase target — if no LOS, pathfind to last known pos instead
        var chaseTargetX = (cop._hasLOS || !state.lastKnownPos) ? player.group.position.x : state.lastKnownPos.x;
        var chaseTargetZ = (cop._hasLOS || !state.lastKnownPos) ? player.group.position.z : state.lastKnownPos.z;

        if (dist > 1.8) {
            // Recompute A* path periodically
            cop._chasePathTimer = (cop._chasePathTimer || 0) + dt;
            if (!cop._chasePath || cop._chasePathTimer > 1.0) {
                cop._chasePathTimer = 0;
                cop._chasePath = LIFE.pathfinding.findPath(copPos.x, copPos.z, chaseTargetX, chaseTargetZ);
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
            } else if (state.wantedLevel >= 5 || cop.isSWAT || cop._hostile) {
                // High wanted / SWAT / resisted arrest — immediate arrest, no negotiation
                LIFE.arrestPlayer();
                return;
            } else if (!state.policeConfronting) {
                // Skyrim-style confrontation — cop orders player to stop
                LIFE.policeConfront(cop);
                return;
            }
            // If already confronting (dialogue open), cop waits
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

// ============================================================
// POLICE CONFRONTATION — Skyrim-style "Stop right there!"
// ============================================================
LIFE.policeConfront = function(cop) {
    var state = LIFE.state;
    if (state.policeConfronting) return;
    state.policeConfronting = true;

    // Freeze the cop in place (stop chasing during dialogue)
    cop._frozen = true;

    var speakerName = cop.name || 'Officer';
    LIFE.dialogue.npc = cop;

    // Bribe cost scales with wanted level and bounty
    var bribeCost = Math.max(100, state.bounty * 0.5 + state.wantedLevel * 200);
    bribeCost = Math.round(bribeCost / 10) * 10; // round to nearest 10

    // Bribe success chance based on charisma (0-100 scale)
    // charisma 0 = 5% chance, charisma 50 = 40%, charisma 100 = 85%
    var charisma = state.stats.charisma || 0;
    var bribeChance = 0.05 + charisma * 0.008;

    var confrontLines = [
        "Stop right there, criminal scum! You've violated the law!",
        "Hold it! You're under arrest!",
        "Freeze! Don't move a muscle!",
        "Stop! You have the right to remain silent!"
    ];
    var line = confrontLines[Math.floor(Math.random() * confrontLines.length)];

    var options = [
        { text: "I surrender... take me in.", effects: {}, surrender: true },
        { text: "Look officer, maybe we can work something out... ($" + bribeCost + ")", effects: {},
          policeBribe: true, bribeCost: bribeCost, bribeChance: bribeChance },
        { text: "You'll never take me alive!", effects: {}, policeResist: true, rep: -5 }
    ];

    LIFE.dialogue.open(speakerName, line, options, true);
};

LIFE.arrestPlayer = function() {
    if (LIFE.state.gamePhase === 'jail' || LIFE.state.gamePhase === 'execution') return;
    var state = LIFE.state;

    // Fail any active quests on arrest
    if (LIFE.quests && LIFE.quests.active && LIFE.quests.active.length > 0) {
        var questsToFail = LIFE.quests.active.slice();
        for (var qi = 0; qi < questsToFail.length; qi++) {
            LIFE.quests.fail(questsToFail[qi]);
        }
    }

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
                    if (!n._isZoneNPC) { LIFE.scene.remove(n.char.group); LIFE.removeNPCPhysics(n); }
                });
                LIFE.npcs = [];
                if (LIFE.world._interiorGroup) {
                    LIFE.scene.remove(LIFE.world._interiorGroup);
                    LIFE.world._interiorGroup = null;
                }
                LIFE.clearEnvironment();
                LIFE.world.insideInterior = null;
            }
            LIFE.physics.disableZoneBodies();
            LIFE.world.hideAllZones();
        }
        state.bounds = LIFE.getBoundsForStage('execution');
        LIFE.buildEnvironment('execution');
        LIFE.updatePlayerSize();

        // position player at bottom of stairs
        LIFE.teleportPlayer(4.5, 0, -4);
        LIFE.player.group.rotation.y = Math.PI * 0.5;

        // hide most UI, show only sentencing text
        LIFE.ui.hideGameUI();
        LIFE.ui.hideJailScreen();
        LIFE.ui.$.ageBox.style.display = 'block';
        LIFE.ui.$.controls.style.display = 'block';
        LIFE.ui.$.controls.innerHTML = '<span style="color:#ff1744;font-weight:bold;font-size:15px">SENTENCED TO DEATH BY HANGING</span>';
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
                if (!n._isZoneNPC) { LIFE.scene.remove(n.char.group); LIFE.removeNPCPhysics(n); }
            });
            LIFE.npcs = [];
            if (LIFE.world._interiorGroup) {
                LIFE.scene.remove(LIFE.world._interiorGroup);
                LIFE.world._interiorGroup = null;
            }
            LIFE.clearEnvironment();
            LIFE.world.insideInterior = null;
        }
        LIFE.physics.disableZoneBodies();
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
        LIFE.addCollider = function(x, z, w, d, y, h) {
            LIFE.colliders.push({
                minX: (x + jailPos.x) - w / 2, maxX: (x + jailPos.x) + w / 2,
                minZ: (z + jailPos.z) - d / 2, maxZ: (z + jailPos.z) + d / 2,
                minY: (y !== undefined && h !== undefined) ? y - h / 2 : -999,
                maxY: (y !== undefined && h !== undefined) ? y + h / 2 : 999
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
        LIFE.teleportPlayer(jailPos.x, 0, jailPos.z);
    } else {
        // Legacy non-world path
        state.bounds = LIFE.getBoundsForStage('jail');
        LIFE.buildEnvironment('jail');
        LIFE.spawnNPCs('jail');
        LIFE.updatePlayerSize();
        LIFE.teleportPlayer(0, 0, 0);
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
    LIFE.ui.$.controls.innerHTML = LIFE._ctrlHtml(['WASD','Move', 'Click/1','Punch', 'T','Talk']);
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
    LIFE.ui.$.controls.innerHTML = LIFE._defaultControls();
    var newStage = LIFE.getStageForAge(state.age);
    state.currentStage = newStage;

    if (LIFE.world.built) {
        // Remove jail NPCs from scene (zone NPCs stay)
        LIFE.npcs.forEach(function(n) {
            if (!n._isZoneNPC) { LIFE.scene.remove(n.char.group); LIFE.removeNPCPhysics(n); }
        });
        LIFE.npcs = [];
        // Remove jail interior group
        if (LIFE.world._interiorGroup) {
            LIFE.scene.remove(LIFE.world._interiorGroup);
            LIFE.world._interiorGroup = null;
        }
        // Clear remaining jail objects
        LIFE.clearEnvironment();
        // Restore zone physics bodies and world zones
        LIFE.physics.enableZoneBodies();
        LIFE.world.showNearbyZones();
        LIFE.world.insideInterior = null;
        // Teleport to correct zone
        var zonePos = LIFE.world.getZonePos(newStage);
        LIFE.teleportPlayer(zonePos.x, 0, zonePos.z + 5);
        state.bounds = 400;
        // Restore atmosphere
        LIFE.scene.background.set(0x87ceeb);
        LIFE.scene.fog.color.set(0x87ceeb);
        LIFE.scene.fog.near = 80;
        LIFE.scene.fog.far = 350;
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
        LIFE.teleportPlayer(0, 0, 0);
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
    LIFE.ui.showPopup('Equipped: ' + inv[LIFE.state.equippedIndex], '#4fc3f7', 'equip');
    LIFE.updateHeldWeapon();
};

LIFE.getEquipped = function() {
    return LIFE.state.inventory[LIFE.state.equippedIndex] || 'Fists';
};

// ============================================================
// DROP & PICKUP ITEMS
// ============================================================
LIFE.droppedItems = [];

LIFE.dropItem = function(index) {
    var inv = LIFE.state.inventory;
    if (index === undefined) index = LIFE.state.equippedIndex;
    if (index < 0 || index >= inv.length) return;
    var itemName = inv[index];
    if (itemName === 'Fists') return; // can't drop fists

    // Remove from inventory
    inv.splice(index, 1);
    if (LIFE.state.equippedIndex >= inv.length) LIFE.state.equippedIndex = Math.max(0, inv.length - 1);

    // Update weapon flags
    LIFE.state.hasGun = inv.indexOf('Pistol') >= 0;
    LIFE.state.hasRifle = inv.indexOf('AK-47') >= 0;
    LIFE.state.hasSwitchblade = inv.indexOf('Switchblade') >= 0;
    LIFE.updateHeldWeapon();

    // Create 3D mesh
    if (!LIFE.player) return;
    var pPos = LIFE.player.group.position;
    var fwd = LIFE.state.playerRotY || 0;
    var dropX = pPos.x + Math.sin(fwd) * 1.5;
    var dropZ = pPos.z + Math.cos(fwd) * 1.5;
    var dropY = pPos.y + 1.0;

    var itemData = LIFE.ITEM_DATA[itemName] || {};
    var mesh;
    if (itemData.type === 'melee' || itemData.type === 'ranged') {
        mesh = LIFE.createWeaponMesh(itemName, 1.7);
    } else {
        mesh = LIFE.createItemMesh(itemName);
    }
    mesh.position.set(dropX, dropY, dropZ);
    mesh.scale.set(2, 2, 2);
    LIFE.scene.add(mesh);

    // Glow ring under item
    var ringColor = itemData.type === 'valuable' ? 0xffd700
        : itemData.type === 'food' ? 0x4caf50
        : itemData.type === 'melee' || itemData.type === 'ranged' ? 0xf44336
        : 0x4fc3f7;
    var ringGeo = new THREE.RingGeometry(0.3, 0.5, 16);
    var ringMat = new THREE.MeshBasicMaterial({
        color: ringColor, transparent: true, opacity: 0.4, side: THREE.DoubleSide
    });
    var ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(dropX, 0.02, dropZ);
    LIFE.scene.add(ring);

    // Create physics body with throw velocity
    var throwSpeed = 3;
    var velocity = {
        x: Math.sin(fwd) * throwSpeed,
        y: 2,
        z: Math.cos(fwd) * throwSpeed
    };
    var body = LIFE.physics.createItemBody(itemName, dropX, dropY, dropZ, velocity);

    var entry = {
        name: itemName,
        mesh: mesh,
        ring: ring,
        ringMat: ringMat,
        body: body,
        x: dropX, z: dropZ
    };

    LIFE.droppedItems.push(entry);
    if (body) LIFE.physics.dynamicBodies.push(entry);

    LIFE.ui.showPopup('Dropped ' + itemName, '#ff9800');
};

LIFE.pickupItem = function(droppedItem) {
    if (!droppedItem) return;
    LIFE.state.inventory.push(droppedItem.name);

    // Update weapon flags
    if (droppedItem.name === 'Pistol') LIFE.state.hasGun = true;
    if (droppedItem.name === 'Switchblade') LIFE.state.hasSwitchblade = true;

    // Remove physics body
    if (droppedItem.body) LIFE.physics.removeDynamic(droppedItem);

    // Remove 3D objects
    LIFE.scene.remove(droppedItem.mesh);
    LIFE.scene.remove(droppedItem.ring);

    // Remove from array
    var idx = LIFE.droppedItems.indexOf(droppedItem);
    if (idx >= 0) LIFE.droppedItems.splice(idx, 1);

    LIFE.ui.showPopup('Picked up ' + droppedItem.name, '#4fc3f7');
};

LIFE.updateDroppedItems = function(dt) {
    for (var i = 0; i < LIFE.droppedItems.length; i++) {
        var item = LIFE.droppedItems[i];
        // Sync x/z from physics body position (for pickup distance checks)
        if (item.body) {
            item.x = item.body.position.x;
            item.z = item.body.position.z;
        }
        // Pulse ring opacity
        if (!item._ringTime) item._ringTime = 0;
        item._ringTime += dt;
        item.ringMat.opacity = 0.25 + Math.sin(item._ringTime * 3) * 0.15;
    }
};

LIFE._nearestDroppedItem = null;
LIFE._nearestWorldItem = null;

LIFE.updatePickupHint = function() {
    var hint = document.getElementById('pickupHint');
    if (!hint || !LIFE.player) {
        LIFE._nearestDroppedItem = null;
        LIFE._nearestWorldItem = null;
        return;
    }
    var px = LIFE.player.group.position.x;
    var py = LIFE.player.group.position.y;
    var pz = LIFE.player.group.position.z;
    var best = null, bestDist = 4;
    var bestType = null; // 'dropped' or 'world'

    // Check player-dropped items (3D distance)
    for (var i = 0; i < LIFE.droppedItems.length; i++) {
        var item = LIFE.droppedItems[i];
        var iy = item.body ? item.body.position.y : 0.3;
        var dx = px - item.x;
        var dy = py - iy;
        var dz = pz - item.z;
        var d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < bestDist) {
            bestDist = d;
            best = item;
            bestType = 'dropped';
        }
    }

    // Check world items (3D distance)
    for (var j = 0; j < LIFE.worldItems.length; j++) {
        var wi = LIFE.worldItems[j];
        var wiy = wi.body ? wi.body.position.y : 0.3;
        var wdx = px - wi.x;
        var wdy = py - wiy;
        var wdz = pz - wi.z;
        var wd = Math.sqrt(wdx * wdx + wdy * wdy + wdz * wdz);
        if (wd < bestDist) {
            bestDist = wd;
            best = wi;
            bestType = 'world';
        }
    }

    // Check containers (drawers, cabinets, etc.)
    for (var k = 0; k < LIFE.containers.length; k++) {
        var cont = LIFE.containers[k];
        if (cont.items.length === 0) continue; // empty container
        var cdx = px - cont.x;
        var cdy = py - cont.y;
        var cdz = pz - cont.z;
        var cd = Math.sqrt(cdx * cdx + cdy * cdy + cdz * cdz);
        if (cd < bestDist) {
            bestDist = cd;
            best = cont;
            bestType = 'container';
        }
    }

    // Check dead NPC bodies (lootable)
    var allNPCsForLoot = LIFE.getAllNPCs ? LIFE.getAllNPCs() : [];
    for (var li = 0; li < allNPCsForLoot.length; li++) {
        var deadNpc = allNPCsForLoot[li];
        if (deadNpc.alive || deadNpc._looted) continue;
        var bdx = px - deadNpc.char.group.position.x;
        var bdz = pz - deadNpc.char.group.position.z;
        var bd = Math.sqrt(bdx * bdx + bdz * bdz);
        if (bd < bestDist) {
            bestDist = bd;
            best = deadNpc;
            bestType = 'body';
        }
    }

    LIFE._nearestDroppedItem = bestType === 'dropped' ? best : null;
    LIFE._nearestWorldItem = bestType === 'world' ? best : null;
    LIFE._nearestContainer = bestType === 'container' ? best : null;
    LIFE._nearestLootBody = bestType === 'body' ? best : null;

    if (best) {
        if (bestType === 'container') {
            var contSteal = !best.ownItem;
            hint.textContent = (contSteal ? 'Press X to steal from ' : 'Press X to search ') + best.name;
            hint.style.display = 'block';
            hint.style.color = contSteal ? '#f44336' : '#ffab40';
            hint.style.borderColor = contSteal ? 'rgba(244,67,54,0.4)' : 'rgba(255,171,64,0.4)';
        } else if (bestType === 'body') {
            hint.textContent = 'Press X to loot ' + (best.name || best.type || 'Body');
            hint.style.display = 'block';
            hint.style.color = '#ff9800';
            hint.style.borderColor = 'rgba(255,152,0,0.4)';
        } else {
            var isSteal = (bestType === 'world');
            hint.textContent = isSteal ? ('Press X to steal ' + best.name) : ('Press X to pick up ' + best.name);
            hint.style.display = 'block';
            hint.style.color = isSteal ? '#f44336' : '#4fc3f7';
            hint.style.borderColor = isSteal ? 'rgba(244,67,54,0.4)' : 'rgba(79,195,247,0.4)';
        }
    } else {
        hint.style.display = 'none';
    }
};

LIFE.clearDroppedItems = function() {
    for (var i = 0; i < LIFE.droppedItems.length; i++) {
        LIFE.scene.remove(LIFE.droppedItems[i].mesh);
        LIFE.scene.remove(LIFE.droppedItems[i].ring);
        if (LIFE.droppedItems[i].body) LIFE.physics.removeDynamic(LIFE.droppedItems[i]);
    }
    LIFE.droppedItems = [];
    LIFE._nearestDroppedItem = null;
};

// ============================================================
// CONTAINER SYSTEM (Skyrim-style searchable drawers/cabinets)
// ============================================================
LIFE.containers = [];
LIFE._nearestContainer = null;
LIFE._containerOpen = false;
LIFE._openContainerRef = null;

LIFE.addContainer = function(x, y, z, name, items, options) {
    options = options || {};
    // If building a zone, offset to world space
    var worldX = x, worldZ = z;
    if (LIFE.world._currentBuildZone && LIFE.world._currentBuildName) {
        var def = LIFE.ZONE_DEFS[LIFE.world._currentBuildName];
        if (def) { worldX += def.cx; worldZ += def.cz; }
    }
    var container = {
        name: name,
        x: worldX, y: y, z: worldZ,
        items: items, // [{name: 'Apple', parentOnly: false, isMoney: false}, ...]
        ownItem: options.ownItem !== false, // default true (family-owned)
        mesh: options.mesh || null,
        _zoneName: options.zoneName || (LIFE.world._currentBuildName || null)
    };
    LIFE.containers.push(container);
    return container;
};

LIFE.clearContainers = function(zoneName) {
    if (zoneName) {
        // Clear containers for a specific zone
        LIFE.containers = LIFE.containers.filter(function(c) { return c._zoneName !== zoneName; });
    } else {
        // Clear only non-zone (interior) containers, preserve zone containers
        LIFE.containers = LIFE.containers.filter(function(c) { return !!c._zoneName; });
    }
    LIFE._nearestContainer = null;
};

LIFE.openContainer = function(container) {
    if (!container || LIFE._containerOpen) return;
    LIFE._containerOpen = true;
    LIFE._openContainerRef = container;
    var panel = document.getElementById('containerPanel');
    var nameEl = document.getElementById('containerName');
    if (nameEl) nameEl.textContent = container.name;
    LIFE._refreshContainerUI();
    if (panel) panel.style.display = 'flex';
    // Unlock cursor for clicking
    if (document.exitPointerLock) document.exitPointerLock();
};

LIFE._refreshContainerUI = function() {
    var container = LIFE._openContainerRef;
    if (!container) return;
    var itemsEl = document.getElementById('containerItems');
    if (!itemsEl) return;
    if (container.items.length === 0) {
        itemsEl.innerHTML = '<div class="containerEmpty">Empty</div>';
        return;
    }
    var html = '';
    var isStealContainer = !container.ownItem; // not family-owned = stealing
    for (var i = 0; i < container.items.length; i++) {
        var ci = container.items[i];
        var isParent = ci.parentOnly;
        var isStealItem = isStealContainer || isParent;
        var displayName = ci.isMoney ? ('$' + ci.amount) : ci.name;
        var itemData = ci.isMoney ? null : (LIFE.ITEM_DATA[ci.name] || {});
        var valueStr = '';
        if (itemData && itemData.value) valueStr = '($' + itemData.value + ')';
        if (ci.isMoney) valueStr = '';
        html += '<div class="containerItem">';
        html += '<div><span class="containerItemName' + (isStealItem ? ' parentOwned' : '') + '">' + displayName + '</span>';
        if (isParent) html += ' <span style="color:#ef5350;font-size:11px">[Parent\'s]</span>';
        else if (isStealContainer) html += ' <span style="color:#ef5350;font-size:11px">[Steal]</span>';
        if (valueStr) html += ' <span class="containerItemValue">' + valueStr + '</span>';
        html += '</div>';
        html += '<div class="containerTakeBtn" onclick="LIFE.takeContainerItem(' + i + ')">' + (isStealItem ? 'Steal' : 'Take') + '</div>';
        html += '</div>';
    }
    itemsEl.innerHTML = html;
};

LIFE.takeContainerItem = function(index) {
    var container = LIFE._openContainerRef;
    if (!container || index < 0 || index >= container.items.length) return;
    var ci = container.items[index];
    var isSteal = !container.ownItem || ci.parentOnly;

    if (ci.isMoney) {
        LIFE.state.money += ci.amount;
        if (isSteal) {
            LIFE.ui.showPopup('Stole $' + ci.amount, '#ff9800');
            LIFE.state.stats.reputation = Math.max(-100, (LIFE.state.stats.reputation || 0) - 3);
        } else {
            LIFE.ui.showPopup('Took $' + ci.amount, '#4caf50');
        }
    } else {
        if (ci.parentOnly) {
            LIFE.ui.showPopup('Took ' + ci.name + ' (parent\'s item!)', '#ff9800');
            LIFE.state.stats.reputation = Math.max(-100, (LIFE.state.stats.reputation || 0) - 2);
        } else if (!container.ownItem) {
            LIFE.ui.showPopup('Stole ' + ci.name, '#ff9800');
            LIFE.state.stats.reputation = Math.max(-100, (LIFE.state.stats.reputation || 0) - 3);
            // Chance of adding wanted level for higher-value thefts
            var itemData = LIFE.ITEM_DATA[ci.name] || {};
            if (itemData.value && itemData.value > 40) {
                LIFE.state.wantedLevel = Math.min(5, (LIFE.state.wantedLevel || 0) + 1);
            }
        } else {
            LIFE.ui.showPopup('Took ' + ci.name, '#4caf50');
        }
        LIFE.state.inventory.push(ci.name);
        // Set weapon flags for special items
        if (ci.name === 'Pistol') LIFE.state.hasGun = true;
        if (ci.name === 'AK-47') LIFE.state.hasRifle = true;
        if (ci.name === 'Switchblade') LIFE.state.hasSwitchblade = true;
    }

    container.items.splice(index, 1);
    if (container.items.length === 0) {
        LIFE.closeContainer();
    } else {
        LIFE._refreshContainerUI();
    }
};

LIFE.closeContainer = function() {
    if (!LIFE._containerOpen) return;
    // If closing a body loot container, only mark as fully looted if empty
    if (LIFE._lootBodyNPC) {
        if (!LIFE._lootBodyNPC.lootItems || LIFE._lootBodyNPC.lootItems.length === 0) {
            LIFE._lootBodyNPC._looted = true;
        }
        LIFE._lootBodyNPC = null;
    }
    LIFE._containerOpen = false;
    LIFE._openContainerRef = null;
    var panel = document.getElementById('containerPanel');
    if (panel) panel.style.display = 'none';
    // Re-lock cursor
    if (LIFE.state.gamePhase === 'playing') {
        LIFE.lockCursor();
    }
};

// Loot a dead NPC body using the container UI
LIFE._nearestLootBody = null;
LIFE._lootBodyNPC = null;

LIFE.lootBodyAsContainer = function(npc) {
    if (!npc || npc.alive || LIFE._containerOpen) return;
    if (!npc.lootItems || npc.lootItems.length === 0) { npc._looted = true; return; }

    var bodyName = (npc.name || npc.type || 'Stranger') + ' (Dead)';
    var container = {
        name: bodyName,
        x: npc.char.group.position.x,
        y: 0.2,
        z: npc.char.group.position.z,
        items: npc.lootItems,
        ownItem: true,
        _isBodyLoot: true
    };

    LIFE._lootBodyNPC = npc;
    LIFE.logCrime('Looting a body');
    var lootWitness = LIFE.checkWitnesses(npc);
    if (lootWitness && lootWitness.witnessed) {
        LIFE.state.reputation = Math.max(-100, LIFE.state.reputation - 5);
    }
    LIFE.openContainer(container);
};

// ============================================================
// ITEM DATA
// ============================================================
LIFE.ITEM_DATA = {
    'Fists':        { desc: 'Your bare hands. Not great, but always available.', type: 'melee' },
    'Switchblade':  { desc: 'A sharp folding knife. Quick and deadly up close.', damage: 25, type: 'melee' },
    'Pistol':       { desc: 'A semi-automatic handgun. Lethal at range.', damage: 50, type: 'ranged' },
    'AK-47':        { desc: 'A fully automatic assault rifle. Devastating firepower.', damage: 40, type: 'ranged', auto: true },
    'Baseball Bat': { desc: 'A solid wooden bat. Hurts more than a punch.', damage: 35, type: 'melee', value: 20 },
    'Crowbar':      { desc: 'Heavy iron crowbar. Useful as a weapon.', damage: 40, type: 'melee', value: 15 },
    'Apple':        { desc: 'A crisp red apple. Restores a bit of health.', type: 'food', heal: 5, value: 2 },
    'Sandwich':     { desc: 'A hearty sandwich. Filling and nutritious.', type: 'food', heal: 15, value: 5 },
    'Energy Drink': { desc: 'Boosts your energy for a short time.', type: 'food', heal: 10, value: 4 },
    'Book':         { desc: 'A well-worn paperback novel. Increases intelligence.', type: 'misc', value: 10 },
    'Laptop':       { desc: 'A portable computer. Quite valuable.', type: 'misc', value: 200 },
    'Phone':        { desc: 'A smartphone. Everyone seems to have one.', type: 'misc', value: 150 },
    'Wallet':       { desc: 'A leather wallet. Might contain some cash.', type: 'valuable', value: 50 },
    'Watch':        { desc: 'A shiny wristwatch. Looks expensive.', type: 'valuable', value: 80 },
    'Backpack':     { desc: 'A sturdy backpack. Useful for carrying things.', type: 'misc', value: 30 },
    'Medkit':       { desc: 'A first aid kit. Heals a significant amount.', type: 'food', heal: 40, value: 25 },
    'Gold Ring':    { desc: 'A gold ring with a small gem. Very valuable.', type: 'valuable', value: 250 },
    'Sunglasses':   { desc: 'Cool shades. Makes you look stylish.', type: 'misc', value: 15 },
    'Keys':         { desc: 'A set of keys. Someone probably needs these.', type: 'misc', value: 5 },
    'Coffee':       { desc: 'A hot cup of coffee. Boosts alertness.', type: 'food', heal: 8, value: 3 },
    'Pizza Slice':  { desc: 'A slice of pepperoni pizza. Delicious.', type: 'food', heal: 12, stat: 'happiness', amount: 3, value: 4 },
    'Textbook':     { desc: 'A heavy academic textbook. Great for studying.', type: 'misc', value: 40 },
    'Guitar':       { desc: 'An acoustic guitar. Play a tune?', type: 'misc', value: 120 },
    'Headphones':   { desc: 'Wireless headphones. Decent sound quality.', type: 'misc', value: 60 },
    'Medicine':     { desc: 'Prescription medicine. Heals over time.', type: 'food', heal: 25, value: 20 },
    // Food vendor
    'Hot Dog':          { desc: 'A tasty hot dog.', type: 'food', stat: 'happiness', amount: 2, value: 2 },
    'Smoothie':         { desc: 'A fresh fruit smoothie.', type: 'food', stat: 'health', amount: 2, heal: 2, value: 4 },
    'Full Meal':        { desc: 'A hearty full meal.', type: 'food', stat: 'happiness', amount: 5, value: 10 },
    'Protein Shake':    { desc: 'A protein shake. Good for health.', type: 'food', stat: 'health', amount: 4, heal: 4, value: 8 },
    'Fancy Dinner':     { desc: 'An exquisite gourmet dinner.', type: 'food', stat: 'happiness', amount: 8, value: 40 },
    // Pharmacist
    'Vitamins':         { desc: 'Daily vitamins. Boosts health.', type: 'food', heal: 3, value: 5 },
    'Cold Medicine':    { desc: 'Treats cold symptoms.', type: 'food', heal: 4, value: 8 },
    'Pain Killers':     { desc: 'Relieves pain quickly.', type: 'food', heal: 5, value: 10 },
    'Supplements':      { desc: 'Health supplements.', type: 'food', heal: 6, value: 20 },
    'Prescription':     { desc: 'Prescription medication.', type: 'food', heal: 10, value: 50 },
    // Clothes
    'T-Shirt':          { desc: 'A casual t-shirt.', type: 'clothing', value: 8 },
    'Nice Outfit':      { desc: 'A stylish outfit.', type: 'clothing', value: 30 },
    'Designer Clothes': { desc: 'High-end designer clothing.', type: 'clothing', value: 100 },
    'Formal Suit':      { desc: 'A sharp formal suit.', type: 'clothing', value: 200 },
    'Luxury Watch':     { desc: 'An expensive luxury watch.', type: 'valuable', value: 750 },
    'Designer Shoes':   { desc: 'Premium designer shoes.', type: 'clothing', value: 150 },
    // Books
    'Comic Book':       { desc: 'A colorful comic book.', type: 'misc', value: 3 },
    'Novel':            { desc: 'A paperback novel.', type: 'misc', value: 6 },
    'Self-Help Book':   { desc: 'A motivational self-help book.', type: 'misc', value: 12 },
    'Encyclopedia Set': { desc: 'A complete encyclopedia set.', type: 'misc', value: 75 },
    // Gym
    'Sports Equipment': { desc: 'Quality sports gear.', type: 'misc', value: 100 },
    // Tickets
    'Event T-Shirt':    { desc: 'A commemorative event t-shirt.', type: 'clothing', value: 10 },
    'Concert Poster':   { desc: 'A signed concert poster.', type: 'misc', value: 8 },
    'Signed Merch':     { desc: 'Autographed merchandise.', type: 'valuable', value: 40 },
    // Electronics
    'Phone Case':       { desc: 'A protective phone case.', type: 'misc', value: 5 },
    'Tablet':           { desc: 'A touchscreen tablet.', type: 'misc', value: 100 },
    'Gaming Console':   { desc: 'A gaming console.', type: 'misc', value: 200 },
    'Smartphone':       { desc: 'The latest smartphone model.', type: 'misc', value: 250 }
};

// Items that can spawn in each zone (with weights)
LIFE.WORLD_ITEM_SPAWNS = {
    home:        [{ items: ['Apple', 'Sandwich', 'Keys', 'Book', 'Coffee'], count: 3 }],
    school:      [{ items: ['Textbook', 'Apple', 'Backpack', 'Book', 'Energy Drink'], count: 4 }],
    highschool:  [{ items: ['Textbook', 'Energy Drink', 'Headphones', 'Switchblade', 'Backpack', 'Phone'], count: 5 }],
    college:     [{ items: ['Textbook', 'Laptop', 'Coffee', 'Energy Drink', 'Book', 'Headphones', 'Guitar', 'Phone', 'Backpack'], count: 6 }],
    city:        [{ items: ['Wallet', 'Phone', 'Sunglasses', 'Pizza Slice', 'Coffee', 'Sandwich', 'Backpack', 'Headphones', 'Keys', 'Energy Drink'], count: 10 }],
    retirement:  [{ items: ['Medicine', 'Book', 'Watch', 'Keys', 'Wallet', 'Phone', 'Medkit'], count: 4 }],
    dealership:  [{ items: ['Coffee', 'Keys', 'Wallet'], count: 2 }],
    eventcenter: [{ items: ['Energy Drink', 'Pizza Slice', 'Wallet', 'Phone', 'Sunglasses', 'Headphones'], count: 5 }]
};

// ============================================================
// WORLD ITEM MESH CREATION (for non-weapon items)
// ============================================================
LIFE.createItemMesh = function(itemName) {
    var group = new THREE.Group();
    var data = LIFE.ITEM_DATA[itemName];
    if (!data) return group;

    // Check if it's a weapon type that already has a mesh creator
    if (itemName === 'Switchblade' || itemName === 'Pistol' || itemName === 'AK-47') {
        return LIFE.createWeaponMesh(itemName, 1.7);
    }

    var mat, geo;
    switch (itemName) {
        case 'Apple':
            geo = new THREE.SphereGeometry(0.08, 8, 8);
            mat = LIFE.getMaterial({ color: 0xcc2222 });
            var apple = new THREE.Mesh(geo, mat);
            group.add(apple);
            // Stem
            var stem = new THREE.Mesh(
                new THREE.CylinderGeometry(0.01, 0.01, 0.04, 4),
                LIFE.getMaterial({ color: 0x4a2f00 })
            );
            stem.position.y = 0.09;
            group.add(stem);
            break;
        case 'Sandwich':
            // Two bread slices with filling
            var bread = LIFE.getMaterial({ color: 0xd4a054 });
            var top = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.12), bread);
            top.position.y = 0.035;
            group.add(top);
            var fill = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.10),
                LIFE.getMaterial({ color: 0x8bc34a }));
            fill.position.y = 0.015;
            group.add(fill);
            var bot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.12), bread);
            group.add(bot);
            break;
        case 'Energy Drink':
        case 'Coffee':
            // Cylinder can/cup
            var col = itemName === 'Energy Drink' ? 0x00e676 : 0x5d4037;
            geo = new THREE.CylinderGeometry(0.04, 0.04, 0.12, 8);
            mat = LIFE.getMaterial({ color: col });
            group.add(new THREE.Mesh(geo, mat));
            break;
        case 'Book':
        case 'Textbook':
            var bCol = itemName === 'Textbook' ? 0x1565c0 : 0x795548;
            geo = new THREE.BoxGeometry(0.12, 0.03, 0.16);
            mat = LIFE.getMaterial({ color: bCol });
            group.add(new THREE.Mesh(geo, mat));
            // Pages
            var pages = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.02, 0.14),
                LIFE.getMaterial({ color: 0xfafafa }));
            pages.position.y = -0.005;
            group.add(pages);
            break;
        case 'Laptop':
            // Base
            var base = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.015, 0.15),
                LIFE.getMaterial({ color: 0x424242 }));
            group.add(base);
            // Screen half-open
            var screen = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.13, 0.008),
                LIFE.getMaterial({ color: 0x333333 }));
            screen.position.set(0, 0.065, -0.07);
            screen.rotation.x = -0.3;
            group.add(screen);
            // Screen glow
            var glow = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.10, 0.003),
                new THREE.MeshBasicMaterial({ color: 0x64b5f6 }));
            glow.position.set(0, 0.065, -0.065);
            glow.rotation.x = -0.3;
            group.add(glow);
            break;
        case 'Phone':
            geo = new THREE.BoxGeometry(0.05, 0.01, 0.10);
            mat = LIFE.getMaterial({ color: 0x222222 });
            group.add(new THREE.Mesh(geo, mat));
            var scr = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.005, 0.08),
                new THREE.MeshBasicMaterial({ color: 0x4fc3f7 }));
            scr.position.y = 0.005;
            group.add(scr);
            break;
        case 'Wallet':
            geo = new THREE.BoxGeometry(0.10, 0.02, 0.08);
            mat = LIFE.getMaterial({ color: 0x5d4037 });
            group.add(new THREE.Mesh(geo, mat));
            break;
        case 'Watch':
            // Band
            var band = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.01, 0.14),
                LIFE.getMaterial({ color: 0x333333 }));
            group.add(band);
            // Face
            var face = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.015, 12),
                LIFE.getMaterial({ color: 0xffd700, shininess: 100 }));
            group.add(face);
            break;
        case 'Backpack':
            geo = new THREE.BoxGeometry(0.14, 0.18, 0.08);
            mat = LIFE.getMaterial({ color: 0x1976d2 });
            var bp = new THREE.Mesh(geo, mat);
            bp.position.y = 0.09;
            group.add(bp);
            // Pocket
            var pocket = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.06, 0.03),
                LIFE.getMaterial({ color: 0x1565c0 }));
            pocket.position.set(0, 0.03, 0.05);
            group.add(pocket);
            break;
        case 'Medkit':
            geo = new THREE.BoxGeometry(0.14, 0.06, 0.10);
            mat = LIFE.getMaterial({ color: 0xfafafa });
            group.add(new THREE.Mesh(geo, mat));
            // Red cross
            var crossH = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.005, 0.025),
                new THREE.MeshBasicMaterial({ color: 0xf44336 }));
            crossH.position.y = 0.032;
            group.add(crossH);
            var crossV = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.005, 0.08),
                new THREE.MeshBasicMaterial({ color: 0xf44336 }));
            crossV.position.y = 0.032;
            group.add(crossV);
            break;
        case 'Baseball Bat':
            // Long cylinder
            var bat = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.03, 0.5, 8),
                LIFE.getMaterial({ color: 0x8d6e43 }));
            bat.rotation.z = Math.PI / 2;
            group.add(bat);
            // Grip tape
            var grip = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.12, 8),
                LIFE.getMaterial({ color: 0x222222 }));
            grip.rotation.z = Math.PI / 2;
            grip.position.x = -0.19;
            group.add(grip);
            break;
        case 'Crowbar':
            var bar = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.025, 0.025),
                LIFE.getMaterial({ color: 0x555555, shininess: 60 }));
            group.add(bar);
            // Hook end
            var hook = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.025, 0.025),
                LIFE.getMaterial({ color: 0x555555, shininess: 60 }));
            hook.position.set(0.22, 0.025, 0);
            group.add(hook);
            break;
        case 'Gold Ring':
            geo = new THREE.TorusGeometry(0.03, 0.008, 8, 16);
            mat = LIFE.getMaterial({ color: 0xffd700, shininess: 120 });
            group.add(new THREE.Mesh(geo, mat));
            // Gem
            var gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.012, 0),
                LIFE.getMaterial({ color: 0x00e5ff, shininess: 100 }));
            gem.position.y = 0.035;
            group.add(gem);
            break;
        case 'Sunglasses':
            // Frame
            var frame = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.01, 0.04),
                LIFE.getMaterial({ color: 0x222222 }));
            group.add(frame);
            // Lenses
            var lensL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.005, 0.03),
                LIFE.getMaterial({ color: 0x111111, transparent: true, opacity: 0.7 }));
            lensL.position.set(-0.03, 0, 0);
            group.add(lensL);
            var lensR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.005, 0.03),
                LIFE.getMaterial({ color: 0x111111, transparent: true, opacity: 0.7 }));
            lensR.position.set(0.03, 0, 0);
            group.add(lensR);
            break;
        case 'Keys':
            // Key ring + key
            var ring = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.004, 8, 12),
                LIFE.getMaterial({ color: 0xaaaaaa, shininess: 80 }));
            group.add(ring);
            var key = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.005),
                LIFE.getMaterial({ color: 0xffc107 }));
            key.position.set(0.04, 0, 0);
            group.add(key);
            break;
        case 'Pizza Slice':
            // Triangle-ish wedge
            var shape = new THREE.Shape();
            shape.moveTo(0, 0); shape.lineTo(-0.06, -0.14); shape.lineTo(0.06, -0.14); shape.closePath();
            var extGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.015, bevelEnabled: false });
            var pizza = new THREE.Mesh(extGeo, LIFE.getMaterial({ color: 0xf4a830 }));
            pizza.rotation.x = -Math.PI / 2;
            group.add(pizza);
            break;
        case 'Guitar':
            // Simple body + neck
            var body = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6),
                LIFE.getMaterial({ color: 0x8d6e43 }));
            body.scale.set(1, 0.3, 1.3);
            group.add(body);
            var neck = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.015, 0.25),
                LIFE.getMaterial({ color: 0x5d4037 }));
            neck.position.z = -0.2;
            group.add(neck);
            break;
        case 'Headphones':
            // Band
            var hBand = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.01, 0.03),
                LIFE.getMaterial({ color: 0x333333 }));
            hBand.position.y = 0.04;
            group.add(hBand);
            // Ear cups
            var cupL = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8),
                LIFE.getMaterial({ color: 0x444444 }));
            cupL.position.set(-0.05, 0.02, 0);
            group.add(cupL);
            var cupR = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8),
                LIFE.getMaterial({ color: 0x444444 }));
            cupR.position.set(0.05, 0.02, 0);
            group.add(cupR);
            break;
        case 'Medicine':
            // Pill bottle
            geo = new THREE.CylinderGeometry(0.03, 0.03, 0.08, 8);
            mat = LIFE.getMaterial({ color: 0xff9800 });
            group.add(new THREE.Mesh(geo, mat));
            // Cap
            var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.015, 8),
                LIFE.getMaterial({ color: 0xfafafa }));
            cap.position.y = 0.045;
            group.add(cap);
            break;
        // === FOOD VENDOR ===
        case 'Hot Dog':
            // Bun
            var bun = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.05),
                LIFE.getMaterial({ color: 0xd4a054 }));
            group.add(bun);
            // Sausage
            var sausage = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.15, 8),
                LIFE.getMaterial({ color: 0xc0392b }));
            sausage.rotation.z = Math.PI / 2;
            sausage.position.y = 0.015;
            group.add(sausage);
            // Mustard line
            var mustard = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.005, 0.008),
                LIFE.getMaterial({ color: 0xf1c40f }));
            mustard.position.y = 0.03;
            group.add(mustard);
            break;
        case 'Smoothie':
            // Tall cup
            var sCup = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.14, 8),
                LIFE.getMaterial({ color: 0xfafafa, transparent: true, opacity: 0.6 }));
            group.add(sCup);
            // Liquid inside
            var sLiq = new THREE.Mesh(new THREE.CylinderGeometry(0.027, 0.032, 0.12, 8),
                LIFE.getMaterial({ color: 0xe91e63 }));
            group.add(sLiq);
            // Straw
            var straw = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.18, 4),
                LIFE.getMaterial({ color: 0xffffff }));
            straw.position.set(0.01, 0.02, 0);
            group.add(straw);
            break;
        case 'Full Meal':
            // Plate
            var plate = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.01, 12),
                LIFE.getMaterial({ color: 0xfafafa }));
            group.add(plate);
            // Meat
            var meat = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.025, 0.05),
                LIFE.getMaterial({ color: 0x8d6e43 }));
            meat.position.set(-0.02, 0.02, 0);
            group.add(meat);
            // Veggies
            var veg = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6),
                LIFE.getMaterial({ color: 0x4caf50 }));
            veg.position.set(0.04, 0.015, 0.02);
            group.add(veg);
            break;
        case 'Protein Shake':
            // Shaker bottle
            var shaker = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.13, 8),
                LIFE.getMaterial({ color: 0x222222 }));
            group.add(shaker);
            // Lid
            var sLid = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.036, 0.02, 8),
                LIFE.getMaterial({ color: 0x4caf50 }));
            sLid.position.y = 0.075;
            group.add(sLid);
            break;
        case 'Fancy Dinner':
            // Fancy plate with dome
            var fPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.012, 16),
                LIFE.getMaterial({ color: 0xfafafa, shininess: 80 }));
            group.add(fPlate);
            // Silver dome cloche
            var dome = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
                LIFE.getMaterial({ color: 0xc0c0c0, shininess: 120 }));
            dome.position.y = 0.01;
            group.add(dome);
            // Handle on top
            var dHandle = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6),
                LIFE.getMaterial({ color: 0xc0c0c0, shininess: 120 }));
            dHandle.position.y = 0.09;
            group.add(dHandle);
            break;

        // === PHARMACIST ===
        case 'Vitamins':
        case 'Supplements':
            // Pill bottle (orange)
            var vBottle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.07, 8),
                LIFE.getMaterial({ color: 0xff9800 }));
            group.add(vBottle);
            var vCap = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.015, 8),
                LIFE.getMaterial({ color: 0xfafafa }));
            vCap.position.y = 0.04;
            group.add(vCap);
            break;
        case 'Cold Medicine':
            // Box
            var cmBox = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.10, 0.03),
                LIFE.getMaterial({ color: 0x2196f3 }));
            group.add(cmBox);
            // Label stripe
            var cmLabel = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.005),
                LIFE.getMaterial({ color: 0xfafafa }));
            cmLabel.position.set(0, 0.01, 0.017);
            group.add(cmLabel);
            break;
        case 'Pain Killers':
            // Blister pack
            var pkPack = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.01, 0.05),
                LIFE.getMaterial({ color: 0xeeeeee }));
            group.add(pkPack);
            // Pill bumps
            for (var pi = 0; pi < 6; pi++) {
                var pill = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 6),
                    LIFE.getMaterial({ color: 0xcccccc }));
                pill.position.set(-0.025 + (pi % 3) * 0.025, 0.008, -0.01 + Math.floor(pi / 3) * 0.02);
                group.add(pill);
            }
            break;
        case 'Prescription':
            // Prescription bottle (amber)
            var rxBottle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.09, 8),
                LIFE.getMaterial({ color: 0xd4770b, transparent: true, opacity: 0.8 }));
            group.add(rxBottle);
            var rxCap = new THREE.Mesh(new THREE.CylinderGeometry(0.027, 0.027, 0.015, 8),
                LIFE.getMaterial({ color: 0xfafafa }));
            rxCap.position.y = 0.05;
            group.add(rxCap);
            // Rx label
            var rxLabel = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.04, 0.03),
                LIFE.getMaterial({ color: 0xfafafa }));
            rxLabel.position.set(0.026, 0, 0);
            group.add(rxLabel);
            break;
        case 'First Aid Kit':
            // Same as Medkit
            var fak = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.10),
                LIFE.getMaterial({ color: 0xfafafa }));
            group.add(fak);
            var fakH = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.005, 0.025),
                new THREE.MeshBasicMaterial({ color: 0xf44336 }));
            fakH.position.y = 0.032;
            group.add(fakH);
            var fakV = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.005, 0.08),
                new THREE.MeshBasicMaterial({ color: 0xf44336 }));
            fakV.position.y = 0.032;
            group.add(fakV);
            break;

        // === CLOTHES ===
        case 'T-Shirt':
        case 'Event T-Shirt':
            var shirtCol = itemName === 'Event T-Shirt' ? 0x9c27b0 : 0x2196f3;
            // Body
            var shirtBody = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.15, 0.02),
                LIFE.getMaterial({ color: shirtCol }));
            group.add(shirtBody);
            // Sleeves
            var sleeveL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.02),
                LIFE.getMaterial({ color: shirtCol }));
            sleeveL.position.set(-0.09, 0.04, 0);
            sleeveL.rotation.z = 0.3;
            group.add(sleeveL);
            var sleeveR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.02),
                LIFE.getMaterial({ color: shirtCol }));
            sleeveR.position.set(0.09, 0.04, 0);
            sleeveR.rotation.z = -0.3;
            group.add(sleeveR);
            break;
        case 'Nice Outfit':
        case 'Designer Clothes':
            var outfitCol = itemName === 'Designer Clothes' ? 0x1a1a2e : 0x5c6bc0;
            // Jacket shape
            var jacket = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.18, 0.025),
                LIFE.getMaterial({ color: outfitCol }));
            group.add(jacket);
            // Collar
            var collar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.025, 0.03),
                LIFE.getMaterial({ color: outfitCol }));
            collar.position.y = 0.10;
            group.add(collar);
            // Button
            var btn = new THREE.Mesh(new THREE.SphereGeometry(0.006, 6, 6),
                LIFE.getMaterial({ color: 0xffd700 }));
            btn.position.set(0, 0.02, 0.014);
            group.add(btn);
            break;
        case 'Formal Suit':
            // Suit jacket
            var suitBody = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.20, 0.025),
                LIFE.getMaterial({ color: 0x1a1a2e }));
            group.add(suitBody);
            // Lapels
            var lapelL = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.10, 0.005),
                LIFE.getMaterial({ color: 0x111122 }));
            lapelL.position.set(-0.04, 0.04, 0.014);
            lapelL.rotation.z = 0.15;
            group.add(lapelL);
            var lapelR = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.10, 0.005),
                LIFE.getMaterial({ color: 0x111122 }));
            lapelR.position.set(0.04, 0.04, 0.014);
            lapelR.rotation.z = -0.15;
            group.add(lapelR);
            // Tie
            var tie = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 0.005),
                LIFE.getMaterial({ color: 0xc62828 }));
            tie.position.set(0, -0.01, 0.014);
            group.add(tie);
            break;
        case 'Luxury Watch':
            // Fancy watch band
            var lwBand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.01, 0.14),
                LIFE.getMaterial({ color: 0xffd700, shininess: 120 }));
            group.add(lwBand);
            // Watch face
            var lwFace = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.018, 16),
                LIFE.getMaterial({ color: 0xffd700, shininess: 120 }));
            group.add(lwFace);
            // Crystal face
            var lwCrystal = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.005, 16),
                LIFE.getMaterial({ color: 0x111133, shininess: 100 }));
            lwCrystal.position.y = 0.01;
            group.add(lwCrystal);
            break;
        case 'Designer Shoes':
            // Left shoe
            var shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.12),
                LIFE.getMaterial({ color: 0x222222 }));
            shoeL.position.set(-0.035, 0, 0);
            group.add(shoeL);
            // Right shoe
            var shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.12),
                LIFE.getMaterial({ color: 0x222222 }));
            shoeR.position.set(0.035, 0, 0);
            group.add(shoeR);
            // Sole
            var soleL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.008, 0.12),
                LIFE.getMaterial({ color: 0xc62828 }));
            soleL.position.set(-0.035, -0.019, 0);
            group.add(soleL);
            var soleR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.008, 0.12),
                LIFE.getMaterial({ color: 0xc62828 }));
            soleR.position.set(0.035, -0.019, 0);
            group.add(soleR);
            break;

        // === BOOKS ===
        case 'Comic Book':
            // Thin colorful booklet
            var comic = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.008, 0.14),
                LIFE.getMaterial({ color: 0xf44336 }));
            group.add(comic);
            // Cover art panel
            var comicArt = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.003, 0.09),
                LIFE.getMaterial({ color: 0xffeb3b }));
            comicArt.position.y = 0.005;
            group.add(comicArt);
            break;
        case 'Novel':
            // Paperback
            var novel = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.025, 0.15),
                LIFE.getMaterial({ color: 0x6d4c41 }));
            group.add(novel);
            var nPages = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.13),
                LIFE.getMaterial({ color: 0xfafafa }));
            nPages.position.y = -0.003;
            group.add(nPages);
            break;
        case 'Self-Help Book':
            var shBook = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.025, 0.15),
                LIFE.getMaterial({ color: 0xff9800 }));
            group.add(shBook);
            var shPages = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.02, 0.13),
                LIFE.getMaterial({ color: 0xfafafa }));
            shPages.position.y = -0.003;
            group.add(shPages);
            break;
        case 'Encyclopedia Set':
            // Stack of books
            for (var ei = 0; ei < 4; ei++) {
                var encCol = [0x1565c0, 0xc62828, 0x2e7d32, 0x6a1b9a][ei];
                var enc = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.025, 0.14),
                    LIFE.getMaterial({ color: encCol }));
                enc.position.y = ei * 0.028;
                group.add(enc);
            }
            break;

        // === GYM ===
        case 'Sports Equipment':
            // Dumbbell
            var dbBar = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.16, 6),
                LIFE.getMaterial({ color: 0x888888, shininess: 60 }));
            dbBar.rotation.z = Math.PI / 2;
            group.add(dbBar);
            var dbL = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.025, 8),
                LIFE.getMaterial({ color: 0x333333 }));
            dbL.rotation.z = Math.PI / 2;
            dbL.position.x = -0.07;
            group.add(dbL);
            var dbR = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.025, 8),
                LIFE.getMaterial({ color: 0x333333 }));
            dbR.rotation.z = Math.PI / 2;
            dbR.position.x = 0.07;
            group.add(dbR);
            break;

        // === TICKETS ===
        case 'Concert Poster':
            // Rolled poster
            var poster = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.20, 8),
                LIFE.getMaterial({ color: 0xfafafa }));
            poster.rotation.z = Math.PI / 2;
            group.add(poster);
            // Colorful band
            var pBand = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.04, 8),
                LIFE.getMaterial({ color: 0xe91e63 }));
            pBand.rotation.z = Math.PI / 2;
            group.add(pBand);
            break;
        case 'Signed Merch':
            // Box with star
            var mBox = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.10),
                LIFE.getMaterial({ color: 0x1a1a2e }));
            group.add(mBox);
            // Gold star
            var star = new THREE.Mesh(new THREE.OctahedronGeometry(0.025, 0),
                LIFE.getMaterial({ color: 0xffd700, shininess: 100 }));
            star.position.set(0, 0.04, 0.052);
            group.add(star);
            break;

        // === ELECTRONICS ===
        case 'Phone Case':
            // Phone-shaped case
            var pcCase = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.012, 0.11),
                LIFE.getMaterial({ color: 0x00bcd4 }));
            group.add(pcCase);
            // Camera cutout
            var camHole = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.005, 8),
                LIFE.getMaterial({ color: 0x111111 }));
            camHole.rotation.x = Math.PI / 2;
            camHole.position.set(0, 0.005, -0.04);
            group.add(camHole);
            break;
        case 'Tablet':
            // Flat rectangle screen
            var tabBody = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.008, 0.19),
                LIFE.getMaterial({ color: 0x333333 }));
            group.add(tabBody);
            var tabScr = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.003, 0.16),
                new THREE.MeshBasicMaterial({ color: 0x42a5f5 }));
            tabScr.position.y = 0.005;
            group.add(tabScr);
            break;
        case 'Gaming Console':
            // Console body
            var conBody = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.12),
                LIFE.getMaterial({ color: 0x111111 }));
            group.add(conBody);
            // Disk slot line
            var conSlot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.003, 0.002),
                LIFE.getMaterial({ color: 0x444444 }));
            conSlot.position.set(0, 0.021, 0.04);
            group.add(conSlot);
            // Power light
            var conLed = new THREE.Mesh(new THREE.SphereGeometry(0.005, 6, 6),
                new THREE.MeshBasicMaterial({ color: 0x00e676 }));
            conLed.position.set(-0.06, 0.021, 0.04);
            group.add(conLed);
            break;
        case 'Smartphone':
            // Like Phone but slightly bigger/nicer
            var spBody = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.008, 0.11),
                LIFE.getMaterial({ color: 0x1a1a2e }));
            group.add(spBody);
            var spScr = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.003, 0.095),
                new THREE.MeshBasicMaterial({ color: 0x64b5f6 }));
            spScr.position.y = 0.005;
            group.add(spScr);
            // Camera bump
            var spCam = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.004, 8),
                LIFE.getMaterial({ color: 0x333333 }));
            spCam.rotation.x = Math.PI / 2;
            spCam.position.set(0.01, -0.005, -0.04);
            group.add(spCam);
            break;

        default:
            // Generic box for unknown items
            geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
            mat = LIFE.getMaterial({ color: 0x888888 });
            group.add(new THREE.Mesh(geo, mat));
            break;
    }
    return group;
};

// ============================================================
// WORLD ITEMS — items placed in zones with optional owners
// ============================================================
LIFE.worldItems = [];

// Road segments for spawn avoidance (simplified waypoints from buildRoads)
LIFE._roadSegments = [
    // Main roads (width ~6)
    [[0,-5],[-8,-40],[5,-90],[-5,-120],[0,-145]],           // Home→School
    [[0,5],[8,50],[-5,100],[0,145]],                         // Home→City
    [[5,-150],[35,-160],[70,-155],[100,-158],[115,-150]],     // School→HS
    [[-5,0],[-40,8],[-80,-5],[-120,5],[-145,5]],            // Home→Hospital
    [[5,0],[40,-10],[80,5],[130,-8],[175,0]],                 // Home→Retirement
    [[-5,150],[-40,160],[-80,155],[-115,150]],               // City→College
    [[15,5],[40,15],[65,35],[85,55]],                         // Home→Dealership
    [[-8,-5],[-25,-20],[-50,-45],[-70,-65],[-78,-78]],       // Home→EventCenter
    [[-5,-8],[-20,-30],[-40,-55],[-55,-72],[-58,-78]]        // Home→PoliceStation
];

LIFE._isOnRoad = function(px, pz) {
    var roadHalf = 4; // half-width of road clearance
    for (var r = 0; r < LIFE._roadSegments.length; r++) {
        var seg = LIFE._roadSegments[r];
        for (var s = 0; s < seg.length - 1; s++) {
            var ax = seg[s][0], az = seg[s][1];
            var bx = seg[s+1][0], bz = seg[s+1][1];
            // Point-to-segment distance
            var dx = bx - ax, dz = bz - az;
            var len2 = dx * dx + dz * dz;
            if (len2 < 0.01) continue;
            var t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / len2));
            var cx = ax + t * dx, cz = az + t * dz;
            var dist2 = (px - cx) * (px - cx) + (pz - cz) * (pz - cz);
            if (dist2 < roadHalf * roadHalf) return true;
        }
    }
    return false;
};

LIFE.spawnWorldItems = function(zoneName) {
    var def = LIFE.ZONE_DEFS[zoneName];
    if (!def) return;
    var zone = LIFE.world.zones[zoneName];
    if (!zone) return;
    var spawnDef = LIFE.WORLD_ITEM_SPAWNS[zoneName];
    if (!spawnDef) return;

    // Remove old world items in this zone
    for (var ri = LIFE.worldItems.length - 1; ri >= 0; ri--) {
        if (LIFE.worldItems[ri]._zoneName === zoneName) {
            LIFE.scene.remove(LIFE.worldItems[ri].mesh);
            LIFE.scene.remove(LIFE.worldItems[ri].ring);
            if (LIFE.worldItems[ri].body) LIFE.physics.removeDynamic(LIFE.worldItems[ri]);
            LIFE.worldItems.splice(ri, 1);
        }
    }

    // Get zone NPCs for ownership assignment
    var zoneNPCs = (zone.npcs || []).filter(function(n) { return n.alive; });
    var b = def.radius * 0.6;

    for (var si = 0; si < spawnDef.length; si++) {
        var sd = spawnDef[si];
        var pool = sd.items;
        var count = sd.count || 1;

        for (var ci = 0; ci < count; ci++) {
            var itemName = pool[Math.floor(Math.random() * pool.length)];

            // Find a safe position within the zone (avoid colliders and roads)
            var x, z, safe, tries = 0;
            do {
                x = def.cx + (Math.random() - 0.5) * b * 2;
                z = def.cz + (Math.random() - 0.5) * b * 2;
                safe = true;
                for (var coli = 0; coli < zone.colliders.length; coli++) {
                    var col = zone.colliders[coli];
                    if (x > col.minX - 0.3 && x < col.maxX + 0.3 && z > col.minZ - 0.3 && z < col.maxZ + 0.3) {
                        safe = false; break;
                    }
                }
                // Don't place on top of zone center
                var cdx = x - def.cx, cdz = z - def.cz;
                if (Math.sqrt(cdx * cdx + cdz * cdz) < 2) safe = false;
                // Don't place on roads
                if (safe && LIFE._isOnRoad(x, z)) safe = false;
                tries++;
            } while (!safe && tries < 30);

            // Create 3D mesh
            var mesh = LIFE.createItemMesh(itemName);
            var spawnY = 2.5 + Math.random() * 1.5; // spawn above furniture height
            mesh.position.set(x, spawnY, z);
            mesh.scale.set(2, 2, 2);
            LIFE.scene.add(mesh);

            // Glow ring under item (colored by value)
            var data = LIFE.ITEM_DATA[itemName] || {};
            var ringColor = data.type === 'valuable' ? 0xffd700
                : data.type === 'food' ? 0x4caf50
                : data.type === 'melee' || data.type === 'ranged' ? 0xf44336
                : 0x4fc3f7;
            var ringGeo = new THREE.RingGeometry(0.3, 0.5, 16);
            var ringMat = new THREE.MeshBasicMaterial({
                color: ringColor, transparent: true, opacity: 0.35, side: THREE.DoubleSide
            });
            var ringMesh = new THREE.Mesh(ringGeo, ringMat);
            ringMesh.rotation.x = -Math.PI / 2;
            ringMesh.position.set(x, 0.02, z);
            LIFE.scene.add(ringMesh);

            // Create physics body — drop from height, no initial velocity
            var body = LIFE.physics.createItemBody(itemName, x, spawnY, z, null);

            // Assign owner: ~60% of items have an owner (a nearby NPC)
            var owner = null;
            if (zoneNPCs.length > 0 && Math.random() < 0.6) {
                // Pick a random NPC from the zone as owner
                owner = zoneNPCs[Math.floor(Math.random() * zoneNPCs.length)];
            }

            var entry = {
                name: itemName,
                mesh: mesh,
                ring: ringMesh,
                ringMat: ringMat,
                body: body,
                x: x, z: z,
                _ringTime: Math.random() * 6,
                _zoneName: zoneName,
                owner: owner,
                ownerName: owner ? owner.name : null
            };
            LIFE.worldItems.push(entry);
            if (body) LIFE.physics.dynamicBodies.push(entry);
        }
    }
};

LIFE.updateWorldItems = function(dt) {
    for (var i = 0; i < LIFE.worldItems.length; i++) {
        var item = LIFE.worldItems[i];
        // Sync x/z from physics body position (for pickup distance checks)
        if (item.body) {
            item.x = item.body.position.x;
            item.z = item.body.position.z;
        }
        // Pulse ring opacity
        if (!item._ringTime) item._ringTime = 0;
        item._ringTime += dt;
        item.ringMat.opacity = 0.2 + Math.sin(item._ringTime * 3) * 0.15;
    }
};

LIFE.clearWorldItems = function() {
    for (var i = 0; i < LIFE.worldItems.length; i++) {
        LIFE.scene.remove(LIFE.worldItems[i].mesh);
        LIFE.scene.remove(LIFE.worldItems[i].ring);
        if (LIFE.worldItems[i].body) LIFE.physics.removeDynamic(LIFE.worldItems[i]);
    }
    LIFE.worldItems = [];
};

// ============================================================
// STEALING DETECTION
// ============================================================
LIFE.tryPickupWorldItem = function(worldItem) {
    if (!worldItem) return;
    var player = LIFE.player;
    if (!player) return;

    var itemName = worldItem.name;
    var owner = worldItem.owner;
    var isStolen = false;

    // Only check for stealing if the item has a living owner
    if (owner && owner.alive) {
        var px = player.group.position.x, pz = player.group.position.z;

        // Check ALL nearby NPCs — anyone watching can react
        var allNPCs = LIFE.getAllNPCs();
        var witnesses = [];
        var phoneCaller = null;

        for (var i = 0; i < allNPCs.length; i++) {
            var npc = allNPCs[i];
            if (!npc.alive || npc._sleeping) continue;

            var nx = npc.char.group.position.x, nz = npc.char.group.position.z;
            var dx = nx - px, dz = nz - pz;
            var dist = Math.sqrt(dx * dx + dz * dz);

            // Must be within 20 units and have line-of-sight
            if (dist >= 20 || !LIFE.hasLineOfSight(px, pz, nx, nz)) continue;

            // Witness if: is the owner, OR has npcReputation > -30 (shady NPCs don't snitch)
            var isOwner = (npc === owner);
            var rep = npc.npcReputation !== undefined ? npc.npcReputation : 30;
            if (!isOwner && rep <= -30) continue;

            witnesses.push(npc);
        }

        if (witnesses.length > 0) {
            isStolen = true;

            // Pick one witness to react (prefer owner if present, else random)
            var reactor = null;
            for (var wi = 0; wi < witnesses.length; wi++) {
                if (witnesses[wi] === owner) { reactor = witnesses[wi]; break; }
            }
            if (!reactor) reactor = witnesses[Math.floor(Math.random() * witnesses.length)];

            LIFE.logCrime('Theft');
            var itemData = LIFE.ITEM_DATA[itemName];
            var itemValue = (itemData && itemData.value) || 0;

            // React: police always confront directly; civilians only call police for items worth >$40
            if (reactor.isPolice) {
                LIFE.addWanted(2, 'Caught stealing (police)', reactor.name);
                LIFE.drawChatBubble(reactor, 'Stop right there, criminal!');
                reactor.chatSprite.visible = true;
                reactor.chatTimer = 4;
                reactor.chatCooldown = 10;
                LIFE.ui.showPopup('CAUGHT STEALING by police!', '#f44336');
            } else {
                var reactorAge = reactor.npcAge !== null ? reactor.npcAge : (reactor.type === 'Kid' ? 8 : 25);
                if (reactorAge >= 12 && itemValue > 40 && Math.random() < 0.5) {
                    // Adult calls police (only for valuable items)
                    LIFE.updateRelationship(reactor.name, -20);
                    if (!reactor._callingPolice) {
                        LIFE.npcStartPhoneCall(reactor, function() {
                            LIFE.addWanted(2, 'Theft reported', reactor.name);
                        });
                    }
                    LIFE.ui.showPopup('CAUGHT STEALING! ' + reactor.name + ' is calling the police!', '#f44336');
                } else if (reactorAge < 12) {
                    // Kid — confront or run away scared
                    LIFE.updateRelationship(reactor.name, -15);
                    if (Math.random() < 0.5) {
                        // Kid confronts
                        reactor.fleeing = false;
                        var kidDx = px - reactor.char.group.position.x;
                        var kidDz = pz - reactor.char.group.position.z;
                        reactor.char.group.rotation.y = Math.atan2(kidDx, kidDz);
                        var kidMsg = (reactor === owner) ? 'Hey! Give that back!' : 'I\'m telling on you!';
                        LIFE.drawChatBubble(reactor, kidMsg);
                        reactor.chatSprite.visible = true;
                        reactor.chatTimer = 4;
                        reactor.chatCooldown = 10;
                    } else {
                        // Kid runs away
                        reactor.fleeing = true;
                        reactor.fleeTimer = 5 + Math.random() * 3;
                    }
                    LIFE.ui.showPopup(reactor.name + ' caught you stealing!', '#ff9800');
                } else {
                    // Adult confront (for cheap items or 50% chance on expensive)
                    reactor.fleeing = false;
                    var faceDx = px - reactor.char.group.position.x;
                    var faceDz = pz - reactor.char.group.position.z;
                    reactor.char.group.rotation.y = Math.atan2(faceDx, faceDz);

                    var confrontMsg = (reactor === owner)
                        ? 'Hey! That\'s mine, thief!'
                        : 'I saw that! Put it back!';
                    LIFE.drawChatBubble(reactor, confrontMsg);
                    reactor.chatSprite.visible = true;
                    reactor.chatTimer = 4;
                    reactor.chatCooldown = 10;
                    LIFE.updateRelationship(reactor.name, -15);
                    if (itemValue > 40) {
                        LIFE.addWanted(1, 'Theft witnessed', reactor.name);
                        LIFE.ui.showPopup('CAUGHT STEALING! ' + reactor.name + ' saw you!', '#f44336');
                    } else {
                        LIFE.ui.showPopup(reactor.name + ' caught you stealing!', '#ff9800');
                    }
                }
            }

            // All other witnesses also react (flee or lower relationship)
            for (var j = 0; j < witnesses.length; j++) {
                if (witnesses[j] === reactor) continue;
                LIFE.updateRelationship(witnesses[j].name, -10);
                // Lower the witness NPC's own reputation of the player
                if (witnesses[j].npcReputation !== undefined) {
                    witnesses[j].npcReputation -= 5;
                }
            }
        }
    }

    // Actually pick up the item regardless (they already grabbed it)
    LIFE.state.inventory.push(itemName);

    // Update weapon flags
    if (itemName === 'Pistol') LIFE.state.hasGun = true;
    if (itemName === 'Switchblade') LIFE.state.hasSwitchblade = true;

    // Remove physics body
    if (worldItem.body) LIFE.physics.removeDynamic(worldItem);

    // Remove 3D objects
    LIFE.scene.remove(worldItem.mesh);
    LIFE.scene.remove(worldItem.ring);

    // Remove from array
    var idx = LIFE.worldItems.indexOf(worldItem);
    if (idx >= 0) LIFE.worldItems.splice(idx, 1);

    if (isStolen) {
        LIFE.ui.showPopup('Stole ' + itemName + '!', '#ff5722');
    } else {
        LIFE.ui.showPopup('Picked up ' + itemName, '#4fc3f7');
    }
};

// ============================================================
// SKYRIM-STYLE 3D INVENTORY PANEL
// ============================================================
LIFE._invOpen = false;
LIFE._invPreviewScene = null;
LIFE._invPreviewCamera = null;
LIFE._invPreviewRenderer = null;
LIFE._invPreviewMesh = null;
LIFE._invSelectedIndex = 0;
LIFE._invDragging = false;
LIFE._invDragX = 0;
LIFE._invDragY = 0;
LIFE._invRotX = 0;
LIFE._invRotY = 0;
LIFE._invAutoRot = 0;

LIFE.ui.openInventory = function() {
    if (LIFE._invOpen) return;
    LIFE._invOpen = true;
    var panel = document.getElementById('inventoryPanel');
    if (!panel) return;
    panel.style.display = 'flex';
    document.exitPointerLock();

    // Init preview renderer if needed
    if (!LIFE._invPreviewRenderer) {
        LIFE._invPreviewScene = new THREE.Scene();
        LIFE._invPreviewScene.background = new THREE.Color(0x1a1a2e);
        LIFE._invPreviewCamera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
        LIFE._invPreviewCamera.position.set(0, 0.2, 1.5);

        var ambLight = new THREE.AmbientLight(0xffffff, 0.6);
        LIFE._invPreviewScene.add(ambLight);
        var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(2, 3, 2);
        LIFE._invPreviewScene.add(dirLight);

        var canvas = document.getElementById('invPreviewCanvas');
        if (canvas) {
            LIFE._invPreviewRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
            LIFE._invPreviewRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
        }
    }

    LIFE._invSelectedIndex = LIFE.state.equippedIndex;
    LIFE.ui.refreshInventoryPanel();
    LIFE._invSetPreviewItem(LIFE.state.inventory[LIFE._invSelectedIndex]);
    LIFE._invAnimFrame = requestAnimationFrame(LIFE._invRenderLoop);
};

LIFE.ui.closeInventory = function() {
    if (!LIFE._invOpen) return;
    LIFE._invOpen = false;
    var panel = document.getElementById('inventoryPanel');
    if (panel) panel.style.display = 'none';
    if (LIFE._invAnimFrame) cancelAnimationFrame(LIFE._invAnimFrame);
    LIFE._invAnimFrame = null;
    // Re-lock cursor
    if (LIFE.state.gamePhase === 'playing') {
        LIFE.lockCursor();
    }
};

LIFE.ui.refreshInventoryPanel = function() {
    var list = document.getElementById('invItemList');
    if (!list) return;
    var inv = LIFE.state.inventory;
    var html = '';
    for (var i = 0; i < inv.length; i++) {
        var itemName = inv[i];
        var data = LIFE.ITEM_DATA[itemName] || {};
        var isEquipped = (i === LIFE.state.equippedIndex);
        var isSelected = (i === LIFE._invSelectedIndex);
        html += '<div class="invListItem' + (isSelected ? ' invSelected' : '') + (isEquipped ? ' invEquipped' : '') + '" onclick="LIFE._invSelectItem(' + i + ')">';
        html += '<span class="invItemName">' + itemName + '</span>';
        if (isEquipped) html += '<span class="invEquipBadge">E</span>';
        html += '</div>';
    }
    list.innerHTML = html;

    // Update info pane
    var selItem = inv[LIFE._invSelectedIndex];
    var data = LIFE.ITEM_DATA[selItem] || {};
    var nameEl = document.getElementById('invInfoName');
    var descEl = document.getElementById('invInfoDesc');
    var statsEl = document.getElementById('invInfoStats');
    if (nameEl) nameEl.textContent = selItem || '';
    if (descEl) descEl.textContent = data.desc || '';
    if (statsEl) {
        var statsHtml = '';
        if (data.damage) statsHtml += '<div class="invStat">Damage: ' + data.damage + '</div>';
        if (data.heal) statsHtml += '<div class="invStat">Heals: +' + data.heal + ' HP</div>';
        if (data.value) statsHtml += '<div class="invStat">Value: $' + data.value + '</div>';
        if (data.type) statsHtml += '<div class="invStat">Type: ' + data.type + '</div>';
        statsEl.innerHTML = statsHtml;
    }

    // Update buttons
    var equipBtn = document.getElementById('invEquipBtn');
    var dropBtn = document.getElementById('invDropBtn');
    var useBtn = document.getElementById('invUseBtn');
    var isWeapon = data.type === 'melee' || data.type === 'ranged';
    var isConsumable = !!(data.heal || data.stat);
    if (equipBtn) {
        var isEq = LIFE._invSelectedIndex === LIFE.state.equippedIndex;
        equipBtn.textContent = isEq ? 'Equipped' : 'Equip';
        equipBtn.style.opacity = isEq ? '0.4' : '1';
        equipBtn.style.display = (isWeapon || selItem === 'Fists') ? 'inline-block' : 'none';
    }
    if (useBtn) {
        useBtn.style.display = isConsumable ? 'inline-block' : 'none';
    }
    if (dropBtn) {
        dropBtn.style.display = (selItem === 'Fists') ? 'none' : 'inline-block';
    }
};

LIFE._invSelectItem = function(index) {
    LIFE._invSelectedIndex = index;
    LIFE.ui.refreshInventoryPanel();
    LIFE._invSetPreviewItem(LIFE.state.inventory[index]);
};

LIFE._invEquipSelected = function() {
    if (LIFE._invSelectedIndex === LIFE.state.equippedIndex) return;
    LIFE.state.equippedIndex = LIFE._invSelectedIndex;
    LIFE.updateHeldWeapon();
    LIFE.ui.refreshInventoryPanel();
};

LIFE._invDropSelected = function() {
    var itemName = LIFE.state.inventory[LIFE._invSelectedIndex];
    if (!itemName || itemName === 'Fists') return;
    LIFE.dropItem(LIFE._invSelectedIndex);
    if (LIFE._invSelectedIndex >= LIFE.state.inventory.length) {
        LIFE._invSelectedIndex = Math.max(0, LIFE.state.inventory.length - 1);
    }
    LIFE.ui.refreshInventoryPanel();
    LIFE._invSetPreviewItem(LIFE.state.inventory[LIFE._invSelectedIndex]);
    if (LIFE.state.inventory.length <= 1) {
        LIFE.ui.closeInventory();
    }
};

LIFE._invUseSelected = function() {
    var inv = LIFE.state.inventory;
    var itemName = inv[LIFE._invSelectedIndex];
    if (!itemName) return;
    var data = LIFE.ITEM_DATA[itemName] || {};
    if (!data.heal && !data.stat) return; // not consumable

    var popupParts = [];
    // Apply healing
    if (data.heal) {
        LIFE.state.stats.health = Math.min(100, LIFE.state.stats.health + data.heal);
        popupParts.push('+' + data.heal + ' HP');
    }
    // Apply stat boost (happiness, intelligence, charisma, etc.)
    if (data.stat && data.amount) {
        LIFE.state.stats[data.stat] = Math.min(100, LIFE.state.stats[data.stat] + data.amount);
        popupParts.push('+' + data.amount + ' ' + data.stat);
    }
    LIFE.ui.showPopup('Used ' + itemName + ' (' + popupParts.join(', ') + ')', '#4caf50');

    // Remove from inventory
    inv.splice(LIFE._invSelectedIndex, 1);
    if (LIFE.state.equippedIndex >= inv.length) LIFE.state.equippedIndex = Math.max(0, inv.length - 1);
    if (LIFE._invSelectedIndex >= inv.length) LIFE._invSelectedIndex = Math.max(0, inv.length - 1);

    LIFE.ui.refreshInventoryPanel();
    LIFE._invSetPreviewItem(inv[LIFE._invSelectedIndex]);
    if (inv.length <= 1) {
        LIFE.ui.closeInventory();
    }
};

LIFE._invSetPreviewItem = function(itemName) {
    // Remove old preview mesh
    if (LIFE._invPreviewMesh) {
        LIFE._invPreviewScene.remove(LIFE._invPreviewMesh);
        LIFE._invPreviewMesh = null;
    }
    LIFE._invRotX = 0;
    LIFE._invRotY = 0;
    LIFE._invAutoRot = 0;

    if (!itemName || itemName === 'Fists') {
        // Show a fist (simple sphere)
        var fistGeo = new THREE.SphereGeometry(0.15, 12, 12);
        var fistMat = LIFE.getMaterial({ color: 0xd4a574 });
        var fist = new THREE.Mesh(fistGeo, fistMat);
        LIFE._invPreviewMesh = fist;
        LIFE._invPreviewScene.add(fist);
        return;
    }

    var data = LIFE.ITEM_DATA[itemName] || {};
    var mesh;
    if (data.type === 'melee' || data.type === 'ranged') {
        mesh = LIFE.createWeaponMesh(itemName, 1.7);
        mesh.scale.set(4, 4, 4);
    } else {
        mesh = LIFE.createItemMesh(itemName);
        mesh.scale.set(6, 6, 6);
    }
    LIFE._invPreviewMesh = mesh;
    LIFE._invPreviewScene.add(mesh);
};

LIFE._invRenderLoop = function() {
    if (!LIFE._invOpen) return;
    LIFE._invAnimFrame = requestAnimationFrame(LIFE._invRenderLoop);

    if (LIFE._invPreviewMesh) {
        if (!LIFE._invDragging) {
            LIFE._invAutoRot += 0.01;
            LIFE._invPreviewMesh.rotation.y = LIFE._invAutoRot + LIFE._invRotY;
        } else {
            LIFE._invPreviewMesh.rotation.y = LIFE._invAutoRot + LIFE._invRotY;
        }
        LIFE._invPreviewMesh.rotation.x = LIFE._invRotX;
    }

    if (LIFE._invPreviewRenderer && LIFE._invPreviewScene && LIFE._invPreviewCamera) {
        LIFE._invPreviewRenderer.render(LIFE._invPreviewScene, LIFE._invPreviewCamera);
    }
};

// Mouse drag on preview canvas
LIFE._invOnMouseDown = function(e) {
    LIFE._invDragging = true;
    LIFE._invDragX = e.clientX;
    LIFE._invDragY = e.clientY;
};
LIFE._invOnMouseMove = function(e) {
    if (!LIFE._invDragging) return;
    var dx = e.clientX - LIFE._invDragX;
    var dy = e.clientY - LIFE._invDragY;
    LIFE._invRotY += dx * 0.01;
    LIFE._invRotX += dy * 0.01;
    LIFE._invRotX = Math.max(-1.2, Math.min(1.2, LIFE._invRotX));
    LIFE._invDragX = e.clientX;
    LIFE._invDragY = e.clientY;
};
LIFE._invOnMouseUp = function() {
    LIFE._invDragging = false;
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
            LIFE.getMaterial({ color: 0xcccccc, shininess: 80 })
        );
        blade.position.y = -h * 0.06;
        group.add(blade);
        // Handle: small dark rectangle
        var handle = new THREE.Mesh(
            new THREE.BoxGeometry(0.03, h * 0.05, 0.05),
            LIFE.getMaterial({ color: 0x333333 })
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
            LIFE.getMaterial({ color: 0x222222 })
        );
        body.position.z = h * 0.04;
        group.add(body);
        // Barrel: thin cylinder-ish box
        var barrel = new THREE.Mesh(
            new THREE.BoxGeometry(0.025, 0.025, h * 0.06),
            LIFE.getMaterial({ color: 0x111111 })
        );
        barrel.position.set(0, 0.01, h * 0.1);
        group.add(barrel);
        // Grip: angled handle
        var grip = new THREE.Mesh(
            new THREE.BoxGeometry(0.03, h * 0.05, 0.035),
            LIFE.getMaterial({ color: 0x333333 })
        );
        grip.position.set(0, -h * 0.02, h * 0.01);
        grip.rotation.x = 0.2;
        group.add(grip);
        // Position at end of arm, rotate so barrel points forward when arm extended
        group.position.set(0, -armH * 0.9, 0.02);
        group.rotation.x = Math.PI / 2;
    } else if (type === 'Baseball Bat') {
        // Long wooden bat held in hand
        var bat = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.03, h * 0.35, 8),
            LIFE.getMaterial({ color: 0x8d6e43 })
        );
        bat.position.y = -h * 0.15;
        group.add(bat);
        // Grip tape
        var grip = new THREE.Mesh(
            new THREE.CylinderGeometry(0.018, 0.018, h * 0.08, 8),
            LIFE.getMaterial({ color: 0x222222 })
        );
        grip.position.y = h * 0.05;
        group.add(grip);
        group.position.set(0, -armH - h * 0.02, 0);
        group.rotation.x = -0.4;
    } else if (type === 'Crowbar') {
        var bar = new THREE.Mesh(
            new THREE.BoxGeometry(0.025, h * 0.3, 0.025),
            LIFE.getMaterial({ color: 0x555555, shininess: 60 })
        );
        bar.position.y = -h * 0.12;
        group.add(bar);
        // Hook end
        var hook = new THREE.Mesh(
            new THREE.BoxGeometry(0.025, 0.04, 0.025),
            LIFE.getMaterial({ color: 0x555555, shininess: 60 })
        );
        hook.position.set(0, -h * 0.27, 0.02);
        group.add(hook);
        group.position.set(0, -armH - h * 0.02, 0);
        group.rotation.x = -0.3;
    } else if (type === 'AK-47') {
        // Receiver body
        var akBody = new THREE.Mesh(
            new THREE.BoxGeometry(0.04, 0.05, h * 0.22),
            LIFE.getMaterial({ color: 0x333333 })
        );
        akBody.position.z = h * 0.06;
        group.add(akBody);
        // Barrel: long thin
        var akBarrel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.012, 0.012, h * 0.18, 6),
            LIFE.getMaterial({ color: 0x222222 })
        );
        akBarrel.rotation.x = Math.PI / 2;
        akBarrel.position.set(0, 0.015, h * 0.26);
        group.add(akBarrel);
        // Wooden handguard
        var akGuard = new THREE.Mesh(
            new THREE.BoxGeometry(0.035, 0.04, h * 0.08),
            LIFE.getMaterial({ color: 0x8d6e43 })
        );
        akGuard.position.set(0, -0.005, h * 0.14);
        group.add(akGuard);
        // Stock
        var akStock = new THREE.Mesh(
            new THREE.BoxGeometry(0.03, 0.04, h * 0.1),
            LIFE.getMaterial({ color: 0x8d6e43 })
        );
        akStock.position.set(0, -0.01, -h * 0.04);
        group.add(akStock);
        // Magazine (curved)
        var akMag = new THREE.Mesh(
            new THREE.BoxGeometry(0.025, h * 0.08, 0.03),
            LIFE.getMaterial({ color: 0x2a2a2a })
        );
        akMag.position.set(0, -h * 0.06, h * 0.04);
        akMag.rotation.x = 0.15;
        group.add(akMag);
        // Position at end of arm, rotate so barrel points forward when arm extended
        group.position.set(0, -armH * 0.9, 0.02);
        group.rotation.x = Math.PI / 2;
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
    } else if (equipped === 'AK-47') {
        // Hold arm forward, two-handed feel
        player.parts.rightArm.rotation.x = -1.3;
        player.parts.rightArm.rotation.z = -0.05;
    } else if (equipped === 'Baseball Bat' || equipped === 'Crowbar') {
        // Hold arm to the side, ready to swing
        player.parts.rightArm.rotation.x = -0.6;
        player.parts.rightArm.rotation.z = -0.2;
    }
};

// ============================================================
// RANDOM LIFE EVENTS
// ============================================================
LIFE.triggerRandomEvent = function() {
    if (LIFE.dialogue.active) return;
    var state = LIFE.state;
    var age = state.age;
    var stage = state.currentStage || '';

    // gather all eligible events - static + context-aware
    var allEvents = LIFE.RANDOM_EVENTS.concat(LIFE.getContextEvents());
    var eligible = [];
    allEvents.forEach(function(evt) {
        if (age < evt.minAge) return;
        if (evt.maxAge && age > evt.maxAge) return;
        // location-based conditions
        if (evt.stages && evt.stages.indexOf(stage) === -1) return;
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
        { text: "A fan recognized you on the street and asked for a selfie!", minAge: 18, maxAge: 70, chance: 0.2, reqFame: 30, stages: ['city', 'college'],
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
        { text: "Paparazzi are following you everywhere!", minAge: 18, maxAge: 70, chance: 0.15, reqFame: 40, stages: ['city'],
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
        { text: "Someone keyed your car because of your reputation!", minAge: 18, maxAge: 70, chance: 0.15, reqBadRep: -30, stages: ['city', 'home', 'college', 'highschool'],
          options: [
            { text: "File a police report", effects: { happiness: -3 }, rep: 3 },
            { text: "Find out who did it", effects: { charisma: 1, happiness: -2 }, rep: -5 },
            { text: "I probably deserved that...", effects: { happiness: -1 }, rep: 5 }
        ]},
        { text: "A store refused to serve you due to your reputation!", minAge: 16, maxAge: 80, chance: 0.15, reqBadRep: -50, stages: ['city'],
          options: [
            { text: "Quietly leave", effects: { happiness: -3 }, rep: 2 },
            { text: "Cause a scene", effects: { charisma: -2 }, rep: -10 },
            { text: "Apologize and try to make amends", effects: { happiness: 1 }, rep: 8 }
        ]},
        { text: "Anonymous threats were left at your door!", minAge: 18, maxAge: 80, chance: 0.1, reqBadRep: -60, stages: ['home', 'playerhome'],
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
        { text: "A food bank in the neighborhood is offering free meals.", minAge: 18, maxAge: 80, chance: 0.15, reqPoor: 200, stages: ['city', 'home'],
          options: [
            { text: "Accept the help gratefully", effects: { happiness: 2, health: 3 }, rep: 2 },
            { text: "I'm too proud for charity", effects: { happiness: -2 }, rep: -1 }
        ]}
    );

    // CRIMINAL RECORD events
    events.push(
        { text: "A background check revealed your criminal record to a potential employer.", minAge: 23, maxAge: 65, chance: 0.15, reqCriminal: true, stages: ['city'],
          options: [
            { text: "Be honest about your past", effects: { charisma: 2 }, rep: 5 },
            { text: "Try to explain the circumstances", effects: { charisma: 1 }, rep: 2 },
            { text: "Walk out of the interview", effects: { happiness: -3 }, rep: -2 }
        ]},
        { text: "Someone from your past recognized you as an ex-convict.", minAge: 20, maxAge: 80, chance: 0.12, reqCriminal: true, stages: ['city', 'college', 'retirement'],
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
            var friendlyNames = { classroom: 'the classroom', hsclassroom: 'the classroom', playerhome: 'your home', hospital: 'the hospital', workplace: 'the workplace', police_interior: 'the police station' };
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
        LIFE.teleportPlayer(cityPos.x, 0, cityPos.z + 2);
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
    LIFE.teleportPlayer(0, 0, 3);

    // spawn family NPCs inside home
    LIFE.spawnHomeNPCs();

    LIFE.ui.showPopup('Welcome home!', '#4caf50');
};

LIFE.spawnHomeNPCs = function() {
    // clear current NPCs first
    LIFE.npcs.forEach(function(n) { LIFE.scene.remove(n.char.group); LIFE.removeNPCPhysics(n); });
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
        LIFE.teleportPlayer(0, 0, 3);
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
        LIFE.teleportPlayer(returnPos.x, 0, returnPos.z);

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

// Weather system removed

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
            if (def) LIFE.teleportPlayer(def.cx, 0, def.cz + 5);
            LIFE.ui.showPopup('Recess!', '#66bb6a');
        } else if (phase === 'sleep') {
            if (LIFE.world.insideInterior) LIFE.world.exitInterior();
            LIFE.teleportPlayer(0, 0, -5);
            LIFE.ui.showPopup('Time for bed...', '#5c6bc0');
        } else {
            if (LIFE.world.insideInterior) LIFE.world.exitInterior();
            LIFE.teleportPlayer(0, 0, 5);
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
    LIFE.teleportPlayer(0, 0, 0);

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

    // Debug console toggle — works in ANY game phase
    if (e.code === 'Backquote') {
        e.preventDefault();
        LIFE.toggleDebugConsole();
        return;
    }
    // Physics debug view toggle
    if (e.code === 'ShiftRight') {
        LIFE.toggleDebugView();
        return;
    }
    // Block all other input while debug console is open
    if (LIFE._debugOpen) return;

    if (LIFE._invOpen) {
        if (e.code === 'KeyI' || e.code === 'Tab' || e.code === 'Escape') {
            e.preventDefault();
            LIFE.ui.closeInventory();
        }
        return;
    }

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
        if (e.code === 'KeyJ' && !LIFE.dialogue.active && !state.shopOpen) {
            LIFE.quests.toggleLog();
        }
        if (e.code === 'KeyC' && !LIFE.dialogue.active && !state.shopOpen) {
            LIFE.quests.cycleActiveQuest();
        }
        if (e.code === 'KeyX' && !LIFE.dialogue.active && !state.shopOpen) {
            if (LIFE._containerOpen) { LIFE.closeContainer(); }
            else if (LIFE._nearestDroppedItem) LIFE.pickupItem(LIFE._nearestDroppedItem);
            else if (LIFE._nearestWorldItem) LIFE.tryPickupWorldItem(LIFE._nearestWorldItem);
            else if (LIFE._nearestLootBody) LIFE.lootBodyAsContainer(LIFE._nearestLootBody);
            else if (LIFE._nearestContainer) LIFE.openContainer(LIFE._nearestContainer);
        }
        if ((e.code === 'KeyI' || e.code === 'Tab') && !LIFE.dialogue.active && !state.shopOpen && !state.friendsOpen) {
            e.preventDefault();
            LIFE.ui.openInventory();
        }
        if (!LIFE.dialogue.active && e.code >= 'Digit1' && e.code <= 'Digit4') {
            LIFE.performAction(parseInt(e.code[5]) - 1);
        }
    }
    // Close quest log with ESC
    if (e.code === 'Escape' && LIFE.quests.logOpen) {
        LIFE.quests.toggleLog();
    }
    // Close container with ESC
    if (e.code === 'Escape' && LIFE._containerOpen) {
        LIFE.closeContainer();
    }
});

document.addEventListener('keyup', function(e) { LIFE.keys[e.code] = false; });

document.addEventListener('mousemove', function(e) {
    if (!LIFE.state.locked) return;
    if (LIFE.state.gamePhase === 'execution') return; // cinematic camera
    LIFE.state.playerRotY -= e.movementX * 0.003;
    LIFE.state.cameraPitch = Math.max(0.1, Math.min(1.2, LIFE.state.cameraPitch + e.movementY * 0.003));
});

LIFE._mouseHeld = false;

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
    LIFE._mouseHeld = true;
    var eq = LIFE.getEquipped();
    if (eq !== 'Pistol' && eq !== 'AK-47') return;
    if (LIFE.state.shootCooldown > 0) return;
    LIFE.shootGun();
});

document.addEventListener('mouseup', function(e) {
    if (e.button === 0) LIFE._mouseHeld = false;
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
        LIFE.state.gamePhase !== 'execution' && !LIFE._suppressPause &&
        !LIFE.dialogue.active && !LIFE.state.shopOpen && !LIFE.state.friendsOpen && !LIFE.state.timeSkipOpen && !LIFE._invOpen && !LIFE.quests.logOpen && !LIFE._containerOpen) {
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
        if (LIFE.quests) LIFE.quests.reset();
        LIFE.clearDroppedItems();
        LIFE.clearWorldItems();
        if (LIFE.physics) LIFE.physics.clear();
        LIFE.state.gamePhase = 'womb'; LIFE.state.wombTimer = 0; LIFE.state.age = -1;
        LIFE.buildEnvironment('womb'); LIFE.createPlayer();
        LIFE.teleportPlayer(0, 1.5, 0); LIFE.ui.hideGameUI();
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

    // Release from mom's arms immediately when age advances past 0
    if (state.heldByParent && state.age > 0) {
        state.heldByParent = false;
        if (LIFE.player) LIFE.player.group.position.y = 0;
        state.isGrounded = true;
        state.playerVelY = 0;
        for (var mi = 0; mi < LIFE.npcs.length; mi++) {
            if (LIFE.npcs[mi].type === 'Mom' && LIFE.npcs[mi].alive) {
                LIFE.npcs[mi].char.parts.leftArm.rotation.set(0, 0, 0);
                LIFE.npcs[mi].char.parts.rightArm.rotation.set(0, 0, 0);
                break;
            }
        }
    }

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
                LIFE.teleportPlayer(zonePos.x, 0, zonePos.z + 5);
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
                LIFE.teleportPlayer(0, 0, 0);
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
            LIFE.teleportPlayer(0, 0, 0);
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
                LIFE.addWanted(Math.min(3, Math.ceil(state.bounty / 2000)), 'Recognized by police (bounty)');
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

    // Quest system year advance
    if (LIFE.quests) LIFE.quests.onYearAdvance();

    // NPC lifecycle: aging, death, birth
    LIFE.processNPCLifecycle();

    // Gang system yearly processing
    LIFE.gangs.processYearly();

    // health death check
    if (state.stats.health <= 0 && !state.deathTriggered) {
        state.deathCause = state.drugUses > 3 ? 'substance abuse' : 'poor health';
        LIFE.triggerDeath();
    }
};

// ============================================================
// NPC LIFECYCLE PROCESSING (called each year advance)
// ============================================================
LIFE.processNPCLifecycle = function() {
    var state = LIFE.state;
    var births = 0;

    // Process all registered NPCs
    for (var i = 0; i < LIFE.npcRegistry.length; i++) {
        var entry = LIFE.npcRegistry[i];
        if (!entry.alive) continue;

        var npcAge = state.age - entry.birthYear;

        // Death check
        if (npcAge >= entry.deathAge) {
            entry.alive = false;
            LIFE.handleNPCDeath(entry, npcAge);
            continue;
        }

        // Type transition: update type and home zone as NPC ages
        if (!entry.isFamily) {
            var newType = LIFE.NPC_AGE_TYPE(npcAge);
            if (newType !== entry.currentType) {
                entry.currentType = newType;
                entry.homeZone = LIFE.NPC_TYPE_ZONE[newType] || 'city';
            }
        }
    }

    // Birth: count alive non-family per zone, spawn new young NPCs if below target
    var zoneTargets = { school: 4, highschool: 5, city: 6, retirement: 3 };
    for (var zone in zoneTargets) {
        var alive = 0;
        for (var j = 0; j < LIFE.npcRegistry.length; j++) {
            var e = LIFE.npcRegistry[j];
            if (e.alive && !e.isFamily && e.homeZone === zone) alive++;
        }
        var deficit = zoneTargets[zone] - alive;
        for (var k = 0; k < deficit; k++) {
            var gender = Math.random() < 0.5 ? 'M' : 'F';
            var pool = gender === 'F' ? LIFE.FEMALE_NAMES : LIFE.MALE_NAMES;
            var firstName = pool[Math.floor(Math.random() * pool.length)];
            var newAge;
            if (zone === 'school') newAge = 5 + Math.floor(Math.random() * 7);
            else if (zone === 'highschool') newAge = 12 + Math.floor(Math.random() * 6);
            else if (zone === 'retirement') newAge = 65 + Math.floor(Math.random() * 10);
            else newAge = 18 + Math.floor(Math.random() * 20);
            LIFE.registerNPC({
                firstName: firstName,
                gender: gender,
                birthYear: state.age - newAge,
                deathAge: 65 + Math.floor(Math.random() * 30),
                currentType: LIFE.NPC_AGE_TYPE(newAge),
                homeZone: zone
            });
            births++;
        }
    }

    // Remove dead NPCs from current scene zones
    if (LIFE.world && LIFE.world.zones) {
        for (var zn in LIFE.world.zones) {
            var z = LIFE.world.zones[zn];
            if (!z.npcs) continue;
            for (var ni = z.npcs.length - 1; ni >= 0; ni--) {
                var npc = z.npcs[ni];
                if (npc._registryId) {
                    var reg = LIFE.findRegistryById(npc._registryId);
                    if (reg && !reg.alive) {
                        LIFE.scene.remove(npc.char.group);
                        LIFE.removeNPCPhysics(npc);
                        z.npcs.splice(ni, 1);
                    }
                }
            }
        }
    }
};

LIFE.handleNPCDeath = function(entry, npcAge) {
    var state = LIFE.state;

    if (entry.isFamily) {
        var role = entry.familyRole || 'Family member';
        var name = entry.firstName;

        // Track family death
        state.familyDeaths.push({ name: name, role: role, age: npcAge, playerAge: state.age });

        // Happiness hit
        if (role === 'Spouse') {
            state.stats.happiness = Math.max(0, state.stats.happiness - 25);
            state.married = false;
            state.spouseName = null;
        } else if (role === 'Mom' || role === 'Dad') {
            state.stats.happiness = Math.max(0, state.stats.happiness - 15);
        } else if (role === 'Sibling') {
            state.stats.happiness = Math.max(0, state.stats.happiness - 10);
        } else {
            state.stats.happiness = Math.max(0, state.stats.happiness - 8);
        }

        // Log milestone
        LIFE.logMilestone(role + ' (' + name + ') passed away at age ' + npcAge, 'bad');

        // News
        if (LIFE.news) LIFE.news.add(name + ' has passed away at age ' + npcAge + '.', 'social');

        // Deferred dialogue notification
        setTimeout(function() {
            if (LIFE.state.gamePhase === 'playing' && !LIFE.dialogue.active) {
                LIFE.dialogue.open('Life', 'Your ' + role + ', ' + name + ', has passed away at the age of ' + npcAge + '. Rest in peace.', [
                    { text: "I'll miss them forever...", effects: { happiness: -3 } },
                    { text: "They lived a good life.", effects: { happiness: 2 } },
                    { text: "...", effects: {} }
                ], true);
            }
        }, 1000);
    } else if (entry.met) {
        // Non-family NPC the player had met
        if (LIFE.ui && LIFE.ui.showPopup) {
            LIFE.ui.showPopup(entry.firstName + ' has passed away.', '#90a4ae');
        }
    }
};

// ============================================================
// GANG SYSTEM
// ============================================================
LIFE.gangs = {};

LIFE.gangs.joinGang = function(gangId) {
    var state = LIFE.state;
    state.gang = gangId;
    state.gangRep = 10;
    state.gangJoinedAge = state.age;
    LIFE.logMilestone('Joined ' + LIFE.GANGS[gangId].name, 'bad');
    LIFE.logCrime('Gang membership');
    if (LIFE.news) LIFE.news.add('Reports of new gang recruitment in the area.', 'crime');
};

LIFE.gangs.leaveGang = function() {
    var state = LIFE.state;
    if (!state.gang) return;
    var gangName = LIFE.GANGS[state.gang].name;
    LIFE.logMilestone('Left ' + gangName, 'neutral');
    state.gang = null;
    state.gangRep = 0;
    state.gangJoinedAge = null;
};

// Gang recruitment interaction — returns true if dialogue opened
LIFE.gangs.tryGangInteraction = function(npc) {
    if (!npc.isGangMember || !npc.gangId) return false;
    var state = LIFE.state;
    var gangDef = LIFE.GANGS[npc.gangId];
    if (!gangDef) return false;

    // Same gang: friendly dialogue
    if (state.gang === npc.gangId) {
        var rank = LIFE.getGangRank(state.gangRep);
        var friendlyLines = [
            "What's good, " + rank.title + "? Need anything?",
            "Yo, " + rank.title + "! We're running things out here.",
            "Respect, " + rank.title + ". The streets know your name."
        ];
        var line = friendlyLines[Math.floor(Math.random() * friendlyLines.length)];
        var opts = [
            { text: "What's the word on the street?", effects: { charisma: 1 }, rep: 1 },
            { text: "Stay sharp out there.", effects: {}, rep: 1 }
        ];
        LIFE.dialogue.open(npc.displayName || npc.name, line, opts, false);
        return true;
    }

    // Rival gang: hostile
    if (state.gang && state.gang !== npc.gangId) {
        var rivalLines = [
            "You're on the wrong turf, " + LIFE.GANGS[state.gang].name + " scum.",
            "Better watch your back around here.",
            "We don't take kindly to your kind. Move along."
        ];
        var rivalLine = rivalLines[Math.floor(Math.random() * rivalLines.length)];
        LIFE.dialogue.open(npc.displayName || npc.name, rivalLine, [
            { text: "I'm not looking for trouble.", effects: {}, rep: 0 },
            { text: "You don't scare me.", effects: { charisma: 1 }, rep: -2 }
        ], false);
        return true;
    }

    // No gang + meets age req: recruitment offer (30% chance)
    if (!state.gang && state.age >= gangDef.minAge && Math.random() < 0.3) {
        var capturedGangId = npc.gangId;
        LIFE.dialogue.open(npc.displayName || npc.name, gangDef.greeting, [
            { text: "I'm interested. What do I have to do?", effects: {}, rep: -1, onSelect: function() {
                var initQuestId = 'gang_init_' + capturedGangId;
                // Start the initiation quest
                for (var q = 0; q < LIFE.QUEST_DEFS.length; q++) {
                    if (LIFE.QUEST_DEFS[q].id === initQuestId) {
                        LIFE.quests.start(LIFE.QUEST_DEFS[q], npc);
                        break;
                    }
                }
            }},
            { text: "Not interested.", effects: {}, rep: 0 },
            { text: "I'd never join a gang.", effects: { charisma: 1 }, rep: 2 }
        ], false);
        return true;
    }

    return false;
};

// Process gang rank advancement (called in advanceYear)
LIFE.gangs.processYearly = function() {
    var state = LIFE.state;
    if (!state.gang) return;

    // Decay rep by 2/year (must stay active)
    state.gangRep = Math.max(0, state.gangRep - 2);

    // Check for rank change
    var oldRank = LIFE.getGangRank(state.gangRep + 2); // what rank was before decay
    var newRank = LIFE.getGangRank(state.gangRep);
    if (newRank.title !== oldRank.title && state.gangRep > 5) {
        // Only notify on promotion, not demotion from decay
    }

    // If rep drops to 0 for 3+ years, kicked out
    if (state.gangRep <= 0 && state.gangJoinedAge && (state.age - state.gangJoinedAge) >= 3) {
        var gangName = LIFE.GANGS[state.gang].name;
        LIFE.gangs.leaveGang();
        LIFE.ui.showPopup('You were kicked out of ' + gangName + ' for inactivity.', '#ff9800');
    }
};

// Register family NPCs at game start
LIFE.registerFamilyNPCs = function() {
    // Clear registry for new game
    LIFE.npcRegistry = [];
    LIFE._registryNextId = 1;

    var state = LIFE.state;

    // Mom
    LIFE.registerNPC({
        firstName: 'Mom',
        gender: 'F',
        birthYear: state.age - (state.age + 25 + Math.floor(Math.random() * 5)),
        deathAge: 68 + Math.floor(Math.random() * 22),
        currentType: 'Mom',
        homeZone: 'home',
        isFamily: true,
        familyRole: 'Mom',
        met: true
    });

    // Dad
    LIFE.registerNPC({
        firstName: 'Dad',
        gender: 'M',
        birthYear: state.age - (state.age + 27 + Math.floor(Math.random() * 5)),
        deathAge: 68 + Math.floor(Math.random() * 22),
        currentType: 'Dad',
        homeZone: 'home',
        isFamily: true,
        familyRole: 'Dad',
        met: true
    });

    // Sibling
    var sibAge = Math.max(1, state.age + (Math.random() < 0.5 ? -2 - Math.floor(Math.random() * 3) : 2 + Math.floor(Math.random() * 3)));
    LIFE.registerNPC({
        firstName: 'Sibling',
        gender: Math.random() < 0.5 ? 'M' : 'F',
        birthYear: state.age - sibAge,
        deathAge: 68 + Math.floor(Math.random() * 24),
        currentType: 'Sibling',
        homeZone: 'home',
        isFamily: true,
        familyRole: 'Sibling',
        met: true
    });
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
    LIFE.npcs.forEach(function(n) { LIFE.scene.remove(n.char.group); LIFE.removeNPCPhysics(n); });
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

    // Register persistent family NPCs
    LIFE.registerFamilyNPCs();

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
    if (LIFE.ui.$.controls) { LIFE.ui.$.controls.style.color = ''; LIFE.ui.$.controls.innerHTML = LIFE._defaultControls(); }
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
// DEBUG CONSOLE
// ============================================================
LIFE._debugOpen = false;

LIFE.toggleDebugConsole = function() {
    var panel = document.getElementById('debugConsole');
    if (!panel) return;
    LIFE._debugOpen = !LIFE._debugOpen;
    panel.style.display = LIFE._debugOpen ? 'flex' : 'none';
    if (LIFE._debugOpen) LIFE._updateDebugInfo();
};

LIFE._updateDebugInfo = function() {
    var info = document.getElementById('debugInfo');
    if (!info) return;
    var s = LIFE.state;
    var lines = [
        'Phase: ' + s.gamePhase + ' | Stage: ' + s.currentStage,
        'Age: ' + s.age + ' | Gender: ' + (s.playerGender || '?') + ' | Name: ' + (s.playerName || 'Unknown'),
        'Money: $' + Math.floor(s.money).toLocaleString() + ' | Health: ' + Math.floor(s.stats.health),
        'Wanted: ' + s.wantedLevel + ' | Kills: ' + s.kills + ' | Career: ' + (s.career || 'none'),
        'Inventory: ' + s.inventory.join(', '),
        'Position: ' + (LIFE.player ? Math.floor(LIFE.player.group.position.x) + ', ' + Math.floor(LIFE.player.group.position.z) : 'N/A'),
        'World Items: ' + LIFE.worldItems.length + ' | Dropped: ' + LIFE.droppedItems.length
    ];
    info.textContent = lines.join('\n');
};

LIFE.debugSkipTo25 = function() {
    var state = LIFE.state;

    // Set basic state
    state.age = 25;
    state.gamePhase = 'playing';
    state.currentStage = 'city';
    state.playerGender = state.playerGender || 'M';
    if (!state.playerName) {
        var pool = state.playerGender === 'F' ? LIFE.FEMALE_NAMES : LIFE.MALE_NAMES;
        state.playerName = pool[Math.floor(Math.random() * pool.length)];
    }
    state.money = 100000;
    state.stats = { intelligence: 50, happiness: 70, charisma: 40, health: 100, beauty: 50 };
    state.career = 'business';
    state.careerLevel = 2;
    state.bounds = 400;
    state.dayPhase = null;
    state.wantedLevel = 0;
    state.wantedTimer = 0;
    state.criminalRecord = false;
    state.inventory = ['Fists', 'Switchblade', 'Pistol'];
    state.equippedIndex = 0;
    state.hasGun = true;
    state.hasSwitchblade = true;
    state.yearTimer = 0;
    state.locked = true;

    // Make sure player exists
    if (!LIFE.player) LIFE.createPlayer();
    LIFE.updatePlayerSize();

    // Build world if needed
    if (!LIFE.world.built) {
        LIFE.world.buildWorld();
        LIFE.world.spawnAllZoneNPCs();
    }

    // Exit any interior
    if (LIFE.world.insideInterior) LIFE.world.exitInterior();

    // Teleport to city
    var cityDef = LIFE.ZONE_DEFS.city;
    LIFE.teleportPlayer(cityDef.cx, 0, cityDef.cz + 5);

    // Refresh NPCs
    LIFE.world.spawnZoneNPCs('city');
    LIFE.world._cullingTimer = 999;
    LIFE.world.updateCulling(0);

    // Show game UI
    LIFE.ui.showGameUI();
    LIFE.ui.updateActionButtons();
    LIFE.ui.$.age.textContent = state.age;
    LIFE.ui.$.controls.innerHTML = LIFE._defaultControls();
    LIFE.updateHeldWeapon();

    // Restore atmosphere
    LIFE.scene.background.set(0x87ceeb);
    LIFE.scene.fog.color.set(0x87ceeb);
    LIFE.scene.fog.near = 80;
    LIFE.scene.fog.far = 350;

    // Spawn parked car if owned
    if (state.ownedCar) LIFE.spawnParkedCar();

    // Close debug console
    LIFE.toggleDebugConsole();
    LIFE.lockCursor();

    LIFE.ui.showPopup('DEBUG: Skipped to age 25 in city with $100K', '#ff9800');
    LIFE.ui.showStageMessage('Welcome to the city. Age 25');
};

LIFE.debugGiveMoney = function(amount) {
    LIFE.state.money += amount;
    LIFE.ui.showPopup('DEBUG: +$' + amount.toLocaleString(), '#4caf50');
    LIFE._updateDebugInfo();
};

LIFE.debugHeal = function() {
    LIFE.state.stats.health = 100;
    LIFE.ui.showPopup('DEBUG: Health restored', '#4caf50');
    LIFE._updateDebugInfo();
};

LIFE.debugClearWanted = function() {
    LIFE.state.wantedLevel = 0;
    LIFE.state.wantedTimer = 0;
    LIFE.state.policeDispatching = false;
    LIFE.state.swatDispatching = false;
    LIFE.removeAllPolice();
    LIFE.ui.showPopup('DEBUG: Wanted level cleared', '#4caf50');
    LIFE._updateDebugInfo();
};

LIFE.debugGiveAllItems = function() {
    var items = Object.keys(LIFE.ITEM_DATA);
    for (var i = 0; i < items.length; i++) {
        if (items[i] !== 'Fists' && LIFE.state.inventory.indexOf(items[i]) < 0) {
            LIFE.state.inventory.push(items[i]);
        }
    }
    if (LIFE.state.inventory.indexOf('Pistol') >= 0) LIFE.state.hasGun = true;
    if (LIFE.state.inventory.indexOf('Switchblade') >= 0) LIFE.state.hasSwitchblade = true;
    LIFE.ui.showPopup('DEBUG: All items added', '#4caf50');
    LIFE._updateDebugInfo();
};

// ============================================================
// MAIN GAME LOOP
// ============================================================
LIFE.animate = function() {
    requestAnimationFrame(LIFE.animate);
    if (LIFE._debugView) LIFE._perfFrameStart = performance.now();
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
            // weather removed
            // update date/time display
            LIFE.ui.updateDateTime();
            LIFE.economy.passiveIncome(dt);
            LIFE._perfBegin('physics');
            LIFE.physics.step(dt);
            LIFE._perfEnd('physics');
            LIFE._perfBegin('player');
            LIFE.updatePlayer(dt);
            LIFE._perfEnd('player');
            LIFE._perfBegin('npcs');
            LIFE.updateNPCs(dt);
            LIFE._perfEnd('npcs');
            LIFE.updateNPCPhoneCalls(dt);
            LIFE._perfBegin('pathfind');
            LIFE.pathfinding.updateCache(dt);
            LIFE._perfEnd('pathfind');
            LIFE._perfBegin('police');
            LIFE.updatePolice(dt);
            LIFE._perfEnd('police');
            LIFE.updateBullets(dt);
            LIFE.updateActionAnim(dt);
            // Auto-fire for automatic weapons (hold mouse to shoot)
            if (LIFE._mouseHeld && state.shootCooldown <= 0) {
                var autoEq = LIFE.getEquipped();
                var autoData = LIFE.ITEM_DATA[autoEq];
                if (autoData && autoData.auto) LIFE.shootGun();
            }
            LIFE.updateCamera(dt);

            // Event, news, and quest systems
            LIFE._perfBegin('events');
            LIFE.events.update(dt);
            LIFE.news.update(dt);
            LIFE.quests.update(dt);
            LIFE.quests.updateHUD();
            LIFE._perfEnd('events');

            // Dropped items & world items
            LIFE.updateDroppedItems(dt);
            LIFE.updateWorldItems(dt);
            LIFE.updatePickupHint();

            // Open world culling and shadow following
            LIFE._perfBegin('culling');
            if (LIFE.world.built && !LIFE.world.insideInterior) {
                LIFE.world.updateCulling(dt);
                if (LIFE.player) {
                    var px = LIFE.player.group.position.x;
                    var pz = LIFE.player.group.position.z;
                    LIFE.dirLight.target.position.set(px, 0, pz);
                }
            }
            LIFE._perfEnd('culling');

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

            LIFE._perfBegin('ui');
            LIFE.ui.updateAgeColor(); LIFE.ui.updateMoney(); LIFE.ui.updateStats();
            LIFE.ui.updateNPCHint(); LIFE.ui.updateWeapon(); LIFE.ui.updatePlayerHealth();
            LIFE.ui.updateWanted();
            LIFE._perfEnd('ui');
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
            LIFE.physics.step(dt);
            LIFE.updatePlayer(dt);
            LIFE.updateNPCs(dt);
            LIFE.pathfinding.updateCache(dt);
            LIFE.updateActionAnim(dt);
            LIFE.updateCamera(dt);
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
    LIFE.updateDebugView(dt);
    LIFE._perfBegin('render');
    LIFE.renderer.render(LIFE.scene, LIFE.camera);
    LIFE._perfEnd('render');
    // Total frame time
    if (LIFE._debugView && LIFE._perfFrameStart) {
        var frameTotal = performance.now() - LIFE._perfFrameStart;
        LIFE._perfFrameTotal = frameTotal;
        LIFE._perfSmoothedTotal = LIFE._perfSmoothedTotal * 0.9 + frameTotal * 0.1;
        // Log spikes (frames > 33ms = below 30fps)
        if (frameTotal > 33) {
            var spike = { time: Date.now(), ms: frameTotal.toFixed(1), culprit: '' };
            var worst = 0;
            var categories = ['physics', 'player', 'npcs', 'pathfind', 'police', 'events', 'culling', 'ui', 'render'];
            for (var si = 0; si < categories.length; si++) {
                var t = LIFE._perfTimings[categories[si]] || 0;
                if (t > worst) { worst = t; spike.culprit = categories[si] + ' (' + t.toFixed(1) + 'ms)'; }
            }
            LIFE._perfSpikeLog.push(spike);
            if (LIFE._perfSpikeLog.length > 8) LIFE._perfSpikeLog.shift();
        }
    }
};

// ============================================================
// PHYSICS DEBUG VIEW (toggle with Right Shift)
// ============================================================
LIFE._debugView = false;
LIFE._debugMeshes = [];
LIFE._debugPlayerSphere = null;
LIFE._debugFPS = 0;
LIFE._debugFrames = 0;
LIFE._debugFPSTimer = 0;

// Performance profiler
LIFE._perfTimings = {};      // current frame timings
LIFE._perfSmoothed = {};     // smoothed (rolling avg) for display
LIFE._perfFrameStart = 0;
LIFE._perfFrameTotal = 0;
LIFE._perfSmoothedTotal = 0;
LIFE._perfSpikeLog = [];     // recent frame spikes
LIFE._perfWorst = {};        // worst timing per category in last 2 seconds
LIFE._perfWorstTimer = 0;
LIFE._perfWorstSnap = {};    // snapshot shown in overlay

LIFE._perfBegin = function(label) {
    if (!LIFE._debugView) return;
    LIFE._perfTimings['_start_' + label] = performance.now();
};
LIFE._perfEnd = function(label) {
    if (!LIFE._debugView) return;
    var start = LIFE._perfTimings['_start_' + label];
    if (start === undefined) return;
    var elapsed = performance.now() - start;
    LIFE._perfTimings[label] = elapsed;
    // Rolling average (90% old, 10% new)
    var prev = LIFE._perfSmoothed[label] || 0;
    LIFE._perfSmoothed[label] = prev * 0.9 + elapsed * 0.1;
    // Track worst
    if (!LIFE._perfWorst[label] || elapsed > LIFE._perfWorst[label]) {
        LIFE._perfWorst[label] = elapsed;
    }
};

LIFE.toggleDebugView = function() {
    LIFE._debugView = !LIFE._debugView;
    var el = document.getElementById('debugOverlay');
    if (el) el.style.display = LIFE._debugView ? 'block' : 'none';
    // Clean up debug meshes when turning off
    if (!LIFE._debugView) {
        LIFE._clearDebugMeshes();
    }
};

LIFE._clearDebugMeshes = function() {
    for (var i = 0; i < LIFE._debugMeshes.length; i++) {
        LIFE.scene.remove(LIFE._debugMeshes[i]);
    }
    LIFE._debugMeshes = [];
    if (LIFE._debugPlayerSphere) {
        LIFE.scene.remove(LIFE._debugPlayerSphere);
        LIFE._debugPlayerSphere = null;
    }
};

LIFE._ensureDebugPlayerSphere = function() {
    var halfH = LIFE.physics._playerHalfH || 0.4;
    if (LIFE._debugPlayerSphere && Math.abs(LIFE._debugPlayerSphere._dbgRadius - halfH) > 0.01) {
        LIFE.scene.remove(LIFE._debugPlayerSphere);
        LIFE._debugPlayerSphere = null;
    }
    if (!LIFE._debugPlayerSphere) {
        var geo = new THREE.SphereGeometry(halfH, 16, 12);
        var mat = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true, transparent: true, opacity: 0.5 });
        LIFE._debugPlayerSphere = new THREE.Mesh(geo, mat);
        LIFE._debugPlayerSphere._dbgRadius = halfH;
        LIFE.scene.add(LIFE._debugPlayerSphere);
    }
};

LIFE.updateDebugView = function(dt) {
    if (!LIFE._debugView) return;

    // FPS counter
    LIFE._debugFrames++;
    LIFE._debugFPSTimer += dt;
    if (LIFE._debugFPSTimer >= 0.5) {
        LIFE._debugFPS = Math.round(LIFE._debugFrames / LIFE._debugFPSTimer);
        LIFE._debugFrames = 0;
        LIFE._debugFPSTimer = 0;
    }

    var body = LIFE.physics._playerBody;
    var halfH = LIFE.physics._playerHalfH || 0.4;

    // Update wireframe sphere to show physics body position
    LIFE._ensureDebugPlayerSphere();
    if (LIFE._debugPlayerSphere && body) {
        LIFE._debugPlayerSphere.position.set(body.position.x, body.position.y, body.position.z);
    }

    // Clear old debug meshes (static body wireframes)
    for (var i = 0; i < LIFE._debugMeshes.length; i++) {
        LIFE.scene.remove(LIFE._debugMeshes[i]);
    }
    LIFE._debugMeshes = [];

    // Draw nearby static physics bodies as wireframe boxes
    if (LIFE.physics.world && LIFE.player) {
        var px = LIFE.player.group.position.x;
        var pz = LIFE.player.group.position.z;
        var bodies = LIFE.physics.world.bodies;
        for (var b = 0; b < bodies.length; b++) {
            var pb = bodies[b];
            if (pb === LIFE.physics._groundPlane) continue;
            if (pb === body) continue;
            var bdx = pb.position.x - px;
            var bdz = pb.position.z - pz;
            if (bdx * bdx + bdz * bdz > 225) continue; // within 15 units
            for (var s = 0; s < pb.shapes.length; s++) {
                var shape = pb.shapes[s];
                var offset = pb.shapeOffsets[s] || new CANNON.Vec3();
                var dbgMesh = null;
                if (shape instanceof CANNON.Box) {
                    var he = shape.halfExtents;
                    var geo = new THREE.BoxGeometry(he.x * 2, he.y * 2, he.z * 2);
                    var mat = new THREE.MeshBasicMaterial({
                        color: pb.mass === 0 ? 0xff4444 : 0x44aaff,
                        wireframe: true, transparent: true, opacity: 0.35
                    });
                    dbgMesh = new THREE.Mesh(geo, mat);
                } else if (shape instanceof CANNON.Sphere) {
                    var geo2 = new THREE.SphereGeometry(shape.radius, 8, 6);
                    var mat2 = new THREE.MeshBasicMaterial({
                        color: pb.type === CANNON.Body.KINEMATIC ? 0xffaa00 : 0x44aaff,
                        wireframe: true, transparent: true, opacity: 0.35
                    });
                    dbgMesh = new THREE.Mesh(geo2, mat2);
                }
                if (dbgMesh) {
                    dbgMesh.position.set(
                        pb.position.x + offset.x,
                        pb.position.y + offset.y,
                        pb.position.z + offset.z
                    );
                    LIFE.scene.add(dbgMesh);
                    LIFE._debugMeshes.push(dbgMesh);
                }
            }
        }
    }

    // Update text overlay
    var el = document.getElementById('debugOverlay');
    if (!el) return;

    // Update worst-case snapshot every 2 seconds
    LIFE._perfWorstTimer += dt;
    if (LIFE._perfWorstTimer >= 2) {
        LIFE._perfWorstSnap = {};
        for (var wk in LIFE._perfWorst) {
            if (wk.charAt(0) !== '_') LIFE._perfWorstSnap[wk] = LIFE._perfWorst[wk];
        }
        LIFE._perfWorst = {};
        LIFE._perfWorstTimer = 0;
    }

    var lines = [];
    lines.push('=== DEBUG VIEW [RShift] ===');
    lines.push('FPS: ' + LIFE._debugFPS + '  frame: ' + (LIFE._perfSmoothedTotal || 0).toFixed(1) + 'ms');

    // --- PERFORMANCE ---
    lines.push('');
    lines.push('--- PERFORMANCE (avg / worst 2s) ---');
    var perfCats = ['physics', 'npcs', 'police', 'pathfind', 'culling', 'render', 'ui', 'player', 'events'];
    for (var pi = 0; pi < perfCats.length; pi++) {
        var cat = perfCats[pi];
        var avg = (LIFE._perfSmoothed[cat] || 0);
        var peak = (LIFE._perfWorstSnap[cat] || 0);
        var bar = '';
        // Visual bar: each block = 1ms
        var blocks = Math.min(30, Math.round(avg));
        for (var bi = 0; bi < blocks; bi++) bar += '|';
        var warn = peak > 16 ? ' !!!' : (peak > 8 ? ' !' : '');
        var padCat = (cat + '         ').substring(0, 9);
        lines.push(padCat + ' ' + avg.toFixed(1).padStart(5) + 'ms  pk ' + peak.toFixed(1).padStart(5) + 'ms ' + bar + warn);
    }

    // Scene stats
    var ri = LIFE.renderer.info;
    lines.push('');
    lines.push('--- SCENE ---');
    lines.push('Draw calls: ' + ri.render.calls + '  triangles: ' + ri.render.triangles);
    lines.push('Geometries: ' + ri.memory.geometries + '  textures: ' + ri.memory.textures);
    lines.push('Programs:   ' + ri.programs.length);
    // Count shadow casters, total meshes, and unique materials (every 1s to avoid overhead)
    if (!LIFE._debugSceneStats || LIFE._debugSceneStatsTimer <= 0) {
        var _sc = 0, _tm = 0, _ms = {};
        LIFE.scene.traverse(function(obj) {
            if (obj.isMesh) {
                _tm++;
                if (obj.castShadow) _sc++;
                if (obj.material && obj.material.uuid) _ms[obj.material.uuid] = 1;
            }
        });
        LIFE._debugSceneStats = { meshes: _tm, shadowCasters: _sc, materials: Object.keys(_ms).length };
        LIFE._debugSceneStatsTimer = 1;
    }
    LIFE._debugSceneStatsTimer -= dt;
    var dss = LIFE._debugSceneStats;
    lines.push('Meshes:     ' + dss.meshes + '  shadow casters: ' + dss.shadowCasters);
    lines.push('Materials:  ' + dss.materials + ' unique');
    lines.push('NPCs: ' + (LIFE.npcs ? LIFE.npcs.length : 0) + '  scene children: ' + (LIFE.scene ? LIFE.scene.children.length : 0));
    var dpr = LIFE.renderer.getPixelRatio();
    var sz = LIFE.renderer.getSize(new THREE.Vector2());
    lines.push('Resolution: ' + Math.round(sz.x * dpr) + 'x' + Math.round(sz.y * dpr) + '  pixelRatio: ' + dpr);
    lines.push('Shadows:    ' + (LIFE.renderer.shadowMap.enabled ? LIFE.renderer.shadowMap.type + ' (0=Basic 1=PCF 2=PCFSoft)' : 'OFF'));
    lines.push('Antialias:  yes');

    // Spike log
    if (LIFE._perfSpikeLog.length > 0) {
        lines.push('');
        lines.push('--- FRAME SPIKES (>33ms) ---');
        var now = Date.now();
        for (var sli = LIFE._perfSpikeLog.length - 1; sli >= 0; sli--) {
            var sp = LIFE._perfSpikeLog[sli];
            var ago = ((now - sp.time) / 1000).toFixed(0);
            lines.push(ago + 's ago  ' + sp.ms + 'ms  cause: ' + sp.culprit);
        }
    }

    if (body) {
        var bv = body.velocity;
        var bp = body.position;
        lines.push('');
        lines.push('--- PLAYER BODY ---');
        lines.push('Body pos:  ' + bp.x.toFixed(2) + ', ' + bp.y.toFixed(2) + ', ' + bp.z.toFixed(2));
        lines.push('Body vel:  ' + bv.x.toFixed(2) + ', ' + bv.y.toFixed(2) + ', ' + bv.z.toFixed(2));
        lines.push('Offset:    ' + halfH.toFixed(3) + '  radius: ' + (LIFE.physics._playerRadius || 0).toFixed(3) + '  height: ' + (LIFE.getHeightForAge(LIFE.state.age)).toFixed(2));
        lines.push('Feet Y:    ' + (bp.y - halfH).toFixed(3));
        lines.push('Mass:      ' + body.mass + '  type: ' + body.type);
        lines.push('Material:  ' + (body.material ? body.material.name : 'none'));
        lines.push('Sleep:     ' + (body.sleepState === 2 ? 'SLEEPING' : 'awake'));
        lines.push('Group:     ' + body.collisionFilterGroup + '  mask: ' + body.collisionFilterMask);

        // Contacts
        var contacts = LIFE.physics.world.contacts;
        var playerContacts = 0;
        var contactBodies = [];
        for (var ci = 0; ci < contacts.length; ci++) {
            var c = contacts[ci];
            if (c.bi === body || c.bj === body) {
                playerContacts++;
                var other = c.bi === body ? c.bj : c.bi;
                var otherName = other === LIFE.physics._groundPlane ? 'GROUND' :
                                other.material ? other.material.name : 'unknown';
                if (contactBodies.indexOf(otherName) < 0) contactBodies.push(otherName);
            }
        }
        lines.push('Contacts:  ' + playerContacts + ' [' + contactBodies.join(', ') + ']');
    }

    if (LIFE.player) {
        var mp = LIFE.player.group.position;
        lines.push('');
        lines.push('--- MESH ---');
        lines.push('Mesh pos:  ' + mp.x.toFixed(2) + ', ' + mp.y.toFixed(2) + ', ' + mp.z.toFixed(2));
        if (body) {
            var drift = Math.sqrt(
                Math.pow(mp.x - body.position.x, 2) +
                Math.pow(mp.y - (body.position.y - halfH), 2) +
                Math.pow(mp.z - body.position.z, 2)
            );
            lines.push('Body→Mesh: ' + drift.toFixed(4) + ' drift');
        }
    }

    var s = LIFE.state;
    lines.push('');
    lines.push('--- STATE ---');
    lines.push('Grounded:  ' + (s.isGrounded ? 'YES' : 'NO'));
    lines.push('Phase:     ' + s.gamePhase);
    lines.push('HeldByP:   ' + s.heldByParent);
    lines.push('Age:       ' + s.age + '  height: ' + LIFE.getHeightForAge(s.age).toFixed(2));
    lines.push('Interior:  ' + (LIFE.world.insideInterior || 'none'));

    lines.push('');
    lines.push('--- WORLD ---');
    lines.push('Bodies:    ' + (LIFE.physics.world ? LIFE.physics.world.bodies.length : 0));
    lines.push('Static:    ' + LIFE.physics.staticBodies.length);
    lines.push('Zone:      ' + LIFE.physics.zoneBodies.length);
    lines.push('Dynamic:   ' + LIFE.physics.dynamicBodies.length);
    lines.push('Kinematic: ' + LIFE.physics.kinematicBodies.length);

    // Police dispatch info
    lines.push('');
    lines.push('--- POLICE ---');
    lines.push('Wanted:    ' + (s.wantedLevel || 0) + '  bounty: $' + (s.bounty || 0));
    lines.push('Dispatch:  ' + (s.policeDispatching ? 'YES (' + (s.policeDispatchTimer || 0).toFixed(1) + 's)' : 'no'));
    lines.push('Confront:  ' + (s.policeConfronting ? 'YES' : 'no'));
    var activeCops = 0;
    if (LIFE.police) LIFE.police.forEach(function(c) { if (c.alive) activeCops++; });
    lines.push('Cops:      ' + activeCops + ' pursuing');
    var swatCount = 0;
    if (LIFE.swat) {
        for (var si = 0; si < LIFE.swat.length; si++) {
            if (LIFE.swat[si].state === 'deployed') {
                swatCount += LIFE.swat[si].members.length;
            }
        }
    }
    if (s.swatDispatching || swatCount > 0) {
        lines.push('SWAT:      ' + (s.swatDispatching ? 'DISPATCHING (' + (s.swatDispatchTimer || 0).toFixed(1) + 's)' : swatCount + ' deployed'));
    }

    // Recent dispatch log
    if (LIFE._debugPoliceLog && LIFE._debugPoliceLog.length > 0) {
        lines.push('');
        lines.push('--- DISPATCH LOG ---');
        var now = Date.now();
        for (var dli = LIFE._debugPoliceLog.length - 1; dli >= 0; dli--) {
            var entry = LIFE._debugPoliceLog[dli];
            var ago = ((now - entry.time) / 1000).toFixed(0);
            var witnessStr = entry.witness ? ' | caught by: ' + entry.witness : '';
            lines.push(ago + 's ago | +' + entry.amount + ' wanted | ' + entry.reason + witnessStr);
            lines.push('        ' + entry.wanted + ' | dispatch: ' + (entry.dispatching ? 'yes (' + entry.timer + 's)' : 'no'));
        }
    }

    el.textContent = lines.join('\n');
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
