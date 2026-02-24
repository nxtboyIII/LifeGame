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
    womb: true, death: true, nursery: true, workplace: true
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
    LIFE.world._origAddStaticBox = LIFE.physics.addStaticBox;
    LIFE.world._origAddStaticCylinder = LIFE.physics.addStaticCylinder;

    // Override addEnv -> add to zone group (NOT envObjects)
    LIFE.addEnv = function(obj) {
        group.add(obj);
        return obj;
    };

    // Override addCollider -> offset to world space, store in zone
    LIFE.addCollider = function(x, z, w, d, y, h) {
        zone.colliders.push({
            minX: (x + def.cx) - w / 2,
            maxX: (x + def.cx) + w / 2,
            minZ: (z + def.cz) - d / 2,
            maxZ: (z + def.cz) + d / 2,
            minY: (y !== undefined && h !== undefined) ? y - h / 2 : -999,
            maxY: (y !== undefined && h !== undefined) ? y + h / 2 : 999
        });
    };

    // Override physics body creation -> offset to world space
    LIFE.physics.addStaticBox = function(w, h, d, x, y, z) {
        return LIFE.world._origAddStaticBox.call(LIFE.physics, w, h, d, x + def.cx, y, z + def.cz);
    };
    LIFE.physics.addStaticCylinder = function(radius, height, x, y, z) {
        return LIFE.world._origAddStaticCylinder.call(LIFE.physics, radius, height, x + def.cx, y, z + def.cz);
    };

    // Override clearEnvironment to no-op during zone build
    LIFE.clearEnvironment = function() {};

    // Flag physics bodies as zone bodies (persistent)
    LIFE.physics._buildingZone = true;

    LIFE.world._currentBuildZone = zone;
    LIFE.world._currentBuildName = name;
};

LIFE.world.endZoneBuild = function(name) {
    var zone = LIFE.world._currentBuildZone;
    if (!zone) return;

    LIFE.world.zones[name] = zone;
    LIFE.scene.add(zone.group);

    // Merge static geometry in this zone to reduce draw calls
    if (LIFE.mergeStaticGroup) LIFE.mergeStaticGroup(zone.group);

    // Restore originals
    LIFE.addEnv = LIFE.world._origAddEnv;
    LIFE.addCollider = LIFE.world._origAddCollider;
    LIFE.clearEnvironment = LIFE.world._origClearEnv;
    LIFE.physics.addStaticBox = LIFE.world._origAddStaticBox;
    LIFE.physics.addStaticCylinder = LIFE.world._origAddStaticCylinder;
    LIFE.physics._buildingZone = false;

    LIFE.world._currentBuildZone = null;
    LIFE.world._currentBuildName = null;
};

// ============================================================
// BUILD WORLD
// ============================================================
LIFE.world.buildWorld = function() {
    // Large world ground plane (polygonOffset pushes it back in depth to avoid z-fighting with zone grounds)
    var worldGroundMat = LIFE.getMaterial({ color: 0x4a7c3f, polygonOffset: true });
    var worldGround = new THREE.Mesh(
        new THREE.PlaneGeometry(800, 800),
        worldGroundMat
    );
    worldGround.rotation.x = -Math.PI / 2;
    worldGround.position.y = -0.05;
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

    // Police station exterior
    LIFE.world.buildPoliceStation();

    // Roads connecting zones
    LIFE.world.buildRoads();

    // Register doors
    LIFE.world.registerDoors();

    LIFE.world.built = true;

    // Set scene atmosphere for open world
    LIFE.scene.fog.near = 80;
    LIFE.scene.fog.far = 350;

    // Spawn parked car if player owns one
    if (LIFE.state.ownedCar) {
        LIFE.spawnParkedCar();
    }

    // Initialize persistent police officers
    LIFE.world.initPolice();
};

// ============================================================
// PERSISTENT POLICE INITIALIZATION
// ============================================================
LIFE.world.policeCops = [];

