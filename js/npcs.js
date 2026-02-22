// ============================================================
// NPC SYSTEM
// ============================================================
LIFE.npcs = [];

// NPC chat messages
LIFE.NPC_CHAT = {
    'Mom':       ["Be careful, sweetie!", "I'm so proud of you!", "Did you eat today?", "I love you!", "Come give me a hug!"],
    'Dad':       ["Stay strong, champ!", "Work hard!", "How's it going?", "I believe in you!", "Make me proud!"],
    'Sibling':   ["Wanna play?", "Stop copying me!", "You're so annoying!", "Let's go outside!"],
    'Teacher':   ["Pay attention, class!", "Pop quiz tomorrow!", "No running in the halls!", "Study hard!"],
    'Kid':       ["Tag! You're it!", "Wanna see something cool?", "Race you!", "I'm bored..."],
    'Student':   ["Did you do the homework?", "This class is so boring...", "Party tonight?", "I'm so tired..."],
    'Professor': ["Fascinating research...", "Office hours are open.", "Your thesis needs work.", "Brilliant observation!"],
    'Stranger':  ["Nice day, huh?", "Hey there.", "Excuse me...", "...", "Watch where you're going!"],
    'Neighbor':  ["Hello!", "Lovely weather!", "Keep it down, will ya?", "How's the family?"],
    'Old Friend':["Remember the old days?", "We should catch up!", "Time flies...", "Miss the good times!"],
    'Grandchild':["Grandma! Grandpa!", "Tell me a story!", "Can I have candy?", "Watch me!"],
    'Spouse':    ["Love you!", "What's for dinner?", "Let's go out tonight!", "You look nice today!"],
    'Your Child':["Mom! Dad! Look!", "Can I have a snack?", "I drew a picture!", "Are we there yet?"],
    'Dealer':    ["Psst... got the goods.", "Looking for something?", "I got what you need...", "Keep it quiet."],
    'Coworker':  ["Coffee break?", "Meetings all day...", "The boss is coming!", "TGIF!"],
    'Boss':      ["Get back to work!", "Good job today.", "Need that report ASAP.", "Let's discuss your performance."],
    'Inmate':    ["Don't mess with me.", "How long you in for?", "Keep your head down.", "First time?"],
    'Doctor':    ["Let me check your vitals.", "How are you feeling?", "Deep breaths now.", "We'll get you sorted out."],
    'Nurse':     ["Are you comfortable?", "Need anything?", "Rest up!", "Doctor will be with you shortly."]
};

LIFE.getNPCChatMessage = function(npc) {
    var state = LIFE.state;
    var rel = state.relationships[npc.name];
    var relLevel = rel ? rel.level : 0;

    // contextual messages override
    if (state.wantedLevel > 0 && !npc.isPolice && npc.type !== 'Dealer') {
        var scared = ["Someone call the police!", "Stay away!", "Help! Help!", "Oh no...", "What's happening?!"];
        return scared[Math.floor(Math.random() * scared.length)];
    }
    if (state.reputation <= -60 && npc.type !== 'Mom' && npc.type !== 'Dad' && npc.type !== 'Dealer') {
        var fear = ["Don't come near me...", "I know who you are.", "Please don't hurt me...", "Stay back!"];
        return fear[Math.floor(Math.random() * fear.length)];
    }
    if (relLevel >= 50) {
        var friendly = ["Hey, best friend!", "Always good to see you!", "You're the best!"];
        return friendly[Math.floor(Math.random() * friendly.length)];
    }
    if (relLevel <= -50) {
        var hostile = ["I hate you.", "Get lost.", "Don't talk to me.", "You disgust me."];
        return hostile[Math.floor(Math.random() * hostile.length)];
    }
    if (state.stats.health < 20 && npc.type !== 'Dealer') {
        return "You don't look so good...";
    }

    var msgs = LIFE.NPC_CHAT[npc.type];
    if (!msgs) msgs = ["...", "Hey.", "Nice day."];
    return msgs[Math.floor(Math.random() * msgs.length)];
};

