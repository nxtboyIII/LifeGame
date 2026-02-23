// ============================================================
// SOUND EFFECTS (AI-Generated via ElevenLabs)
// Uses HTMLAudioElement for file:// compatibility
// ============================================================
LIFE.sounds = {
    ctx: null,
    master: null,
    footstepCooldown: 0,
    heartbeatTimer: 0,
    _audio: {},
    _masterVol: 0.35
};

// All sound effect file mappings
LIFE.sounds._files = {
    heartbeat: 'audio/heartbeat.mp3',
    cry: 'audio/cry.mp3',
    footstep: 'audio/footstep.mp3',
    punch: 'audio/punch.mp3',
    blip: 'audio/blip.mp3',
    money: 'audio/money.mp3',
    work: 'audio/work.mp3',
    select: 'audio/select.mp3',
    spend: 'audio/spend.mp3',
    wave: 'audio/wave.mp3',
    laugh: 'audio/laugh.mp3',
    play: 'audio/play.mp3',
    sit: 'audio/sit.mp3',
    dance: 'audio/dance.mp3',
    birth: 'audio/birth.mp3',
    death: 'audio/death.mp3',
    gunshot: 'audio/gunshot.mp3',
    bulletImpact: 'audio/bulletImpact.mp3',
    npcDeath: 'audio/npcDeath.mp3',
    drug: 'audio/drug.mp3',
    arrest: 'audio/arrest.mp3',
    siren: 'audio/siren.mp3'
};

LIFE.sounds.init = function() {
    // Preload all Audio elements
    var files = LIFE.sounds._files;
    for (var name in files) {
        var audio = new Audio(files[name]);
        audio.preload = 'auto';
        LIFE.sounds._audio[name] = audio;
    }
    // Keep AudioContext for listener position updates (used by game.js)
    try {
        LIFE.sounds.ctx = new (window.AudioContext || window.webkitAudioContext)();
        LIFE.sounds.master = LIFE.sounds.ctx.createGain();
        LIFE.sounds.master.gain.value = LIFE.sounds._masterVol;
        LIFE.sounds.master.connect(LIFE.sounds.ctx.destination);
    } catch(e) {}
};

LIFE.sounds.resume = function() {
    if (LIFE.sounds.ctx && LIFE.sounds.ctx.state === 'suspended') LIFE.sounds.ctx.resume();
};

// Play a sound by cloning the preloaded Audio element
LIFE.sounds._play = function(name, vol) {
    var src = LIFE.sounds._audio[name];
    if (!src) return null;
    var a = src.cloneNode();
    a.volume = (vol !== undefined ? vol : 1.0) * LIFE.sounds._masterVol;
    a.play().catch(function() {});
    return a;
};

// ============================================================
// INDIVIDUAL SOUND METHODS (same API as before)
// ============================================================

LIFE.sounds.heartbeat = function() {
    LIFE.sounds._play('heartbeat', 1.0);
};

LIFE.sounds.cry = function() {
    LIFE.sounds._play('cry', 0.7);
};

LIFE.sounds.footstep = function() {
    if (LIFE.sounds.footstepCooldown > 0) return;
    LIFE.sounds._play('footstep', 0.5);
    LIFE.sounds.footstepCooldown = 0.3;
};

LIFE.sounds.punch = function() {
    LIFE.sounds._play('punch', 0.9);
};

LIFE.sounds.money = function() {
    LIFE.sounds._play('money', 0.6);
};

