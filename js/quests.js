// ============================================================
// QUEST SYSTEM (Skyrim-style dynamic quests)
// ============================================================

LIFE.quests = {
    active: [],
    completed: [],
    failed: [],
    _nextId: 1,
    _offerTimer: 0,
    _offerCooldown: 45,
    _bannerTimer: 0,
    _bannerText: '',
    _bannerSubText: '',
    _compassTarget: null,
    logOpen: false
};

// ============================================================
// QUEST DEFINITIONS
// ============================================================
LIFE.QUEST_DEFS = [
    // ========== KID QUESTS (ages 3-12) ==========
    {
        id: 'hide_and_seek', title: 'Hide and Seek',
        desc: 'Hey, wanna play hide and seek? Go hide near the school and I\'ll find you!',
        type: 'good', giver: ['Kid', 'Classmate'],
        minAge: 3, maxAge: 10,
        objectives: [
            { type: 'go_to', zone: 'school', desc: 'Run and hide near the school', radius: 25 },
            { type: 'wait', duration: 15, desc: 'Stay hidden!' }
        ],
        reward: { happiness: 8, charisma: 2 },
        timeLimit: 300
    },
    {
        id: 'lost_toy', title: 'Lost Toy',
        desc: 'I lost my favorite toy somewhere near the houses... can you help me find it?',
        type: 'good', giver: ['Kid', 'Classmate'],
        minAge: 3, maxAge: 9,
        objectives: [
            { type: 'go_to', zone: 'home', desc: 'Search around the neighborhood', radius: 20 },
            { type: 'return', desc: 'Bring it back' }
        ],
        reward: { money: 2, rep: 3, happiness: 5, onComplete: function() { LIFE.state.livesHelped++; } },
        timeLimit: 300
    },
    {
        id: 'race_to_school', title: 'Race You!',
        desc: 'I bet I\'m faster than you! Race me to the school!',
        type: 'neutral', giver: ['Kid', 'Classmate'],
        minAge: 5, maxAge: 12,
        objectives: [
            { type: 'go_to', zone: 'school', desc: 'Race to the school!', radius: 20 }
        ],
        reward: { happiness: 5, health: 2, charisma: 1 },
        timeLimit: 120
    },
    {
        id: 'mom_errand', title: 'Mom\'s Errand',
        desc: 'Sweetie, can you run to the store and pick something up for me?',
        type: 'good', giver: ['Mom', 'Dad'],
        minAge: 6, maxAge: 12,
        objectives: [
            { type: 'go_to', zone: 'city', desc: 'Go to the store in the city', radius: 25 },
            { type: 'return', desc: 'Bring it back to Mom' }
        ],
        reward: { money: 5, rep: 2, happiness: 3, intelligence: 1 },
        timeLimit: 400
    },
    {
        id: 'teacher_helper', title: 'Teacher\'s Helper',
        desc: 'Could you help me carry these books to the school? You\'d be a big help!',
        type: 'good', giver: ['Teacher'],
        minAge: 5, maxAge: 12,
        objectives: [
            { type: 'go_to', zone: 'school', desc: 'Carry the books to school', radius: 20 }
        ],
        reward: { rep: 5, intelligence: 2, happiness: 3 },
        timeLimit: 300
    },
    {
        id: 'dare_tag', title: 'Double Dare',
        desc: 'I dare you to run all the way to the city and back! No way you\'re brave enough.',
        type: 'neutral', giver: ['Kid', 'Classmate'],
        minAge: 8, maxAge: 14,
        objectives: [
            { type: 'go_to', zone: 'city', desc: 'Run to the city', radius: 20 },
            { type: 'return', desc: 'Run all the way back' }
        ],
        reward: { charisma: 3, happiness: 4, health: 1 },
        timeLimit: 300
    },
    {
        id: 'bully_lunch', title: 'Lunch Money',
        desc: 'Give me your lunch money or I\'ll tell everyone your secret. Actually... go get me something from the store.',
        type: 'bad', giver: ['Kid', 'Classmate'],
        minAge: 8, maxAge: 14,
        objectives: [
            { type: 'go_to', zone: 'city', desc: 'Go to the store', radius: 20 },
            { type: 'return', desc: 'Bring it back to the bully' }
        ],
        reward: { rep: -3, happiness: -2, charisma: 1 },
        timeLimit: 300
    },

    // ========== GOOD QUESTS ==========
    {
        id: 'help_elderly', title: 'A Helping Hand',
        desc: 'I\'m too old to carry these groceries all the way home. Could you walk me there?',
        type: 'good', giver: ['Neighbor', 'Stranger'],
        minAge: 10, maxAge: 80,
        objectives: [
            { type: 'go_to', zone: 'home', desc: 'Walk the neighbor home', radius: 15 },
            { type: 'return', desc: 'Report back' }
        ],
        reward: { money: 15, rep: 8, happiness: 5, onComplete: function() { LIFE.state.livesHelped++; } },
        timeLimit: 300
    },
    {
        id: 'find_lost_pet', title: 'Lost Pet',
        desc: 'Please, my dog ran off! I think he went toward the event center. Can you find him?',
        type: 'good', giver: ['Kid', 'Neighbor', 'Stranger'],
        minAge: 6, maxAge: 70,
        objectives: [
            { type: 'go_to', zone: 'eventcenter', desc: 'Search the event center area', radius: 30 },
            { type: 'return', desc: 'Return the dog to the owner' }
        ],
        reward: { money: 30, rep: 12, happiness: 8, onComplete: function() { LIFE.state.livesHelped++; } },
        timeLimit: 600
    },
    {
        id: 'deliver_medicine', title: 'Medicine Delivery',
        desc: 'We have a patient who can\'t make it in. Can you pick up their prescription and deliver it?',
        type: 'good', giver: ['Doctor', 'Nurse', 'Pharmacist'],
        minAge: 14, maxAge: 80,
        objectives: [
            { type: 'go_to', zone: 'hospital_ext', desc: 'Pick up the prescription at the hospital', radius: 15 },
            { type: 'go_to', zone: 'home', desc: 'Deliver the medicine', radius: 15 },
            { type: 'return', desc: 'Let them know it\'s delivered' }
        ],
        reward: { money: 50, rep: 15, happiness: 5, health: 3, onComplete: function() { LIFE.state.livesHelped++; } },
        timeLimit: 480
    },
    {
        id: 'tutor_student', title: 'Tutoring Session',
        desc: 'There\'s a student really struggling. You\'re smart enough to help. Meet them at the school?',
        type: 'good', giver: ['Teacher', 'Professor', 'Kid', 'Student'],
        minAge: 12, maxAge: 70, reqInt: 30,
        objectives: [
            { type: 'go_to', zone: 'school', desc: 'Meet at the school', radius: 30 },
            { type: 'wait', duration: 30, desc: 'Tutor the student' },
            { type: 'return', desc: 'Report back' }
        ],
        reward: { money: 40, rep: 10, intelligence: 3, happiness: 3, onComplete: function() { LIFE.state.peopleMentored++; } },
        timeLimit: 600
    },
    {
        id: 'charity_run', title: 'Charity Fun Run',
        desc: 'We\'re doing a fun run for charity! Run through town and finish back here.',
        type: 'good', giver: ['Stranger', 'Neighbor', 'Coworker'],
        minAge: 10, maxAge: 65,
        objectives: [
            { type: 'go_to', zone: 'school', desc: 'Run to the school', radius: 20 },
            { type: 'go_to', zone: 'city', desc: 'Run through the city', radius: 20 },
            { type: 'return', desc: 'Cross the finish line' }
        ],
        reward: { money: 25, rep: 15, health: 5, happiness: 5, onComplete: function() { LIFE.state.volunteerHours++; } },
        timeLimit: 900
    },
    {
        id: 'escort_elder', title: 'Safe Escort',
        desc: 'I don\'t feel safe walking home alone. Would you escort me to the retirement community?',
        type: 'good', giver: ['Stranger', 'Neighbor'],
        minAge: 14, maxAge: 60,
        objectives: [
            { type: 'go_to', zone: 'retirement', desc: 'Walk them to the retirement community', radius: 25 },
            { type: 'return', desc: 'Report back' }
        ],
        reward: { money: 20, rep: 12, charisma: 2, happiness: 4, onComplete: function() { LIFE.state.livesHelped++; } },
        timeLimit: 480
    },
    {
        id: 'volunteer_cleanup', title: 'Community Cleanup',
        desc: 'The park is a mess. We could use another pair of hands. Wanna help clean up?',
        type: 'good', giver: ['Neighbor', 'Stranger'],
        minAge: 8, maxAge: 70,
        objectives: [
            { type: 'go_to', zone: 'city', desc: 'Go to the city park area', radius: 20 },
            { type: 'wait', duration: 45, desc: 'Clean up the area' },
            { type: 'return', desc: 'Let them know it\'s done' }
        ],
        reward: { money: 15, rep: 10, health: 2, happiness: 4, onComplete: function() { LIFE.state.volunteerHours++; } },
        timeLimit: 600
    },
    {
        id: 'donate_drive', title: 'Donation Drive',
        desc: 'We\'re collecting donations for families in need. Can you bring a box to the event center?',
        type: 'good', giver: ['Teacher', 'Professor', 'Neighbor'],
        minAge: 12, maxAge: 70,
        objectives: [
            { type: 'go_to', zone: 'eventcenter', desc: 'Bring donations to the event center', radius: 25 },
            { type: 'return', desc: 'Report back' }
        ],
        reward: { rep: 18, happiness: 6, charisma: 3, onComplete: function() { LIFE.state.charitableDonations += 50; LIFE.state.volunteerHours++; } },
        timeLimit: 480
    },

    // ========== BAD QUESTS ==========
    {
        id: 'steal_goods', title: 'Five-Finger Discount',
        desc: 'Hey... I need someone to grab some stuff from a store. I\'ll make it worth your while.',
        type: 'bad', giver: ['Dealer', 'Stranger'],
        minAge: 14, maxAge: 60,
        objectives: [
            { type: 'go_to', zone: 'city', desc: 'Go to the store in the city', radius: 20 },
            { type: 'return', desc: 'Bring the goods back' }
        ],
        reward: { money: 200, rep: -8, charisma: 1, onComplete: function() { LIFE.state.totalThefts++; LIFE.logCrime('Shoplifting'); if (Math.random() < 0.25) LIFE.addWanted(1); } },
        timeLimit: 480
    },
    {
        id: 'drug_delivery', title: 'Special Delivery',
        desc: 'I got a package needs delivering. Near the high school. Don\'t open it. Don\'t ask questions.',
        type: 'bad', giver: ['Dealer'],
        minAge: 16, maxAge: 50,
        objectives: [
            { type: 'go_to', zone: 'highschool', desc: 'Deliver the package near the high school', radius: 25 },
            { type: 'return', desc: 'Return to the dealer' }
        ],
        reward: { money: 500, rep: -12, onComplete: function() { LIFE.logCrime('Drug trafficking'); if (Math.random() < 0.3) LIFE.addWanted(2); } },
        timeLimit: 600
    },
    {
        id: 'intimidate_vendor', title: 'Collection Day',
        desc: 'A certain vendor owes some people money. Go "convince" him to pay up.',
        type: 'bad', giver: ['Dealer', 'Stranger'],
        minAge: 18, maxAge: 55,
        objectives: [
            { type: 'talk_to', npcType: 'Food Vendor', desc: 'Confront the vendor' },
            { type: 'return', desc: 'Report back' }
        ],
        reward: { money: 300, rep: -10, charisma: 2, onComplete: function() { LIFE.state.totalExtortions++; LIFE.logCrime('Extortion'); } },
        timeLimit: 480
    },
    {
        id: 'vandalize', title: 'Send a Message',
        desc: 'I need someone to tag a building near the school. Send a message, you know what I mean.',
        type: 'bad', giver: ['Dealer', 'Stranger', 'Inmate'],
        minAge: 13, maxAge: 40,
        objectives: [
            { type: 'go_to', zone: 'school', desc: 'Go to the school', radius: 20 },
            { type: 'wait', duration: 15, desc: 'Tag the wall' },
            { type: 'return', desc: 'Report back' }
        ],
        reward: { money: 100, rep: -6, onComplete: function() { LIFE.logCrime('Vandalism'); if (Math.random() < 0.2) LIFE.addWanted(1); } },
        timeLimit: 480
    },
    {
        id: 'frame_someone', title: 'Planted Evidence',
        desc: 'I need you to plant some stolen goods in someone\'s bag. Make it look convincing.',
        type: 'bad', giver: ['Dealer', 'Inmate'],
        minAge: 16, maxAge: 50,
        objectives: [
            { type: 'go_to', zone: 'city', desc: 'Find the target in the city', radius: 20 },
            { type: 'talk_to', npcType: 'Stranger', desc: 'Plant the evidence on a stranger' },
            { type: 'return', desc: 'Report back' }
        ],
        reward: { money: 400, rep: -15, onComplete: function() { LIFE.state.betrayals++; LIFE.logCrime('Framing'); } },
        timeLimit: 600
    },
    {
        id: 'lookout', title: 'Eyes Open',
        desc: 'I need someone to stand lookout while my boys do a job. Just keep your eyes open.',
        type: 'bad', giver: ['Dealer', 'Stranger'],
        minAge: 14, maxAge: 45,
        objectives: [
            { type: 'go_to', zone: 'city', desc: 'Go to the meeting point', radius: 15 },
            { type: 'wait', duration: 40, desc: 'Keep watch' },
            { type: 'return', desc: 'Report back' }
        ],
        reward: { money: 250, rep: -5, onComplete: function() { LIFE.logCrime('Accessory to robbery'); if (Math.random() < 0.2) LIFE.addWanted(1); } },
        timeLimit: 480
    },

    // ========== NEUTRAL QUESTS ==========
    {
        id: 'deliver_package', title: 'Package Delivery',
        desc: 'I need a package delivered to the city. It\'s nothing special, just don\'t drop it.',
        type: 'neutral', giver: ['Stranger', 'Neighbor', 'Coworker'],
        minAge: 10, maxAge: 70,
        objectives: [
            { type: 'go_to', zone: 'city', desc: 'Deliver the package to the city', radius: 20 },
            { type: 'return', desc: 'Let them know it\'s delivered' }
        ],
        reward: { money: 40, rep: 3, happiness: 2 },
        timeLimit: 480
    },
    {
        id: 'buy_supplies', title: 'Supply Run',
        desc: 'Hey, I need some supplies from the store. Pick them up and bring them back?',
        type: 'neutral', giver: ['Boss', 'Coworker', 'Teacher'],
        minAge: 12, maxAge: 65,
        objectives: [
            { type: 'go_to', zone: 'city', desc: 'Go to the store', radius: 20 },
            { type: 'return', desc: 'Bring the supplies back' }
        ],
        reward: { money: 30, rep: 5, intelligence: 1 },
        timeLimit: 480
    },
    {
        id: 'find_person', title: 'Missing Person',
        desc: 'My neighbor hasn\'t been heard from in days. Can you check the retirement area?',
        type: 'neutral', giver: ['Neighbor', 'Stranger', 'Mom', 'Dad'],
        minAge: 14, maxAge: 70,
        objectives: [
            { type: 'go_to', zone: 'retirement', desc: 'Check the retirement area', radius: 25 },
            { type: 'return', desc: 'Report back what you found' }
        ],
        reward: { money: 25, rep: 8, happiness: 3, onComplete: function() { LIFE.state.livesHelped++; } },
        timeLimit: 600
    },
    {
        id: 'college_tour', title: 'Campus Tour',
        desc: 'I\'m thinking about applying here. Can you show me around the campus?',
        type: 'neutral', giver: ['Professor', 'Student'],
        minAge: 18, maxAge: 30,
        objectives: [
            { type: 'go_to', zone: 'college', desc: 'Walk through the college campus', radius: 30 },
            { type: 'return', desc: 'Finish the tour' }
        ],
        reward: { money: 20, rep: 5, charisma: 2, happiness: 2 },
        timeLimit: 480
    }
];

