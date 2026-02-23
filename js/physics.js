// ============================================================
// CANNON.JS PHYSICS ENGINE INTEGRATION
// ============================================================
LIFE.physics = {};

LIFE.physics.init = function() {
    var world = new CANNON.World();
    world.gravity.set(0, -20, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 5;
    world.allowSleep = true;

    // Default sleep parameters
    world.defaultContactMaterial.contactEquationStiffness = 1e7;
    world.defaultContactMaterial.contactEquationRelaxation = 4;

    LIFE.physics.world = world;

    // Materials
    var groundMat = new CANNON.Material('ground');
    var itemMat = new CANNON.Material('item');
    var wallMat = new CANNON.Material('wall');
    var kinematicMat = new CANNON.Material('kinematic');

    LIFE.physics.groundMat = groundMat;
    LIFE.physics.itemMat = itemMat;
    LIFE.physics.wallMat = wallMat;
    LIFE.physics.kinematicMat = kinematicMat;

    // Contact materials
    world.addContactMaterial(new CANNON.ContactMaterial(itemMat, groundMat, {
        friction: 0.4,
        restitution: 0.2
    }));
    world.addContactMaterial(new CANNON.ContactMaterial(itemMat, wallMat, {
        friction: 0.3,
        restitution: 0.15
    }));
    world.addContactMaterial(new CANNON.ContactMaterial(itemMat, itemMat, {
        friction: 0.3,
        restitution: 0.1
    }));
    world.addContactMaterial(new CANNON.ContactMaterial(itemMat, kinematicMat, {
        friction: 0.2,
        restitution: 0.3
    }));

    // Player material (low friction, no bounce — velocity controlled directly)
    var playerMat = new CANNON.Material('player');
    LIFE.physics.playerMat = playerMat;
    world.addContactMaterial(new CANNON.ContactMaterial(playerMat, groundMat, {
        friction: 0.0, restitution: 0.0,
        contactEquationStiffness: 1e8,
        contactEquationRelaxation: 3
    }));
    world.addContactMaterial(new CANNON.ContactMaterial(playerMat, wallMat, {
        friction: 0.0, restitution: 0.0,
        contactEquationStiffness: 1e8,
        contactEquationRelaxation: 3
    }));
    world.addContactMaterial(new CANNON.ContactMaterial(playerMat, itemMat, {
        friction: 0.0, restitution: 0.0
    }));
    world.addContactMaterial(new CANNON.ContactMaterial(playerMat, kinematicMat, {
        friction: 0.0, restitution: 0.0
    }));

    // Body tracking arrays
    LIFE.physics.staticBodies = [];     // temporary static bodies (interiors, non-zone)
    LIFE.physics.zoneBodies = [];       // persistent zone static bodies (survive interior transitions)
    LIFE.physics.dynamicBodies = [];    // {mesh, body, ring, ringBody}
    LIFE.physics.kinematicBodies = [];  // {mesh, body, owner}
    LIFE.physics._buildingZone = false; // flag: currently building zone bodies
    LIFE.physics._playerBody = null;    // dynamic player body reference
    LIFE.physics._playerRadius = 0.4;  // player sphere radius

    // Fixed-timestep accumulator for Unity-style interpolation
    LIFE.physics._accumulator = 0;
    LIFE.physics._fixedStep = 1 / 60;
    LIFE.physics._interpFactor = 0;
    LIFE.physics._prevPlayerPos = { x: 0, y: 0, z: 0 };
    LIFE.physics._currPlayerPos = { x: 0, y: 0, z: 0 };

    // Ground plane at Y=0
    LIFE.physics.addGroundPlane();
};

// ============================================================
// GROUND PLANE
// ============================================================
LIFE.physics.addGroundPlane = function() {
    var body = new CANNON.Body({
        mass: 0,
        material: LIFE.physics.groundMat
    });
    body.addShape(new CANNON.Plane());
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    body.position.set(0, 0, 0);
    LIFE.physics.world.addBody(body);
    LIFE.physics._groundPlane = body;
};

// ============================================================
// STATIC BODY CREATION (for environment objects)
// ============================================================
LIFE.physics.addStaticBox = function(w, h, d, x, y, z) {
    if (!LIFE.physics.world) return null;
    var shape = new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, d / 2));
    var body = new CANNON.Body({
        mass: 0,
        shape: shape,
        material: LIFE.physics.wallMat
    });
    body.position.set(x, y, z);
    LIFE.physics.world.addBody(body);
    if (LIFE.physics._buildingZone) {
        LIFE.physics.zoneBodies.push(body);
    } else {
        LIFE.physics.staticBodies.push(body);
    }
    return body;
};