LIFE.sounds.blip = function() {
    var c = LIFE.sounds.ctx; if (!c) return;
    var t = c.currentTime;
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(380 + Math.random() * 220, t);
    g.gain.setValueAtTime(0.06 * LIFE.sounds._masterVol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    o.connect(g); g.connect(LIFE.sounds.ctx.destination);
    o.start(t); o.stop(t + 0.04);
};

LIFE.sounds.talk = function() {
    var c = LIFE.sounds.ctx; if (!c) return;
    for (var i = 0; i < 5; i++) {
        var t = c.currentTime + i * 0.06;
        var o = c.createOscillator();
        var g = c.createGain();
        o.type = 'square';
        o.frequency.setValueAtTime(180 + Math.random() * 160, t);
        g.gain.setValueAtTime(0.05 * LIFE.sounds._masterVol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        o.connect(g); g.connect(LIFE.sounds.ctx.destination);
        o.start(t); o.stop(t + 0.05);
    }
};

LIFE.sounds.jump = function() {
    var c = LIFE.sounds.ctx; if (!c) return;
    var o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
    o.type = 'sine';
    o.frequency.setValueAtTime(180, t);
    o.frequency.exponentialRampToValueAtTime(550, t + 0.12);
    g.gain.setValueAtTime(0.12 * LIFE.sounds._masterVol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(g); g.connect(LIFE.sounds.ctx.destination);
    o.start(t); o.stop(t + 0.18);
};

LIFE.sounds.work = function() {
    LIFE.sounds._play('work', 0.5);
};

LIFE.sounds.dance = function() {
    LIFE.sounds._play('dance', 0.5);
};

LIFE.sounds.birth = function() {
    LIFE.sounds._play('birth', 0.8);
};

LIFE.sounds.death = function() {
    LIFE.sounds._play('death', 0.7);
};

LIFE.sounds.select = function() {
    LIFE.sounds._play('select', 0.5);
};

LIFE.sounds.spend = function() {
    LIFE.sounds._play('spend', 0.5);
};

LIFE.sounds.wave = function() {
    LIFE.sounds._play('wave', 0.4);
};

LIFE.sounds.laugh = function() {
    LIFE.sounds._play('laugh', 0.5);
};

LIFE.sounds.play = function() {
    LIFE.sounds._play('play', 0.4);
};

LIFE.sounds.sit = function() {
    LIFE.sounds._play('sit', 0.4);
};

LIFE.sounds.gunshot = function() {
    LIFE.sounds._play('gunshot', 0.9);
};

LIFE.sounds.bulletImpact = function() {
    LIFE.sounds._play('bulletImpact', 0.7);
};

LIFE.sounds.npcDeath = function() {
    LIFE.sounds._play('npcDeath', 0.6);
};

LIFE.sounds.drug = function() {
    LIFE.sounds._play('drug', 0.5);
};

LIFE.sounds.arrest = function() {
    LIFE.sounds._play('arrest', 0.7);
};

// ============================================================
// POLICE SIREN (looping with volume-based distance falloff)
// ============================================================
LIFE.sounds._sirenAudio = null;
LIFE.sounds._sirenPos = { x: 0, y: 0, z: 0 };
LIFE.sounds._listenerPos = { x: 0, y: 0, z: 0 };
// Keep legacy refs so callers don't crash
LIFE.sounds._sirenNode = null;
LIFE.sounds._sirenGain = null;
LIFE.sounds._sirenPanner = null;

LIFE.sounds.siren = function() {
    LIFE.sounds.startSiren();
};

LIFE.sounds.startSiren = function() {
    if (LIFE.sounds._sirenAudio) return; // already playing

    var a = LIFE.sounds._audio['siren'];
    if (!a) return;

    var siren = a.cloneNode();
    siren.loop = true;
    siren.volume = 0.6 * LIFE.sounds._masterVol;
    siren.play().catch(function() {});

    LIFE.sounds._sirenAudio = siren;
    LIFE.sounds._sirenNode = true; // truthy for legacy checks
};

LIFE.sounds.stopSiren = function() {
    if (!LIFE.sounds._sirenAudio) return;
    var siren = LIFE.sounds._sirenAudio;
    // Fade out over 300ms
    var vol = siren.volume;
    var steps = 10;
    var decrement = vol / steps;
    var i = 0;
    var fade = setInterval(function() {
        i++;
        siren.volume = Math.max(0, vol - decrement * i);
        if (i >= steps) {
            clearInterval(fade);
            siren.pause();
            siren.currentTime = 0;
        }
    }, 30);

    LIFE.sounds._sirenAudio = null;
    LIFE.sounds._sirenNode = null;
    LIFE.sounds._sirenGain = null;
    LIFE.sounds._sirenPanner = null;
};

LIFE.sounds.updateSirenPosition = function(x, y, z) {
    LIFE.sounds._sirenPos.x = x;
    LIFE.sounds._sirenPos.y = y;
    LIFE.sounds._sirenPos.z = z;
    LIFE.sounds._updateSirenVolume();
};

LIFE.sounds.updateListenerPosition = function(x, y, z, fx, fy, fz) {
    LIFE.sounds._listenerPos.x = x;
    LIFE.sounds._listenerPos.y = y;
    LIFE.sounds._listenerPos.z = z;
    LIFE.sounds._updateSirenVolume();

    // Also update Web Audio listener if context exists
    var c = LIFE.sounds.ctx; if (!c || !c.listener) return;
    if (c.listener.positionX) {
        c.listener.positionX.setValueAtTime(x, c.currentTime);
        c.listener.positionY.setValueAtTime(y, c.currentTime);
        c.listener.positionZ.setValueAtTime(z, c.currentTime);
        c.listener.forwardX.setValueAtTime(fx, c.currentTime);
        c.listener.forwardY.setValueAtTime(fy, c.currentTime);
        c.listener.forwardZ.setValueAtTime(fz, c.currentTime);
    } else if (c.listener.setPosition) {
        c.listener.setPosition(x, y, z);
        c.listener.setOrientation(fx, fy, fz, 0, 1, 0);
    }
};

// Distance-based volume for siren (simulates 3D falloff)
LIFE.sounds._updateSirenVolume = function() {
    if (!LIFE.sounds._sirenAudio) return;
    var sp = LIFE.sounds._sirenPos;
    var lp = LIFE.sounds._listenerPos;
    var dx = sp.x - lp.x;
    var dy = sp.y - lp.y;
    var dz = sp.z - lp.z;
    var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // Inverse distance falloff: refDist=5, maxDist=150, rolloff=1.5
    var refDist = 5;
    var maxDist = 150;
    dist = Math.max(refDist, Math.min(dist, maxDist));
    var vol = refDist / (refDist + 1.5 * (dist - refDist));
    LIFE.sounds._sirenAudio.volume = Math.max(0, Math.min(1, vol * 0.6 * LIFE.sounds._masterVol));

    // Simple stereo panning via left/right balance
    var fwd = { x: 0, z: -1 };
    var right = { x: 1, z: 0 };
    if (dist > 0.1) {
        var nx = dx / dist;
        var nz = dz / dist;
        // dot product with right vector gives pan (-1 to 1)
        // We approximate since we don't have full orientation here
    }
};

LIFE.sounds.updateCooldowns = function(dt) {
    if (LIFE.sounds.footstepCooldown > 0) LIFE.sounds.footstepCooldown -= dt;
};
