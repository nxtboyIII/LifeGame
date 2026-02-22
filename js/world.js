// ============================================================
// OPEN WORLD SYSTEM
// ============================================================

// Zone definitions: outdoor zones placed at fixed world positions
LIFE.ZONE_DEFS = {
    home:       { cx: 0,    cz: 0,    radius: 30, builder: 'buildHome' },
    school:     { cx: 0,    cz: -150, radius: 40, builder: 'buildSchool' },
    highschool: { cx: 120,  cz: -150, radius: 40, builder: 'buildHighSchool' },
    college:    { cx: -120, cz: 150,  radius: 50, builder: 'buildCollege' },
    city:       { cx: 0,    cz: 150,  radius: 60, builder: 'buildCity' },
    retirement: { cx: 180,  cz: 0,    radius: 40, builder: 'buildRetirement' },
    dealership: { cx: 90,   cz: 60,   radius: 25, builder: 'buildDealership' },
    eventcenter:{ cx: -80,  cz: -80,  radius: 35, builder: 'buildEventCenter' }
};

// Interior-only stages (built on-demand, not in persistent world)
LIFE.INTERIOR_STAGES = {
    classroom: true, hsclassroom: true, playerhome: true,
    hospital: true, jail: true, execution: true,
    womb: true, death: true, nursery: true
};

// World state
LIFE.world = {
    zones: {},           // name -> { group, colliders, npcs, center, radius }
    built: false,
    insideInterior: null,
    worldGround: null,
    doors: [],
    _cullingTimer: 0,
    _currentZone: null,
    _zonePopupName: null,
    _savedPlayerPos: null
};

// ============================================================
// ZONE BUILD REDIRECT SYSTEM
// ============================================================
LIFE.world.beginZoneBuild = function(name) {
    var def = LIFE.ZONE_DEFS[name];
    if (!def) return;

    var group = new THREE.Group();
    group.position.set(def.cx, 0, def.cz);

    var zone = {
        group: group,
        colliders: [],
        npcs: [],
        center: new THREE.Vector3(def.cx, 0, def.cz),
        radius: def.radius
    };

    // Save originals
    LIFE.world._origAddEnv = LIFE.addEnv;
    LIFE.world._origAddCollider = LIFE.addCollider;
    LIFE.world._origClearEnv = LIFE.clearEnvironment;

    // Override addEnv -> add to zone group (NOT envObjects)
    LIFE.addEnv = function(obj) {
        group.add(obj);
        return obj;
    };

    // Override addCollider -> offset to world space, store in zone
    LIFE.addCollider = function(x, z, w, d) {
        zone.colliders.push({
            minX: (x + def.cx) - w / 2,
            maxX: (x + def.cx) + w / 2,
            minZ: (z + def.cz) - d / 2,
            maxZ: (z + def.cz) + d / 2
        });
    };

    // Override clearEnvironment to no-op during zone build
    LIFE.clearEnvironment = function() {};

    LIFE.world._currentBuildZone = zone;
    LIFE.world._currentBuildName = name;
};

LIFE.world.endZoneBuild = function(name) {
    var zone = LIFE.world._currentBuildZone;
    if (!zone) return;

    LIFE.world.zones[name] = zone;
    LIFE.scene.add(zone.group);

    // Restore originals
    LIFE.addEnv = LIFE.world._origAddEnv;
    LIFE.addCollider = LIFE.world._origAddCollider;
    LIFE.clearEnvironment = LIFE.world._origClearEnv;

    LIFE.world._currentBuildZone = null;
    LIFE.world._currentBuildName = null;
};

// ============================================================
// BUILD WORLD
// ============================================================
LIFE.world.buildWorld = function() {
    // Large world ground plane
    var worldGround = new THREE.Mesh(
        new THREE.PlaneGeometry(800, 800),
        new THREE.MeshPhongMaterial({ color: 0x4a7c3f })
    );
    worldGround.rotation.x = -Math.PI / 2;
    worldGround.position.y = -0.15;
    worldGround.receiveShadow = true;
    LIFE.scene.add(worldGround);
    LIFE.world.worldGround = worldGround;

    // Build each outdoor zone
    var zoneNames = Object.keys(LIFE.ZONE_DEFS);
    for (var i = 0; i < zoneNames.length; i++) {
        var name = zoneNames[i];
        var def = LIFE.ZONE_DEFS[name];
        if (!def.builder || !LIFE[def.builder]) continue;

        LIFE.world.beginZoneBuild(name);
        LIFE[def.builder]();
        LIFE.world.endZoneBuild(name);
    }

    // Hospital exterior (building shell only)
    LIFE.world.buildHospitalExterior();

    // Roads connecting zones
    LIFE.world.buildRoads();

    // Register doors
    LIFE.world.registerDoors();

    LIFE.world.built = true;

    // Set scene atmosphere for open world
    LIFE.scene.fog.near = 50;
    LIFE.scene.fog.far = 200;

    // Spawn parked car if player owns one
    if (LIFE.state.ownedCar) {
        LIFE.spawnParkedCar();
    }
};

