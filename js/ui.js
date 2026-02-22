// ============================================================
// UI MANAGEMENT
// ============================================================
LIFE.ui = {};

LIFE.ui.$ = {
    age:       document.getElementById('ageNum'),
    timer:     document.getElementById('timerFill'),
    stage:     document.getElementById('stageText'),
    popup:     document.getElementById('actionPopup'),
    actions:   document.getElementById('actions'),
    start:     document.getElementById('clickStart'),
    death:     document.getElementById('deathScreen'),
    deathSummary: document.getElementById('deathSummary'),
    cross:     document.getElementById('crosshair'),
    ageBox:    document.getElementById('ageBox'),
    timerWrap: document.getElementById('timerWrap'),
    skipHint:  document.getElementById('skipHint'),
    controls:  document.getElementById('controls'),
    money:     document.getElementById('moneyNum'),
    moneyBox:  document.getElementById('moneyBox'),
    statsBox:  document.getElementById('statsBox'),
    statInt:   document.getElementById('statInt'),
    statHap:   document.getElementById('statHap'),
    statCha:   document.getElementById('statCha'),
    statHp:    document.getElementById('statHp'),
    statIntVal: document.getElementById('statIntVal'),
    statHapVal: document.getElementById('statHapVal'),
    statChaVal: document.getElementById('statChaVal'),
    statHpVal:  document.getElementById('statHpVal'),
    statBty:   document.getElementById('statBty'),
    statBtyVal: document.getElementById('statBtyVal'),
    repFill:   document.getElementById('repFill'),
    repVal:    document.getElementById('repVal'),
    repTitle:  document.getElementById('repTitle'),
    repChange: document.getElementById('repChange'),
    career:    document.getElementById('careerText'),
    npcHint:   document.getElementById('npcHint'),
    shopBox:   document.getElementById('shopBox'),
    shopItems: document.getElementById('shopItems'),
    weapon:    document.getElementById('weaponIndicator'),
    // new elements
    wantedLevel:   document.getElementById('wantedLevel'),
    playerHpBar:   document.getElementById('playerHpBar'),
    playerHpFill:  document.getElementById('playerHpFill'),
    playerHpText:  document.getElementById('playerHpText'),
    inventoryBar:  document.getElementById('inventoryBar'),
    friendsList:   document.getElementById('friendsList'),
    friendsContent:document.getElementById('friendsContent'),
    damageFlash:   document.getElementById('damageFlash'),
    jailScreen:    document.getElementById('jailScreen'),
    jailText:      document.getElementById('jailText'),
    jailDetails:   document.getElementById('jailDetails')
};

LIFE.ui.repChangeTimer = 0;

LIFE.ui.showStageMessage = function(msg) {
    LIFE.ui.$.stage.textContent = msg;
    LIFE.ui.$.stage.classList.add('show');
    LIFE.state.stageTextTimer = 3;
};

LIFE.ui.showPopup = function(text, color) {
    LIFE.ui.$.popup.textContent = text;
    LIFE.ui.$.popup.style.color = color || '#fff';
    LIFE.ui.$.popup.classList.add('show');
    LIFE.state.popupTimer = 1.5;
};

LIFE.ui.showRepChange = function(amount) {
    var el = LIFE.ui.$.repChange;
    if (amount > 0) {
        el.textContent = '+' + amount + ' Reputation';
        el.style.color = '#66bb6a';
    } else {
        el.textContent = amount + ' Reputation';
        el.style.color = '#ef5350';
    }
    el.classList.add('show');
    LIFE.ui.repChangeTimer = 2.0;
};

LIFE.ui.updateActionButtons = function() {
    var acts = LIFE.getActionsForAge(LIFE.state.age);
    var container = LIFE.ui.$.actions;
    container.innerHTML = '';
    acts.forEach(function(a, i) {
        var def = LIFE.ACTION_DEFS[a];
        var btn = document.createElement('div');
        btn.className = 'actBtn';
        btn.innerHTML = '<span class="key">' + (i + 1) + '</span>' + def.label;
        btn.onclick = function() { LIFE.performAction(i); };
        container.appendChild(btn);
    });
};

LIFE.ui.updateJailActions = function() {
    var container = LIFE.ui.$.actions;
    container.innerHTML = '';
    var jailActs = [
        { key: '1', label: 'Punch', action: function() { LIFE.performAction(0); } },
        { key: 'T', label: 'Talk', action: function() {
            if (LIFE.state.nearestNPC) { LIFE.dialogue.talkToNPC(LIFE.state.nearestNPC); }
        }}
    ];
    jailActs.forEach(function(a) {
        var btn = document.createElement('div');
        btn.className = 'actBtn';
        btn.innerHTML = '<span class="key">' + a.key + '</span>' + a.label;
        btn.onclick = a.action;
        container.appendChild(btn);
    });
};

LIFE.ui.hideGameUI = function() {
    var $ = LIFE.ui.$;
    $.ageBox.style.display = 'none';
    $.timerWrap.style.display = 'none';
    $.skipHint.style.display = 'none';
    $.actions.style.display = 'none';
    $.controls.style.display = 'none';
    $.moneyBox.style.display = 'none';
    $.statsBox.style.display = 'none';
    $.npcHint.style.display = 'none';
    if ($.weapon) $.weapon.style.display = 'none';
    if ($.wantedLevel) $.wantedLevel.style.display = 'none';
    if ($.playerHpBar) $.playerHpBar.style.display = 'none';
    if ($.inventoryBar) $.inventoryBar.style.display = 'none';
    var dt = document.getElementById('dateTime');
    if (dt) dt.style.display = 'none';
    var spd = document.getElementById('speedDisplay');
    if (spd) spd.style.display = 'none';
};

