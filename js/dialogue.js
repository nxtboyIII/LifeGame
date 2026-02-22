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
            { text: "Cause trouble and skip class", effects: { happiness: 3 }, rep: -5, tag: 'rebel' }
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
            { text: "Skip college, start working", effects: { charisma: 3 }, rep: 0, tag: 'nocollege', career: 'worker', money: 500 }
        ]
    },
    25: {
        speaker: 'You',
        text: "[LIFE CHOICE] You're 25 now. What's your love life looking like?",
        isDecision: true,
        options: [
            { text: "I'm ready to settle down (meet someone)", effects: { happiness: 8, charisma: 5 }, rep: 5, tag: 'lookforlove' },
            { text: "I'm dating around, nothing serious", effects: { happiness: 5, charisma: 3 }, rep: 0, tag: 'dating' },
            { text: "I prefer being independent", effects: { charisma: 5, intelligence: 3 }, rep: 0, tag: 'single' }
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
            { text: "Buy something expensive!", effects: { happiness: 8 }, rep: 0, tag: 'splurge', cost: 5000 }
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
            { text: "Homework is pointless!", effects: { intelligence: -1 }, rep: -1, response: {
                text: "Excuse me? That attitude won't get you far. See me after class.", options: [
                    { text: "Sorry, I didn't mean it...", effects: { charisma: 1 }, rep: 3 },
                    { text: "Make me.", effects: {}, rep: -2 }
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
            { text: "No, you're weird.", effects: { charisma: -2 }, rep: -2, enemy: true, response: {
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
            { text: "I don't play stupid games", effects: {}, rep: -1, response: {
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
            { text: "Yeah, let's skip!", effects: { charisma: 2, intelligence: -1 }, rep: -1, response: {
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
            { text: "Study by yourself, loser", effects: {}, rep: -2, enemy: true }
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
            { text: "Parties are lame", effects: {}, rep: -1, response: {
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
            { text: "Go away, I'm busy", effects: { intelligence: 1 }, rep: -1, response: {
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
            { text: "It's mine. Back off.", effects: { charisma: -2 }, rep: -3, enemy: true, response: {
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
            { text: "Do it yourself!", effects: {}, rep: -3, response: {
                text: "Excuse me?! We need to have a serious talk about your attitude.", options: [
                    { text: "I'm sorry, I'm just having a bad day.", effects: { charisma: 1 }, rep: 5 },
                    { text: "I said what I said.", effects: {}, rep: -2 }
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
            { text: "Get lost.", effects: {}, rep: -2 },
            { text: "Sorry, I'm in a hurry", effects: {}, rep: 0 }
        ]},
        { text: "Nice weather today, huh?", options: [
            { text: "Beautiful day!", effects: { happiness: 1 }, rep: 2, response: {
                text: "Makes you want to just be outside all day! You from around here?", options: [
                    { text: "Yeah, lived here my whole life!", effects: { charisma: 1 }, rep: 2, friend: true },
                    { text: "Just passing through.", effects: {}, rep: 0 }
                ]
            }},
            { text: "Mind your own business", effects: {}, rep: -1 }
        ]},
        { text: "Hey, you dropped something!", options: [
            { text: "Oh thanks! What would I do without you?", effects: { happiness: 2, charisma: 1 }, rep: 3, friend: true },
            { text: "That's not mine.", effects: {}, rep: 0 },
            { text: "Just keep it.", effects: {}, rep: -1 }
        ]},
        { text: "Do you know any good restaurants around here?", options: [
            { text: "There's a great place down the street!", effects: { charisma: 2 }, rep: 5, response: {
                text: "Perfect! Thanks for the tip! Maybe I'll see you there sometime.", options: [
                    { text: "Anytime! Enjoy!", effects: { happiness: 1 }, rep: 2, friend: true },
                    { text: "Sure, maybe.", effects: {}, rep: 0 }
                ]
            }},
            { text: "I don't eat out much.", effects: {}, rep: 0 },
            { text: "Figure it out yourself.", effects: {}, rep: -3 }
        ]},
        { text: "I've been having the worst day. My car broke down, I'm late for work...", options: [
            { text: "I'm sorry to hear that. Need a ride?", effects: { charisma: 3, happiness: 2 }, rep: 8, friend: true },
            { text: "That sucks. Hope it gets better.", effects: { charisma: 1 }, rep: 2 },
            { text: "Not my problem.", effects: {}, rep: -3 }
        ]},
        { text: "Hey, did you hear about what happened on the news?", options: [
            { text: "No, what happened?", effects: { intelligence: 1 }, rep: 2, response: {
                text: "Apparently there's been a string of break-ins in the neighborhood. Stay safe out there!", options: [
                    { text: "Thanks for the heads up!", effects: { intelligence: 1 }, rep: 3 },
                    { text: "I can handle myself.", effects: { charisma: 1 }, rep: 0 }
                ]
            }},
            { text: "I don't watch the news.", effects: {}, rep: -1 }
        ]},
        { text: "Spare some change? I haven't eaten all day.", options: [
            { text: "Here, take $10.", effects: { happiness: 3, charisma: 2 }, cost: 10, rep: 10 },
            { text: "Sorry, I can't right now.", effects: {}, rep: -1 },
            { text: "There's a food bank nearby, I can show you.", effects: { charisma: 3 }, rep: 12, friend: true },
            { text: "Get a job.", effects: {}, rep: -8 }
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
            { text: "Stay off my lawn!", effects: {}, rep: -2, response: {
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
    ]},
    { text: "You play cards? Gets boring as hell in here.", options: [
        { text: "Deal me in.", effects: { happiness: 3, charisma: 1 }, rep: 2, friend: true, response: {
            text: "Alright! I'll teach you the rules. Loser does the other's laundry.", options: [
                { text: "You're on!", effects: { happiness: 2 }, rep: 1 },
                { text: "No stakes, just for fun.", effects: { happiness: 1, intelligence: 1 }, rep: 2 }
            ]
        }},
        { text: "Not interested.", effects: {}, rep: -1 },
        { text: "Only if we play for commissary.", effects: { charisma: 1 }, rep: -1, response: {
            text: "Ha, a gambler! I like it. Don't cry when you lose everything.", options: [
                { text: "*play and win*", effects: { happiness: 3, charisma: 2 }, rep: 1 },
                { text: "*play and lose*", effects: { happiness: -2 }, rep: -1 }
            ]
        }}
    ]},
    { text: "I used to have a family, you know. Wife, two kids. All gone now.", options: [
        { text: "I'm sorry to hear that.", effects: { charisma: 2 }, rep: 3, response: {
            text: "Don't be. It was my own fault. I chose this life. Just... don't make the same mistakes I did.", options: [
                { text: "I won't. I promise.", effects: { intelligence: 2, happiness: 1 }, rep: 3 },
                { text: "What mistakes?", effects: { intelligence: 1 }, rep: 2, response: {
                    text: "Thinking I was invincible. Thinking the money was worth it. It never is.", options: [
                        { text: "That's heavy. Thanks for being real.", effects: { intelligence: 1, charisma: 1 }, rep: 3, friend: true },
                        { text: "I'll keep that in mind.", effects: { intelligence: 1 }, rep: 1 }
                    ]
                }}
            ]
        }},
        { text: "Sounds like you deserved it.", effects: {}, rep: -5, response: {
            text: "...You know what, maybe I did. But at least I own it. Can you say the same?", options: [
                { text: "I didn't mean it like that.", effects: { charisma: 1 }, rep: 3 },
                { text: "I don't owe you anything.", effects: {}, rep: -2 }
            ]
        }}
    ]},
    { text: "Word is there's gonna be a shakedown tonight. Hide anything you don't want found.", options: [
        { text: "Thanks for the warning.", effects: { intelligence: 2 }, rep: 2, friend: true },
        { text: "I don't have anything to hide.", effects: { intelligence: 1 }, rep: 3 },
        { text: "Why are you telling me?", effects: { charisma: 1 }, rep: 0, response: {
            text: "Because you haven't given me a reason not to. That's rare in here.", options: [
                { text: "Respect.", effects: { charisma: 2 }, rep: 3, friend: true },
                { text: "Keep your guard up.", effects: { intelligence: 1 }, rep: 1 }
            ]
        }}
    ]},
    { text: "What are you in for? ...You don't have to answer that.", options: [
        { text: "I'd rather not say.", effects: {}, rep: 2, response: {
            text: "Smart. The less people know, the better off you are in here.", options: [
                { text: "Noted.", effects: { intelligence: 1 }, rep: 1 },
                { text: "What about you?", effects: { charisma: 1 }, rep: 0, response: {
                    text: "Let's just say I made some poor business decisions. Very poor.", options: [
                        { text: "Haven't we all.", effects: { charisma: 1 }, rep: 2 },
                        { text: "...", effects: {}, rep: 0 }
                    ]
                }}
            ]
        }},
        { text: "Long story.", effects: { charisma: 1 }, rep: 1, response: {
            text: "Aren't they all? Time is all we've got in here though.", options: [
                { text: "Maybe I'll tell you someday.", effects: { charisma: 1 }, rep: 2 },
                { text: "Some stories are better left untold.", effects: { intelligence: 1 }, rep: 1 }
            ]
        }},
        { text: "Murder.", effects: { charisma: 2 }, rep: -3, response: {
            text: "...Okay. I'll make sure to stay on your good side then.", options: [
                { text: "Wise choice.", effects: { charisma: 1 }, rep: -1 },
                { text: "Relax, I'm not a monster.", effects: { charisma: 1 }, rep: 2 }
            ]
        }}
    ]}
];

// ============================================================
// DEEP MORAL CHOICE DIALOGUES
// These create the ascent-to-greatness and descent-to-depravity paths
// ============================================================

// Stranger encounters that present real moral weight
LIFE.NPC_DIALOGUES['Stranger'].push(
    { text: "Please... I just lost my job and I can't feed my kids. Can you help?", minAge: 18, options: [
        { text: "Here's $100. Get your family a good meal.", effects: { happiness: 5 }, cost: 100, rep: 12, response: {
            text: "Oh god, thank you... you have no idea what this means. My kids — they haven't eaten since yesterday.", options: [
                { text: "Here's another $100. And take my number — I'll help you find work.", effects: { happiness: 5, charisma: 3 }, cost: 100, rep: 15,
                    onSelect: function() { LIFE.state.livesHelped++; LIFE.state.charitableDonations += 200; LIFE.logMilestone('Helped a desperate parent feed their family', 'good'); }},
                { text: "I hope things get better for you. Stay strong.", effects: { happiness: 3 }, rep: 5,
                    onSelect: function() { LIFE.state.livesHelped++; LIFE.state.charitableDonations += 100; }}
            ]
        }},
        { text: "I don't have any cash, but I know a shelter nearby.", effects: { charisma: 2 }, rep: 8, response: {
            text: "Really? Where is it? I've been sleeping in my car with the kids...", options: [
                { text: "I'll walk you there. Come on.", effects: { happiness: 3, charisma: 2 }, rep: 10,
                    onSelect: function() { LIFE.state.livesHelped++; LIFE.logMilestone('Guided a homeless family to shelter', 'good'); }},
                { text: "Just head down Main Street. You'll see it.", effects: { charisma: 1 }, rep: 3 }
            ]
        }},
        { text: "Sounds like a 'you' problem.", effects: {}, rep: -8, response: {
            text: "...Please. I'm not asking for me. My children are hungry.", options: [
                { text: "Fine. Here's $20. Now leave me alone.", effects: {}, cost: 20, rep: 2 },
                { text: "Not my responsibility.", effects: {}, rep: -5,
                    onSelect: function() { LIFE.state.innocentsHarmed++; }}
            ]
        }},
        { text: "Give me your watch first.", effects: { charisma: -2 }, rep: -15, response: {
            text: "What?! I'm begging you for food and you want to rob me?!", options: [
                { text: "Hand it over or I walk away.", effects: {}, rep: -10, money: 50,
                    onSelect: function() { LIFE.state.totalExtortions++; LIFE.logCrime('Extortion'); LIFE.logMilestone('Extorted a desperate parent', 'bad'); }},
                { text: "...I'm sorry. That was wrong. Here, take $50.", effects: { happiness: 2 }, cost: 50, rep: 10,
                    onSelect: function() { LIFE.state.livesHelped++; }}
            ]
        }}
    ]},
    { text: "Hey! Someone just stole that old lady's purse! He ran that way!", minAge: 14, options: [
        { text: "I'll get him!", effects: { health: -5, charisma: 3 }, rep: 20, response: {
            text: "You caught him?! Oh my god, you're a hero! The lady is crying with relief!", options: [
                { text: "Just doing what anyone would do.", effects: { happiness: 5, charisma: 3 }, rep: 10,
                    onSelect: function() { LIFE.state.livesHelped++; LIFE.logMilestone('Chased down a purse snatcher and saved an elderly woman', 'good'); if (LIFE.news) LIFE.news.add('Local hero catches purse snatcher, returns belongings to elderly victim.', 'social'); }},
                { text: "Someone should call the police.", effects: { happiness: 3 }, rep: 5 }
            ]
        }},
        { text: "Call the police!", effects: { intelligence: 1 }, rep: 8 },
        { text: "Not my problem.", effects: {}, rep: -5 },
        { text: "Which way? Maybe I can 'find' the purse...", effects: {}, rep: -12, money: 80,
            onSelect: function() { LIFE.state.totalThefts++; LIFE.logCrime('Theft'); LIFE.logMilestone('Stole from an elderly woman through deception', 'bad'); }}
    ]},
    { text: "Excuse me... I think that man over there is following that woman. She looks scared.", minAge: 16, options: [
        { text: "I'll go check on her.", effects: { charisma: 3 }, rep: 15, response: {
            text: "Thank god you stepped in! He ran off when he saw you coming. She's shaking.", options: [
                { text: "Are you okay? Can I walk you somewhere safe?", effects: { happiness: 5, charisma: 3 }, rep: 12,
                    onSelect: function() { LIFE.state.livesHelped++; LIFE.logMilestone('Protected a woman from a stalker', 'good'); }},
                { text: "He's gone now. Be careful out there.", effects: { happiness: 2 }, rep: 5 }
            ]
        }},
        { text: "That's scary... I should call the police.", effects: { intelligence: 1 }, rep: 8 },
        { text: "None of my business.", effects: {}, rep: -3 }
    ]},
    { text: "I heard you're quite well-known around here. I could use someone like you for a... business opportunity.", minAge: 20, options: [
        { text: "What kind of business?", effects: {}, rep: 0, response: {
            text: "Let's just say it's not exactly legal. But the money is very, very good. $5,000 for one night's work.", options: [
                { text: "I'm in. What do I need to do?", effects: {}, rep: -15, money: 5000,
                    onSelect: function() { LIFE.state.totalThefts++; LIFE.logCrime('Accessory to organized crime'); LIFE.logMilestone('Participated in organized crime', 'bad'); LIFE.addWanted(1); }},
                { text: "No amount of money is worth my soul.", effects: { happiness: 2, intelligence: 1 }, rep: 8,
                    onSelect: function() { LIFE.logMilestone('Rejected a lucrative criminal offer', 'good'); }},
                { text: "I should report you to the police.", effects: { intelligence: 1 }, rep: 12,
                    onSelect: function() { LIFE.state.livesHelped++; LIFE.logMilestone('Reported organized crime to authorities', 'good'); if (LIFE.news) LIFE.news.add('Anonymous tip leads to investigation of local criminal ring.', 'social'); }}
            ]
        }},
        { text: "I don't do 'business' with strangers.", effects: { intelligence: 1 }, rep: 2 },
        { text: "You picked the wrong person. Get out of here.", effects: { charisma: 2 }, rep: 5 }
    ]},
    { text: "Did you see that car accident?! Someone's trapped inside! The car is smoking!", minAge: 14, options: [
        { text: "I'm going to help! Call 911!", effects: { health: -10 }, rep: 25, response: {
            text: "You pulled them out just before the car caught fire! The ambulance is on the way!", options: [
                { text: "Is everyone okay? Are there others inside?", effects: { happiness: 8, charisma: 5 }, rep: 15,
                    onSelect: function() { LIFE.state.livesHelped += 2; LIFE.logMilestone('Pulled a person from a burning car, saving their life', 'good'); if (LIFE.news) LIFE.news.add('Heroic bystander pulls victim from burning vehicle!', 'social'); LIFE.state.fame = Math.min(100, (LIFE.state.fame || 0) + 5); }},
                { text: "Thank god... I thought we were going to lose them.", effects: { happiness: 5 }, rep: 8,
                    onSelect: function() { LIFE.state.livesHelped++; }}
            ]
        }},
        { text: "Someone should help them... but it looks dangerous.", effects: {}, rep: -2 },
        { text: "Check their pockets while they're unconscious.", effects: {}, rep: -20, money: 150,
            onSelect: function() { LIFE.state.totalThefts++; LIFE.logCrime('Theft from an accident victim'); LIFE.logMilestone('Robbed an unconscious car accident victim', 'bad'); if (LIFE.news) LIFE.news.add('Reports of looting at car accident scene.', 'crime'); }}
    ]}
);

// Teacher dialogues with moral depth
LIFE.NPC_DIALOGUES['Teacher'].push(
    { text: "I noticed a student is being bullied in class. What would you do?", minAge: 6, options: [
        { text: "Stand up for them! That's not right!", effects: { charisma: 3, happiness: 2 }, rep: 10, response: {
            text: "That's very brave of you! The student came to thank you after class.", options: [
                { text: "Nobody deserves to be treated like that.", effects: { happiness: 3, charisma: 2 }, rep: 5,
                    onSelect: function() { LIFE.state.livesHelped++; LIFE.state.friends++; LIFE.logMilestone('Stood up to bullies to protect a classmate', 'good'); }},
                { text: "Just looking out for my friends.", effects: { happiness: 2 }, rep: 3 }
            ]
        }},
        { text: "I'll tell a teacher.", effects: { intelligence: 1 }, rep: 5 },
        { text: "Not my problem.", effects: {}, rep: -3 },
        { text: "Join in. It's funny.", effects: {}, rep: -12,
            onSelect: function() { LIFE.state.innocentsHarmed++; LIFE.logMilestone('Joined bullies in tormenting a classmate', 'bad'); }}
    ]},
    { text: "Class, today we have a special opportunity — we can volunteer at the local food bank this weekend. Who's interested?", minAge: 8, options: [
        { text: "I'd love to help!", effects: { happiness: 3, charisma: 2 }, rep: 10, response: {
            text: "You spent the whole Saturday sorting donations and serving meals. The organizer personally thanked you.", options: [
                { text: "When's the next one? I want to keep helping!", effects: { happiness: 3, charisma: 2 }, rep: 8,
                    onSelect: function() { LIFE.state.volunteerHours++; LIFE.state.livesHelped += 3; LIFE.logMilestone('Volunteered at food bank for the first time', 'good'); }},
                { text: "It felt really good to help.", effects: { happiness: 2 }, rep: 5,
                    onSelect: function() { LIFE.state.volunteerHours++; }}
            ]
        }},
        { text: "I guess... if there's nothing else to do.", effects: { charisma: 1 }, rep: 3,
            onSelect: function() { LIFE.state.volunteerHours++; }},
        { text: "Sounds boring. No thanks.", effects: {}, rep: -2 }
    ]}
);

// Neighbor dialogues with moral choices
LIFE.NPC_DIALOGUES['Neighbor'].push(
    { text: "I'm organizing a neighborhood watch. We've had break-ins lately. Want to help?", minAge: 18, options: [
        { text: "Absolutely! I'll help keep everyone safe.", effects: { charisma: 3, happiness: 2 }, rep: 12, response: {
            text: "Great! With your help, we've already scared off two suspicious characters this week.", options: [
                { text: "Happy to help. This community matters to me.", effects: { happiness: 3 }, rep: 8,
                    onSelect: function() { LIFE.state.livesHelped += 2; LIFE.logMilestone('Helped organize neighborhood watch', 'good'); }},
                { text: "We should get more people involved.", effects: { charisma: 2 }, rep: 5 }
            ]
        }},
        { text: "I'm too busy, sorry.", effects: {}, rep: -2 },
        { text: "Why would I? Maybe I AM the one breaking in.", effects: {}, rep: -15,
            onSelect: function() { LIFE.logMilestone('Threatened neighbor about break-ins', 'bad'); }}
    ]},
    { text: "My elderly mother needs someone to check on her while I'm at work. Could you look in on her sometimes?", minAge: 16, options: [
        { text: "Of course! I'd be happy to.", effects: { happiness: 3, charisma: 2 }, rep: 10, response: {
            text: "You've been visiting her every week. She says you're the highlight of her week now.", options: [
                { text: "She reminds me of my own family. It's no trouble.", effects: { happiness: 5 }, rep: 8,
                    onSelect: function() { LIFE.state.livesHelped++; LIFE.state.peopleMentored++; LIFE.logMilestone('Regularly visited an elderly neighbor, became her close companion', 'good'); }},
                { text: "She's great company!", effects: { happiness: 3 }, rep: 5 }
            ]
        }},
        { text: "Only if you pay me.", effects: {}, rep: -5, money: 30 },
        { text: "I don't have time for old people.", effects: {}, rep: -8 }
    ]}
);

// Gym Trainer virtue path
LIFE.NPC_DIALOGUES['Gym Trainer'] = LIFE.NPC_DIALOGUES['Gym Trainer'] || [];
LIFE.NPC_DIALOGUES['Gym Trainer'].push(
    { text: "You look like you could use a workout. Want me to train you?", minAge: 14, options: [
        { text: "Let's do it! Push me hard!", effects: { health: 5, happiness: 2 }, rep: 3, response: {
            text: "Great session! You know, I run a free fitness class for underprivileged kids on weekends. We could use a helper.", options: [
                { text: "I'd love to help with that!", effects: { happiness: 4, charisma: 3, health: 2 }, rep: 12,
                    onSelect: function() { LIFE.state.volunteerHours++; LIFE.state.peopleMentored += 3; LIFE.logMilestone('Mentored underprivileged kids through fitness classes', 'good'); }},
                { text: "That sounds nice, but I'm busy.", effects: {}, rep: 0 }
            ]
        }},
        { text: "How much does it cost?", effects: {}, rep: 0, response: {
            text: "$30 for a session. But honestly, just being consistent is what matters.", options: [
                { text: "Deal! Let's get started. ($30)", effects: { health: 5 }, cost: 30, rep: 2 },
                { text: "Too expensive.", effects: {}, rep: -1 }
            ]
        }}
    ]}
);

// Coworker moral paths
LIFE.NPC_DIALOGUES['Coworker'].push(
    { text: "Hey, I know a way to skim money from the company accounts. Nobody would notice. You in?", minAge: 23, options: [
        { text: "Are you insane? I'm reporting this.", effects: { intelligence: 2 }, rep: 15, response: {
            text: "Wait, wait! I was just joking! Don't tell anyone, please!", options: [
                { text: "I won't report you, but don't ever do something like that.", effects: { charisma: 2 }, rep: 5,
                    onSelect: function() { LIFE.logMilestone('Talked a coworker out of embezzlement', 'good'); }},
                { text: "You need to do the right thing and confess.", effects: { intelligence: 1 }, rep: 8 }
            ]
        }},
        { text: "How much are we talking?", effects: {}, rep: -10, response: {
            text: "About $10,000. Split fifty-fifty. We just alter a few invoices. Easy money.", options: [
                { text: "I'm in. Let's do it.", effects: {}, rep: -15, money: 5000,
                    onSelect: function() { LIFE.state.totalThefts++; LIFE.logCrime('Embezzlement'); LIFE.logMilestone('Embezzled thousands from employer', 'bad'); if (Math.random() < 0.3) { LIFE.addWanted(2); LIFE.ui.showPopup('An audit reveals the missing funds!', '#f44336'); } }},
                { text: "On second thought, this is too risky.", effects: { intelligence: 1 }, rep: 3 }
            ]
        }},
        { text: "No way. That's stealing.", effects: { intelligence: 1 }, rep: 8 }
    ]},
    { text: "There's a new intern who's struggling really badly. They might get fired.", minAge: 23, options: [
        { text: "I'll mentor them. Everyone deserves a chance.", effects: { charisma: 3, happiness: 2 }, rep: 10, response: {
            text: "A year later, that intern got promoted and publicly thanked you in their speech. The whole office applauded.", options: [
                { text: "Seeing them succeed is reward enough.", effects: { happiness: 8, charisma: 3 }, rep: 10,
                    onSelect: function() { LIFE.state.peopleMentored++; LIFE.state.livesHelped++; LIFE.logMilestone('Mentored a struggling intern who later succeeded', 'good'); }},
                { text: "I'm glad I could help.", effects: { happiness: 5 }, rep: 5,
                    onSelect: function() { LIFE.state.peopleMentored++; }}
            ]
        }},
        { text: "Not my problem. Sink or swim.", effects: {}, rep: -3 },
        { text: "Good. Less competition for me.", effects: {}, rep: -5, response: {
            text: "Wow... cold. They got fired the next week. You could hear them crying in the break room.", options: [
                { text: "That's business.", effects: {}, rep: -3,
                    onSelect: function() { LIFE.state.innocentsHarmed++; }},
                { text: "...maybe I should have helped.", effects: { happiness: -3 }, rep: 2 }
            ]
        }}
    ]}
);

// Boss moral paths
LIFE.NPC_DIALOGUES['Boss'].push(
    { text: "We need to let someone go. Budget cuts. Any suggestions?", minAge: 23, options: [
        { text: "Maybe we can find another way? Cut costs elsewhere?", effects: { intelligence: 3 }, rep: 8, response: {
            text: "You actually found a way to save the position! The person you saved came to thank you personally.", options: [
                { text: "Nobody should lose their livelihood if we can help it.", effects: { happiness: 5, charisma: 3 }, rep: 10,
                    onSelect: function() { LIFE.state.livesHelped++; LIFE.logMilestone('Saved a coworker from being laid off', 'good'); }},
                { text: "I just did the math. It made sense.", effects: { intelligence: 1 }, rep: 3 }
            ]
        }},
        { text: "Fire the new guy. Last in, first out.", effects: {}, rep: -3 },
        { text: "Fire [coworker name]. They've been slacking.", effects: {}, rep: -8,
            onSelect: function() { LIFE.state.betrayals++; LIFE.state.enemies++; LIFE.logMilestone('Got a coworker fired to protect yourself', 'bad'); }}
    ]}
);

// Student moral dialogues (school/college)
LIFE.NPC_DIALOGUES['Student'] = LIFE.NPC_DIALOGUES['Student'] || [];
LIFE.NPC_DIALOGUES['Student'].push(
    { text: "Hey... can I copy your homework? I'll fail if I don't turn something in.", minAge: 6, maxAge: 17, options: [
        { text: "Sure, here you go.", effects: { charisma: 1 }, rep: -3, response: {
            text: "You're a lifesaver! ...Wait, the teacher is looking at us.", options: [
                { text: "Act natural. We're fine.", effects: {} },
                { text: "Actually, let me help you understand it instead.", effects: { intelligence: 2, charisma: 2 }, rep: 8,
                    onSelect: function() { LIFE.state.peopleMentored++; LIFE.logMilestone('Tutored a struggling student', 'good'); }}
            ]
        }},
        { text: "No, but I can help you learn it.", effects: { intelligence: 2, charisma: 3 }, rep: 10, response: {
            text: "Really? You'd do that? Nobody ever helps me with this stuff...", options: [
                { text: "Everyone needs help sometimes. Let's start.", effects: { happiness: 3, charisma: 2 }, rep: 8,
                    onSelect: function() { LIFE.state.peopleMentored++; LIFE.logMilestone('Mentored a classmate who had no one else', 'good'); }},
                { text: "Sure, but you owe me a favor.", effects: { charisma: 1 }, rep: 3 }
            ]
        }},
        { text: "It'll cost you $20.", effects: {}, rep: -5, money: 20,
            onSelect: function() { LIFE.state.totalExtortions++; }},
        { text: "No. Figure it out yourself.", effects: {}, rep: -2 }
    ]},
    { text: "Those kids keep picking on me at lunch. I don't know what to do anymore.", minAge: 6, maxAge: 17, options: [
        { text: "I'll stick with you. They won't bother you when I'm around.", effects: { charisma: 3, happiness: 3 }, rep: 12, response: {
            text: "Y-you'd really do that? Nobody ever stands up for me...", options: [
                { text: "That's what friends are for.", effects: { happiness: 5, charisma: 2 }, rep: 10,
                    onSelect: function() { LIFE.state.livesHelped++; LIFE.state.friends++; LIFE.logMilestone('Stood up for a bullied student', 'good'); }},
                { text: "Just stay close. They're cowards.", effects: { happiness: 2, charisma: 1 }, rep: 5 }
            ]
        }},
        { text: "You should tell a teacher.", effects: { intelligence: 1 }, rep: 3 },
        { text: "Just hit them back. Hard.", effects: { charisma: -1 }, rep: -3 },
        { text: "Maybe they pick on you for a reason.", effects: {}, rep: -10,
            onSelect: function() { LIFE.state.innocentsHarmed++; }}
    ]},
    { text: "I found Professor Miller's exam answers in the hallway. Want to split them?", minAge: 18, options: [
        { text: "No, we should return them to the professor.", effects: { intelligence: 3, charisma: 2 }, rep: 15, response: {
            text: "Seriously? We could ace this test... but yeah, you're right.", options: [
                { text: "Integrity matters more than grades.", effects: { happiness: 3, intelligence: 2 }, rep: 10,
                    onSelect: function() { LIFE.logMilestone('Returned stolen exam answers — chose integrity over easy grades', 'good'); }},
                { text: "Besides, if we got caught we'd get expelled.", effects: { intelligence: 1 }, rep: 5 }
            ]
        }},
        { text: "Yeah, send me a copy!", effects: { intelligence: -2 }, rep: -8,
            onSelect: function() { LIFE.logCrime('Academic fraud'); LIFE.logMilestone('Used stolen exam answers to cheat', 'bad'); }},
        { text: "Give me all of them. I'll sell copies.", effects: { intelligence: -3 }, rep: -15, money: 200,
            onSelect: function() { LIFE.state.totalThefts++; LIFE.logCrime('Academic fraud ring'); LIFE.logMilestone('Ran an exam answer selling operation', 'bad'); }}
    ]}
);

// Kid dialogues (school age)
LIFE.NPC_DIALOGUES['Kid'] = LIFE.NPC_DIALOGUES['Kid'] || [];
LIFE.NPC_DIALOGUES['Kid'].push(
    { text: "I lost my lunch money and I'm really hungry...", minAge: 6, maxAge: 17, options: [
        { text: "Here, take mine. I'm not that hungry anyway.", effects: { happiness: 5 }, cost: 5, rep: 8,
            onSelect: function() { LIFE.state.livesHelped++; }},
        { text: "Let's go tell a teacher. They'll help.", effects: { intelligence: 1, charisma: 1 }, rep: 5 },
        { text: "Sucks to be you.", effects: {}, rep: -5,
            onSelect: function() { LIFE.state.innocentsHarmed++; }}
    ]},
    { text: "Dare you to throw a rock at the teacher's car!", minAge: 6, maxAge: 17, options: [
        { text: "That's stupid. No.", effects: { intelligence: 2 }, rep: 3 },
        { text: "You first!", effects: { charisma: 1 } },
        { text: "Watch this!", effects: { intelligence: -2 }, rep: -8,
            onSelect: function() { LIFE.logCrime('Vandalism'); LIFE.logMilestone('Vandalized a teacher\'s car on a dare', 'bad'); }}
    ]}
);

// Professor dialogues (college)
LIFE.NPC_DIALOGUES['Professor'] = LIFE.NPC_DIALOGUES['Professor'] || [];
LIFE.NPC_DIALOGUES['Professor'].push(
    { text: "Your thesis shows real promise. I could recommend you for the research grant — $5000 and a publication credit.", minAge: 18, options: [
        { text: "That would mean the world to me. I'll work hard.", effects: { intelligence: 5, happiness: 5 }, rep: 10, money: 5000, response: {
            text: "I see real potential in you. This could launch your career.", options: [
                { text: "I won't let you down, Professor.", effects: { intelligence: 3, charisma: 2 }, rep: 8,
                    onSelect: function() { LIFE.state.scholarshipsGiven++; LIFE.logMilestone('Received a research grant for academic excellence', 'good'); }},
                { text: "Thank you for believing in me.", effects: { happiness: 3 }, rep: 5 }
            ]
        }},
        { text: "Can I just get the money without doing the research?", effects: { intelligence: -2, charisma: -2 }, rep: -12 },
        { text: "No thanks. I have other plans.", effects: {} }
    ]},
    { text: "I caught your classmate plagiarizing their paper. They're begging me not to report it. What would you do?", minAge: 18, options: [
        { text: "Everyone deserves a second chance. Let them rewrite it.", effects: { charisma: 3, happiness: 2 }, rep: 8, response: {
            text: "Hmm. Compassionate answer. Perhaps you're right — they've been struggling since their mother's illness.", options: [
                { text: "I could help them with the rewrite. Nobody should fail over a mistake.", effects: { charisma: 3, happiness: 3 }, rep: 12,
                    onSelect: function() { LIFE.state.peopleMentored++; LIFE.state.livesHelped++; LIFE.logMilestone('Helped a classmate avoid expulsion and mentored them', 'good'); }},
                { text: "Just give them the chance. They'll learn.", effects: { charisma: 1 }, rep: 5 }
            ]
        }},
        { text: "Rules are rules. Report them.", effects: { intelligence: 2 }, rep: 3 },
        { text: "I'll keep quiet... for a favor from you.", effects: { charisma: -2 }, rep: -10,
            onSelect: function() { LIFE.state.totalExtortions++; LIFE.logCrime('Blackmail'); LIFE.logMilestone('Blackmailed a professor', 'bad'); }}
    ]}
);

// Dealer dark expansion (beyond just buying drugs)
LIFE.NPC_DIALOGUES['Dealer'].push(
    { text: "Yo, I need someone to hold a package for me. Cops are sniffing around. $500 just to hold it for a day.", minAge: 16, options: [
        { text: "I'm in. Easy money.", effects: {}, rep: -8, money: 500, response: {
            text: "Smart. Now listen — if anyone asks, you don't know me. And DON'T open the package.", options: [
                { text: "My lips are sealed.", effects: {}, rep: -5,
                    onSelect: function() { LIFE.logCrime('Drug trafficking'); LIFE.logMilestone('Held drugs for a dealer', 'bad'); if (Math.random() < 0.25) { LIFE.addWanted(2); LIFE.ui.showPopup('Police found the drugs on you!', '#f44336'); }}},
                { text: "Wait... what's actually in it?", effects: {}, rep: -3,
                    onSelect: function() { LIFE.logCrime('Drug possession'); }}
            ]
        }},
        { text: "No way. I'm not getting involved in that.", effects: { intelligence: 2 }, rep: 5 },
        { text: "I should report you to the police.", effects: { charisma: 2 }, rep: 12,
            onSelect: function() { LIFE.state.livesHelped++; LIFE.logMilestone('Reported a drug dealer to police', 'good'); }}
    ]},
    { text: "I got a kid hooked on my stuff. He's only 14. Keeps coming back crying for more. Business is business, right?", minAge: 18, options: [
        { text: "That's disgusting. Where is this kid?", effects: { charisma: 3 }, rep: 15, response: {
            text: "Whoa, chill out. What are you gonna do, play hero?", options: [
                { text: "I'm getting that kid help. You should be ashamed.", effects: { happiness: 5, charisma: 3 }, rep: 20,
                    onSelect: function() { LIFE.state.livesHelped++; LIFE.state.addictionRecoveries++; LIFE.logMilestone('Saved a child from drug addiction', 'good'); }},
                { text: "If I ever see you near that kid again...", effects: { charisma: 2 }, rep: 10,
                    onSelect: function() { LIFE.state.livesHelped++; }}
            ]
        }},
        { text: "Not my problem.", effects: {}, rep: -8,
            onSelect: function() { LIFE.state.innocentsHarmed++; }},
        { text: "Smart business move.", effects: {}, rep: -20,
            onSelect: function() { LIFE.state.innocentsHarmed++; LIFE.logMilestone('Approved of a dealer hooking a child on drugs', 'bad'); }}
    ]}
);

// Doctor moral dialogues
LIFE.NPC_DIALOGUES['Doctor'] = LIFE.NPC_DIALOGUES['Doctor'] || [];
LIFE.NPC_DIALOGUES['Doctor'].push(
    { text: "We have a patient who can't afford their medication. Technically I'm not supposed to give free samples, but...", minAge: 18, options: [
        { text: "I'll cover the cost. How much is it?", effects: { happiness: 5 }, rep: 15, cost: 200, response: {
            text: "That's incredibly generous. This medication will literally save their life.", options: [
                { text: "Everyone deserves a chance at health.", effects: { happiness: 5, charisma: 3 }, rep: 12,
                    onSelect: function() { LIFE.state.livesHelped++; LIFE.state.charitableDonations += 200; LIFE.logMilestone('Paid for a stranger\'s life-saving medication', 'good'); }},
                { text: "Just make sure they get it.", effects: { happiness: 3 }, rep: 5,
                    onSelect: function() { LIFE.state.livesHelped++; LIFE.state.charitableDonations += 200; }}
            ]
        }},
        { text: "That's between you and the hospital.", effects: {} },
        { text: "Maybe I can sell it to them at a markup...", effects: { charisma: -2 }, rep: -12,
            onSelect: function() { LIFE.state.totalExtortions++; LIFE.logMilestone('Tried to profit from someone\'s medical desperation', 'bad'); }}
    ]}
);

// Spouse dialogues
LIFE.NPC_DIALOGUES['Spouse'] = LIFE.NPC_DIALOGUES['Spouse'] || [];
LIFE.NPC_DIALOGUES['Spouse'].push(
    { text: "I've been thinking... we should start volunteering at the community center together.", options: [
        { text: "I'd love that. Let's sign up.", effects: { happiness: 5, charisma: 2 }, rep: 10,
            onSelect: function() { LIFE.state.volunteerHours++; LIFE.logMilestone('Started volunteering with spouse', 'good'); }},
        { text: "Maybe sometime. I'm pretty busy.", effects: { happiness: -2 } },
        { text: "Volunteering is a waste of time.", effects: { happiness: -5 }, rep: -3 }
    ]},
    { text: "Honey, I found this wallet on the street. There's $500 cash in it. Should we return it?", options: [
        { text: "Of course. Someone is probably panicking right now.", effects: { happiness: 5, charisma: 3 }, rep: 15, response: {
            text: "You're right. I'll look for an ID... There's an address. Let's bring it back.", options: [
                { text: "Let's go together.", effects: { happiness: 5, charisma: 2 }, rep: 10,
                    onSelect: function() { LIFE.state.livesHelped++; LIFE.logMilestone('Returned a lost wallet with $500 to its owner', 'good'); }},
                { text: "You go ahead. I trust you.", effects: { happiness: 2 }, rep: 5 }
            ]
        }},
        { text: "Finders keepers.", effects: { happiness: -3 }, rep: -5, money: 500,
            onSelect: function() { LIFE.state.totalThefts++; }},
        { text: "Take the cash, return the wallet.", effects: {}, rep: -8, money: 500,
            onSelect: function() { LIFE.state.totalThefts++; LIFE.logMilestone('Kept cash from a found wallet', 'bad'); }}
    ]},
    { text: "I think we should donate to the children's hospital. They're doing a fundraiser.", options: [
        { text: "Absolutely. Let's donate $500.", effects: { happiness: 5 }, rep: 12, cost: 500,
            onSelect: function() { LIFE.state.charitableDonations += 500; LIFE.logMilestone('Donated to children\'s hospital', 'good'); }},
        { text: "Sure, $100 sounds right.", effects: { happiness: 3 }, rep: 5, cost: 100,
            onSelect: function() { LIFE.state.charitableDonations += 100; }},
        { text: "We can't afford to just give money away.", effects: { happiness: -3 }, rep: -2 }
    ]}
);

// Your Child dialogues
LIFE.NPC_DIALOGUES['Your Child'] = LIFE.NPC_DIALOGUES['Your Child'] || [];
LIFE.NPC_DIALOGUES['Your Child'].push(
    { text: "Dad/Mom, a kid at school is being really mean to everyone. Should I stand up to them?", options: [
        { text: "Yes, always stand up for what's right. I'm proud of you for caring.", effects: { happiness: 5, charisma: 3 }, rep: 8, response: {
            text: "Really? But what if they're bigger than me?", options: [
                { text: "Being brave doesn't mean not being scared. It means doing the right thing anyway.", effects: { happiness: 5, charisma: 3 }, rep: 5,
                    onSelect: function() { LIFE.state.peopleMentored++; LIFE.logMilestone('Taught your child to stand up against bullying', 'good'); }},
                { text: "Tell a teacher if it gets dangerous. But always speak up.", effects: { happiness: 3, intelligence: 2 }, rep: 3 }
            ]
        }},
        { text: "Stay out of it. Mind your own business.", effects: { happiness: -3 }, rep: -3 },
        { text: "Hit them first before they hit you.", effects: { charisma: -2 }, rep: -5,
            onSelect: function() { LIFE.logMilestone('Taught your child to solve problems with violence', 'bad'); }}
    ]},
    { text: "I don't want to go to school anymore. The other kids make fun of me...", options: [
        { text: "Come here. Tell me everything. We'll figure this out together.", effects: { happiness: 5, charisma: 3 }, rep: 5, response: {
            text: "*sniffles* They call me names and nobody wants to sit with me at lunch...", options: [
                { text: "I love you no matter what. Tomorrow I'm coming to talk to your teacher.", effects: { happiness: 8, charisma: 3 }, rep: 8,
                    onSelect: function() { LIFE.state.livesHelped++; LIFE.logMilestone('Supported your child through bullying', 'good'); }},
                { text: "You are amazing just the way you are. Those kids are wrong.", effects: { happiness: 5, charisma: 2 }, rep: 5,
                    onSelect: function() { LIFE.state.peopleMentored++; }}
            ]
        }},
        { text: "Toughen up. Life isn't fair.", effects: { happiness: -8 }, rep: -5,
            onSelect: function() { LIFE.state.innocentsHarmed++; }},
        { text: "I don't have time for this.", effects: { happiness: -10 }, rep: -8,
            onSelect: function() { LIFE.state.innocentsHarmed++; LIFE.logMilestone('Ignored your child\'s cry for help', 'bad'); }}
    ]}
);

// Inmate expanded dialogues
LIFE.NPC_DIALOGUES['Inmate'].push(
    { text: "Listen man, I been in here 12 years. Got nobody on the outside. You seem like a decent person — first one I met in here.", options: [
        { text: "Everyone makes mistakes. What happened?", effects: { charisma: 2 }, rep: 5, response: {
            text: "I was 19, robbed a store for drug money. Worst decision of my life. I've been clean for 8 years now but nobody cares.", options: [
                { text: "When you get out, I'll help you get on your feet.", effects: { happiness: 5, charisma: 3 }, rep: 10,
                    onSelect: function() { LIFE.state.livesHelped++; LIFE.state.friends++; LIFE.logMilestone('Befriended a reformed prisoner and promised to help', 'good'); }},
                { text: "I hope you get a second chance.", effects: { happiness: 2, charisma: 1 }, rep: 5 }
            ]
        }},
        { text: "You're in here for a reason.", effects: {}, rep: -3 },
        { text: "12 years? What'd you do? I need tips.", effects: { charisma: -1 }, rep: -5 }
    ]}
);

// Pharmacist dialogues
LIFE.NPC_DIALOGUES['Pharmacist'] = LIFE.NPC_DIALOGUES['Pharmacist'] || [];
LIFE.NPC_DIALOGUES['Pharmacist'].push(
    { text: "That elderly gentleman can't afford his heart medication. He's been cutting pills in half to make them last.", minAge: 18, options: [
        { text: "How much does he need? I'll cover it.", effects: { happiness: 5 }, rep: 15, cost: 150, response: {
            text: "That's... three months of heart medication. You might be saving his life.", options: [
                { text: "It's just money. His life is worth more.", effects: { happiness: 5, charisma: 3 }, rep: 12,
                    onSelect: function() { LIFE.state.livesHelped++; LIFE.state.charitableDonations += 150; LIFE.logMilestone('Paid for an elderly man\'s heart medication', 'good'); }},
                { text: "Tell him to stay healthy.", effects: { happiness: 3 }, rep: 5,
                    onSelect: function() { LIFE.state.livesHelped++; LIFE.state.charitableDonations += 150; }}
            ]
        }},
        { text: "That's sad, but I can't help everyone.", effects: {} },
        { text: "Sell me whatever he can't afford. I'll resell it.", effects: { charisma: -3 }, rep: -15,
            onSelect: function() { LIFE.state.totalThefts++; LIFE.logMilestone('Tried to profit from an old man\'s medical need', 'bad'); }}
    ]}
);

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
    // birth hospital -> transition to home (build world if needed)
    if (LIFE.state._birthHospital) {
        LIFE.state._birthHospital = false;
        setTimeout(function() {
            if (LIFE.state.gamePhase === 'playing') {
                // Clear birth scene NPCs (Mom + Doctor) before building world
                LIFE.npcs.forEach(function(n) { LIFE.scene.remove(n.char.group); });
                LIFE.npcs = [];
                // Clear any leftover environment objects (womb/hospital ground planes)
                LIFE.clearEnvironment();
                // Build open world
                LIFE.world.buildWorld();
                // Spawn NPCs for all zones
                LIFE.world.spawnAllZoneNPCs();
                // Force immediate culling pass to set NPC visibility
                LIFE.world._cullingTimer = 999;
                LIFE.world.updateCulling(0);
                LIFE.state.currentStage = 'home';
                LIFE.state.bounds = 400;
                LIFE.updatePlayerSize();
                // Position player at home zone center
                LIFE.player.group.position.set(0, 0, 5);
                LIFE.state.heldByParent = true;
                LIFE.ui.showStageMessage('Home sweet home');
                // Seed initial news
                LIFE.news.add('New baby born at local hospital - family overjoyed!', 'social');
                LIFE.news.add(LIFE.NEWS_RANDOM[Math.floor(Math.random() * LIFE.NEWS_RANDOM.length)], 'world');
                LIFE.events.timer = 100 + Math.random() * 200;
            }
        }, 1000);
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
    if (opt.openVendor) {
        LIFE.dialogue.active = false;
        LIFE.dialogue.blocking = false;
        LIFE.dialogue.current = null;
        LIFE.dialogue.elements.box.style.display = 'none';
        var vType = opt.openVendor;
        setTimeout(function() {
            if (LIFE.state.gamePhase === 'playing') LIFE.ui.openVendorShop(vType);
        }, 100);
        return;
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
    if (opt.quitJob) {
        LIFE.state.career = null;
        LIFE.ui.showPopup('You quit your job!', '#ff9800');
    }
    if (opt.drugUse) {
        LIFE.state.drugUses++;
        LIFE.sounds.drug();
    }
    if (opt.surrender) {
        // Player surrenders to police
        LIFE.dialogue.active = false;
        LIFE.dialogue.blocking = false;
        LIFE.dialogue.current = null;
        LIFE.dialogue.elements.box.style.display = 'none';
        setTimeout(function() {
            if (LIFE.state.wantedLevel > 0) LIFE.arrestPlayer();
        }, 500);
        return;
    }
    if (opt.married) LIFE.state.married = true;
    if (opt.kids) {
        LIFE.state.hasKids = true;
        LIFE.state.childCount = (LIFE.state.childCount || 0) + 1;
        if (!LIFE.state.firstChildBornAge) LIFE.state.firstChildBornAge = LIFE.state.age;
        if (!LIFE.state.childNames) LIFE.state.childNames = [];
        setTimeout(function() {
            if (LIFE.state.gamePhase === 'playing') {
                LIFE.dialogue.openChildNaming(LIFE.state.childCount);
            }
        }, 2200);
    }
    if (opt.sound) LIFE.sounds[opt.sound]();

    // CAR PURCHASE
    if (opt._carIndex !== undefined) {
        LIFE.buyCar(opt._carIndex);
    }

    // FLIRTING - NPC responds in dialogue instead of popup
    if (opt.flirt && opt.flirtTarget) {
        var charismaBonus = LIFE.state.stats.charisma * 0.005;
        var beautyBonus = ((LIFE.state.stats.beauty || 50) - 30) * 0.005;
        var success = Math.random() < (0.45 + charismaBonus + beautyBonus);
        var posResp = [
            "Aww, that's really sweet! I like talking to you.",
            "Haha, you're such a charmer! Tell me more.",
            "*blushes* You really know how to make someone smile.",
            "That's the nicest thing anyone's said to me today!",
            "You know what? You're pretty cool. We should hang out more."
        ];
        var negResp = [
            "Umm... I'm flattered, but no thanks.",
            "Yeah... that's not really my thing. Sorry.",
            "Hah, nice try. Better luck next time.",
            "*awkward silence* ...I should go.",
            "That was... a bit much. Let's just be friends."
        ];
        if (success) {
            LIFE.state.romanceLevel = (LIFE.state.romanceLevel || 0) + 10;
            LIFE.state.romanceTarget = opt.flirtTarget;
            LIFE.updateRelationship(opt.flirtTarget, 10);
            var pLine = posResp[Math.floor(Math.random() * posResp.length)];
            if (LIFE.state.romanceLevel >= 30) pLine += " (" + opt.flirtTarget + " is interested in you!)";
            opt.response = { text: pLine, options: [
                { text: "You're amazing!", effects: { happiness: 2, charisma: 1 } },
                { text: "*smile*", effects: { happiness: 1 } }
            ]};
        } else {
            LIFE.updateRelationship(opt.flirtTarget, -5);
            var nLine = negResp[Math.floor(Math.random() * negResp.length)];
            opt.response = { text: nLine, options: [
                { text: "Oh well, worth a shot.", effects: {} },
                { text: "Your loss!", effects: {}, rep: -1 }
            ]};
        }
    }

    // MARRIAGE proposal
    if (opt.marry) {
        LIFE.state.married = true;
        LIFE.state.spouseName = opt.marry;
        LIFE.ui.showPopup('You married ' + opt.marry + '!', '#e91e63');
        if (LIFE.news) LIFE.news.add('Local couple ties the knot in beautiful ceremony.', 'social');
    }

    // HAVING KIDS
    if (opt.haveKid) {
        if (Math.random() < 0.7) {
            LIFE.state.hasKids = true;
            LIFE.state.childCount = (LIFE.state.childCount || 0) + 1;
            if (!LIFE.state.firstChildBornAge) LIFE.state.firstChildBornAge = LIFE.state.age;
            if (!LIFE.state.childNames) LIFE.state.childNames = [];
            LIFE.ui.showPopup('You have a baby! Child #' + LIFE.state.childCount, '#e91e63');
            if (LIFE.news) LIFE.news.add('Local family welcomes new baby - congratulations!', 'social');
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

    // Execute custom callback for moral choice tracking
    if (opt.onSelect && typeof opt.onSelect === 'function') {
        try { opt.onSelect(); } catch(e) {}
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
    if (npc.isPolice || npc.isDealer || npc.isHiring || npc.isCarSalesman || npc.isRealEstate || npc.isVendor) return false;
    // kids can't be flirted with
    if (npc.type === 'Kid') return false;
    // opposite sex only
    if (state.playerGender && npc.gender === state.playerGender) return false;
    return true;
};

LIFE.dialogue.talkToNPC = function(npc) {
    if (!npc || !npc.alive || LIFE.dialogue.active) return;

    // Sleeping NPC — wake them up
    if (npc._sleeping) {
        LIFE.dialogue.npc = npc;
        var sleepName = npc.displayName || npc.name || npc.type;
        var isFamily = (npc.type === 'Mom' || npc.type === 'Dad' || npc.type === 'Sibling' ||
            npc.type === 'Spouse' || npc.type === 'Your Child');
        var wakeLines = isFamily
            ? ["*yawns* Huh? What is it, honey?", "*groggily* What time is it...?", "*stirs* Can't this wait until morning?"]
            : ["Zzz... huh? What? Leave me alone...", "*wakes up startled* What do you want?!", "*yawns* ...I was sleeping."];
        LIFE.dialogue.open(sleepName, wakeLines[Math.floor(Math.random() * wakeLines.length)], [
            { text: "Sorry, go back to sleep.", effects: {}, rep: 0 },
            { text: "Wake up! I need to talk to you.", effects: {}, rep: -1 }
        ], true);
        // Wake them up — stay awake for 30 seconds before going back to sleep
        npc._sleeping = false;
        npc._wakeLock = 30;
        npc.char.group.position.y = 0;
        npc.char.group.rotation.x = 0;
        return;
    }

    // Mark NPC as met (reveals their name if they were a stranger)
    if (LIFE.meetNPC) LIFE.meetNPC(npc);
    var state = LIFE.state;
    var type = npc.type;
    var speakerName = npc.displayName || npc.name || type;
    var age = state.age;

    // BABY (0-1): can't talk, just gestures
    if (age <= 1) {
        var babyActions = [
            { npcText: "Aww, look at you!", options: [
                { text: "*gurgle*", effects: { happiness: 2 }, rep: 1 },
                { text: "*stare blankly*", effects: {}, rep: 0 },
                { text: "*start crying*", effects: { happiness: -1 }, rep: -1, sound: 'cry' }
            ]},
            { npcText: "Hey there little one!", options: [
                { text: "*reach out arms*", effects: { happiness: 2 }, rep: 2 },
                { text: "*drool*", effects: {}, rep: 0 },
                { text: "*babble* goo goo", effects: { happiness: 1, charisma: 1 }, rep: 1 }
            ]},
            { npcText: "You are so cute!", options: [
                { text: "*giggle*", effects: { happiness: 3 }, rep: 2 },
                { text: "*yawn*", effects: {}, rep: 0 },
                { text: "*wave tiny hand*", effects: { charisma: 1 }, rep: 1 }
            ]}
        ];
        var ba = babyActions[Math.floor(Math.random() * babyActions.length)];
        LIFE.dialogue.npc = npc;
        LIFE.dialogue.open(speakerName, ba.npcText, ba.options, false);
        return;
    }

    // TODDLER (2-4): broken baby talk
    if (age >= 2 && age <= 4) {
        var toddlerActions = [
            { npcText: "Hey there, little buddy!", options: [
                { text: "Hi hi!", effects: { happiness: 2, charisma: 1 }, rep: 2 },
                { text: "Me no wanna talk!", effects: {}, rep: -1 },
                { text: "*hide behind hands*", effects: { happiness: 1 }, rep: 0 }
            ]},
            { npcText: "What are you up to, little one?", options: [
                { text: "Me playing!", effects: { happiness: 2 }, rep: 1, response: {
                    text: "That's great! What are you playing?", options: [
                        { text: "I dunno! Just playing!", effects: { happiness: 2 }, rep: 1 },
                        { text: "Umm... monsters!", effects: { happiness: 1, charisma: 1 }, rep: 1 }
                    ]
                }},
                { text: "Want cookie!", effects: { happiness: 1 }, rep: 0 },
                { text: "You smell funny.", effects: { charisma: 1 }, rep: -2 }
            ]},
            { npcText: "You're getting so big!", options: [
                { text: "I big kid now!", effects: { happiness: 2, charisma: 1 }, rep: 2, response: {
                    text: "Yes you are! Such a big kid!", options: [
                        { text: "*flex tiny muscles*", effects: { happiness: 2 }, rep: 2 },
                        { text: "Bigger than you!", effects: { charisma: 1 }, rep: 0 }
                    ]
                }},
                { text: "No! I baby!", effects: { happiness: 1 }, rep: 0 },
                { text: "*run away giggling*", effects: { happiness: 2, health: 1 }, rep: 1 }
            ]},
            { npcText: "Want to play a game?", options: [
                { text: "Yeah yeah yeah!", effects: { happiness: 3, health: 1 }, rep: 2 },
                { text: "No! Mine!", effects: { charisma: -1 }, rep: -2 },
                { text: "Pwease!", effects: { happiness: 2, charisma: 1 }, rep: 2 }
            ]}
        ];
        var ta = toddlerActions[Math.floor(Math.random() * toddlerActions.length)];
        LIFE.dialogue.npc = npc;
        LIFE.dialogue.open(speakerName, ta.npcText, ta.options, false);
        return;
    }

    // YOUNG KID (5-7): simple kid language - override normal dialogues with simpler versions
    if (age >= 5 && age <= 7) {
        // still allow parent-specific dialogues but simplify non-family ones
        if (type !== 'Mom' && type !== 'Dad' && type !== 'Sibling' && type !== 'Teacher') {
            var youngKidActions = [
                { npcText: "Hey kid! What's up?", options: [
                    { text: "Nothin'! Wanna play?", effects: { happiness: 2, charisma: 1 }, rep: 3, friend: true, response: {
                        text: "Sure! What do you wanna play?", options: [
                            { text: "Tag! You're it!", effects: { happiness: 2, health: 1 }, rep: 2 },
                            { text: "I dunno, you pick!", effects: { happiness: 1 }, rep: 2 }
                        ]
                    }},
                    { text: "Leave me alone!", effects: {}, rep: -3 },
                    { text: "My mom said don't talk to strangers.", effects: { intelligence: 1 }, rep: 1 }
                ]},
                { npcText: "Hi there!", options: [
                    { text: "Hi! I like your shoes!", effects: { charisma: 2, happiness: 1 }, rep: 3 },
                    { text: "Do you have any candy?", effects: { happiness: 1 }, rep: 0 },
                    { text: "Bye bye!", effects: { happiness: 1 }, rep: 1 }
                ]},
                { npcText: "Aren't you a little young to be out here?", options: [
                    { text: "I'm not little! I'm a big kid!", effects: { charisma: 1 }, rep: 1, response: {
                        text: "Ha! Okay tough guy. Be careful out here!", options: [
                            { text: "I will!", effects: { happiness: 1 }, rep: 1 },
                            { text: "You're not my mom!", effects: { charisma: 1 }, rep: -1 }
                        ]
                    }},
                    { text: "My mommy knows I'm here.", effects: { happiness: 1 }, rep: 1 },
                    { text: "*shrug*", effects: {}, rep: 0 }
                ]}
            ];
            var yka = youngKidActions[Math.floor(Math.random() * youngKidActions.length)];
            LIFE.dialogue.npc = npc;
            LIFE.dialogue.open(speakerName, yka.npcText, yka.options, false);
            return;
        }
    }

    // TICKET SELLER - special event vendor
    if (npc.vendorType === 'Ticket Seller') {
        LIFE.dialogue.npc = npc;
        var evt = LIFE.events && LIFE.events.current;
        if (evt) {
            var ticketCost = evt.cost || 50;
            LIFE.dialogue.open(speakerName, "Tonight's event: " + evt.name + "! Tickets are $" + ticketCost + ". Want in?", [
                { text: "Yeah, give me a ticket!", effects: { happiness: evt.hapBonus || 8 }, cost: ticketCost, rep: 2,
                  response: { text: "Enjoy the show! " + (evt.flavor || "It's going to be amazing!"), options: [
                    { text: "This is awesome!", effects: { happiness: 3 }, rep: 1 }
                  ]}
                },
                { text: "What's the event about?", effects: {}, rep: 0,
                  response: { text: evt.description || "It's a great show, trust me!", options: [
                    { text: "Sounds fun! I'll take a ticket!", effects: { happiness: evt.hapBonus || 8 }, cost: ticketCost, rep: 2 },
                    { text: "Maybe next time.", effects: {}, rep: 0 }
                  ]}
                },
                { text: "Just here for merch.", effects: {}, openVendor: 'Ticket Seller' },
                { text: "No thanks.", effects: {}, rep: 0 }
            ], true);
        } else {
            LIFE.dialogue.open(speakerName, "No events right now, but we've got merch! Want to take a look?", [
                { text: "Show me the merch!", effects: {}, openVendor: 'Ticket Seller' },
                { text: "When's the next event?", effects: {}, rep: 0,
                  response: { text: "Should be soon! Keep an eye on the news.", options: [
                    { text: "Thanks!", effects: {}, rep: 1 }
                  ]}
                },
                { text: "No thanks.", effects: {}, rep: 0 }
            ], true);
        }
        return;
    }

    // VENDOR NPCs - open themed shops
    if (npc.isVendor && npc.vendorType) {
        LIFE.dialogue.npc = npc;
        var vendorGreetings = {
            'Food Vendor': ["Hey there! Hungry? We've got the best food in town!", "Welcome! Take a look at our menu!"],
            'Clothes Shop': ["Welcome to our boutique! Looking for something stylish?", "Come on in! New arrivals just this week!"],
            'Pharmacist': ["Hello! How can I help you today?", "Welcome! We carry everything to keep you healthy."],
            'Bookstore': ["Welcome, fellow reader! Looking for a good book?", "Hello! We've got bestsellers and classics alike!"],
            'Gym Trainer': ["Hey! Ready to get in shape?", "Welcome to the gym! Let's get those gains!"],
            'Electronics': ["Hey! Check out the latest tech!", "Welcome! Looking to upgrade your gear?"]
        };
        var greetings = vendorGreetings[npc.vendorType] || ["Welcome! Take a look around."];
        var greeting = greetings[Math.floor(Math.random() * greetings.length)];
        LIFE.dialogue.open(speakerName, greeting, [
            { text: "Show me what you've got!", effects: {}, openVendor: npc.vendorType },
            { text: "Just browsing, thanks.", effects: {}, rep: 0 }
        ], true);
        return;
    }

    // POLICE - talk to cops like Skyrim guards
    if (npc.isPolice) {
        LIFE.dialogue.npc = npc;
        var wanted = state.wantedLevel || 0;
        var rep = state.reputation || 0;
        var isSWAT = npc.isSWAT;

        // SWAT don't chat - they're tactical
        if (isSWAT) {
            LIFE.dialogue.open(speakerName, "Move along. This is a restricted operation.", [
                { text: "Sorry, officer.", effects: {} }
            ], false);
            return;
        }

        // If wanted, cop reacts to criminal
        if (wanted > 0) {
            LIFE.dialogue.open(speakerName, "Stop right there! You're under arrest!", [
                { text: "You'll never take me alive!", effects: {}, rep: -2 },
                { text: "I surrender...", effects: {}, surrender: true }
            ], true);
            return;
        }

        // Known criminal - suspicious
        if (rep <= -40) {
            var suspiciousLines = [
                "I know who you are. Don't try anything.",
                "I've got my eye on you, criminal.",
                "One wrong move and you're done.",
                "We know what you've been up to."
            ];
            LIFE.dialogue.open(speakerName, suspiciousLines[Math.floor(Math.random() * suspiciousLines.length)], [
                { text: "I haven't done anything, officer.", effects: {}, rep: 0 },
                { text: "Is that a threat?", effects: {}, rep: -1,
                  response: { text: "It's a promise. Now move along.", options: [
                    { text: "Whatever.", effects: {}, rep: -1 },
                    { text: "Yes, officer.", effects: {}, rep: 1 }
                  ]}
                },
                { text: "I'm trying to turn my life around.", effects: {}, rep: 1,
                  response: { text: "We'll see about that. Actions speak louder than words.", options: [
                    { text: "I understand.", effects: {}, rep: 1 }
                  ]}
                }
            ], true);
            return;
        }

        // Normal friendly dialogue (various topics)
        var policeDialogues = [
            { text: "Everything alright, citizen? Let me know if you need anything.",
              options: [
                { text: "Just passing through.", effects: {}, rep: 0 },
                { text: "Thanks for keeping us safe, officer!", effects: { happiness: 1 }, rep: 2,
                  response: { text: "Just doing my job. You stay safe out there!", options: [
                    { text: "Will do!", effects: { happiness: 1 }, rep: 1 }
                  ]}
                },
                { text: "Any trouble around here lately?", effects: {}, rep: 0,
                  response: { text: "Nothing we can't handle. But keep your eyes open — you never know.", options: [
                    { text: "I'll be careful.", effects: {}, rep: 1 },
                    { text: "That's reassuring...", effects: {}, rep: 0 }
                  ]}
                }
              ]
            },
            { text: "Stay out of trouble now. I don't want to have to arrest anyone today.",
              options: [
                { text: "No trouble here, officer.", effects: {}, rep: 1 },
                { text: "You couldn't arrest me if you tried.", effects: {}, rep: -3,
                  response: { text: "Is that so? I'll remember that. Move along.", options: [
                    { text: "Just kidding, officer.", effects: {}, rep: 0 },
                    { text: "*walk away*", effects: {}, rep: -1 }
                  ]}
                },
                { text: "Tough day on the beat?", effects: {}, rep: 1,
                  response: { text: "You have no idea. But someone's got to do it.", options: [
                    { text: "Respect, officer.", effects: { happiness: 1 }, rep: 2 },
                    { text: "Ever think about quitting?", effects: {}, rep: 0,
                      response: { text: "Every day. But then who'd keep this town safe?", options: [
                        { text: "Good point.", effects: {}, rep: 1 }
                      ]}
                    }
                  ]}
                }
              ]
            },
            { text: "Nice day for a patrol. What brings you around here?",
              options: [
                { text: "Just enjoying the walk.", effects: { happiness: 1 }, rep: 0 },
                { text: "Do you like being a cop?", effects: {}, rep: 1,
                  response: { text: "It has its moments. The pay isn't great, but keeping people safe is worth it.", options: [
                    { text: "That's admirable.", effects: { happiness: 1 }, rep: 2 },
                    { text: "Sounds boring.", effects: {}, rep: -1 }
                  ]}
                },
                { text: "Mind your own business.", effects: {}, rep: -2 }
              ]
            },
            { text: "Citizen. You need something?",
              options: [
                { text: "Nope, just saying hi.", effects: { happiness: 1 }, rep: 1 },
                { text: "How's crime in this area?", effects: {}, rep: 0,
                  response: { text: state.kills > 0 ? "We've had some murders recently. Scary times." : "Pretty quiet, actually. Let's keep it that way.", options: [
                    { text: "Stay safe, officer.", effects: {}, rep: 1 }
                  ]}
                },
                { text: "I don't talk to cops.", effects: {}, rep: -2 }
              ]
            }
        ];
        var pd = policeDialogues[Math.floor(Math.random() * policeDialogues.length)];
        LIFE.dialogue.open(speakerName, pd.text, pd.options, true);
        return;
    }

    // REAL ESTATE AGENT - property buying dialogue
    if (npc.isRealEstate) {
        LIFE.dialogue.npc = npc;
        if (state.age < 18) {
            LIFE.dialogue.open(speakerName, "Hey there, kiddo! Real estate is for adults. Come back when you're 18!", [
                { text: "Okay!", effects: {} }
            ], false);
            return;
        }
        var ownedCount = state.properties ? state.properties.length : 0;
        var greeting = ownedCount > 0
            ? "Welcome back! You own " + ownedCount + " propert" + (ownedCount > 1 ? "ies" : "y") + ". Looking to expand your portfolio?"
            : "Welcome to our office! Interested in buying some property? We've got apartments, condos, houses, and commercial buildings.";
        LIFE.dialogue.open(speakerName, greeting, [
            { text: "Show me what's available.", effects: {}, openProperty: true },
            { text: "Just browsing, thanks.", effects: {} }
        ], true);
        return;
    }

    // CAR SALESMAN - car buying dialogue
    if (npc.isCarSalesman) {
        LIFE.dialogue.npc = npc;
        if (state.age < 16) {
            LIFE.dialogue.open(speakerName, "Hey there! Come back when you're old enough to drive!", [
                { text: "Okay!", effects: {} }
            ], false);
            return;
        }

        var carOptions = [];
        var models = LIFE.CAR_MODELS || [];
        for (var ci = 0; ci < models.length; ci++) {
            var cm = models[ci];
            if (state.age < cm.minAge) continue;
            var canAfford = state.money >= cm.cost;
            var owned = state.ownedCar && state.ownedCar.modelIndex === ci;
            if (owned) continue; // skip already owned model
            (function(idx, model, affordable) {
                carOptions.push({
                    text: model.name + ' - $' + model.cost.toLocaleString() + (affordable ? '' : ' (Can\'t afford)'),
                    effects: {},
                    _carIndex: idx
                });
            })(ci, cm, canAfford);
        }

        if (carOptions.length === 0) {
            var msg = state.ownedCar ? "Looks like you already have the best we offer! Enjoy your " + state.ownedCar.name + "!" : "Sorry, we don't have anything in your age range right now. Come back later!";
            LIFE.dialogue.open(speakerName, msg, [
                { text: "Thanks anyway!", effects: {} }
            ], false);
            return;
        }

        var greeting = state.ownedCar
            ? "Looking to upgrade from that " + state.ownedCar.name + "? I'll give you a fair trade-in! What catches your eye?"
            : "Welcome to the Auto Dealership! We've got the perfect ride for you. What are you interested in?";

        carOptions.push({ text: "Just browsing, thanks.", effects: {} });

        LIFE.dialogue.open(speakerName, greeting, carOptions, true);
        return;
    }

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
                { text: "Actually, I quit.", effects: { happiness: -3 }, rep: -1, career: 'none', response: {
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
                { text: "That's unfair!", effects: {}, rep: -1, response: {
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
                        { text: "Not worth it.", effects: {}, rep: -1 }
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

    // Relationship-aware dialogue overrides
    var rel = state.relationships[npc.name];
    var relLevel = rel ? rel.level : 0;

    // Hostile NPCs refuse to talk
    if (relLevel <= -60 && type !== 'Mom' && type !== 'Dad' && !npc.isPolice) {
        var hostileLines = [
            { text: "Get away from me. Now.", options: [
                { text: "I'm sorry for what happened.", effects: { happiness: -1 }, rep: 3,
                  response: { text: "Sorry doesn't cut it. Leave me alone.", options: [
                    { text: "I understand.", effects: {}, rep: 1 },
                    { text: "Fine. Your loss.", effects: {}, rep: -2 }
                  ]}
                },
                { text: "I just want to talk.", effects: {}, rep: 0 },
                { text: "Whatever.", effects: {}, rep: -1 }
            ]},
            { text: "I have nothing to say to you.", options: [
                { text: "Can we start over?", effects: { charisma: 1 }, rep: 2 },
                { text: "Fair enough.", effects: {}, rep: 0 }
            ]},
            { text: "You've got some nerve showing your face around here.", options: [
                { text: "I deserve that.", effects: { happiness: -2 }, rep: 5 },
                { text: "I don't need this.", effects: {}, rep: -2 }
            ]}
        ];
        var hd = hostileLines[Math.floor(Math.random() * hostileLines.length)];
        LIFE.dialogue.open(speakerName, hd.text, hd.options, false);
        return;
    }

    // Close friends have warmer greetings mixed in
    if (relLevel >= 40 && Math.random() < 0.3) {
        var friendlyLines = [
            { text: "Hey! It's so good to see you! What's up?", options: [
                { text: "Just wanted to hang out!", effects: { happiness: 3, charisma: 1 }, rep: 3 },
                { text: "Not much, just saying hi!", effects: { happiness: 2 }, rep: 2 },
                { text: "Actually, I could use some advice...", effects: { intelligence: 1 }, rep: 2 }
            ]},
            { text: "There's my favorite person! How's life treating you?", options: [
                { text: "Great, thanks to friends like you!", effects: { happiness: 3, charisma: 2 }, rep: 5 },
                { text: "Could be better, honestly.", effects: { happiness: 1 }, rep: 2 },
                { text: "Living the dream!", effects: { happiness: 2, charisma: 1 }, rep: 2 }
            ]}
        ];
        var fd = friendlyLines[Math.floor(Math.random() * friendlyLines.length)];
        LIFE.dialogue.open(speakerName, fd.text, fd.options, false);
        return;
    }

    // default dialogues by type (filter by age if minAge specified)
    var dialogues = LIFE.NPC_DIALOGUES[type];
    if (!dialogues || dialogues.length === 0) {
        dialogues = [{ text: "...", options: [{ text: "Wave and smile", effects: { charisma: 1 }, rep: 1 }] }];
    }
    var eligible = dialogues.filter(function(d) {
        if (d.minAge && age < d.minAge) return false;
        if (d.maxAge && age > d.maxAge) return false;
        return true;
    });
    if (eligible.length === 0) eligible = dialogues.filter(function(d) { return !d.minAge; });
    if (eligible.length === 0) eligible = dialogues;

    var dlg = eligible[Math.floor(Math.random() * eligible.length)];
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
                { text: "Just bandage it up ($50)", effects: { health: 8 }, cost: 50, hospitalExit: true },
                { text: "I'll walk it off", effects: { health: 2, happiness: -3 }, hospitalExit: true }
            ];
            break;

        case 'carAccident':
            text = "You were brought in after a car accident. You have some bruising and we need to check for internal injuries.";
            options = [
                { text: "Run all the tests ($400)", effects: { health: 18, happiness: -3 }, cost: 400, hospitalExit: true },
                { text: "Just patch me up ($100)", effects: { health: 8 }, cost: 100, hospitalExit: true },
                { text: "I can't afford this, let me go", effects: { health: 3, happiness: -5 }, hospitalExit: true }
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
