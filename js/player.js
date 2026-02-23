// ============================================================
// PLAYER MANAGEMENT
// ============================================================
LIFE.player = null;

LIFE.createPlayer = function() {
    if (LIFE.player) LIFE.scene.remove(LIFE.player.group);
    var h = LIFE.getHeightForAge(Math.max(0, LIFE.state.age));
    var clothesColor = LIFE.state.age < 0 ? 0xffdbac : 0x2196f3; // naked in womb
    var isFemale = LIFE.state.playerGender === 'F' && LIFE.state.age > 2;
    LIFE.player = LIFE.createCharacter(h, 0xffdbac, clothesColor, true, { female: isFemale });
    LIFE.player.group.position.set(0, 0, 0);
    LIFE.scene.add(LIFE.player.group);
    // Create capsule physics body matching player height
    LIFE.physics.createPlayerBody(h, 0, 0, 0);
};

LIFE.updatePlayerSize = function() {
    if (!LIFE.player) return;
    var h = LIFE.getHeightForAge(LIFE.state.age);
    if (Math.abs(LIFE.player.height - h) > 0.01) {
        var pos = LIFE.player.group.position.clone();
        var rot = LIFE.player.group.rotation.y;
        LIFE.scene.remove(LIFE.player.group);
        var clothesColor = LIFE.state.age < 0 ? 0xffdbac : 0x2196f3;
        var isFemale = LIFE.state.playerGender === 'F' && LIFE.state.age > 2;
        LIFE.player = LIFE.createCharacter(h, 0xffdbac, clothesColor, true, { female: isFemale });
        LIFE.player.group.position.copy(pos);
        LIFE.player.group.rotation.y = rot;
        LIFE.scene.add(LIFE.player.group);
        // Reattach held weapon visual after player recreation
        LIFE._weaponMesh = null;
        LIFE._currentWeaponType = null;
        if (LIFE.updateHeldWeapon) LIFE.updateHeldWeapon();
        // Recreate capsule physics body with new height
        LIFE.physics.createPlayerBody(h, pos.x, pos.y, pos.z);
    }
};

// Teleport player to a new position (sets both mesh and physics body)
LIFE.teleportPlayer = function(x, y, z) {
    if (LIFE.player) LIFE.player.group.position.set(x, y, z);
    if (LIFE.physics._playerBody) {
        var halfH = LIFE.physics._playerHalfH || 0.4;
        LIFE.physics._playerBody.position.set(x, y + halfH, z);
        LIFE.physics._playerBody.velocity.set(0, 0, 0);
        // Sync interpolation positions so there's no one-frame snap
        LIFE.physics._prevPlayerPos.x = x;
        LIFE.physics._prevPlayerPos.y = y + halfH;
        LIFE.physics._prevPlayerPos.z = z;
        LIFE.physics._currPlayerPos.x = x;
        LIFE.physics._currPlayerPos.y = y + halfH;
        LIFE.physics._currPlayerPos.z = z;
    }
};

// ============================================================
// PLAYER DAMAGE
// ============================================================
LIFE.damagePlayer = function(amount, source) {
    var state = LIFE.state;
    state.stats.health = Math.max(0, state.stats.health - amount);
    LIFE.ui.showPopup('-' + amount + ' HP', '#ef5350');
    LIFE.ui.flashDamage();
    if (state.stats.health <= 0 && !state.deathTriggered) {
        // chance to survive via hospital if not in jail/execution and not being chased
        if (state.gamePhase === 'playing' && state.wantedLevel === 0 &&
            state.currentStage !== 'hospital' && Math.random() < 0.4) {
            state.stats.health = 3; // barely alive
            setTimeout(function() {
                if (state.gamePhase === 'playing' && !state.deathTriggered) {
                    LIFE.sendToHospital('nearDeath');
                }
            }, 500);
        } else {
            state.deathCause = source || 'injuries';
            LIFE.triggerDeath();
        }
    }
};