LIFE.ui.showGameUI = function() {
    var $ = LIFE.ui.$;
    $.ageBox.style.display = 'block';
    $.timerWrap.style.display = 'block';
    $.skipHint.style.display = 'block';
    $.actions.style.display = 'flex';
    $.controls.style.display = 'block';
    $.moneyBox.style.display = 'block';
    $.statsBox.style.display = 'block';
};

LIFE.ui.updateMoney = function() {
    LIFE.ui.$.money.textContent = Math.floor(LIFE.state.money).toLocaleString();
};

LIFE.ui.updateStats = function() {
    var s = LIFE.state.stats;
    LIFE.ui.$.statInt.style.width = Math.floor(s.intelligence) + '%';
    LIFE.ui.$.statHap.style.width = Math.floor(s.happiness) + '%';
    LIFE.ui.$.statCha.style.width = Math.floor(s.charisma) + '%';
    LIFE.ui.$.statHp.style.width  = Math.floor(s.health) + '%';
    if (LIFE.ui.$.statBty) LIFE.ui.$.statBty.style.width = Math.floor(s.beauty || 50) + '%';
    LIFE.ui.$.statIntVal.textContent = Math.floor(s.intelligence);
    LIFE.ui.$.statHapVal.textContent = Math.floor(s.happiness);
    LIFE.ui.$.statChaVal.textContent = Math.floor(s.charisma);
    LIFE.ui.$.statHpVal.textContent  = Math.floor(s.health);
    if (LIFE.ui.$.statBtyVal) LIFE.ui.$.statBtyVal.textContent = Math.floor(s.beauty || 50);

    var rep = LIFE.state.reputation;
    var repFill = LIFE.ui.$.repFill;
    if (rep >= 0) {
        repFill.style.left = '50%';
        repFill.style.width = (rep / 2) + '%';
        repFill.style.background = '#66bb6a';
    } else {
        var w = Math.abs(rep) / 2;
        repFill.style.left = (50 - w) + '%';
        repFill.style.width = w + '%';
        repFill.style.background = '#ef5350';
    }
    LIFE.ui.$.repVal.textContent = (rep > 0 ? '+' : '') + Math.floor(rep);
    LIFE.ui.$.repVal.style.color = rep >= 0 ? '#66bb6a' : '#ef5350';

    var repInfo = LIFE.getRepTitle(rep);
    LIFE.ui.$.repTitle.textContent = repInfo.title;
    LIFE.ui.$.repTitle.style.color = repInfo.color;

    var career = LIFE.economy.getCareer();
    var careerText = career ? career.title : '';
    if (LIFE.state.careerLevel > 0) careerText += ' Lvl ' + LIFE.state.careerLevel;
    if (LIFE.state.fame > 0) {
        var fameInfo = LIFE.economy.getFameLevel();
        if (fameInfo.title !== 'Unknown') careerText += ' | ' + fameInfo.title;
    }
    LIFE.ui.$.career.textContent = careerText;
    LIFE.ui.$.career.style.display = (LIFE.state.age >= 14 && career && career.income > 0) ? 'block' : 'none';
};

LIFE.ui.updateNPCHint = function() {
    var hint = LIFE.ui.$.npcHint;
    if (LIFE.state.nearestNPC && !LIFE.dialogue.active && !LIFE.state.shopOpen && !LIFE.state.heldByParent) {
        hint.style.display = 'block';
        var npc = LIFE.state.nearestNPC;
        var rel = LIFE.state.relationships[npc.name];
        var relText = '';
        if (LIFE.state.spouseName === npc.name) {
            relText = ' (Spouse)';
        } else if (LIFE.state.romanceTarget === npc.name && LIFE.state.romanceLevel >= 30) {
            relText = ' (Partner)';
        } else if (rel) {
            if (rel.level >= 40) relText = ' (Close Friend)';
            else if (rel.level >= 15) relText = ' (Friend)';
            else if (rel.level <= -40) relText = ' (Hostile)';
            else if (rel.level <= -15) relText = ' (Unfriendly)';
        }
        var displayName = npc.name || npc.type;
        if (npc.type.indexOf('Hiring') === 0) displayName = npc.type.replace('Hiring ', '') + ' Manager';
        // show type in parentheses if name differs from type
        else if (npc.name !== npc.type) displayName = npc.name + ' (' + npc.type + ')';
        hint.textContent = 'Press T to talk to ' + displayName + relText;
    } else {
        hint.style.display = 'none';
    }

    // crosshair changes in combat mode
    var cross = LIFE.ui.$.cross;
    if (cross && LIFE.getEquipped && LIFE.getEquipped() === 'Pistol') {
        cross.style.width = '8px';
        cross.style.height = '8px';
        cross.style.borderColor = 'rgba(255,50,50,0.8)';
        cross.style.borderWidth = '2px';
    } else if (cross) {
        cross.style.width = '6px';
        cross.style.height = '6px';
        cross.style.borderColor = 'rgba(255,255,255,0.5)';
        cross.style.borderWidth = '1.5px';
    }
};