LIFE.drawChatBubble = function(npc, text) {
    var ctx = npc.chatCtx;
    var canvas = npc.chatCanvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // bubble background
    var x = 10, y = 10, w = canvas.width - 20, bh = canvas.height - 35, r = 15;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + bh - r);
    ctx.quadraticCurveTo(x + w, y + bh, x + w - r, y + bh);
    ctx.lineTo(x + w / 2 + 10, y + bh);
    ctx.lineTo(x + w / 2, y + bh + 18);
    ctx.lineTo(x + w / 2 - 10, y + bh);
    ctx.lineTo(x + r, y + bh);
    ctx.quadraticCurveTo(x, y + bh, x, y + bh - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();
    // text
    ctx.fillStyle = '#333';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, y + bh / 2 + 8, w - 20);
    npc.chatTexture.needsUpdate = true;
};

LIFE.createNPC = function(type, x, z, npcName, forceGender) {
    var isChild = type.includes('Kid') || type.includes('Grandchild') || type === 'Sibling';
    var isStudent = type.includes('Student');
    var isPolice = type === 'Police';
    var isDealer = type === 'Dealer';
    var isHiring = type.indexOf('Hiring') === 0;
    var isInmate = type === 'Inmate';
    // individual name for relationship tracking
    var individualName = npcName || type;
    var h = isChild ? 0.7 + Math.random() * 0.4
        : (isStudent ? 1.5 + Math.random() * 0.3
        : 1.6 + Math.random() * 0.2);
    if (isPolice) h = 1.8;
    var skin = LIFE.SKIN_COLORS[Math.floor(Math.random() * LIFE.SKIN_COLORS.length)];
    var isDoctor = type === 'Doctor';
    var isNurse = type === 'Nurse';
    var clothes = isPolice ? 0x1a237e
        : isDealer ? 0x212121
        : isHiring ? 0x1565c0
        : isInmate ? 0xff6f00
        : isDoctor ? 0xfafafa
        : isNurse ? 0x90caf9
        : LIFE.CLOTHES_COLORS[Math.floor(Math.random() * LIFE.CLOTHES_COLORS.length)];
    // determine gender for hair
    var isFemale;
    if (forceGender !== undefined) {
        isFemale = forceGender;
    } else if (type === 'Mom') {
        isFemale = true;
    } else if (type === 'Dad') {
        isFemale = false;
    } else if (type === 'Spouse') {
        isFemale = LIFE.state.playerGender !== 'F';
    } else if (type === 'Your Child') {
        isFemale = Math.random() < 0.5;
    } else if (isPolice || isDealer || isInmate) {
        isFemale = false;
    } else if (isNurse) {
        isFemale = Math.random() < 0.7; // nurses mostly female
    } else {
        isFemale = Math.random() < 0.5;
    }
    var ch = LIFE.createCharacter(h, skin, clothes, false, { female: isFemale && h > 0.5 });
    ch.group.position.set(x, 0, z);
    ch.group.rotation.y = Math.random() * Math.PI * 2;
    LIFE.scene.add(ch.group);

    // police hat
    if (isPolice) {
        var hat = new THREE.Mesh(
            new THREE.BoxGeometry(0.28, 0.08, 0.28),
            new THREE.MeshPhongMaterial({ color: 0x0d47a1 })
        );
        hat.position.y = h + 0.28;
        ch.group.add(hat);
        var brim = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 0.02, 0.35),
            new THREE.MeshPhongMaterial({ color: 0x0d47a1 })
        );
        brim.position.y = h + 0.24;
        ch.group.add(brim);
    }

    // dealer hood (dark box on head)
    if (isDealer) {
        var hood = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.18, 0.3),
            new THREE.MeshPhongMaterial({ color: 0x212121 })
        );
        hood.position.y = h + 0.26;
        ch.group.add(hood);
    }

    // name label
    var displayName = isHiring ? type.replace('Hiring ', '') + ' (Hiring)'
        : (npcName && npcName !== type) ? npcName : type;
    var canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 64;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = isPolice ? 'rgba(13,71,161,0.7)'
        : isDealer ? 'rgba(33,33,33,0.8)'
        : isHiring ? 'rgba(21,101,192,0.7)'
        : isInmate ? 'rgba(255,111,0,0.7)'
        : isDoctor ? 'rgba(76,175,80,0.7)'
        : isNurse ? 'rgba(33,150,243,0.7)'
        : 'rgba(0,0,0,0.5)';
    ctx.fillRect(4, 4, 248, 56);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(displayName, 128, 42);
    var texture = new THREE.CanvasTexture(canvas);
    var spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    var nameSprite = new THREE.Sprite(spriteMat);
    nameSprite.position.y = h + 0.3;
    nameSprite.scale.set(isHiring ? 1.4 : 1, 0.25, 1);
    ch.group.add(nameSprite);

    // health bar
    var hpCanvas = document.createElement('canvas');
    hpCanvas.width = 128; hpCanvas.height = 16;
    var hpCtx = hpCanvas.getContext('2d');
    hpCtx.fillStyle = '#333'; hpCtx.fillRect(0, 0, 128, 16);
    hpCtx.fillStyle = '#4caf50'; hpCtx.fillRect(2, 2, 124, 12);
    var hpTexture = new THREE.CanvasTexture(hpCanvas);
    var hpSpriteMat = new THREE.SpriteMaterial({ map: hpTexture, transparent: true, depthTest: false });
    var hpSprite = new THREE.Sprite(hpSpriteMat);
    hpSprite.position.y = h + 0.1; hpSprite.scale.set(0.7, 0.07, 1);
    hpSprite.visible = false;
    ch.group.add(hpSprite);

    // chat bubble sprite
    var chatCanvas = document.createElement('canvas');
    chatCanvas.width = 512; chatCanvas.height = 128;
    var chatCtx = chatCanvas.getContext('2d');
    var chatTexture = new THREE.CanvasTexture(chatCanvas);
    var chatMat = new THREE.SpriteMaterial({ map: chatTexture, transparent: true, depthTest: false });
    var chatSprite = new THREE.Sprite(chatMat);
    chatSprite.position.y = h + 0.65;
    chatSprite.scale.set(2.5, 0.6, 1);
    chatSprite.visible = false;
    ch.group.add(chatSprite);

    // ring
    var ringGeo = new THREE.RingGeometry(0.4, 0.5, 16);
    var ringMat = new THREE.MeshBasicMaterial({ color: isPolice ? 0xff1744 : (isDealer ? 0xff9800 : (isHiring ? 0x2196f3 : 0x4fc3f7)), transparent: true, opacity: 0, side: THREE.DoubleSide });
    var ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.02;
    ch.group.add(ring);

    // assign gender for romance system
    var gender = Math.random() < 0.5 ? 'M' : 'F';
    if (type === 'Mom' || type === 'Spouse') gender = 'F';
    if (type === 'Dad' || type === 'Boss') gender = 'M';

    var maxHp = isPolice ? 200 : 100;
    return {
        char: ch, type: type, name: individualName, gender: gender,
        target: new THREE.Vector3(x + (Math.random()-0.5)*10, 0, z + (Math.random()-0.5)*10),
        waiting: false, waitTimer: Math.random()*3,
        speed: isChild ? 1.5 : (isPolice ? 7 : (isHiring ? 0 : (isInmate ? 0.6 : 1.0 + Math.random()*0.5))),
        walkTime: Math.random()*10, reacting: 0,
        ring: ring, ringMat: ringMat, nameSprite: nameSprite,
        health: maxHp, maxHealth: maxHp, alive: true, isPolice: isPolice,
        hpSprite: hpSprite, hpCanvas: hpCanvas, hpCtx: hpCtx, hpTexture: hpTexture,
        chatSprite: chatSprite, chatCanvas: chatCanvas, chatCtx: chatCtx, chatTexture: chatTexture,
        chatTimer: 0, chatCooldown: 3 + Math.random() * 5,
        shootTimer: 0,
        fleeing: false, fleeTimer: 0,
        isDealer: isDealer, isHiring: isHiring,
        stayNear: isHiring ? new THREE.Vector3(x, 0, z) : null
    };
};

