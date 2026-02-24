// ============================================================
// PLAYER MANAGEMENT
// ============================================================
LIFE.player = null;

LIFE.CLOTHING_COLORS = {
    'T-Shirt': 0xeeeeee, 'Nice Outfit': 0x1565c0, 'Designer Clothes': 0x6a1b9a,
    'Formal Suit': 0x212121, 'Event T-Shirt': 0xf44336,
    'Jeans': 0x1a237e, 'Dress Pants': 0x37474f, 'Shorts': 0xbcaaa4,
    'Cap': 0xd32f2f, 'Beanie': 0x333333, 'Cowboy Hat': 0x6d4c41,
    'Sneakers': 0xffffff, 'Boots': 0x3e2723, 'Designer Shoes': 0x1a1a1a
};

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
    if (LIFE.updatePlayerAppearance) LIFE.updatePlayerAppearance();
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
        if (LIFE.updatePlayerAppearance) LIFE.updatePlayerAppearance();
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
// PLAYER APPEARANCE (equipment-based)
// ============================================================
LIFE.updatePlayerAppearance = function() {
    var player = LIFE.player;
    if (!player) return;
    var eq = LIFE.state.equipment;
    if (!eq) return;
    var defaultChest = LIFE.state.age < 0 ? 0xffdbac : 0x2196f3;
    var defaultLegs = 0x1a237e;
    var h = player.height;

    // Chest color
    var chestColor = eq.chest ? (LIFE.CLOTHING_COLORS[eq.chest] || defaultChest) : defaultChest;
    if (player.bodyMat) player.bodyMat.color.setHex(chestColor);

    // Leg color
    var legColor = eq.legs ? (LIFE.CLOTHING_COLORS[eq.legs] || defaultLegs) : defaultLegs;
    if (player.legMat) player.legMat.color.setHex(legColor);

    // Remove old accessory meshes
    if (player._hatMesh) { player.group.remove(player._hatMesh); player._hatMesh = null; }
    if (player._armorMesh) { player.group.remove(player._armorMesh); player._armorMesh = null; }
    if (player._shoeMeshL) { (player.parts.leftKnee || player.parts.leftLeg).remove(player._shoeMeshL); player._shoeMeshL = null; }
    if (player._shoeMeshR) { (player.parts.rightKnee || player.parts.rightLeg).remove(player._shoeMeshR); player._shoeMeshR = null; }

    // Hat
    if (eq.head) {
        var hatColor = LIFE.CLOTHING_COLORS[eq.head] || 0x333333;
        var hatMat = LIFE.getMaterial({ color: hatColor });
        var hatGroup = new THREE.Group();
        if (eq.head === 'Cowboy Hat') {
            hatGroup.add(new THREE.Mesh(new THREE.BoxGeometry(h*0.35, 0.02, h*0.35), hatMat));
            var top = new THREE.Mesh(new THREE.BoxGeometry(h*0.18, h*0.08, h*0.18), hatMat);
            top.position.y = h*0.05; hatGroup.add(top);
        } else if (eq.head === 'Beanie') {
            hatGroup.add(new THREE.Mesh(new THREE.BoxGeometry(h*0.22, h*0.1, h*0.22), hatMat));
        } else { // Cap
            var capTop = new THREE.Mesh(new THREE.BoxGeometry(h*0.22, h*0.05, h*0.22), hatMat);
            hatGroup.add(capTop);
            var brim = new THREE.Mesh(new THREE.BoxGeometry(h*0.22, 0.01, h*0.08), hatMat);
            brim.position.z = h*0.13; brim.position.y = -h*0.02; hatGroup.add(brim);
        }
        var headR = h * 0.13;
        var legH = h * 0.28;
        var bodyH = h * 0.32;
        hatGroup.position.y = legH + bodyH + headR * 2 + h * 0.02;
        player.group.add(hatGroup);
        player._hatMesh = hatGroup;
    }

    // Armor vest overlay
    if (eq.armor) {
        var armorMat = LIFE.getMaterial({ color: 0x2d2d2d });
        var vestH = h * 0.34;
        var vestW = h * 0.24;
        var vest = new THREE.Mesh(new THREE.BoxGeometry(vestW, vestH, h * 0.16), armorMat);
        vest.position.y = h * 0.28 + vestH / 2;
        player.group.add(vest);
        player._armorMesh = vest;
    }

    // Shoes
    if (eq.shoes && player.parts.leftLeg && player.parts.rightLeg) {
        var shoeColor = LIFE.CLOTHING_COLORS[eq.shoes] || 0x333333;
        var shoeMat = LIFE.getMaterial({ color: shoeColor });
        var legH2 = h * 0.28;
        var legW2 = h * 0.08;
        var shoeParentL = player.parts.leftKnee || player.parts.leftLeg;
        var shoeParentR = player.parts.rightKnee || player.parts.rightLeg;
        var shoeL = new THREE.Mesh(new THREE.BoxGeometry(legW2*1.2, legH2*0.2, legW2*1.5), shoeMat);
        shoeL.position.set(0, -legH2*0.45, legW2*0.2);
        shoeParentL.add(shoeL);
        player._shoeMeshL = shoeL;
        var shoeR = new THREE.Mesh(new THREE.BoxGeometry(legW2*1.2, legH2*0.2, legW2*1.5), shoeMat);
        shoeR.position.set(0, -legH2*0.45, legW2*0.2);
        shoeParentR.add(shoeR);
        player._shoeMeshR = shoeR;
    }
};

