// ============================================================
// SOUND EFFECTS (Web Audio API)
// ============================================================
LIFE.sounds = {
    ctx: null,
    master: null,
    footstepCooldown: 0,
    heartbeatTimer: 0
};

LIFE.sounds.init = function() {
    try {
        LIFE.sounds.ctx = new (window.AudioContext || window.webkitAudioContext)();
        LIFE.sounds.master = LIFE.sounds.ctx.createGain();
        LIFE.sounds.master.gain.value = 0.35;
        LIFE.sounds.master.connect(LIFE.sounds.ctx.destination);
    } catch(e) { console.warn('No Web Audio'); }
};

LIFE.sounds.resume = function() {
    if (LIFE.sounds.ctx && LIFE.sounds.ctx.state === 'suspended') LIFE.sounds.ctx.resume();
};

LIFE.sounds._osc = function(freq, type, dur, vol, delay) {
    var c = LIFE.sounds.ctx; if (!c) return;
    var t = c.currentTime + (delay || 0);
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime((vol || 0.2), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(LIFE.sounds.master);
    o.start(t); o.stop(t + dur);
    return o;
};

LIFE.sounds._noise = function(dur, vol, delay) {
    var c = LIFE.sounds.ctx; if (!c) return;
    var t = c.currentTime + (delay || 0);
    var len = Math.ceil(c.sampleRate * dur);
    var buf = c.createBuffer(1, len, c.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    var s = c.createBufferSource(); s.buffer = buf;
    var g = c.createGain();
    g.gain.setValueAtTime((vol || 0.1), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(g); g.connect(LIFE.sounds.master);
    s.start(t);
};

LIFE.sounds.heartbeat = function() {
    LIFE.sounds._osc(55, 'sine', 0.15, 0.5);
    LIFE.sounds._osc(45, 'sine', 0.12, 0.35, 0.18);
};

LIFE.sounds.cry = function() {
    var c = LIFE.sounds.ctx; if (!c) return;
    var o = c.createOscillator(), g = c.createGain();
    o.type = 'sawtooth';
    var t = c.currentTime;
    o.frequency.setValueAtTime(700, t);
    o.frequency.linearRampToValueAtTime(1100, t + 0.15);
    o.frequency.linearRampToValueAtTime(500, t + 0.4);
    o.frequency.linearRampToValueAtTime(900, t + 0.6);
    o.frequency.linearRampToValueAtTime(400, t + 0.8);
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.85);
    o.connect(g); g.connect(LIFE.sounds.master);
    o.start(t); o.stop(t + 0.85);
};

LIFE.sounds.footstep = function() {
    if (LIFE.sounds.footstepCooldown > 0) return;
    LIFE.sounds._noise(0.04, 0.12);
    LIFE.sounds._osc(80 + Math.random() * 40, 'sine', 0.04, 0.06);
    LIFE.sounds.footstepCooldown = 0.3;
};

LIFE.sounds.punch = function() {
    LIFE.sounds._noise(0.07, 0.35);
    LIFE.sounds._osc(80, 'sine', 0.12, 0.3);
    LIFE.sounds._osc(60, 'triangle', 0.08, 0.2, 0.03);
};

LIFE.sounds.money = function() {
    LIFE.sounds._osc(880, 'sine', 0.08, 0.15);
    LIFE.sounds._osc(1320, 'sine', 0.12, 0.15, 0.08);
};

LIFE.sounds.blip = function() {
    LIFE.sounds._osc(380 + Math.random() * 220, 'square', 0.04, 0.06);
};

LIFE.sounds.talk = function() {
    for (var i = 0; i < 5; i++) {
        LIFE.sounds._osc(180 + Math.random() * 160, 'square', 0.05, 0.05, i * 0.06);
    }
};

LIFE.sounds.jump = function() {
    var c = LIFE.sounds.ctx; if (!c) return;
    var o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
    o.type = 'sine';
    o.frequency.setValueAtTime(180, t);
    o.frequency.exponentialRampToValueAtTime(550, t + 0.12);
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(g); g.connect(LIFE.sounds.master);
    o.start(t); o.stop(t + 0.18);
};

LIFE.sounds.work = function() {
    for (var i = 0; i < 4; i++) LIFE.sounds._noise(0.025, 0.06, i * 0.07);
};

LIFE.sounds.dance = function() {
    var n = [523, 659, 784, 880];
    for (var i = 0; i < n.length; i++) LIFE.sounds._osc(n[i], 'triangle', 0.1, 0.1, i * 0.12);
};

LIFE.sounds.birth = function() {
    LIFE.sounds._osc(300, 'sine', 0.6, 0.25);
    setTimeout(function() { LIFE.sounds.cry(); }, 600);
};

LIFE.sounds.death = function() {
    var c = LIFE.sounds.ctx; if (!c) return;
    var o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
    o.type = 'sine';
    o.frequency.setValueAtTime(350, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 4);
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 4);
    o.connect(g); g.connect(LIFE.sounds.master);
    o.start(t); o.stop(t + 4);
};

LIFE.sounds.select = function() {
    LIFE.sounds._osc(600, 'sine', 0.06, 0.1);
    LIFE.sounds._osc(900, 'sine', 0.08, 0.1, 0.06);
};

LIFE.sounds.spend = function() {
    LIFE.sounds._osc(500, 'sine', 0.08, 0.1);
    LIFE.sounds._osc(350, 'sine', 0.1, 0.1, 0.08);
};

LIFE.sounds.wave = function() {
    LIFE.sounds._osc(440, 'triangle', 0.15, 0.08);
};

LIFE.sounds.laugh = function() {
    for (var i = 0; i < 4; i++) {
        LIFE.sounds._osc(350 + (i % 2) * 120, 'triangle', 0.08, 0.08, i * 0.1);
    }
};

LIFE.sounds.play = function() {
    LIFE.sounds._osc(523, 'square', 0.08, 0.07);
    LIFE.sounds._osc(659, 'square', 0.08, 0.07, 0.1);
};

LIFE.sounds.sit = function() {
    LIFE.sounds._noise(0.15, 0.06);
};

LIFE.sounds.gunshot = function() {
    LIFE.sounds._noise(0.15, 0.6);
    LIFE.sounds._osc(150, 'sawtooth', 0.08, 0.4);
    LIFE.sounds._osc(80, 'square', 0.2, 0.3, 0.02);
};

LIFE.sounds.npcDeath = function() {
    LIFE.sounds._osc(300, 'sine', 0.3, 0.2);
    LIFE.sounds._osc(200, 'sine', 0.3, 0.15, 0.1);
    LIFE.sounds._osc(100, 'sine', 0.5, 0.1, 0.2);
};

LIFE.sounds.drug = function() {
    LIFE.sounds._osc(200, 'sine', 0.15, 0.1);
    LIFE.sounds._osc(400, 'sine', 0.1, 0.15, 0.1);
    LIFE.sounds._osc(800, 'sine', 0.08, 0.1, 0.2);
};

// 3D positional police siren system
LIFE.sounds._sirenNode = null;
LIFE.sounds._sirenGain = null;
LIFE.sounds._sirenPanner = null;

LIFE.sounds.siren = function() {
    // Legacy call - start siren if not already running
    LIFE.sounds.startSiren();
};

LIFE.sounds.startSiren = function() {
    var c = LIFE.sounds.ctx; if (!c) return;
    if (LIFE.sounds._sirenNode) return; // already playing

    var t = c.currentTime;

    // Create two oscillators for a realistic wail (fundamental + overtone)
    var o1 = c.createOscillator();
    var o2 = c.createOscillator();
    o1.type = 'sawtooth';
    o2.type = 'sine';

    // LFO to modulate frequency for the wail sweep (hi-lo-hi pattern)
    var lfo = c.createOscillator();
    var lfoGain = c.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.7, t); // 0.7 Hz = wail cycle ~1.4s
    lfoGain.gain.setValueAtTime(200, t); // sweep range ±200 Hz
    lfo.connect(lfoGain);

    // Base frequencies
    o1.frequency.setValueAtTime(700, t);
    o2.frequency.setValueAtTime(1400, t); // octave above
    lfoGain.connect(o1.frequency);
    lfoGain.connect(o2.frequency);

    // Mix and gain
    var g = c.createGain();
    g.gain.setValueAtTime(0.15, t);
    var g2 = c.createGain();
    g2.gain.setValueAtTime(0.06, t); // quieter overtone

    // 3D panner for spatial positioning
    var panner = c.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 5;
    panner.maxDistance = 150;
    panner.rolloffFactor = 1.5;
    panner.setPosition(0, 0, 0);

    o1.connect(g);
    o2.connect(g2);
    g.connect(panner);
    g2.connect(panner);
    panner.connect(LIFE.sounds.master);

    o1.start(t);
    o2.start(t);
    lfo.start(t);

    LIFE.sounds._sirenNode = { o1: o1, o2: o2, lfo: lfo };
    LIFE.sounds._sirenGain = g;
    LIFE.sounds._sirenPanner = panner;
};