// Check if a position is inside any collider
LIFE.isInsideCollider = function(x, z) {
    for (var i = 0; i < LIFE.colliders.length; i++) {
        var c = LIFE.colliders[i];
        if (x > c.minX - 0.5 && x < c.maxX + 0.5 && z > c.minZ - 0.5 && z < c.maxZ + 0.5) return true;
    }
    return false;
};

LIFE.updateNPCHealthBar = function(npc) {
    var pct = npc.health / npc.maxHealth;
    var ctx = npc.hpCtx;
    ctx.clearRect(0, 0, 128, 16);
    ctx.fillStyle = '#333'; ctx.fillRect(0, 0, 128, 16);
    if (pct > 0.5) ctx.fillStyle = '#4caf50';
    else if (pct > 0.25) ctx.fillStyle = '#ff9800';
    else ctx.fillStyle = '#f44336';
    ctx.fillRect(2, 2, Math.max(0, 124 * pct), 12);
    npc.hpTexture.needsUpdate = true;
    npc.hpSprite.visible = (pct < 1 && npc.alive);
};

LIFE.damageNPC = function(npc, amount) {
    if (!npc || !npc.alive) return;
    npc.health = Math.max(0, npc.health - amount);
    LIFE.updateNPCHealthBar(npc);
    npc.reacting = 1.5;
    if (npc.health <= 0) LIFE.killNPC(npc);
};

