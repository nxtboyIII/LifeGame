// ============================================================
// DIALOGUE & DECISION SYSTEM
// ============================================================
LIFE.dialogue = {
    active: false,
    blocking: false,
    npc: null,
    current: null,
    textIndex: 0,
    textTimer: 0,
    fullText: '',
    displayText: '',
    selectedOption: -1,
    decisionsMade: {},
    responseTimer: 0,
    showing: 'npc'
};

// KEY LIFE DECISIONS (triggered at specific ages)
LIFE.DECISIONS = {
    5: {
        speaker: 'Teacher',
        text: "Welcome to school! This is where your journey of learning begins. How do you want to approach it?",
        isDecision: true,
        options: [
            { text: "I love learning! I'll study hard!", effects: { intelligence: 8, happiness: 2 }, rep: 5, tag: 'studious' },
            { text: "I just want to play with friends!", effects: { happiness: 8, charisma: 5 }, rep: 3, tag: 'social' },
            { text: "I'll try a bit of everything.", effects: { intelligence: 3, happiness: 3, charisma: 3 }, rep: 2, tag: 'balanced' }
        ]
    },
    10: {
        speaker: 'You',
        text: "[LIFE CHOICE] What hobby do you want to pursue?",
        isDecision: true,
        options: [
            { text: "Reading & Science", effects: { intelligence: 10 }, rep: 3, tag: 'nerd' },
            { text: "Sports & Fitness", effects: { health: 10, charisma: 3 }, rep: 5, tag: 'athlete' },
            { text: "Music & Art", effects: { happiness: 8, charisma: 5 }, rep: 4, tag: 'creative' }
        ]
    },
    14: {
        speaker: 'You',
        text: "[LIFE CHOICE] High school! You can get a part-time job. What do you focus on?",
        isDecision: true,
        options: [
            { text: "Study for top grades", effects: { intelligence: 10 }, rep: 3, tag: 'scholar', career: null },
            { text: "Get a part-time job ($)", effects: { charisma: 5 }, rep: 2, tag: 'worker', career: 'parttime', money: 200 },
            { text: "Be the popular kid", effects: { charisma: 10, happiness: 5 }, rep: 5, tag: 'popular' },
            { text: "Cause trouble and skip class", effects: { happiness: 3 }, rep: -15, tag: 'rebel' }
        ]
    },
    18: {
        speaker: 'You',
        text: "[MAJOR LIFE DECISION] It's time to choose your path. What do you want to do with your life?",
        isDecision: true,
        options: [
            { text: "Study Science in college", effects: { intelligence: 15 }, rep: 5, tag: 'science', career: 'scientist' },
            { text: "Study Business in college", effects: { charisma: 10, intelligence: 5 }, rep: 3, tag: 'business', career: 'business' },
            { text: "Pursue the Arts", effects: { happiness: 12, charisma: 5 }, rep: 4, tag: 'arts', career: 'artist' },
            { text: "Skip college, start working", effects: { charisma: 3 }, rep: -2, tag: 'nocollege', career: 'worker', money: 500 }
        ]
    },
    25: {
        speaker: 'You',
        text: "[LIFE CHOICE] You're 25 now. What's your love life looking like?",
        isDecision: true,
        options: [
            { text: "I'm ready to settle down (meet someone)", effects: { happiness: 8, charisma: 5 }, rep: 5, tag: 'lookforlove' },
            { text: "I'm dating around, nothing serious", effects: { happiness: 5, charisma: 3 }, rep: 0, tag: 'dating' },
            { text: "I prefer being independent", effects: { charisma: 5, intelligence: 3 }, rep: -3, tag: 'single' }
        ]
    },
    30: {
        speaker: 'You',
        text: "[LIFE CHOICE] Thirty years old. What matters most right now?",
        isDecision: true,
        options: [
            { text: "Family is everything", effects: { happiness: 10 }, rep: 8, tag: 'family' },
            { text: "Career first, everything else later", effects: { intelligence: 5, charisma: 3 }, rep: 2, tag: 'career' },
            { text: "Living life to the fullest!", effects: { happiness: 12 }, rep: 3, tag: 'yolo', cost: 1000 }
        ]
    },
    40: {
        speaker: 'You',
        text: "[MID-LIFE] You look in the mirror and wonder... is this all there is?",
        isDecision: true,
        options: [
            { text: "I'm grateful for what I have", effects: { happiness: 10 }, rep: 5, tag: 'content' },
            { text: "Time for a career change!", effects: { happiness: 5, charisma: 5 }, rep: 3, tag: 'change', careerChange: true },
            { text: "I need to focus on health", effects: { health: 12 }, rep: 2, tag: 'health' },
            { text: "Buy something expensive!", effects: { happiness: 8 }, rep: -3, tag: 'splurge', cost: 5000 }
        ]
    },
    50: {
        speaker: 'You',
        text: "Half a century. Your hair is graying. What matters most to you now?",
        isDecision: true,
        options: [
            { text: "My family and friends", effects: { happiness: 8, charisma: 5 }, rep: 8, tag: 'family' },
            { text: "Leaving a legacy through work", effects: { intelligence: 8 }, rep: 5, tag: 'legacy' },
            { text: "Enjoying life to the fullest", effects: { happiness: 12 }, rep: 2, tag: 'enjoy', cost: 2000 }
        ]
    },
    65: {
        speaker: 'You',
        text: "[RETIREMENT] Your working days are over. How do you want to spend retirement?",
        isDecision: true,
        options: [
            { text: "Travel the world! ($10,000)", effects: { happiness: 15, charisma: 5 }, rep: 5, tag: 'travel', cost: 10000 },
            { text: "Relax at home with family", effects: { happiness: 10, health: 5 }, rep: 8, tag: 'home' },
            { text: "Volunteer and give back", effects: { happiness: 12, charisma: 8 }, rep: 20, tag: 'volunteer' }
        ]
    }
};

