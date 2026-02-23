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
        var jailDmg = LIFE.getPunchDamage(state.age);
        var jailEquip = LIFE.getEquipped();
        if (jailEquip === 'Switchblade') jailDmg = Math.floor(jailDmg * 2);
        LIFE.sounds.punch();
        LIFE.ui.showPopup(jailDmg > 0 ? 'POW! (-' + jailDmg + ')' : '*flails weakly*', jailDmg > 0 ? '#ef5350' : '#999');
        state.actionCooldown = 0.8;
        state.actionAnim = { type: 'punch', timer: 0.6 };
        var allTargets = LIFE.getAllNPCs();
        allTargets.forEach(function(npc) {
            if (!npc.alive) return;
            var dx = npc.char.group.position.x - LIFE.player.group.position.x;
            var dz = npc.char.group.position.z - LIFE.player.group.position.z;
            var dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < 2.5) {
                if (jailDmg > 0) LIFE.damageNPC(npc, jailDmg);
                npc.reacting = 1.5;
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
        // Block working while in classroom
        if (LIFE.world.built && LIFE.world.insideInterior && (LIFE.world.insideInterior === 'classroom' || LIFE.world.insideInterior === 'hsclassroom')) {
            LIFE.ui.showPopup("You're in class! Pay attention!", '#ff9800');
            state.actionCooldown = 1.0; return;
        }
        if (!LIFE.world.built && state.dayPhase === 'classroom') {
            LIFE.ui.showPopup("You're in class! Pay attention!", '#ff9800');
            state.actionCooldown = 1.0; return;
        }
        // Check if player has a career
        var career = LIFE.economy.getCareer();
        var hasCareer = career && career.income > 0 && state.age >= 14 && state.age <= 64;

        if (hasCareer && LIFE.world.built) {
            // Must be at or near their workplace
            var atWorkplace = false;
            var insideWorkplace = false;

            // Check if inside workplace interior matching their career
            if (LIFE.world.insideInterior === 'workplace' && LIFE.world._currentBuildingCareer === state.career) {
                atWorkplace = true;
                insideWorkplace = true;
            }

            // Check if near their career building in the open world
            if (!atWorkplace && LIFE.player && LIFE.JOB_BUILDINGS) {
                var cityDef = LIFE.ZONE_DEFS.city;
                var px = LIFE.player.group.position.x;
                var pz = LIFE.player.group.position.z;
                for (var ji = 0; ji < LIFE.JOB_BUILDINGS.length; ji++) {
                    var jb = LIFE.JOB_BUILDINGS[ji];
                    if (jb.career === state.career) {
                        var jx = jb.x + cityDef.cx;
                        var jz = jb.z + cityDef.cz;
                        var jdist = Math.sqrt((px - jx) * (px - jx) + (pz - jz) * (pz - jz));
                        if (jdist < 12) { atWorkplace = true; break; }
                    }
                }
            }

            if (!atWorkplace) {
                var buildingLabel = '';
                for (var jk = 0; jk < LIFE.JOB_BUILDINGS.length; jk++) {
                    if (LIFE.JOB_BUILDINGS[jk].career === state.career) { buildingLabel = LIFE.JOB_BUILDINGS[jk].label; break; }
                }
                LIFE.ui.showPopup('Go to the ' + buildingLabel + ' to work!', '#ff9800');
                state.actionCooldown = 1.0; return;
            }

            var earned = LIFE.economy.doWork();
            if (earned > 0) {
                // Bonus for being inside the workplace building
                if (insideWorkplace) {
                    var bonus = Math.floor(earned * 0.5);
                    earned += bonus;
                    state.money += bonus;
                    LIFE.ui.showPopup('+$' + earned + ' ' + career.workText + ' (on-site bonus!)', '#4caf50');
                } else {
                    LIFE.ui.showPopup('+$' + earned + ' ' + career.workText, '#4caf50');
                }
                LIFE.sounds.work(); LIFE.sounds.money();
            }
        } else if (hasCareer) {
            // Non-world mode (legacy) - work anywhere
            var earned2 = LIFE.economy.doWork();
            if (earned2 > 0) {
                LIFE.ui.showPopup('+$' + earned2 + ' ' + (career ? career.workText : ''), '#4caf50');
                LIFE.sounds.work(); LIFE.sounds.money();
            }
        } else {
            // Kid jobs work anywhere
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
    var allTargets = LIFE.getAllNPCs();
    allTargets.forEach(function(npc) {
        if (!npc.alive) return;
        var dx = npc.char.group.position.x - LIFE.player.group.position.x;
        var dz = npc.char.group.position.z - LIFE.player.group.position.z;
        var dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 6) {
            npc.reacting = 1.5;
            if (actName === 'punch' && dist < 2.5) {
                LIFE.sounds.punch();

                // damage: weapons have flat damage, only fists scale with age
                var equipped = LIFE.getEquipped();
                var eqData = LIFE.ITEM_DATA[equipped];
                var dmg;
                if (eqData && eqData.damage) {
                    dmg = eqData.damage; // flat weapon damage
                } else {
                    dmg = LIFE.getPunchDamage(state.age); // fists scale with age
                }

                if (dmg <= 0) {
                    LIFE.ui.showPopup('*flails weakly*', '#999');
                } else {
                    LIFE.damageNPC(npc, dmg);
                }

                // family member detection
                var isFamily = (npc.type === 'Mom' || npc.type === 'Dad' || npc.type === 'Sibling' ||
                    npc.type === 'Spouse' || npc.type === 'Your Child');
                var isVulnerable = (npc.type === 'Kid' || npc.type === 'Grandchild');

                // Check for witnesses FIRST (line-of-sight aware)
                var witnessResult = LIFE.checkWitnesses(npc);
                var witnessed = witnessResult.witnessed;

                // wanted level - only if witnessed OR attacking police
                var isChild = state.age < 13;
                var hasWeapon = equipped === 'Switchblade' || equipped === 'Baseball Bat' || equipped === 'Crowbar';
                if (npc.isPolice) {
                    // Police ALWAYS know — they are the witness
                    LIFE.logCrime('Assaulting a police officer');
                    LIFE.addWanted(2, 'Attacked police', npc.name);
                } else if (witnessed) {
                    // Someone saw it — police get called
                    var witnessName = witnessResult.callerName;
                    if (isFamily) {
                        LIFE.logCrime('Domestic violence');
                        LIFE.addWanted(isChild && !hasWeapon ? 1 : 2, 'Assault (domestic)', witnessName);
                    } else if (isVulnerable) {
                        LIFE.logCrime('Assault on a minor');
                        LIFE.addWanted(isChild && !hasWeapon ? 0 : 2, 'Assault on minor', witnessName);
                    } else {
                        LIFE.logCrime('Assault');
                        LIFE.addWanted(isChild && !hasWeapon ? 0 : 1, 'Assault', witnessName);
                    }
                }
                // Always log the crime type even if unwitnessed
                if (!npc.isPolice && !witnessed) {
                    if (isFamily) LIFE.logCrime('Domestic violence');
                    else if (isVulnerable) LIFE.logCrime('Assault on a minor');
                    else LIFE.logCrime('Assault');
                }

                // reputation - babies/toddlers can't really hurt anyone
                var repLoss = -5;
                if (state.age < 5 && !hasWeapon) {
                    repLoss = 0;
                } else if (isChild && !hasWeapon) {
                    repLoss = -1;
                    if (isFamily) {
                        repLoss = -2;
                        state.stats.happiness = Math.max(0, state.stats.happiness - 1);
                    } else if (isVulnerable) {
                        repLoss = -1;
                    }
                } else {
                    if (isFamily) {
                        repLoss = -20;
                        state.stats.happiness = Math.max(0, state.stats.happiness - 8);
                        state.stats.charisma = Math.max(0, state.stats.charisma - 2);
                        if (!state.familyAbuser) state.familyAbuser = true;
                    }
                    if (isVulnerable) {
                        repLoss = -25;
                        state.stats.happiness = Math.max(0, state.stats.happiness - 5);
                    }
                }
                // Rep loss reduced if nobody saw it (but still some guilt)
                if (!witnessed && !npc.isPolice) repLoss = Math.ceil(repLoss * 0.3);
                state.reputation = Math.max(-100, state.reputation + repLoss);
                if (repLoss !== 0) LIFE.ui.showRepChange(repLoss);
                LIFE.updateRelationship(npc.name, -25);

                if (Math.random() < 0.4) state.enemies++;

                // NPC FIGHTS BACK or FLEES FOR HELP
                var fightBackChance = isFamily ? 0.2 : 0.6;
                if (npc.type === 'Inmate') fightBackChance = 0.85;
                if (npc.type === 'Dealer') fightBackChance = 0.7;
                var prevRel = LIFE.state.relationships[npc.name];
                if (prevRel && prevRel.level <= -30) fightBackChance = Math.min(0.9, fightBackChance + 0.3);
                if (npc.alive && Math.random() < fightBackChance) {
                    // NPC fights back
                    var retalDmg = 5;
                    if (npc.type === 'Boss') retalDmg = 12;
                    else if (npc.type === 'Police') retalDmg = 15;
                    else if (npc.type === 'Inmate') retalDmg = 14;
                    else if (npc.type === 'Dealer') retalDmg = 10;
                    else if (isVulnerable) retalDmg = 1;
                    else if (npc.type === 'Stranger') retalDmg = 8;
                    else if (npc.type === 'Student') retalDmg = 6;
                    else if (npc.type === 'Coworker') retalDmg = 7;
                    else if (npc.type === 'Mom' || npc.type === 'Dad') retalDmg = 6;
                    else if (npc.type === 'Spouse') retalDmg = 7;
                    else if (npc.type === 'Old Friend') retalDmg = 6;
                    else if (npc.type === 'Neighbor') retalDmg = 7;
                    if (prevRel && prevRel.level <= -50) retalDmg = Math.floor(retalDmg * 1.5);
                    setTimeout(function() {
                        if (state.gamePhase === 'playing' && npc.alive) {
                            LIFE.damagePlayer(retalDmg, npc.name + ' fought back');
                        }
                    }, 400);
                } else if (npc.alive && !npc.isPolice && !witnessed) {
                    // NPC didn't fight back and nobody saw — they flee to seek help
                    LIFE.makeVictimSeekHelp(npc);
                    if (!isVulnerable) {
                        LIFE.ui.showPopup(npc.name + ' is running for help!', '#ff9800');
                    } else {
                        LIFE.ui.showPopup(npc.name + ' is crying and running away!', '#ff9800');
                    }
                } else if (npc.alive && !npc.isPolice) {
                    // Someone saw it already, NPC just flees
                    npc.fleeing = true;
                    npc.fleeTimer = 5 + Math.random() * 3;
                }
            }
        }
    });
};

// ============================================================
// WITNESS SYSTEM (line-of-sight aware)
// ============================================================

// Check if a straight line from (ax,az) to (bx,bz) is blocked by any collider
LIFE.hasLineOfSight = function(ax, az, bx, bz) {
    var colliders = (LIFE.world.built && !LIFE.world.insideInterior)
        ? LIFE.world.getActiveColliders()
        : LIFE.colliders;
    var dx = bx - ax, dz = bz - az;
    var len = Math.sqrt(dx * dx + dz * dz);
    if (len < 0.5) return true; // too close to matter
    // Step along line checking for collider intersection
    var steps = Math.ceil(len / 0.8); // check every 0.8 units
    var sx = dx / steps, sz = dz / steps;
    for (var s = 1; s < steps; s++) {
        var px = ax + sx * s, pz = az + sz * s;
        for (var c = 0; c < colliders.length; c++) {
            var col = colliders[c];
            if (px >= col.minX && px <= col.maxX && pz >= col.minZ && pz <= col.maxZ) {
                return false; // blocked by wall/building
            }
        }
    }
    return true;
};

// Returns the number of NPCs who can see the crime (with line-of-sight check)
// Also makes witnesses flee and tracks relationships
// Returns { count, witnessed } where witnessed = true if anyone saw it
LIFE.checkWitnesses = function(victim) {
    var player = LIFE.player;
    if (!player) return { count: 0, witnessed: false };
    var px = player.group.position.x, pz = player.group.position.z;
    var witnessCount = 0;
    var phoneCaller = null; // first civilian witness will call police
    var allNPCs = LIFE.getAllNPCs();
    for (var i = 0; i < allNPCs.length; i++) {
        var npc = allNPCs[i];
        if (!npc.alive || npc === victim) continue;
        var nx = npc.char.group.position.x, nz = npc.char.group.position.z;
        var dx = nx - px, dz = nz - pz;
        var dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 18 && LIFE.hasLineOfSight(px, pz, nx, nz)) {
            witnessCount++;
            var npcRep = npc.npcReputation !== undefined ? npc.npcReputation : 30;
            var npcWAge = npc.npcAge !== null ? npc.npcAge : (npc.type === 'Kid' ? 8 : 25);
            if (!npc.isPolice && npcRep > -30 && !npc._callingPolice) {
                if (npcWAge < 12) {
                    // Kids under 12 don't have phones — they just run away scared
                    npc.fleeing = true;
                    npc.fleeTimer = 6 + Math.random() * 4;
                } else if (!phoneCaller) {
                    // First adult witness starts a phone call animation
                    phoneCaller = npc;
                } else {
                    // Other witnesses just flee
                    npc.fleeing = true;
                    npc.fleeTimer = 5 + Math.random() * 3;
                }
            } else if (npc.isPolice) {
                // Police witness — instant wanted
                LIFE.addWanted(2, 'Crime seen by police', npc.name);
            }
            LIFE.updateRelationship(npc.name, -10);
        }
    }
    // Start phone call for the first civilian witness
    if (phoneCaller && !victim.isPolice) {
        var wantedAmount = Math.min(3, Math.max(1, Math.floor(witnessCount / 2)));
        LIFE.npcStartPhoneCall(phoneCaller, function() {
            LIFE.addWanted(wantedAmount, 'Witnesses called police', phoneCaller.name);
        });
    }
    return { count: witnessCount, witnessed: witnessCount > 0, callerName: phoneCaller ? phoneCaller.name : null };
};