// ============================================================
// HOSPITAL EXTERIOR (building shell in world)
// ============================================================
LIFE.world.buildHospitalExterior = function() {
    var cx = -150, cz = 0;
    var group = new THREE.Group();
    group.position.set(cx, 0, cz);

    // Ground patch
    var ground = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 40),
        new THREE.MeshPhongMaterial({ color: 0xe0e0e0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0.01;
    ground.receiveShadow = true;
    group.add(ground);

    // Hospital building body
    var body = LIFE.makeBox(12, 8, 10, 0xfafafa, 0, 4, 0);
    group.add(body);
    // Roof
    group.add(LIFE.makeBox(13, 0.3, 11, 0xeceff1, 0, 8.15, 0));

    // Windows
    var winMat = new THREE.MeshPhongMaterial({ color: 0xbbdefb, emissive: 0x445566, emissiveIntensity: 0.3 });
    for (var wy = 3; wy < 7; wy += 2) {
        for (var wx = -4; wx <= 4; wx += 2) {
            var w1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.1), winMat);
            w1.position.set(wx, wy, 5.06);
            group.add(w1);
            var w2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.1), winMat);
            w2.position.set(wx, wy, -5.06);
            group.add(w2);
        }
    }

    // Red cross on front
    group.add(LIFE.makeBox(1.5, 0.15, 0.1, 0xf44336, 0, 6, 5.1));
    group.add(LIFE.makeBox(0.15, 1.5, 0.1, 0xf44336, 0, 6, 5.1));

    // Door
    group.add(LIFE.makeBox(2, 3.5, 0.2, 0x5d4037, 0, 1.75, 5.1));

    // Hospital sign
    var signCanvas = document.createElement('canvas');
    signCanvas.width = 256; signCanvas.height = 64;
    var ctx = signCanvas.getContext('2d');
    ctx.fillStyle = 'rgba(76,175,80,0.8)';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('HOSPITAL', 128, 42);
    var tex = new THREE.CanvasTexture(signCanvas);
    var sign = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    sign.position.set(0, 9.5, 5.1);
    sign.scale.set(3, 0.75, 1);
    group.add(sign);

    // Enter prompt
    var enterCanvas = document.createElement('canvas');
    enterCanvas.width = 256; enterCanvas.height = 48;
    var ectx = enterCanvas.getContext('2d');
    ectx.fillStyle = 'rgba(76,175,80,0.9)';
    ectx.fillRect(0, 0, 256, 48);
    ectx.fillStyle = '#fff';
    ectx.font = 'bold 20px Arial';
    ectx.textAlign = 'center';
    ectx.fillText('Press G to Enter', 128, 32);
    var etex = new THREE.CanvasTexture(enterCanvas);
    var enterSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: etex, transparent: true, depthTest: false }));
    enterSprite.position.set(0, 4, 5.5);
    enterSprite.scale.set(2.5, 0.5, 1);
    group.add(enterSprite);

    LIFE.scene.add(group);

    // Store as zone
    LIFE.world.zones['hospital_ext'] = {
        group: group,
        colliders: [{
            minX: cx - 6, maxX: cx + 6,
            minZ: cz - 5, maxZ: cz + 5
        }],
        npcs: [],
        center: new THREE.Vector3(cx, 0, cz),
        radius: 15
    };
};

// ============================================================
// ROADS (spline-based)
// ============================================================