// RANDOM NPC DIALOGUES
LIFE.NPC_DIALOGUES = {
    'Mom': [
        { text: "How's my little one doing today?", options: [
            { text: "Smile and reach out", effects: { happiness: 2 }, rep: 2 },
            { text: "Start crying", effects: { happiness: -1 }, rep: -1, sound: 'cry' },
            { text: "Stare blankly", effects: {} }
        ]},
        { text: "Come here, sweetie. Want a hug?", options: [
            { text: "Hug her back", effects: { happiness: 3 }, rep: 3 },
            { text: "Squirm away", effects: { charisma: 1 }, rep: -1 }
        ]},
        { text: "I'm so proud of how you're growing!", options: [
            { text: "Thanks, Mom!", effects: { happiness: 2 }, rep: 2 },
            { text: "Mom, you're embarrassing me...", effects: { charisma: 1 }, rep: -1 }
        ]}
    ],
    'Dad': [
        { text: "Hey champ! Want to play catch?", options: [
            { text: "Yeah! Let's go!", effects: { happiness: 3, health: 1 }, rep: 3 },
            { text: "I'd rather read", effects: { intelligence: 2 }, rep: 0 },
            { text: "Leave me alone.", effects: {}, rep: -3 }
        ]},
        { text: "Remember, work hard and you'll do great things.", options: [
            { text: "I will, Dad!", effects: { intelligence: 1, happiness: 1 }, rep: 2 },
            { text: "Whatever you say...", effects: {}, rep: -2 }
        ]}
    ],
    'Sibling': [
        { text: "Wanna play? I'm bored!", options: [
            { text: "Sure! Let's go!", effects: { happiness: 2, charisma: 1 }, rep: 3 },
            { text: "Leave me alone!", effects: { charisma: -1 }, rep: -3 },
            { text: "Only if I get to pick the game", effects: { charisma: 1 }, rep: 0 }
        ]}
    ],
    'Teacher': [
        { text: "Have you finished your homework?", options: [
            { text: "Yes! All done!", effects: { intelligence: 2 }, rep: 3 },
            { text: "Uh... almost...", effects: {}, rep: 0 },
            { text: "Homework is pointless!", effects: { intelligence: -1 }, rep: -5 }
        ]},
        { text: "Excellent work on the test!", options: [
            { text: "Thanks! I studied hard!", effects: { intelligence: 2, happiness: 1 }, rep: 3 },
            { text: "It was pretty easy", effects: { charisma: 1 }, rep: -1 }
        ]}
    ],
    'Kid': [
        { text: "Wanna be friends?", options: [
            { text: "Sure! What's your name?", effects: { charisma: 2, happiness: 2 }, rep: 5, friend: true },
            { text: "No, you're weird.", effects: { charisma: -2 }, rep: -8, enemy: true },
            { text: "OK, but I'm in charge", effects: { charisma: 1 }, rep: -2 }
        ]},
        { text: "Tag! You're it!", options: [
            { text: "Hey! Come back here!", effects: { health: 1, happiness: 2 }, rep: 3 },
            { text: "I don't play stupid games", effects: {}, rep: -5 }
        ]}
    ],
    'Student': [
        { text: "This class is so boring, right?", options: [
            { text: "I actually think it's interesting", effects: { intelligence: 2 }, rep: 1 },
            { text: "Yeah, let's skip!", effects: { charisma: 2, intelligence: -1 }, rep: -4 },
            { text: "At least it's almost over", effects: { happiness: 1 }, rep: 1 }
        ]},
        { text: "Want to study together for the exam?", options: [
            { text: "Yes! Great idea!", effects: { intelligence: 3, charisma: 1 }, rep: 5, friend: true },
            { text: "Nah, I'll wing it", effects: { charisma: 1 }, rep: -1 },
            { text: "Study by yourself, loser", effects: {}, rep: -10, enemy: true }
        ]},
        { text: "There's a party this weekend!", options: [
            { text: "I'll be there!", effects: { happiness: 3, charisma: 2 }, rep: 3, cost: 20 },
            { text: "I need to study", effects: { intelligence: 2 }, rep: -1 },
            { text: "Parties are lame", effects: {}, rep: -4 }
        ]}
    ],
    'Professor': [
        { text: "Your thesis is showing real promise.", options: [
            { text: "Thank you, professor!", effects: { intelligence: 3, happiness: 2 }, rep: 3 },
            { text: "I've been working really hard", effects: { intelligence: 2 }, rep: 2 }
        ]}
    ],
    'Coworker': [
        { text: "Want to grab coffee?", options: [
            { text: "Sure, my treat! ($5)", effects: { charisma: 2, happiness: 1 }, rep: 5, cost: 5, friend: true },
            { text: "Yeah, but you're buying", effects: { charisma: 1 }, rep: -1 },
            { text: "Go away, I'm busy", effects: { intelligence: 1 }, rep: -6 }
        ]},
        { text: "Did you hear about the promotion opening?", options: [
            { text: "May the best person win!", effects: { charisma: 2 }, rep: 5 },
            { text: "It's mine. Back off.", effects: { charisma: -2 }, rep: -10, enemy: true },
            { text: "I'm happy where I am", effects: { happiness: 2 }, rep: 2 }
        ]}
    ],
    'Boss': [
        { text: "I need that report done by end of day.", options: [
            { text: "Consider it done!", effects: { intelligence: 1 }, rep: 3, money: 50 },
            { text: "I'll need overtime pay...", effects: { charisma: 1 }, rep: -2, money: 80 },
            { text: "Do it yourself!", effects: {}, rep: -15 }
        ]},
        { text: "Great quarter! Here's a bonus.", options: [
            { text: "Thank you! I earned it!", effects: { happiness: 3 }, rep: 2, money: 200 },
            { text: "I couldn't do it without the team", effects: { charisma: 3 }, rep: 8, money: 150, friend: true }
        ]}
    ],
    'Stranger': [
        { text: "Excuse me, do you have the time?", options: [
            { text: "Sure! It's about noon.", effects: { charisma: 1 }, rep: 3 },
            { text: "Get lost.", effects: {}, rep: -8 },
            { text: "Sorry, I'm in a hurry", effects: {}, rep: 0 }
        ]},
        { text: "Nice weather today, huh?", options: [
            { text: "Beautiful day!", effects: { happiness: 1 }, rep: 2 },
            { text: "Mind your own business", effects: {}, rep: -5 }
        ]}
    ],
    'Old Friend': [
        { text: "Remember when we were young? Those were the days...", options: [
            { text: "Best years of my life!", effects: { happiness: 3 }, rep: 3 },
            { text: "I think life keeps getting better", effects: { happiness: 2, intelligence: 1 }, rep: 5 },
            { text: "I try not to look back", effects: {}, rep: -1 }
        ]}
    ],
    'Neighbor': [
        { text: "Lovely garden you've got!", options: [
            { text: "Thanks! Want some tomatoes?", effects: { charisma: 2, happiness: 1 }, rep: 8, friend: true },
            { text: "Stay off my lawn!", effects: {}, rep: -10, enemy: true }
        ]}
    ],
    'Grandchild': [
        { text: "Grandma/Grandpa! Tell me a story!", options: [
            { text: "Let me tell you about when I was your age...", effects: { happiness: 5 }, rep: 5 },
            { text: "How about we get ice cream? ($8)", effects: { happiness: 4, charisma: 2 }, rep: 5, cost: 8 }
        ]}
    ]
};