LIFE.world.initPolice = function() {
    LIFE.world.policeCops = [];
    var patrols = [
        // 2 officers at police station
        { x: -58, z: -75, zone: 'police_station' },
        { x: -62, z: -75, zone: 'police_station' },
        // 2 patrol the city
        { x: 10, z: 145, zone: 'city' },
        { x: -15, z: 160, zone: 'city' },
        // 1 near school area
        { x: 10, z: -120, zone: 'school' },
        // 1 near home/retirement
        { x: 60, z: 10, zone: 'home' }
    ];
    for (var i = 0; i < patrols.length; i++) {
        var p = patrols[i];
        var npc = LIFE.createNPC('Police', p.x, p.z);
        npc.speed = 0; // idle, not chasing
        npc.health = 200; npc.maxHealth = 200;
        npc.isPolice = true; npc.shootTimer = 0;
        LIFE.world.policeCops.push({
            npc: npc,
            aiState: 'idle', // idle, patrolling, driving, pursuing, returning, dead
            patrolPos: { x: p.x, z: p.z },
            patrolZone: p.zone,
            car: null,
            _parkedCar: null,
            carSpeed: 0,
            patrolTimer: Math.random() * 8,
            _patrolTarget: null,
            returnTimer: 0,
            respawnMonths: 0
        });
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
        LIFE.getMaterial({ color: 0xe0e0e0 })
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
    var winMat = LIFE.getMaterial({ color: 0xbbdefb, emissive: 0x445566, emissiveIntensity: 0.3 });
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
    if (LIFE.mergeStaticGroup) LIFE.mergeStaticGroup(group);
};

// ============================================================
// POLICE STATION EXTERIOR (building shell in world)
// ============================================================
LIFE.world.buildPoliceStation = function() {
    var cx = -60, cz = -80;
    LIFE.world._jailWorldPos = { x: cx, z: cz };
    var group = new THREE.Group();
    group.position.set(cx, 0, cz);

    // Ground patch
    var ground = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 30),
        LIFE.getMaterial({ color: 0x9e9e9e })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0.01;
    ground.receiveShadow = true;
    group.add(ground);

    // Building body
    var body = LIFE.makeBox(10, 6, 8, 0x455a64, 0, 3, 0);
    group.add(body);
    // Roof
    group.add(LIFE.makeBox(11, 0.3, 9, 0x37474f, 0, 6.15, 0));

    // Windows (barred look)
    var winMat = LIFE.getMaterial({ color: 0x90a4ae, emissive: 0x334455, emissiveIntensity: 0.2 });
    var barMat = LIFE.getMaterial({ color: 0x333333 });
    for (var wx = -3; wx <= 3; wx += 3) {
        var w = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.1), winMat);
        w.position.set(wx, 3.5, 4.06);
        group.add(w);
        // bars
        for (var bx = -0.3; bx <= 0.3; bx += 0.15) {
            var bar = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.8, 0.12), barMat);
            bar.position.set(wx + bx, 3.5, 4.08);
            group.add(bar);
        }
    }

    // Door
    group.add(LIFE.makeBox(2, 3.5, 0.2, 0x3e2723, 0, 1.75, 4.1));

    // Police sign
    var signCanvas = document.createElement('canvas');
    signCanvas.width = 256; signCanvas.height = 64;
    var ctx = signCanvas.getContext('2d');
    ctx.fillStyle = 'rgba(25,118,210,0.9)';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('POLICE STATION', 128, 42);
    var tex = new THREE.CanvasTexture(signCanvas);
    var sign = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    sign.position.set(0, 7.5, 4.1);
    sign.scale.set(3, 0.75, 1);
    group.add(sign);

    // "Press G to Enter" prompt
    var enterCanvas = document.createElement('canvas');
    enterCanvas.width = 256; enterCanvas.height = 48;
    var ectx = enterCanvas.getContext('2d');
    ectx.fillStyle = 'rgba(25,118,210,0.9)';
    ectx.fillRect(0, 0, 256, 48);
    ectx.fillStyle = '#fff';
    ectx.font = 'bold 20px Arial';
    ectx.textAlign = 'center';
    ectx.fillText('Press G to Enter', 128, 32);
    var etex = new THREE.CanvasTexture(enterCanvas);
    var enterSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: etex, transparent: true, depthTest: false }));
    enterSprite.position.set(0, 4, 4.5);
    enterSprite.scale.set(2.5, 0.5, 1);
    group.add(enterSprite);

    LIFE.scene.add(group);

    // Store as zone
    LIFE.world.zones['police_station'] = {
        group: group,
        colliders: [{
            minX: cx - 5, maxX: cx + 5,
            minZ: cz - 4, maxZ: cz + 4
        }],
        npcs: [],
        center: new THREE.Vector3(cx, 0, cz),
        radius: 15
    };
    if (LIFE.mergeStaticGroup) LIFE.mergeStaticGroup(group);
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
    var roadMat = LIFE.getMaterial({ color: 0x333333, side: THREE.DoubleSide });
    var pathMat = LIFE.getMaterial({ color: 0xbdbdbd, side: THREE.DoubleSide });
    var lineMat = LIFE.getMaterial({ color: 0xffeb3b });
    var sideLineMat = LIFE.getMaterial({ color: 0xeeeeee });

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

    // 15) Home → Police Station: road heading west-northwest
    var r15 = LIFE.world._buildSplineRoad([
        { x: -5, z: -8 },
        { x: -20, z: -30 },
        { x: -40, z: -55 },
        { x: -55, z: -72 },
        { x: -58, z: -78 }
    ], 5, roadY, roadMat, 45, roads);
    LIFE.world._buildSplineLine(r15.curve, lineY, 2.5, 2, 0.15, lineMat, roads);

    LIFE.scene.add(roads);
    LIFE.world._roadsGroup = roads;
    if (LIFE.mergeStaticGroup) LIFE.mergeStaticGroup(roads);
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

    // Register doors for all career buildings in city zone
    var cityDef = LIFE.ZONE_DEFS.city;
    if (LIFE.JOB_BUILDINGS) {
        LIFE.JOB_BUILDINGS.forEach(function(jb) {
            var worldX = jb.x + cityDef.cx;
            var worldZ = jb.z + cityDef.cz + 4.1; // door is at front face (z + 4.1 in local)
            LIFE.world.doors.push({
                x: worldX,
                z: worldZ,
                interior: 'workplace',
                careerType: jb.career,
                label: jb.label,
                exitX: worldX,
                exitZ: worldZ + 2
            });
        });
    }

    // Police station door
    var psx = -60, psz = -80;
    LIFE.world.doors.push({
        x: psx, z: psz + 4.1,
        interior: 'police_interior',
        label: 'Police Station',
        exitX: psx, exitZ: psz + 6
    });
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

    // Check proximity to "Press G" enter prompts on city buildings
    // (Job buildings with doors but no explicit door in registry — handled above now)

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
// World positions for each interior (where they actually exist on the map)
LIFE.world.INTERIOR_POSITIONS = {
    classroom:   { x: 0,    z: -150 },   // inside school
    hsclassroom: { x: 120,  z: -150 },   // inside highschool
    hospital:    { x: -150, z: 0 },      // inside hospital
    playerhome:  { x: 0,    z: 0 },      // inside home zone
    jail:        { x: -60,  z: -80 },    // inside police station
    workplace:   { x: 0,    z: 150 },    // dynamically set per building
    police_interior: { x: -60, z: -80 }  // inside police station (visitor)
};

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

    // Hide all world zone groups + world ground + zone NPCs
    LIFE.world.hideAllZones();

    // Clear any lingering envObjects and colliders
    LIFE.clearEnvironment();

    // Determine world position for this interior
    var pos = LIFE.world.INTERIOR_POSITIONS[name] || { x: 0, z: 0 };

    // For workplace interiors, position at the actual building location
    if (name === 'workplace' && door) {
        pos = { x: door.exitX, z: door.exitZ - 2 };
        LIFE.world._workplaceCareer = door.careerType || 'worker';
    }
    if (name === 'police_interior' && door) {
        pos = { x: door.exitX, z: door.exitZ - 2 };
    }

    // Build interior using existing builder, inside a group at the world position
    var stageName = (name === 'workplace' || name === 'police_interior') ? 'workplace' : name;
    var cfg = LIFE.STAGES[stageName];
    if (cfg) {
        LIFE.scene.background.set(cfg.bg);
        LIFE.scene.fog.color.set(cfg.fog[0]);
        LIFE.scene.fog.near = cfg.fog[1];
        LIFE.scene.fog.far = cfg.fog[2];
    }
    LIFE.state.bounds = 10; // interiors are small

    // Create interior group at correct world position
    var interiorGroup = new THREE.Group();
    interiorGroup.position.set(pos.x, 0, pos.z);
    LIFE.scene.add(interiorGroup);
    LIFE.world._interiorGroup = interiorGroup;

    // Redirect addEnv/addCollider to use interior group with world offset
    var origAddEnv = LIFE.addEnv;
    var origAddCollider = LIFE.addCollider;
    var origAddStaticBox = LIFE.physics.addStaticBox;
    var origAddStaticCylinder = LIFE.physics.addStaticCylinder;
    LIFE.addEnv = function(obj) {
        interiorGroup.add(obj);
        return obj;
    };
    LIFE.addCollider = function(x, z, w, d, y, h) {
        LIFE.colliders.push({
            minX: (x + pos.x) - w / 2,
            maxX: (x + pos.x) + w / 2,
            minZ: (z + pos.z) - d / 2,
            maxZ: (z + pos.z) + d / 2,
            minY: (y !== undefined && h !== undefined) ? y - h / 2 : -999,
            maxY: (y !== undefined && h !== undefined) ? y + h / 2 : 999
        });
    };
    // Override physics body creation -> offset to interior world position
    LIFE.physics.addStaticBox = function(w, h, d, x, y, z) {
        return origAddStaticBox.call(LIFE.physics, w, h, d, x + pos.x, y, z + pos.z);
    };
    LIFE.physics.addStaticCylinder = function(radius, height, x, y, z) {
        return origAddStaticCylinder.call(LIFE.physics, radius, height, x + pos.x, y, z + pos.z);
    };

    var builders = {
        classroom: LIFE.buildClassroom,
        hsclassroom: LIFE.buildHSClassroom,
        playerhome: LIFE.buildPlayerHome,
        hospital: LIFE.buildHospital
    };
    if (name === 'workplace') {
        LIFE.buildWorkplace(LIFE.world._workplaceCareer);
    } else if (name === 'police_interior') {
        LIFE.buildWorkplace('business'); // police station uses office-like interior
    } else if (builders[name]) {
        builders[name]();
    }

    // Restore original functions
    LIFE.addEnv = origAddEnv;
    LIFE.addCollider = origAddCollider;
    LIFE.physics.addStaticBox = origAddStaticBox;
    LIFE.physics.addStaticCylinder = origAddStaticCylinder;

    LIFE.world.insideInterior = name;
    LIFE.world._currentBuildingCareer = (name === 'workplace') ? LIFE.world._workplaceCareer : null;

    // Update interior position so bounds clamping works correctly
    LIFE.world.INTERIOR_POSITIONS[name] = { x: pos.x, z: pos.z };

    // Spawn NPCs for interior at world position
    LIFE.world._interiorNPCOffset = pos;
    LIFE.spawnNPCs(name);
    LIFE.world._interiorNPCOffset = null;

    // Spawn pickupable items on surfaces inside the interior
    if (LIFE.spawnInteriorItems) LIFE.spawnInteriorItems(name);

    // Remove zone physics bodies from simulation so they don't block the interior
    // (exterior building shells overlap with interior room space)
    LIFE.physics.disableZoneBodies();

    LIFE.updatePlayerSize();
    // Position player at the interior's world position
    LIFE.teleportPlayer(pos.x, 0, pos.z + 3);

    LIFE.ambientLight.intensity = 0.5;
    LIFE.dirLight.intensity = 0.8;
};