LIFE.physics.addStaticCylinder = function(radius, height, x, y, z) {
    if (!LIFE.physics.world) return null;
    var shape = new CANNON.Cylinder(radius, radius, height, 8);
    var body = new CANNON.Body({
        mass: 0,
        material: LIFE.physics.wallMat
    });
    body.addShape(shape);
    body.position.set(x, y, z);
    LIFE.physics.world.addBody(body);
    if (LIFE.physics._buildingZone) {
        LIFE.physics.zoneBodies.push(body);
    } else {
        LIFE.physics.staticBodies.push(body);
    }
    return body;
};

// ============================================================
// DYNAMIC BODY CREATION (for items)
// ============================================================
LIFE.physics.ITEM_PHYSICS = {
    // Small items: sphere shape
    'Apple':        { shape: 'sphere', radius: 0.1,  mass: 0.3 },
    'Keys':         { shape: 'sphere', radius: 0.08, mass: 0.2 },
    'Gold Ring':    { shape: 'sphere', radius: 0.06, mass: 0.2 },
    'Watch':        { shape: 'box', hw: 0.04, hh: 0.01, hd: 0.08, mass: 0.2 },
    'Sunglasses':   { shape: 'box', hw: 0.07, hh: 0.01, hd: 0.03, mass: 0.15 },
    'Headphones':   { shape: 'box', hw: 0.06, hh: 0.04, hd: 0.04, mass: 0.3 },
    'Medicine':     { shape: 'box', hw: 0.03, hh: 0.04, hd: 0.03, mass: 0.2 },
    // Medium items: box shape
    'Phone':        { shape: 'box', hw: 0.05, hh: 0.01, hd: 0.08, mass: 0.4 },
    'Wallet':       { shape: 'box', hw: 0.06, hh: 0.015, hd: 0.05, mass: 0.3 },
    'Sandwich':     { shape: 'box', hw: 0.07, hh: 0.03,  hd: 0.06, mass: 0.3 },
    'Book':         { shape: 'box', hw: 0.06, hh: 0.02,  hd: 0.08, mass: 0.5 },
    'Textbook':     { shape: 'box', hw: 0.06, hh: 0.025, hd: 0.08, mass: 0.7 },
    'Coffee':       { shape: 'box', hw: 0.04, hh: 0.06,  hd: 0.04, mass: 0.4 },
    'Energy Drink': { shape: 'box', hw: 0.04, hh: 0.06,  hd: 0.04, mass: 0.4 },
    'Pizza Slice':  { shape: 'box', hw: 0.08, hh: 0.015, hd: 0.1,  mass: 0.3 },
    'Medkit':       { shape: 'box', hw: 0.08, hh: 0.04,  hd: 0.06, mass: 0.6 },
    // Large items: box shape
    'Laptop':       { shape: 'box', hw: 0.1, hh: 0.02, hd: 0.08, mass: 1.5 },
    'Backpack':     { shape: 'box', hw: 0.08, hh: 0.1,  hd: 0.06, mass: 1.0 },
    'Guitar':       { shape: 'box', hw: 0.06, hh: 0.03, hd: 0.15, mass: 1.5 },
    // Weapons
    'Pistol':       { shape: 'box', hw: 0.06, hh: 0.04, hd: 0.03, mass: 1.0 },
    'Switchblade':  { shape: 'box', hw: 0.02, hh: 0.01, hd: 0.06, mass: 0.3 },
    'AK-47':        { shape: 'box', hw: 0.03, hh: 0.04, hd: 0.18, mass: 3.5 },
    'Baseball Bat': { shape: 'box', hw: 0.03, hh: 0.03, hd: 0.15, mass: 1.2 },
    'Crowbar':      { shape: 'box', hw: 0.02, hh: 0.02, hd: 0.12, mass: 1.5 },
    // Food vendor
    'Hot Dog':          { shape: 'box', hw: 0.07, hh: 0.025, hd: 0.03, mass: 0.3 },
    'Smoothie':         { shape: 'box', hw: 0.03, hh: 0.07,  hd: 0.03, mass: 0.4 },
    'Full Meal':        { shape: 'box', hw: 0.10, hh: 0.02,  hd: 0.10, mass: 0.6 },
    'Protein Shake':    { shape: 'box', hw: 0.04, hh: 0.07,  hd: 0.04, mass: 0.5 },
    'Fancy Dinner':     { shape: 'box', hw: 0.10, hh: 0.05,  hd: 0.10, mass: 0.8 },
    // Pharmacist
    'Vitamins':         { shape: 'box', hw: 0.03, hh: 0.04,  hd: 0.03, mass: 0.2 },
    'Cold Medicine':    { shape: 'box', hw: 0.04, hh: 0.05,  hd: 0.02, mass: 0.3 },
    'Pain Killers':     { shape: 'box', hw: 0.04, hh: 0.01,  hd: 0.03, mass: 0.15 },
    'Supplements':      { shape: 'box', hw: 0.03, hh: 0.04,  hd: 0.03, mass: 0.2 },
    'Prescription':     { shape: 'box', hw: 0.03, hh: 0.05,  hd: 0.03, mass: 0.2 },
    'First Aid Kit':    { shape: 'box', hw: 0.08, hh: 0.04,  hd: 0.06, mass: 0.6 },
    // Clothes
    'T-Shirt':          { shape: 'box', hw: 0.08, hh: 0.08,  hd: 0.02, mass: 0.3 },
    'Event T-Shirt':    { shape: 'box', hw: 0.08, hh: 0.08,  hd: 0.02, mass: 0.3 },
    'Nice Outfit':      { shape: 'box', hw: 0.08, hh: 0.10,  hd: 0.03, mass: 0.5 },
    'Designer Clothes': { shape: 'box', hw: 0.08, hh: 0.10,  hd: 0.03, mass: 0.5 },
    'Formal Suit':      { shape: 'box', hw: 0.08, hh: 0.11,  hd: 0.03, mass: 0.6 },
    'Luxury Watch':     { shape: 'box', hw: 0.04, hh: 0.01,  hd: 0.08, mass: 0.3 },
    'Designer Shoes':   { shape: 'box', hw: 0.05, hh: 0.025, hd: 0.07, mass: 0.5 },
    // Books
    'Comic Book':       { shape: 'box', hw: 0.05, hh: 0.008, hd: 0.07, mass: 0.2 },
    'Novel':            { shape: 'box', hw: 0.05, hh: 0.015, hd: 0.08, mass: 0.4 },
    'Self-Help Book':   { shape: 'box', hw: 0.06, hh: 0.015, hd: 0.08, mass: 0.4 },
    'Encyclopedia Set': { shape: 'box', hw: 0.06, hh: 0.06,  hd: 0.08, mass: 2.0 },
    // Gym
    'Sports Equipment': { shape: 'box', hw: 0.08, hh: 0.03,  hd: 0.03, mass: 2.0 },
    // Tickets
    'Concert Poster':   { shape: 'box', hw: 0.10, hh: 0.02,  hd: 0.02, mass: 0.2 },
    'Signed Merch':     { shape: 'box', hw: 0.06, hh: 0.04,  hd: 0.05, mass: 0.5 },
    // Electronics
    'Phone Case':       { shape: 'box', hw: 0.03, hh: 0.01,  hd: 0.06, mass: 0.15 },
    'Tablet':           { shape: 'box', hw: 0.07, hh: 0.008, hd: 0.10, mass: 0.6 },
    'Gaming Console':   { shape: 'box', hw: 0.09, hh: 0.025, hd: 0.06, mass: 1.5 },
    'Smartphone':       { shape: 'box', hw: 0.03, hh: 0.008, hd: 0.06, mass: 0.3 }
};