// Build a flat road mesh from an array of {x, z} waypoints using CatmullRom spline
LIFE.world._buildSplineRoad = function(waypoints, width, yHeight, mat, segments, group) {
    // Convert waypoints to 3D points for CatmullRomCurve3
    var pts3 = [];
    for (var i = 0; i < waypoints.length; i++) {
        pts3.push(new THREE.Vector3(waypoints[i].x, 0, waypoints[i].z));
    }
    var curve = new THREE.CatmullRomCurve3(pts3, false, 'catmullrom', 0.5);
    var samples = curve.getSpacedPoints(segments);

    // Build road strip geometry
    var halfW = width / 2;
    var verts = [];
    var indices = [];
    var uvs = [];

    for (var s = 0; s < samples.length; s++) {
        var p = samples[s];
        // tangent direction (use next/prev to approximate)
        var tx, tz;
        if (s < samples.length - 1) {
            tx = samples[s + 1].x - p.x;
            tz = samples[s + 1].z - p.z;
        } else {
            tx = p.x - samples[s - 1].x;
            tz = p.z - samples[s - 1].z;
        }
        // normalize tangent
        var tLen = Math.sqrt(tx * tx + tz * tz);
        if (tLen < 0.001) { tx = 0; tz = 1; tLen = 1; }
        tx /= tLen; tz /= tLen;
        // perpendicular (right-hand) in XZ plane
        var px = -tz, pz = tx;

        // left and right vertices
        verts.push(p.x + px * halfW, yHeight, p.z + pz * halfW);
        verts.push(p.x - px * halfW, yHeight, p.z - pz * halfW);

        var v = s / (samples.length - 1);
        uvs.push(0, v);
        uvs.push(1, v);

        if (s < samples.length - 1) {
            var base = s * 2;
            indices.push(base, base + 1, base + 2);
            indices.push(base + 1, base + 3, base + 2);
        }
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    var mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    group.add(mesh);

    return { curve: curve, samples: samples };
};

// Build dashed center line along a spline
LIFE.world._buildSplineLine = function(curve, yHeight, dashLen, gapLen, lineWidth, mat, group) {
    var totalLen = curve.getLength();
    var pos = 0;
    while (pos < totalLen) {
        var t1 = pos / totalLen;
        var t2 = Math.min((pos + dashLen) / totalLen, 1);
        var p1 = curve.getPointAt(t1);
        var p2 = curve.getPointAt(t2);
        var dx = p2.x - p1.x, dz = p2.z - p1.z;
        var len = Math.sqrt(dx * dx + dz * dz);
        if (len > 0.1) {
            var cx = (p1.x + p2.x) / 2;
            var cz = (p1.z + p2.z) / 2;
            var angle = Math.atan2(dx, dz);
            var dash = new THREE.Mesh(
                new THREE.BoxGeometry(lineWidth, 0.02, len),
                mat
            );
            dash.position.set(cx, yHeight, cz);
            dash.rotation.y = angle;
            group.add(dash);
        }
        pos += dashLen + gapLen;
    }
};

LIFE.world.buildRoads = function() {
    var roadMat = new THREE.MeshPhongMaterial({ color: 0x333333, side: THREE.DoubleSide });
    var pathMat = new THREE.MeshPhongMaterial({ color: 0xbdbdbd, side: THREE.DoubleSide });
    var lineMat = new THREE.MeshPhongMaterial({ color: 0xffeb3b });
    var sideLineMat = new THREE.MeshPhongMaterial({ color: 0xeeeeee });

    var roads = new THREE.Group();

    // y layers: world ground -0.15, zone grounds 0.01, paths 0.04, roads 0.06, lines 0.08
    var roadY = 0.06;
    var lineY = 0.08;
    var pathY = 0.04;
    var segs = 60; // spline sample count per road

    // Zone centers for reference:
    // home(0,0)  school(0,-150)  highschool(120,-150)  college(-120,150)
    // city(0,150)  retirement(180,0)  dealership(90,60)  hospital(-150,0)

    // =====================================================
    // MAIN ROADS (wide, with center lines and edge lines)
    // =====================================================

    // 1) Home → School: gentle S-curve heading north
    var r1 = LIFE.world._buildSplineRoad([
        { x: 0, z: -5 },
        { x: -8, z: -40 },
        { x: 5, z: -90 },
        { x: -5, z: -120 },
        { x: 0, z: -145 }
    ], 6, roadY, roadMat, segs, roads);
    LIFE.world._buildSplineLine(r1.curve, lineY, 3, 2, 0.2, lineMat, roads);

    // 2) Home → City: sweeping south
    var r2 = LIFE.world._buildSplineRoad([
        { x: 0, z: 5 },
        { x: 8, z: 50 },
        { x: -5, z: 100 },
        { x: 0, z: 145 }
    ], 6, roadY, roadMat, segs, roads);
    LIFE.world._buildSplineLine(r2.curve, lineY, 3, 2, 0.2, lineMat, roads);

    // 3) School → High School: curved east along the top
    var r3 = LIFE.world._buildSplineRoad([
        { x: 5, z: -150 },
        { x: 35, z: -160 },
        { x: 70, z: -155 },
        { x: 100, z: -158 },
        { x: 115, z: -150 }
    ], 6, roadY, roadMat, segs, roads);
    LIFE.world._buildSplineLine(r3.curve, lineY, 3, 2, 0.2, lineMat, roads);

    // 4) Home → Hospital: winding west
    var r4 = LIFE.world._buildSplineRoad([
        { x: -5, z: 0 },
        { x: -40, z: 8 },
        { x: -80, z: -5 },
        { x: -120, z: 5 },
        { x: -145, z: 5 }
    ], 6, roadY, roadMat, segs, roads);
    LIFE.world._buildSplineLine(r4.curve, lineY, 3, 2, 0.2, lineMat, roads);

    // 5) Home → Retirement: scenic road curving east
    var r5 = LIFE.world._buildSplineRoad([
        { x: 5, z: 0 },
        { x: 40, z: -10 },
        { x: 80, z: 5 },
        { x: 130, z: -8 },
        { x: 175, z: 0 }
    ], 6, roadY, roadMat, segs, roads);
    LIFE.world._buildSplineLine(r5.curve, lineY, 3, 2, 0.2, lineMat, roads);

    // 6) City → College: curving southwest
    var r6 = LIFE.world._buildSplineRoad([
        { x: -5, z: 150 },
        { x: -40, z: 160 },
        { x: -80, z: 155 },
        { x: -115, z: 150 }
    ], 6, roadY, roadMat, segs, roads);
    LIFE.world._buildSplineLine(r6.curve, lineY, 3, 2, 0.2, lineMat, roads);

    // 7) Home area → Dealership: road branching east then south
    var r7 = LIFE.world._buildSplineRoad([
        { x: 15, z: 5 },
        { x: 40, z: 15 },
        { x: 65, z: 35 },
        { x: 85, z: 55 }
    ], 5, roadY, roadMat, 40, roads);
    LIFE.world._buildSplineLine(r7.curve, lineY, 2.5, 2, 0.15, lineMat, roads);

    // =====================================================
    // SECONDARY PATHS (narrower, lighter color, no dashes)
    // =====================================================

    // 8) High School → Retirement: long scenic path curving south-east
    LIFE.world._buildSplineRoad([
        { x: 125, z: -145 },
        { x: 140, z: -110 },
        { x: 155, z: -60 },
        { x: 170, z: -20 },
        { x: 178, z: -5 }
    ], 3, pathY, pathMat, 50, roads);

    // 9) Hospital → College: western connector path
    LIFE.world._buildSplineRoad([
        { x: -150, z: 5 },
        { x: -145, z: 40 },
        { x: -140, z: 80 },
        { x: -130, z: 120 },
        { x: -120, z: 145 }
    ], 3, pathY, pathMat, 50, roads);

    // 10) Dealership → Retirement: east path
    LIFE.world._buildSplineRoad([
        { x: 95, z: 60 },
        { x: 120, z: 50 },
        { x: 150, z: 30 },
        { x: 175, z: 5 }
    ], 3, pathY, pathMat, 40, roads);

    // 11) City → Dealership: short connector
    LIFE.world._buildSplineRoad([
        { x: 5, z: 145 },
        { x: 30, z: 120 },
        { x: 60, z: 90 },
        { x: 85, z: 65 }
    ], 3, pathY, pathMat, 35, roads);

    // 12) School → Hospital: northern cross-path
    LIFE.world._buildSplineRoad([
        { x: -5, z: -145 },
        { x: -30, z: -120 },
        { x: -60, z: -80 },
        { x: -100, z: -40 },
        { x: -140, z: -10 },
        { x: -148, z: 0 }
    ], 3, pathY, pathMat, 50, roads);

    // 13) Home → Event Center: winding northwest road
    var r13 = LIFE.world._buildSplineRoad([
        { x: -8, z: -5 },
        { x: -25, z: -20 },
        { x: -50, z: -45 },
        { x: -70, z: -65 },
        { x: -78, z: -78 }
    ], 5, roadY, roadMat, 45, roads);
    LIFE.world._buildSplineLine(r13.curve, lineY, 2.5, 2, 0.15, lineMat, roads);

    // 14) Event Center → School: connector path
    LIFE.world._buildSplineRoad([
        { x: -75, z: -90 },
        { x: -55, z: -110 },
        { x: -30, z: -130 },
        { x: -10, z: -145 }
    ], 3, pathY, pathMat, 40, roads);

    LIFE.scene.add(roads);
    LIFE.world._roadsGroup = roads;
};

// ============================================================
// DOORS REGISTRY
// ============================================================
LIFE.world.registerDoors = function() {
    LIFE.world.doors = [
        // School door - front of school building (local 0, -11.2 -> world 0, -161.2)
        { x: 0, z: -161, interior: 'classroom', label: 'School', exitX: 0, exitZ: -159 },
        // High school door (local 0, -13.2 -> world 120, -163.2)
        { x: 120, z: -163, interior: 'hsclassroom', label: 'High School', exitX: 120, exitZ: -161 },
        // Hospital door (local 0, 5.1 -> world -150, 5.1)
        { x: -150, z: 5, interior: 'hospital', label: 'Hospital', exitX: -150, exitZ: 7 }
    ];
};

LIFE.world.tryEnterDoor = function() {
    if (!LIFE.player) return;
    var px = LIFE.player.group.position.x;
    var pz = LIFE.player.group.position.z;

    for (var i = 0; i < LIFE.world.doors.length; i++) {
        var door = LIFE.world.doors[i];
        var dx = px - door.x;
        var dz = pz - door.z;
        var dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 6) {
            // Determine correct interior based on door and age
            var interior = door.interior;
            if (interior === 'classroom') {
                interior = LIFE.state.age >= 12 ? 'hsclassroom' : 'classroom';
            }
            LIFE.world.enterInterior(interior, door);
            return true;
        }
    }

    // Check home door in city zone (dynamic based on property ownership)
    if (LIFE.state.homeDoor) {
        var cityDef = LIFE.ZONE_DEFS.city;
        var worldDoorX = LIFE.state.homeDoor.x + cityDef.cx;
        var worldDoorZ = LIFE.state.homeDoor.z + cityDef.cz;
        var hdx = px - worldDoorX;
        var hdz = pz - worldDoorZ;
        if (Math.sqrt(hdx * hdx + hdz * hdz) < 6) {
            LIFE.world._savedPlayerPos = { x: worldDoorX, z: worldDoorZ + 2 };
            LIFE.world.enterInterior('playerhome');
            return true;
        }
    }

    LIFE.ui.showPopup('No door nearby (G)', '#ff9800');
    return false;
};