// ============================================================
// WEAPON / INVENTORY DISPLAY
// ============================================================
LIFE.ui.updateWeapon = function() {
    var el = LIFE.ui.$.weapon;
    if (!el) return;
    var equipped = LIFE.getEquipped ? LIFE.getEquipped() : null;
    if (!equipped || equipped === 'Fists') {
        el.style.display = 'none';
    } else if (equipped === 'Pistol') {
        el.style.display = 'block';
        el.innerHTML = 'Pistol <span style="opacity:0.6;font-size:11px">| Click to shoot</span>';
        el.style.color = '#ef5350';
        el.style.borderColor = 'rgba(239,83,80,0.4)';
    } else if (equipped === 'Switchblade') {
        el.style.display = 'block';
        el.textContent = 'Switchblade';
        el.style.color = '#ff9800';
        el.style.borderColor = 'rgba(255,152,0,0.4)';
    } else {
        el.style.display = 'none';
    }

    // inventory bar
    var inv = LIFE.state.inventory;
    var bar = LIFE.ui.$.inventoryBar;
    if (!bar) return;
    if (inv.length <= 1) {
        bar.style.display = 'none';
        return;
    }
    bar.style.display = 'flex';
    bar.innerHTML = '';
    for (var i = 0; i < inv.length; i++) {
        var slot = document.createElement('div');
        slot.className = 'invSlot' + (i === LIFE.state.equippedIndex ? ' active' : '');
        slot.textContent = inv[i];
        bar.appendChild(slot);
    }
};

// ============================================================
// PLAYER HEALTH BAR
// ============================================================
LIFE.ui.updatePlayerHealth = function() {
    var $ = LIFE.ui.$;
    var hp = LIFE.state.stats.health;
    var pct = Math.max(0, Math.floor(hp));
    $.playerHpBar.style.display = 'block';
    $.playerHpFill.style.width = pct + '%';
    $.playerHpText.textContent = pct;

    // color based on health
    if (pct > 60) {
        $.playerHpFill.style.background = 'linear-gradient(90deg, #66bb6a, #81c784)';
    } else if (pct > 30) {
        $.playerHpFill.style.background = 'linear-gradient(90deg, #ff9800, #ffb74d)';
    } else {
        $.playerHpFill.style.background = 'linear-gradient(90deg, #ef5350, #ff1744)';
    }
};

// ============================================================
// WANTED LEVEL STARS
// ============================================================
LIFE.ui.updateWanted = function() {
    var el = LIFE.ui.$.wantedLevel;
    if (!el) return;
    var level = LIFE.state.wantedLevel;
    var bounty = LIFE.state.bounty || 0;
    // show bounty even when not actively wanted
    if (level <= 0 && bounty <= 0) {
        el.style.display = 'none';
        return;
    }
    el.style.display = 'block';
    if (level > 0) {
        var stars = '';
        for (var i = 0; i < 5; i++) {
            if (i < level) stars += '\u2605';
            else stars += '\u2606';
        }
        el.innerHTML = stars + (bounty > 0 ? '<br><span style="font-size:13px;letter-spacing:0">Bounty: $' + bounty + '</span>' : '');
        el.style.color = level >= 4 ? '#ff1744' : (level >= 2 ? '#ff9800' : '#ffeb3b');
    } else {
        // no active chase but have bounty
        el.innerHTML = '<span style="font-size:13px;letter-spacing:0">Bounty: $' + bounty + '</span>';
        el.style.color = '#ff9800';
    }
};

// ============================================================
// DAMAGE FLASH
// ============================================================
LIFE.ui.flashDamage = function() {
    var el = LIFE.ui.$.damageFlash;
    if (!el) return;
    el.style.opacity = '1';
    setTimeout(function() { el.style.opacity = '0'; }, 150);
};

// ============================================================
// FRIENDS LIST
// ============================================================
LIFE.ui.openFriends = function() {
    if (LIFE.dialogue.active || LIFE.state.shopOpen || LIFE.state.friendsOpen) return;
    LIFE.state.friendsOpen = true;
    LIFE.unlockCursor();

    var content = LIFE.ui.$.friendsContent;
    content.innerHTML = '';

    // Tab bar
    var tabs = document.createElement('div');
    tabs.className = 'infoTabs';
    tabs.innerHTML = '<div class="infoTab active" data-tab="overview">Overview</div>' +
        '<div class="infoTab" data-tab="finances">Finances</div>' +
        '<div class="infoTab" data-tab="relationships">Relationships</div>';
    content.appendChild(tabs);

    // Tab content area
    var tabContent = document.createElement('div');
    tabContent.className = 'infoTabContent';
    content.appendChild(tabContent);

    // close button
    var closeDiv = document.createElement('div');
    closeDiv.className = 'friendsClose';
    closeDiv.textContent = '[F / ESC] Close';
    closeDiv.onclick = function() { LIFE.ui.closeFriends(); };
    content.appendChild(closeDiv);

    // Tab switching
    var tabBtns = tabs.querySelectorAll('.infoTab');
    tabBtns.forEach(function(btn) {
        btn.onclick = function() {
            tabBtns.forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            LIFE.ui.renderInfoTab(tabContent, btn.getAttribute('data-tab'));
        };
    });

    // render default tab
    LIFE.ui.renderInfoTab(tabContent, 'overview');

    LIFE.ui.$.friendsList.style.display = 'block';
};

LIFE.ui.renderInfoTab = function(container, tab) {
    container.innerHTML = '';
    if (tab === 'overview') LIFE.ui.renderOverviewTab(container);
    else if (tab === 'finances') LIFE.ui.renderFinancesTab(container);
    else if (tab === 'relationships') LIFE.ui.renderRelationshipsTab(container);
};

