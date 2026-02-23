// ============================================================
// LIFE ENHANCEMENTS — Mini-Map, Screen Shake, Hit Flash,
//                     Low-Health Vignette, Ambient Particles,
//                     NPC Emotion Bubbles, Floating Numbers
// ============================================================
(function() {
'use strict';

// ============================================================
// NAMESPACE
// ============================================================
LIFE.enhance = {
    _clock: { last: performance.now() },
    _initialized: false
};

// ============================================================
// INITIALIZATION (called once game starts)
// ============================================================
LIFE.enhance.init = function() {
    if (LIFE.enhance._initialized) return;
    LIFE.enhance._initialized = true;

    LIFE.enhance.minimap.init();
    LIFE.enhance.shake.init();
    LIFE.enhance.vignette.init();
    LIFE.enhance.particles.init();
    LIFE.enhance.hitFlash.init();
    LIFE.enhance.emotions.init();

    // Patch LIFE.damagePlayer to trigger shake + vignette
    var _origDmgP = LIFE.damagePlayer;
    LIFE.damagePlayer = function(amount, source) {
        _origDmgP.apply(LIFE, arguments);
        LIFE.enhance.shake.add(Math.min(amount * 0.015, 0.3));
    };

    // Patch LIFE.damageNPC to trigger hit flash
    if (LIFE.damageNPC) {
        var _origDmgN = LIFE.damageNPC;
        LIFE.damageNPC = function(npc, amount, source) {
            _origDmgN.apply(LIFE, arguments);
            if (npc && npc.char) LIFE.enhance.hitFlash.trigger(npc);
            LIFE.enhance.shake.add(0.06);
        };
    }

    // Patch LIFE.ui.showPopup to also spawn a floating number
    var _origPopup = LIFE.ui.showPopup;
    LIFE.ui.showPopup = function(text, color) {
        _origPopup.apply(LIFE.ui, arguments);
        // Filter to show floating numbers only for stat changes and money
        if (text && (text.match(/^[+\-]\d/) || text.match(/^\$/))) {
            LIFE.enhance.floatNum(text, color);
        }
    };

    console.log('[LIFE.enhance] initialized');
};

// ============================================================
// MINI-MAP
// ============================================================
LIFE.enhance.minimap = {
    canvas: null,
    ctx: null,
    _timer: 0,
    _fps: 10,            // reduced from 20fps — canvas redraw is expensive
    _worldCX: 30, _worldCZ: 0,
    _worldExtent: 255,
    _zoneColors: {
        home:       '#2e7d32',
        school:     '#1565c0',
        highschool: '#6a1b9a',
        college:    '#00838f',
        city:       '#424242',
        retirement: '#2e7d32',
        dealership: '#4e342e',
        eventcenter:'#827717'
    }
};

LIFE.enhance.minimap.init = function() {
    var wrap = document.createElement('div');
    wrap.id = 'minimapWrap';

    var pulse = document.createElement('div');
    pulse.className = 'minimapPulse';
    wrap.appendChild(pulse);

    var canvas = document.createElement('canvas');
    canvas.id = 'minimapCanvas';
    canvas.width = 180; canvas.height = 180;
    wrap.appendChild(canvas);

    var lbl = document.createElement('div');
    lbl.id = 'minimapLabel';
    lbl.textContent = 'MAP';
    wrap.appendChild(lbl);

    document.getElementById('ui').appendChild(wrap);

    LIFE.enhance.minimap.canvas = canvas;
    LIFE.enhance.minimap.ctx = canvas.getContext('2d');
};

LIFE.enhance.minimap.worldToMap = function(wx, wz, cw, ch) {
    var mm = LIFE.enhance.minimap;
    var scale = (cw * 0.5) / mm._worldExtent;
    var mx = cw * 0.5 + (wx - mm._worldCX) * scale;
    var my = ch * 0.5 + (wz - mm._worldCZ) * scale;
    return { x: mx, y: my };
};

LIFE.enhance.minimap.update = function(dt) {
    var mm = LIFE.enhance.minimap;
    var state = LIFE.state;

    // Show only in open world
    var wrap = document.getElementById('minimapWrap');
    var showMap = state.gamePhase === 'playing' &&
                  LIFE.world && LIFE.world.built &&
                  !LIFE.world.insideInterior &&
                  state.currentStage !== 'womb' &&
                  state.currentStage !== 'death';
    if (wrap) wrap.style.display = showMap ? 'block' : 'none';
    if (!showMap) return;

    mm._timer -= dt;
    if (mm._timer > 0) return;
    mm._timer = 1 / mm._fps;

    var ctx = mm.ctx;
    var W = mm.canvas.width, H = mm.canvas.height;
    var R = W * 0.5;

    // ---- Background ----
    ctx.clearRect(0, 0, W, H);

    // Circular clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(R, R, R - 1, 0, Math.PI * 2);
    ctx.clip();

    // Background fill
    var bgGrad = ctx.createRadialGradient(R, R, 0, R, R, R);
    bgGrad.addColorStop(0, '#0a1020');
    bgGrad.addColorStop(1, '#050810');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // ---- Draw Zones ----
    var defs = LIFE.ZONE_DEFS;
    for (var name in defs) {
        var def = defs[name];
        var pos = mm.worldToMap(def.cx, def.cz, W, H);
        var scale = (W * 0.5) / mm._worldExtent;
        var r = def.radius * scale * 0.85;
        var col = mm._zoneColors[name] || '#333';

        // Zone fill
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
        ctx.fillStyle = col + '55'; // semi-transparent
        ctx.fill();

        // Zone border
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = col + 'aa';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Zone label
        if (r > 12) {
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.font = 'bold 8px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(name.toUpperCase(), pos.x, pos.y);
        }
    }

    // ---- Draw Roads (simple lines between zones) ----
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    var roadPairs = [
        ['home','city'], ['home','school'], ['city','retirement'],
        ['city','college'], ['school','highschool'], ['dealership','city']
    ];
    for (var ri = 0; ri < roadPairs.length; ri++) {
        var a = defs[roadPairs[ri][0]], b = defs[roadPairs[ri][1]];
        if (!a || !b) continue;
        var pa = mm.worldToMap(a.cx, a.cz, W, H);
        var pb = mm.worldToMap(b.cx, b.cz, W, H);
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
    }

    // ---- Draw NPCs ----
    var allNPCs = LIFE.getAllNPCs ? LIFE.getAllNPCs() : (LIFE.npcs || []);
    for (var ni = 0; ni < allNPCs.length; ni++) {
        var npc = allNPCs[ni];
        if (!npc.alive || !npc.char) continue;
        var np = mm.worldToMap(npc.char.group.position.x, npc.char.group.position.z, W, H);
        // Skip if out of bounds
        if (np.x < 2 || np.x > W-2 || np.y < 2 || np.y > H-2) continue;

        var npcDot = 2.5;
        var npcColor = '#90a4ae';
        if (npc.type === 'Police' || npc.isPolice) npcColor = '#42a5f5';
        else if (npc._hostile || npc._chasing) npcColor = '#ef5350';
        else if (npc.isFamily) npcColor = '#a5d6a7';
        else if (npc.gang) npcColor = '#ce93d8';

        ctx.beginPath();
        ctx.arc(np.x, np.y, npcDot, 0, Math.PI * 2);
        ctx.fillStyle = npcColor;
        ctx.fill();
    }

    // ---- Draw Player ----
    if (LIFE.player) {
        var pp = mm.worldToMap(
            LIFE.player.group.position.x,
            LIFE.player.group.position.z,
            W, H
        );
        var rot = state.playerRotY || 0;

        // Player shadow
        ctx.beginPath();
        ctx.arc(pp.x, pp.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fill();

        // Player dot
        ctx.beginPath();
        ctx.arc(pp.x, pp.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Direction arrow
        ctx.save();
        ctx.translate(pp.x, pp.y);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.moveTo(0, -9);
        ctx.lineTo(-4, -3);
        ctx.lineTo(4, -3);
        ctx.closePath();
        ctx.fillStyle = '#4fc3f7';
        ctx.fill();
        ctx.restore();

        // Wanted indicator
        if (state.wantedLevel > 0) {
            ctx.beginPath();
            ctx.arc(pp.x, pp.y, 5 + state.wantedLevel * 2, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255,23,68,0.6)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }

    ctx.restore(); // end circular clip

    // ---- North indicator ----
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('N', W * 0.5, 4);

    // ---- Compass tick marks ----
    var tickDirs = [0, Math.PI/2, Math.PI, Math.PI*3/2];
    for (var ti = 0; ti < tickDirs.length; ti++) {
        var tx = R + Math.sin(tickDirs[ti]) * (R - 4);
        var ty = R - Math.cos(tickDirs[ti]) * (R - 4);
        ctx.beginPath();
        ctx.arc(tx, ty, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(79,195,247,0.6)';
        ctx.fill();
    }
};

// ============================================================
// SCREEN SHAKE
// ============================================================
LIFE.enhance.shake = {
    power: 0,
    decay: 6,
    _origCameraUpdate: null
};

LIFE.enhance.shake.init = function() {
    // Patch LIFE.updateCamera to inject shake offset
    var _orig = LIFE.updateCamera;
    LIFE.updateCamera = function() {
        _orig.apply(LIFE, arguments);
        var s = LIFE.enhance.shake;
        if (s.power > 0.001) {
            var ox = (Math.random() - 0.5) * s.power * 0.6;
            var oy = (Math.random() - 0.5) * s.power * 0.4;
            var oz = (Math.random() - 0.5) * s.power * 0.6;
            LIFE.camera.position.x += ox;
            LIFE.camera.position.y += oy;
            LIFE.camera.position.z += oz;
        }
    };
};

LIFE.enhance.shake.add = function(amount) {
    LIFE.enhance.shake.power = Math.min(LIFE.enhance.shake.power + amount, 0.5);
};

LIFE.enhance.shake.update = function(dt) {
    var s = LIFE.enhance.shake;
    if (s.power > 0) {
        s.power = Math.max(0, s.power - s.decay * dt);
    }
};

// ============================================================
// LOW HEALTH VIGNETTE
// ============================================================
LIFE.enhance.vignette = {
    el: null,
    _pulseTimer: 0
};

LIFE.enhance.vignette.init = function() {
    var el = document.createElement('div');
    el.id = 'healthVignette';
    document.getElementById('ui').insertBefore(el, document.getElementById('ui').firstChild);
    LIFE.enhance.vignette.el = el;
};

LIFE.enhance.vignette.update = function(dt) {
    var el = LIFE.enhance.vignette.el;
    if (!el || !LIFE.state) return;
    var hp = LIFE.state.stats ? LIFE.state.stats.health : 100;
    var phase = LIFE.state.gamePhase;
    if (phase !== 'playing' || hp >= 35) {
        el.style.opacity = '0';
        return;
    }
    // Pulsing intensity based on how low health is
    LIFE.enhance.vignette._pulseTimer += dt * (2 + (35 - hp) * 0.06);
    var pulse = 0.5 + 0.5 * Math.sin(LIFE.enhance.vignette._pulseTimer * Math.PI);
    var baseFactor = (35 - hp) / 35; // 0-1 as hp drops from 35 to 0
    var opacity = baseFactor * (0.4 + pulse * 0.5);
    el.style.opacity = Math.min(opacity, 0.85).toString();
};

// ============================================================
// HIT FLASH ON NPCs
// ============================================================
LIFE.enhance.hitFlash = {
    _timers: [],
    _matCache: new Map() // npc -> [materials]
};

LIFE.enhance.hitFlash.init = function() {};

LIFE.enhance.hitFlash._getMaterials = function(npc) {
    var cache = LIFE.enhance.hitFlash._matCache;
    if (cache.has(npc)) return cache.get(npc);
    var mats = [];
    npc.char.group.traverse(function(obj) {
        if (obj.material && obj.material.emissive) mats.push(obj.material);
    });
    cache.set(npc, mats);
    return mats;
};

LIFE.enhance.hitFlash.trigger = function(npc) {
    if (!npc || !npc.char) return;
    for (var i = 0; i < LIFE.enhance.hitFlash._timers.length; i++) {
        if (LIFE.enhance.hitFlash._timers[i].npc === npc) {
            LIFE.enhance.hitFlash._timers[i].timer = 0.3;
            return;
        }
    }
    LIFE.enhance.hitFlash._timers.push({ npc: npc, timer: 0.3, duration: 0.3 });
};

LIFE.enhance.hitFlash._setEmissive = function(npc, hexColor, intensity) {
    var mats = LIFE.enhance.hitFlash._getMaterials(npc);
    for (var i = 0; i < mats.length; i++) {
        mats[i].emissive.setHex(hexColor);
        mats[i].emissiveIntensity = intensity;
    }
};

LIFE.enhance.hitFlash.update = function(dt) {
    var timers = LIFE.enhance.hitFlash._timers;
    for (var i = timers.length - 1; i >= 0; i--) {
        var entry = timers[i];
        entry.timer -= dt;
        if (entry.timer <= 0) {
            if (entry.npc && entry.npc.char) {
                LIFE.enhance.hitFlash._setEmissive(entry.npc, 0x000000, 0);
            }
            timers.splice(i, 1);
        } else {
            var t = entry.timer / entry.duration;
            var intensity = t * 0.8 * (0.5 + 0.5 * Math.sin(t * Math.PI * 6));
            if (entry.npc && entry.npc.char) {
                LIFE.enhance.hitFlash._setEmissive(entry.npc, 0xff2020, intensity);
            }
        }
    }
};

// ============================================================
// AMBIENT PARTICLES
// ============================================================
LIFE.enhance.particles = {
    system: null,
    _active: false,
    _count: 60,          // reduced from 120
    _positions: null,
    _velocities: null,
    _updateTimer: 0,
    _updateInterval: 0.05  // only update geometry 20x/sec max
};

LIFE.enhance.particles.init = function() {
    var p = LIFE.enhance.particles;
    p._positions  = new Float32Array(p._count * 3);
    p._velocities = new Float32Array(p._count * 3);
    p._resetAll();

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(p._positions, 3));

    var mat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.06,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    p.system = new THREE.Points(geo, mat);
    p.system.frustumCulled = false;
    // Don't add to scene yet - add when playing
};

LIFE.enhance.particles._resetAll = function() {
    var p = LIFE.enhance.particles;
    for (var i = 0; i < p._count; i++) {
        p._resetParticle(i);
    }
};

LIFE.enhance.particles._resetParticle = function(i) {
    var p = LIFE.enhance.particles;
    var px = LIFE.player ? LIFE.player.group.position.x : 0;
    var pz = LIFE.player ? LIFE.player.group.position.z : 0;
    var spread = 20;
    p._positions[i*3]   = px + (Math.random()-0.5) * spread * 2;
    p._positions[i*3+1] = Math.random() * 6;
    p._positions[i*3+2] = pz + (Math.random()-0.5) * spread * 2;
    p._velocities[i*3]   = (Math.random()-0.5) * 0.3;
    p._velocities[i*3+1] = 0.04 + Math.random() * 0.06;
    p._velocities[i*3+2] = (Math.random()-0.5) * 0.3;
};

LIFE.enhance.particles.update = function(dt) {
    var p = LIFE.enhance.particles;
    var state = LIFE.state;
    if (!p.system) return;

    var shouldShow = state.gamePhase === 'playing' &&
                     LIFE.world && LIFE.world.built &&
                     !LIFE.world.insideInterior;

    if (shouldShow && !p._active) {
        LIFE.scene.add(p.system);
        p._active = true;
    } else if (!shouldShow && p._active) {
        LIFE.scene.remove(p.system);
        p._active = false;
    }
    if (!p._active) return;

    // Throttle: only update positions at fixed interval
    p._updateTimer -= dt;
    if (p._updateTimer > 0) return;
    p._updateTimer = p._updateInterval;

    var px = LIFE.player ? LIFE.player.group.position.x : 0;
    var pz = LIFE.player ? LIFE.player.group.position.z : 0;
    var stepDt = p._updateInterval; // use fixed step, not variable dt

    for (var i = 0; i < p._count; i++) {
        p._positions[i*3]   += p._velocities[i*3]   * stepDt * 30;
        p._positions[i*3+1] += p._velocities[i*3+1] * stepDt * 30;
        p._positions[i*3+2] += p._velocities[i*3+2] * stepDt * 30;
        var dx = p._positions[i*3]   - px;
        var dz = p._positions[i*3+2] - pz;
        if (p._positions[i*3+1] > 7 || dx*dx + dz*dz > 1000) {
            p._resetParticle(i);
        }
    }
    // Only upload to GPU when we actually changed data
    p.system.geometry.attributes.position.needsUpdate = true;
};

// ============================================================
// NPC EMOTION BUBBLES
// ============================================================
LIFE.enhance.emotions = {
    _timer: 0,
    _interval: 6,
    _el: null
};

LIFE.enhance.emotions.init = function() {
    LIFE.enhance.emotions._el = document.getElementById('ui');
};

LIFE.enhance.emotions.update = function(dt) {
    var em = LIFE.enhance.emotions;
    var state = LIFE.state;
    if (state.gamePhase !== 'playing') return;
    em._timer -= dt;
    if (em._timer > 0) return;
    em._timer = em._interval + Math.random() * 8;

    // Pick a random nearby NPC and show an emotion
    var allNPCs = LIFE.getAllNPCs ? LIFE.getAllNPCs() : (LIFE.npcs || []);
    var candidates = [];
    if (!LIFE.player) return;
    var pp = LIFE.player.group.position;
    for (var ni = 0; ni < allNPCs.length; ni++) {
        var npc = allNPCs[ni];
        if (!npc.alive || !npc.char) continue;
        var dx = npc.char.group.position.x - pp.x;
        var dz = npc.char.group.position.z - pp.z;
        if (dx*dx + dz*dz < 100) candidates.push(npc);
    }
    if (candidates.length === 0) return;
    var target = candidates[Math.floor(Math.random() * candidates.length)];
    LIFE.enhance.emotions.showFor(target);
};

LIFE.enhance.emotions.showFor = function(npc) {
    if (!npc || !npc.char || !LIFE.player) return;
    var state = LIFE.state;

    // Decide emotion based on context
    var emote = '💬';
    var hap = state.stats ? state.stats.happiness : 50;
    var wanted = state.wantedLevel || 0;

    if (npc.isPolice || npc.type === 'Police') {
        emote = wanted > 2 ? '🚨' : '👮';
    } else if (npc._hostile || npc._chasing) {
        emote = Math.random() < 0.5 ? '😡' : '⚠️';
    } else if (hap > 70 && Math.random() < 0.4) {
        emote = ['😊','👋','😄','🙂'][Math.floor(Math.random()*4)];
    } else if (hap < 30) {
        emote = ['😟','😕','😶'][Math.floor(Math.random()*3)];
    } else {
        var pool = ['💬','👀','🤔','😊','👋','🙂','😐'];
        emote = pool[Math.floor(Math.random() * pool.length)];
    }

    // Project 3D position to 2D screen
    var pos3d = npc.char.group.position.clone();
    pos3d.y += npc.char.height || 1.5;
    pos3d.y += 0.5;
    var screenPos = LIFE.enhance.projectToScreen(pos3d);
    if (!screenPos) return;

    // Create DOM element
    var el = document.createElement('div');
    el.className = 'npcEmote';
    el.textContent = emote;
    el.style.left = screenPos.x + 'px';
    el.style.top  = screenPos.y + 'px';
    LIFE.enhance.emotions._el.appendChild(el);

    // Auto-remove after animation
    setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 2600);
};

// ============================================================
// FLOATING NUMBERS (stat changes / damage)
// ============================================================
LIFE.enhance.floatNum = function(text, color) {
    var el = document.getElementById('ui');
    if (!el) return;
    var div = document.createElement('div');
    div.className = 'floatNum';
    div.textContent = text;
    div.style.color = color || '#fff';
    // Position near center-top, with slight random offset
    var cx = window.innerWidth * 0.5 + (Math.random()-0.5)*80;
    var cy = window.innerHeight * 0.38 + (Math.random()-0.5)*40;
    div.style.left = cx + 'px';
    div.style.top  = cy + 'px';
    el.appendChild(div);
    setTimeout(function() { if (div.parentNode) div.parentNode.removeChild(div); }, 1500);
};

// ============================================================
// 3D → 2D SCREEN PROJECTION UTILITY
// ============================================================
LIFE.enhance.projectToScreen = function(pos3d) {
    if (!LIFE.camera || !LIFE.renderer) return null;
    var vector = pos3d.clone();
    vector.project(LIFE.camera);
    // Discard if behind camera or far off screen
    if (vector.z > 1) return null;
    if (Math.abs(vector.x) > 1.4 || Math.abs(vector.y) > 1.4) return null;
    var halfW = window.innerWidth  * 0.5;
    var halfH = window.innerHeight * 0.5;
    return {
        x: halfW + vector.x * halfW,
        y: halfH - vector.y * halfH
    };
};

// ============================================================
// STAR FIELD (visible at night in open world)
// ============================================================
LIFE.enhance.stars = {
    system: null,
    _active: false,
    _opacity: 0
};

LIFE.enhance.stars.init = function() {
    var count = 400;
    var positions = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
        var theta = Math.random() * Math.PI * 2;
        var phi   = Math.random() * Math.PI;
        var r = 350;
        positions[i*3]   = r * Math.sin(phi) * Math.cos(theta);
        positions[i*3+1] = Math.abs(r * Math.cos(phi)) + 30; // upper hemisphere
        positions[i*3+2] = r * Math.sin(phi) * Math.sin(theta);
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var mat = new THREE.PointsMaterial({
        color: 0xffffff, size: 0.8,
        transparent: true, opacity: 0, depthWrite: false
    });
    LIFE.enhance.stars.system = new THREE.Points(geo, mat);
    LIFE.enhance.stars.system.frustumCulled = false;
    LIFE.scene.add(LIFE.enhance.stars.system);
};

LIFE.enhance.stars.update = function(dt) {
    var s = LIFE.enhance.stars;
    if (!s.system || !LIFE.state) return;
    var state = LIFE.state;
    // Only show outdoors
    if (state.gamePhase !== 'playing' || !LIFE.world || !LIFE.world.built || LIFE.world.insideInterior) {
        s.system.material.opacity = 0;
        return;
    }
    // Get hour
    if (!LIFE.getSimDate) return;
    var sim = LIFE.getSimDate();
    var h = sim ? (sim.hour + (sim.minutes||0)/60) : 12;
    var targetOpacity = 0;
    if (h < 5 || h >= 21) {
        targetOpacity = 0.7;
    } else if (h < 6) {
        targetOpacity = 0.7 * (1 - (h-5));
    } else if (h >= 20) {
        targetOpacity = 0.7 * (h - 20);
    }
    // Lerp
    s.system.material.opacity += (targetOpacity - s.system.material.opacity) * Math.min(dt * 0.5, 1);
    // Slowly rotate for subtle twinkle effect
    s.system.rotation.y += dt * 0.002;
};

// ============================================================
// WEATHER HINT — subtle fog variation
// ============================================================
LIFE.enhance.weather = {
    _timer: 0,
    _fogTarget: null,
    _fogTimer: 0,
    _fogDuration: 0
};

LIFE.enhance.weather.update = function(dt) {
    var w = LIFE.enhance.weather;
    var state = LIFE.state;
    if (!LIFE.scene || !LIFE.scene.fog) return;
    if (state.gamePhase !== 'playing' || !LIFE.world || !LIFE.world.built) return;

    w._timer -= dt;
    if (w._timer < 0) {
        w._timer = 60 + Math.random() * 180;
        if (Math.random() < 0.25) {
            // Random fog event
            w._fogTarget = { near: 20 + Math.random()*20, far: 80 + Math.random()*60 };
            w._fogTimer  = 0;
            w._fogDuration = 30 + Math.random() * 90;
        }
    }
    if (w._fogTarget) {
        w._fogTimer += dt;
        var progress = Math.min(w._fogTimer / w._fogDuration, 1);
        // Ease in and out
        var t = progress < 0.5 ? 2*progress*progress : -1+(4-2*progress)*progress;
        // Blend fog toward target
        var fog = LIFE.scene.fog;
        if (fog.near !== undefined) {
            fog.near = fog.near + (w._fogTarget.near - fog.near) * dt * 0.3;
            fog.far  = fog.far  + (w._fogTarget.far  - fog.far)  * dt * 0.3;
        }
        if (progress >= 1) w._fogTarget = null;
    }
};

// ============================================================
// LIFE PROGRESS BAR (at very top of screen)
// ============================================================
LIFE.enhance.progressBar = {
    el: null,
    fill: null
};

LIFE.enhance.progressBar.init = function() {
    var bar = document.createElement('div');
    bar.id = 'lifeProgressBar';
    bar.style.cssText = [
        'position:absolute', 'top:0', 'left:0', 'width:100%', 'height:3px',
        'background:rgba(0,0,0,0.4)', 'z-index:60', 'pointer-events:none'
    ].join(';');

    var fill = document.createElement('div');
    fill.id = 'lifeProgressFill';
    fill.style.cssText = [
        'height:100%', 'width:0%',
        'background:linear-gradient(90deg, #4fc3f7, #69f0ae, #ffd54f, #ef5350)',
        'transition:width 0.8s ease',
        'box-shadow:0 0 8px rgba(79,195,247,0.5)'
    ].join(';');

    bar.appendChild(fill);
    document.getElementById('ui').insertBefore(bar, document.getElementById('ui').firstChild);
    LIFE.enhance.progressBar.fill = fill;
};

LIFE.enhance.progressBar.update = function() {
    var fill = LIFE.enhance.progressBar.fill;
    if (!fill || !LIFE.state) return;
    var age = LIFE.state.age || 0;
    if (age < 0) age = 0;
    var pct = Math.min((age / LIFE.MAX_AGE) * 100, 100);
    fill.style.width = pct + '%';
};

// ============================================================
// KILL FEED / EVENT LOG (brief messages top-right)
// ============================================================
LIFE.enhance.killFeed = {
    _container: null,
    _queue: []
};

LIFE.enhance.killFeed.init = function() {
    var c = document.createElement('div');
    c.id = 'killFeed';
    c.style.cssText = [
        'position:absolute', 'top:70px', 'right:20px',
        'display:flex', 'flex-direction:column', 'gap:4px',
        'pointer-events:none', 'z-index:55', 'align-items:flex-end'
    ].join(';');
    document.getElementById('ui').appendChild(c);
    LIFE.enhance.killFeed._container = c;
};

LIFE.enhance.killFeed.add = function(text, color) {
    var c = LIFE.enhance.killFeed._container;
    if (!c) return;
    var el = document.createElement('div');
    el.style.cssText = [
        'background:rgba(0,0,0,0.7)',
        'backdrop-filter:blur(8px)',
        'border:1px solid rgba(255,255,255,0.1)',
        'border-left:3px solid ' + (color||'#4fc3f7'),
        'padding:4px 12px',
        'border-radius:6px',
        'font-size:12px',
        'font-weight:600',
        'color:#fff',
        'opacity:0',
        'transition:opacity 0.25s',
        'white-space:nowrap'
    ].join(';');
    el.textContent = text;
    c.insertBefore(el, c.firstChild);
    // Fade in
    setTimeout(function() { el.style.opacity = '1'; }, 10);
    // Fade out and remove
    setTimeout(function() {
        el.style.opacity = '0';
        setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
    }, 4000);
    // Max 5 items
    while (c.children.length > 5) c.removeChild(c.lastChild);
};

// Patch game systems to add kill feed messages
LIFE.enhance._patchKillFeed = function() {
    // Patch news.add to also show in kill feed for important events
    var _origNewsAdd = LIFE.news.add;
    LIFE.news.add = function(text, type) {
        _origNewsAdd.apply(LIFE.news, arguments);
        if (type === 'crime' || type === 'career' || type === 'fame') {
            var colors = { crime: '#ef5350', career: '#66bb6a', fame: '#ff9800' };
            LIFE.enhance.killFeed.add(text, colors[type]);
        }
    };
};

// ============================================================
// AMBIENT SOUND HINTING (pulse icon near NPC when near)
// ============================================================
LIFE.enhance.proximityIcon = {
    _el: null,
    _timer: 0,
    _interval: 0.1   // only project to screen 10x/sec
};

LIFE.enhance.proximityIcon.init = function() {
    var el = document.createElement('div');
    el.id = 'proximityIcon';
    el.style.cssText = [
        'position:absolute', 'pointer-events:none', 'z-index:72',
        'font-size:16px', 'display:none', 'transform:translate(-50%,-100%)',
        'filter:drop-shadow(0 2px 6px rgba(0,0,0,0.8))'
    ].join(';');
    document.getElementById('ui').appendChild(el);
    LIFE.enhance.proximityIcon._el = el;
};

LIFE.enhance.proximityIcon.update = function(dt) {
    var ic = LIFE.enhance.proximityIcon;
    ic._timer -= dt;
    if (ic._timer > 0) return;
    ic._timer = ic._interval;

    var el = ic._el;
    if (!el || !LIFE.state || !LIFE.player) return;
    var npc = LIFE.state.nearestNPC;
    if (!npc || !npc.char) { el.style.display = 'none'; return; }

    var pos3d = npc.char.group.position.clone();
    pos3d.y += (npc.char.height || 1.5) + 0.6;
    var sp = LIFE.enhance.projectToScreen(pos3d);
    if (!sp) { el.style.display = 'none'; return; }

    el.style.left = sp.x + 'px';
    el.style.top  = sp.y + 'px';
    el.style.display = 'block';

    var icon = '💬';
    if (npc.type === 'Dealer') icon = '💊';
    else if (npc.type === 'Police') icon = '👮';
    else if (npc.type === 'Car Salesman') icon = '🚗';
    else if (npc.type === 'Doctor' || npc.type === 'Nurse') icon = '⚕️';
    else if (npc.isFamily) icon = '❤️';
    else if (npc.type === 'Boss') icon = '💼';
    else if (npc.type === 'Real Estate Agent') icon = '🏠';
    el.textContent = icon;
};

// ============================================================
// MASTER UPDATE LOOP
// ============================================================
LIFE.enhance.update = function(dt) {
    if (!LIFE.enhance._initialized) {
        if (LIFE.state && LIFE.state.gamePhase !== 'start') {
            LIFE.enhance.init();
        } else {
            return;
        }
    }
    LIFE.enhance.shake.update(dt);
    LIFE.enhance.vignette.update(dt);
    LIFE.enhance.hitFlash.update(dt);
    LIFE.enhance.particles.update(dt);
    LIFE.enhance.minimap.update(dt);
    LIFE.enhance.emotions.update(dt);
    LIFE.enhance.stars.update(dt);
    LIFE.enhance.weather.update(dt);
    LIFE.enhance.progressBar.update();
    LIFE.enhance.proximityIcon.update(dt);  // now receives dt for throttle
};

// ============================================================
// HOOK INTO MAIN GAME LOOP (non-intrusive wrapping)
// Reuses the game's own clock delta — no extra performance.now() call
// ============================================================
(function() {
    var _origAnimate = LIFE.animate;
    LIFE.animate = function() {
        _origAnimate.apply(LIFE, arguments);
        // LIFE.clock.getDelta() was already called inside _origAnimate,
        // so we read .elapsedTime delta via the clock's internal state.
        // Simplest: just use a fixed safe dt of the last known game dt.
        var dt = LIFE._enhanceDt || 0.016;
        LIFE.enhance.update(dt);
    };
    // Patch the game's own dt capture to share it
    var _origClock = LIFE.clock;
    var _origGetDelta = _origClock.getDelta.bind(_origClock);
    _origClock.getDelta = function() {
        var d = _origGetDelta();
        LIFE._enhanceDt = Math.min(d, 0.05);
        return d;
    };
})();

// ============================================================
// LATE INIT — called after all DOM + scripts are ready
// ============================================================
window.addEventListener('load', function() {
    // Initialize elements that need DOM
    LIFE.enhance.progressBar.init();
    LIFE.enhance.killFeed.init();
    LIFE.enhance.proximityIcon.init();
    // Stars need scene
    if (LIFE.scene) {
        LIFE.enhance.stars.init();
    }
    // Patch kill feed after news is ready
    setTimeout(function() {
        if (LIFE.news) LIFE.enhance._patchKillFeed();
    }, 100);
});

// Also patch startGame to call init after scene is ready
if (LIFE.startGame) {
    var _origStart = LIFE.startGame;
    LIFE.startGame = function() {
        _origStart.apply(LIFE, arguments);
        setTimeout(function() {
            if (LIFE.scene && !LIFE.enhance.stars.system) {
                LIFE.enhance.stars.init();
            }
        }, 200);
    };
}

})(); // end IIFE