// ============================================================
// INTERIOR ENTER / EXIT
// ============================================================
LIFE.world.enterInterior = function(name, door) {
    if (LIFE.world.insideInterior) return; // already inside

    // Save player world position for return
    if (!LIFE.world._savedPlayerPos && LIFE.player) {
        LIFE.world._savedPlayerPos = {
            x: LIFE.player.group.position.x,
            z: LIFE.player.group.position.z
        };
    }
    if (door) {
        LIFE.world._savedPlayerPos = { x: door.exitX, z: door.exitZ };
    }

    // Hide all world zone groups + world ground
    LIFE.world.hideAllZones();

    // Clear any lingering envObjects and colliders
    LIFE.clearEnvironment();

    // Build interior using existing builder
    var cfg = LIFE.STAGES[name];
    if (cfg) {
        LIFE.scene.background.set(cfg.bg);
        LIFE.scene.fog.color.set(cfg.fog[0]);
        LIFE.scene.fog.near = cfg.fog[1];
        LIFE.scene.fog.far = cfg.fog[2];
    }
    LIFE.state.bounds = LIFE.getBoundsForStage(name);

    var builders = {
        classroom: LIFE.buildClassroom,
        hsclassroom: LIFE.buildHSClassroom,
        playerhome: LIFE.buildPlayerHome,
        hospital: LIFE.buildHospital
    };
    if (builders[name]) builders[name]();

    LIFE.world.insideInterior = name;

    // Spawn NPCs for interior
    LIFE.spawnNPCs(name);
    LIFE.updatePlayerSize();
    LIFE.player.group.position.set(0, 0, 3);

    LIFE.ambientLight.intensity = 0.5;
    LIFE.dirLight.intensity = 0.8;
};

LIFE.world.exitInterior = function() {
    if (!LIFE.world.insideInterior) return;

    // Clear interior objects
    LIFE.clearEnvironment();

    // Restore world zones
    LIFE.world.showNearbyZones();

    // Restore open world atmosphere
    LIFE.scene.background.set(0x87ceeb);
    LIFE.scene.fog.color.set(0x87ceeb);
    LIFE.scene.fog.near = 50;
    LIFE.scene.fog.far = 200;

    LIFE.world.insideInterior = null;

    // Restore bounds (no clamping in open world)
    LIFE.state.bounds = 400;

    // Teleport player to saved position (door exit)
    if (LIFE.world._savedPlayerPos && LIFE.player) {
        LIFE.player.group.position.set(
            LIFE.world._savedPlayerPos.x, 0,
            LIFE.world._savedPlayerPos.z
        );
    }
    LIFE.world._savedPlayerPos = null;

    // Rebuild active NPC list from nearby zones
    LIFE.world.refreshNearbyNPCs();

    LIFE.updatePlayerSize();
};

// ============================================================
// ZONE VISIBILITY
// ============================================================
LIFE.world.hideAllZones = function() {
    for (var name in LIFE.world.zones) {
        LIFE.world.zones[name].group.visible = false;
    }
    if (LIFE.world.worldGround) LIFE.world.worldGround.visible = false;
    if (LIFE.world._roadsGroup) LIFE.world._roadsGroup.visible = false;
    if (LIFE.car.parkedModel) LIFE.car.parkedModel.visible = false;
};

LIFE.world.showNearbyZones = function() {
    if (LIFE.world.worldGround) LIFE.world.worldGround.visible = true;
    if (LIFE.world._roadsGroup) LIFE.world._roadsGroup.visible = true;
    // Show all, culling will hide distant ones next tick
    for (var name in LIFE.world.zones) {
        LIFE.world.zones[name].group.visible = true;
    }
    if (LIFE.car.parkedModel) LIFE.car.parkedModel.visible = true;
};

// ============================================================
// DISTANCE-BASED CULLING
// ============================================================
LIFE.world.updateCulling = function(dt) {
    if (!LIFE.world.built || LIFE.world.insideInterior) return;

    LIFE.world._cullingTimer += dt;
    if (LIFE.world._cullingTimer < 0.5) return;
    LIFE.world._cullingTimer = 0;

    if (!LIFE.player) return;
    var px = LIFE.player.group.position.x;
    var pz = LIFE.player.group.position.z;

    // Get current hour for time-of-day NPC behavior
    var sim = LIFE.getSimDate ? LIFE.getSimDate() : null;
    var hour = sim ? sim.hour : 12;
    var isNight = hour >= 22 || hour < 6;
    var isEarlyMorning = hour >= 6 && hour < 8;
    var isLateEvening = hour >= 20 && hour < 22;

    for (var name in LIFE.world.zones) {
        var zone = LIFE.world.zones[name];
        var dx = px - zone.center.x;
        var dz = pz - zone.center.z;
        var dist = Math.sqrt(dx * dx + dz * dz);

        // Hysteresis: show < 120, hide > 140
        if (zone.group.visible) {
            if (dist > 140) zone.group.visible = false;
        } else {
            if (dist < 120) zone.group.visible = true;
        }

        // Show/hide zone NPCs based on visibility + time of day
        if (zone.npcs) {
            for (var ni = 0; ni < zone.npcs.length; ni++) {
                var npc = zone.npcs[ni];
                if (npc.char && npc.char.group) {
                    var timeVisible = true;
                    if (isNight) {
                        timeVisible = !!npc._nightActive;
                    } else if (isEarlyMorning || isLateEvening) {
                        // partial: some sleepers still hidden
                        timeVisible = npc._nightActive || npc._earlyBird;
                    }
                    npc.char.group.visible = zone.group.visible && npc.alive && timeVisible;
                }
            }
        }
    }

    // Detect which zone player is in and show popup
    LIFE.world.detectZone(px, pz);

    // Refresh LIFE.npcs from nearby zones
    LIFE.world.refreshNearbyNPCs();
};