// ============================================================
// QUEST MANAGEMENT
// ============================================================

LIFE.quests.start = function(questDef, giverNPC) {
    var quest = {
        id: LIFE.quests._nextId++,
        defId: questDef.id,
        title: questDef.title,
        desc: questDef.desc,
        type: questDef.type,
        objectives: [],
        currentObj: 0,
        giver: giverNPC ? { name: giverNPC.name, type: giverNPC.type } : null,
        giverPos: giverNPC ? { x: giverNPC.char.group.position.x, z: giverNPC.char.group.position.z } : null,
        reward: questDef.reward,
        timeLimit: questDef.timeLimit || 600,
        _elapsed: 0,
        _waitTimer: 0,
        _pendingReturn: false
    };

    for (var i = 0; i < questDef.objectives.length; i++) {
        var obj = questDef.objectives[i];
        quest.objectives.push({
            type: obj.type,
            zone: obj.zone || null,
            npcType: obj.npcType || null,
            desc: obj.desc,
            radius: obj.radius || 15,
            duration: obj.duration || 0,
            completed: false
        });
    }

    LIFE.quests.active.push(quest);

    // Skyrim-style: show big quest started banner
    LIFE.quests._showBanner('QUEST STARTED', quest.title);

    // Show first objective after a brief delay
    var firstObj = quest.objectives[0];
    if (firstObj) {
        setTimeout(function() {
            LIFE.quests._showObjectiveBanner(firstObj.desc);
        }, 2500);
    }

    if (LIFE.news) LIFE.news.add(quest.title + ' - ' + quest.desc, 'social');
    return quest;
};