// ===== OVERVIEW TAB =====
LIFE.ui.renderOverviewTab = function(container) {
    var state = LIFE.state;
    var rows = [];

    var genderLabel = state.playerGender === 'M' ? 'Male' : (state.playerGender === 'F' ? 'Female' : 'Unknown');
    rows.push(['Gender', genderLabel]);
    rows.push(['Age', state.age]);

    var career = LIFE.economy.getCareer();
    var careerText = career && career.income > 0 ? career.title : 'Unemployed';
    if (state.careerLevel > 0) careerText += ' (Lvl ' + state.careerLevel + ')';
    rows.push(['Career', careerText]);

    if (state.fame > 0) {
        var fameInfo = LIFE.economy.getFameLevel();
        rows.push(['Fame', fameInfo.title + ' (' + Math.floor(state.fame) + ')']);
    }

    var repInfo = LIFE.getRepTitle(state.reputation);
    rows.push(['Reputation', (repInfo.title || 'Neutral') + ' (' + (state.reputation > 0 ? '+' : '') + Math.floor(state.reputation) + ')']);

    rows.push(['Money', '$' + Math.floor(Math.max(0, state.money)).toLocaleString()]);
    rows.push(['Friends', state.friends]);
    rows.push(['Enemies', state.enemies]);

    // Romance
    if (state.spouseName) {
        rows.push(['Spouse', state.spouseName]);
    } else if (state.romanceTarget && state.romanceLevel >= 30) {
        rows.push(['Dating', state.romanceTarget + ' (Love: ' + Math.floor(state.romanceLevel) + ')']);
    } else {
        rows.push(['Love Life', 'Single']);
    }

    // Children
    if (state.hasKids && state.childCount > 0) {
        var childNames = state.childNames || [];
        var childText = state.childCount + '';
        if (childNames.length > 0) childText += ' (' + childNames.join(', ') + ')';
        rows.push(['Children', childText]);
    }

    // Properties
    if (state.properties && state.properties.length > 0) {
        var propNames = state.properties.map(function(p) { return p.name; });
        rows.push(['Properties', propNames.join(', ')]);
    }

    // Investments
    if (state.investments && state.investments.length > 0) {
        var totalInv = 0;
        state.investments.forEach(function(inv) { totalInv += inv.value; });
        rows.push(['Investments', state.investments.length + ' ($' + totalInv.toLocaleString() + ')']);
    }

    // Stats
    rows.push(['---', '']);
    rows.push(['Intelligence', Math.floor(state.stats.intelligence)]);
    rows.push(['Happiness', Math.floor(state.stats.happiness)]);
    rows.push(['Charisma', Math.floor(state.stats.charisma)]);
    rows.push(['Health', Math.floor(state.stats.health)]);

    // Criminal record
    if (state.criminalRecord) rows.push(['Criminal Record', 'Yes']);
    if (state.bounty > 0) rows.push(['Bounty', '$' + state.bounty]);
    if (state.kills > 0) rows.push(['Kills', state.kills]);
    if (state.timesJailed > 0) rows.push(['Times Jailed', state.timesJailed]);
    if (state.familyKiller) rows.push(['Trauma', 'Family Killer - haunted by guilt']);
    else if (state.familyAbuser) rows.push(['Trauma', 'Family Abuser - wracked with guilt']);

    rows.forEach(function(r) {
        if (r[0] === '---') {
            var sep = document.createElement('div');
            sep.style.cssText = 'border-top:1px solid rgba(255,255,255,0.1);margin:8px 0';
            container.appendChild(sep);
            return;
        }
        var row = document.createElement('div');
        row.className = 'overviewRow';
        row.innerHTML = '<span class="oLabel">' + r[0] + '</span><span class="oValue">' + r[1] + '</span>';
        container.appendChild(row);
    });
};

// ===== FINANCES TAB =====
LIFE.ui.renderFinancesTab = function(container) {
    var breakdown = LIFE.economy.getFinanceBreakdown();

    // Income section
    var incSec = document.createElement('div');
    incSec.className = 'financeSection';
    incSec.innerHTML = '<div class="financeSectionTitle">Yearly Income</div>';
    var incKeys = Object.keys(breakdown.income);
    if (incKeys.length === 0) {
        var noInc = document.createElement('div');
        noInc.className = 'financeRow';
        noInc.innerHTML = '<span class="fLabel" style="color:#666">No income sources</span>';
        incSec.appendChild(noInc);
    } else {
        incKeys.forEach(function(k) {
            var row = document.createElement('div');
            row.className = 'financeRow';
            row.innerHTML = '<span class="fLabel">' + k + '</span><span class="fValue pos">+$' + breakdown.income[k].toLocaleString() + '</span>';
            incSec.appendChild(row);
        });
    }
    container.appendChild(incSec);

    // Expenses section
    var expSec = document.createElement('div');
    expSec.className = 'financeSection';
    expSec.innerHTML = '<div class="financeSectionTitle">Yearly Expenses</div>';
    var expKeys = Object.keys(breakdown.expenses);
    if (expKeys.length === 0) {
        var noExp = document.createElement('div');
        noExp.className = 'financeRow';
        noExp.innerHTML = '<span class="fLabel" style="color:#666">No expenses</span>';
        expSec.appendChild(noExp);
    } else {
        expKeys.forEach(function(k) {
            var row = document.createElement('div');
            row.className = 'financeRow';
            row.innerHTML = '<span class="fLabel">' + k + '</span><span class="fValue neg">-$' + breakdown.expenses[k].toLocaleString() + '</span>';
            expSec.appendChild(row);
        });
    }
    container.appendChild(expSec);

    // Net / Total
    var total = document.createElement('div');
    total.className = 'financeTotal';
    var netClass = breakdown.net >= 0 ? 'pos' : 'neg';
    var netSign = breakdown.net >= 0 ? '+' : '';
    total.innerHTML = '<span>Net Yearly</span><span class="fValue ' + netClass + '">' + netSign + '$' + breakdown.net.toLocaleString() + '</span>';
    container.appendChild(total);

    // Savings
    var savings = document.createElement('div');
    savings.className = 'financeTotal';
    savings.style.borderTop = '1px solid rgba(255,255,255,0.08)';
    savings.style.marginTop = '4px';
    savings.innerHTML = '<span>Current Savings</span><span class="fValue" style="color:#66bb6a">$' + breakdown.savings.toLocaleString() + '</span>';
    container.appendChild(savings);

    // Tip
    var tip = document.createElement('div');
    tip.style.cssText = 'text-align:center;font-size:11px;color:#666;margin-top:12px';
    tip.textContent = 'Salary is paid each year. Press Work for bonus income.';
    container.appendChild(tip);
};

