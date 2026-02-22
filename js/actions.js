// ============================================================
// ACTIONS SYSTEM
// ============================================================
LIFE.performAction = function(idx) {
    var state = LIFE.state;
    if (state.actionCooldown > 0) return;
    if (state.gamePhase !== 'playing' && state.gamePhase !== 'jail') return;
    if (LIFE.dialogue.active || state.shopOpen || state.friendsOpen) return;

    // in jail only allow punch (idx 0 = punch)
    if (state.gamePhase === 'jail') {
        if (idx !== 0) return;
        // force punch action
        LIFE.sounds.punch();
        LIFE.ui.showPopup('POW!', '#ef5350');
        state.actionCooldown = 0.8;
        state.actionAnim = { type: 'punch', timer: 0.6 };
        // hit nearby inmates/NPCs
        var allTargets = LIFE.npcs.concat(LIFE.police);
        allTargets.forEach(function(npc) {
            if (!npc.alive) return;
            var dx = npc.char.group.position.x - LIFE.player.group.position.x;
            var dz = npc.char.group.position.z - LIFE.player.group.position.z;
            var dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < 2.5) {
                var pushDir = new THREE.Vector3(dx, 0, dz).normalize();
                npc.char.group.position.x += pushDir.x * 1.5;
                npc.char.group.position.z += pushDir.z * 1.5;
                LIFE.damageNPC(npc, 20);
                npc.reacting = 1.5;
                // inmate fights back harder
                setTimeout(function() {
                    if (state.gamePhase === 'jail' && npc.alive) {
                        LIFE.damagePlayer(12, 'inmate fought back');
                        LIFE.sounds.punch();
                    }
                }, 500);
            }
        });
        return;
    }

    var acts = LIFE.getActionsForAge(state.age);
    if (idx >= acts.length) return;
    var actName = acts[idx];
    var def = LIFE.ACTION_DEFS[actName];

    if (actName === 'talk') {
        if (state.nearestNPC) { LIFE.dialogue.talkToNPC(state.nearestNPC); state.actionCooldown = 0.5; return; }
        LIFE.sounds.talk();
    } else if (actName === 'work') {
        // Try regular career work first
        var earned = LIFE.economy.doWork();
        if (earned > 0) {
            var career = LIFE.economy.getCareer();
            LIFE.ui.showPopup('+$' + earned + ' ' + (career ? career.workText : ''), '#4caf50');
            LIFE.sounds.work(); LIFE.sounds.money();
        } else {
            // No career / too young - try kid jobs
            var kidResult = LIFE.economy.doKidJob();
            if (kidResult && kidResult.earned > 0) {
                LIFE.ui.showPopup('+$' + kidResult.earned + ' ' + kidResult.job.text, '#4caf50');
                LIFE.sounds.work(); LIFE.sounds.money();
            } else {
                LIFE.ui.showPopup(state.age < 5 ? "You're too young!" : 'No job yet!', '#ef5350');
            }
        }
        state.actionCooldown = 2.0; state.actionAnim = { type: 'work', timer: 0.6 }; return;
    } else if (actName === 'shop') {
        LIFE.ui.openShop(); state.actionCooldown = 0.5; return;
    }

    if (LIFE.sounds[actName]) LIFE.sounds[actName]();
    LIFE.ui.showPopup(def.text, def.color);
    state.actionCooldown = 0.8;
    state.actionAnim = { type: actName, timer: 0.6 };

    // NPC reactions to actions
    var allTargets = LIFE.npcs.concat(LIFE.police);
    allTargets.forEach(function(npc) {
        if (!npc.alive) return;
        var dx = npc.char.group.position.x - LIFE.player.group.position.x;
        var dz = npc.char.group.position.z - LIFE.player.group.position.z;
        var dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 6) {
            npc.reacting = 1.5;
            if (actName === 'punch' && dist < 2.5) {
                var pushDir = new THREE.Vector3(dx, 0, dz).normalize();
                npc.char.group.position.x += pushDir.x * 2;
                npc.char.group.position.z += pushDir.z * 2;
                LIFE.sounds.punch();

                // damage based on equipment
                var equipped = LIFE.getEquipped();
                var dmg = 20;
                if (equipped === 'Switchblade') dmg = 40;
                LIFE.damageNPC(npc, dmg);

                // wanted level
                if (npc.isPolice) {
                    LIFE.addWanted(2);
                } else {
                    LIFE.addWanted(1);
                }

                // reputation
                var repLoss = -5;
                if (npc.type === 'Mom' || npc.type === 'Dad' || npc.type === 'Sibling' ||
                    npc.type === 'Spouse' || npc.type === 'Your Child' || npc.type === 'Old Friend') {
                    repLoss = -12;
                    state.stats.happiness = Math.max(0, state.stats.happiness - 3);
                }
                if (npc.type === 'Kid' || npc.type === 'Grandchild') repLoss = -15;
                state.reputation = Math.max(-100, state.reputation + repLoss);
                LIFE.ui.showRepChange(repLoss);
                LIFE.updateRelationship(npc.name, -20);

                if (Math.random() < 0.4) state.enemies++;

                // NPC FIGHTS BACK
                if (npc.alive && Math.random() < 0.5) {
                    var retalDmg = 5;
                    if (npc.type === 'Boss') retalDmg = 12;
                    else if (npc.type === 'Police') retalDmg = 15;
                    else if (npc.type === 'Kid' || npc.type === 'Grandchild') retalDmg = 2;
                    else if (npc.type === 'Stranger') retalDmg = 8;
                    else if (npc.type === 'Coworker') retalDmg = 7;
                    setTimeout(function() {
                        if (state.gamePhase === 'playing') {
                            LIFE.damagePlayer(retalDmg, npc.type + ' fought back');
                        }
                    }, 400);
                }

                // witnesses nearby add more wanted
                LIFE.checkWitnesses(npc);
            }
        }
    });
};