// DEALER DIALOGUES (contraband purchases)
LIFE.NPC_DIALOGUES['Dealer'] = [
    { text: "Psst... I got some items you won't find at any store. Interested?", options: [
        { text: "Show me what you got.", effects: {}, rep: -2, openDealer: true },
        { text: "No thanks, I'm clean.", effects: { happiness: 1 }, rep: 2 },
        { text: "I should report you!", effects: { charisma: 2 }, rep: 8 }
    ]},
    { text: "Back again? I got fresh stock today.", options: [
        { text: "Let me see.", effects: {}, rep: -2, openDealer: true },
        { text: "Not today.", effects: {}, rep: 0 }
    ]}
];

// INMATE DIALOGUES
LIFE.NPC_DIALOGUES['Inmate'] = [
    { text: "First time in here? You'll get used to it.", options: [
        { text: "How long you been here?", effects: { charisma: 1 }, rep: 2 },
        { text: "Leave me alone.", effects: {}, rep: -3 },
        { text: "Any tips for surviving?", effects: { intelligence: 1 }, rep: 3 }
    ]},
    { text: "Keep your head down and don't make enemies.", options: [
        { text: "Thanks for the advice.", effects: { intelligence: 1 }, rep: 3 },
        { text: "I can handle myself.", effects: { charisma: 1 }, rep: -2 }
    ]}
];

// ============================================================
// DIALOGUE FUNCTIONS
// ============================================================
LIFE.dialogue.open = function(speaker, text, options, isDecision) {
    LIFE.dialogue.active = true;
    LIFE.dialogue.blocking = isDecision || false;
    LIFE.dialogue.showing = 'npc';
    LIFE.dialogue.current = { speaker: speaker, text: text, options: options, isDecision: isDecision || false };
    LIFE.dialogue.fullText = text;
    LIFE.dialogue.displayText = '';
    LIFE.dialogue.textIndex = 0;
    LIFE.dialogue.textTimer = 0;
    LIFE.dialogue.selectedOption = -1;
    LIFE.dialogue.responseTimer = 0;

    var el = LIFE.dialogue.elements;
    el.box.style.display = 'block';
    el.name.textContent = speaker;
    el.name.style.color = isDecision ? '#ffab40' : '#4fc3f7';
    el.text.textContent = '';
    el.options.innerHTML = '';
    el.options.style.display = 'none';
    el.response.style.display = 'none';

    // only unlock cursor for blocking dialogues (decisions need clicking)
    if (isDecision) {
        LIFE.unlockCursor();
    }
};