// ===== RELATIONSHIPS TAB =====
LIFE.ui.renderRelationshipsTab = function(container) {
    var state = LIFE.state;

    // summary bar
    var summary = document.createElement('div');
    summary.className = 'friendsSummary';
    summary.innerHTML = '<span>Friends: <span class="val good">' + state.friends + '</span></span>' +
        '<span>Enemies: <span class="val bad">' + state.enemies + '</span></span>' +
        '<span>Rep: <span class="val ' + (state.reputation >= 0 ? 'good' : 'bad') + '">' +
        (state.reputation > 0 ? '+' : '') + Math.floor(state.reputation) + '</span></span>';
    container.appendChild(summary);

    // romance summary
    if (state.spouseName) {
        var spRow = document.createElement('div');
        spRow.className = 'friendsSummary';
        spRow.innerHTML = '<span style="color:#e91e63">Spouse: ' + state.spouseName + '</span>' +
            (state.childCount > 0 ? '<span style="color:#ff9800">Children: ' + state.childCount + '</span>' : '');
        container.appendChild(spRow);
    } else if (state.romanceTarget && state.romanceLevel >= 30) {
        var romRow = document.createElement('div');
        romRow.className = 'friendsSummary';
        romRow.innerHTML = '<span style="color:#e91e63">Dating: ' + state.romanceTarget +
            ' (Love: ' + Math.floor(state.romanceLevel) + ')</span>';
        container.appendChild(romRow);
    }

    var rels = state.relationships;
    var names = Object.keys(rels);
    if (names.length === 0) {
        var empty = document.createElement('div');
        empty.className = 'friendsEmpty';
        empty.textContent = 'No relationships yet. Talk to people!';
        container.appendChild(empty);
    } else {
        names.sort(function(a, b) { return rels[b].level - rels[a].level; });
        names.forEach(function(name) {
            var rel = rels[name];
            var row = document.createElement('div');
            row.className = 'friendRow';

            var level = rel.level;
            var statusText, statusClass;
            if (state.spouseName === name) { statusText = 'Spouse'; statusClass = 'good'; }
            else if (state.romanceTarget === name) { statusText = 'Partner'; statusClass = 'good'; }
            else if (level >= 50) { statusText = 'Close'; statusClass = 'good'; }
            else if (level >= 20) { statusText = 'Friend'; statusClass = 'good'; }
            else if (level > -20) { statusText = 'Neutral'; statusClass = 'neutral'; }
            else if (level > -50) { statusText = 'Hostile'; statusClass = 'bad'; }
            else { statusText = 'Enemy'; statusClass = 'bad'; }

            var barLeft, barWidth, barColor;
            if (level >= 0) {
                barLeft = 50;
                barWidth = (level / 100) * 50;
                barColor = '#66bb6a';
            } else {
                barWidth = (Math.abs(level) / 100) * 50;
                barLeft = 50 - barWidth;
                barColor = '#ef5350';
            }

            row.innerHTML = '<span class="friendName">' + name + '</span>' +
                '<div class="friendBar"><div class="friendBarCenter"></div>' +
                '<div class="friendBarFill" style="left:' + barLeft + '%;width:' + barWidth + '%;background:' + barColor + '"></div></div>' +
                '<span class="friendLevel" style="color:' + barColor + '">' + (level > 0 ? '+' : '') + level + '</span>' +
                '<span class="friendStatus ' + statusClass + '">' + statusText + '</span>';
            container.appendChild(row);
        });
    }
};

LIFE.ui.closeFriends = function() {
    LIFE.state.friendsOpen = false;
    LIFE.ui.$.friendsList.style.display = 'none';
    LIFE.lockCursor();
};

// ============================================================
// DATE / TIME DISPLAY
// ============================================================
LIFE.ui.updateDateTime = function() {
    var el = document.getElementById('dateTime');
    if (!el) return;
    if (LIFE.state.gamePhase !== 'playing' && LIFE.state.gamePhase !== 'jail') { el.style.display = 'none'; return; }
    el.style.display = 'block';
    var sim = LIFE.getSimDate();
    var phaseLabel = '';
    if (LIFE.state.dayPhase === 'classroom') phaseLabel = ' | In Class';
    else if (LIFE.state.dayPhase === 'schoolyard') phaseLabel = ' | Recess';
    else if (LIFE.state.dayPhase === 'home') phaseLabel = ' | At Home';
    el.textContent = sim.text + phaseLabel;

    // update speed display
    var speedEl = document.getElementById('speedDisplay');
    if (speedEl) {
        if (LIFE.state.gamePhase === 'playing') {
            speedEl.style.display = 'block';
            var spd = LIFE.state.timeSpeed;
            speedEl.textContent = (spd < 10 ? spd.toFixed(1) : Math.round(spd)) + 'x';
        } else {
            speedEl.style.display = 'none';
        }
    }
};