LIFE.physics.createItemBody = function(itemName, x, y, z, velocity) {
    if (!LIFE.physics.world) return null;
    var phys = LIFE.physics.ITEM_PHYSICS[itemName];
    if (!phys) phys = { shape: 'box', hw: 0.06, hh: 0.04, hd: 0.06, mass: 0.5 };

    // Items are rendered at scale 2x, so physics shapes match the visual size
    var scale = 2;
    var shape;
    if (phys.shape === 'sphere') {
        shape = new CANNON.Sphere(phys.radius * scale);
    } else {
        shape = new CANNON.Box(new CANNON.Vec3(phys.hw * scale, phys.hh * scale, phys.hd * scale));
    }

    var body = new CANNON.Body({
        mass: phys.mass,
        shape: shape,
        material: LIFE.physics.itemMat,
        linearDamping: 0.5,
        angularDamping: 0.7,
        sleepSpeedLimit: 0.3,
        sleepTimeLimit: 1.0
    });

    body.position.set(x, y, z);

    if (velocity) {
        body.velocity.set(velocity.x, velocity.y, velocity.z);
        // Randomized angular velocity for tumble effect on thrown items
        body.angularVelocity.set(
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5
        );
    }

    LIFE.physics.world.addBody(body);
    return body;
};

// ============================================================
// KINEMATIC BODY CREATION (for NPCs)
// ============================================================
LIFE.physics.createKinematicBody = function(radius, x, y, z) {
    if (!LIFE.physics.world) return null;
    var shape = new CANNON.Sphere(radius);
    var body = new CANNON.Body({
        mass: 0,
        shape: shape,
        material: LIFE.physics.kinematicMat,
        type: CANNON.Body.KINEMATIC,
        collisionFilterGroup: 4, // group 4: NPCs (excluded from ground raycast)
        collisionFilterMask: ~4  // collide with items/ground/walls, NOT other NPCs
    });
    body.position.set(x, y + radius, z);
    LIFE.physics.world.addBody(body);
    return body;
};