// ============================================================
// ZONE DETECTION
// ============================================================
LIFE.world.detectZone = function(px, pz) {
    var closestZone = null;
    var closestDist = Infinity;

    for (var name in LIFE.ZONE_DEFS) {
        var def = LIFE.ZONE_DEFS[name];
        var dx = px - def.cx;
        var dz = pz - def.cz;
        var dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < def.radius && dist < closestDist) {
            closestDist = dist;
            closestZone = name;
        }
    }
    // Also check hospital exterior
    if (Math.sqrt((px + 150) * (px + 150) + pz * pz) < 15) {
        closestZone = 'hospital_ext';
    }

    if (closestZone !== LIFE.world._currentZone) {
        LIFE.world._currentZone = closestZone;
        if (closestZone) {
            var labels = {
                home: 'Home', school: 'Elementary School', highschool: 'High School',
                college: 'University', city: 'City', retirement: 'Retirement Community',
                hospital_ext: 'Hospital', dealership: 'Auto Dealership',
                eventcenter: 'Event Center'
            };
            LIFE.world.showZonePopup(labels[closestZone] || closestZone);
        }
    }
};

LIFE.world.showZonePopup = function(text) {
    var el = document.getElementById('zonePopup');
    if (!el) return;
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(LIFE.world._zonePopupTimeout);
    LIFE.world._zonePopupTimeout = setTimeout(function() {
        el.classList.remove('show');
    }, 2500);
};

// ============================================================
// NPC MANAGEMENT
// ============================================================
LIFE.world.spawnZoneNPCs = function(zoneName) {
    var def = LIFE.ZONE_DEFS[zoneName];
    if (!def) return;
    var zone = LIFE.world.zones[zoneName];
    if (!zone) return;

    // Remove old NPCs from this zone
    if (zone.npcs) {
        for (var i = 0; i < zone.npcs.length; i++) {
            LIFE.scene.remove(zone.npcs[i].char.group);
        }
    }
    zone.npcs = [];

    var names = (LIFE.NPC_NAMES[zoneName] || []).slice();
    var state = LIFE.state;

    // Dynamic family NPCs
    var familyZones = { city: true, retirement: true, home: true };
    if (familyZones[zoneName] && state.married && state.age >= 20) names.push('Spouse');
    if (familyZones[zoneName] && state.hasKids) {
        var kidsToShow = Math.min(state.childCount || 1, 3);
        for (var ki = 0; ki < kidsToShow; ki++) {
            names.push('Your Child');
        }
    }

    // Dynamic work NPCs in city
    if (zoneName === 'city') {
        var career = state.career;
        if (career && career !== 'none') {
            names.push('Coworker');
            names.push('Coworker');
            names.push('Boss');
        }
    }

    var b = def.radius * 0.6;
    var usedNames = {};
    var childIndex = 0;

    for (var ni = 0; ni < names.length; ni++) {
        var npcType = names[ni];
        var x, z, safe, tries = 0;
        do {
            x = def.cx + (Math.random() - 0.5) * b * 2;
            z = def.cz + (Math.random() - 0.5) * b * 2;
            safe = true;
            // Check against zone colliders
            for (var ci = 0; ci < zone.colliders.length; ci++) {
                var c = zone.colliders[ci];
                if (x > c.minX - 0.5 && x < c.maxX + 0.5 && z > c.minZ - 0.5 && z < c.maxZ + 0.5) {
                    safe = false; break;
                }
            }
            // Don't spawn too close to zone center (where player might be)
            var cdx = x - def.cx, cdz = z - def.cz;
            if (Math.sqrt(cdx * cdx + cdz * cdz) < 3) safe = false;
            tries++;
        } while (!safe && tries < 30);

        // Pre-determine gender
        var npcFemale;
        if (npcType === 'Mom') npcFemale = true;
        else if (npcType === 'Dad') npcFemale = false;
        else if (npcType === 'Spouse') npcFemale = state.playerGender !== 'F';
        else if (npcType === 'Your Child') npcFemale = Math.random() < 0.5;
        else if (npcType === 'Police' || npcType === 'Dealer' || npcType === 'Inmate' || npcType === 'Gym Trainer') npcFemale = false;
        else npcFemale = Math.random() < 0.5;

        var individualName = npcType;
        if (npcType === 'Spouse' && state.spouseName) {
            individualName = state.spouseName;
        } else if (npcType === 'Your Child' && state.childNames && state.childNames[childIndex]) {
            individualName = state.childNames[childIndex];
            childIndex++;
        } else if (LIFE.NPC_NEEDS_NAME[npcType]) {
            var pool = npcFemale ? LIFE.FEMALE_NAMES : LIFE.MALE_NAMES;
            var attempts = 0;
            do {
                individualName = pool[Math.floor(Math.random() * pool.length)];
                attempts++;
            } while (usedNames[individualName] && attempts < 50);
            usedNames[individualName] = true;
        }

        var npc = LIFE.createNPC(npcType, x, z, individualName, npcFemale);
        npc._zoneCenter = new THREE.Vector3(def.cx, 0, def.cz);
        npc._zoneRadius = def.radius;

        // Time-of-day behavior: who stays out at night?
        var alwaysActive = { 'Police': true, 'Dealer': true };
        var nightOwlTypes = { 'Stranger': true, 'Inmate': true };
        if (alwaysActive[npcType]) {
            npc._nightActive = true;
            npc._earlyBird = true;
        } else if (nightOwlTypes[npcType]) {
            npc._nightActive = Math.random() < 0.5;
            npc._earlyBird = true;
        } else if (npc.isVendor || npc.isCarSalesman) {
            // Vendors active during business hours (earlyBird), closed at night
            npc._nightActive = false;
            npc._earlyBird = true;
        } else {
            // Most NPCs sleep at night, ~20% are night owls
            npc._nightActive = Math.random() < 0.15;
            npc._earlyBird = Math.random() < 0.5;
        }

        zone.npcs.push(npc);
    }

    // Spawn Hiring Manager NPCs near job buildings in city
    if (zoneName === 'city' && LIFE.JOB_BUILDINGS) {
        var cityDef = LIFE.ZONE_DEFS.city;
        LIFE.JOB_BUILDINGS.forEach(function(jb) {
            var hireNPC = LIFE.createNPC('Hiring ' + jb.label,
                jb.x + cityDef.cx, jb.z + cityDef.cz + 6);
            hireNPC.careerType = jb.career;
            hireNPC._zoneCenter = new THREE.Vector3(cityDef.cx, 0, cityDef.cz);
            hireNPC._zoneRadius = cityDef.radius;
            hireNPC.stayNear = new THREE.Vector3(jb.x + cityDef.cx, 0, jb.z + cityDef.cz);
            hireNPC._nightActive = false;
            hireNPC._earlyBird = true;
            zone.npcs.push(hireNPC);
        });
    }
};

