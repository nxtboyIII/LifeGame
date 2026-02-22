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
    criminalRecord: false, timesJailed: 0,
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
    purchasedOnce: [] // one-time purchase tracking
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
LIFE.police = [];

LIFE.addWanted = function(amount) {
    if (LIFE.state.age < 10) return;
    var old = LIFE.state.wantedLevel;
    LIFE.state.wantedLevel = Math.min(5, LIFE.state.wantedLevel + amount);
    LIFE.state.bounty += amount * 500; // Skyrim-style bounty accumulates
    LIFE.state.wantedTimer = 0;
    LIFE.state.wantedCooldown = 0;
    if (LIFE.state.wantedLevel > 0 && old === 0) {
        LIFE.sounds.siren();
    }
    LIFE.spawnPolice();
};

LIFE.spawnPolice = function() {
    LIFE.police.forEach(function(p) { LIFE.scene.remove(p.char.group); });
    LIFE.police = [];
    var count = LIFE.state.wantedLevel;
    if (count <= 0) return;
    // In open world, spawn police near the player (not at bounds edge)
    var px = LIFE.player ? LIFE.player.group.position.x : 0;
    var pz = LIFE.player ? LIFE.player.group.position.z : 0;
    var spawnDist = LIFE.world.built ? 20 : LIFE.state.bounds * 0.8;
    for (var i = 0; i < count; i++) {
        var angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        var x = px + Math.cos(angle) * spawnDist;
        var z = pz + Math.sin(angle) * spawnDist;
        var p = LIFE.createNPC('Police', x, z);
        p.speed = LIFE.getSpeedForAge(LIFE.state.age) * 1.5; // match player sprint
        p.health = 200;
        p.maxHealth = 200;
        p.isPolice = true;
        p.shootTimer = 0;
        LIFE.police.push(p);
    }
};

LIFE.despawnPolice = function() {
    LIFE.police.forEach(function(p) { LIFE.scene.remove(p.char.group); });
    LIFE.police = [];
};