LIFE.killNPC = function(npc) {
    npc.alive = false;
    npc.hpSprite.visible = false;
    npc.nameSprite.visible = false;
    npc.ring.visible = false;
    LIFE.state.kills++;
    npc.char.group.rotation.x = -Math.PI / 2;
    npc.char.group.position.y = 0.2;

    var state = LIFE.state;
    var isFamily = (npc.type === 'Mom' || npc.type === 'Dad' || npc.type === 'Sibling' ||
        npc.type === 'Spouse' || npc.type === 'Your Child');

    var repLoss = -20;
    if (npc.isPolice) {
        repLoss = -10;
        LIFE.addWanted(3);
        var idx = LIFE.police.indexOf(npc);
        if (idx >= 0) LIFE.police.splice(idx, 1);
    } else if (isFamily) {
        repLoss = -60;
        state.stats.happiness = Math.max(0, state.stats.happiness - 35);
        state.stats.charisma = Math.max(0, state.stats.charisma - 10);
        LIFE.addWanted(5); // max wanted for killing family

        // permanent trauma
        state.familyKiller = true;
        state.familyAbuser = true;

        // track which family members were killed
        if (!state.killedFamily) state.killedFamily = [];
        state.killedFamily.push(npc.type);

        // specific consequences
        if (npc.type === 'Mom' || npc.type === 'Dad') {
            state.friends = 0;
            state.enemies += 3;
        } else if (npc.type === 'Spouse') {
            state.married = false;
            state.spouseName = null;
            state.enemies += 2;
        } else if (npc.type === 'Your Child') {
            state.friends = 0;
            state.enemies += 5;
            state.stats.happiness = 0;
        }
    } else if (npc.type === 'Kid' || npc.type === 'Grandchild') {
        repLoss = -50;
        state.stats.happiness = Math.max(0, state.stats.happiness - 20);
        LIFE.addWanted(5);
    } else {
        LIFE.addWanted(3);
    }
    state.reputation = Math.max(-100, state.reputation + repLoss);
    LIFE.ui.showRepChange(repLoss);
    state.enemies++;
    LIFE.sounds.npcDeath();
    LIFE.ui.showPopup(npc.name + ' has died!', '#ff1744');
    LIFE.updateRelationship(npc.name, -100);
    if (state.nearestNPC === npc) state.nearestNPC = null;

    // nearby NPCs witness the kill and flee
    LIFE.checkWitnesses(npc);
};

