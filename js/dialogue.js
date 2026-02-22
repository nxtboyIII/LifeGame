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
            { text: "Smile and reach out", effects: { happiness: 2 }, rep: 2, response: {
                text: "Aww, come here! You're such a sweetheart!", options: [
                    { text: "Giggle happily", effects: { happiness: 2 }, rep: 1 },
                    { text: "Hug tight", effects: { happiness: 3 }, rep: 2 }
                ]
            }},
            { text: "Start crying", effects: { happiness: -1 }, rep: -1, sound: 'cry', response: {
                text: "Oh no, what's wrong sweetie? It's okay, Mommy's here.", options: [
                    { text: "Calm down slowly", effects: { happiness: 1 }, rep: 1 },
                    { text: "Keep crying louder", effects: { happiness: -1 }, rep: -1 }
                ]
            }},
            { text: "Stare blankly", effects: {} }
        ]},
        { text: "Come here, sweetie. Want a hug?", options: [
            { text: "Hug her back", effects: { happiness: 3 }, rep: 3, response: {
                text: "I love you so much! You know that, right?", options: [
                    { text: "I love you too, Mom!", effects: { happiness: 2 }, rep: 2 },
                    { text: "Nod quietly", effects: { happiness: 1 }, rep: 1 }
                ]
            }},
            { text: "Squirm away", effects: { charisma: 1 }, rep: -1, response: {
                text: "Oh, you're getting so independent already!", options: [
                    { text: "I'm a big kid now!", effects: { charisma: 1 }, rep: 1 },
                    { text: "Sorry Mom, maybe later.", effects: { happiness: 1 }, rep: 2 }
                ]
            }}
        ]},
        { text: "I'm so proud of how you're growing!", options: [
            { text: "Thanks, Mom!", effects: { happiness: 2 }, rep: 2 },
            { text: "Mom, you're embarrassing me...", effects: { charisma: 1 }, rep: -1, response: {
                text: "Oh honey, I can't help it! You'll always be my baby.", options: [
                    { text: "Mooom!", effects: { charisma: 1 }, rep: 0 },
                    { text: "I know, I know...", effects: { happiness: 1 }, rep: 1 }
                ]
            }}
        ]}
    ],
    'Dad': [
        { text: "Hey champ! Want to play catch?", options: [
            { text: "Yeah! Let's go!", effects: { happiness: 3, health: 1 }, rep: 3, response: {
                text: "Nice throw! You're getting better every day!", options: [
                    { text: "Can we play more tomorrow?", effects: { happiness: 2 }, rep: 2 },
                    { text: "I'm gonna be a pro!", effects: { charisma: 1, happiness: 1 }, rep: 1 }
                ]
            }},
            { text: "I'd rather read", effects: { intelligence: 2 }, rep: 0, response: {
                text: "That's fine too! Smart kids go far. What are you reading?", options: [
                    { text: "Something about space!", effects: { intelligence: 1 }, rep: 2 },
                    { text: "Just stuff.", effects: {}, rep: 0 }
                ]
            }},
            { text: "Leave me alone.", effects: {}, rep: -3, response: {
                text: "Alright kiddo... I'll be here if you change your mind.", options: [
                    { text: "...sorry Dad.", effects: { happiness: 1 }, rep: 3 },
                    { text: "Whatever.", effects: {}, rep: -1 }
                ]
            }}
        ]},
        { text: "Remember, work hard and you'll do great things.", options: [
            { text: "I will, Dad!", effects: { intelligence: 1, happiness: 1 }, rep: 2 },
            { text: "Whatever you say...", effects: {}, rep: -2, response: {
                text: "Hey, I'm serious. You'll thank me one day.", options: [
                    { text: "Okay okay, I hear you.", effects: { intelligence: 1 }, rep: 1 },
                    { text: "Sure, Dad.", effects: {}, rep: -1 }
                ]
            }}
        ]}
    ],
    'Sibling': [
        { text: "Wanna play? I'm bored!", options: [
            { text: "Sure! Let's go!", effects: { happiness: 2, charisma: 1 }, rep: 3, response: {
                text: "Yay! Okay, what should we play?", options: [
                    { text: "Hide and seek!", effects: { happiness: 2, health: 1 }, rep: 2 },
                    { text: "Video games!", effects: { happiness: 2 }, rep: 1 },
                    { text: "Let's build a fort!", effects: { happiness: 3 }, rep: 3 }
                ]
            }},
            { text: "Leave me alone!", effects: { charisma: -1 }, rep: -3, response: {
                text: "Fine! I'll tell Mom you're being mean!", options: [
                    { text: "Go ahead, see if I care.", effects: {}, rep: -2 },
                    { text: "Wait, okay fine let's play.", effects: { happiness: 1 }, rep: 2 }
                ]
            }},
            { text: "Only if I get to pick the game", effects: { charisma: 1 }, rep: 0, response: {
                text: "Ugh, fine! But I pick next time!", options: [
                    { text: "Deal!", effects: { happiness: 2 }, rep: 2 },
                    { text: "We'll see about that.", effects: { charisma: 1 }, rep: -1 }
                ]
            }}
        ]}
    ],
    'Teacher': [
        { text: "Have you finished your homework?", options: [
            { text: "Yes! All done!", effects: { intelligence: 2 }, rep: 3, response: {
                text: "Wonderful! Keep up the great work. You're one of my best students.", options: [
                    { text: "Thanks, teacher!", effects: { happiness: 2 }, rep: 2 },
                    { text: "Can I get extra credit?", effects: { intelligence: 1 }, rep: 1 }
                ]
            }},
            { text: "Uh... almost...", effects: {}, rep: 0, response: {
                text: "Well, make sure it's done by tomorrow! No excuses.", options: [
                    { text: "I'll have it done, I promise!", effects: { intelligence: 1 }, rep: 2 },
                    { text: "Yeah, yeah...", effects: {}, rep: -2 }
                ]
            }},
            { text: "Homework is pointless!", effects: { intelligence: -1 }, rep: -5, response: {
                text: "Excuse me? That attitude won't get you far. See me after class.", options: [
                    { text: "Sorry, I didn't mean it...", effects: { charisma: 1 }, rep: 3 },
                    { text: "Make me.", effects: {}, rep: -5 }
                ]
            }}
        ]},
        { text: "Excellent work on the test!", options: [
            { text: "Thanks! I studied hard!", effects: { intelligence: 2, happiness: 1 }, rep: 3, response: {
                text: "It really shows! Have you thought about joining the honors program?", options: [
                    { text: "That sounds great!", effects: { intelligence: 2, happiness: 1 }, rep: 3 },
                    { text: "I'll think about it.", effects: { intelligence: 1 }, rep: 1 }
                ]
            }},
            { text: "It was pretty easy", effects: { charisma: 1 }, rep: -1, response: {
                text: "Don't get cocky. The next one will be much harder.", options: [
                    { text: "Bring it on!", effects: { charisma: 1 }, rep: 1 },
                    { text: "I was just kidding...", effects: {}, rep: 1 }
                ]
            }}
        ]}
    ],
    'Kid': [
        { text: "Wanna be friends?", options: [
            { text: "Sure! What's your name?", effects: { charisma: 2, happiness: 2 }, rep: 5, friend: true, response: {
                text: "Awesome! Wanna come play at recess?", options: [
                    { text: "Yeah! Let's go!", effects: { happiness: 2, health: 1 }, rep: 2 },
                    { text: "Sure, what should we play?", effects: { happiness: 1 }, rep: 1 }
                ]
            }},
            { text: "No, you're weird.", effects: { charisma: -2 }, rep: -8, enemy: true, response: {
                text: "...fine. You're mean anyway!", options: [
                    { text: "Good, get lost.", effects: {}, rep: -3 },
                    { text: "Wait, I'm sorry...", effects: { charisma: 1 }, rep: 3 }
                ]
            }},
            { text: "OK, but I'm in charge", effects: { charisma: 1 }, rep: -2, response: {
                text: "Fine! But I get to pick the game first!", options: [
                    { text: "Deal!", effects: { happiness: 1 }, rep: 2 },
                    { text: "No way, I pick!", effects: { charisma: 1 }, rep: -2 }
                ]
            }}
        ]},
        { text: "Tag! You're it!", options: [
            { text: "Hey! Come back here!", effects: { health: 1, happiness: 2 }, rep: 3, response: {
                text: "Haha you can't catch me! I'm the fastest kid in school!", options: [
                    { text: "Oh yeah? Watch this!", effects: { health: 1, happiness: 1 }, rep: 1 },
                    { text: "Okay okay, you win!", effects: { happiness: 1 }, rep: 2 }
                ]
            }},
            { text: "I don't play stupid games", effects: {}, rep: -5, response: {
                text: "Jeez, you're no fun! Fine, I'll find someone else.", options: [
                    { text: "Good.", effects: {}, rep: -1 },
                    { text: "Wait... okay fine, let's play.", effects: { happiness: 1 }, rep: 3 }
                ]
            }}
        ]},
        { text: "Psst... check this out. I found this in my brother's room.", options: [
            { text: "Whoa, is that a switchblade? Can I have it?", effects: { charisma: 1 }, rep: -3, giveSwitchblade: true, response: {
                text: "Uhh... sure I guess. Just don't tell anyone where you got it!", options: [
                    { text: "Your secret's safe with me.", effects: { charisma: 1 }, rep: 1 },
                    { text: "Yeah yeah, thanks!", effects: {}, rep: 0 }
                ]
            }},
            { text: "That's dangerous! Put it away!", effects: { intelligence: 1 }, rep: 5, response: {
                text: "You sound like my mom! Fine, I'll put it back...", options: [
                    { text: "Good. You could get hurt.", effects: { intelligence: 1 }, rep: 2 },
                    { text: "Actually wait, let me see it.", effects: { happiness: 1 }, rep: -2 }
                ]
            }},
            { text: "Cool! Let me see!", effects: { happiness: 1 }, rep: -1, response: {
                text: "Careful! It's super sharp. My brother would kill me if he knew.", options: [
                    { text: "Can I keep it?", effects: { charisma: 1 }, rep: -2, giveSwitchblade: true },
                    { text: "Better put it back before someone sees.", effects: { intelligence: 1 }, rep: 2 }
                ]
            }}
        ]}
    ],
    'Student': [
        { text: "This class is so boring, right?", options: [
            { text: "I actually think it's interesting", effects: { intelligence: 2 }, rep: 1, response: {
                text: "Seriously? You're such a nerd! ...no offense though.", options: [
                    { text: "None taken! Knowledge is power.", effects: { intelligence: 1 }, rep: 1 },
                    { text: "At least I'll pass the test.", effects: { charisma: 1 }, rep: 0 }
                ]
            }},
            { text: "Yeah, let's skip!", effects: { charisma: 2, intelligence: -1 }, rep: -4, response: {
                text: "For real? Alright, meet me by the back door at lunch!", options: [
                    { text: "I'll be there!", effects: { happiness: 2, charisma: 1 }, rep: -2 },
                    { text: "Actually, never mind. Too risky.", effects: { intelligence: 1 }, rep: 2 }
                ]
            }},
            { text: "At least it's almost over", effects: { happiness: 1 }, rep: 1 }
        ]},
        { text: "Want to study together for the exam?", options: [
            { text: "Yes! Great idea!", effects: { intelligence: 3, charisma: 1 }, rep: 5, friend: true, response: {
                text: "Sweet! Library after school? I'll bring snacks!", options: [
                    { text: "Perfect, see you there!", effects: { happiness: 1, intelligence: 1 }, rep: 2 },
                    { text: "Make it your place, the library is boring.", effects: { charisma: 1 }, rep: 0 }
                ]
            }},
            { text: "Nah, I'll wing it", effects: { charisma: 1 }, rep: -1, response: {
                text: "Bold strategy... good luck with that!", options: [
                    { text: "I always land on my feet.", effects: { charisma: 1 }, rep: 0 },
                    { text: "Yeah I might regret this.", effects: { happiness: -1 }, rep: 1 }
                ]
            }},
            { text: "Study by yourself, loser", effects: {}, rep: -10, enemy: true }
        ]},
        { text: "There's a party this weekend!", options: [
            { text: "I'll be there!", effects: { happiness: 3, charisma: 2 }, rep: 3, cost: 20, response: {
                text: "Awesome! It's gonna be epic! Bring your own drinks though.", options: [
                    { text: "Say no more!", effects: { happiness: 1 }, rep: 1 },
                    { text: "Who else is coming?", effects: { charisma: 1 }, rep: 1 }
                ]
            }},
            { text: "I need to study", effects: { intelligence: 2 }, rep: -1, response: {
                text: "You're no fun! But hey, good luck on the test.", options: [
                    { text: "Thanks! Have fun at the party.", effects: { happiness: 1 }, rep: 2 },
                    { text: "Whatever.", effects: {}, rep: -1 }
                ]
            }},
            { text: "Parties are lame", effects: {}, rep: -4, response: {
                text: "Wow okay... suit yourself. More fun for the rest of us.", options: [
                    { text: "Fine, maybe I'll show up.", effects: { happiness: 1 }, rep: 2 },
                    { text: "I said what I said.", effects: {}, rep: -1 }
                ]
            }}
        ]},
        { text: "Yo, look what I got from my cousin... don't tell anyone.", options: [
            { text: "A switchblade?! Give it to me!", effects: { charisma: 1 }, rep: -5, giveSwitchblade: true, response: {
                text: "Whoa easy! Alright fine, take it. But you didn't get it from me.", options: [
                    { text: "I don't even know your name.", effects: { charisma: 1 }, rep: 0 },
                    { text: "Thanks, I owe you one.", effects: {}, rep: 1 }
                ]
            }},
            { text: "Dude, you'll get expelled!", effects: { intelligence: 1 }, rep: 3, response: {
                text: "Relax! Nobody's gonna find out. You're not gonna snitch, right?", options: [
                    { text: "Your secret's safe.", effects: { charisma: 1 }, rep: 2 },
                    { text: "Just be careful, man.", effects: { intelligence: 1 }, rep: 1 }
                ]
            }},
            { text: "That's sick! Can I hold it?", effects: { happiness: 1 }, rep: -2, response: {
                text: "Careful with it! My cousin said it's real sharp.", options: [
                    { text: "Can I keep it?", effects: { charisma: 1 }, rep: -3, giveSwitchblade: true },
                    { text: "Okay that's enough, here.", effects: {}, rep: 1 }
                ]
            }}
        ]}
    ],
    'Professor': [
        { text: "Your thesis is showing real promise.", options: [
            { text: "Thank you, professor!", effects: { intelligence: 3, happiness: 2 }, rep: 3, response: {
                text: "Have you considered submitting it for publication? I could write you a recommendation.", options: [
                    { text: "That would be amazing! Yes please!", effects: { intelligence: 2, happiness: 2 }, rep: 5 },
                    { text: "I'll think about it.", effects: { intelligence: 1 }, rep: 1 }
                ]
            }},
            { text: "I've been working really hard", effects: { intelligence: 2 }, rep: 2, response: {
                text: "It shows. Keep at it and you'll go far in this field.", options: [
                    { text: "That means a lot coming from you.", effects: { happiness: 2 }, rep: 3 },
                    { text: "I plan to!", effects: { intelligence: 1 }, rep: 1 }
                ]
            }}
        ]}
    ],
    'Coworker': [
        { text: "Want to grab coffee?", options: [
            { text: "Sure, my treat! ($5)", effects: { charisma: 2, happiness: 1 }, rep: 5, cost: 5, friend: true, response: {
                text: "Aw, you don't have to! But thanks. So, how's life treating you?", options: [
                    { text: "Pretty good actually! Can't complain.", effects: { happiness: 1 }, rep: 1 },
                    { text: "Could be better honestly...", effects: { charisma: 1 }, rep: 2 }
                ]
            }},
            { text: "Yeah, but you're buying", effects: { charisma: 1 }, rep: -1, response: {
                text: "Ha! Fine, but you owe me next time.", options: [
                    { text: "Deal!", effects: { happiness: 1 }, rep: 2 },
                    { text: "We'll see about that.", effects: { charisma: 1 }, rep: -1 }
                ]
            }},
            { text: "Go away, I'm busy", effects: { intelligence: 1 }, rep: -6, response: {
                text: "Jeez, someone woke up on the wrong side of the bed...", options: [
                    { text: "Sorry, I'm just stressed.", effects: { charisma: 1 }, rep: 3 },
                    { text: "You heard me.", effects: {}, rep: -3 }
                ]
            }}
        ]},
        { text: "Did you hear about the promotion opening?", options: [
            { text: "May the best person win!", effects: { charisma: 2 }, rep: 5, response: {
                text: "Agreed! Let's both give it our best shot. No hard feelings either way?", options: [
                    { text: "Absolutely. May the best person win.", effects: { charisma: 1 }, rep: 3 },
                    { text: "Sure... but I'm getting it.", effects: { charisma: 1 }, rep: -1 }
                ]
            }},
            { text: "It's mine. Back off.", effects: { charisma: -2 }, rep: -10, enemy: true, response: {
                text: "Wow... okay. We'll see about that.", options: [
                    { text: "Yeah. We will.", effects: {}, rep: -2 },
                    { text: "Sorry, that came out wrong.", effects: { charisma: 1 }, rep: 3 }
                ]
            }},
            { text: "I'm happy where I am", effects: { happiness: 2 }, rep: 2 }
        ]}
    ],
    'Boss': [
        { text: "I need that report done by end of day.", options: [
            { text: "Consider it done!", effects: { intelligence: 1 }, rep: 3, money: 50, response: {
                text: "That's what I like to hear! Keep this up and good things will come your way.", options: [
                    { text: "I appreciate that, boss.", effects: { happiness: 1 }, rep: 2 },
                    { text: "I hope so!", effects: { happiness: 1 }, rep: 1 }
                ]
            }},
            { text: "I'll need overtime pay...", effects: { charisma: 1 }, rep: -2, money: 80, response: {
                text: "Fine. Double time. But it better be flawless.", options: [
                    { text: "It will be. You can count on me.", effects: { intelligence: 1 }, rep: 3 },
                    { text: "No promises.", effects: {}, rep: -3 }
                ]
            }},
            { text: "Do it yourself!", effects: {}, rep: -15, response: {
                text: "Excuse me?! We need to have a serious talk about your attitude.", options: [
                    { text: "I'm sorry, I'm just having a bad day.", effects: { charisma: 1 }, rep: 5 },
                    { text: "I said what I said.", effects: {}, rep: -5 }
                ]
            }}
        ]},
        { text: "Great quarter! Here's a bonus.", options: [
            { text: "Thank you! I earned it!", effects: { happiness: 3 }, rep: 2, money: 200, response: {
                text: "You did! And there's more where that came from if you keep performing.", options: [
                    { text: "I'll keep grinding!", effects: { happiness: 1, intelligence: 1 }, rep: 2 },
                    { text: "Music to my ears!", effects: { happiness: 2 }, rep: 1 }
                ]
            }},
            { text: "I couldn't do it without the team", effects: { charisma: 3 }, rep: 8, money: 150, friend: true, response: {
                text: "That kind of attitude is exactly why this team works so well. I respect that.", options: [
                    { text: "Teamwork makes the dream work!", effects: { charisma: 1 }, rep: 2 },
                    { text: "Thanks, boss. Means a lot.", effects: { happiness: 2 }, rep: 2 }
                ]
            }}
        ]}
    ],
    'Stranger': [
        { text: "Excuse me, do you have the time?", options: [
            { text: "Sure! It's about noon.", effects: { charisma: 1 }, rep: 3, response: {
                text: "Thanks so much! Have a great day!", options: [
                    { text: "You too!", effects: { happiness: 1 }, rep: 1 },
                    { text: "No problem.", effects: {}, rep: 0 }
                ]
            }},
            { text: "Get lost.", effects: {}, rep: -8 },
            { text: "Sorry, I'm in a hurry", effects: {}, rep: 0 }
        ]},
        { text: "Nice weather today, huh?", options: [
            { text: "Beautiful day!", effects: { happiness: 1 }, rep: 2, response: {
                text: "Makes you want to just be outside all day! You from around here?", options: [
                    { text: "Yeah, lived here my whole life!", effects: { charisma: 1 }, rep: 2, friend: true },
                    { text: "Just passing through.", effects: {}, rep: 0 }
                ]
            }},
            { text: "Mind your own business", effects: {}, rep: -5 }
        ]}
    ],
    'Old Friend': [
        { text: "Remember when we were young? Those were the days...", options: [
            { text: "Best years of my life!", effects: { happiness: 3 }, rep: 3, response: {
                text: "Right?! We should hang out more like the old days. What do you say?", options: [
                    { text: "Absolutely! Let's plan something!", effects: { happiness: 3, charisma: 2 }, rep: 5 },
                    { text: "Yeah, we really should.", effects: { happiness: 1 }, rep: 2 }
                ]
            }},
            { text: "I think life keeps getting better", effects: { happiness: 2, intelligence: 1 }, rep: 5, response: {
                text: "That's a great way to look at it. You always were the optimist!", options: [
                    { text: "Gotta stay positive!", effects: { happiness: 2 }, rep: 2 },
                    { text: "Learned it from you!", effects: { charisma: 2 }, rep: 3 }
                ]
            }},
            { text: "I try not to look back", effects: {}, rep: -1 }
        ]}
    ],
    'Neighbor': [
        { text: "Lovely garden you've got!", options: [
            { text: "Thanks! Want some tomatoes?", effects: { charisma: 2, happiness: 1 }, rep: 8, friend: true, response: {
                text: "Oh yes please! I'll bring you some of my cookies in return!", options: [
                    { text: "That sounds wonderful!", effects: { happiness: 2 }, rep: 3 },
                    { text: "No need, happy to share!", effects: { charisma: 1 }, rep: 2 }
                ]
            }},
            { text: "Stay off my lawn!", effects: {}, rep: -10, enemy: true, response: {
                text: "Well! I was just trying to be friendly! Some neighbor you are.", options: [
                    { text: "Sorry, I didn't mean it like that.", effects: { charisma: 1 }, rep: 5 },
                    { text: "And stay off it!", effects: {}, rep: -3 }
                ]
            }}
        ]}
    ],
    'Grandchild': [
        { text: "Grandma/Grandpa! Tell me a story!", options: [
            { text: "Let me tell you about when I was your age...", effects: { happiness: 5 }, rep: 5, response: {
                text: "Wow really?! Tell me more! What happened next?", options: [
                    { text: "Well, one time I got into all sorts of trouble...", effects: { happiness: 3, charisma: 1 }, rep: 3 },
                    { text: "Maybe another time, kiddo.", effects: { happiness: 1 }, rep: 0 }
                ]
            }},
            { text: "How about we get ice cream? ($8)", effects: { happiness: 4, charisma: 2 }, rep: 5, cost: 8, response: {
                text: "YAY! Can I get sprinkles?!", options: [
                    { text: "You can get whatever you want!", effects: { happiness: 3 }, rep: 3 },
                    { text: "Of course! All the sprinkles!", effects: { happiness: 2 }, rep: 2 }
                ]
            }}
        ]}
    ]
};