LIFE.world.exitInterior = function() {
    if (!LIFE.world.insideInterior) return;

    // Remove interior items from scene and worldItems array
    for (var i = LIFE.worldItems.length - 1; i >= 0; i--) {
        var wi = LIFE.worldItems[i];
        if (wi._isInteriorItem) {
            if (wi.mesh) LIFE.scene.remove(wi.mesh);
            if (wi.ring) LIFE.scene.remove(wi.ring);
            LIFE.worldItems.splice(i, 1);
        }
    }

    // Remove interior NPCs from scene (classroom Teacher, Kids, etc.)
    // Zone NPCs are kept — they're managed by the world system
    LIFE.npcs.forEach(function(n) {
        if (!n._isZoneNPC) {
            LIFE.scene.remove(n.char.group);
            LIFE.removeNPCPhysics(n);
        }
    });
    LIFE.npcs = [];

    // Clear interior physics static bodies
    if (LIFE.physics) LIFE.physics.clearStatic();

    // Remove interior group (contains all interior meshes at world position)
    if (LIFE.world._interiorGroup) {
        LIFE.scene.remove(LIFE.world._interiorGroup);
        LIFE.world._interiorGroup = null;
    }

    // Clear any remaining interior objects and colliders
    LIFE.clearEnvironment();

    // Re-enable zone physics bodies
    LIFE.physics.enableZoneBodies();

    // Restore world zones
    LIFE.world.showNearbyZones();

    // Restore open world atmosphere
    LIFE.scene.background.set(0x87ceeb);
    LIFE.scene.fog.color.set(0x87ceeb);
    LIFE.scene.fog.near = 80;
    LIFE.scene.fog.far = 350;

    LIFE.world.insideInterior = null;
    LIFE.world._currentBuildingCareer = null;

    // Restore bounds (no clamping in open world)
    LIFE.state.bounds = 400;

    // Teleport player to saved position (door exit)
    if (LIFE.world._savedPlayerPos && LIFE.player) {
        LIFE.teleportPlayer(
            LIFE.world._savedPlayerPos.x, 0,
            LIFE.world._savedPlayerPos.z
        );
    }
    LIFE.world._savedPlayerPos = null;

    // Force immediate culling update to set zone/NPC visibility
    LIFE.world._cullingTimer = 999;
    LIFE.world.updateCulling(0);

    LIFE.updatePlayerSize();
};