// ============================================================
// COLLISION RESOLUTION (used by NPCs, cars — player uses physics)
// ============================================================
LIFE.resolveCollisions = function(pos, bodyHeight) {
    var radius = 0.3;
    var bh = bodyHeight || 1.5;
    var colliders = (LIFE.world.built && !LIFE.world.insideInterior)
        ? LIFE.world.getActiveColliders()
        : LIFE.colliders;
    for (var i = 0; i < colliders.length; i++) {
        var c = colliders[i];
        // 3D Y-aware check: skip if no vertical overlap
        var cMinY = (c.minY !== undefined) ? c.minY : -999;
        var cMaxY = (c.maxY !== undefined) ? c.maxY : 999;
        if (pos.y >= cMaxY - 0.05) continue;
        if (pos.y + bh <= cMinY) continue;

        var closestX = Math.max(c.minX, Math.min(pos.x, c.maxX));
        var closestZ = Math.max(c.minZ, Math.min(pos.z, c.maxZ));
        var dx = pos.x - closestX;
        var dz = pos.z - closestZ;
        var distSq = dx * dx + dz * dz;
        if (distSq < radius * radius) {
            if (distSq === 0) {
                var cx = (c.minX + c.maxX) / 2, cz = (c.minZ + c.maxZ) / 2;
                var halfW = (c.maxX - c.minX) / 2 + radius;
                var halfD = (c.maxZ - c.minZ) / 2 + radius;
                var overlapX = halfW - Math.abs(pos.x - cx);
                var overlapZ = halfD - Math.abs(pos.z - cz);
                if (overlapX < overlapZ) pos.x += (pos.x > cx ? overlapX : -overlapX);
                else pos.z += (pos.z > cz ? overlapZ : -overlapZ);
            } else {
                var dist = Math.sqrt(distSq);
                var push = radius - dist;
                pos.x += (dx / dist) * push;
                pos.z += (dz / dist) * push;
            }
        }
    }
};