// ============================================================
// WITNESS SYSTEM
// ============================================================
LIFE.checkWitnesses = function(victim) {
    var player = LIFE.player;
    if (!player) return;
    var witnessCount = 0;
    LIFE.npcs.forEach(function(npc) {
        if (!npc.alive || npc === victim) return;
        var dx = npc.char.group.position.x - player.group.position.x;
        var dz = npc.char.group.position.z - player.group.position.z;
        var dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 12) {
            witnessCount++;
            npc.fleeing = true;
            npc.fleeTimer = 5 + Math.random() * 3;
        }
    });
    if (witnessCount > 0 && !victim.isPolice) {
        var extra = Math.min(2, Math.floor(witnessCount / 2));
        if (extra > 0) LIFE.addWanted(extra);
    }
};

// ============================================================
// BULLET PROJECTILE SYSTEM
// ============================================================
LIFE.bullets = [];
LIFE.impactEffects = [];

LIFE.createBullet = function(origin, direction, isPolice) {
    var geo = new THREE.SphereGeometry(0.04, 4, 4);
    var color = isPolice ? 0xff4444 : 0xffeb3b;
    var mat = new THREE.MeshBasicMaterial({ color: color });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(origin);
    LIFE.scene.add(mesh);

    // tracer trail
    var trailGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.6, 4);
    var trailMat = new THREE.MeshBasicMaterial({
        color: color, transparent: true, opacity: 0.5
    });
    var trail = new THREE.Mesh(trailGeo, trailMat);
    trail.position.copy(origin);
    // orient trail along direction
    var up = new THREE.Vector3(0, 1, 0);
    var horizDir = new THREE.Vector3(direction.x, 0, direction.z).normalize();
    var angle = Math.atan2(horizDir.x, horizDir.z);
    trail.rotation.set(0, 0, Math.PI / 2);
    trail.rotation.y = -angle;
    LIFE.scene.add(trail);

    var bullet = {
        mesh: mesh, trail: trail,
        direction: direction.clone(),
        speed: 55,
        life: 1.5,
        isPolice: isPolice,
        hit: false
    };
    LIFE.bullets.push(bullet);
    return bullet;
};