LIFE.spawnNPCs = function(stage) {
    LIFE.npcs.forEach(function(n) { LIFE.scene.remove(n.char.group); });
    LIFE.npcs = [];
    var names = (LIFE.NPC_NAMES[stage] || []).slice();
    var b = LIFE.getBoundsForStage(stage) * 0.6;

    // dynamic family NPCs - only in appropriate stages (NOT jail, school, etc.)
    var familyStages = { city: true, retirement: true, home: true, playerhome: true };
    if (familyStages[stage] && LIFE.state.married && LIFE.state.age >= 20) names.push('Spouse');
    if (familyStages[stage] && LIFE.state.hasKids) {
        var kidsToShow = Math.min(LIFE.state.childCount || 1, 3);
        for (var ki = 0; ki < kidsToShow; ki++) {
            names.push('Your Child');
        }
    }

    // dynamic work NPCs in city
    if (stage === 'city') {
        var career = LIFE.state.career;
        if (career && career !== 'none') {
            names.push('Coworker');
            names.push('Coworker');
            names.push('Boss');
        }
    }

    // spawn regular NPCs with individual names (gendered)
    var usedNames = {};
    var childIndex = 0;
    names.forEach(function(npcType) {
        var x, z, safe, tries = 0;
        do {
            x = (Math.random()-0.5)*b*2;
            z = (Math.random()-0.5)*b*2;
            safe = Math.sqrt(x*x+z*z) >= 3;
            if (safe) {
                for (var ci = 0; ci < LIFE.colliders.length; ci++) {
                    var c = LIFE.colliders[ci];
                    if (x > c.minX - 0.5 && x < c.maxX + 0.5 && z > c.minZ - 0.5 && z < c.maxZ + 0.5) {
                        safe = false; break;
                    }
                }
            }
            tries++;
        } while (!safe && tries < 30);

        // pre-determine gender for name selection
        var npcFemale;
        if (npcType === 'Mom') npcFemale = true;
        else if (npcType === 'Dad') npcFemale = false;
        else if (npcType === 'Spouse') npcFemale = LIFE.state.playerGender !== 'F';
        else if (npcType === 'Your Child') npcFemale = Math.random() < 0.5;
        else if (npcType === 'Police' || npcType === 'Dealer' || npcType === 'Inmate') npcFemale = false;
        else npcFemale = Math.random() < 0.5;

        var individualName = npcType;
        if (npcType === 'Spouse' && LIFE.state.spouseName) {
            individualName = LIFE.state.spouseName;
        } else if (npcType === 'Your Child' && LIFE.state.childNames && LIFE.state.childNames[childIndex]) {
            individualName = LIFE.state.childNames[childIndex];
            childIndex++;
        } else if (LIFE.NPC_NEEDS_NAME[npcType]) {
            // pick from gendered name pool
            var pool = npcFemale ? LIFE.FEMALE_NAMES : LIFE.MALE_NAMES;
            var attempts = 0;
            do {
                individualName = pool[Math.floor(Math.random() * pool.length)];
                attempts++;
            } while (usedNames[individualName] && attempts < 50);
            usedNames[individualName] = true;
        }
        LIFE.npcs.push(LIFE.createNPC(npcType, x, z, individualName, npcFemale));
    });

    // spawn Hiring Manager NPCs near job buildings in city
    if (stage === 'city' && LIFE.JOB_BUILDINGS) {
        LIFE.JOB_BUILDINGS.forEach(function(jb) {
            var hireNPC = LIFE.createNPC('Hiring ' + jb.label, jb.x, jb.z + 6);
            hireNPC.careerType = jb.career;
            LIFE.npcs.push(hireNPC);
        });
    }

    // spawn inmates in jail
    if (stage === 'jail') {
        var inmateName = LIFE.NPC_FIRST_NAMES[Math.floor(Math.random() * LIFE.NPC_FIRST_NAMES.length)];
        LIFE.npcs.push(LIFE.createNPC('Inmate', 2, -2, inmateName));
    }
};