// ============================================================
// TIME SKIP PANEL
// ============================================================
LIFE.ui.openTimeSkip = function() {
    if (LIFE.dialogue.active || LIFE.state.shopOpen || LIFE.state.friendsOpen || LIFE.state.timeSkipOpen) return;
    LIFE.state.timeSkipOpen = true;
    LIFE.unlockCursor();

    // --- Speed slider setup ---
    var speedSlider = document.getElementById('speedSlider');
    var speedLabel = document.getElementById('speedSliderValue');
    if (speedSlider && speedLabel) {
        // Set slider to current speed (reverse exponential mapping)
        var currentSpeed = LIFE.state.timeSpeed;
        var t = Math.log(currentSpeed) / Math.log(5000); // inverse of pow(5000, t)
        speedSlider.value = Math.round(t * 1000);
        speedLabel.textContent = (currentSpeed < 10 ? currentSpeed.toFixed(1) : Math.round(currentSpeed)) + 'x';
        speedSlider.oninput = function() {
            var t2 = parseInt(speedSlider.value) / 1000;
            var spd = Math.pow(5000, t2);
            LIFE.state.timeSpeed = spd;
            speedLabel.textContent = (spd < 10 ? spd.toFixed(1) : Math.round(spd)) + 'x';
            // update top speed display too
            var speedEl = document.getElementById('speedDisplay');
            if (speedEl) speedEl.textContent = (spd < 10 ? spd.toFixed(1) : Math.round(spd)) + 'x';
        };
    }

    // --- Time skip presets ---
    var opts = document.getElementById('timeSkipOptions');
    opts.innerHTML = '';

    var presets = [
        { label: 'Skip 1 Hour', hours: 1 },
        { label: 'Skip 6 Hours', hours: 6 },
        { label: 'Skip 1 Day', hours: 24 },
        { label: 'Skip 1 Week', hours: 168 },
        { label: 'Skip 1 Month', hours: 720 },
        { label: 'Skip to Next Year', hours: -1 }
    ];

    presets.forEach(function(p) {
        var btn = document.createElement('div');
        btn.className = 'skipBtn';
        btn.textContent = p.label;
        btn.onclick = function() {
            if (p.hours === -1) {
                LIFE.ui.closeTimeSkip();
                LIFE.advanceYear();
            } else {
                LIFE.skipTime(p.hours);
            }
        };
        opts.appendChild(btn);
    });

    // slider in hours (1 hour to 4320 hours = ~6 months)
    var slider = document.getElementById('skipSlider');
    var label = document.getElementById('skipSliderLabel');
    var skipBtn = document.getElementById('skipSliderBtn');
    slider.min = 1;
    slider.max = 4320;
    slider.value = 1;
    label.textContent = '1 hour';
    slider.oninput = function() {
        var h = parseInt(slider.value);
        if (h < 24) {
            label.textContent = h + ' hour' + (h > 1 ? 's' : '');
        } else if (h < 168) {
            var d = Math.floor(h / 24);
            var rh = h % 24;
            label.textContent = d + ' day' + (d > 1 ? 's' : '') + (rh > 0 ? ' ' + rh + 'h' : '');
        } else if (h < 720) {
            var w = Math.floor(h / 168);
            var rd = Math.floor((h % 168) / 24);
            label.textContent = w + ' week' + (w > 1 ? 's' : '') + (rd > 0 ? ' ' + rd + 'd' : '');
        } else {
            var mo = Math.floor(h / 720);
            var rdm = Math.floor((h % 720) / 24);
            label.textContent = mo + ' month' + (mo > 1 ? 's' : '') + (rdm > 0 ? ' ' + rdm + 'd' : '');
        }
    };
    skipBtn.onclick = function() {
        LIFE.skipTime(parseInt(slider.value));
    };

    // close button
    var closeBtn = document.getElementById('timeSkipClose');
    closeBtn.onclick = function() { LIFE.ui.closeTimeSkip(); };

    document.getElementById('timeSkip').style.display = 'block';
};

LIFE.ui.closeTimeSkip = function() {
    LIFE.state.timeSkipOpen = false;
    document.getElementById('timeSkip').style.display = 'none';
    LIFE.lockCursor();
};

// ============================================================
// JAIL SCREEN
// ============================================================
LIFE.ui.showJailScreen = function(years, fine) {
    var el = LIFE.ui.$.jailScreen;
    if (!el) return;
    LIFE.ui.$.jailText.textContent = 'Sentenced to ' + years + ' year' + (years > 1 ? 's' : '') + ' in prison';
    var details = '';
    if (fine > 0) details += 'Fine: $' + fine.toLocaleString() + '\n';
    if (LIFE.state.kills > 0) details += 'Murder charges: ' + LIFE.state.kills + '\n';
    details += 'Criminal record: Permanent\n';
    details += 'Career: Lost';
    LIFE.ui.$.jailDetails.textContent = details;
    el.classList.add('active');
};

LIFE.ui.hideJailScreen = function() {
    var el = LIFE.ui.$.jailScreen;
    if (!el) return;
    el.classList.remove('active');
};

// ============================================================
// TIMERS
// ============================================================
LIFE.ui.updateTimers = function(dt) {
    if (LIFE.state.popupTimer > 0) {
        LIFE.state.popupTimer -= dt;
        if (LIFE.state.popupTimer <= 0) LIFE.ui.$.popup.classList.remove('show');
    }
    if (LIFE.state.stageTextTimer > 0) {
        LIFE.state.stageTextTimer -= dt;
        if (LIFE.state.stageTextTimer <= 0) LIFE.ui.$.stage.classList.remove('show');
    }
    if (LIFE.ui.repChangeTimer > 0) {
        LIFE.ui.repChangeTimer -= dt;
        if (LIFE.ui.repChangeTimer <= 0) LIFE.ui.$.repChange.classList.remove('show');
    }
};

LIFE.ui.updateAgeColor = function() {
    var pct = LIFE.state.age / LIFE.MAX_AGE;
    var color;
    if (pct < 0.25) color = '#81c784';
    else if (pct < 0.5) color = '#4fc3f7';
    else if (pct < 0.75) color = '#ffb74d';
    else color = '#e57373';
    LIFE.ui.$.ageBox.style.borderLeft = '4px solid ' + color;
};