LIFE.createMuzzleFlash = function(position) {
    var light = new THREE.PointLight(0xffaa00, 3, 6);
    light.position.copy(position);
    LIFE.scene.add(light);

    var flashGeo = new THREE.SphereGeometry(0.1, 6, 6);
    var flashMat = new THREE.MeshBasicMaterial({ color: 0xffdd44 });
    var flash = new THREE.Mesh(flashGeo, flashMat);
    flash.position.copy(position);
    LIFE.scene.add(flash);

    setTimeout(function() {
        LIFE.scene.remove(light);
        LIFE.scene.remove(flash);
    }, 60);
};

LIFE.createImpactEffect = function(position) {
    for (var i = 0; i < 6; i++) {
        var geo = new THREE.SphereGeometry(0.03, 3, 3);
        var mat = new THREE.MeshBasicMaterial({ color: 0xff6644, transparent: true, opacity: 1 });
        var p = new THREE.Mesh(geo, mat);
        p.position.copy(position);
        var vel = new THREE.Vector3(
            (Math.random() - 0.5) * 5,
            Math.random() * 4,
            (Math.random() - 0.5) * 5
        );
        LIFE.scene.add(p);
        LIFE.impactEffects.push({ mesh: p, vel: vel, life: 0.4, maxLife: 0.4 });
    }
};

LIFE.updateBullets = function(dt) {
    // update bullets
    for (var i = LIFE.bullets.length - 1; i >= 0; i--) {
        var b = LIFE.bullets[i];
        b.life -= dt;
        if (b.life <= 0 || b.hit) {
            LIFE.scene.remove(b.mesh);
            LIFE.scene.remove(b.trail);
            LIFE.bullets.splice(i, 1);
            continue;
        }

        var move = b.speed * dt;
        b.mesh.position.x += b.direction.x * move;
        b.mesh.position.y += b.direction.y * move - 0.4 * dt; // slight gravity drop
        b.mesh.position.z += b.direction.z * move;

        // trail follows
        b.trail.position.copy(b.mesh.position);

        // out of bounds
        if (Math.abs(b.mesh.position.x) > 60 || Math.abs(b.mesh.position.z) > 60 || b.mesh.position.y < -1) {
            b.hit = true;
            continue;
        }

        if (b.isPolice) {
            // police bullet hits player
            if (LIFE.player) {
                var px = LIFE.player.group.position.x - b.mesh.position.x;
                var pz = LIFE.player.group.position.z - b.mesh.position.z;
                var pdist = Math.sqrt(px * px + pz * pz);
                var playerH = LIFE.getHeightForAge(LIFE.state.age);
                if (pdist < 0.6 && b.mesh.position.y < playerH + 0.3 && b.mesh.position.y > -0.3) {
                    b.hit = true;
                    LIFE.damagePlayer(8 + LIFE.state.wantedLevel * 2, 'Police');
                    LIFE.createImpactEffect(b.mesh.position);
                    LIFE.sounds.bulletImpact();
                }
            }
        } else {
            // player bullet hits NPCs
            var allTargets = LIFE.npcs.concat(LIFE.police);
            for (var j = 0; j < allTargets.length; j++) {
                var npc = allTargets[j];
                if (!npc.alive) continue;
                var nx = npc.char.group.position.x - b.mesh.position.x;
                var nz = npc.char.group.position.z - b.mesh.position.z;
                var ndist = Math.sqrt(nx * nx + nz * nz);
                var npcH = npc.char.height || 1.7;
                if (ndist < 0.5 && b.mesh.position.y < npcH + 0.3 && b.mesh.position.y > -0.3) {
                    b.hit = true;

                    // damage falloff with distance from origin
                    var dmg = 50;
                    var traveled = 1.5 - b.life; // time traveled
                    if (traveled > 0.5) dmg = Math.max(20, 50 - traveled * 20);
                    LIFE.damageNPC(npc, Math.floor(dmg));

                    LIFE.createImpactEffect(b.mesh.position);
                    LIFE.sounds.bulletImpact();
                    LIFE.ui.showPopup('Hit ' + npc.type + '! (-' + Math.floor(dmg) + ')', '#ff1744');

                    // rep/wanted
                    var repLoss = -15;
                    if (npc.isPolice) { LIFE.addWanted(3); repLoss = -8; }
                    else { LIFE.addWanted(2); }
                    LIFE.state.reputation = Math.max(-100, LIFE.state.reputation + repLoss);
                    LIFE.ui.showRepChange(repLoss);
                    LIFE.state.enemies++;
                    LIFE.updateRelationship(npc.name, -40);

                    // witnesses
                    LIFE.checkWitnesses(npc);
                    break;
                }
            }
        }
    }

    // update impact effects (sparks)
    for (var k = LIFE.impactEffects.length - 1; k >= 0; k--) {
        var e = LIFE.impactEffects[k];
        e.life -= dt;
        if (e.life <= 0) {
            LIFE.scene.remove(e.mesh);
            LIFE.impactEffects.splice(k, 1);
            continue;
        }
        e.mesh.position.x += e.vel.x * dt;
        e.mesh.position.y += e.vel.y * dt;
        e.mesh.position.z += e.vel.z * dt;
        e.vel.y -= 12 * dt; // gravity
        e.mesh.material.opacity = e.life / e.maxLife;
    }
};