LIFE.NPC_DIALOGUES = LIFE.NPC_DIALOGUES || {};
LIFE.NPC_DIALOGUES['Spouse'] = [
    { text: "I love spending time with you.", options: [
        { text: "I love you too!", effects: { happiness: 5 }, rep: 2 },
        { text: "Want to go on a date? ($50)", effects: { happiness: 4, charisma: 2 }, cost: 50, rep: 3 }
    ]},
    { text: "Should we save up for something special?", options: [
        { text: "Let's save for a vacation!", effects: { happiness: 2 }, rep: 1 },
        { text: "I think we're doing great!", effects: { happiness: 3 }, rep: 2 }
    ]},
    { text: "How about we have a baby?", options: [
        { text: "I'd love that!", effects: { happiness: 5 }, rep: 5, haveKid: true },
        { text: "Not yet, maybe later", effects: { happiness: 1 }, rep: 0 },
        { text: "Let's enjoy just us for now", effects: { happiness: 3 }, rep: 1 }
    ]},
    { text: "Should we invest in our future?", options: [
        { text: "Let's look at properties!", effects: { intelligence: 1 }, rep: 2, openProperty: true },
        { text: "Maybe some investments?", effects: { intelligence: 1 }, rep: 2, openInvest: true },
        { text: "We're doing fine as is!", effects: { happiness: 2 }, rep: 1 }
    ]}
];
LIFE.NPC_DIALOGUES['Your Child'] = [
    { text: "Mom/Dad! Look what I drew!", options: [
        { text: "That's amazing! I'm so proud!", effects: { happiness: 4 }, rep: 3 },
        { text: "Very nice! Want ice cream? ($10)", effects: { happiness: 5 }, cost: 10, rep: 2 }
    ]},
    { text: "Can I have some money for school? ($20)", options: [
        { text: "Of course, here you go!", effects: { happiness: 2 }, cost: 20, rep: 2 },
        { text: "Let's talk about earning it", effects: { intelligence: 2 }, rep: 1 }
    ]}
];