// DEALER DIALOGUES (contraband purchases)
LIFE.NPC_DIALOGUES['Dealer'] = [
    { text: "Psst... I got some items you won't find at any store. Interested?", options: [
        { text: "Show me what you got.", effects: {}, rep: -2, openDealer: true },
        { text: "No thanks, I'm clean.", effects: { happiness: 1 }, rep: 2, response: {
            text: "Suit yourself. You know where to find me if you change your mind.", options: [
                { text: "I won't.", effects: { happiness: 1 }, rep: 2 },
                { text: "Actually... wait. Show me.", effects: {}, rep: -3, openDealer: true }
            ]
        }},
        { text: "I should report you!", effects: { charisma: 2 }, rep: 8, response: {
            text: "Whoa whoa, let's not do anything crazy here. You didn't see nothing, alright?", options: [
                { text: "Get out of here.", effects: { charisma: 1 }, rep: 3 },
                { text: "Fine. But I'm watching you.", effects: { charisma: 1 }, rep: 2 }
            ]
        }}
    ]},
    { text: "Back again? I got fresh stock today.", options: [
        { text: "Let me see.", effects: {}, rep: -2, openDealer: true },
        { text: "Not today.", effects: {}, rep: 0 }
    ]}
];

// INMATE DIALOGUES
LIFE.NPC_DIALOGUES['Inmate'] = [
    { text: "First time in here? You'll get used to it.", options: [
        { text: "How long you been here?", effects: { charisma: 1 }, rep: 2, response: {
            text: "Going on three years. Time moves different in here. Just keep your head down.", options: [
                { text: "Three years? What'd you do?", effects: { charisma: 1 }, rep: 1, response: {
                    text: "That's not something you ask people in here. Rule number one.", options: [
                        { text: "Sorry, my bad.", effects: { intelligence: 1 }, rep: 2 },
                        { text: "Fair enough.", effects: {}, rep: 1 }
                    ]
                }},
                { text: "Thanks for the heads up.", effects: { intelligence: 1 }, rep: 2 }
            ]
        }},
        { text: "Leave me alone.", effects: {}, rep: -3 },
        { text: "Any tips for surviving?", effects: { intelligence: 1 }, rep: 3, response: {
            text: "Don't stare at anyone, don't take anything from anyone, and find someone to watch your back.", options: [
                { text: "Would you watch my back?", effects: { charisma: 2 }, rep: 3, friend: true },
                { text: "I'll keep that in mind.", effects: { intelligence: 1 }, rep: 1 }
            ]
        }}
    ]},
    { text: "Keep your head down and don't make enemies.", options: [
        { text: "Thanks for the advice.", effects: { intelligence: 1 }, rep: 3, response: {
            text: "Don't mention it. Seriously. Don't mention it to anyone.", options: [
                { text: "Got it. Lips sealed.", effects: { intelligence: 1 }, rep: 2 },
                { text: "You're alright, you know that?", effects: { charisma: 1 }, rep: 2 }
            ]
        }},
        { text: "I can handle myself.", effects: { charisma: 1 }, rep: -2, response: {
            text: "Ha! That's what they all say. We'll see how long that lasts.", options: [
                { text: "Watch me.", effects: { charisma: 1 }, rep: -1 },
                { text: "Maybe you're right...", effects: { intelligence: 1 }, rep: 2 }
            ]
        }}
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
    if (opt.hospital) {
        // send player to hospital after dialogue closes
        setTimeout(function() {
            if (LIFE.state.gamePhase === 'playing' && LIFE.state.currentStage !== 'hospital') {
                LIFE.sendToHospital(opt.hospital);
            }
        }, 2000);
    }
    if (opt.hospitalExit) {
        // exit hospital after dialogue closes
        setTimeout(function() {
            if (LIFE.state.currentStage === 'hospital' && LIFE.state.gamePhase === 'playing') {
                LIFE.exitHospital();
            }
        }, 2000);
    }
    if (opt.rehab) {
        // rehab reduces drug uses
        LIFE.state.drugUses = Math.max(0, LIFE.state.drugUses - 2);
    }
    if (opt.giveSwitchblade) {
        if (!LIFE.state.hasSwitchblade) {
            LIFE.state.hasSwitchblade = true;
            if (LIFE.state.inventory.indexOf('Switchblade') < 0) LIFE.state.inventory.push('Switchblade');
            LIFE.ui.showPopup('Switchblade acquired! Punch damage increased.', '#ff9800');
        } else {
            LIFE.ui.showPopup('You already have a switchblade.', '#ff9800');
        }
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

    // store selected option for dialogue tree chaining
    LIFE.dialogue._selectedOpt = opt;

    // show player's response then continue or close
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
            var selOpt = LIFE.dialogue._selectedOpt;
            LIFE.dialogue._selectedOpt = null;
            // chain to follow-up if option has a response tree
            if (selOpt && selOpt.response && LIFE.dialogue.npc && LIFE.dialogue.npc.alive) {
                var resp = selOpt.response;
                var spkName = LIFE.dialogue.npc.name || LIFE.dialogue.npc.type;
                LIFE.dialogue.showing = 'npc';
                LIFE.dialogue.current = { speaker: spkName, text: resp.text, options: resp.options, isDecision: false };
                LIFE.dialogue.fullText = resp.text;
                LIFE.dialogue.displayText = '';
                LIFE.dialogue.textIndex = 0;
                LIFE.dialogue.textTimer = 0;
                LIFE.dialogue.selectedOption = -1;
                LIFE.dialogue.responseTimer = 0;
                var cEl = LIFE.dialogue.elements;
                cEl.name.textContent = spkName;
                cEl.text.textContent = '';
                cEl.options.innerHTML = '';
                cEl.options.style.display = 'none';
                cEl.response.style.display = 'none';
            } else {
                LIFE.dialogue.close();
            }
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
            { text: "You're it!", effects: { happiness: 3, health: 1 }, rep: 3, response: {
                text: "No fair, you always tag me first! Okay, you better run!", options: [
                    { text: "Catch me if you can!", effects: { health: 1, happiness: 2 }, rep: 1 },
                    { text: "I'm too fast for you!", effects: { happiness: 1, charisma: 1 }, rep: 0 }
                ]
            }},
            { text: "Let's go on an adventure!", effects: { happiness: 2, charisma: 1 }, rep: 2, response: {
                text: "Yeah! Let's pretend we're explorers! The playground is our jungle!", options: [
                    { text: "I'll be the leader! Follow me!", effects: { charisma: 2 }, rep: 1 },
                    { text: "We can take turns leading!", effects: { happiness: 1 }, rep: 2 }
                ]
            }}
        ]},
        { text: "I saved you a seat at lunch!", options: [
            { text: "Thanks! You're the best!", effects: { happiness: 2 }, rep: 3, response: {
                text: "I also have extra cookies! Want one?", options: [
                    { text: "Yes please! You're awesome!", effects: { happiness: 2 }, rep: 2 },
                    { text: "Only if you have chocolate chip!", effects: { happiness: 1 }, rep: 1 }
                ]
            }},
            { text: "Cool, let's eat!", effects: { happiness: 1 }, rep: 1 }
        ]}
    ],
    'Student': [
        { text: "Hey! Want to hang out after class?", options: [
            { text: "Definitely! Let's go!", effects: { happiness: 3, charisma: 1 }, rep: 3, response: {
                text: "Sweet! Where should we go? Mall? Park? Your call!", options: [
                    { text: "Mall! I need new stuff.", effects: { happiness: 1, charisma: 1 }, rep: 1 },
                    { text: "Let's just walk around and chill.", effects: { happiness: 2 }, rep: 2 }
                ]
            }},
            { text: "Can't today, but soon!", effects: { happiness: 1 }, rep: 1, response: {
                text: "No worries! Text me when you're free. We'll figure something out!", options: [
                    { text: "For sure! This weekend maybe?", effects: { happiness: 1 }, rep: 2 },
                    { text: "Will do!", effects: {}, rep: 1 }
                ]
            }}
        ]},
        { text: "Thanks for being a good friend. It means a lot.", options: [
            { text: "You too! We're in this together!", effects: { happiness: 3, charisma: 2 }, rep: 5, response: {
                text: "For real. I don't know what I'd do without you in this school.", options: [
                    { text: "Same here, honestly.", effects: { happiness: 2 }, rep: 3 },
                    { text: "We're gonna make it through!", effects: { happiness: 1, charisma: 1 }, rep: 2 }
                ]
            }},
            { text: "Don't get mushy on me!", effects: { happiness: 1 }, rep: 0, response: {
                text: "Ha! Fine fine. But for real though... thanks.", options: [
                    { text: "Anytime. That's what friends are for.", effects: { happiness: 1 }, rep: 3 },
                    { text: "Yeah yeah, I know.", effects: { happiness: 1 }, rep: 1 }
                ]
            }}
        ]},
        { text: "Want to study together? We both do better that way!", options: [
            { text: "Good idea! Let's hit the library!", effects: { intelligence: 3, happiness: 1 }, rep: 3, response: {
                text: "I'll grab us some snacks on the way! Brain food, you know?", options: [
                    { text: "You're a lifesaver!", effects: { happiness: 1 }, rep: 2 },
                    { text: "Focus first, snacks later!", effects: { intelligence: 1 }, rep: 0 }
                ]
            }},
            { text: "Sure, your place or mine?", effects: { intelligence: 2 }, rep: 2, response: {
                text: "Mine! My mom made snacks. She always makes extra when you come over.", options: [
                    { text: "Your mom is the best!", effects: { happiness: 2 }, rep: 2 },
                    { text: "Sweet, let's go!", effects: { happiness: 1 }, rep: 1 }
                ]
            }}
        ]}
    ],
    'Stranger': [
        { text: "Oh hey, it's you again! Good to see a familiar face!", options: [
            { text: "Same here! How've you been?", effects: { happiness: 1, charisma: 1 }, rep: 3, response: {
                text: "Can't complain! Life's treating me well. We should grab a coffee sometime!", options: [
                    { text: "I'd like that!", effects: { happiness: 2, charisma: 1 }, rep: 3 },
                    { text: "Maybe! See you around!", effects: { happiness: 1 }, rep: 1 }
                ]
            }},
            { text: "Hey! Small world!", effects: { happiness: 1 }, rep: 2 }
        ]}
    ],
    'Neighbor': [
        { text: "Hey neighbor! I baked too many cookies, want some?", options: [
            { text: "You're the best neighbor ever!", effects: { happiness: 3 }, rep: 5, response: {
                text: "Oh stop it! But seriously, come over anytime. My door's always open!", options: [
                    { text: "Same goes for you!", effects: { charisma: 1 }, rep: 3 },
                    { text: "I'll take you up on that!", effects: { happiness: 1 }, rep: 1 }
                ]
            }},
            { text: "Thanks! I'll bring dessert next time!", effects: { happiness: 2, charisma: 1 }, rep: 4 }
        ]},
        { text: "Want to come over for a barbecue this weekend?", options: [
            { text: "I'll bring the drinks!", effects: { happiness: 3, charisma: 2 }, rep: 5, cost: 20, response: {
                text: "Perfect! The more the merrier! I'm grilling burgers and ribs!", options: [
                    { text: "Can't wait!", effects: { happiness: 2 }, rep: 1 },
                    { text: "Should I invite anyone else?", effects: { charisma: 1 }, rep: 2 }
                ]
            }},
            { text: "Sounds fun! Count me in!", effects: { happiness: 2 }, rep: 3 }
        ]}
    ],
    'Coworker': [
        { text: "Hey buddy! Want to grab lunch together?", options: [
            { text: "My treat today! ($15)", effects: { happiness: 2, charisma: 2 }, rep: 5, cost: 15, response: {
                text: "You're too generous! I'll get it next time. What are you in the mood for?", options: [
                    { text: "Anything, I'm starving!", effects: { happiness: 1 }, rep: 1 },
                    { text: "Surprise me!", effects: { charisma: 1 }, rep: 2 }
                ]
            }},
            { text: "Sure, let's go!", effects: { happiness: 1 }, rep: 2 }
        ]},
        { text: "I put in a good word for you with the boss!", options: [
            { text: "You're a real one! Thanks!", effects: { happiness: 3, charisma: 1 }, rep: 5, response: {
                text: "Hey, you deserve it! Just remember me when you're running the place!", options: [
                    { text: "Ha! I'll make you VP!", effects: { charisma: 2, happiness: 1 }, rep: 3 },
                    { text: "I won't forget this!", effects: { happiness: 1 }, rep: 2 }
                ]
            }},
            { text: "I appreciate that!", effects: { happiness: 2 }, rep: 3 }
        ]}
    ],
    'Inmate': [
        { text: "Hey, I got your back in here.", options: [
            { text: "Same here. We stick together.", effects: { charisma: 2, happiness: 1 }, rep: 3, response: {
                text: "That's what it takes in here. Loyalty. Don't forget that.", options: [
                    { text: "Never.", effects: { charisma: 1 }, rep: 2 },
                    { text: "I won't. You can count on me.", effects: { happiness: 1 }, rep: 2 }
                ]
            }},
            { text: "Thanks. I needed that.", effects: { happiness: 2 }, rep: 2, response: {
                text: "We all need someone in here. Just stay out of trouble and we'll be fine.", options: [
                    { text: "Doing my best.", effects: { happiness: 1 }, rep: 1 },
                    { text: "Easier said than done...", effects: {}, rep: 0 }
                ]
            }}
        ]}
    ]
};