LIFE.sounds.stopSiren = function() {
    if (!LIFE.sounds._sirenNode) return;
    var c = LIFE.sounds.ctx; if (!c) return;
    var t = c.currentTime;
    // Fade out
    if (LIFE.sounds._sirenGain) {
        LIFE.sounds._sirenGain.gain.linearRampToValueAtTime(0, t + 0.3);
    }
    var node = LIFE.sounds._sirenNode;
    setTimeout(function() {
        try { node.o1.stop(); } catch(e) {}
        try { node.o2.stop(); } catch(e) {}
        try { node.lfo.stop(); } catch(e) {}
    }, 400);
    LIFE.sounds._sirenNode = null;
    LIFE.sounds._sirenGain = null;
    LIFE.sounds._sirenPanner = null;
};

LIFE.sounds.updateSirenPosition = function(x, y, z) {
    if (!LIFE.sounds._sirenPanner) return;
    LIFE.sounds._sirenPanner.setPosition(x, y, z);
};

LIFE.sounds.updateListenerPosition = function(x, y, z, fx, fy, fz) {
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

LIFE.sounds.arrest = function() {
    LIFE.sounds._osc(300, 'square', 0.15, 0.15);
    LIFE.sounds._osc(200, 'square', 0.15, 0.15, 0.15);
    LIFE.sounds._osc(150, 'square', 0.3, 0.2, 0.3);
};

LIFE.sounds.bulletImpact = function() {
    LIFE.sounds._noise(0.06, 0.25);
    LIFE.sounds._osc(120, 'sine', 0.06, 0.2);
    LIFE.sounds._osc(200, 'triangle', 0.04, 0.15, 0.02);
};

LIFE.sounds.updateCooldowns = function(dt) {
    if (LIFE.sounds.footstepCooldown > 0) LIFE.sounds.footstepCooldown -= dt;
};