// ============================================================
// PLAYER UPDATE (physics-based movement)
// ============================================================
LIFE.updatePlayer = function(dt) {
    var state = LIFE.state;
    var player = LIFE.player;
    if (!player || state.gamePhase === 'death' || state.gamePhase === 'womb') return;

    // Freeze physics body during UI interactions (dialogue, shop, friends list)
    if ((LIFE.dialogue.active && LIFE.dialogue.blocking) || state.shopOpen || state.friendsOpen) {
        if (LIFE.physics._playerBody) {
            LIFE.physics._playerBody.velocity.set(0, 0, 0);
        }
        return;
    }

    // Driving mode - delegate to car update
    if (state.inCar) {
        LIFE.updateCarDriving(dt);
        return;
    }

    var body = LIFE.physics._playerBody;
    if (!body) return;
    var halfH = LIFE.physics._playerHalfH || 0.4;

    // Hard floor clamp: body center can never go below halfH (feet at y=0)
    if (body.position.y < halfH) {
        body.position.y = halfH;
        if (body.velocity.y < 0) body.velocity.y = 0;
    }

    // Ground detection: use physics contacts to detect standing on any surface
    var feetY = body.position.y - halfH;
    state.isGrounded = LIFE.physics._playerOnSurface || (feetY < 0.05);

    var speed = LIFE.getSpeedForAge(state.age, state.yearTimer);

    // STAT-BASED SPEED MODIFIERS
    if (state.stats.health < 30) speed *= 0.5 + (state.stats.health / 30) * 0.5;
    if (state.stats.happiness < 15) speed *= 0.8;

    var isCrawling = state.age < 2;
    var isNewborn = state.age === 0 && state.yearTimer < 20;

    // infant held by parent - follow Mom NPC
    if (state.heldByParent && state.age <= 0) {
        var mom = null;
        for (var ni = 0; ni < LIFE.npcs.length; ni++) {
            if (LIFE.npcs[ni].type === 'Mom' && LIFE.npcs[ni].alive) { mom = LIFE.npcs[ni]; break; }
        }
        if (mom) {
            var mp = mom.char.group.position;
            var mh = mom.char.height || 1.2;
            var mRot = mom.char.group.rotation.y;
            var offsetX = Math.sin(mRot) * 0.15 - Math.cos(mRot) * 0.2;
            var offsetZ = Math.cos(mRot) * 0.15 + Math.sin(mRot) * 0.2;
            player.group.position.set(mp.x + offsetX, mh * 0.45, mp.z + offsetZ);
            player.group.rotation.y = mRot;
            if (mom.char.parts.leftArm) {
                mom.char.parts.leftArm.rotation.x = -1.2;
                mom.char.parts.leftArm.rotation.z = 0.5;
            }
            if (mom.char.parts.rightArm) {
                mom.char.parts.rightArm.rotation.x = -1.0;
                mom.char.parts.rightArm.rotation.z = -0.5;
            }
        }
        return;
    }
    if (state.heldByParent && state.age > 0) {
        state.heldByParent = false;
        body.position.set(player.group.position.x, halfH, player.group.position.z);
        body.velocity.set(0, 0, 0);
        state.isGrounded = true;
        for (var ni2 = 0; ni2 < LIFE.npcs.length; ni2++) {
            if (LIFE.npcs[ni2].type === 'Mom' && LIFE.npcs[ni2].alive) {
                LIFE.npcs[ni2].char.parts.leftArm.rotation.set(0, 0, 0);
                LIFE.npcs[ni2].char.parts.rightArm.rotation.set(0, 0, 0);
                break;
            }
        }
    }

    var moveX = 0, moveZ = 0;

    if (!isNewborn && speed > 0) {
        if (LIFE.keys['KeyW'] || LIFE.keys['ArrowUp'])    moveZ = 1;
        if (LIFE.keys['KeyS'] || LIFE.keys['ArrowDown'])   moveZ = -1;
        if (LIFE.keys['KeyA'] || LIFE.keys['ArrowLeft'])    moveX = 1;
        if (LIFE.keys['KeyD'] || LIFE.keys['ArrowRight'])   moveX = -1;
    }

    // sprint with shift
    var sprinting = LIFE.keys['ShiftLeft'] && state.age >= 8 && state.stats.health > 10;
    if (sprinting) speed *= 1.5;

    var isMoving = moveX !== 0 || moveZ !== 0;

    if (isNewborn && player.parts.head) {
        player.parts.head.position.x = Math.sin(state.yearTimer * 1.5) * 0.005;
        player.group.rotation.x = -0.2;
    } else {
        player.group.rotation.x = 0;
    }

    var sinR = Math.sin(state.playerRotY), cosR = Math.cos(state.playerRotY);
    var dx = moveX * cosR + moveZ * sinR;
    var dz = -moveX * sinR + moveZ * cosR;

    if (isMoving) {
        var len = Math.sqrt(dx * dx + dz * dz);
        body.velocity.x = (dx / len) * speed;
        body.velocity.z = (dz / len) * speed;
        player.group.rotation.y = Math.atan2(dx, dz);
        LIFE.sounds.footstep();
    } else {
        // Stop horizontal movement immediately
        body.velocity.x = 0;
        body.velocity.z = 0;
    }

    // Jump
    if (LIFE.keys['Space'] && state.isGrounded && state.age >= 3 && !isNewborn && !LIFE.dialogue.active) {
        body.velocity.y = 7;
        state.isGrounded = false;
        LIFE.sounds.jump();
    }

    // Bounds clamp for interiors
    if (!LIFE.world.built || LIFE.world.insideInterior) {
        var b = state.bounds;
        var cx = 0, cz = 0;
        if (LIFE.world.built && LIFE.world.insideInterior && LIFE.world.INTERIOR_POSITIONS) {
            var ipos = LIFE.world.INTERIOR_POSITIONS[LIFE.world.insideInterior];
            if (ipos) { cx = ipos.x; cz = ipos.z; }
        }
        body.position.x = Math.max(cx - b, Math.min(cx + b, body.position.x));
        body.position.z = Math.max(cz - b, Math.min(cz + b, body.position.z));
    }

    // Unity-style interpolation: lerp between previous and current physics positions
    var prev = LIFE.physics._prevPlayerPos;
    var curr = LIFE.physics._currPlayerPos;
    var t = LIFE.physics._interpFactor;
    var renderX = prev.x + (curr.x - prev.x) * t;
    var renderY = prev.y + (curr.y - prev.y) * t - halfH; // subtract halfH for feet
    var renderZ = prev.z + (curr.z - prev.z) * t;
    player.group.position.set(renderX, renderY, renderZ);

    // walk animation
    var animSpeed = sprinting ? 2.2 : (isCrawling ? 2 : 1.5);
    var equipped = LIFE.getEquipped ? LIFE.getEquipped() : 'Fists';
    var holdingWeapon = equipped !== 'Fists' && equipped;
    if (isMoving && state.isGrounded) {
        state.walkTime += dt * speed * animSpeed;
        var swing = Math.sin(state.walkTime);
        if (state.age < 1) {
            player.parts.leftLeg.rotation.x = swing*0.2; player.parts.rightLeg.rotation.x = -swing*0.2;
            player.parts.leftArm.rotation.x = -swing*0.4;
            if (!holdingWeapon) player.parts.rightArm.rotation.x = swing*0.4;
        } else if (isCrawling) {
            player.parts.leftLeg.rotation.x = swing*0.3; player.parts.rightLeg.rotation.x = -swing*0.3;
            player.parts.leftArm.rotation.x = -swing*0.5;
            if (!holdingWeapon) player.parts.rightArm.rotation.x = swing*0.5;
        } else {
            var armSwing = sprinting ? 0.6 : 0.35;
            player.parts.leftLeg.rotation.x = swing*0.5; player.parts.rightLeg.rotation.x = -swing*0.5;
            player.parts.leftArm.rotation.x = -swing*armSwing;
            if (!holdingWeapon) player.parts.rightArm.rotation.x = swing*armSwing;
        }
    } else if (!state.actionAnim.type) {
        player.parts.leftLeg.rotation.x *= 0.9; player.parts.rightLeg.rotation.x *= 0.9;
        player.parts.leftArm.rotation.x *= 0.9;
        if (!holdingWeapon) player.parts.rightArm.rotation.x *= 0.9;
    }
    // Apply weapon arm pose after walk animation
    if (holdingWeapon && LIFE.updateHeldWeapon) LIFE.updateHeldWeapon();

    if (state.age >= 1 && state.age < 3 && isMoving) player.group.rotation.z = Math.sin(state.walkTime * 2) * 0.12;
    else player.group.rotation.z *= 0.9;

    // nearest living NPC (range 6 to match visual proximity expectations)
    state.nearestNPC = null;
    var minDist = 6;
    var allNPCs = LIFE.getAllNPCs();
    allNPCs.forEach(function(npc) {
        if (!npc.alive) return;
        var ndx = npc.char.group.position.x - player.group.position.x;
        var ndz = npc.char.group.position.z - player.group.position.z;
        var d = Math.sqrt(ndx * ndx + ndz * ndz);
        if (d < minDist) { minDist = d; state.nearestNPC = npc; }
    });
};