LIFE.dialogue.close = function() {
    var wasBlocking = LIFE.dialogue.blocking;
    LIFE.dialogue.active = false;
    LIFE.dialogue.blocking = false;
    LIFE.dialogue.current = null;
    LIFE.dialogue.elements.box.style.display = 'none';
    // only re-lock cursor if we unlocked it
    if (wasBlocking) {
        LIFE.lockCursor();
    }
};

LIFE.dialogue.selectOption = function(idx) {
    var dlg = LIFE.dialogue.current;
    if (!dlg || idx >= dlg.options.length || LIFE.dialogue.showing === 'response') return;

    var opt = dlg.options[idx];
    LIFE.sounds.select();

    if (opt.cost && opt.cost > 0) {
        if (!LIFE.economy.canAfford(opt.cost)) {
            LIFE.ui.showPopup("Can't afford it! ($" + opt.cost + ")", '#ef5350');
            return;
        }
        LIFE.economy.spend(opt.cost);
    }

    if (opt.effects) {
        for (var stat in opt.effects) {
            if (LIFE.state.stats[stat] !== undefined) {
                LIFE.state.stats[stat] = Math.max(0, Math.min(100,
                    LIFE.state.stats[stat] + opt.effects[stat]));
            }
        }
    }

    if (opt.money) {
        LIFE.state.money += opt.money;
        LIFE.sounds.money();
    }

    if (opt.rep) {
        LIFE.state.reputation = Math.max(-100, Math.min(100, LIFE.state.reputation + opt.rep));
        LIFE.ui.showRepChange(opt.rep);
    }

    if (opt.friend) {
        var friendName = LIFE.dialogue.npc ? LIFE.dialogue.npc.name : 'Someone';
        LIFE.state.friends++;
        LIFE.ui.showPopup(friendName + ' is now your friend!', '#66bb6a');
    }
    if (opt.enemy) {
        var enemyName = LIFE.dialogue.npc ? LIFE.dialogue.npc.name : 'Someone';
        LIFE.state.enemies++;
        LIFE.ui.showPopup(enemyName + ' is now your enemy!', '#ef5350');
    }

    // track relationship with NPC (by individual name)
    if (LIFE.dialogue.npc && LIFE.updateRelationship) {
        var relChange = 0;
        if (opt.rep > 0) relChange = opt.rep * 2;
        else if (opt.rep < 0) relChange = opt.rep * 2;
        else if (opt.friend) relChange = 15;
        else if (opt.enemy) relChange = -15;
        else relChange = 2; // small positive for talking
        LIFE.updateRelationship(LIFE.dialogue.npc.name, relChange);
    }

    // fame change from events
    if (opt.fame) {
        LIFE.state.fame = Math.max(0, Math.min(100, (LIFE.state.fame || 0) + opt.fame));
        if (opt.fame > 0) LIFE.ui.showPopup('+' + opt.fame + ' Fame!', '#ffeb3b');
        else LIFE.ui.showPopup(opt.fame + ' Fame', '#ff9800');
    }

    // child naming
    if (opt.childName) {
        if (!LIFE.state.childNames) LIFE.state.childNames = [];
        LIFE.state.childNames.push(opt.childName);
        LIFE.ui.showPopup('Welcome to the family, ' + opt.childName + '!', '#e91e63');
    }

    // gender selection
    if (opt.setGender) {
        LIFE.state.playerGender = opt.setGender;
        var label = opt.setGender === 'M' ? 'Boy' : 'Girl';
        LIFE.ui.showPopup('You are a ' + label + '!', '#4fc3f7');
    }

    if (opt.career !== undefined) {
        LIFE.state.career = opt.career;
        if (opt.career && opt.career !== 'none') {
            var careerInfo = LIFE.CAREERS[opt.career];
            if (careerInfo) LIFE.ui.showPopup('New job: ' + careerInfo.title + '!', '#4caf50');
        }
    }
    if (opt.openDealer) {
        // close dialogue immediately, then open dealer shop
        LIFE.dialogue.active = false;
        LIFE.dialogue.blocking = false;
        LIFE.dialogue.current = null;
        LIFE.dialogue.elements.box.style.display = 'none';
        setTimeout(function() {
            if (LIFE.state.gamePhase === 'playing') LIFE.ui.openDealerShop();
        }, 100);
        return; // skip the response phase
    }
    if (opt.openProperty) {
        LIFE.dialogue.active = false;
        LIFE.dialogue.blocking = false;
        LIFE.dialogue.current = null;
        LIFE.dialogue.elements.box.style.display = 'none';
        setTimeout(function() {
            if (LIFE.state.gamePhase === 'playing') LIFE.ui.openPropertyShop();
        }, 100);
        return;
    }
    if (opt.openInvest) {
        LIFE.dialogue.active = false;
        LIFE.dialogue.blocking = false;
        LIFE.dialogue.current = null;
        LIFE.dialogue.elements.box.style.display = 'none';
        setTimeout(function() {
            if (LIFE.state.gamePhase === 'playing') LIFE.ui.openInvestmentShop();
        }, 100);
        return;
    }
    if (opt.careerChange) {
        var careers = ['teacher', 'artist', 'worker'];
        LIFE.state.career = careers[Math.floor(Math.random() * careers.length)];
    }
    if (opt.married) LIFE.state.married = true;
    if (opt.kids) {
        LIFE.state.hasKids = true;
        LIFE.state.childCount = (LIFE.state.childCount || 0) + 1;
        if (!LIFE.state.childNames) LIFE.state.childNames = [];
        setTimeout(function() {
            if (LIFE.state.gamePhase === 'playing') {
                LIFE.dialogue.openChildNaming(LIFE.state.childCount);
            }
        }, 2200);
    }
    if (opt.sound) LIFE.sounds[opt.sound]();

    // FLIRTING
    if (opt.flirt && opt.flirtTarget) {
        var flirtLine = LIFE.FLIRT_DIALOGUES[Math.floor(Math.random() * LIFE.FLIRT_DIALOGUES.length)];
        var charismaBonus = LIFE.state.stats.charisma * 0.005;
        var success = Math.random() < (flirtLine.success + charismaBonus);
        if (success) {
            LIFE.ui.showPopup('They liked that!', '#e91e63');
            LIFE.state.romanceLevel = (LIFE.state.romanceLevel || 0) + 10;
            LIFE.state.romanceTarget = opt.flirtTarget;
            LIFE.updateRelationship(opt.flirtTarget, 10);
            if (LIFE.state.romanceLevel >= 30) {
                LIFE.ui.showPopup(opt.flirtTarget + ' is interested in you!', '#e91e63');
            }
        } else {
            LIFE.ui.showPopup("That didn't land well...", '#ef5350');
            LIFE.updateRelationship(opt.flirtTarget, -5);
        }
    }

    // MARRIAGE proposal
    if (opt.marry) {
        LIFE.state.married = true;
        LIFE.state.spouseName = opt.marry;
        LIFE.ui.showPopup('You married ' + opt.marry + '!', '#e91e63');
    }

    // HAVING KIDS
    if (opt.haveKid) {
        if (Math.random() < 0.7) {
            LIFE.state.hasKids = true;
            LIFE.state.childCount = (LIFE.state.childCount || 0) + 1;
            if (!LIFE.state.childNames) LIFE.state.childNames = [];
            LIFE.ui.showPopup('You have a baby! Child #' + LIFE.state.childCount, '#e91e63');
            // trigger child naming dialogue after current dialogue closes
            setTimeout(function() {
                if (LIFE.state.gamePhase === 'playing') {
                    LIFE.dialogue.openChildNaming(LIFE.state.childCount);
                }
            }, 2200);
        } else {
            LIFE.ui.showPopup("Not yet, but keep trying!", '#ff9800');
        }
    }

    if (dlg.isDecision) {
        LIFE.dialogue.decisionsMade[LIFE.state.age] = opt.tag || idx;
    }

    // show player's response then close
    LIFE.dialogue.showing = 'response';
    LIFE.dialogue.responseTimer = LIFE.dialogue.blocking ? 1.8 : 1.0;
    var el = LIFE.dialogue.elements;
    el.options.style.display = 'none';
    el.response.style.display = 'block';
    el.response.innerHTML = '<div class="dlgYouLabel">You:</div>' + opt.text;
    LIFE.sounds.talk();
};