LIFE.updatePolice = function(dt) {
    var state = LIFE.state;
    if (state.wantedLevel <= 0) return;
    var player = LIFE.player;
    if (!player || state.gamePhase !== 'playing') return;

    // siren
    state.wantedCooldown = (state.wantedCooldown || 0) + dt;
    if (state.wantedCooldown > 4) { state.wantedCooldown = 0; LIFE.sounds.siren(); }

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

    // check if all cops are dead - you escaped by fighting them off
    var aliveCops = 0;
    LIFE.police.forEach(function(c) { if (c.alive) aliveCops++; });
    if (aliveCops === 0 && LIFE.police.length > 0) {
        LIFE.ui.showPopup('Cops eliminated! Bounty: $' + state.bounty, '#ff9800');
        state.wantedLevel = 0;
        LIFE.despawnPolice();
        return;
    }

    // check escape by distance - if far from ALL cops, wanted decays faster
    var allFar = true;
    LIFE.police.forEach(function(c) {
        if (!c.alive) return;
        var edx = player.group.position.x - c.char.group.position.x;
        var edz = player.group.position.z - c.char.group.position.z;
        if (Math.sqrt(edx * edx + edz * edz) < 25) allFar = false;
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
            LIFE.despawnPolice();
            LIFE.ui.showPopup('Escaped! Bounty: $' + state.bounty, '#ff9800');
            return;
        }
        LIFE.spawnPolice();
    }

    LIFE.police.forEach(function(cop) {
        if (!cop.alive) return;
        var dx = player.group.position.x - cop.char.group.position.x;
        var dz = player.group.position.z - cop.char.group.position.z;
        var dist = Math.sqrt(dx * dx + dz * dz);

        if (dist > 1.8) {
            var s = cop.speed * dt;
            cop.char.group.position.x += (dx / dist) * s;
            cop.char.group.position.z += (dz / dist) * s;
            cop.char.group.rotation.y = Math.atan2(dx, dz);
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

        // police shoot at high wanted - fires real bullets
        if (state.wantedLevel >= 3 && dist < 20) {
            cop.shootTimer += dt;
            if (cop.shootTimer >= 2.5) {
                cop.shootTimer = 0;
                LIFE.sounds.gunshot();
                var h = cop.char.height || 1.8;
                var origin = new THREE.Vector3(
                    cop.char.group.position.x,
                    h * 0.7,
                    cop.char.group.position.z
                );
                var dir = new THREE.Vector3(dx, 0, dz).normalize();
                dir.x += (Math.random() - 0.5) * 0.12;
                dir.z += (Math.random() - 0.5) * 0.12;
                dir.normalize();
                LIFE.createBullet(origin, dir, true);
                LIFE.createMuzzleFlash(origin);
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
    if (state.age >= 18 && (state.kills >= 5 || (state.wantedLevel >= 5 && state.kills >= 3))) {
        LIFE.cleanupBullets();
        LIFE.despawnPolice();
        state.wantedLevel = 0;
        state.bounty = 0;
        state.criminalRecord = true;

        // confiscate items
        state.inventory = ['Fists'];
        state.equippedIndex = 0;
        state.hasGun = false;
        state.hasSwitchblade = false;

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

        LIFE.lockCursor();
        LIFE.sounds.arrest();
        return;
    }

    var years = Math.ceil(state.wantedLevel / 2) + state.kills * 12;
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
    var fine = Math.min(state.money, 500 * state.wantedLevel + 5000 * state.kills);
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
    state.bounty = 0; // bounty cleared by serving time
    state.reputation = Math.max(-100, state.reputation - 15);
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

    // clean up bullets
    LIFE.cleanupBullets();
    LIFE.despawnPolice();

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
    LIFE.ui.showJailScreen(years, state.jailFine);
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
};

LIFE.getEquipped = function() {
    return LIFE.state.inventory[LIFE.state.equippedIndex] || 'Fists';
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
            LIFE.world.exitInterior();
            LIFE.ui.showPopup('Left ' + LIFE.world.insideInterior, '#ff9800');
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
            var phase = 'classroom';
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
            var phase2 = 'classroom';
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
LIFE.SCHOOL_PHASES = [
    { name: 'classroom',  start: 0,   end: 600 },   // 10 min in class
    { name: 'schoolyard', start: 600,  end: 840 },   // 4 min recess/outside
    { name: 'home',       start: 840,  end: 1200 }   // 6 min at home
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

    if (state.dayPhase === 'classroom') {
        // 8 AM to 2 PM (360 minutes) over 600 seconds
        var totalMin = (dayTimer / 600) * 360;
        hour = 8 + Math.floor(totalMin / 60);
        minutes = Math.floor(totalMin % 60);
    } else if (state.dayPhase === 'schoolyard') {
        // 2 PM to 4 PM (120 minutes) over 240 seconds
        var totalMin2 = ((dayTimer - 600) / 240) * 120;
        hour = 14 + Math.floor(totalMin2 / 60);
        minutes = Math.floor(totalMin2 % 60);
    } else if (state.dayPhase === 'home') {
        // 4 PM to 10 PM (360 minutes) over 360 seconds
        var totalMin3 = ((dayTimer - 840) / 360) * 360;
        hour = 16 + Math.floor(totalMin3 / 60);
        minutes = Math.floor(totalMin3 % 60);
    } else {
        // full 24-hour cycle: 0:00 to 23:59
        var dayFrac = dayTimer / dayDur;
        var totalMin4 = dayFrac * 1440; // 24 * 60
        hour = Math.floor(totalMin4 / 60);
        minutes = Math.floor(totalMin4 % 60);
    }
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
    if (!expectedPhase) expectedPhase = 'classroom'; // safety fallback

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

    // Convert displayed hours to yearTimer seconds using current phase rate
    // Phase rates: yearTimer-seconds per displayed-minute
    var secsPerMin;
    if (LIFE.isSchoolAge(state.age) && state.dayPhase) {
        if (state.dayPhase === 'classroom') secsPerMin = 600 / 360;       // 1.667
        else if (state.dayPhase === 'schoolyard') secsPerMin = 240 / 120; // 2.0
        else secsPerMin = 360 / 360;                                       // 1.0 (home)
    } else {
        secsPerMin = LIFE.DAY_DURATION / 1440; // 0.833
    }
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
    if (LIFE.isSchoolAge(state.age)) {
        state.yearTimer = 100; // 9AM in classroom phase (100/600 * 360min + 8h = 9AM)
    } else {
        state.yearTimer = 450; // 9AM in 24hr cycle (450/1200 * 24h = 9AM)
    }

    if (state.age > LIFE.MAX_AGE) { state.deathCause = 'old age'; LIFE.triggerDeath(); return; }

    // aging health loss
    if (state.age > 60) state.stats.health = Math.max(0, state.stats.health - 1.5);
    else if (state.age > 40) state.stats.health = Math.max(0, state.stats.health - 0.5);

    // reputation affects happiness
    if (state.reputation > 30) state.stats.happiness = Math.min(100, state.stats.happiness + 0.5);
    else if (state.reputation < -30) state.stats.happiness = Math.max(0, state.stats.happiness - 0.5);

    // criminal record = harder life
    if (state.criminalRecord && state.career === null) {
        if (Math.random() < 0.3) { state.career = 'worker'; }
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

    // relationship decay - people you haven't interacted with recently
    var rels = state.relationships;
    for (var name in rels) {
        if (rels[name].level > 5) rels[name].level -= 1; // friendships slowly fade
        else if (rels[name].level < -5) rels[name].level += 0.5; // grudges heal very slowly
    }

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
                    state.dayPhase = 'classroom';
                    LIFE.transitionDayPhase('classroom');
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
                state.dayPhase = 'classroom';
                LIFE.transitionDayPhase('classroom');
            } else {
                state.dayPhase = null;
                LIFE.buildEnvironment(newStage);
                LIFE.spawnNPCs(newStage);
            }
            LIFE.player.group.position.set(0, 0, 0);
        }
    } else if (LIFE.isSchoolAge(state.age)) {
        // same school stage, new year - reset to classroom
        state.dayPhase = 'classroom';
        LIFE.transitionDayPhase('classroom');
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
    LIFE.ui.hideGameUI(); LIFE.ui.hideJailScreen(); LIFE.despawnPolice(); LIFE.cleanupBullets();
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
            // update date/time display
            LIFE.ui.updateDateTime();
            LIFE.economy.passiveIncome(dt);
            LIFE.updatePlayer(dt);
            LIFE.updateNPCs(dt);
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

            // stat cascades
            if (state.stats.happiness < 15) state.stats.health = Math.max(0, state.stats.health - 0.08 * dt);
            if (state.drugUses > 3) {
                state.stats.happiness = Math.max(0, state.stats.happiness - 0.04 * dt);
                state.stats.health = Math.max(0, state.stats.health - 0.03 * dt);
                state.stats.beauty = Math.max(0, state.stats.beauty - 0.01 * dt);
            }
            // beauty degrades slowly with old age
            if (state.age >= 50) {
                var beautyDecay = (state.age - 50) * 0.0003;
                state.stats.beauty = Math.max(5, state.stats.beauty - beautyDecay * dt);
            }
            if (state.friends === 0 && state.enemies > 3 && state.age > 10)
                state.stats.happiness = Math.max(0, state.stats.happiness - 0.02 * dt);
            if (state.married) state.stats.happiness = Math.min(100, state.stats.happiness + 0.008 * dt);
            if (state.hasKids) state.stats.happiness = Math.min(100, state.stats.happiness + 0.006 * dt);
            // family violence permanent trauma
            if (state.familyKiller) {
                state.stats.happiness = Math.max(0, state.stats.happiness - 0.05 * dt);
                state.stats.health = Math.max(0, state.stats.health - 0.02 * dt);
            } else if (state.familyAbuser) {
                state.stats.happiness = Math.max(0, state.stats.happiness - 0.02 * dt);
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
                if (eventRoll < 0.3) {
                    // inmate makes an advance / tries to fight
                    LIFE.dialogue.open('Inmate', "Hey fresh meat... give me your food rations or else.", [
                        { text: "Back off!", effects: { charisma: 2 }, rep: -2 },
                        { text: "Fine, take it.", effects: { happiness: -5, health: -3 }, rep: -5 },
                        { text: "Try me.", effects: { health: -8, charisma: 3 }, rep: 3 }
                    ], true);
                } else if (eventRoll < 0.5) {
                    // inmate attack - takes damage
                    LIFE.ui.showPopup('An inmate attacked you!', '#ff1744');
                    LIFE.damagePlayer(10 + Math.floor(Math.random() * 10), 'inmate attack');
                    LIFE.sounds.punch();
                } else if (eventRoll < 0.65) {
                    LIFE.dialogue.open('Inmate', "You want to join my gang? Could use someone like you.", [
                        { text: "Sure, I'm in.", effects: { charisma: 3 }, rep: -10 },
                        { text: "No thanks.", effects: {}, rep: 2 },
                        { text: "I work alone.", effects: { charisma: 1 }, rep: 0 }
                    ], true);
                } else if (eventRoll < 0.8) {
                    LIFE.dialogue.open('Guard', "Lights out! Get to your bed.", [
                        { text: "Yes sir.", effects: { happiness: -2 } },
                        { text: "Make me.", effects: { health: -5 }, rep: -5 }
                    ], true);
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