// ============================================================
// PLAYER DAMAGE
// ============================================================
LIFE.damagePlayer = function(amount, source) {
    var state = LIFE.state;
    state.stats.health = Math.max(0, state.stats.health - amount);
    if (LIFE.enhance && LIFE.enhance.floatNum) LIFE.enhance.floatNum('-' + amount + ' HP', '#ef5350');
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
    var colliders = (LIFE.world.built && !LIFE.world.insideInterior && LIFE.world.getCollidersNear)
        ? LIFE.world.getCollidersNear(pos.x, pos.z)
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

    // crouch speed reduction
    if (state.crouching && state.age >= 5) speed *= 0.4;

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

    // Crouch animation — bend knees, lower body
    var crouchTarget = (state.crouching && state.age >= 5) ? 1 : 0;
    LIFE._crouchBlend = LIFE._crouchBlend || 0;
    LIFE._crouchBlend += (crouchTarget - LIFE._crouchBlend) * 0.15;
    var cb = LIFE._crouchBlend;
    // YXZ order so lean rotates in character-local space, not world
    player.group.rotation.order = 'YXZ';
    if (cb > 0.01) {
        // When idle, reset leg base to prevent decay accumulation
        if (!isMoving) {
            player.parts.leftLeg.rotation.x = 0;
            player.parts.rightLeg.rotation.x = 0;
        }
        // Thigh forward (neg X), knee bends back (pos X)
        player.parts.leftLeg.rotation.x -= cb * 0.9;
        player.parts.rightLeg.rotation.x -= cb * 0.9;
        if (player.parts.leftKnee) player.parts.leftKnee.rotation.x = cb * 0.7;
        if (player.parts.rightKnee) player.parts.rightKnee.rotation.x = cb * 0.7;
        // Forward lean of upper body (local space due to YXZ order)
        player.group.rotation.x = cb * 0.25;
        // Lower the body
        player.group.position.y -= cb * player.height * 0.12;
    } else {
        player.group.rotation.x = 0;
        if (player.parts.leftKnee) player.parts.leftKnee.rotation.x = 0;
        if (player.parts.rightKnee) player.parts.rightKnee.rotation.x = 0;
    }

    // Stealth detection update (throttled)
    LIFE._stealthTimer = (LIFE._stealthTimer || 0) + dt;
    if (LIFE._stealthTimer > 0.25) {
        LIFE._stealthTimer = 0;
        LIFE._playerHidden = LIFE.isPlayerHidden ? LIFE.isPlayerHidden() : false;
    }

    // Update stealth eye HUD
    if (LIFE.updateStealthEye) LIFE.updateStealthEye(dt);

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
    var inCombatMode = ((equipped === 'Pistol' || equipped === 'AK-47' || equipped === 'Shotgun') && state.age >= 13);

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
    var crouchCamDrop = (LIFE._crouchBlend || 0) * h * 0.2;
    if (inCombatMode) {
        tY = player.group.position.y + camHeight - crouchCamDrop;
    } else {
        tY = player.group.position.y + camHeight * state.cameraPitch - crouchCamDrop;
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

// ============================================================
// STEALTH EYE HUD
// ============================================================
LIFE.updateStealthEye = function(dt) {
    var state = LIFE.state;
    var eyeCanvas = document.getElementById('stealthEye');
    var crosshair = document.getElementById('crosshair');
    var hiddenLabel = document.getElementById('hiddenLabel');
    if (!eyeCanvas || !crosshair) return;

    if (!state.crouching || state.age < 5) {
        eyeCanvas.style.display = 'none';
        hiddenLabel.style.display = 'none';
        if (state.locked) crosshair.style.display = 'block';
        LIFE._stealthEyeOpen = 1;
        return;
    }

    // Crouching: show eye, hide crosshair
    eyeCanvas.style.display = 'block';
    hiddenLabel.style.display = 'block';
    crosshair.style.display = 'none';

    // Determine target: 1 = open (seen), 0 = closed (hidden)
    var hidden = LIFE._playerHidden;
    var target = hidden ? 0 : 1;
    LIFE._stealthEyeOpen = LIFE._stealthEyeOpen !== undefined ? LIFE._stealthEyeOpen : 1;
    var prev = LIFE._stealthEyeOpen;
    LIFE._stealthEyeOpen += (target - LIFE._stealthEyeOpen) * 0.08;

    // HIDDEN label: show when transitioning to hidden
    if (prev > 0.5 && LIFE._stealthEyeOpen <= 0.5) {
        hiddenLabel.classList.add('show');
        clearTimeout(LIFE._hiddenLabelTimer);
        LIFE._hiddenLabelTimer = setTimeout(function() {
            hiddenLabel.classList.remove('show');
        }, 1500);
    }

    // Draw eye on canvas
    var ctx = eyeCanvas.getContext('2d');
    var w = 48, h = 32;
    ctx.clearRect(0, 0, w, h);

    var openness = LIFE._stealthEyeOpen;
    // Color: white when seen, green when hidden
    var r = Math.round(100 + 155 * openness);
    var g = 255;
    var b = Math.round(100 + 155 * openness);
    var alpha = 0.7 + openness * 0.3;
    ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (alpha * 0.3) + ')';
    ctx.lineWidth = 1.5;

    var cx = w / 2, cy = h / 2;
    var eyeW = 18; // half-width of eye
    var eyeH = 10 * openness; // half-height scales with openness

    // Draw almond eye shape
    ctx.beginPath();
    ctx.moveTo(cx - eyeW, cy);
    ctx.bezierCurveTo(cx - eyeW * 0.5, cy - eyeH, cx + eyeW * 0.5, cy - eyeH, cx + eyeW, cy);
    ctx.bezierCurveTo(cx + eyeW * 0.5, cy + eyeH, cx - eyeW * 0.5, cy + eyeH, cx - eyeW, cy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Iris + pupil (scale with openness)
    if (openness > 0.05) {
        var irisR = 4 * openness;
        ctx.beginPath();
        ctx.arc(cx, cy, irisR, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,' + (0.8 * openness) + ')';
        ctx.fill();

        var pupilR = 1.5 * openness;
        ctx.beginPath();
        ctx.arc(cx, cy, pupilR, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(30,30,30,' + (0.9 * openness) + ')';
        ctx.fill();
    } else {
        // Closed: just a horizontal line
        ctx.beginPath();
        ctx.moveTo(cx - eyeW, cy);
        ctx.lineTo(cx + eyeW, cy);
        ctx.stroke();
    }
};