LIFE.dialogue.update = function(dt) {
    if (!LIFE.dialogue.active || !LIFE.dialogue.current) return;

    // distance-based conversation ending - walk away to end it
    if (LIFE.dialogue.npc && LIFE.player && !LIFE.dialogue.blocking) {
        var npcPos = LIFE.dialogue.npc.char.group.position;
        var pPos = LIFE.player.group.position;
        var ddx = pPos.x - npcPos.x, ddz = pPos.z - npcPos.z;
        if (Math.sqrt(ddx * ddx + ddz * ddz) > 6) {
            LIFE.dialogue.close();
            LIFE.ui.showPopup('Walked away from conversation', '#ff9800');
            return;
        }
    }

    if (LIFE.dialogue.showing === 'response') {
        LIFE.dialogue.responseTimer -= dt;
        if (LIFE.dialogue.responseTimer <= 0) {
            LIFE.dialogue.close();
        }
        return;
    }

    // typewriter effect
    if (LIFE.dialogue.textIndex < LIFE.dialogue.fullText.length) {
        LIFE.dialogue.textTimer += dt;
        var speed = LIFE.dialogue.blocking ? 0.03 : 0.015;
        while (LIFE.dialogue.textTimer > speed && LIFE.dialogue.textIndex < LIFE.dialogue.fullText.length) {
            LIFE.dialogue.textTimer -= speed;
            LIFE.dialogue.textIndex++;
            LIFE.dialogue.displayText = LIFE.dialogue.fullText.substring(0, LIFE.dialogue.textIndex);
            LIFE.dialogue.elements.text.textContent = LIFE.dialogue.displayText;
            if (LIFE.dialogue.textIndex % 3 === 0) LIFE.sounds.blip();
        }
    } else if (LIFE.dialogue.elements.options.style.display === 'none') {
        LIFE.dialogue.showing = 'options';
        LIFE.dialogue.showOptions();
    }
};