// ============================================================
// ZONE VISIBILITY
// ============================================================
LIFE.world.hideAllZones = function() {
    for (var name in LIFE.world.zones) {
        LIFE.world.zones[name].group.visible = false;
        // Also hide zone NPCs (they're in LIFE.scene, not zone groups)
        var npcs = LIFE.world.zones[name].npcs;
        if (npcs) {
            for (var i = 0; i < npcs.length; i++) {
                if (npcs[i].char && npcs[i].char.group) {
                    npcs[i].char.group.visible = false;
                }
            }
        }
    }
    if (LIFE.world.worldGround) LIFE.world.worldGround.visible = false;
    if (LIFE.world._roadsGroup) LIFE.world._roadsGroup.visible = false;
    if (LIFE.car.parkedModel) LIFE.car.parkedModel.visible = false;
    // Hide persistent police
    if (LIFE.world.policeCops) {
        for (var pi = 0; pi < LIFE.world.policeCops.length; pi++) {
            var pc = LIFE.world.policeCops[pi];
            if (pc.npc.char && pc.npc.char.group) pc.npc.char.group.visible = false;
            if (pc.car) pc.car.visible = false;
            if (pc._parkedCar) pc._parkedCar.visible = false;
        }
    }
};

LIFE.world.showNearbyZones = function() {
    if (LIFE.world.worldGround) LIFE.world.worldGround.visible = true;
    if (LIFE.world._roadsGroup) LIFE.world._roadsGroup.visible = true;
    // Show all, culling will hide distant ones next tick
    for (var name in LIFE.world.zones) {
        LIFE.world.zones[name].group.visible = true;
    }
    if (LIFE.car.parkedModel) LIFE.car.parkedModel.visible = true;
    // Show persistent police
    if (LIFE.world.policeCops) {
        for (var pi = 0; pi < LIFE.world.policeCops.length; pi++) {
            var pc = LIFE.world.policeCops[pi];
            if (pc.npc.alive && pc.npc.char && pc.npc.char.group) pc.npc.char.group.visible = true;
            if (pc._parkedCar) pc._parkedCar.visible = true;
        }
    }
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
    var currentHour = sim ? (sim.hour + (sim.minutes || 0) / 60) : 12; // fractional hour for bedtime checks

    for (var name in LIFE.world.zones) {
        var zone = LIFE.world.zones[name];
        var dx = px - zone.center.x;
        var dz = pz - zone.center.z;
        var dist = Math.sqrt(dx * dx + dz * dz);

        // Hysteresis: show < 200, hide > 240
        if (zone.group.visible) {
            if (dist > 240) zone.group.visible = false;
        } else {
            if (dist < 200) zone.group.visible = true;
        }

        // Show/hide zone NPCs and handle sleep state
        if (zone.npcs) {
            for (var ni = 0; ni < zone.npcs.length; ni++) {
                var npc = zone.npcs[ni];
                if (!npc.char || !npc.char.group) continue;
                if (!npc.alive) { npc.char.group.visible = zone.group.visible; continue; }

                // Woken-up NPCs stay awake for a while before going back to sleep
                if (npc._wakeLock > 0) {
                    npc._wakeLock -= 0.5; // culling runs every 0.5s
                    npc.char.group.visible = zone.group.visible && npc.alive;
                    continue;
                }

                // Check if NPC should be sleeping based on their personal schedule
                var shouldSleep = false;
                if (npc._bedtime >= 0) {
                    if (npc._bedtime > npc._waketime) {
                        shouldSleep = (currentHour >= npc._bedtime || currentHour < npc._waketime);
                    } else {
                        shouldSleep = (currentHour >= npc._bedtime && currentHour < npc._waketime);
                    }
                }

                if (shouldSleep && !npc._sleeping) {
                    // Go to sleep: move to sleep position and lay down
                    npc._sleeping = true;
                    npc._savedSpeed = npc.speed; // save BEFORE zeroing
                    npc._preSleepPos = { x: npc.char.group.position.x, z: npc.char.group.position.z };
                    if (npc._sleepPos) {
                        npc.char.group.position.x = npc._sleepPos.x;
                        npc.char.group.position.z = npc._sleepPos.z;
                    }
                    npc.char.group.position.y = npc._homeless ? 0.05 : 0.35; // bed height or ground
                    npc.char.group.rotation.x = -Math.PI / 2; // lay flat
                    npc.speed = 0;
                } else if (!shouldSleep && npc._sleeping) {
                    // Wake up: restore position and stand up
                    npc._sleeping = false;
                    npc.speed = npc._savedSpeed || 1.0; // restore speed
                    if (npc._preSleepPos) {
                        npc.char.group.position.x = npc._preSleepPos.x;
                        npc.char.group.position.z = npc._preSleepPos.z;
                    }
                    npc.char.group.position.y = 0;
                    npc.char.group.rotation.x = 0;
                }

                // Escorting NPCs always stay visible
                if (npc._escorting) {
                    npc.char.group.visible = npc.alive;
                } else {
                    npc.char.group.visible = zone.group.visible && npc.alive;
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
    // Also check hospital exterior and police station
    if (Math.sqrt((px + 150) * (px + 150) + pz * pz) < 15) {
        closestZone = 'hospital_ext';
    }
    if (Math.sqrt((px + 60) * (px + 60) + (pz + 80) * (pz + 80)) < 15) {
        closestZone = 'police_station';
    }

    if (closestZone !== LIFE.world._currentZone) {
        LIFE.world._currentZone = closestZone;
        if (closestZone) {
            var labels = {
                home: 'Home', school: 'Elementary School', highschool: 'High School',
                college: 'University', city: 'City', retirement: 'Retirement Community',
                hospital_ext: 'Hospital', dealership: 'Auto Dealership',
                eventcenter: 'Event Center', police_station: 'Police Station'
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
// Determine an appropriate age for an NPC based on their type and the player's age
LIFE.world.getNPCAge = function(npcType, state, childIdx) {
    var pAge = state.age;
    switch (npcType) {
        case 'Mom': return pAge + 25 + Math.floor(Math.random() * 5);
        case 'Dad': return pAge + 27 + Math.floor(Math.random() * 5);
        case 'Sibling': return Math.max(1, pAge + (Math.random() < 0.5 ? -2 - Math.floor(Math.random() * 3) : 2 + Math.floor(Math.random() * 3)));
        case 'Spouse': return state.spouseAge || (pAge + Math.floor(Math.random() * 6) - 3);
        case 'Your Child':
            var born = state.firstChildBornAge || (pAge - 5);
            return Math.max(0, pAge - born - (childIdx || 0) * 2);
        case 'Grandchild':
            var gcAge = state.firstChildBornAge ? pAge - state.firstChildBornAge - 20 : 3;
            return Math.max(0, Math.min(gcAge, 10));
        case 'Old Friend': return pAge + Math.floor(Math.random() * 10) - 5;
        case 'Teacher': return 30 + Math.floor(Math.random() * 25);
        case 'Professor': return 35 + Math.floor(Math.random() * 30);
        case 'Kid': return 5 + Math.floor(Math.random() * 7);
        case 'Student':
            if (pAge >= 12 && pAge <= 17) return 12 + Math.floor(Math.random() * 6);
            return 18 + Math.floor(Math.random() * 5);
        case 'Stranger': return 18 + Math.floor(Math.random() * 55);
        case 'Neighbor': return 25 + Math.floor(Math.random() * 45);
        case 'Coworker': return 22 + Math.floor(Math.random() * 40);
        case 'Boss': return 35 + Math.floor(Math.random() * 25);
        case 'Police': return 25 + Math.floor(Math.random() * 20);
        case 'Dealer': return 18 + Math.floor(Math.random() * 25);
        case 'Doctor': return 30 + Math.floor(Math.random() * 30);
        case 'Nurse': return 24 + Math.floor(Math.random() * 30);
        case 'Inmate': return 20 + Math.floor(Math.random() * 40);
        case 'Pharmacist': return 28 + Math.floor(Math.random() * 35);
        case 'Car Salesman': return 28 + Math.floor(Math.random() * 20);
        case 'Real Estate Agent': return 30 + Math.floor(Math.random() * 25);
        default: return 25 + Math.floor(Math.random() * 35);
    }
};

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

    // Dynamic family NPCs — skip dead family members via registry
    var familyZones = { city: true, retirement: true, home: true };
    if (familyZones[zoneName] && state.married && state.age >= 20) {
        var spouseReg = LIFE.findRegistryByRole('Spouse');
        if (!spouseReg || spouseReg.alive) names.push('Spouse');
    }
    if (familyZones[zoneName] && state.hasKids) {
        var kidsToShow = Math.min(state.childCount || 1, 3);
        for (var ki = 0; ki < kidsToShow; ki++) {
            names.push('Your Child');
        }
    }

    // Filter out dead family NPCs from the base names list
    var familyRoles = { Mom: true, Dad: true, Sibling: true };
    for (var fi = names.length - 1; fi >= 0; fi--) {
        if (familyRoles[names[fi]]) {
            var famReg = LIFE.findRegistryByRole(names[fi]);
            if (famReg && !famReg.alive) names.splice(fi, 1);
        }
    }

    // Conditional NPCs for retirement zone
    if (zoneName === 'retirement') {
        // Grandchild: only if player has kids AND oldest child is 20+ (old enough to have their own kid)
        var oldestChildAge = state.hasKids && state.firstChildBornAge
            ? (state.age - state.firstChildBornAge) : 0;
        if (oldestChildAge >= 20) {
            names.push('Grandchild');
        }
        // Old Friend: only if player has actual close friends (relationship level >= 25)
        var hasOldFriend = false;
        var rels = state.relationships || {};
        for (var rn in rels) {
            if (rels[rn].level >= 25 && rn !== state.spouseName) { hasOldFriend = true; break; }
        }
        if (hasOldFriend) names.push('Old Friend');
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

        // Fixed spawn positions for key NPCs
        if (npcType === 'Car Salesman' && zoneName === 'dealership') {
            // Right in front of the dealership building (building is at local 0,-8)
            x = def.cx;
            z = def.cz - 2;
        } else if (npcType === 'Real Estate Agent' && zoneName === 'city') {
            // Inside the real estate office (building at local 25,35, door at z+3)
            x = def.cx + 25;
            z = def.cz + 35;
        } else if (npcType === 'Mom' && zoneName === 'home') {
            // Inside the house (house is at local 0,-5, door at z=0)
            x = def.cx - 2;
            z = def.cz - 6;
        } else if (npcType === 'Dad' && zoneName === 'home') {
            x = def.cx + 2;
            z = def.cz - 6;
        } else if (npcType === 'Sibling' && zoneName === 'home') {
            x = def.cx;
            z = def.cz - 3;
        } else {
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
        }

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

        // Determine NPC age based on type and player's current age
        var npcAge = LIFE.world.getNPCAge(npcType, state, childIndex > 0 ? childIndex - 1 : 0);

        var npc = LIFE.createNPC(npcType, x, z, individualName, npcFemale, { npcAge: npcAge });
        npc._isZoneNPC = true;
        npc._zoneName = zoneName;
        npc._zoneCenter = new THREE.Vector3(def.cx, 0, def.cz);
        npc._zoneRadius = def.radius;

        // Sleep schedule: unique bedtime/wake time per NPC
        if (npcType === 'Police' || npcType === 'Dealer' || npcType === 'Organ Buyer' || npcType === 'Fence' || npcType === 'Arms Dealer') {
            npc._bedtime = -1; // never sleeps (always active)
        } else if (npc.isVendor || npc.isCarSalesman || npc.isRealEstate || npc.isHiring) {
            // Business hours: sleep 9pm-7am
            npc._bedtime = 21;
            npc._waketime = 7;
        } else if (npcType === 'Mom' || npcType === 'Dad') {
            npc._bedtime = 22.5; // parents: 10:30pm
            npc._waketime = 6.5;
        } else if (npcType === 'Sibling' || npcType === 'Kid' || npcType === 'Student') {
            npc._bedtime = 21 + Math.random() * 1; // kids: 9-10pm
            npc._waketime = 6.5 + Math.random() * 1; // wake 6:30-7:30am
        } else if (npcType === 'Stranger' || npcType === 'Neighbor') {
            // Random adult schedule
            npc._bedtime = 21 + Math.random() * 4; // 9pm-1am
            if (npc._bedtime >= 24) npc._bedtime -= 24;
            npc._waketime = 5.5 + Math.random() * 3; // 5:30-8:30am
        } else {
            // Everyone else: random schedule
            npc._bedtime = 22 + Math.random() * 2; // 10pm-12am
            npc._waketime = 6 + Math.random() * 2; // 6-8am
        }
        npc._sleeping = false;
        npc._homeless = (npcType === 'Stranger' && Math.random() < 0.15); // 15% of strangers are homeless

        // Assign sleep position based on type and zone
        if (npcType === 'Mom' || npcType === 'Dad') {
            // Parents sleep in home beds (local coords become world coords during zone build)
            npc._sleepPos = { x: def.cx + (npcType === 'Mom' ? -4 : -2.5), z: def.cz - 3 };
        } else if (npcType === 'Sibling') {
            npc._sleepPos = { x: def.cx + 5, z: def.cz - 4 };
        } else if (npc._homeless) {
            // Homeless: sleep on a random sidewalk/bench spot
            npc._sleepPos = { x: x + (Math.random() - 0.5) * 4, z: z + (Math.random() - 0.5) * 4 };
        } else if (zoneName === 'city' && LIFE.world._cityHouses && LIFE.world._cityHouses.length > 0) {
            // City NPCs: assigned to a house (house coords are local, offset by zone center)
            var houseIdx = ni % LIFE.world._cityHouses.length;
            var house = LIFE.world._cityHouses[houseIdx];
            npc._sleepPos = { x: def.cx + house.x + (Math.random() - 0.5) * 2, z: def.cz + house.z };
        } else {
            // Other zones: sleep at their spawn pos
            npc._sleepPos = { x: x, z: z };
        }

        // Register persistent NPC types in the NPC registry
        var persistentTypes = { Kid: true, Student: true, Stranger: true, Neighbor: true };
        if (persistentTypes[npcType]) {
            // Check if there's a registry entry for this zone/name combo
            var regEntry = null;
            var zoneRegistry = LIFE.getRegistryForZone(zoneName);
            for (var ri = 0; ri < zoneRegistry.length; ri++) {
                if (zoneRegistry[ri].firstName === individualName && !zoneRegistry[ri]._spawned) {
                    regEntry = zoneRegistry[ri];
                    regEntry._spawned = true;
                    break;
                }
            }
            if (!regEntry) {
                // Register this NPC
                regEntry = LIFE.registerNPC({
                    firstName: individualName,
                    lastName: npc.lastName,
                    gender: npcFemale ? 'F' : 'M',
                    birthYear: state.age - (npcAge || 25),
                    deathAge: 65 + Math.floor(Math.random() * 30),
                    currentType: npcType,
                    homeZone: zoneName,
                    skinColor: (npc.char.parts && npc.char.parts.head) ? npc.char.parts.head.material.color.getHex() : 0xffdbac,
                    clothesColor: (npc.char.parts && npc.char.parts.body) ? npc.char.parts.body.material.color.getHex() : 0x2196f3
                });
            }
            npc._registryId = regEntry.rid;

            // Gang affiliation for Strangers/Dealers in gang territory (~30% chance)
            if ((npcType === 'Stranger' || npcType === 'Dealer') && !npc.isGangMember) {
                for (var gid in LIFE.GANGS) {
                    var gangDef = LIFE.GANGS[gid];
                    if (gangDef.territory === zoneName && Math.random() < 0.3) {
                        npc.gangId = gid;
                        npc.isGangMember = true;
                        regEntry.gang = gid;
                        // Override clothes color to gang color
                        if (npc.char.parts && npc.char.parts.body) {
                            npc.char.parts.body.material.color.setHex(gangDef.clothesColor);
                        }
                        // Update nametag label color
                        npc._labelColor = gangDef.labelColor;
                        LIFE.updateNPCNametag(npc);
                        break;
                    }
                }
            }
        }

        // Family NPCs: store registry ID
        if (LIFE.NPC_FAMILY_TITLE[npcType]) {
            var famEntry = LIFE.findRegistryByRole(npcType);
            if (famEntry) npc._registryId = famEntry.rid;
        }

        zone.npcs.push(npc);
    }

    // Clear _spawned flags from registry
    for (var si = 0; si < LIFE.npcRegistry.length; si++) {
        LIFE.npcRegistry[si]._spawned = false;
    }

    // Spawn Hiring Manager NPCs near job buildings in city
    if (zoneName === 'city' && LIFE.JOB_BUILDINGS) {
        var cityDef = LIFE.ZONE_DEFS.city;
        LIFE.JOB_BUILDINGS.forEach(function(jb) {
            var hireNPC = LIFE.createNPC('Hiring ' + jb.label,
                jb.x + cityDef.cx, jb.z + cityDef.cz + 6, undefined, undefined,
                { npcAge: 35 + Math.floor(Math.random() * 20) });
            hireNPC.careerType = jb.career;
            hireNPC._isZoneNPC = true;
            hireNPC._zoneName = 'city';
            hireNPC._zoneCenter = new THREE.Vector3(cityDef.cx, 0, cityDef.cz);
            hireNPC._zoneRadius = cityDef.radius;
            hireNPC.stayNear = new THREE.Vector3(jb.x + cityDef.cx, 0, jb.z + cityDef.cz);
            hireNPC._bedtime = 21;
            hireNPC._waketime = 7;
            hireNPC._sleeping = false;
            hireNPC._sleepPos = { x: jb.x + cityDef.cx, z: jb.z + cityDef.cz + 6 };
            zone.npcs.push(hireNPC);
        });
    }

    // Spawn world items in this zone (after NPCs so owners can be assigned)
    if (LIFE.spawnWorldItems) LIFE.spawnWorldItems(zoneName);
};

LIFE.world.refreshNearbyNPCs = function() {
    if (!LIFE.world.built || LIFE.world.insideInterior) return;
    if (!LIFE.player) return;

    var px = LIFE.player.group.position.x;
    var pz = LIFE.player.group.position.z;
    var result = [];

    for (var name in LIFE.world.zones) {
        var zone = LIFE.world.zones[name];
        if (!zone.npcs) continue;
        for (var i = 0; i < zone.npcs.length; i++) {
            var npc = zone.npcs[i];
            // Always include escorting NPCs regardless of zone visibility
            if (npc._escorting && npc.alive) {
                result.push(npc);
                continue;
            }
            if (!zone.group.visible) continue;
            // Only include visible NPCs (respects time-of-day hiding)
            if (npc.char && npc.char.group && npc.char.group.visible) {
                result.push(npc);
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
    return LIFE.world.getCollidersNear(LIFE.player.group.position.x, LIFE.player.group.position.z);
};

LIFE.world._nearColliderCache = {};
LIFE.world._nearColliderCacheTime = 0;

LIFE.world.getCollidersNear = function(px, pz) {
    // Per-zone lookup with short-lived cache (cleared each frame via time check)
    var now = performance.now();
    if (now - LIFE.world._nearColliderCacheTime > 16) { // ~1 frame
        LIFE.world._nearColliderCache = {};
        LIFE.world._nearColliderCacheTime = now;
    }
    // Bucket position to 40-unit grid for cache key
    var bx = Math.round(px / 40);
    var bz = Math.round(pz / 40);
    var key = bx + ',' + bz;
    if (LIFE.world._nearColliderCache[key]) return LIFE.world._nearColliderCache[key];

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
    LIFE.world._nearColliderCache[key] = result;
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
    var bodyMat = LIFE.getMaterial({ color: color });
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
    var winMat = LIFE.getMaterial({ color: 0xbbdefb, emissive: 0x445566, emissiveIntensity: 0.3, transparent: true, opacity: 0.6 });
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
    var wheelMat = LIFE.getMaterial({ color: 0x222222 });
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
    var lightMat = LIFE.getMaterial({ color: 0xfff9c4, emissive: 0xfff9c4, emissiveIntensity: 0.5 });
    var hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.3 * scale, 0.2 * scale, 0.1 * scale), lightMat);
    hl1.position.set(-0.6 * scale, 0.45 * scale, 2.01 * scale);
    group.add(hl1);
    var hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.3 * scale, 0.2 * scale, 0.1 * scale), lightMat);
    hl2.position.set(0.6 * scale, 0.45 * scale, 2.01 * scale);
    group.add(hl2);

    // Tail lights
    var tailMat = LIFE.getMaterial({ color: 0xef5350, emissive: 0xef5350, emissiveIntensity: 0.3 });
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
    state.crouching = false;
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

    LIFE.ui.showPopup('Driving ' + state.ownedCar.name, '#2196f3', 'driving');
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
    LIFE.teleportPlayer(carPos.x + exitOffsetX, 0, carPos.z + exitOffsetZ);
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

    // Run over NPCs and police
    if (Math.abs(car.currentSpeed) > 2) {
        var hitRadius = 1.5;
        var allRunTargets = LIFE.getAllNPCs();
        for (var ni = 0; ni < allRunTargets.length; ni++) {
            var npc = allRunTargets[ni];
            if (!npc.alive) continue;
            var ndx = carPos.x - npc.char.group.position.x;
            var ndz = carPos.z - npc.char.group.position.z;
            var ndist = Math.sqrt(ndx * ndx + ndz * ndz);
            if (ndist < hitRadius) {
                var wasAlive = npc.alive;
                var damage = Math.floor(Math.abs(car.currentSpeed) * 5);
                LIFE.damageNPC(npc, damage);
                car.currentSpeed *= 0.7; // slow on impact
                if (wasAlive) {
                    if (npc.alive) {
                        // Hit but survived
                        var hitLabel = npc.isPolice ? 'You hit a police officer!' : 'You hit ' + npc.name + '!';
                        LIFE.ui.showPopup(hitLabel, '#ff9800');
                        LIFE.logCrime(npc.isPolice ? 'Vehicular assault on police' : 'Hit and run');
                        LIFE.addWanted(npc.isPolice ? 3 : 1, 'Vehicular assault');
                        state.reputation -= (npc.isPolice ? 8 : 3);
                        LIFE.ui.showRepChange(npc.isPolice ? -8 : -3);
                    } else {
                        // Killed by car - killNPC already handles wanted/rep for police
                        // Log vehicular crime for non-police kills
                        if (!npc.isPolice) {
                            LIFE.logCrime('Vehicular manslaughter');
                            LIFE.addWanted(2, 'Vehicular manslaughter');
                        }
                        var killLabel = npc.isPolice ? 'You killed a police officer!' : 'You ran over ' + npc.name + '!';
                        LIFE.ui.showPopup(killLabel, '#ff1744');
                    }
                }
                break; // only hit one NPC per frame
            }
        }
    }

    // Update camera to follow car instead of player
    // The player position is synced to the car so the camera follows
    LIFE.teleportPlayer(carPos.x, carPos.y, carPos.z);
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