LIFE.updateNPCs = function(dt) {
    var bounds = LIFE.state.bounds;
    var nearestNPC = LIFE.state.nearestNPC;
    var player = LIFE.player;
    LIFE.npcs.forEach(function(npc) {
        if (!npc.alive) return;
        var isNearest = (npc === nearestNPC);
        npc.ringMat.opacity += ((isNearest ? 0.6 : 0) - npc.ringMat.opacity) * 0.1;
        if (isNearest) npc.ring.rotation.z += dt * 2;

        // CHAT BUBBLES
        if (player && npc.chatSprite) {
            var cdx = player.group.position.x - npc.char.group.position.x;
            var cdz = player.group.position.z - npc.char.group.position.z;
            var cdist = Math.sqrt(cdx * cdx + cdz * cdz);
            if (cdist < 8 && !npc.fleeing && npc.alive) {
                npc.chatCooldown -= dt;
                if (npc.chatCooldown <= 0 && !npc.chatSprite.visible) {
                    var msg = LIFE.getNPCChatMessage(npc);
                    LIFE.drawChatBubble(npc, msg);
                    npc.chatSprite.visible = true;
                    npc.chatTimer = 3;
                    npc.chatCooldown = 8 + Math.random() * 12;
                }
                if (npc.chatSprite.visible) {
                    npc.chatTimer -= dt;
                    if (npc.chatTimer <= 0) npc.chatSprite.visible = false;
                }
            } else {
                npc.chatSprite.visible = false;
            }
        }

        // check relationship-based behavior
        var rel = LIFE.state.relationships[npc.name];
        var relLevel = rel ? rel.level : 0;

        // flee timer (from witnessing violence)
        if (npc.fleeing && npc.fleeTimer > 0) {
            npc.fleeTimer -= dt;
            if (player) {
                var fdx = npc.char.group.position.x - player.group.position.x;
                var fdz = npc.char.group.position.z - player.group.position.z;
                var fdist = Math.sqrt(fdx * fdx + fdz * fdz);
                if (fdist > 0.5) {
                    var fs = 4 * dt; // flee fast
                    npc.char.group.position.x += (fdx / fdist) * fs;
                    npc.char.group.position.z += (fdz / fdist) * fs;
                    npc.char.group.rotation.y = Math.atan2(-fdx, -fdz);
                    npc.walkTime += dt * 12;
                    var fswing = Math.sin(npc.walkTime) * 0.6;
                    npc.char.parts.leftLeg.rotation.x = fswing;
                    npc.char.parts.rightLeg.rotation.x = -fswing;
                    npc.char.parts.leftArm.rotation.x = -fswing * 0.5;
                    npc.char.parts.rightArm.rotation.x = fswing * 0.5;
                }
            }
            if (npc.fleeTimer <= 0) npc.fleeing = false;
            // clamp to bounds and collisions
            npc.char.group.position.x = Math.max(-bounds, Math.min(bounds, npc.char.group.position.x));
            npc.char.group.position.z = Math.max(-bounds, Math.min(bounds, npc.char.group.position.z));
            LIFE.resolveCollisions(npc.char.group.position);
            return;
        }

        // NPCs with very negative relationship flee from player
        if (relLevel <= -50 && player && !npc.reacting) {
            var edx = player.group.position.x - npc.char.group.position.x;
            var edz = player.group.position.z - npc.char.group.position.z;
            var edist = Math.sqrt(edx * edx + edz * edz);
            if (edist < 8) {
                var es = 3 * dt;
                npc.char.group.position.x -= (edx / edist) * es;
                npc.char.group.position.z -= (edz / edist) * es;
                npc.char.group.rotation.y = Math.atan2(-edx, -edz);
                npc.walkTime += dt * 9;
                var eswing = Math.sin(npc.walkTime) * 0.5;
                npc.char.parts.leftLeg.rotation.x = eswing;
                npc.char.parts.rightLeg.rotation.x = -eswing;
                npc.char.parts.leftArm.rotation.x = -eswing * 0.4;
                npc.char.parts.rightArm.rotation.x = eswing * 0.4;
                npc.char.group.position.x = Math.max(-bounds, Math.min(bounds, npc.char.group.position.x));
                npc.char.group.position.z = Math.max(-bounds, Math.min(bounds, npc.char.group.position.z));
                LIFE.resolveCollisions(npc.char.group.position);
                return;
            }
        }

        // NPCs with bad rep awareness - feared player makes them nervous
        if (LIFE.state.reputation <= -50 && player && !npc.isPolice) {
            var rdx = player.group.position.x - npc.char.group.position.x;
            var rdz = player.group.position.z - npc.char.group.position.z;
            var rdist = Math.sqrt(rdx * rdx + rdz * rdz);
            if (rdist < 6) {
                var rs = 1.5 * dt;
                npc.char.group.position.x -= (rdx / rdist) * rs;
                npc.char.group.position.z -= (rdz / rdist) * rs;
                npc.char.group.rotation.y = Math.atan2(rdx, rdz);
                npc.char.group.position.x = Math.max(-bounds, Math.min(bounds, npc.char.group.position.x));
                npc.char.group.position.z = Math.max(-bounds, Math.min(bounds, npc.char.group.position.z));
                LIFE.resolveCollisions(npc.char.group.position);
                return;
            }
        }

        if (npc.reacting > 0) {
            npc.reacting -= dt;
            if (player) {
                var dx = player.group.position.x - npc.char.group.position.x;
                var dz = player.group.position.z - npc.char.group.position.z;
                npc.char.group.rotation.y = Math.atan2(dx, dz);
            }
            return;
        }

        // friendly NPCs occasionally approach
        if (relLevel >= 40 && player && Math.random() < 0.005) {
            var adx = player.group.position.x - npc.char.group.position.x;
            var adz = player.group.position.z - npc.char.group.position.z;
            var adist = Math.sqrt(adx * adx + adz * adz);
            if (adist > 3 && adist < 15) {
                npc.target.set(
                    player.group.position.x + (Math.random() - 0.5) * 3,
                    0,
                    player.group.position.z + (Math.random() - 0.5) * 3
                );
                npc.waiting = false;
            }
        }

        if (npc.waiting) {
            npc.waitTimer -= dt;
            npc.char.parts.leftLeg.rotation.x *= 0.9; npc.char.parts.rightLeg.rotation.x *= 0.9;
            npc.char.parts.leftArm.rotation.x *= 0.9; npc.char.parts.rightArm.rotation.x *= 0.9;
            if (npc.waitTimer <= 0) {
                var b = bounds * 0.6;
                var tx, tz, tries = 0;
                do {
                    tx = (Math.random()-0.5)*b*2;
                    tz = (Math.random()-0.5)*b*2;
                    tries++;
                } while (LIFE.isInsideCollider(tx, tz) && tries < 10);
                npc.target.set(tx, 0, tz);
                npc.waiting = false;
            }
            return;
        }
        var dx = npc.target.x - npc.char.group.position.x;
        var dz = npc.target.z - npc.char.group.position.z;
        var dist = Math.sqrt(dx*dx+dz*dz);
        if (dist < 0.5) { npc.waiting = true; npc.waitTimer = 2+Math.random()*4; return; }
        var s = npc.speed * dt;
        var prevX = npc.char.group.position.x;
        var prevZ = npc.char.group.position.z;
        npc.char.group.position.x += (dx/dist)*s; npc.char.group.position.z += (dz/dist)*s;
        npc.char.group.rotation.y = Math.atan2(dx, dz);
        npc.walkTime += dt * npc.speed * 3;
        var swing = Math.sin(npc.walkTime) * 0.4;
        npc.char.parts.leftLeg.rotation.x = swing; npc.char.parts.rightLeg.rotation.x = -swing;
        npc.char.parts.leftArm.rotation.x = -swing*0.6; npc.char.parts.rightArm.rotation.x = swing*0.6;
        npc.char.group.position.x = Math.max(-bounds, Math.min(bounds, npc.char.group.position.x));
        npc.char.group.position.z = Math.max(-bounds, Math.min(bounds, npc.char.group.position.z));
        // collision check - if NPC hits a building, push back and pick a new target
        LIFE.resolveCollisions(npc.char.group.position);
        if (Math.abs(npc.char.group.position.x - prevX) < s * 0.1 && Math.abs(npc.char.group.position.z - prevZ) < s * 0.1 && s > 0.001) {
            // NPC got stuck on a collider, pick a new target
            var nb = bounds * 0.6;
            npc.target.set((Math.random()-0.5)*nb*2, 0, (Math.random()-0.5)*nb*2);
        }

        // hiring managers stay near their building
        if (npc.stayNear) {
            var sdx = npc.char.group.position.x - npc.stayNear.x;
            var sdz = npc.char.group.position.z - npc.stayNear.z;
            if (Math.sqrt(sdx * sdx + sdz * sdz) > 5) {
                npc.target.set(npc.stayNear.x + (Math.random() - 0.5) * 4, 0, npc.stayNear.z + (Math.random() - 0.5) * 4);
                npc.waiting = false;
            }
        }
    });
};