// ============================================================
// CAMERA
// ============================================================
LIFE.updateCamera = function() {
    var player = LIFE.player, state = LIFE.state;
    if (!player) return;
    if (state.gamePhase === 'womb') { LIFE.camera.position.set(0,2,0); LIFE.camera.lookAt(0,2,1); return; }

    var h = LIFE.getHeightForAge(Math.max(0, state.age));
    var equipped = LIFE.getEquipped ? LIFE.getEquipped() : 'Fists';
    var inCombatMode = (equipped === 'Pistol' && state.age >= 13);

    var camDist, camHeight, shoulderOffset, lerpSpeed;

    if (state.inCar && LIFE.car.model) {
        camDist = 8; camHeight = 4; shoulderOffset = 0; lerpSpeed = 0.1;
    } else if (inCombatMode) {
        camDist = 2.5; camHeight = h + 0.4; shoulderOffset = 0.6; lerpSpeed = 0.15;
    } else if (state.age < 1) {
        camDist = 1.8; camHeight = 1.0; shoulderOffset = 0; lerpSpeed = 0.1;
    } else if (state.age < 2) {
        camDist = 2.2; camHeight = 1.3; shoulderOffset = 0; lerpSpeed = 0.1;
    } else if (state.age < 13) {
        camDist = 3; camHeight = 2; shoulderOffset = 0; lerpSpeed = 0.1;
    } else {
        camDist = 4; camHeight = 2.5; shoulderOffset = 0; lerpSpeed = 0.1;
    }

    var sinR = Math.sin(state.playerRotY);
    var cosR = Math.cos(state.playerRotY);
    var rightX = cosR;
    var rightZ = -sinR;

    var tX = player.group.position.x - sinR * camDist + rightX * shoulderOffset;
    var tZ = player.group.position.z - cosR * camDist + rightZ * shoulderOffset;
    var tY;
    if (inCombatMode) {
        tY = player.group.position.y + camHeight;
    } else {
        tY = player.group.position.y + camHeight * state.cameraPitch;
    }

    // Per-frame lerp camera position
    LIFE.camera.position.x += (tX - LIFE.camera.position.x) * lerpSpeed;
    LIFE.camera.position.y += (tY - LIFE.camera.position.y) * lerpSpeed;
    LIFE.camera.position.z += (tZ - LIFE.camera.position.z) * lerpSpeed;

    // Instant lookAt — no smoothing
    if (state.inCar && LIFE.car.model) {
        var carRot = LIFE.car.model.rotation.y;
        LIFE.camera.lookAt(
            LIFE.car.model.position.x + Math.sin(carRot) * 5,
            1.5,
            LIFE.car.model.position.z + Math.cos(carRot) * 5
        );
    } else if (inCombatMode) {
        LIFE.camera.lookAt(
            player.group.position.x + sinR * 10 + rightX * shoulderOffset * 0.3,
            player.group.position.y + h * 0.75,
            player.group.position.z + cosR * 10 + rightZ * shoulderOffset * 0.3
        );
    } else {
        LIFE.camera.lookAt(
            player.group.position.x + rightX * shoulderOffset * 0.3,
            player.group.position.y + h * 0.6,
            player.group.position.z + rightZ * shoulderOffset * 0.3
        );
    }
};