LIFE.quests.canOffer = function(def) {
    var s = LIFE.state;
    if (s.age < def.minAge || s.age > def.maxAge) return false;
    if (def.reqInt && s.stats.intelligence < def.reqInt) return false;
    if (def.reqCha && s.stats.charisma < def.reqCha) return false;

    for (var i = 0; i < LIFE.quests.active.length; i++) {
        if (LIFE.quests.active[i].defId === def.id) return false;
    }
    if (LIFE.quests.completed.indexOf(def.id) >= 0) return false;
    if (LIFE.quests.failed.indexOf(def.id) >= 0) return false;

    return true;
};

LIFE.quests.getOfferForNPC = function(npc) {
    if (!npc || !npc.type) return null;
    if (LIFE.quests.active.length >= 3) return null;

    var eligible = [];
    for (var i = 0; i < LIFE.QUEST_DEFS.length; i++) {
        var def = LIFE.QUEST_DEFS[i];
        if (!LIFE.quests.canOffer(def)) continue;

        var giverMatch = false;
        for (var g = 0; g < def.giver.length; g++) {
            if (def.giver[g] === npc.type) { giverMatch = true; break; }
        }
        if (!giverMatch) continue;

        eligible.push(def);
    }

    if (eligible.length === 0) return null;
    return eligible[Math.floor(Math.random() * eligible.length)];
};