LIFE.ui.openShop = function() {
    if (LIFE.dialogue.active || LIFE.state.shopOpen) return;
    LIFE.state.shopOpen = true;
    LIFE.unlockCursor();

    var items = LIFE.ui.$.shopItems;
    items.innerHTML = '';
    var age = LIFE.state.age;

    LIFE.SHOP_ITEMS.forEach(function(item, i) {
        if (item.minAge > age) return;
        var div = document.createElement('div');
        var price = item.cost;
        if (LIFE.state.stats.charisma > 50) price = Math.round(price * 0.9);
        if (LIFE.state.reputation < -30) price = Math.round(price * 1.2);
        var cantAfford = LIFE.state.money < price;
        div.className = 'shopItem' + (cantAfford ? ' cantAfford' : '');
        var tags = '';
        if (item.rep > 0) tags += '<span class="shopTag good">+Rep</span>';
        if (item.rep < 0) tags += '<span class="shopTag bad">-Rep</span>';
        div.innerHTML = '<span class="shopName">' + item.name + '</span>' +
            '<span class="shopTags">' + tags + '</span>' +
            '<span class="shopStat">+' + item.amount + ' ' + item.stat + '</span>' +
            '<span class="shopCost">$' + price + '</span>';
        div.onclick = function() {
            if (LIFE.economy.buyItem(i)) {
                LIFE.sounds.money();
                LIFE.ui.showPopup(item.name + ' purchased!', '#4caf50');
                LIFE.ui.openShop(); // refresh
            } else {
                LIFE.ui.showPopup("Can't afford!", '#ef5350');
            }
        };
        items.appendChild(div);
    });

    // property and investment links (if old enough)
    if (age >= 18) {
        var invDiv = document.createElement('div');
        invDiv.className = 'shopItem';
        invDiv.style.color = '#ffeb3b';
        invDiv.style.borderColor = 'rgba(255,235,59,0.3)';
        invDiv.innerHTML = '<span class="shopName">Investments</span><span class="shopStat">Grow your money</span>';
        invDiv.onclick = function() { LIFE.ui.closeShop(); setTimeout(function() { LIFE.ui.openInvestmentShop(); }, 50); };
        items.appendChild(invDiv);
    }
    if (age >= 20) {
        var propDiv = document.createElement('div');
        propDiv.className = 'shopItem';
        propDiv.style.color = '#4caf50';
        propDiv.style.borderColor = 'rgba(76,175,80,0.3)';
        propDiv.innerHTML = '<span class="shopName">Real Estate</span><span class="shopStat">Buy properties for rental income</span>';
        propDiv.onclick = function() { LIFE.ui.closeShop(); setTimeout(function() { LIFE.ui.openPropertyShop(); }, 50); };
        items.appendChild(propDiv);
    }

    var closeDiv = document.createElement('div');
    closeDiv.className = 'shopItem shopClose';
    closeDiv.textContent = '[ESC] Close Shop';
    closeDiv.onclick = function() { LIFE.ui.closeShop(); };
    items.appendChild(closeDiv);

    LIFE.ui.$.shopBox.style.display = 'block';
};

// ============================================================
// DEALER SHOP (contraband only)
// ============================================================
LIFE.ui.openDealerShop = function() {
    if (LIFE.dialogue.active || LIFE.state.shopOpen) return;
    LIFE.state.shopOpen = true;
    LIFE.unlockCursor();

    var items = LIFE.ui.$.shopItems;
    items.innerHTML = '';
    var age = LIFE.state.age;

    // dealer title
    var title = document.createElement('div');
    title.className = 'shopItem';
    title.style.textAlign = 'center';
    title.style.color = '#ff9800';
    title.style.borderColor = 'rgba(255,152,0,0.3)';
    title.textContent = '--- BLACK MARKET ---';
    items.appendChild(title);

    LIFE.DEALER_ITEMS.forEach(function(item, i) {
        if (item.minAge > age) return;
        var div = document.createElement('div');
        var price = item.cost;
        if (LIFE.state.stats.charisma > 50) price = Math.round(price * 0.9);
        var cantAfford = LIFE.state.money < price;
        div.className = 'shopItem shopContra' + (cantAfford ? ' cantAfford' : '');
        var tags = '<span class="shopTag bad">Contraband</span>';
        if (item.rep < 0) tags += '<span class="shopTag bad">-Rep</span>';
        if (item.healthCost) tags += '<span class="shopTag bad">-' + item.healthCost + ' HP</span>';
        if (item.moneyBonus) tags += '<span class="shopTag good">+$' + item.moneyBonus + '</span>';
        div.innerHTML = '<span class="shopName">' + item.name + '</span>' +
            '<span class="shopTags">' + tags + '</span>' +
            '<span class="shopStat">+' + item.amount + ' ' + item.stat + '</span>' +
            '<span class="shopCost">$' + price + '</span>';
        div.onclick = function() {
            if (LIFE.economy.buyDealerItem(i)) {
                LIFE.sounds.money();
                var msg = item.name + ' acquired!';
                if (item.type === 'gun') msg = 'Pistol acquired! Click to shoot.';
                if (item.type === 'switchblade') msg = 'Switchblade acquired! Punch damage increased.';
                if (item.type === 'drug') { msg = item.name + ' used!'; LIFE.sounds.drug(); }
                LIFE.ui.showPopup(msg, '#ff9800');
                LIFE.ui.openDealerShop(); // refresh
            } else {
                LIFE.ui.showPopup("Can't afford!", '#ef5350');
            }
        };
        items.appendChild(div);
    });

    var closeDiv = document.createElement('div');
    closeDiv.className = 'shopItem shopClose';
    closeDiv.textContent = '[ESC] Close';
    closeDiv.onclick = function() { LIFE.ui.closeShop(); };
    items.appendChild(closeDiv);

    LIFE.ui.$.shopBox.style.display = 'block';
};