LIFE.world.refreshNearbyNPCs = function() {
    if (!LIFE.world.built || LIFE.world.insideInterior) return;
    if (!LIFE.player) return;

    var px = LIFE.player.group.position.x;
    var pz = LIFE.player.group.position.z;
    var result = [];

    for (var name in LIFE.world.zones) {
        var zone = LIFE.world.zones[name];
        if (!zone.npcs || !zone.group.visible) continue;
        var dx = px - zone.center.x;
        var dz = pz - zone.center.z;
        var dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < zone.radius + 30) {
            for (var i = 0; i < zone.npcs.length; i++) {
                var npc = zone.npcs[i];
                // Only include visible NPCs (respects time-of-day hiding)
                if (npc.char && npc.char.group && npc.char.group.visible) {
                    result.push(npc);
                }
            }
        }
    }

    LIFE.npcs = result;
};

LIFE.world.spawnAllZoneNPCs = function() {
    for (var name in LIFE.ZONE_DEFS) {
        if (LIFE.world.zones[name]) {
            LIFE.world.spawnZoneNPCs(name);
        }
    }
};

// ============================================================
// ACTIVE COLLIDERS (from nearby zones only)
// ============================================================
LIFE.world.getActiveColliders = function() {
    if (!LIFE.player) return [];
    var px = LIFE.player.group.position.x;
    var pz = LIFE.player.group.position.z;
    var result = [];

    for (var name in LIFE.world.zones) {
        var zone = LIFE.world.zones[name];
        var dx = px - zone.center.x;
        var dz = pz - zone.center.z;
        var dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < zone.radius + 20) {
            for (var i = 0; i < zone.colliders.length; i++) {
                result.push(zone.colliders[i]);
            }
        }
    }

    return result;
};

// ============================================================
// GET ZONE POSITION FOR STAGE
// ============================================================
LIFE.world.getZonePos = function(stage) {
    // Map stage names to zone definitions
    var mapping = {
        nursery: 'home', home: 'home',
        school: 'school', highschool: 'highschool',
        college: 'college', city: 'city',
        retirement: 'retirement', dealership: 'dealership',
        eventcenter: 'eventcenter'
    };
    var zoneName = mapping[stage] || stage;
    var def = LIFE.ZONE_DEFS[zoneName];
    if (def) return { x: def.cx, z: def.cz };
    return { x: 0, z: 0 };
};

// ============================================================
// CAR SYSTEM
// ============================================================
LIFE.car = {
    model: null,       // THREE.Group of the car mesh
    parkedModel: null,  // THREE.Group of parked car in world
    speed: 0,          // current speed
    maxSpeed: 12,
    turnSpeed: 2.5,
    acceleration: 8,
    braking: 12,
    currentSpeed: 0
};

// Build a 3D car model
LIFE.createCarModel = function(color, scale) {
    scale = scale || 1;
    var group = new THREE.Group();

    // Body
    var bodyMat = new THREE.MeshPhongMaterial({ color: color });
    var body = new THREE.Mesh(new THREE.BoxGeometry(2 * scale, 0.7 * scale, 4 * scale), bodyMat);
    body.position.y = 0.4 * scale;
    body.castShadow = true;
    group.add(body);

    // Cabin
    var cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6 * scale, 0.55 * scale, 2 * scale), bodyMat);
    cabin.position.set(0, 0.95 * scale, -0.3 * scale);
    cabin.castShadow = true;
    group.add(cabin);

    // Windows
    var winMat = new THREE.MeshPhongMaterial({ color: 0xbbdefb, emissive: 0x445566, emissiveIntensity: 0.3, transparent: true, opacity: 0.6 });
    // Side windows
    var sideWin1 = new THREE.Mesh(new THREE.BoxGeometry(0.05 * scale, 0.4 * scale, 1.8 * scale), winMat);
    sideWin1.position.set(0.81 * scale, 0.95 * scale, -0.3 * scale);
    group.add(sideWin1);
    var sideWin2 = new THREE.Mesh(new THREE.BoxGeometry(0.05 * scale, 0.4 * scale, 1.8 * scale), winMat);
    sideWin2.position.set(-0.81 * scale, 0.95 * scale, -0.3 * scale);
    group.add(sideWin2);
    // Front windshield
    var frontWin = new THREE.Mesh(new THREE.BoxGeometry(1.4 * scale, 0.4 * scale, 0.05 * scale), winMat);
    frontWin.position.set(0, 0.95 * scale, 0.71 * scale);
    group.add(frontWin);
    // Rear window
    var rearWin = new THREE.Mesh(new THREE.BoxGeometry(1.4 * scale, 0.4 * scale, 0.05 * scale), winMat);
    rearWin.position.set(0, 0.95 * scale, -1.31 * scale);
    group.add(rearWin);

    // Wheels
    var wheelMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
    var wheelGeo = new THREE.CylinderGeometry(0.3 * scale, 0.3 * scale, 0.2 * scale, 8);
    var wheelPositions = [
        [-0.9 * scale, 0.3 * scale, 1.2 * scale],
        [0.9 * scale, 0.3 * scale, 1.2 * scale],
        [-0.9 * scale, 0.3 * scale, -1.3 * scale],
        [0.9 * scale, 0.3 * scale, -1.3 * scale]
    ];
    for (var i = 0; i < 4; i++) {
        var wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wheelPositions[i][0], wheelPositions[i][1], wheelPositions[i][2]);
        wheel.castShadow = true;
        group.add(wheel);
    }

    // Headlights
    var lightMat = new THREE.MeshPhongMaterial({ color: 0xfff9c4, emissive: 0xfff9c4, emissiveIntensity: 0.5 });
    var hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.3 * scale, 0.2 * scale, 0.1 * scale), lightMat);
    hl1.position.set(-0.6 * scale, 0.45 * scale, 2.01 * scale);
    group.add(hl1);
    var hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.3 * scale, 0.2 * scale, 0.1 * scale), lightMat);
    hl2.position.set(0.6 * scale, 0.45 * scale, 2.01 * scale);
    group.add(hl2);

    // Tail lights
    var tailMat = new THREE.MeshPhongMaterial({ color: 0xef5350, emissive: 0xef5350, emissiveIntensity: 0.3 });
    var tl1 = new THREE.Mesh(new THREE.BoxGeometry(0.3 * scale, 0.2 * scale, 0.1 * scale), tailMat);
    tl1.position.set(-0.6 * scale, 0.45 * scale, -2.01 * scale);
    group.add(tl1);
    var tl2 = new THREE.Mesh(new THREE.BoxGeometry(0.3 * scale, 0.2 * scale, 0.1 * scale), tailMat);
    tl2.position.set(0.6 * scale, 0.45 * scale, -2.01 * scale);
    group.add(tl2);

    return group;
};