// Complete a quest — shows reward dialogue with NPC
LIFE.quests.complete = function(quest) {
    var reward = quest.reward;
    var s = LIFE.state;

    if (reward.money) s.money += reward.money;
    if (reward.rep) { s.reputation = Math.max(-100, Math.min(100, s.reputation + reward.rep)); LIFE.ui.showRepChange(reward.rep); }
    if (reward.happiness) s.stats.happiness = Math.min(100, s.stats.happiness + reward.happiness);
    if (reward.health) s.stats.health = Math.min(100, s.stats.health + reward.health);
    if (reward.intelligence) s.stats.intelligence = Math.min(100, s.stats.intelligence + reward.intelligence);
    if (reward.charisma) s.stats.charisma = Math.min(100, s.stats.charisma + reward.charisma);
    if (reward.onComplete) reward.onComplete();

    LIFE.quests.completed.push(quest.defId);

    var idx = LIFE.quests.active.indexOf(quest);
    if (idx >= 0) LIFE.quests.active.splice(idx, 1);

    // Skyrim-style: big QUEST COMPLETED banner
    LIFE.quests._showBanner('QUEST COMPLETED', quest.title);

    // Show reward breakdown
    var rewardParts = [];
    if (reward.money) rewardParts.push('+$' + reward.money);
    if (reward.rep > 0) rewardParts.push('+' + reward.rep + ' Rep');
    if (reward.rep < 0) rewardParts.push(reward.rep + ' Rep');
    if (reward.happiness) rewardParts.push('+' + reward.happiness + ' Happiness');
    if (reward.health) rewardParts.push('+' + reward.health + ' Health');
    if (reward.intelligence) rewardParts.push('+' + reward.intelligence + ' Intelligence');
    if (reward.charisma) rewardParts.push('+' + reward.charisma + ' Charisma');
    if (rewardParts.length > 0) {
        setTimeout(function() {
            LIFE.quests._showObjectiveBanner(rewardParts.join('  '));
        }, 2000);
    }

    LIFE.sounds.money && LIFE.sounds.money();
    LIFE.logMilestone('Completed quest: ' + quest.title, quest.type === 'bad' ? 'bad' : 'good');
};