// ============================================================
// DYNAMIC PLAYER BODY (sphere collider, bottom = feet)
// ============================================================
LIFE.physics.createPlayerBody = function(height, x, y, z) {
    if (!LIFE.physics.world) return null;
    if (LIFE.physics._playerBody) {
        LIFE.physics.world.removeBody(LIFE.physics._playerBody);
    }
    var halfH = height / 2;
    var colliderR = halfH * 0.33; // 33% of half-height for tighter fit

    // Single sphere — bottom of sphere = feet
    var body = new CANNON.Body({
        mass: 5,
        shape: new CANNON.Sphere(colliderR),
        material: LIFE.physics.playerMat,
        linearDamping: 0.3,
        angularDamping: 1.0,
        fixedRotation: true
    });

    // Position sphere so its bottom = feet level
    body.position.set(x, y + colliderR, z);
    body.allowSleep = false;
    LIFE.physics.world.addBody(body);
    LIFE.physics._playerBody = body;
    LIFE.physics._playerRadius = colliderR;
    LIFE.physics._playerHalfH = colliderR; // offset from feet to body center
    return body;
};

// ============================================================
// PHYSICS STEP & SYNC
// ============================================================
LIFE.physics.step = function(dt) {
    if (!LIFE.physics.world) return;

    var pb = LIFE.physics._playerBody;
    var fixedStep = LIFE.physics._fixedStep;

    // --- Fixed-timestep accumulator (Unity-style) ---
    LIFE.physics._accumulator += dt;
    // Cap to prevent spiral of death
    if (LIFE.physics._accumulator > fixedStep * 4) LIFE.physics._accumulator = fixedStep * 4;

    // Step physics in fixed increments
    while (LIFE.physics._accumulator >= fixedStep) {
        // Before each substep, prev = where body is now
        if (pb) {
            LIFE.physics._prevPlayerPos.x = pb.position.x;
            LIFE.physics._prevPlayerPos.y = pb.position.y;
            LIFE.physics._prevPlayerPos.z = pb.position.z;
        }
        LIFE.physics.world.step(fixedStep);
        LIFE.physics._accumulator -= fixedStep;
    }

    // Current = where body landed after all substeps
    if (pb) {
        LIFE.physics._currPlayerPos.x = pb.position.x;
        LIFE.physics._currPlayerPos.y = pb.position.y;
        LIFE.physics._currPlayerPos.z = pb.position.z;
    }

    // Contact-based ground detection: check if player is resting on any surface
    LIFE.physics._playerOnSurface = false;
    if (pb) {
        var contacts = LIFE.physics.world.contacts;
        for (var ci = 0; ci < contacts.length; ci++) {
            var c = contacts[ci];
            if (c.bi === pb || c.bj === pb) {
                // Normal points from bi to bj; if player is bi, upward = -ni.y; if bj, upward = ni.y
                var upNormal = (c.bi === pb) ? -c.ni.y : c.ni.y;
                if (upNormal > 0.5) { // surface is roughly below player (normal points up)
                    LIFE.physics._playerOnSurface = true;
                    break;
                }
            }
        }
    }

    // Interpolation factor: how far into the next unstepped tick
    LIFE.physics._interpFactor = LIFE.physics._accumulator / fixedStep;

    // Sync dynamic bodies (items) from physics to mesh
    for (var i = 0; i < LIFE.physics.dynamicBodies.length; i++) {
        var entry = LIFE.physics.dynamicBodies[i];
        if (!entry.body || !entry.mesh) continue;

        entry.mesh.position.copy(entry.body.position);
        entry.mesh.quaternion.copy(entry.body.quaternion);

        // Keep ring flat on ground under item
        if (entry.ring) {
            entry.ring.position.set(
                entry.body.position.x,
                Math.max(0.02, entry.body.position.y - 0.15),
                entry.body.position.z
            );
        }
    }

    // Sync kinematic bodies from game position to physics
    for (var k = 0; k < LIFE.physics.kinematicBodies.length; k++) {
        var kb = LIFE.physics.kinematicBodies[k];
        if (!kb.body || !kb.getPosition) continue;
        var pos = kb.getPosition();
        if (pos) {
            kb.body.position.set(pos.x, pos.y + kb.radius, pos.z);
        }
    }

    // Non-active player sync (UI, cutscenes, held by parent)
    if (pb && LIFE.player) {
        var halfH = LIFE.physics._playerHalfH || 0.4;
        var s = LIFE.state;
        var active = s && (s.gamePhase === 'playing' || s.gamePhase === 'jail') &&
                     !s.inCar && !s.heldByParent && !s.deathTriggered &&
                     !(LIFE.dialogue && LIFE.dialogue.active && LIFE.dialogue.blocking) &&
                     !s.shopOpen && !s.friendsOpen;
        if (!active) {
            // Kinematic mode: body follows mesh
            pb.position.set(
                LIFE.player.group.position.x,
                LIFE.player.group.position.y + halfH,
                LIFE.player.group.position.z
            );
            pb.velocity.set(0, 0, 0);
            // Keep prev/curr in sync so interpolation doesn't drift
            LIFE.physics._prevPlayerPos.x = pb.position.x;
            LIFE.physics._prevPlayerPos.y = pb.position.y;
            LIFE.physics._prevPlayerPos.z = pb.position.z;
            LIFE.physics._currPlayerPos.x = pb.position.x;
            LIFE.physics._currPlayerPos.y = pb.position.y;
            LIFE.physics._currPlayerPos.z = pb.position.z;
        }
    }
};