LIFE.ui.closeShop = function() {
    LIFE.state.shopOpen = false;
    LIFE.ui.$.shopBox.style.display = 'none';
    LIFE.lockCursor();
};

// ============================================================
// PROPERTY SHOP
// ============================================================
LIFE.ui.openPropertyShop = function() {
    if (LIFE.dialogue.active || LIFE.state.shopOpen) return;
    LIFE.state.shopOpen = true;
    LIFE.unlockCursor();

    var items = LIFE.ui.$.shopItems;
    items.innerHTML = '';
    var age = LIFE.state.age;

    var title = document.createElement('div');
    title.className = 'shopItem';
    title.style.textAlign = 'center';
    title.style.color = '#4caf50';
    title.style.borderColor = 'rgba(76,175,80,0.3)';
    title.textContent = '--- REAL ESTATE ---';
    items.appendChild(title);

    // show owned properties
    if (LIFE.state.properties && LIFE.state.properties.length > 0) {
        var owned = document.createElement('div');
        owned.className = 'shopItem';
        owned.style.color = '#81c784';
        owned.style.fontSize = '12px';
        var totalRent = 0;
        LIFE.state.properties.forEach(function(p) { totalRent += p.rent; });
        owned.textContent = 'Owned: ' + LIFE.state.properties.length + ' | Rental Income: $' + totalRent.toLocaleString() + '/year';
        items.appendChild(owned);
    }

    LIFE.PROPERTIES.forEach(function(prop, i) {
        if (prop.minAge > age) return;
        var div = document.createElement('div');
        var cantAfford = LIFE.state.money < prop.cost;
        div.className = 'shopItem' + (cantAfford ? ' cantAfford' : '');
        div.innerHTML = '<span class="shopName">' + prop.name + '</span>' +
            '<span class="shopTags"><span class="shopTag good">$' + prop.rent + '/yr rent</span></span>' +
            '<span class="shopStat">+' + prop.hapBonus + ' happiness</span>' +
            '<span class="shopCost">$' + prop.cost.toLocaleString() + '</span>';
        div.onclick = function() {
            if (LIFE.economy.buyProperty(i)) {
                LIFE.sounds.money();
                LIFE.ui.showPopup(prop.name + ' purchased!', '#4caf50');
                LIFE.ui.openPropertyShop();
            } else {
                LIFE.ui.showPopup("Can't afford!", '#ef5350');
            }
        };
        items.appendChild(div);
    });

    var closeDiv = document.createElement('div');
    closeDiv.className = 'shopItem shopClose';
    closeDiv.textContent = '[ESC] Close';
    closeDiv.onclick = function() { LIFE.ui.closeShop(); };
    items.appendChild(closeDiv);

    LIFE.ui.$.shopBox.style.display = 'block';
};

// ============================================================
// INVESTMENT SHOP
// ============================================================
LIFE.ui.openInvestmentShop = function() {
    if (LIFE.dialogue.active || LIFE.state.shopOpen) return;
    LIFE.state.shopOpen = true;
    LIFE.unlockCursor();

    var items = LIFE.ui.$.shopItems;
    items.innerHTML = '';
    var age = LIFE.state.age;

    var title = document.createElement('div');
    title.className = 'shopItem';
    title.style.textAlign = 'center';
    title.style.color = '#ffeb3b';
    title.style.borderColor = 'rgba(255,235,59,0.3)';
    title.textContent = '--- INVESTMENTS ---';
    items.appendChild(title);

    // show portfolio
    if (LIFE.state.investments && LIFE.state.investments.length > 0) {
        var totalVal = 0;
        LIFE.state.investments.forEach(function(inv) { totalVal += inv.value; });
        var port = document.createElement('div');
        port.className = 'shopItem';
        port.style.color = '#ffeb3b';
        port.style.fontSize = '12px';
        port.textContent = 'Portfolio: $' + totalVal.toLocaleString() + ' (' + LIFE.state.investments.length + ' investments)';
        items.appendChild(port);
    }

    LIFE.INVESTMENTS.forEach(function(inv, i) {
        if (inv.minAge > age) return;
        var div = document.createElement('div');
        var cantAfford = LIFE.state.money < inv.cost;
        div.className = 'shopItem' + (cantAfford ? ' cantAfford' : '');
        var riskColor = inv.risk > 0.3 ? 'bad' : (inv.risk > 0.15 ? '' : 'good');
        var riskLabel = inv.risk > 0.3 ? 'High Risk' : (inv.risk > 0.15 ? 'Med Risk' : 'Low Risk');
        div.innerHTML = '<span class="shopName">' + inv.name + '</span>' +
            '<span class="shopTags"><span class="shopTag good">' + Math.round(inv.returnRate * 100) + '% return</span>' +
            '<span class="shopTag ' + riskColor + '">' + riskLabel + '</span></span>' +
            '<span class="shopCost">$' + inv.cost.toLocaleString() + '</span>';
        div.onclick = function() {
            if (LIFE.economy.buyInvestment(i)) {
                LIFE.sounds.money();
                LIFE.ui.showPopup(inv.name + ' invested!', '#ffeb3b');
                LIFE.ui.openInvestmentShop();
            } else {
                LIFE.ui.showPopup("Can't afford!", '#ef5350');
            }
        };
        items.appendChild(div);
    });

    var closeDiv = document.createElement('div');
    closeDiv.className = 'shopItem shopClose';
    closeDiv.textContent = '[ESC] Close';
    closeDiv.onclick = function() { LIFE.ui.closeShop(); };
    items.appendChild(closeDiv);

    LIFE.ui.$.shopBox.style.display = 'block';
};