LIFE.quests.fail = function(quest) {
    LIFE.quests.failed.push(quest.defId);
    var idx = LIFE.quests.active.indexOf(quest);
    if (idx >= 0) LIFE.quests.active.splice(idx, 1);
    LIFE.quests._showBanner('QUEST FAILED', quest.title);
};

// ============================================================
// SKYRIM-STYLE OBJECTIVE BANNER
// ============================================================
LIFE.quests._showBanner = function(title, subtitle) {
    var el = document.getElementById('questBanner');
    if (!el) return;
    el.querySelector('.qbTitle').textContent = title;
    el.querySelector('.qbSub').textContent = subtitle;
    // Force reflow to restart animation if already playing
    el.className = '';
    void el.offsetWidth;
    el.className = 'qbShow';
    clearTimeout(LIFE.quests._bannerTimeout);
    LIFE.quests._bannerTimeout = setTimeout(function() { el.className = ''; }, 3500);
};

LIFE.quests._showObjectiveBanner = function(text) {
    var el = document.getElementById('questObjBanner');
    if (!el) return;
    el.textContent = text;
    el.className = '';
    void el.offsetWidth;
    el.className = 'qobShow';
    clearTimeout(LIFE.quests._objBannerTimeout);
    LIFE.quests._objBannerTimeout = setTimeout(function() { el.className = ''; }, 3000);
};