// ============================================================
// RAYCAST GROUND DETECTION
// ============================================================
LIFE.physics._rayFrom = new CANNON.Vec3();
LIFE.physics._rayTo = new CANNON.Vec3();
LIFE.physics._rayResult = new CANNON.RaycastResult();

// y should be BELOW the player sphere (call with feetY - 0.05)
// so the ray doesn't hit the player's own body
LIFE.physics.raycastGround = function(x, y, z) {
    if (!LIFE.physics.world) return 0;
    LIFE.physics._rayFrom.set(x, y, z);
    LIFE.physics._rayTo.set(x, y - 5, z);
    LIFE.physics._rayResult.reset();
    var hit = LIFE.physics.world.raycastClosest(
        LIFE.physics._rayFrom,
        LIFE.physics._rayTo,
        { skipBackfaces: true, collisionFilterMask: ~4 },
        LIFE.physics._rayResult
    );
    if (hit) {
        return LIFE.physics._rayResult.hitPointWorld.y;
    }
    return 0;
};

// ============================================================
// CLEANUP
// ============================================================
LIFE.physics.removeBody = function(body) {
    if (!body || !LIFE.physics.world) return;
    LIFE.physics.world.removeBody(body);
};

LIFE.physics.removeDynamic = function(entry) {
    if (!entry) return;
    if (entry.body) LIFE.physics.removeBody(entry.body);
    var idx = LIFE.physics.dynamicBodies.indexOf(entry);
    if (idx >= 0) LIFE.physics.dynamicBodies.splice(idx, 1);
};