LIFE.dialogue.showOptions = function() {
    var dlg = LIFE.dialogue.current;
    var container = LIFE.dialogue.elements.options;
    container.innerHTML = '';
    container.style.display = 'block';

    dlg.options.forEach(function(opt, i) {
        var div = document.createElement('div');
        div.className = 'dlgOption';
        var extras = '';
        if (opt.cost > 0) extras += ' <span class="dlgCost">(-$' + opt.cost + ')</span>';
        if (opt.money > 0) extras += ' <span class="dlgEarn">(+$' + opt.money + ')</span>';
        if (opt.rep > 0) extras += ' <span class="dlgRep pos">[+Rep]</span>';
        if (opt.rep < 0) extras += ' <span class="dlgRep neg">[-Rep]</span>';
        if (opt.friend) extras += ' <span class="dlgRep pos">[Friend]</span>';
        if (opt.enemy) extras += ' <span class="dlgRep neg">[Enemy]</span>';
        div.innerHTML = '<span class="dlgKey">' + (i + 1) + '</span> ' + opt.text + extras;
        div.onclick = function() { LIFE.dialogue.selectOption(i); };
        container.appendChild(div);
    });
};

// Friend-specific dialogues (used when already friends)
LIFE.NPC_FRIEND_DIALOGUES = {
    'Kid': [
        { text: "Hey bestie! Wanna play tag?", options: [
            { text: "You're it!", effects: { happiness: 3, health: 1 }, rep: 3 },
            { text: "Let's go on an adventure!", effects: { happiness: 2, charisma: 1 }, rep: 2 }
        ]},
        { text: "I saved you a seat at lunch!", options: [
            { text: "Thanks! You're the best!", effects: { happiness: 2 }, rep: 3 },
            { text: "Cool, let's eat!", effects: { happiness: 1 }, rep: 1 }
        ]}
    ],
    'Student': [
        { text: "Hey! Want to hang out after class?", options: [
            { text: "Definitely! Let's go!", effects: { happiness: 3, charisma: 1 }, rep: 3 },
            { text: "Can't today, but soon!", effects: { happiness: 1 }, rep: 1 }
        ]},
        { text: "Thanks for being a good friend. It means a lot.", options: [
            { text: "You too! We're in this together!", effects: { happiness: 3, charisma: 2 }, rep: 5 },
            { text: "Don't get mushy on me!", effects: { happiness: 1 }, rep: 0 }
        ]},
        { text: "Want to study together? We both do better that way!", options: [
            { text: "Good idea! Let's hit the library!", effects: { intelligence: 3, happiness: 1 }, rep: 3 },
            { text: "Sure, your place or mine?", effects: { intelligence: 2 }, rep: 2 }
        ]}
    ],
    'Stranger': [
        { text: "Oh hey, it's you again! Good to see a familiar face!", options: [
            { text: "Same here! How've you been?", effects: { happiness: 1, charisma: 1 }, rep: 3 },
            { text: "Hey! Small world!", effects: { happiness: 1 }, rep: 2 }
        ]}
    ],
    'Neighbor': [
        { text: "Hey neighbor! I baked too many cookies, want some?", options: [
            { text: "You're the best neighbor ever!", effects: { happiness: 3 }, rep: 5 },
            { text: "Thanks! I'll bring dessert next time!", effects: { happiness: 2, charisma: 1 }, rep: 4 }
        ]},
        { text: "Want to come over for a barbecue this weekend?", options: [
            { text: "I'll bring the drinks!", effects: { happiness: 3, charisma: 2 }, rep: 5, cost: 20 },
            { text: "Sounds fun! Count me in!", effects: { happiness: 2 }, rep: 3 }
        ]}
    ],
    'Coworker': [
        { text: "Hey buddy! Want to grab lunch together?", options: [
            { text: "My treat today! ($15)", effects: { happiness: 2, charisma: 2 }, rep: 5, cost: 15 },
            { text: "Sure, let's go!", effects: { happiness: 1 }, rep: 2 }
        ]},
        { text: "I put in a good word for you with the boss!", options: [
            { text: "You're a real one! Thanks!", effects: { happiness: 3, charisma: 1 }, rep: 5 },
            { text: "I appreciate that!", effects: { happiness: 2 }, rep: 3 }
        ]}
    ],
    'Inmate': [
        { text: "Hey, I got your back in here.", options: [
            { text: "Same here. We stick together.", effects: { charisma: 2, happiness: 1 }, rep: 3 },
            { text: "Thanks. I needed that.", effects: { happiness: 2 }, rep: 2 }
        ]}
    ]
};