// ============================================================
// QUEST UPDATE (called every frame)
// ============================================================
LIFE.quests.update = function(dt) {
    if (!LIFE.player || LIFE.state.gamePhase !== 'playing') return;

    var px = LIFE.player.group.position.x;
    var pz = LIFE.player.group.position.z;

    // Update compass target for first active quest
    LIFE.quests._compassTarget = null;

    for (var qi = LIFE.quests.active.length - 1; qi >= 0; qi--) {
        var quest = LIFE.quests.active[qi];
        quest._elapsed += dt;

        if (quest._elapsed > quest.timeLimit) {
            LIFE.quests.fail(quest);
            continue;
        }

        // Pending return: wait for player to talk to giver NPC (T key near them)
        if (quest._pendingReturn) {
            // Set compass to giver
            if (qi === 0 && quest.giverPos) {
                LIFE.quests._compassTarget = { x: quest.giverPos.x, z: quest.giverPos.z };
            }
            continue;
        }

        if (quest.currentObj >= quest.objectives.length) {
            LIFE.quests.complete(quest);
            continue;
        }

        var obj = quest.objectives[quest.currentObj];

        // Set compass target for first quest
        if (qi === 0) {
            if (obj.type === 'go_to') {
                var cp = LIFE.quests._getZonePos(obj.zone);
                if (cp) LIFE.quests._compassTarget = { x: cp.x, z: cp.z };
            } else if (obj.type === 'return' && quest.giverPos) {
                LIFE.quests._compassTarget = { x: quest.giverPos.x, z: quest.giverPos.z };
            }
        }

        if (obj.type === 'go_to') {
            var targetPos = LIFE.quests._getZonePos(obj.zone);
            if (targetPos) {
                var dx = px - targetPos.x;
                var dz = pz - targetPos.z;
                var dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < obj.radius) {
                    obj.completed = true;
                    quest.currentObj++;
                    LIFE.quests._advanceObjective(quest);
                }
            }
        } else if (obj.type === 'return') {
            if (quest.giverPos) {
                var rdx = px - quest.giverPos.x;
                var rdz = pz - quest.giverPos.z;
                var rdist = Math.sqrt(rdx * rdx + rdz * rdz);
                if (rdist < 12) {
                    // Check if this is the last objective
                    if (quest.currentObj === quest.objectives.length - 1) {
                        // Mark pending — need to talk to NPC
                        quest._pendingReturn = true;
                        LIFE.quests._showObjectiveBanner('Talk to ' + (quest.giver ? quest.giver.name : 'the quest giver') + ' to complete the quest');
                    } else {
                        obj.completed = true;
                        quest.currentObj++;
                        LIFE.quests._advanceObjective(quest);
                    }
                }
            } else {
                obj.completed = true;
                quest.currentObj++;
                LIFE.quests._advanceObjective(quest);
            }
        } else if (obj.type === 'wait') {
            var waitZone = quest.objectives[quest.currentObj - 1];
            var inArea = true;
            if (waitZone && waitZone.zone) {
                var wp = LIFE.quests._getZonePos(waitZone.zone);
                if (wp) {
                    var wdx = px - wp.x;
                    var wdz = pz - wp.z;
                    if (Math.sqrt(wdx * wdx + wdz * wdz) > (waitZone.radius || 20) + 10) {
                        inArea = false;
                        quest._waitTimer = 0;
                    }
                }
            }
            if (inArea) {
                quest._waitTimer += dt;
                if (quest._waitTimer >= obj.duration) {
                    obj.completed = true;
                    quest.currentObj++;
                    LIFE.quests._advanceObjective(quest);
                }
            }
        } else if (obj.type === 'talk_to') {
            var allNPCs = LIFE.getAllNPCs ? LIFE.getAllNPCs() : LIFE.npcs;
            for (var ni = 0; ni < allNPCs.length; ni++) {
                var npc = allNPCs[ni];
                if (!npc.alive || npc.type !== obj.npcType) continue;
                var ndx = px - npc.char.group.position.x;
                var ndz = pz - npc.char.group.position.z;
                if (Math.sqrt(ndx * ndx + ndz * ndz) < 5) {
                    obj.completed = true;
                    quest.currentObj++;
                    LIFE.quests._showObjectiveBanner('Talked to ' + npc.name);
                    LIFE.quests._advanceObjective(quest);
                    break;
                }
            }
        }
    }

    LIFE.quests._offerTimer += dt;
};

// When an objective completes, show the next one in big text
LIFE.quests._advanceObjective = function(quest) {
    if (quest.currentObj < quest.objectives.length) {
        var nextObj = quest.objectives[quest.currentObj];
        if (nextObj.type === 'return') {
            var giverName = quest.giver ? quest.giver.name : 'the quest giver';
            LIFE.quests._showObjectiveBanner('Return to ' + giverName);
        } else {
            LIFE.quests._showObjectiveBanner(nextObj.desc);
        }
    }
};

// Handle "return" objective completion via NPC talk
LIFE.quests.tryCompleteReturn = function(npc) {
    if (!npc) return false;
    for (var i = 0; i < LIFE.quests.active.length; i++) {
        var quest = LIFE.quests.active[i];
        if (!quest._pendingReturn) continue;
        if (!quest.giver) continue;

        // Match by name or type
        if (npc.name === quest.giver.name || npc.type === quest.giver.type) {
            // Show reward dialogue
            var reward = quest.reward;
            var rewardParts = [];
            if (reward.money) rewardParts.push('$' + reward.money);
            if (reward.rep > 0) rewardParts.push('+' + reward.rep + ' reputation');

            var thankTexts = [
                "Thanks for your help! Here's what I promised.",
                "You actually came through! Much appreciated.",
                "Well done. You've earned this.",
                "I knew I could count on you. Here you go.",
                "Great work! This is for you."
            ];
            var thankText = thankTexts[Math.floor(Math.random() * thankTexts.length)];
            if (rewardParts.length > 0) thankText += ' (' + rewardParts.join(' + ') + ')';

            // Mark the return objective complete
            var lastObj = quest.objectives[quest.currentObj];
            if (lastObj) lastObj.completed = true;
            quest.currentObj++;

            LIFE.dialogue.open(npc.name, thankText, [
                { text: 'Thanks!', effects: { happiness: 2 } },
                { text: 'No problem.', effects: {} }
            ], true);

            // Complete the quest after dialogue
            var capturedQuest = quest;
            setTimeout(function() {
                LIFE.quests.complete(capturedQuest);
            }, 500);

            return true;
        }
    }
    return false;
};

LIFE.quests._getZonePos = function(zone) {
    var def = LIFE.ZONE_DEFS[zone];
    if (def) return { x: def.cx, z: def.cz };
    if (zone === 'hospital_ext') return { x: -150, z: 0 };
    if (zone === 'police_station') return { x: -60, z: -80 };
    return null;
};