// Spawn the player's owned car as a parked model in the world
LIFE.spawnParkedCar = function() {
    // Remove old parked model if exists
    if (LIFE.car.parkedModel) {
        LIFE.scene.remove(LIFE.car.parkedModel);
        LIFE.car.parkedModel = null;
    }

    var state = LIFE.state;
    if (!state.ownedCar || state.inCar) return;

    var pos = state.carParkedAt;
    if (!pos) {
        // Default parking spot near home
        pos = { x: 5, z: 5 };
        state.carParkedAt = pos;
    }

    var model = LIFE.createCarModel(state.ownedCar.color);
    model.position.set(pos.x, 0, pos.z);
    model.rotation.y = 0;
    LIFE.scene.add(model);
    LIFE.car.parkedModel = model;

    // Add "Press V" label above parked car
    var labelCanvas = document.createElement('canvas');
    labelCanvas.width = 256; labelCanvas.height = 48;
    var lctx = labelCanvas.getContext('2d');
    lctx.fillStyle = 'rgba(33,150,243,0.85)';
    lctx.fillRect(0, 0, 256, 48);
    lctx.fillStyle = '#fff';
    lctx.font = 'bold 20px Arial';
    lctx.textAlign = 'center';
    lctx.fillText('Press V to Drive', 128, 32);
    var labelTex = new THREE.CanvasTexture(labelCanvas);
    var labelSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex, transparent: true, depthTest: false }));
    labelSprite.position.set(0, 2.5, 0);
    labelSprite.scale.set(2, 0.4, 1);
    model.add(labelSprite);
};

// Enter the car - switch to driving mode
LIFE.enterCar = function() {
    var state = LIFE.state;
    if (!state.ownedCar || state.inCar) return;
    if (!LIFE.world.built || LIFE.world.insideInterior) return;
    if (state.age < 16) {
        LIFE.ui.showPopup("Too young to drive!", '#ef5350');
        return;
    }

    // Check proximity to parked car
    if (!LIFE.car.parkedModel || !LIFE.player) return;
    var px = LIFE.player.group.position.x;
    var pz = LIFE.player.group.position.z;
    var cx = LIFE.car.parkedModel.position.x;
    var cz = LIFE.car.parkedModel.position.z;
    var dist = Math.sqrt((px - cx) * (px - cx) + (pz - cz) * (pz - cz));
    if (dist > 5) {
        LIFE.ui.showPopup("Get closer to your car!", '#ff9800');
        return;
    }

    state.inCar = true;
    LIFE.car.currentSpeed = 0;
    LIFE.car.maxSpeed = state.ownedCar.speed;

    // Hide player, show driving car
    LIFE.player.group.visible = false;

    // Remove parked model, create driving model
    LIFE.scene.remove(LIFE.car.parkedModel);
    LIFE.car.parkedModel = null;

    LIFE.car.model = LIFE.createCarModel(state.ownedCar.color);
    LIFE.car.model.position.set(px, 0, pz);
    LIFE.car.model.rotation.y = LIFE.player.group.rotation.y;
    LIFE.scene.add(LIFE.car.model);

    LIFE.ui.showPopup('Driving ' + state.ownedCar.name, '#2196f3');
    LIFE.sounds.carStart && LIFE.sounds.carStart();
};

// Exit the car - park it
LIFE.exitCar = function() {
    var state = LIFE.state;
    if (!state.inCar) return;

    state.inCar = false;
    var carPos = LIFE.car.model.position;
    var carRot = LIFE.car.model.rotation.y;

    // Park the car at current location
    state.carParkedAt = { x: carPos.x, z: carPos.z };

    // Place player beside the car
    var exitOffsetX = Math.cos(carRot) * 2.5;
    var exitOffsetZ = -Math.sin(carRot) * 2.5;
    LIFE.player.group.position.set(carPos.x + exitOffsetX, 0, carPos.z + exitOffsetZ);
    LIFE.player.group.visible = true;
    LIFE.player.group.rotation.y = carRot;

    // Remove driving model, spawn parked model
    LIFE.scene.remove(LIFE.car.model);
    LIFE.car.model = null;
    LIFE.car.currentSpeed = 0;

    LIFE.spawnParkedCar();
    LIFE.ui.showPopup('Car parked', '#ff9800');
};

// Toggle car enter/exit
LIFE.toggleCar = function() {
    if (LIFE.state.inCar) {
        LIFE.exitCar();
    } else {
        LIFE.enterCar();
    }
};