// Romance/flirting dialogues
LIFE.FLIRT_DIALOGUES = [
    { text: "You have the most beautiful smile I've ever seen.", success: 0.6 },
    { text: "Do you come here often? Because I'd remember someone like you.", success: 0.5 },
    { text: "I have to say, you're really easy to talk to.", success: 0.7 },
    { text: "Would you like to grab coffee sometime?", success: 0.65 },
    { text: "I can't help but notice how great you look today.", success: 0.55 },
    { text: "Has anyone ever told you that you have amazing eyes?", success: 0.6 },
    { text: "I'd love to get to know you better.", success: 0.65 },
    { text: "You're the most interesting person here.", success: 0.55 },
    { text: "I keep finding excuses to come talk to you.", success: 0.6 },
    { text: "Something about you just makes me smile.", success: 0.7 }
];

LIFE.ROMANCE_DIALOGUES = [
    { text: "I really enjoy spending time with you. You make me happy.", romance: 15 },
    { text: "Every time I see you, my day gets better.", romance: 12 },
    { text: "I've been thinking about you a lot lately...", romance: 10 },
    { text: "You mean the world to me.", romance: 18 },
    { text: "I can't imagine my life without you.", romance: 20 }
];

// Pick 2 random flirt line options for dialogue
LIFE.getFlirtOptions = function(targetName) {
    var lines = LIFE.FLIRT_DIALOGUES.slice();
    // shuffle and pick 2
    for (var i = lines.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = lines[i]; lines[i] = lines[j]; lines[j] = tmp;
    }
    var picked = lines.slice(0, 2);
    return picked.map(function(line) {
        return { text: '"' + line.text + '"', effects: { charisma: 1 }, rep: 1, flirt: true, flirtTarget: targetName };
    });
};

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
                { text: "Thanks! Will do!", effects: { happiness: 2 }, rep: 2, response: {
                    text: "That's the attitude! Big things are coming your way if you keep this up.", options: [
                        { text: "I appreciate that!", effects: { happiness: 1 }, rep: 1 },
                        { text: "Any chance of a raise?", effects: { charisma: 1 }, rep: -1, response: {
                            text: "Ha! Always pushing. We'll see at the next review.", options: [
                                { text: "Fair enough!", effects: { happiness: 1 }, rep: 1 },
                                { text: "I'll hold you to that.", effects: { charisma: 1 }, rep: 0 }
                            ]
                        }}
                    ]
                }},
                { text: "Actually, I quit.", effects: { happiness: -3 }, rep: -5, career: 'none', response: {
                    text: "What?! Are you serious? Well... if that's your decision. Good luck out there.", options: [
                        { text: "Thanks. Time for something new.", effects: { charisma: 1 }, rep: 0 },
                        { text: "See ya.", effects: {}, rep: -2 }
                    ]
                }}
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
                { text: "I'll work on it and come back.", effects: { intelligence: 1 }, rep: 2, response: {
                    text: "That's the spirit! We'd love to have you when you're ready.", options: [
                        { text: "I'll be back!", effects: { happiness: 1 }, rep: 2 },
                        { text: "Thanks for your time.", effects: {}, rep: 1 }
                    ]
                }},
                { text: "That's unfair!", effects: {}, rep: -3, response: {
                    text: "I'm sorry, I don't make the rules. Come back when you meet the requirements.", options: [
                        { text: "Fine.", effects: {}, rep: -1 },
                        { text: "I understand. Thanks anyway.", effects: { charisma: 1 }, rep: 2 }
                    ]
                }}
            ], true);
        } else {
            LIFE.dialogue.open(speakerName, "We're hiring for " + career.title + "! Pay is $" + career.income + "/work. Interested?", [
                { text: "Yes! I'll take the job!", effects: { happiness: 5 }, rep: 5, career: npc.careerType, response: {
                    text: "Welcome aboard! We're glad to have you. Report in tomorrow and we'll get you started!", options: [
                        { text: "I won't let you down!", effects: { happiness: 2 }, rep: 2 },
                        { text: "Looking forward to it!", effects: { happiness: 1 }, rep: 1 }
                    ]
                }},
                { text: "What are the benefits?", effects: { intelligence: 1 }, rep: 1, response: {
                    text: "Great question! We offer health insurance, paid time off, and room for advancement. The pay is $" + career.income + " per shift. What do you say?", options: [
                        { text: "I'm in! Sign me up!", effects: { happiness: 5 }, rep: 5, career: npc.careerType },
                        { text: "Let me think about it.", effects: {}, rep: 0 },
                        { text: "Not worth it.", effects: {}, rep: -3 }
                    ]
                }},
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
            { text: "I'm not that bad, really.", effects: { charisma: 1 }, rep: 3, response: {
                text: "Hmph... actions speak louder than words.", options: [
                    { text: "Give me a chance.", effects: { charisma: 1 }, rep: 3 },
                    { text: "Forget it then.", effects: {}, rep: -2 }
                ]
            }},
            { text: "You should be afraid.", effects: {}, rep: -8, enemy: true },
            { text: "I'm trying to change...", effects: { happiness: 1 }, rep: 5, response: {
                text: "We'll see about that... talk is cheap.", options: [
                    { text: "I mean it. Watch me.", effects: { charisma: 1 }, rep: 3 },
                    { text: "Whatever.", effects: {}, rep: -1 }
                ]
            }}
        ]};
        if (Math.random() < 0.5) {
            LIFE.dialogue.open(speakerName, fearDialogue.text, fearDialogue.options, false);
            return;
        }
    }

    // enemy dialogue
    if (relLevel <= -30) {
        var enemyDlg = { text: "I have nothing to say to you.", options: [
            { text: "I'm sorry for what happened.", effects: { charisma: 1 }, rep: 5, response: {
                text: "...I'll believe it when I see it.", options: [
                    { text: "Fair enough. I'll prove it.", effects: { charisma: 1 }, rep: 3 },
                    { text: "Fine, be that way.", effects: {}, rep: -2 }
                ]
            }},
            { text: "The feeling's mutual.", effects: {}, rep: -3 },
            { text: "Can we start over?", effects: { happiness: 1 }, rep: 8, response: {
                text: "Start over? After everything? ...I don't know.", options: [
                    { text: "Please. I've changed.", effects: { charisma: 2 }, rep: 5 },
                    { text: "Okay, forget I asked.", effects: {}, rep: -1 }
                ]
            }}
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
        var fOpts = fdlg.options.slice();
        // add flirt options to friend dialogues too
        if (LIFE.canFlirtWith(npc)) {
            LIFE.getFlirtOptions(npc.name).forEach(function(fo) { fOpts.push(fo); });
        }
        LIFE.dialogue.open(speakerName, fdlg.text, fOpts, false);
        return;
    }

    // default dialogues by type
    var dialogues = LIFE.NPC_DIALOGUES[type];
    if (!dialogues || dialogues.length === 0) {
        dialogues = [{ text: "...", options: [{ text: "Wave and smile", effects: { charisma: 1 }, rep: 1 }] }];
    }

    var dlg = dialogues[Math.floor(Math.random() * dialogues.length)];
    var finalOpts = dlg.options.slice();

    // add flirt options to eligible NPCs
    if (LIFE.canFlirtWith(npc)) {
        LIFE.getFlirtOptions(npc.name).forEach(function(fo) { finalOpts.push(fo); });
    }

    LIFE.dialogue.open(speakerName, dlg.text, finalOpts, false);
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

// Hospital dialogue - varies by reason
LIFE.dialogue.openHospitalDialogue = function(reason) {
    if (LIFE.dialogue.active) return;
    var state = LIFE.state;
    var speaker = 'Doctor';
    var text, options;

    switch (reason) {
        case 'nearDeath':
            text = "You were brought in on an emergency stretcher. Your vitals are dangerously low. We need to stabilize you immediately.";
            options = [
                { text: "Do whatever you need to, doc.", effects: { health: 25, happiness: -5 }, cost: 500, hospitalExit: true },
                { text: "I can't afford treatment...", effects: { health: 10 }, hospitalExit: true },
                { text: "Am I going to be okay?", effects: { health: 20, happiness: -3 }, cost: 300, hospitalExit: true }
            ];
            break;

        case 'illness':
            var illnesses = [
                "You've developed a high fever and severe chills. Looks like a bad infection.",
                "We ran some tests. You have a serious respiratory infection.",
                "Your bloodwork shows signs of a viral illness. You need rest and medication.",
                "You've come down with pneumonia. We need to treat this aggressively."
            ];
            text = illnesses[Math.floor(Math.random() * illnesses.length)];
            options = [
                { text: "Give me the full treatment ($300)", effects: { health: 15, happiness: -2 }, cost: 300, hospitalExit: true },
                { text: "Just give me some pills", effects: { health: 8 }, cost: 50, hospitalExit: true },
                { text: "I'll tough it out", effects: { health: -5, happiness: -3 }, hospitalExit: true }
            ];
            break;

        case 'parentCheckin':
            speaker = 'Doctor';
            if (state.stats.happiness < 5) {
                text = "Your parents brought you in because they're worried about you. You seem very unhappy. Let's talk about what's going on.";
            } else {
                text = "Your parents brought you in for a checkup. They say you've been acting differently lately. Let's make sure everything is okay.";
            }
            options = [
                { text: "I'm fine... can I go home?", effects: { happiness: 2 }, hospitalExit: true },
                { text: "I guess I have been feeling down...", effects: { happiness: 8, health: 3 }, hospitalExit: true },
                { text: "My parents are overreacting!", effects: { happiness: -2, charisma: 1 }, hospitalExit: true }
            ];
            break;

        case 'overdose':
            text = "You were brought in after collapsing. The tests show dangerous levels of substances in your system. This is very serious.";
            options = [
                { text: "I need to quit... help me ($500)", effects: { health: 15, happiness: 5 }, cost: 500, hospitalExit: true, rehab: true },
                { text: "I didn't take that much...", effects: { health: 8, happiness: -5 }, cost: 200, hospitalExit: true },
                { text: "Just patch me up and let me go", effects: { health: 5, happiness: -3 }, hospitalExit: true }
            ];
            break;

        case 'foodPoisoning':
            text = "Looks like a nasty case of food poisoning. We'll get you hydrated and feeling better.";
            options = [
                { text: "Thanks doc, give me the IV drip ($100)", effects: { health: 10, happiness: 2 }, cost: 100, hospitalExit: true },
                { text: "Ugh, I'm never eating there again", effects: { health: 5, happiness: -1 }, hospitalExit: true }
            ];
            break;

        case 'injury':
            text = "You've sustained some injuries. Let me take a look at the damage. We may need to do some stitching.";
            options = [
                { text: "Fix me up, doc ($200)", effects: { health: 20, happiness: 2 }, cost: 200, hospitalExit: true },
                { text: "Just bandage it up", effects: { health: 8 }, cost: 50, hospitalExit: true },
                { text: "Is it bad?", effects: { health: 12, happiness: -2 }, cost: 100, hospitalExit: true }
            ];
            break;

        case 'carAccident':
            text = "You were brought in after a car accident. You have some bruising and we need to check for internal injuries.";
            options = [
                { text: "Run all the tests ($400)", effects: { health: 18, happiness: -3 }, cost: 400, hospitalExit: true },
                { text: "I feel okay, just sore", effects: { health: 8 }, cost: 100, hospitalExit: true },
                { text: "Will I be alright?", effects: { health: 12, happiness: -2 }, cost: 200, hospitalExit: true }
            ];
            break;

        default:
            text = "Let's take a look at you. How are you feeling?";
            options = [
                { text: "Not great, doc.", effects: { health: 10 }, cost: 100, hospitalExit: true },
                { text: "I'll be fine", effects: { health: 3 }, hospitalExit: true }
            ];
    }

    LIFE.dialogue.open(speaker, text, options, true);
};

// NPC dialogues for Doctor and Nurse (when talking to them manually)
LIFE.NPC_DIALOGUES['Doctor'] = [
    { text: "How are you feeling? Any pain or discomfort?", options: [
        { text: "A little sore, but okay", effects: { health: 3, happiness: 1 }, rep: 1, response: {
            text: "That's normal. Give it a day or two and you should feel much better. Any questions?", options: [
                { text: "How long do I need to stay?", effects: { happiness: 1 }, rep: 1, response: {
                    text: "You should be good to go soon. Just take it easy out there.", options: [
                        { text: "Thanks, doc. I'm ready to leave.", effects: { happiness: 1 }, hospitalExit: true },
                        { text: "I'll rest a bit more first.", effects: { health: 2 }, rep: 1 }
                    ]
                }},
                { text: "No, I'm good. Thanks.", effects: {}, rep: 1 }
            ]
        }},
        { text: "When can I leave?", effects: { happiness: 2 }, hospitalExit: true },
        { text: "Can you give me something for the pain? ($50)", effects: { health: 5, happiness: 3 }, cost: 50, response: {
            text: "Here you go. Take these with food and get plenty of rest.", options: [
                { text: "Will do. Am I good to leave?", effects: { happiness: 1 }, hospitalExit: true },
                { text: "Thanks, doc.", effects: { happiness: 1 }, rep: 1 }
            ]
        }}
    ]},
    { text: "Your vitals are looking better. Rest is the best medicine.", options: [
        { text: "Thanks, doc", effects: { health: 2, happiness: 2 }, rep: 2, response: {
            text: "Of course. Take care of yourself out there. And don't hesitate to come back if anything changes.", options: [
                { text: "I will. Thanks for everything.", effects: { happiness: 1 }, rep: 2 },
                { text: "Hopefully I won't need to!", effects: { happiness: 1 }, rep: 1 }
            ]
        }},
        { text: "I feel ready to go", effects: { happiness: 1 }, hospitalExit: true }
    ]}
];
LIFE.NPC_DIALOGUES['Nurse'] = [
    { text: "Can I get you anything? Water? An extra blanket?", options: [
        { text: "Some water would be great", effects: { health: 2, happiness: 2 }, rep: 2, response: {
            text: "Here you go! Let me know if you need anything else. The doctor will check on you soon.", options: [
                { text: "Thank you so much!", effects: { happiness: 1 }, rep: 2 },
                { text: "When can I see the doctor?", effects: {}, rep: 1, response: {
                    text: "Shouldn't be long now! Just sit tight.", options: [
                        { text: "Alright, thanks.", effects: { happiness: 1 }, rep: 1 },
                        { text: "Okay.", effects: {}, rep: 0 }
                    ]
                }}
            ]
        }},
        { text: "I'm good, thanks", effects: { happiness: 1 }, rep: 1 }
    ]},
    { text: "Time for your medication!", options: [
        { text: "Okay, give it here", effects: { health: 5 }, rep: 1, response: {
            text: "There you go! You should start feeling better in about 20 minutes.", options: [
                { text: "Thanks, nurse.", effects: { happiness: 1 }, rep: 1 },
                { text: "Can't wait.", effects: {}, rep: 0 }
            ]
        }},
        { text: "Do I have to?", effects: { health: 2, happiness: -1 }, rep: -1, response: {
            text: "Doctor's orders! Trust me, you'll feel a lot better after.", options: [
                { text: "Fine, give it here.", effects: { health: 3 }, rep: 1 },
                { text: "Ugh, okay...", effects: { health: 2 }, rep: 0 }
            ]
        }}
    ]}
];

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