// Romance/flirting dialogues
LIFE.FLIRT_DIALOGUES = [
    { text: "You have the most beautiful smile I've ever seen.", success: 0.6 },
    { text: "Do you come here often? Because I'd remember someone like you.", success: 0.5 },
    { text: "I have to say, you're really easy to talk to.", success: 0.7 },
    { text: "Would you like to grab coffee sometime?", success: 0.65 },
    { text: "I can't help but notice how great you look today.", success: 0.55 }
];

LIFE.ROMANCE_DIALOGUES = [
    { text: "I really enjoy spending time with you. You make me happy.", romance: 15 },
    { text: "Every time I see you, my day gets better.", romance: 12 },
    { text: "I've been thinking about you a lot lately...", romance: 10 },
    { text: "You mean the world to me.", romance: 18 },
    { text: "I can't imagine my life without you.", romance: 20 }
];

// Check if NPC is flirtable
LIFE.canFlirtWith = function(npc) {
    var state = LIFE.state;
    if (state.age < 16) return false;
    if (state.married) return false;
    if (npc.type === 'Mom' || npc.type === 'Dad' || npc.type === 'Sibling' ||
        npc.type === 'Your Child' || npc.type === 'Grandchild' || npc.type === 'Inmate') return false;
    if (npc.isPolice || npc.isDealer || npc.isHiring) return false;
    // kids can't be flirted with
    if (npc.type === 'Kid') return false;
    // opposite sex only
    if (state.playerGender && npc.gender === state.playerGender) return false;
    return true;
};

LIFE.dialogue.talkToNPC = function(npc) {
    if (!npc || !npc.alive || LIFE.dialogue.active) return;
    var type = npc.type;
    var speakerName = npc.name || type;

    // HIRING MANAGER NPCs - job application dialogue
    if (npc.isHiring && npc.careerType) {
        LIFE.dialogue.npc = npc;
        var career = LIFE.CAREERS[npc.careerType];
        if (!career) return;
        var currentCareer = LIFE.state.career;
        var alreadyHas = (currentCareer === npc.careerType);

        if (alreadyHas) {
            LIFE.dialogue.open(speakerName, "You already work here! Keep up the good work.", [
                { text: "Thanks! Will do!", effects: { happiness: 2 }, rep: 2 },
                { text: "Actually, I quit.", effects: { happiness: -3 }, rep: -5, career: 'none' }
            ], true);
            return;
        }

        var meetsReqs = true;
        var reqText = '';
        if (career.reqInt && LIFE.state.stats.intelligence < career.reqInt) {
            meetsReqs = false; reqText = 'Intelligence ' + career.reqInt + ' required (you have ' + Math.floor(LIFE.state.stats.intelligence) + ')';
        }
        if (career.reqCha && LIFE.state.stats.charisma < career.reqCha) {
            meetsReqs = false; reqText = 'Charisma ' + career.reqCha + ' required (you have ' + Math.floor(LIFE.state.stats.charisma) + ')';
        }

        if (!meetsReqs) {
            LIFE.dialogue.open(speakerName, "Sorry, we can't hire you right now. " + reqText + ".", [
                { text: "I'll work on it and come back.", effects: { intelligence: 1 }, rep: 2 },
                { text: "That's unfair!", effects: {}, rep: -3 }
            ], true);
        } else {
            LIFE.dialogue.open(speakerName, "We're hiring for " + career.title + "! Pay is $" + career.income + "/work. Interested?", [
                { text: "Yes! I'll take the job!", effects: { happiness: 5 }, rep: 5, career: npc.careerType },
                { text: "What are the benefits?", effects: { intelligence: 1 }, rep: 1 },
                { text: "No thanks, not for me.", effects: {}, rep: 0 }
            ], true);
        }
        return;
    }

    // CHECK FRIENDSHIP - use friend dialogues if already friends
    var rel = LIFE.state.relationships[npc.name];
    var relLevel = rel ? rel.level : 0;

    LIFE.dialogue.npc = npc;

    // feared reputation override
    if (LIFE.state.reputation <= -40 && type !== 'Mom' && type !== 'Dad' && type !== 'Dealer') {
        var fearDialogue = { text: "Stay away from me! I've heard about you...", options: [
            { text: "I'm not that bad, really.", effects: { charisma: 1 }, rep: 3 },
            { text: "You should be afraid.", effects: {}, rep: -8, enemy: true },
            { text: "I'm trying to change...", effects: { happiness: 1 }, rep: 5 }
        ]};
        if (Math.random() < 0.5) {
            LIFE.dialogue.open(speakerName, fearDialogue.text, fearDialogue.options, false);
            return;
        }
    }

    // enemy dialogue
    if (relLevel <= -30) {
        var enemyDlg = { text: "I have nothing to say to you.", options: [
            { text: "I'm sorry for what happened.", effects: { charisma: 1 }, rep: 5 },
            { text: "The feeling's mutual.", effects: {}, rep: -3 },
            { text: "Can we start over?", effects: { happiness: 1 }, rep: 8 }
        ]};
        LIFE.dialogue.open(speakerName, enemyDlg.text, enemyDlg.options, false);
        return;
    }

    // ROMANCE - if this is our romantic partner (check before friend dialogue)
    if (LIFE.state.romanceTarget === npc.name && LIFE.state.romanceLevel >= 30) {
        var romDlg = LIFE.ROMANCE_DIALOGUES[Math.floor(Math.random() * LIFE.ROMANCE_DIALOGUES.length)];
        var romOptions = [
            { text: "I feel the same way!", effects: { happiness: 5 }, rep: 3 },
            { text: "You're so sweet!", effects: { happiness: 3, charisma: 1 }, rep: 2 }
        ];
        // propose if romance level high enough and not married
        if (LIFE.state.romanceLevel >= 70 && !LIFE.state.married && LIFE.state.age >= 20) {
            romOptions.push({ text: "Will you marry me? ($3,000)", effects: { happiness: 15 }, rep: 10, cost: 3000, marry: npc.name });
        }
        // ask to have kids if married
        if (LIFE.state.married && LIFE.state.spouseName === npc.name && LIFE.state.age >= 22) {
            romOptions.push({ text: "Want to start a family?", effects: { happiness: 5 }, rep: 5, haveKid: true });
        }
        LIFE.dialogue.open(speakerName, romDlg.text, romOptions, false);
        LIFE.state.romanceLevel = Math.min(100, LIFE.state.romanceLevel + romDlg.romance * 0.3);
        return;
    }

    // friend dialogue - if relationship >= 15, use friend-specific dialogues
    if (relLevel >= 15 && LIFE.NPC_FRIEND_DIALOGUES[type]) {
        var friendDlgs = LIFE.NPC_FRIEND_DIALOGUES[type];
        var fdlg = friendDlgs[Math.floor(Math.random() * friendDlgs.length)];
        // add flirt option to friend dialogues too
        if (LIFE.canFlirtWith(npc)) {
            var fOpts = fdlg.options.slice();
            fOpts.push({ text: "Flirt...", effects: { charisma: 1 }, rep: 1, flirt: true, flirtTarget: npc.name });
            LIFE.dialogue.open(speakerName, fdlg.text, fOpts, false);
        } else {
            LIFE.dialogue.open(speakerName, fdlg.text, fdlg.options, false);
        }
        return;
    }

    // default dialogues by type
    var dialogues = LIFE.NPC_DIALOGUES[type];
    if (!dialogues || dialogues.length === 0) {
        dialogues = [{ text: "...", options: [{ text: "Wave and smile", effects: { charisma: 1 }, rep: 1 }, { text: "Walk away", effects: {} }] }];
    }

    var dlg = dialogues[Math.floor(Math.random() * dialogues.length)];

    // add flirt option to eligible NPCs
    if (LIFE.canFlirtWith(npc)) {
        var modOptions = dlg.options.slice();
        modOptions.push({ text: "Flirt...", effects: { charisma: 1 }, rep: 1, flirt: true, flirtTarget: npc.name });
        LIFE.dialogue.open(speakerName, dlg.text, modOptions, false);
        return;
    }

    LIFE.dialogue.open(speakerName, dlg.text, dlg.options, false);
};