LIFE.physics.clearStatic = function() {
    if (!LIFE.physics.world) return;
    for (var i = 0; i < LIFE.physics.staticBodies.length; i++) {
        LIFE.physics.world.removeBody(LIFE.physics.staticBodies[i]);
    }
    LIFE.physics.staticBodies = [];
};

LIFE.physics.clearZoneBodies = function() {
    if (!LIFE.physics.world) return;
    for (var i = 0; i < LIFE.physics.zoneBodies.length; i++) {
        LIFE.physics.world.removeBody(LIFE.physics.zoneBodies[i]);
    }
    LIFE.physics.zoneBodies = [];
};

// Temporarily remove zone bodies from the physics world (for interiors)
LIFE.physics.disableZoneBodies = function() {
    if (!LIFE.physics.world) return;
    for (var i = 0; i < LIFE.physics.zoneBodies.length; i++) {
        LIFE.physics.world.removeBody(LIFE.physics.zoneBodies[i]);
    }
};

// Re-add zone bodies to the physics world (after leaving interiors)
LIFE.physics.enableZoneBodies = function() {
    if (!LIFE.physics.world) return;
    for (var i = 0; i < LIFE.physics.zoneBodies.length; i++) {
        // Only add back if not already in world
        var inWorld = false;
        for (var j = 0; j < LIFE.physics.world.bodies.length; j++) {
            if (LIFE.physics.world.bodies[j] === LIFE.physics.zoneBodies[i]) { inWorld = true; break; }
        }
        if (!inWorld) LIFE.physics.world.addBody(LIFE.physics.zoneBodies[i]);
    }
};

LIFE.physics.clearDynamic = function() {
    if (!LIFE.physics.world) return;
    for (var i = 0; i < LIFE.physics.dynamicBodies.length; i++) {
        if (LIFE.physics.dynamicBodies[i].body) {
            LIFE.physics.world.removeBody(LIFE.physics.dynamicBodies[i].body);
        }
    }
    LIFE.physics.dynamicBodies = [];
};

LIFE.physics.clearKinematic = function() {
    if (!LIFE.physics.world) return;
    for (var i = 0; i < LIFE.physics.kinematicBodies.length; i++) {
        if (LIFE.physics.kinematicBodies[i].body) {
            LIFE.physics.world.removeBody(LIFE.physics.kinematicBodies[i].body);
        }
    }
    LIFE.physics.kinematicBodies = [];
};

LIFE.physics.clear = function() {
    LIFE.physics.clearStatic();
    LIFE.physics.clearZoneBodies();
    LIFE.physics.clearDynamic();
    LIFE.physics.clearKinematic();
    // Re-add the ground plane
    if (LIFE.physics._groundPlane) {
        var inWorld = false;
        for (var i = 0; i < LIFE.physics.world.bodies.length; i++) {
            if (LIFE.physics.world.bodies[i] === LIFE.physics._groundPlane) { inWorld = true; break; }
        }
        if (!inWorld) LIFE.physics.world.addBody(LIFE.physics._groundPlane);
    }
};

// Initialize physics on load
LIFE.physics.init();