// Update car driving physics (called from player update)
LIFE.updateCarDriving = function(dt) {
    var state = LIFE.state;
    if (!state.inCar || !LIFE.car.model) return;

    var car = LIFE.car;
    var moveZ = 0, turnInput = 0;

    // Forward/backward
    if (LIFE.keys['KeyW'] || LIFE.keys['ArrowUp'])    moveZ = 1;
    if (LIFE.keys['KeyS'] || LIFE.keys['ArrowDown'])   moveZ = -1;
    // Steering (left/right rotate the car, not strafe)
    if (LIFE.keys['KeyA'] || LIFE.keys['ArrowLeft'])    turnInput = 1;
    if (LIFE.keys['KeyD'] || LIFE.keys['ArrowRight'])   turnInput = -1;

    // Acceleration / braking
    if (moveZ > 0) {
        car.currentSpeed = Math.min(car.maxSpeed, car.currentSpeed + car.acceleration * dt);
    } else if (moveZ < 0) {
        car.currentSpeed = Math.max(-car.maxSpeed * 0.4, car.currentSpeed - car.braking * dt);
    } else {
        // Decelerate naturally
        if (car.currentSpeed > 0) {
            car.currentSpeed = Math.max(0, car.currentSpeed - car.braking * 0.5 * dt);
        } else if (car.currentSpeed < 0) {
            car.currentSpeed = Math.min(0, car.currentSpeed + car.braking * 0.5 * dt);
        }
    }

    // Steering (only when moving)
    var speedFactor = Math.abs(car.currentSpeed) / car.maxSpeed;
    if (speedFactor > 0.05) {
        car.model.rotation.y += turnInput * car.turnSpeed * speedFactor * dt;
    }

    // Move car forward in its facing direction
    var rot = car.model.rotation.y;
    var sinR = Math.sin(rot);
    var cosR = Math.cos(rot);
    car.model.position.x += sinR * car.currentSpeed * dt;
    car.model.position.z += cosR * car.currentSpeed * dt;

    // Resolve collisions for car (wider radius)
    var savedRadius = 0.3; // player radius
    // Temporarily check car collision with larger bounds
    var carPos = car.model.position;
    var colliders = LIFE.world.built ? LIFE.world.getActiveColliders() : LIFE.colliders;
    var carRadius = 1.2;
    for (var i = 0; i < colliders.length; i++) {
        var c = colliders[i];
        var closestX = Math.max(c.minX, Math.min(carPos.x, c.maxX));
        var closestZ = Math.max(c.minZ, Math.min(carPos.z, c.maxZ));
        var dx = carPos.x - closestX;
        var dz = carPos.z - closestZ;
        var distSq = dx * dx + dz * dz;
        if (distSq < carRadius * carRadius) {
            if (distSq === 0) {
                var ccx = (c.minX + c.maxX) / 2, ccz = (c.minZ + c.maxZ) / 2;
                var halfW = (c.maxX - c.minX) / 2 + carRadius;
                var halfD = (c.maxZ - c.minZ) / 2 + carRadius;
                var overlapX = halfW - Math.abs(carPos.x - ccx);
                var overlapZ = halfD - Math.abs(carPos.z - ccz);
                if (overlapX < overlapZ) carPos.x += (carPos.x > ccx ? overlapX : -overlapX);
                else carPos.z += (carPos.z > ccz ? overlapZ : -overlapZ);
            } else {
                var dist = Math.sqrt(distSq);
                var push = carRadius - dist;
                carPos.x += (dx / dist) * push;
                carPos.z += (dz / dist) * push;
            }
            // Slow down on collision
            car.currentSpeed *= 0.5;
        }
    }

    // Run over NPCs
    if (Math.abs(car.currentSpeed) > 2) {
        var hitRadius = 1.5;
        for (var ni = 0; ni < LIFE.npcs.length; ni++) {
            var npc = LIFE.npcs[ni];
            if (!npc.alive) continue;
            var ndx = carPos.x - npc.char.group.position.x;
            var ndz = carPos.z - npc.char.group.position.z;
            var ndist = Math.sqrt(ndx * ndx + ndz * ndz);
            if (ndist < hitRadius) {
                var damage = Math.floor(Math.abs(car.currentSpeed) * 5);
                LIFE.damageNPC(npc, damage);
                car.currentSpeed *= 0.7; // slow on impact
                if (npc.alive) {
                    LIFE.ui.showPopup('You hit ' + npc.name + '!', '#ff9800');
                    LIFE.addWanted(1);
                    state.reputation = Math.max(-100, state.reputation - 3);
                    LIFE.ui.showRepChange(-3);
                }
                break; // only hit one NPC per frame
            }
        }
    }

    // Update camera to follow car instead of player
    // The player position is synced to the car so the camera follows
    LIFE.player.group.position.copy(carPos);
    LIFE.player.group.rotation.y = rot;
    // Player rot for camera (behind the car)
    state.playerRotY = rot;

    // Engine sound (just footstep for now as placeholder)
    if (Math.abs(car.currentSpeed) > 1) {
        LIFE.sounds.footstep();
    }
};

// Buy a car from the dealership
LIFE.buyCar = function(modelIndex) {
    var carModel = LIFE.CAR_MODELS[modelIndex];
    if (!carModel) return false;
    if (LIFE.state.age < carModel.minAge) {
        LIFE.ui.showPopup('Must be ' + carModel.minAge + '+ to buy this!', '#ef5350');
        return false;
    }
    if (!LIFE.economy.spend(carModel.cost)) {
        LIFE.ui.showPopup("Can't afford this car!", '#ef5350');
        return false;
    }

    // If already has a car, sell old one for 40% value
    if (LIFE.state.ownedCar) {
        var sellPrice = Math.floor(LIFE.CAR_MODELS[LIFE.state.ownedCar.modelIndex].cost * 0.4);
        LIFE.state.money += sellPrice;
        LIFE.ui.showPopup('Traded in ' + LIFE.state.ownedCar.name + ' for $' + sellPrice.toLocaleString(), '#ff9800');
        if (LIFE.car.parkedModel) {
            LIFE.scene.remove(LIFE.car.parkedModel);
            LIFE.car.parkedModel = null;
        }
    }

    LIFE.state.ownedCar = {
        name: carModel.name,
        speed: carModel.speed,
        color: carModel.color,
        modelIndex: modelIndex
    };
    if (LIFE.news) LIFE.news.add('New ' + carModel.name + ' drives off the lot - auto sales booming.', 'career');

    // Park at dealership
    var dealerDef = LIFE.ZONE_DEFS.dealership;
    LIFE.state.carParkedAt = { x: dealerDef.cx + 15, z: dealerDef.cz };

    LIFE.spawnParkedCar();
    LIFE.ui.showPopup('Bought a ' + carModel.name + '!', '#4caf50');
    LIFE.state.stats.happiness = Math.min(100, LIFE.state.stats.happiness + 10);
    return true;
};