// Child naming dialogue
LIFE.dialogue.openChildNaming = function(childNum) {
    if (LIFE.dialogue.active) return;
    // pick 3 random names + a random option
    var pool = LIFE.NPC_FIRST_NAMES.slice();
    // exclude already used child names
    var usedNames = LIFE.state.childNames || [];
    pool = pool.filter(function(n) { return usedNames.indexOf(n) < 0; });
    // shuffle and pick 3
    for (var i = pool.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    var name1 = pool[0] || 'Alex';
    var name2 = pool[1] || 'Sam';
    var name3 = pool[2] || 'Jordan';
    var name4 = pool[3] || 'Riley';

    LIFE.dialogue.open('Life Event', "Your baby has arrived! What will you name child #" + childNum + "?", [
        { text: name1, effects: { happiness: 3 }, childName: name1 },
        { text: name2, effects: { happiness: 3 }, childName: name2 },
        { text: name3, effects: { happiness: 3 }, childName: name3 },
        { text: name4, effects: { happiness: 3 }, childName: name4 }
    ], true);
};

LIFE.dialogue.triggerDecision = function(age) {
    var dec = LIFE.DECISIONS[age];
    if (!dec || LIFE.dialogue.decisionsMade[age]) return false;
    LIFE.dialogue.open(dec.speaker, dec.text, dec.options, true);
    return true;
};

LIFE.dialogue.skipTypewriter = function() {
    if (!LIFE.dialogue.active || !LIFE.dialogue.current) return;
    if (LIFE.dialogue.showing === 'response') {
        LIFE.dialogue.close();
        return;
    }
    if (LIFE.dialogue.textIndex < LIFE.dialogue.fullText.length) {
        LIFE.dialogue.textIndex = LIFE.dialogue.fullText.length;
        LIFE.dialogue.displayText = LIFE.dialogue.fullText;
        LIFE.dialogue.elements.text.textContent = LIFE.dialogue.displayText;
        LIFE.dialogue.showing = 'options';
        LIFE.dialogue.showOptions();
    }
};