// ============================================================
// SHOOTING
// ============================================================
LIFE.shootGun = function() {
    var state = LIFE.state;
    if (LIFE.getEquipped() !== 'Pistol' || state.shootCooldown > 0) return;
    state.shootCooldown = 0.4;
    state.actionCooldown = 0.4;
    state.actionAnim = { type: 'punch', timer: 0.3 };
    LIFE.sounds.gunshot();

    var player = LIFE.player;
    if (!player) return;

    var h = LIFE.getHeightForAge(state.age);
    var fwdX = Math.sin(state.playerRotY);
    var fwdZ = Math.cos(state.playerRotY);
    var rightX = Math.cos(state.playerRotY);
    var rightZ = -Math.sin(state.playerRotY);

    // bullet origin: near the character's right hand
    var origin = new THREE.Vector3(
        player.group.position.x + fwdX * 0.4 + rightX * 0.15,
        h * 0.7,
        player.group.position.z + fwdZ * 0.4 + rightZ * 0.15
    );

    var direction = new THREE.Vector3(fwdX, 0, fwdZ).normalize();

    // slight spread/inaccuracy
    direction.x += (Math.random() - 0.5) * 0.04;
    direction.z += (Math.random() - 0.5) * 0.04;
    direction.normalize();

    LIFE.createBullet(origin, direction, false);
    LIFE.createMuzzleFlash(origin);

    // firing gun always adds wanted (unless already high)
    if (state.wantedLevel < 1) {
        LIFE.addWanted(1);
    }
    state.reputation = Math.max(-100, state.reputation - 3);
};

// ============================================================
// ACTION ANIMATIONS
// ============================================================
LIFE.updateActionAnim = function(dt) {
    var state = LIFE.state, player = LIFE.player;
    if (!state.actionAnim.type || !player) return;
    state.actionAnim.timer -= dt;
    if (state.actionAnim.timer <= 0) {
        state.actionAnim.type = null;
        if (player.parts.rightArm) { player.parts.rightArm.rotation.x = 0; player.parts.rightArm.rotation.z = 0; }
        if (player.parts.leftArm) player.parts.leftArm.rotation.x = 0;
        return;
    }
    var t = state.actionAnim.timer;
    switch (state.actionAnim.type) {
        case 'punch': player.parts.rightArm.rotation.x = -Math.PI/2 * Math.sin(t*10); break;
        case 'wave': player.parts.rightArm.rotation.x = -Math.PI*0.7; player.parts.rightArm.rotation.z = Math.sin(t*15)*0.3; break;
        case 'dance': player.group.rotation.y += dt*8; player.parts.leftArm.rotation.x = Math.sin(t*12)*1.2; player.parts.rightArm.rotation.x = -Math.sin(t*12)*1.2; break;
        case 'cry': if (player.parts.head) player.parts.head.position.x = Math.sin(t*20)*0.03; break;
        case 'sit': player.parts.leftLeg.rotation.x = -Math.PI/2; player.parts.rightLeg.rotation.x = -Math.PI/2; player.group.position.y = -player.height*0.2; break;
        case 'work': player.parts.rightArm.rotation.x = Math.sin(t*16)*0.3; player.parts.leftArm.rotation.x = Math.sin(t*16+1)*0.3; break;
    }
};