// Make a victim NPC seek help from another NPC (flee toward nearest NPC)
// If they reach another NPC, that NPC becomes a witness and calls police
LIFE.makeVictimSeekHelp = function(victim) {
    if (!victim || !victim.alive) return;
    var vx = victim.char.group.position.x, vz = victim.char.group.position.z;
    // Find nearest alive NPC that isn't the victim
    var nearest = null, nearDist = Infinity;
    var allNPCs = LIFE.getAllNPCs();
    for (var i = 0; i < allNPCs.length; i++) {
        var npc = allNPCs[i];
        if (!npc.alive || npc === victim) continue;
        var dx = npc.char.group.position.x - vx;
        var dz = npc.char.group.position.z - vz;
        var d = Math.sqrt(dx * dx + dz * dz);
        if (d < nearDist && d > 2) { nearDist = d; nearest = npc; }
    }
    if (nearest && nearDist < 60) {
        // Set victim to flee TOWARD the nearest NPC to seek help
        victim._seekingHelp = true;
        victim._helpTarget = nearest;
        victim._helpTimer = 15; // max time to reach help
        victim.fleeing = true;
        victim.fleeTimer = 15;
        // Override flee direction toward the helper NPC
        victim._fleeToward = {
            x: nearest.char.group.position.x,
            z: nearest.char.group.position.z
        };
    } else {
        // Nobody nearby to seek help from — just flee randomly
        victim.fleeing = true;
        victim.fleeTimer = 5 + Math.random() * 3;
    }
};