// ============================================================
// QUEST OFFER THROUGH DIALOGUE
// ============================================================
LIFE.quests.tryOfferQuest = function(npc) {
    if (!npc || LIFE.quests._offerTimer < LIFE.quests._offerCooldown) return false;
    if (LIFE.quests.active.length >= 3) return false;

    // Check if this NPC has a pending return first
    if (LIFE.quests.tryCompleteReturn(npc)) return true;

    // 30% chance to offer a quest
    if (Math.random() > 0.3) return false;

    var questDef = LIFE.quests.getOfferForNPC(npc);
    if (!questDef) return false;

    LIFE.quests._offerTimer = 0;

    var typeLabel = questDef.type === 'good' ? ' [Good Quest]' : questDef.type === 'bad' ? ' [Shady Quest]' : '';
    var rewardParts = [];
    if (questDef.reward.money) rewardParts.push('$' + questDef.reward.money);
    if (questDef.reward.rep > 0) rewardParts.push('+' + questDef.reward.rep + ' rep');

    var capturedDef = questDef;
    var capturedNPC = npc;

    LIFE.dialogue.open(npc.name, questDef.desc, [
        { text: 'Accept' + (rewardParts.length > 0 ? ' (' + rewardParts.join(', ') + ')' : '') + typeLabel,
          onSelect: function() {
            LIFE.quests.start(capturedDef, capturedNPC);
        }},
        { text: 'Not interested.' }
    ], true);

    return true;
};

// ============================================================
// QUEST LOG UI
// ============================================================
LIFE.quests.toggleLog = function() {
    LIFE.quests.logOpen = !LIFE.quests.logOpen;
    var panel = document.getElementById('questLog');
    if (!panel) return;

    if (LIFE.quests.logOpen) {
        LIFE.quests.refreshLogUI();
        panel.style.display = 'block';
        document.exitPointerLock();
    } else {
        panel.style.display = 'none';
    }
};

LIFE.quests.refreshLogUI = function() {
    var panel = document.getElementById('questLog');
    if (!panel) return;

    var html = '<div class="questLogHeader">QUEST LOG<span class="questLogClose" onclick="LIFE.quests.toggleLog()">[J / ESC]</span></div>';

    if (LIFE.quests.active.length === 0) {
        html += '<div class="questLogEmpty">No active quests.<br>Talk to people around town to find work.</div>';
    }

    for (var i = 0; i < LIFE.quests.active.length; i++) {
        var q = LIFE.quests.active[i];
        var typeClass = q.type === 'good' ? 'questGood' : q.type === 'bad' ? 'questBad' : 'questNeutral';
        var timeLeft = Math.max(0, q.timeLimit - q._elapsed);
        var timeMin = Math.floor(timeLeft / 60);
        var timeSec = Math.floor(timeLeft % 60);
        var typeIcon = q.type === 'good' ? '&#9733; ' : q.type === 'bad' ? '&#9760; ' : '';

        html += '<div class="questEntry ' + typeClass + '">';
        html += '<div class="questTitle">' + typeIcon + q.title + '</div>';
        html += '<div class="questDesc">' + q.desc + '</div>';

        if (q.giver) {
            html += '<div class="questGiver">Given by: ' + q.giver.name + '</div>';
        }

        for (var oi = 0; oi < q.objectives.length; oi++) {
            var obj = q.objectives[oi];
            var isCurrent = (oi === q.currentObj) && !q._pendingReturn;
            var completed = obj.completed;
            var marker = completed ? '&#10003;' : (isCurrent ? '&#9654;' : '&#9675;');
            var cls = completed ? 'objDone' : (isCurrent ? 'objCurrent' : 'objPending');

            var objText = obj.desc;
            if (obj.type === 'return') {
                objText = 'Return to ' + (q.giver ? q.giver.name : 'quest giver');
            }
            if (isCurrent && obj.type === 'wait' && obj.duration > 0) {
                var pct = Math.min(100, Math.floor((q._waitTimer / obj.duration) * 100));
                objText += ' (' + pct + '%)';
            }

            html += '<div class="questObj ' + cls + '">' + marker + ' ' + objText + '</div>';
        }

        // Show pending return status
        if (q._pendingReturn) {
            html += '<div class="questObj objCurrent">&#9654; Talk to ' + (q.giver ? q.giver.name : 'quest giver') + ' (press T nearby)</div>';
        }

        html += '<div class="questTime">Time left: ' + timeMin + ':' + (timeSec < 10 ? '0' : '') + timeSec + '</div>';

        var rewards = [];
        if (q.reward.money) rewards.push('$' + q.reward.money);
        if (q.reward.rep > 0) rewards.push('+' + q.reward.rep + ' rep');
        if (q.reward.rep < 0) rewards.push(q.reward.rep + ' rep');
        if (q.reward.happiness) rewards.push('+' + q.reward.happiness + ' happiness');
        if (rewards.length > 0) html += '<div class="questReward">Reward: ' + rewards.join(', ') + '</div>';

        html += '<div class="questAbandon" onclick="LIFE.quests.abandon(' + q.id + ')">Abandon Quest</div>';
        html += '</div>';
    }

    if (LIFE.quests.completed.length > 0) {
        html += '<div class="questCompleteCount">Quests completed: ' + LIFE.quests.completed.length + '</div>';
    }

    panel.innerHTML = html;
};

LIFE.quests.abandon = function(questId) {
    for (var i = 0; i < LIFE.quests.active.length; i++) {
        if (LIFE.quests.active[i].id === questId) {
            LIFE.quests.fail(LIFE.quests.active[i]);
            LIFE.quests.refreshLogUI();
            return;
        }
    }
};

// ============================================================
// QUEST HUD + COMPASS ARROW
// ============================================================
LIFE.quests.updateHUD = function() {
    var hud = document.getElementById('questHUD');
    if (!hud) return;

    if (LIFE.quests.active.length === 0) {
        hud.style.display = 'none';
        var arrow = document.getElementById('questArrow');
        if (arrow) arrow.style.display = 'none';
        return;
    }

    hud.style.display = 'block';
    var q = LIFE.quests.active[0];
    var obj = q.objectives[q.currentObj];

    var objText;
    if (q._pendingReturn) {
        objText = 'Talk to ' + (q.giver ? q.giver.name : 'quest giver') + ' (T)';
    } else if (obj) {
        objText = obj.desc;
        if (obj.type === 'return') {
            objText = 'Return to ' + (q.giver ? q.giver.name : 'quest giver');
        }
        if (obj.type === 'wait' && obj.duration > 0) {
            var pct = Math.min(100, Math.floor((q._waitTimer / obj.duration) * 100));
            objText += ' (' + pct + '%)';
        }
    } else {
        objText = 'Complete';
    }

    var timeLeft = Math.max(0, q.timeLimit - q._elapsed);
    var timeMin = Math.floor(timeLeft / 60);
    var timeSec = Math.floor(timeLeft % 60);
    var timeStr = timeMin + ':' + (timeSec < 10 ? '0' : '') + timeSec;
    var timeWarn = timeLeft < 60 ? ' style="color:#ef5350"' : '';

    var typeIcon = q.type === 'good' ? '&#9733;' : q.type === 'bad' ? '&#9760;' : '&#9679;';

    hud.innerHTML = '<div class="questHUDTitle">' + typeIcon + ' ' + q.title + '</div>' +
        '<div class="questHUDObj">' + objText + '</div>' +
        '<div class="questHUDTime"' + timeWarn + '>' + timeStr + '</div>';

    if (LIFE.quests.active.length > 1) {
        hud.innerHTML += '<div class="questHUDMore">+' + (LIFE.quests.active.length - 1) + ' more (J)</div>';
    }

    // Update directional compass arrow
    LIFE.quests._updateCompassArrow();
};

LIFE.quests._updateCompassArrow = function() {
    var arrow = document.getElementById('questArrow');
    if (!arrow) return;

    var target = LIFE.quests._compassTarget;
    if (!target || !LIFE.player) {
        arrow.style.display = 'none';
        return;
    }

    var px = LIFE.player.group.position.x;
    var pz = LIFE.player.group.position.z;
    var dx = target.x - px;
    var dz = target.z - pz;
    var dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 5) {
        arrow.style.display = 'none';
        return;
    }

    arrow.style.display = 'block';

    // Get camera yaw to make arrow screen-relative
    var camYaw = LIFE.state.playerRotY || 0;
    var angleToTarget = Math.atan2(dx, -dz);
    var relAngle = angleToTarget - camYaw;

    arrow.style.transform = 'rotate(' + (relAngle * 180 / Math.PI) + 'deg)';

    // Show distance
    var distText = dist < 100 ? Math.round(dist) + 'm' : Math.round(dist) + 'm';
    arrow.querySelector('.arrowDist').textContent = distText;

    // Color based on proximity
    var arrowEl = arrow.querySelector('.arrowIcon');
    if (dist < 20) arrowEl.style.color = '#4caf50';
    else if (dist < 50) arrowEl.style.color = '#ffeb3b';
    else arrowEl.style.color = '#fff';
};

// ============================================================
// RESET / YEAR ADVANCE
// ============================================================
LIFE.quests.reset = function() {
    LIFE.quests.active = [];
    LIFE.quests.completed = [];
    LIFE.quests.failed = [];
    LIFE.quests._nextId = 1;
    LIFE.quests._offerTimer = 0;
    LIFE.quests._compassTarget = null;
};

LIFE.quests.onYearAdvance = function() {
    LIFE.quests.failed = [];
    if (LIFE.quests.completed.length > 5) {
        LIFE.quests.completed = LIFE.quests.completed.slice(-3);
    }
};