// ============================================================
// BULLET PROJECTILE SYSTEM
// ============================================================
LIFE.bullets = [];
LIFE.impactEffects = [];

LIFE.createBullet = function(origin, direction, isPolice, baseDamage) {
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
        baseDamage: baseDamage || 50,
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
        if (!b) continue;
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

        // Check bullet collision with buildings (AABB colliders)
        var colliders = (LIFE.world.built && !LIFE.world.insideInterior)
            ? LIFE.world.getActiveColliders()
            : LIFE.colliders;
        var bx = b.mesh.position.x, bz = b.mesh.position.z;
        for (var ci = 0; ci < colliders.length; ci++) {
            var col = colliders[ci];
            if (bx >= col.minX && bx <= col.maxX && bz >= col.minZ && bz <= col.maxZ) {
                b.hit = true;
                LIFE.createImpactEffect(b.mesh.position);
                break;
            }
        }
        if (b.hit) continue;

        // trail follows
        b.trail.position.copy(b.mesh.position);

        // out of bounds (bullet traveled too far from origin or fell below ground)
        if (b.mesh.position.y < -1) {
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
            var allTargets = LIFE.getAllNPCs();
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
                    var dmg = b.baseDamage || 50;
                    var traveled = 1.5 - b.life; // time traveled
                    if (traveled > 0.5) dmg = Math.max(dmg * 0.4, dmg - traveled * 20);
                    LIFE.damageNPC(npc, Math.floor(dmg));

                    LIFE.createImpactEffect(b.mesh.position);
                    LIFE.sounds.bulletImpact();
                    LIFE.ui.showPopup('Hit ' + npc.type + '! (-' + Math.floor(dmg) + ')', '#ff1744');

                    // Check witnesses with line-of-sight
                    var shotWitness = LIFE.checkWitnesses(npc);
                    var shotSeen = shotWitness.witnessed;

                    // rep/wanted - much worse for family
                    var shotFamily = (npc.type === 'Mom' || npc.type === 'Dad' || npc.type === 'Sibling' ||
                        npc.type === 'Spouse' || npc.type === 'Your Child');
                    var repLoss = -15;
                    if (npc.isPolice) {
                        LIFE.logCrime('Shooting at a police officer');
                        LIFE.addWanted(3, 'Shot police officer', npc.name); repLoss = -8;
                    } else if (shotSeen) {
                        // Witnessed — police get called
                        if (shotFamily) {
                            LIFE.logCrime('Shooting a family member');
                            LIFE.addWanted(4, 'Shot family (witnessed)');
                            repLoss = -30;
                            LIFE.state.stats.happiness = Math.max(0, LIFE.state.stats.happiness - 15);
                            LIFE.state.familyAbuser = true;
                        } else if (npc.type === 'Kid' || npc.type === 'Grandchild') {
                            LIFE.logCrime('Shooting a minor');
                            LIFE.addWanted(4, 'Shot child (witnessed)');
                            repLoss = -25;
                        } else {
                            LIFE.logCrime('Shooting a civilian');
                            LIFE.addWanted(2, 'Shot civilian (witnessed)');
                        }
                    } else {
                        // Unwitnessed shooting — log crime but no police yet
                        if (shotFamily) {
                            LIFE.logCrime('Shooting a family member');
                            repLoss = -30;
                            LIFE.state.stats.happiness = Math.max(0, LIFE.state.stats.happiness - 15);
                            LIFE.state.familyAbuser = true;
                        } else if (npc.type === 'Kid' || npc.type === 'Grandchild') {
                            LIFE.logCrime('Shooting a minor');
                            repLoss = -25;
                        } else {
                            LIFE.logCrime('Shooting a civilian');
                        }
                        repLoss = Math.ceil(repLoss * 0.3); // reduced rep loss if unseen
                        // Gunshot SOUND can attract attention — 40% chance someone hears
                        if (Math.random() < 0.4) {
                            LIFE.addWanted(1, 'Gunshot heard');
                            LIFE.ui.showPopup('Someone heard the gunshot!', '#ff9800');
                        }
                        // Victim flees for help if alive
                        if (npc.alive) LIFE.makeVictimSeekHelp(npc);
                    }
                    LIFE.state.reputation = Math.max(-100, LIFE.state.reputation + repLoss);
                    LIFE.ui.showRepChange(repLoss);
                    LIFE.state.enemies++;
                    LIFE.updateRelationship(npc.name, -40);
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
    var equipped = LIFE.getEquipped();
    var isRifle = equipped === 'AK-47';
    var isShotgun = equipped === 'Shotgun';
    if (equipped !== 'Pistol' && !isRifle && !isShotgun) return;
    if (state.shootCooldown > 0) return;
    // AK-47: faster fire rate (0.1s), Shotgun: slow (0.8s), Pistol: 0.4s
    state.shootCooldown = isRifle ? 0.1 : isShotgun ? 0.8 : 0.4;
    state.actionCooldown = isRifle ? 0.1 : isShotgun ? 0.8 : 0.4;
    state.actionAnim = { type: 'punch', timer: 0.15 };
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

    if (isShotgun) {
        // Shotgun fires 5 pellets with wide spread
        for (var p = 0; p < 5; p++) {
            var pelletDir = direction.clone();
            pelletDir.x += (Math.random() - 0.5) * 0.2;
            pelletDir.z += (Math.random() - 0.5) * 0.2;
            pelletDir.normalize();
            LIFE.createBullet(origin.clone(), pelletDir, false, 15);
        }
        LIFE.createMuzzleFlash(origin);
    } else {
        // spread: AK-47 has more spread than pistol
        var spread = isRifle ? 0.07 : 0.04;
        direction.x += (Math.random() - 0.5) * spread;
        direction.z += (Math.random() - 0.5) * spread;
        direction.normalize();

        var bulletDmg = isRifle ? 40 : 50;
        LIFE.createBullet(origin, direction, false, bulletDmg);
        LIFE.createMuzzleFlash(origin);
    }

    // firing gun — check if anyone nearby can hear/see
    if (state.wantedLevel < 1) {
        LIFE.logCrime('Illegal discharge of a firearm');
        var heardGunshot = false;
        var allGunNPCs = LIFE.getAllNPCs();
        for (var gi = 0; gi < allGunNPCs.length; gi++) {
            var gnpc = allGunNPCs[gi];
            if (!gnpc.alive) continue;
            var gdx = gnpc.char.group.position.x - player.group.position.x;
            var gdz = gnpc.char.group.position.z - player.group.position.z;
            if (Math.sqrt(gdx * gdx + gdz * gdz) < 25) { heardGunshot = true; break; }
        }
        if (heardGunshot) LIFE.addWanted(isRifle ? 2 : 1, 'Gunshot heard', gnpc.name);
    }
    if (state.wantedLevel > 0) state.reputation = Math.max(-100, state.reputation - 3);
};

// ============================================================
// CRIME ACTIONS (triggered via dialogue/events, not buttons)
// ============================================================
LIFE.performSteal = function() {
    var state = LIFE.state;
    var npc = state.nearestNPC;
    if (!npc || !npc.alive) { LIFE.ui.showPopup('Nobody to steal from!', '#999'); state.actionCooldown = 1; return; }
    var dist = 0;
    if (LIFE.player) {
        var dx = npc.char.group.position.x - LIFE.player.group.position.x;
        var dz = npc.char.group.position.z - LIFE.player.group.position.z;
        dist = Math.sqrt(dx * dx + dz * dz);
    }
    if (dist > 4) { LIFE.ui.showPopup('Too far away!', '#999'); state.actionCooldown = 1; return; }

    // Success chance based on charisma (stealth/cunning) and target type
    var baseChance = 0.4 + state.stats.charisma * 0.004;
    if (npc.isPolice) baseChance -= 0.3;
    if (npc.isVendor) baseChance += 0.1;
    if (npc.type === 'Kid' || npc.type === 'Grandchild') baseChance += 0.2;
    if (npc.type === 'Dealer') baseChance -= 0.15;

    state.actionCooldown = 2.0;
    state.actionAnim = { type: 'punch', timer: 0.4 };
    state.totalThefts = (state.totalThefts || 0) + 1;

    if (Math.random() < baseChance) {
        // Success
        var loot = Math.floor(Math.random() * 80) + 10;
        if (npc.isVendor) loot = Math.floor(Math.random() * 150) + 30;
        if (npc.type === 'Kid') loot = Math.floor(Math.random() * 5) + 1;
        state.money += loot;
        LIFE.ui.showPopup('Stole $' + loot + '!', '#b71c1c');
        LIFE.sounds.money();
        state.reputation = Math.max(-100, state.reputation - 3);
        LIFE.ui.showRepChange(-3);
        LIFE.logCrime('Theft');
        LIFE.updateRelationship(npc.name, -30);
        // Vendor notices eventually
        if (npc.isVendor && Math.random() < 0.3) {
            LIFE.addWanted(1, 'Theft noticed by vendor', npc.name);
            LIFE.ui.showPopup(npc.type + ' noticed!', '#ff9800');
        }
    } else {
        // Caught
        LIFE.ui.showPopup('Caught stealing!', '#f44336');
        state.reputation = Math.max(-100, state.reputation - 8);
        LIFE.ui.showRepChange(-8);
        LIFE.logCrime('Attempted theft');
        LIFE.addWanted(1, 'Caught stealing', npc.name);
        LIFE.updateRelationship(npc.name, -50);
        npc.reacting = 2;
        // NPC fights back
        if (!npc.isPolice && npc.alive && Math.random() < 0.5) {
            LIFE.damagePlayer(8, npc.name + ' caught you stealing');
        }
        if (LIFE.news) LIFE.news.add(LIFE.state.playerName + ' caught stealing in ' + (LIFE.world._currentZone || 'local area') + '.', 'crime');
    }
    LIFE.ui.updateStats();
};

LIFE.performPickpocket = function() {
    var state = LIFE.state;
    var npc = state.nearestNPC;
    if (!npc || !npc.alive) { LIFE.ui.showPopup('Nobody nearby!', '#999'); state.actionCooldown = 1; return; }
    var dist = 0;
    if (LIFE.player) {
        var dx = npc.char.group.position.x - LIFE.player.group.position.x;
        var dz = npc.char.group.position.z - LIFE.player.group.position.z;
        dist = Math.sqrt(dx * dx + dz * dz);
    }
    if (dist > 2.5) { LIFE.ui.showPopup('Need to get closer!', '#999'); state.actionCooldown = 1; return; }

    var baseChance = 0.35 + state.stats.charisma * 0.005;
    // Skill improves with practice
    baseChance += Math.min(0.2, (state.totalThefts || 0) * 0.02);
    if (npc.isPolice) baseChance -= 0.25;

    state.actionCooldown = 2.5;
    state.actionAnim = { type: 'work', timer: 0.4 };
    state.totalThefts = (state.totalThefts || 0) + 1;

    if (Math.random() < baseChance) {
        var loot = Math.floor(Math.random() * 200) + 20;
        state.money += loot;
        LIFE.ui.showPopup('Pickpocketed $' + loot + '!', '#d32f2f');
        LIFE.sounds.money();
        state.reputation = Math.max(-100, state.reputation - 2);
        LIFE.ui.showRepChange(-2);
        LIFE.logCrime('Pickpocketing');
    } else {
        LIFE.ui.showPopup('Caught! ' + npc.name + ' grabbed your wrist!', '#f44336');
        state.reputation = Math.max(-100, state.reputation - 10);
        LIFE.ui.showRepChange(-10);
        LIFE.logCrime('Attempted pickpocketing');
        LIFE.addWanted(1, 'Caught pickpocketing', npc.name);
        LIFE.updateRelationship(npc.name, -60);
        npc.reacting = 2;
        if (npc.alive) LIFE.damagePlayer(10, npc.name + ' caught you');
        LIFE.checkWitnesses(npc);
    }
    LIFE.ui.updateStats();
};

LIFE.performIntimidate = function() {
    var state = LIFE.state;
    var npc = state.nearestNPC;
    if (!npc || !npc.alive) { LIFE.ui.showPopup('Nobody to intimidate!', '#999'); state.actionCooldown = 1; return; }
    if (npc.isPolice) { LIFE.ui.showPopup("That's a bad idea...", '#999'); state.actionCooldown = 1; return; }

    var success = 0.3 + state.stats.charisma * 0.003;
    if (state.reputation <= -30) success += 0.2; // feared people intimidate better
    if (LIFE.getEquipped() === 'Switchblade') success += 0.15;
    if (LIFE.getEquipped() === 'Pistol') success += 0.3;
    if (npc.type === 'Kid' || npc.type === 'Grandchild') success += 0.3;
    if (npc.type === 'Dealer' || npc.type === 'Inmate') success -= 0.2;

    state.actionCooldown = 2.0;
    state.actionAnim = { type: 'punch', timer: 0.5 };

    if (Math.random() < success) {
        var extorted = Math.floor(Math.random() * 100) + 20;
        if (npc.isVendor) extorted = Math.floor(Math.random() * 200) + 50;
        state.money += extorted;
        LIFE.ui.showPopup(npc.name + ' hands over $' + extorted + ' in fear', '#880e4f');
        LIFE.sounds.money();
        state.reputation = Math.max(-100, state.reputation - 5);
        LIFE.ui.showRepChange(-5);
        LIFE.logCrime('Extortion');
        LIFE.updateRelationship(npc.name, -40);
        npc.fleeing = true; npc.fleeTimer = 5;
        state.totalExtortions = (state.totalExtortions || 0) + 1;
        if (Math.random() < 0.3) LIFE.addWanted(1, 'Extortion reported', npc.name);
    } else {
        var responses = [
            npc.name + " doesn't flinch: 'You don't scare me.'",
            npc.name + " laughs: 'Get lost, kid.'",
            npc.name + " stands their ground."
        ];
        LIFE.ui.showPopup(responses[Math.floor(Math.random() * responses.length)], '#999');
        state.reputation = Math.max(-100, state.reputation - 2);
        LIFE.ui.showRepChange(-2);
        LIFE.updateRelationship(npc.name, -20);
        // Might fight back
        if (Math.random() < 0.4 && npc.alive) {
            LIFE.damagePlayer(12, npc.name + ' fought back');
        }
    }
    LIFE.ui.updateStats();
};

// ============================================================
// VIRTUE ACTIONS (triggered via dialogue/events)
// ============================================================
LIFE.performPreach = function() {
    var state = LIFE.state;
    // Inspire nearby NPCs — requires charisma
    var nearbyCount = 0;
    var allNPCs = LIFE.getAllNPCs();
    for (var i = 0; i < allNPCs.length; i++) {
        var npc = allNPCs[i];
        if (!npc.alive || npc.isPolice || npc.isDealer) continue;
        if (!LIFE.player) continue;
        var dx = npc.char.group.position.x - LIFE.player.group.position.x;
        var dz = npc.char.group.position.z - LIFE.player.group.position.z;
        if (Math.sqrt(dx * dx + dz * dz) < 10) {
            nearbyCount++;
            LIFE.updateRelationship(npc.name, 5);
        }
    }
    if (nearbyCount > 0) {
        var repGain = 2 + nearbyCount;
        // Better speeches with high charisma
        if (state.stats.charisma > 60) repGain += 3;
        state.reputation = Math.min(100, state.reputation + repGain);
        state.stats.charisma = Math.min(100, state.stats.charisma + 1);
        LIFE.ui.showPopup('Inspired ' + nearbyCount + ' people! (+' + repGain + ' rep)', '#ffd54f');
        LIFE.ui.showRepChange(repGain);
        state.totalSpeeches = (state.totalSpeeches || 0) + 1;
        if (LIFE.news && nearbyCount >= 3) LIFE.news.add(LIFE.state.playerName + ' delivers inspiring speech to local community.', 'social');
    } else {
        LIFE.ui.showPopup('Nobody around to hear you...', '#999');
    }
    state.actionCooldown = 4.0;
    state.actionAnim = { type: 'wave', timer: 0.6 };
    LIFE.ui.updateStats();
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
        // Restore weapon pose after action animation
        if (LIFE.updateHeldWeapon) LIFE.updateHeldWeapon();
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
