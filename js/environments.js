// ============================================================
// ENVIRONMENT BUILDING
// ============================================================
LIFE.buildEnvironment = function(stage) {
    // If world is built and this is an outdoor zone, skip (already in world)
    var outdoorZones = { home: true, school: true, highschool: true, college: true, city: true, retirement: true, dealership: true, eventcenter: true };
    if (LIFE.world.built && outdoorZones[stage]) return;

    LIFE.clearEnvironment();
    const cfg = LIFE.STAGES[stage];
    if (!cfg) return;

    LIFE.scene.background.set(cfg.bg);
    LIFE.scene.fog.color.set(cfg.fog[0]);
    LIFE.scene.fog.near = cfg.fog[1];
    LIFE.scene.fog.far = cfg.fog[2];
    LIFE.state.bounds = LIFE.getBoundsForStage(stage);

    LIFE.ambientLight.intensity = 0.5;
    LIFE.dirLight.intensity = 0.8;

    const builders = {
        womb: LIFE.buildWomb,
        nursery: LIFE.buildNursery,
        home: LIFE.buildHome,
        school: LIFE.buildSchool,
        highschool: LIFE.buildHighSchool,
        college: LIFE.buildCollege,
        city: LIFE.buildCity,
        retirement: LIFE.buildRetirement,
        classroom: LIFE.buildClassroom,
        hsclassroom: LIFE.buildHSClassroom,
        playerhome: LIFE.buildPlayerHome,
        jail: LIFE.buildJail,
        execution: LIFE.buildExecution,
        hospital: LIFE.buildHospital,
        death: LIFE.buildDeath
    };
    if (builders[stage]) builders[stage]();
};

// ---------- WOMB ----------
LIFE.buildWomb = function() {
    const geo = new THREE.SphereGeometry(5, 16, 12);
    const mat = new THREE.MeshPhongMaterial({
        color: 0x8b0000, side: THREE.BackSide,
        emissive: 0x330000, emissiveIntensity: 0.5
    });
    const sphere = new THREE.Mesh(geo, mat);
    sphere.position.y = 2;
    sphere._isWomb = true;
    LIFE.addEnv(sphere);

    const pl = new THREE.PointLight(0xff4444, 0.6, 10);
    pl.position.set(0, 3, 0);
    pl._isWombLight = true;
    LIFE.addEnv(pl);

    const floor = new THREE.Mesh(
        new THREE.SphereGeometry(4, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
        new THREE.MeshPhongMaterial({ color: 0x660000 })
    );
    floor.position.y = -0.5;
    LIFE.addEnv(floor);
};

// ---------- NURSERY ----------
LIFE.buildNursery = function() {
    LIFE.makeGround(30, 0xf5deb3);
    // walls (solid)
    LIFE.addSolid(12, 3, 0.3, 0xfff9c4, 0, 1.5, -6);
    LIFE.addSolid(0.3, 3, 12, 0xfff9c4, -6, 1.5, 0);
    LIFE.addSolid(0.3, 3, 12, 0xfff9c4, 6, 1.5, 0);
    // crib (solid)
    LIFE.addSolid(1.5, 0.5, 1, 0xdeb887, -2, 0.5, -3);
    LIFE.addEnv(LIFE.makeBox(1.5, 0.4, 0.05, 0xc9a96e, -2, 0.95, -3.5));
    LIFE.addEnv(LIFE.makeBox(1.5, 0.4, 0.05, 0xc9a96e, -2, 0.95, -2.5));
    // toys
    var toyColors = [0xff1744, 0x2979ff, 0xffea00, 0x00e676];
    for (var i = 0; i < 4; i++) {
        var toy = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 8, 6),
            new THREE.MeshPhongMaterial({ color: toyColors[i] })
        );
        toy.position.set(1 + Math.random() * 2, 0.15, -1 + Math.random() * 3);
        toy.castShadow = true;
        LIFE.addEnv(toy);
    }
    // shelf
    LIFE.addEnv(LIFE.makeBox(3, 0.1, 0.5, 0x8d6e63, 3, 1.5, -5.8));
    // lamp
    LIFE.addEnv(LIFE.makeBox(0.1, 1, 0.1, 0x757575, 4, 0.5, -4));
    var lamp = new THREE.Mesh(
        new THREE.ConeGeometry(0.4, 0.3, 8),
        new THREE.MeshPhongMaterial({ color: 0xfff176, emissive: 0xfff176, emissiveIntensity: 0.4 })
    );
    lamp.position.set(4, 1.15, -4);
    LIFE.addEnv(lamp);
};

// ---------- HOME ----------
LIFE.buildHome = function() {
    LIFE.makeGround(32, 0x4a7c3f);
    // house floor (raised above zone ground to avoid z-fighting)
    LIFE.addEnv(LIFE.makeBox(14, 0.1, 10, 0xdeb887, 0, 0.08, -5));
    // walls (solid)
    LIFE.addSolid(14, 3.5, 0.3, 0xfff8e1, 0, 1.75, -10);
    LIFE.addSolid(0.3, 3.5, 10, 0xfff8e1, -7, 1.75, -5);
    LIFE.addSolid(0.3, 3.5, 10, 0xfff8e1, 7, 1.75, -5);
    // furniture (solid)
    LIFE.addSolid(3, 1, 1.5, 0x5d4037, 0, 0.5, -8);
    LIFE.addSolid(2, 0.8, 1, 0x795548, -4, 0.4, -8);
    LIFE.addSolid(1.5, 1.8, 0.3, 0x424242, 5, 0.9, -9.7);
    // yard
    LIFE.makeTree(10, 5);
    LIFE.makeTree(-10, 8);
    LIFE.makeTree(12, -3);
    // fence
    for (var x = -15; x <= 15; x += 2) {
        LIFE.addEnv(LIFE.makeBox(0.1, 0.8, 0.1, 0xdeb887, x, 0.4, 15));
        LIFE.addEnv(LIFE.makeBox(0.1, 0.8, 0.1, 0xdeb887, x, 0.4, -15));
    }
};

// ---------- SCHOOL (Elementary) ----------
LIFE.buildSchool = function() {
    LIFE.makeGround(42, 0x4a7c3f);
    // school building (auto collider via makeBuilding)
    LIFE.makeBuilding(0, -15, 20, 5, 8, 0xc62828, 0x8b0000);
    LIFE.addSolid(2, 3, 0.3, 0x5d4037, 0, 1.5, -11.2);
    // swing set
    LIFE.addEnv(LIFE.makeBox(0.1, 2.5, 0.1, 0x757575, -8, 1.25, 5));
    LIFE.addEnv(LIFE.makeBox(0.1, 2.5, 0.1, 0x757575, -5, 1.25, 5));
    LIFE.addEnv(LIFE.makeBox(3.2, 0.1, 0.1, 0x757575, -6.5, 2.5, 5));
    // slide
    var slide = LIFE.makeBox(1, 0.05, 3, 0xfdd835, 6, 1, 8);
    slide.rotation.x = 0.3;
    LIFE.addEnv(slide);
    LIFE.addEnv(LIFE.makeBox(0.1, 2, 0.1, 0x757575, 6.4, 1, 9.5));
    LIFE.addEnv(LIFE.makeBox(0.1, 2, 0.1, 0x757575, 5.6, 1, 9.5));
    // path
    LIFE.addEnv(LIFE.makeBox(3, 0.02, 12, 0x9e9e9e, 0, 0.01, -4));
    // trees
    LIFE.makeTree(-15, 0);
    LIFE.makeTree(15, 3);
    LIFE.makeTree(-12, 12);
    LIFE.makeTree(13, 10);
    // flag
    LIFE.addEnv(LIFE.makeBox(0.08, 5, 0.08, 0xbdbdbd, 10, 2.5, -10));
    LIFE.addEnv(LIFE.makeBox(1.2, 0.7, 0.02, 0x1565c0, 10.7, 4.6, -10));
};

// ---------- HIGH SCHOOL ----------
LIFE.buildHighSchool = function() {
    LIFE.makeGround(42, 0x556b2f);
    LIFE.makeBuilding(0, -18, 28, 8, 10, 0x78909c, 0x546e7a);
    LIFE.addSolid(3, 4, 0.3, 0x5d4037, 0, 2, -13.2);
    // gym
    LIFE.makeBuilding(18, 5, 10, 5, 14, 0x8d6e63, 0x6d4c41);
    // parking lot
    LIFE.addEnv(LIFE.makeBox(15, 0.02, 12, 0x424242, -15, 0.01, 8));
    var carColors = [0xf44336, 0x2196f3, 0x4caf50, 0xffffff, 0x212121];
    for (var i = 0; i < 5; i++) {
        LIFE.addSolid(1.5, 0.8, 3, carColors[i], -18 + i * 3, 0.4, 8 + (i % 2) * 4);
    }
    LIFE.makeTree(-20, -10); LIFE.makeTree(25, -10);
    LIFE.makeTree(-20, 20);  LIFE.makeTree(25, 20);
    // bleachers
    for (var j = 0; j < 4; j++) {
        LIFE.addSolid(8, 0.2, 1, 0x9e9e9e, 18, 0.5 + j * 0.5, 15 + j);
    }
};

// ---------- COLLEGE ----------
LIFE.buildCollege = function() {
    LIFE.makeGround(52, 0x3d6b35);
    LIFE.makeBuilding(-15, -15, 14, 10, 10, 0xbcaaa4, 0x8d6e63);
    LIFE.makeBuilding(15, -10, 12, 7, 10, 0xa1887f, 0x795548);
    LIFE.makeBuilding(20, 15, 10, 12, 8, 0xffcc80, 0xff9800);
    // quad
    LIFE.addEnv(LIFE.makeBox(20, 0.02, 20, 0x66bb6a, 0, 0.01, 5));
    // paths
    LIFE.addEnv(LIFE.makeBox(2, 0.02, 40, 0xbdbdbd, 0, 0.015, 0));
    LIFE.addEnv(LIFE.makeBox(40, 0.02, 2, 0xbdbdbd, 0, 0.015, 5));
    for (var i = 0; i < 8; i++) {
        LIFE.makeTree(-25 + i * 7, 5 + (i % 2) * 4, 1.2);
    }
    // benches (solid)
    for (var j = 0; j < 3; j++) {
        LIFE.addSolid(2, 0.5, 0.6, 0x795548, -5 + j * 5, 0.25, 8);
    }
    // fountain (solid)
    var fountain = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 2, 0.8, 12),
        new THREE.MeshPhongMaterial({ color: 0x90a4ae })
    );
    fountain.position.set(0, 0.4, 5);
    fountain.castShadow = true;
    LIFE.addEnv(fountain);
    LIFE.addCollider(0, 5, 3.5, 3.5);
    var water = new THREE.Mesh(
        new THREE.CylinderGeometry(1.3, 1.3, 0.1, 12),
        new THREE.MeshPhongMaterial({ color: 0x4fc3f7, transparent: true, opacity: 0.7 })
    );
    water.position.set(0, 0.8, 5);
    LIFE.addEnv(water);
};

// ---------- CITY ----------
LIFE.buildCity = function() {
    LIFE.state.homeDoor = null; // clear stale home door reference
    LIFE.makeGround(62, 0x555555);
    // roads
    LIFE.addEnv(LIFE.makeBox(100, 0.02, 6, 0x333333, 0, 0.01, 0));
    LIFE.addEnv(LIFE.makeBox(6, 0.02, 100, 0x333333, 0, 0.01, 0));
    // road lines
    for (var i = -45; i < 45; i += 4) {
        LIFE.addEnv(LIFE.makeBox(2, 0.03, 0.2, 0xffeb3b, i, 0.025, 0));
        LIFE.addEnv(LIFE.makeBox(0.2, 0.03, 2, 0xffeb3b, 0, 0.025, i));
    }
    // sidewalks
    LIFE.addEnv(LIFE.makeBox(100, 0.05, 2, 0x9e9e9e, 0, 0.025, 4));
    LIFE.addEnv(LIFE.makeBox(100, 0.05, 2, 0x9e9e9e, 0, 0.025, -4));
    // filler buildings along road
    var bColors = [0x78909c, 0x90a4ae, 0x607d8b, 0xb0bec5, 0x546e7a, 0x455a64];
    for (var j = 0; j < 4; j++) {
        var xOff = j * 12 - 6;
        var h = 6 + Math.random() * 14;
        LIFE.makeBuilding(xOff, -15, 8, h, 6, bColors[j % bColors.length]);
    }

    // JOB BUILDINGS with signs
    LIFE.JOB_BUILDINGS.forEach(function(jb) {
        LIFE.makeBuilding(jb.x, jb.z, 10, 8, 8, jb.color);
        // sign above door
        var signCanvas = document.createElement('canvas');
        signCanvas.width = 256; signCanvas.height = 64;
        var signCtx = signCanvas.getContext('2d');
        signCtx.fillStyle = 'rgba(0,0,0,0.7)';
        signCtx.fillRect(0, 0, 256, 64);
        signCtx.fillStyle = '#ffffff';
        signCtx.font = 'bold 28px Arial';
        signCtx.textAlign = 'center';
        signCtx.fillText(jb.label, 128, 42);
        var signTexture = new THREE.CanvasTexture(signCanvas);
        var signMat = new THREE.SpriteMaterial({ map: signTexture, transparent: true, depthTest: false });
        var sign = new THREE.Sprite(signMat);
        sign.position.set(jb.x, 9.5, jb.z + 4.5);
        sign.scale.set(3, 0.75, 1);
        LIFE.addEnv(sign);
        // door marker
        LIFE.addEnv(LIFE.makeBox(2, 3, 0.2, 0x5d4037, jb.x, 1.5, jb.z + 4.1));
    });

    // PROPERTY BUILDINGS with signs & price tags
    if (LIFE.PROPERTY_BUILDINGS) {
        LIFE.PROPERTY_BUILDINGS.forEach(function(pb) {
            var prop = LIFE.PROPERTIES[pb.propIdx];
            if (!prop) return;
            LIFE.makeBuilding(pb.x, pb.z, pb.w, pb.h, pb.d, pb.color);
            // sign
            var signCanvas = document.createElement('canvas');
            signCanvas.width = 256; signCanvas.height = 80;
            var signCtx = signCanvas.getContext('2d');
            var owned = false;
            if (LIFE.state.properties) {
                for (var oi = 0; oi < LIFE.state.properties.length; oi++) {
                    if (LIFE.state.properties[oi].name === prop.name) { owned = true; break; }
                }
            }
            signCtx.fillStyle = owned ? 'rgba(76,175,80,0.8)' : 'rgba(0,0,0,0.7)';
            signCtx.fillRect(0, 0, 256, 80);
            signCtx.fillStyle = '#ffffff';
            signCtx.font = 'bold 24px Arial';
            signCtx.textAlign = 'center';
            signCtx.fillText(pb.label, 128, 30);
            signCtx.font = '18px Arial';
            signCtx.fillStyle = owned ? '#c8e6c9' : '#ffeb3b';
            signCtx.fillText(owned ? 'OWNED - $' + prop.rent + '/yr' : 'FOR SALE - $' + prop.cost.toLocaleString(), 128, 58);
            var signTexture = new THREE.CanvasTexture(signCanvas);
            var signMat = new THREE.SpriteMaterial({ map: signTexture, transparent: true, depthTest: false });
            var sign = new THREE.Sprite(signMat);
            sign.position.set(pb.x, pb.h + 1.5, pb.z + pb.d / 2 + 1);
            sign.scale.set(3, 0.9, 1);
            LIFE.addEnv(sign);
            // door
            LIFE.addEnv(LIFE.makeBox(2, 3, 0.2, 0x5d4037, pb.x, 1.5, pb.z + pb.d / 2 + 0.1));
            // if this is a home type and owned, mark the door as enterable
            if (pb.isHome && owned) {
                var doorCanvas = document.createElement('canvas');
                doorCanvas.width = 256; doorCanvas.height = 48;
                var doorCtx = doorCanvas.getContext('2d');
                doorCtx.fillStyle = 'rgba(76,175,80,0.9)';
                doorCtx.fillRect(0, 0, 256, 48);
                doorCtx.fillStyle = '#fff';
                doorCtx.font = 'bold 20px Arial';
                doorCtx.textAlign = 'center';
                doorCtx.fillText('Press G to Enter Home', 128, 32);
                var doorTex = new THREE.CanvasTexture(doorCanvas);
                var doorSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: doorTex, transparent: true, depthTest: false }));
                doorSprite.position.set(pb.x, 3.8, pb.z + pb.d / 2 + 1);
                doorSprite.scale.set(2.5, 0.5, 1);
                LIFE.addEnv(doorSprite);
                // store door location for entering
                LIFE.state.homeDoor = { x: pb.x, z: pb.z + pb.d / 2 + 1, propName: prop.name };
            }
        });
    }

    // REAL ESTATE OFFICE
    LIFE.makeBuilding(25, 35, 8, 6, 6, 0x2e7d32);
    var reCanvas = document.createElement('canvas');
    reCanvas.width = 256; reCanvas.height = 64;
    var reCtx = reCanvas.getContext('2d');
    reCtx.fillStyle = 'rgba(46,125,50,0.8)';
    reCtx.fillRect(0, 0, 256, 64);
    reCtx.fillStyle = '#ffffff';
    reCtx.font = 'bold 24px Arial';
    reCtx.textAlign = 'center';
    reCtx.fillText('Real Estate Office', 128, 42);
    var reTex = new THREE.CanvasTexture(reCanvas);
    var reSign = new THREE.Sprite(new THREE.SpriteMaterial({ map: reTex, transparent: true, depthTest: false }));
    reSign.position.set(25, 7.5, 35 + 3.1);
    reSign.scale.set(3, 0.75, 1);
    LIFE.addEnv(reSign);
    LIFE.addEnv(LIFE.makeBox(2, 3, 0.2, 0x5d4037, 25, 1.5, 35 + 3.1)); // door

    // park area
    LIFE.makeTree(40, 35); LIFE.makeTree(43, 38); LIFE.makeTree(37, 40);
    LIFE.addSolid(2, 0.5, 0.6, 0x795548, 40, 0.25, 37);
    // street lamps
    for (var k = -40; k <= 40; k += 15) {
        LIFE.addEnv(LIFE.makeBox(0.1, 4, 0.1, 0x757575, k, 2, 5));
        var lmp = new THREE.PointLight(0xfff3e0, 0.3, 8);
        lmp.position.set(k, 4.2, 5);
        LIFE.addEnv(lmp);
    }
    // parked cars (solid)
    for (var c = 0; c < 6; c++) {
        var cc = LIFE.CLOTHES_COLORS[Math.floor(Math.random() * LIFE.CLOTHES_COLORS.length)];
        LIFE.addSolid(1.5, 0.8, 3, cc, -35 + c * 8, 0.4, 7);
    }
};

// ---------- PLAYER HOME (interior) ----------
LIFE.buildPlayerHome = function() {
    LIFE.makeGround(30, 0xdeb887);
    var isLuxury = false;
    if (LIFE.state.properties) {
        for (var i = 0; i < LIFE.state.properties.length; i++) {
            if (LIFE.state.properties[i].name.indexOf('Luxury') >= 0 || LIFE.state.properties[i].name.indexOf('Mansion') >= 0) {
                isLuxury = true; break;
            }
        }
    }

    var floorColor = isLuxury ? 0xd7b98e : 0xdeb887;
    var wallColor = isLuxury ? 0xfff9c4 : 0xfff8e1;
    var roomW = isLuxury ? 18 : 12;
    var roomD = isLuxury ? 14 : 10;

    // wooden floor
    LIFE.addEnv(LIFE.makeBox(roomW, 0.1, roomD, floorColor, 0, 0.05, 0));
    // walls
    LIFE.addSolid(roomW, 3.5, 0.3, wallColor, 0, 1.75, -roomD / 2);
    LIFE.addSolid(0.3, 3.5, roomD, wallColor, -roomW / 2, 1.75, 0);
    LIFE.addSolid(0.3, 3.5, roomD, wallColor, roomW / 2, 1.75, 0);
    // front wall with door gap
    LIFE.addSolid((roomW / 2 - 1.5), 3.5, 0.3, wallColor, -(roomW / 4 + 0.75), 1.75, roomD / 2);
    LIFE.addSolid((roomW / 2 - 1.5), 3.5, 0.3, wallColor, (roomW / 4 + 0.75), 1.75, roomD / 2);
    // door frame top
    LIFE.addEnv(LIFE.makeBox(3, 0.5, 0.3, wallColor, 0, 3.25, roomD / 2));
    // door exit sign
    var exitCanvas = document.createElement('canvas');
    exitCanvas.width = 256; exitCanvas.height = 48;
    var exitCtx = exitCanvas.getContext('2d');
    exitCtx.fillStyle = 'rgba(244,67,54,0.9)';
    exitCtx.fillRect(0, 0, 256, 48);
    exitCtx.fillStyle = '#fff';
    exitCtx.font = 'bold 20px Arial';
    exitCtx.textAlign = 'center';
    exitCtx.fillText('Press G to Leave Home', 128, 32);
    var exitTex = new THREE.CanvasTexture(exitCanvas);
    var exitSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: exitTex, transparent: true, depthTest: false }));
    exitSprite.position.set(0, 3.8, roomD / 2 + 0.5);
    exitSprite.scale.set(2.5, 0.5, 1);
    LIFE.addEnv(exitSprite);

    // ceiling
    LIFE.addEnv(LIFE.makeBox(roomW + 0.6, 0.15, roomD + 0.6, 0xefebe9, 0, 3.5, 0));

    // LIVING ROOM FURNITURE
    // couch
    LIFE.addSolid(3.5, 0.8, 1.2, isLuxury ? 0x5d4037 : 0x795548, -2, 0.4, -roomD / 2 + 2);
    LIFE.addEnv(LIFE.makeBox(3.5, 0.5, 0.15, isLuxury ? 0x4e342e : 0x6d4c41, -2, 0.9, -roomD / 2 + 1.4));
    // cushions
    LIFE.addEnv(LIFE.makeBox(0.8, 0.2, 0.5, 0xef5350, -3, 0.9, -roomD / 2 + 2));
    LIFE.addEnv(LIFE.makeBox(0.8, 0.2, 0.5, 0x42a5f5, -1, 0.9, -roomD / 2 + 2));

    // TV (solid)
    LIFE.addSolid(0.3, 1.2, 0.3, 0x212121, roomW / 2 - 1, 0.6, -roomD / 2 + 1.5);
    LIFE.addEnv(LIFE.makeBox(2.5, 1.5, 0.1, 0x1a1a1a, roomW / 2 - 1, 1.8, -roomD / 2 + 1.5));
    // TV screen glow
    var tvScreen = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 1.3, 0.05),
        new THREE.MeshPhongMaterial({ color: 0x4fc3f7, emissive: 0x225577, emissiveIntensity: 0.5 })
    );
    tvScreen.position.set(roomW / 2 - 1, 1.8, -roomD / 2 + 1.56);
    LIFE.addEnv(tvScreen);

    // coffee table
    LIFE.addEnv(LIFE.makeBox(2, 0.08, 1, 0x8d6e63, -2, 0.45, -roomD / 2 + 3.5));
    LIFE.addEnv(LIFE.makeBox(0.08, 0.4, 0.08, 0x795548, -2.8, 0.2, -roomD / 2 + 3.1));
    LIFE.addEnv(LIFE.makeBox(0.08, 0.4, 0.08, 0x795548, -1.2, 0.2, -roomD / 2 + 3.1));
    LIFE.addEnv(LIFE.makeBox(0.08, 0.4, 0.08, 0x795548, -2.8, 0.2, -roomD / 2 + 3.9));
    LIFE.addEnv(LIFE.makeBox(0.08, 0.4, 0.08, 0x795548, -1.2, 0.2, -roomD / 2 + 3.9));

    // KITCHEN area (right side)
    // counter
    LIFE.addSolid(3, 1, 0.8, 0x90a4ae, roomW / 2 - 2, 0.5, roomD / 2 - 2);
    LIFE.addEnv(LIFE.makeBox(3, 0.05, 0.8, 0xfafafa, roomW / 2 - 2, 1.02, roomD / 2 - 2));
    // fridge
    LIFE.addSolid(1, 2.2, 0.8, 0xeceff1, roomW / 2 - 1, 1.1, roomD / 2 - 2);

    // DINING TABLE
    LIFE.addSolid(2.5, 0.8, 1.5, 0x8d6e63, 3, 0.4, 0);
    // chairs
    for (var ci = 0; ci < 4; ci++) {
        var cx = 2 + (ci % 2) * 2;
        var cz = -0.6 + Math.floor(ci / 2) * 1.2;
        LIFE.addEnv(LIFE.makeBox(0.5, 0.5, 0.5, 0x6d4c41, cx, 0.25, cz));
        LIFE.addEnv(LIFE.makeBox(0.5, 0.6, 0.08, 0x6d4c41, cx, 0.8, cz - 0.22));
    }

    // BED area (left back corner)
    LIFE.addSolid(3, 0.5, 2, isLuxury ? 0x4e342e : 0x5d4037, -roomW / 2 + 2.5, 0.25, -roomD / 2 + 2);
    // mattress
    LIFE.addEnv(LIFE.makeBox(2.8, 0.2, 1.8, 0xfafafa, -roomW / 2 + 2.5, 0.6, -roomD / 2 + 2));
    // pillow
    LIFE.addEnv(LIFE.makeBox(0.8, 0.15, 0.4, 0xe8eaf6, -roomW / 2 + 2.5, 0.72, -roomD / 2 + 1.2));
    // blanket
    LIFE.addEnv(LIFE.makeBox(2.5, 0.05, 1.2, isLuxury ? 0xc62828 : 0x1565c0, -roomW / 2 + 2.5, 0.72, -roomD / 2 + 2.5));

    // BATHROOM (luxury homes)
    if (isLuxury) {
        // bathtub
        var tub = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 0.7, 1.2),
            new THREE.MeshPhongMaterial({ color: 0xfafafa })
        );
        tub.position.set(roomW / 2 - 2, 0.35, -roomD / 2 + 5);
        LIFE.addEnv(tub);
        LIFE.addCollider(roomW / 2 - 2, -roomD / 2 + 5, 2.5, 1.2);
        // water
        var bathWater = new THREE.Mesh(
            new THREE.BoxGeometry(2.2, 0.05, 0.9),
            new THREE.MeshPhongMaterial({ color: 0x4fc3f7, transparent: true, opacity: 0.5 })
        );
        bathWater.position.set(roomW / 2 - 2, 0.6, -roomD / 2 + 5);
        LIFE.addEnv(bathWater);
    }

    // lights
    var homeLight = new THREE.PointLight(0xfff3e0, 0.6, 15);
    homeLight.position.set(0, 3.2, 0);
    LIFE.addEnv(homeLight);
    var homeLight2 = new THREE.PointLight(0xfff3e0, 0.3, 10);
    homeLight2.position.set(-3, 3.2, -3);
    LIFE.addEnv(homeLight2);

    // lamp fixture
    LIFE.addEnv(LIFE.makeBox(0.3, 0.08, 0.3, 0xffeb3b, 0, 3.4, 0));

    // rug
    var rug = new THREE.Mesh(
        new THREE.CircleGeometry(2, 16),
        new THREE.MeshPhongMaterial({ color: isLuxury ? 0x8e24aa : 0xc62828 })
    );
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(-1, 0.12, 0);
    LIFE.addEnv(rug);

    // kids toys if have kids
    if (LIFE.state.hasKids) {
        var toyColors = [0xff1744, 0x2979ff, 0xffea00, 0x00e676];
        for (var ti = 0; ti < 3; ti++) {
            var toy = new THREE.Mesh(
                new THREE.SphereGeometry(0.12, 6, 4),
                new THREE.MeshPhongMaterial({ color: toyColors[ti] })
            );
            toy.position.set(-3 + Math.random() * 2, 0.12, 1 + Math.random() * 2);
            LIFE.addEnv(toy);
        }
    }

    // photo frames on wall
    LIFE.addEnv(LIFE.makeBox(0.8, 0.6, 0.05, 0x5d4037, -roomW / 2 + 0.2, 2, -2));
    LIFE.addEnv(LIFE.makeBox(0.6, 0.8, 0.05, 0x5d4037, -roomW / 2 + 0.2, 2, 0));
};

// ---------- ELEMENTARY CLASSROOM ----------
LIFE.buildClassroom = function() {
    LIFE.makeGround(20, 0xf5deb3);
    // floor
    LIFE.addEnv(LIFE.makeBox(12, 0.1, 10, 0xdeb887, 0, 0.05, 0));
    // walls
    LIFE.addSolid(12, 3.5, 0.3, 0xfff8e1, 0, 1.75, -5);
    LIFE.addSolid(0.3, 3.5, 10, 0xfff8e1, -6, 1.75, 0);
    LIFE.addSolid(0.3, 3.5, 10, 0xfff8e1, 6, 1.75, 0);
    LIFE.addSolid(12, 3.5, 0.3, 0xfff8e1, 0, 1.75, 5);
    // ceiling
    LIFE.addEnv(LIFE.makeBox(12.6, 0.15, 10.6, 0xefebe9, 0, 3.5, 0));
    // chalkboard
    LIFE.addEnv(LIFE.makeBox(5, 2.2, 0.1, 0x2e7d32, 0, 2.2, -4.8));
    // chalk text on board
    var boardCanvas = document.createElement('canvas');
    boardCanvas.width = 256; boardCanvas.height = 128;
    var bCtx = boardCanvas.getContext('2d');
    bCtx.fillStyle = '#2e7d32'; bCtx.fillRect(0, 0, 256, 128);
    bCtx.fillStyle = '#fff'; bCtx.font = 'bold 28px Arial'; bCtx.textAlign = 'center';
    bCtx.fillText('Good Morning Class!', 128, 50);
    bCtx.font = '20px Arial';
    bCtx.fillText('ABC  123  + - x', 128, 90);
    var boardTex = new THREE.CanvasTexture(boardCanvas);
    var boardPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(4.5, 2),
        new THREE.MeshBasicMaterial({ map: boardTex, transparent: true })
    );
    boardPlane.position.set(0, 2.2, -4.7);
    LIFE.addEnv(boardPlane);
    // teacher desk
    LIFE.addSolid(2.5, 0.8, 1, 0x5d4037, 0, 0.4, -3.5);
    // student desks (3 rows of 3)
    for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 3; c++) {
            var dx = -2.5 + c * 2.5;
            var dz = -1 + r * 2;
            LIFE.addSolid(1.2, 0.55, 0.7, 0xbcaaa4, dx, 0.28, dz);
            // chair
            LIFE.addEnv(LIFE.makeBox(0.5, 0.4, 0.5, 0x8d6e63, dx, 0.2, dz + 0.7));
        }
    }
    // colorful decorations
    var decoColors = [0xff1744, 0x2979ff, 0xffea00, 0x00e676, 0xff9100];
    for (var d = 0; d < 5; d++) {
        LIFE.addEnv(LIFE.makeBox(0.6, 0.8, 0.05, decoColors[d], -4 + d * 2, 2.8, -4.8));
    }
    // clock
    var clock = new THREE.Mesh(
        new THREE.CircleGeometry(0.25, 12),
        new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    clock.position.set(5, 2.8, -4.78);
    LIFE.addEnv(clock);
    // light
    var classLight = new THREE.PointLight(0xfff3e0, 0.7, 15);
    classLight.position.set(0, 3.3, 0);
    LIFE.addEnv(classLight);
    var classLight2 = new THREE.PointLight(0xfff3e0, 0.3, 10);
    classLight2.position.set(-3, 3.3, -2);
    LIFE.addEnv(classLight2);
    // door
    LIFE.addEnv(LIFE.makeBox(1.5, 2.8, 0.15, 0x5d4037, 0, 1.4, 4.9));
    // EXIT sign
    var exitCanvas = document.createElement('canvas');
    exitCanvas.width = 256; exitCanvas.height = 48;
    var exitCtx = exitCanvas.getContext('2d');
    exitCtx.fillStyle = 'rgba(244,67,54,0.9)';
    exitCtx.fillRect(0, 0, 256, 48);
    exitCtx.fillStyle = '#fff';
    exitCtx.font = 'bold 20px Arial';
    exitCtx.textAlign = 'center';
    exitCtx.fillText('Press G to Leave Classroom', 128, 32);
    var exitTex = new THREE.CanvasTexture(exitCanvas);
    var exitSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: exitTex, transparent: true, depthTest: false }));
    exitSprite.position.set(0, 3.2, 4.9);
    exitSprite.scale.set(2.5, 0.5, 1);
    LIFE.addEnv(exitSprite);
};

// ---------- HIGH SCHOOL CLASSROOM ----------
LIFE.buildHSClassroom = function() {
    LIFE.makeGround(25, 0xbdbdbd);
    // floor
    LIFE.addEnv(LIFE.makeBox(14, 0.1, 12, 0x9e9e9e, 0, 0.05, 0));
    // walls
    LIFE.addSolid(14, 4, 0.3, 0xeceff1, 0, 2, -6);
    LIFE.addSolid(0.3, 4, 12, 0xeceff1, -7, 2, 0);
    LIFE.addSolid(0.3, 4, 12, 0xeceff1, 7, 2, 0);
    LIFE.addSolid(14, 4, 0.3, 0xeceff1, 0, 2, 6);
    // ceiling
    LIFE.addEnv(LIFE.makeBox(14.6, 0.15, 12.6, 0xe0e0e0, 0, 4, 0));
    // whiteboard
    LIFE.addEnv(LIFE.makeBox(6, 2.5, 0.1, 0xfafafa, 0, 2.5, -5.8));
    LIFE.addEnv(LIFE.makeBox(6.2, 0.08, 0.15, 0x757575, 0, 1.3, -5.75));
    // whiteboard text
    var wbCanvas = document.createElement('canvas');
    wbCanvas.width = 256; wbCanvas.height = 128;
    var wCtx = wbCanvas.getContext('2d');
    wCtx.fillStyle = '#fafafa'; wCtx.fillRect(0, 0, 256, 128);
    wCtx.fillStyle = '#333'; wCtx.font = 'bold 22px Arial'; wCtx.textAlign = 'center';
    wCtx.fillText('Chapter 7: Review', 128, 45);
    wCtx.font = '16px Arial';
    wCtx.fillText('Homework due Friday', 128, 80);
    var wbTex = new THREE.CanvasTexture(wbCanvas);
    var wbPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(5.5, 2.3),
        new THREE.MeshBasicMaterial({ map: wbTex, transparent: true })
    );
    wbPlane.position.set(0, 2.5, -5.7);
    LIFE.addEnv(wbPlane);
    // teacher desk
    LIFE.addSolid(3, 0.8, 1.2, 0x5d4037, -3, 0.4, -4);
    // student desks (4 rows of 4)
    for (var r = 0; r < 4; r++) {
        for (var c = 0; c < 4; c++) {
            var dx = -4.5 + c * 3;
            var dz = -1.5 + r * 2;
            LIFE.addSolid(1.2, 0.6, 0.7, 0x90a4ae, dx, 0.3, dz);
            LIFE.addEnv(LIFE.makeBox(0.5, 0.45, 0.5, 0x78909c, dx, 0.22, dz + 0.7));
        }
    }
    // posters on walls
    var posterColors = [0x1565c0, 0xc62828, 0x2e7d32, 0xff6f00];
    for (var p = 0; p < 4; p++) {
        LIFE.addEnv(LIFE.makeBox(0.8, 1, 0.05, posterColors[p], -6, 2.8, -3 + p * 2.5));
    }
    // clock
    var hsClock = new THREE.Mesh(
        new THREE.CircleGeometry(0.3, 12),
        new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    hsClock.position.set(6, 3.2, -5.78);
    LIFE.addEnv(hsClock);
    // fluorescent lights
    LIFE.addEnv(LIFE.makeBox(4, 0.05, 0.3, 0xffffff, -2, 3.9, -2));
    LIFE.addEnv(LIFE.makeBox(4, 0.05, 0.3, 0xffffff, 2, 3.9, 2));
    var hsLight = new THREE.PointLight(0xf5f5f5, 0.7, 15);
    hsLight.position.set(0, 3.8, 0);
    LIFE.addEnv(hsLight);
    // door
    LIFE.addEnv(LIFE.makeBox(1.8, 3, 0.15, 0x5d4037, 0, 1.5, 5.9));
    // EXIT sign
    var exitCanvas = document.createElement('canvas');
    exitCanvas.width = 256; exitCanvas.height = 48;
    var exitCtx = exitCanvas.getContext('2d');
    exitCtx.fillStyle = 'rgba(244,67,54,0.9)';
    exitCtx.fillRect(0, 0, 256, 48);
    exitCtx.fillStyle = '#fff';
    exitCtx.font = 'bold 20px Arial';
    exitCtx.textAlign = 'center';
    exitCtx.fillText('Press G to Leave Classroom', 128, 32);
    var exitTex = new THREE.CanvasTexture(exitCanvas);
    var exitSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: exitTex, transparent: true, depthTest: false }));
    exitSprite.position.set(0, 3.8, 5.9);
    exitSprite.scale.set(2.5, 0.5, 1);
    LIFE.addEnv(exitSprite);
};

// ---------- JAIL ----------
LIFE.buildJail = function() {
    LIFE.makeGround(20, 0x3e2723);
    LIFE.ambientLight.intensity = 0.2;
    LIFE.dirLight.intensity = 0.3;

    // cell floor
    LIFE.addEnv(LIFE.makeBox(8, 0.1, 8, 0x616161, 0, 0.05, 0));
    // cell walls (back, left, right)
    LIFE.addSolid(8, 3.5, 0.3, 0x757575, 0, 1.75, -4);
    LIFE.addSolid(0.3, 3.5, 8, 0x757575, -4, 1.75, 0);
    LIFE.addSolid(0.3, 3.5, 8, 0x757575, 4, 1.75, 0);
    // ceiling
    LIFE.addEnv(LIFE.makeBox(8.6, 0.2, 8.6, 0x616161, 0, 3.5, 0));
    // bars on front wall
    for (var b = -3; b <= 3; b += 0.8) {
        LIFE.addEnv(LIFE.makeBox(0.08, 3.5, 0.08, 0x424242, b, 1.75, 4));
    }
    // horizontal bar
    LIFE.addEnv(LIFE.makeBox(8, 0.12, 0.12, 0x424242, 0, 2.5, 4));
    LIFE.addEnv(LIFE.makeBox(8, 0.12, 0.12, 0x424242, 0, 0.5, 4));
    // front wall collider (bars block player)
    LIFE.addCollider(0, 4, 8, 0.3);

    // bed (cot)
    LIFE.addSolid(2.5, 0.4, 1.2, 0x5d4037, -2.5, 0.2, -3);
    // mattress
    LIFE.addEnv(LIFE.makeBox(2.3, 0.1, 1.0, 0x90a4ae, -2.5, 0.45, -3));
    // pillow
    LIFE.addEnv(LIFE.makeBox(0.5, 0.15, 0.4, 0xbdbdbd, -3.4, 0.5, -3));

    // toilet
    var toiletBase = LIFE.makeBox(0.6, 0.5, 0.6, 0xeeeeee, 3, 0.25, -3.2);
    LIFE.addEnv(toiletBase);
    LIFE.addCollider(3, -3.2, 0.8, 0.8);
    var toiletTop = LIFE.makeBox(0.55, 0.08, 0.4, 0xeeeeee, 3, 0.54, -3);
    LIFE.addEnv(toiletTop);

    // sink
    LIFE.addEnv(LIFE.makeBox(0.1, 1.0, 0.1, 0x757575, 3, 0.5, -1.5));
    LIFE.addEnv(LIFE.makeBox(0.5, 0.06, 0.4, 0xeeeeee, 3, 1.0, -1.5));
    LIFE.addCollider(3, -1.5, 0.6, 0.6);

    // dim light above
    var jailLight = new THREE.PointLight(0xfff3e0, 0.4, 10);
    jailLight.position.set(0, 3.3, 0);
    LIFE.addEnv(jailLight);
    // light fixture
    LIFE.addEnv(LIFE.makeBox(0.2, 0.1, 0.2, 0xffeb3b, 0, 3.4, 0));

    // corridor beyond bars (visible but not accessible)
    LIFE.addEnv(LIFE.makeBox(12, 0.1, 6, 0x4e342e, 0, 0.05, 7));
    LIFE.addEnv(LIFE.makeBox(12, 3.5, 0.3, 0x616161, 0, 1.75, 10));
    // opposite cell bars
    for (var ob = -3; ob <= 3; ob += 0.8) {
        LIFE.addEnv(LIFE.makeBox(0.08, 3.5, 0.08, 0x424242, ob, 1.75, 10));
    }
    // corridor light
    var corrLight = new THREE.PointLight(0xfff3e0, 0.2, 12);
    corrLight.position.set(0, 3.2, 7);
    LIFE.addEnv(corrLight);
};

// ---------- EXECUTION (Gallows) ----------
LIFE.buildExecution = function() {
    LIFE.makeGround(40, 0x2e2e2e);
    LIFE.ambientLight.intensity = 0.2;
    LIFE.dirLight.intensity = 0.3;

    // dark cobblestone courtyard
    LIFE.addEnv(LIFE.makeBox(20, 0.05, 20, 0x3e3e3e, 0, 0.025, 0));

    // GALLOWS PLATFORM
    var platY = 2.5;
    var platW = 6, platD = 5;
    // platform floor
    var platform = LIFE.makeBox(platW, 0.3, platD, 0x5d4037, 0, platY, 0);
    LIFE.addEnv(platform);
    // platform support beams underneath
    LIFE.addEnv(LIFE.makeBox(0.3, platY, 0.3, 0x4e342e, -2.5, platY / 2, -2));
    LIFE.addEnv(LIFE.makeBox(0.3, platY, 0.3, 0x4e342e, 2.5, platY / 2, -2));
    LIFE.addEnv(LIFE.makeBox(0.3, platY, 0.3, 0x4e342e, -2.5, platY / 2, 2));
    LIFE.addEnv(LIFE.makeBox(0.3, platY, 0.3, 0x4e342e, 2.5, platY / 2, 2));

    // STAIRS (7 steps, right side)
    for (var s = 0; s < 7; s++) {
        var stepH = (s + 1) * (platY / 7);
        LIFE.addEnv(LIFE.makeBox(1.8, 0.2, 0.7, 0x6d4c41, 3.5, stepH - 0.1, -2.5 + s * 0.7));
    }

    // GALLOWS FRAME - two vertical posts + horizontal beam
    var postH = 4;
    var beamY = platY + postH;
    // left post
    LIFE.addEnv(LIFE.makeBox(0.25, postH, 0.25, 0x4e342e, -1.2, platY + postH / 2, 0));
    // right post
    LIFE.addEnv(LIFE.makeBox(0.25, postH, 0.25, 0x4e342e, 1.2, platY + postH / 2, 0));
    // horizontal beam
    LIFE.addEnv(LIFE.makeBox(3, 0.25, 0.25, 0x4e342e, 0, beamY, 0));
    // support brace (angled strut, simplified as diagonal box)
    var brace = LIFE.makeBox(0.15, 2.0, 0.15, 0x4e342e, -1.2, platY + postH - 1.2, 0);
    brace.rotation.z = 0.6;
    LIFE.addEnv(brace);
    var brace2 = LIFE.makeBox(0.15, 2.0, 0.15, 0x4e342e, 1.2, platY + postH - 1.2, 0);
    brace2.rotation.z = -0.6;
    LIFE.addEnv(brace2);

    // ROPE - vertical cylinder from beam down
    var ropeLen = 2.2;
    var rope = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, ropeLen, 6),
        new THREE.MeshPhongMaterial({ color: 0xbcaaa4 })
    );
    rope.position.set(0, beamY - ropeLen / 2, 0);
    LIFE.addEnv(rope);

    // NOOSE LOOP (torus at bottom of rope)
    var noose = new THREE.Mesh(
        new THREE.TorusGeometry(0.15, 0.03, 8, 12),
        new THREE.MeshPhongMaterial({ color: 0xbcaaa4 })
    );
    noose.position.set(0, beamY - ropeLen - 0.05, 0);
    noose.rotation.x = Math.PI / 2;
    LIFE.addEnv(noose);

    // TRAPDOOR (separate piece that will animate)
    var trapdoor = LIFE.makeBox(2, 0.15, 1.5, 0x795548, 0, platY - 0.08, 0);
    LIFE.addEnv(trapdoor);

    // Store references for animation
    LIFE.executionData = {
        rope: rope,
        noose: noose,
        trapdoor: trapdoor,
        beamY: beamY,
        platY: platY,
        ropeLen: ropeLen
    };

    // LEVER (pulls the trapdoor)
    LIFE.addEnv(LIFE.makeBox(0.1, 1.2, 0.1, 0x5d4037, 2.2, platY + 0.6, -1.5));
    var leverHandle = LIFE.makeBox(0.06, 0.5, 0.06, 0x8d6e63, 2.2, platY + 1.45, -1.5);
    LIFE.addEnv(leverHandle);
    LIFE.executionData.lever = leverHandle;

    // WALLS - prison courtyard walls
    LIFE.addEnv(LIFE.makeBox(30, 5, 0.5, 0x424242, 0, 2.5, -12));
    LIFE.addEnv(LIFE.makeBox(0.5, 5, 24, 0x424242, -15, 2.5, 0));
    LIFE.addEnv(LIFE.makeBox(0.5, 5, 24, 0x424242, 15, 2.5, 0));

    // torches (lights with warm glow)
    var torchPositions = [[-6, 3, -11], [6, 3, -11], [-14, 3, -5], [14, 3, -5]];
    torchPositions.forEach(function(tp) {
        LIFE.addEnv(LIFE.makeBox(0.1, 0.6, 0.1, 0x5d4037, tp[0], tp[1], tp[2]));
        var torch = new THREE.PointLight(0xff6600, 0.5, 10);
        torch.position.set(tp[0], tp[1] + 0.5, tp[2]);
        LIFE.addEnv(torch);
    });

    // crowd area (wooden barriers)
    LIFE.addEnv(LIFE.makeBox(12, 0.8, 0.15, 0x5d4037, 0, 0.4, 6));
    LIFE.addEnv(LIFE.makeBox(12, 0.8, 0.15, 0x5d4037, 0, 0.4, 8));

    // spawn crowd NPCs (just static characters watching)
    var crowdPositions = [
        [-4, 7], [-2, 7], [0, 7], [2, 7], [4, 7],
        [-3, 9], [-1, 9], [1, 9], [3, 9],
        [-5, 8], [5, 8]
    ];
    crowdPositions.forEach(function(cp) {
        var c = LIFE.createCharacter(1.77,
            LIFE.SKIN_COLORS[Math.floor(Math.random() * LIFE.SKIN_COLORS.length)],
            LIFE.CLOTHES_COLORS[Math.floor(Math.random() * LIFE.CLOTHES_COLORS.length)],
            false, { female: Math.random() < 0.5 }
        );
        c.group.position.set(cp[0], 0, cp[1]);
        c.group.rotation.y = Math.PI; // face gallows
        LIFE.addEnv(c.group);
    });

    // executioner NPC (black hood)
    var executioner = LIFE.createCharacter(1.85, 0x333333, 0x212121, false);
    executioner.group.position.set(2, platY + 0.15, -1);
    executioner.group.rotation.y = Math.PI;
    LIFE.addEnv(executioner.group);
    LIFE.executionData.executioner = executioner;
};

// ---------- RETIREMENT ----------
LIFE.buildRetirement = function() {
    LIFE.makeGround(42, 0x5a8f4a);
    // paths
    LIFE.addEnv(LIFE.makeBox(30, 0.02, 2, 0xd7ccc8, 0, 0.01, 0));
    LIFE.addEnv(LIFE.makeBox(2, 0.02, 30, 0xd7ccc8, 0, 0.01, 0));
    // pond
    var pond = new THREE.Mesh(
        new THREE.CircleGeometry(4, 16),
        new THREE.MeshPhongMaterial({ color: 0x4fc3f7, transparent: true, opacity: 0.6 })
    );
    pond.rotation.x = -Math.PI / 2;
    pond.position.set(8, 0.02, 8);
    LIFE.addEnv(pond);
    // circle of trees
    for (var i = 0; i < 12; i++) {
        var a = (i / 12) * Math.PI * 2;
        LIFE.makeTree(Math.cos(a) * 18, Math.sin(a) * 18, 1.3);
    }
    // benches (solid)
    LIFE.addSolid(2, 0.5, 0.6, 0x795548, 3, 0.25, 1);
    LIFE.addSolid(2, 0.5, 0.6, 0x795548, -5, 0.25, -4);
    LIFE.addSolid(2, 0.5, 0.6, 0x795548, 0, 0.25, 10);
    // small house
    LIFE.makeBuilding(-15, -15, 6, 4, 5, 0xffcc80, 0x8d6e63);
    // gazebo
    var roof = new THREE.Mesh(
        new THREE.ConeGeometry(3, 2, 6),
        new THREE.MeshPhongMaterial({ color: 0x8d6e63 })
    );
    roof.position.set(-8, 4, 8);
    LIFE.addEnv(roof);
    for (var j = 0; j < 6; j++) {
        var ang = (j / 6) * Math.PI * 2;
        LIFE.addEnv(LIFE.makeBox(0.15, 3, 0.15, 0xa1887f,
            -8 + Math.cos(ang) * 2.5, 1.5, 8 + Math.sin(ang) * 2.5));
    }
    // flowers
    var flowerColors = [0xff4081, 0xffeb3b, 0xe040fb, 0xff6e40];
    for (var f = 0; f < 20; f++) {
        var flower = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 6, 4),
            new THREE.MeshPhongMaterial({ color: flowerColors[f % flowerColors.length] })
        );
        flower.position.set(-20 + Math.random() * 40, 0.15, -20 + Math.random() * 40);
        LIFE.addEnv(flower);
    }
};

// ---------- HOSPITAL ----------
LIFE.buildHospital = function() {
    LIFE.makeGround(25, 0xe0e0e0);
    LIFE.ambientLight.intensity = 0.7;
    LIFE.dirLight.intensity = 0.9;

    var roomW = 14, roomD = 12;
    // linoleum floor
    LIFE.addEnv(LIFE.makeBox(roomW, 0.1, roomD, 0xeeeeee, 0, 0.05, 0));
    // walls
    LIFE.addSolid(roomW, 3.5, 0.3, 0xfafafa, 0, 1.75, -roomD / 2);
    LIFE.addSolid(0.3, 3.5, roomD, 0xfafafa, -roomW / 2, 1.75, 0);
    LIFE.addSolid(0.3, 3.5, roomD, 0xfafafa, roomW / 2, 1.75, 0);
    // front wall with door gap
    LIFE.addSolid((roomW / 2 - 1.5), 3.5, 0.3, 0xfafafa, -(roomW / 4 + 0.75), 1.75, roomD / 2);
    LIFE.addSolid((roomW / 2 - 1.5), 3.5, 0.3, 0xfafafa, (roomW / 4 + 0.75), 1.75, roomD / 2);
    // door frame top
    LIFE.addEnv(LIFE.makeBox(3, 0.5, 0.3, 0xfafafa, 0, 3.25, roomD / 2));
    // ceiling
    LIFE.addEnv(LIFE.makeBox(roomW + 0.6, 0.15, roomD + 0.6, 0xf5f5f5, 0, 3.5, 0));

    // HOSPITAL BED (main patient bed, center-left)
    // bed frame
    LIFE.addSolid(3, 0.6, 1.5, 0xe0e0e0, -3, 0.3, -2);
    // mattress
    LIFE.addEnv(LIFE.makeBox(2.8, 0.15, 1.4, 0xfafafa, -3, 0.68, -2));
    // pillow
    LIFE.addEnv(LIFE.makeBox(0.7, 0.12, 0.4, 0xe3f2fd, -4.1, 0.75, -2));
    // blanket
    LIFE.addEnv(LIFE.makeBox(2.0, 0.05, 1.2, 0x90caf9, -2.5, 0.78, -2));
    // bed rails
    LIFE.addEnv(LIFE.makeBox(0.05, 0.4, 1.5, 0xbdbdbd, -4.5, 0.8, -2));
    LIFE.addEnv(LIFE.makeBox(0.05, 0.4, 1.5, 0xbdbdbd, -1.5, 0.8, -2));

    // SECOND BED (right side, empty)
    LIFE.addSolid(3, 0.6, 1.5, 0xe0e0e0, 4, 0.3, -2);
    LIFE.addEnv(LIFE.makeBox(2.8, 0.15, 1.4, 0xfafafa, 4, 0.68, -2));
    LIFE.addEnv(LIFE.makeBox(0.7, 0.12, 0.4, 0xe3f2fd, 2.9, 0.75, -2));
    LIFE.addEnv(LIFE.makeBox(0.05, 0.4, 1.5, 0xbdbdbd, 2.5, 0.8, -2));
    LIFE.addEnv(LIFE.makeBox(0.05, 0.4, 1.5, 0xbdbdbd, 5.5, 0.8, -2));

    // CURTAIN DIVIDER between beds
    LIFE.addEnv(LIFE.makeBox(0.02, 2.5, 1.6, 0xbbdefb, 0.5, 1.5, -2));
    // curtain rail
    LIFE.addEnv(LIFE.makeBox(0.06, 0.06, 1.8, 0xbdbdbd, 0.5, 2.8, -2));

    // IV STAND (next to patient bed)
    LIFE.addEnv(LIFE.makeBox(0.06, 2.0, 0.06, 0xbdbdbd, -1.8, 1.0, -1.2));
    // IV bag
    LIFE.addEnv(LIFE.makeBox(0.15, 0.25, 0.08, 0xe3f2fd, -1.8, 2.1, -1.2));
    // IV tube (thin line down)
    LIFE.addEnv(LIFE.makeBox(0.02, 0.8, 0.02, 0x90caf9, -1.8, 1.6, -1.2));

    // HEART MONITOR
    LIFE.addSolid(0.6, 0.8, 0.3, 0x37474f, -1.8, 0.4, -3.2);
    // screen
    var monCanvas = document.createElement('canvas');
    monCanvas.width = 128; monCanvas.height = 64;
    var monCtx = monCanvas.getContext('2d');
    monCtx.fillStyle = '#1a1a1a';
    monCtx.fillRect(0, 0, 128, 64);
    monCtx.strokeStyle = '#4caf50';
    monCtx.lineWidth = 2;
    monCtx.beginPath();
    monCtx.moveTo(0, 32);
    for (var i = 0; i < 128; i += 4) {
        var y = 32 + Math.sin(i * 0.15) * 12 * (i % 32 < 8 ? 2 : 0.5);
        monCtx.lineTo(i, y);
    }
    monCtx.stroke();
    var monTex = new THREE.CanvasTexture(monCanvas);
    var monSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: monTex, transparent: true }));
    monSprite.position.set(-1.8, 1.0, -3.0);
    monSprite.scale.set(0.5, 0.25, 1);
    LIFE.addEnv(monSprite);

    // MEDICAL CABINET (back wall)
    LIFE.addSolid(2, 2, 0.5, 0xeceff1, 4, 1, -5.5);
    // cabinet doors
    LIFE.addEnv(LIFE.makeBox(0.9, 1.8, 0.05, 0xcfd8dc, 3.5, 1, -5.2));
    LIFE.addEnv(LIFE.makeBox(0.9, 1.8, 0.05, 0xcfd8dc, 4.5, 1, -5.2));
    // red cross on wall
    LIFE.addEnv(LIFE.makeBox(0.6, 0.15, 0.05, 0xf44336, 0, 2.5, -5.8));
    LIFE.addEnv(LIFE.makeBox(0.15, 0.6, 0.05, 0xf44336, 0, 2.5, -5.8));

    // DESK (doctor's desk, right front)
    LIFE.addSolid(2.5, 0.8, 1, 0x8d6e63, 4, 0.4, 3);
    // chair
    LIFE.addEnv(LIFE.makeBox(0.5, 0.5, 0.5, 0x424242, 4, 0.25, 4));
    LIFE.addEnv(LIFE.makeBox(0.5, 0.6, 0.08, 0x424242, 4, 0.8, 4.22));
    // clipboard on desk
    LIFE.addEnv(LIFE.makeBox(0.3, 0.02, 0.4, 0xffecb3, 3.5, 0.82, 3));
    // pen
    LIFE.addEnv(LIFE.makeBox(0.02, 0.02, 0.2, 0x1565c0, 4.2, 0.82, 3));

    // SINK (left wall)
    LIFE.addEnv(LIFE.makeBox(0.1, 0.8, 0.1, 0xbdbdbd, -6.7, 0.4, 2));
    LIFE.addEnv(LIFE.makeBox(0.6, 0.06, 0.4, 0xfafafa, -6.7, 0.85, 2));
    LIFE.addCollider(-6.7, 2, 0.8, 0.6);

    // FLUORESCENT LIGHTS
    LIFE.addEnv(LIFE.makeBox(4, 0.05, 0.3, 0xffffff, -2, 3.4, 0));
    LIFE.addEnv(LIFE.makeBox(4, 0.05, 0.3, 0xffffff, 3, 3.4, 0));
    var hosLight1 = new THREE.PointLight(0xf5f5f5, 0.6, 12);
    hosLight1.position.set(-2, 3.3, 0);
    LIFE.addEnv(hosLight1);
    var hosLight2 = new THREE.PointLight(0xf5f5f5, 0.6, 12);
    hosLight2.position.set(3, 3.3, 0);
    LIFE.addEnv(hosLight2);

    // EXIT sign above door
    var exitCanvas = document.createElement('canvas');
    exitCanvas.width = 256; exitCanvas.height = 48;
    var exitCtx = exitCanvas.getContext('2d');
    exitCtx.fillStyle = 'rgba(76,175,80,0.9)';
    exitCtx.fillRect(0, 0, 256, 48);
    exitCtx.fillStyle = '#fff';
    exitCtx.font = 'bold 20px Arial';
    exitCtx.textAlign = 'center';
    exitCtx.fillText('Press G to Leave Hospital', 128, 32);
    var exitTex = new THREE.CanvasTexture(exitCanvas);
    var exitSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: exitTex, transparent: true, depthTest: false }));
    exitSprite.position.set(0, 3.8, roomD / 2 + 0.5);
    exitSprite.scale.set(2.5, 0.5, 1);
    LIFE.addEnv(exitSprite);

    // WHEELCHAIR in corner
    var wheelBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.05, 8),
        new THREE.MeshPhongMaterial({ color: 0x424242 })
    );
    wheelBase.position.set(-5.5, 0.3, 4.5);
    LIFE.addEnv(wheelBase);
    LIFE.addEnv(LIFE.makeBox(0.5, 0.7, 0.08, 0x424242, -5.5, 0.65, 4.8));
};

// ---------- DEATH ----------
LIFE.buildDeath = function() {
    LIFE.makeGround(40, 0x111111);
    LIFE.ambientLight.intensity = 0.15;
    LIFE.dirLight.intensity = 0.1;
};

// ---------- CAR DEALERSHIP ----------
LIFE.buildDealership = function() {
    LIFE.makeGround(28, 0xbdbdbd);

    // Main showroom building
    LIFE.makeBuilding(0, -8, 16, 6, 10, 0x263238);
    // Glass front
    var glassMat = new THREE.MeshPhongMaterial({ color: 0xbbdefb, emissive: 0x335577, emissiveIntensity: 0.4, transparent: true, opacity: 0.5 });
    var glassFront = new THREE.Mesh(new THREE.BoxGeometry(14, 5, 0.1), glassMat);
    glassFront.position.set(0, 3, -3.06);
    LIFE.addEnv(glassFront);

    // Dealership sign
    var signCanvas = document.createElement('canvas');
    signCanvas.width = 512; signCanvas.height = 96;
    var ctx = signCanvas.getContext('2d');
    ctx.fillStyle = '#d32f2f';
    ctx.fillRect(0, 0, 512, 96);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('AUTO DEALERSHIP', 256, 64);
    var signTex = new THREE.CanvasTexture(signCanvas);
    var sign = new THREE.Sprite(new THREE.SpriteMaterial({ map: signTex, transparent: true, depthTest: false }));
    sign.position.set(0, 8, -8);
    sign.scale.set(6, 1.1, 1);
    LIFE.addEnv(sign);

    // Display lot - concrete pad
    LIFE.addEnv(LIFE.makeBox(20, 0.05, 16, 0x9e9e9e, 0, 0.025, 8));

    // Display cars on the lot
    var displayColors = [0xef5350, 0x42a5f5, 0x212121, 0xffc107, 0x2e7d32, 0x78909c];
    var carNames = LIFE.CAR_MODELS || [];
    for (var i = 0; i < Math.min(carNames.length, 6); i++) {
        var cx = -8 + (i % 3) * 8;
        var cz = i < 3 ? 4 : 12;
        var car = carNames[i];
        // Car body
        var carBody = LIFE.makeBox(1.8, 0.7, 3.5, car.color, cx, 0.4, cz);
        LIFE.addEnv(carBody);
        // Car cabin (top part)
        LIFE.addEnv(LIFE.makeBox(1.5, 0.5, 1.8, car.color, cx, 0.95, cz - 0.2));
        // Windows
        var winM = new THREE.MeshPhongMaterial({ color: 0xbbdefb, emissive: 0x445566, emissiveIntensity: 0.3, transparent: true, opacity: 0.6 });
        var win1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.4, 1.6), winM);
        win1.position.set(cx + 0.76, 0.95, cz - 0.2);
        LIFE.addEnv(win1);
        var win2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.4, 1.6), winM);
        win2.position.set(cx - 0.76, 0.95, cz - 0.2);
        LIFE.addEnv(win2);
        // Wheels (dark cylinders)
        var wheelMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
        var wheelGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.15, 8);
        var positions = [
            [cx - 0.85, 0.25, cz + 1], [cx + 0.85, 0.25, cz + 1],
            [cx - 0.85, 0.25, cz - 1.2], [cx + 0.85, 0.25, cz - 1.2]
        ];
        for (var w = 0; w < 4; w++) {
            var wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(positions[w][0], positions[w][1], positions[w][2]);
            LIFE.addEnv(wheel);
        }
        // Price tag
        var tagCanvas = document.createElement('canvas');
        tagCanvas.width = 256; tagCanvas.height = 64;
        var tctx = tagCanvas.getContext('2d');
        tctx.fillStyle = 'rgba(0,0,0,0.75)';
        tctx.fillRect(0, 0, 256, 64);
        tctx.fillStyle = '#ffffff';
        tctx.font = 'bold 20px Arial';
        tctx.textAlign = 'center';
        tctx.fillText(car.name, 128, 24);
        tctx.fillStyle = '#66bb6a';
        tctx.font = 'bold 22px Arial';
        tctx.fillText('$' + car.cost.toLocaleString(), 128, 52);
        var tagTex = new THREE.CanvasTexture(tagCanvas);
        var tagSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagTex, transparent: true, depthTest: false }));
        tagSprite.position.set(cx, 2, cz);
        tagSprite.scale.set(2, 0.5, 1);
        LIFE.addEnv(tagSprite);
    }

    // Decorative elements
    // Flags / pennants pole
    LIFE.addEnv(LIFE.makeBox(0.1, 6, 0.1, 0x757575, -10, 3, 0));
    LIFE.addEnv(LIFE.makeBox(0.1, 6, 0.1, 0x757575, 10, 3, 0));

    // Parking spaces painted lines
    for (var p = 0; p < 4; p++) {
        LIFE.addEnv(LIFE.makeBox(0.08, 0.02, 4, 0xffffff, -6 + p * 4, 0.04, 8));
    }
};

// ============================================================
// EVENT CENTER
// ============================================================
LIFE.buildEventCenter = function() {
    LIFE.makeGround(36, 0x555555);

    // Main venue building - large concert hall
    LIFE.makeBuilding(0, -10, 24, 12, 16, 0x37474f, 0x263238);

    // Venue sign
    var signCanvas = document.createElement('canvas');
    signCanvas.width = 512; signCanvas.height = 96;
    var ctx = signCanvas.getContext('2d');
    ctx.fillStyle = '#9c27b0';
    ctx.fillRect(0, 0, 512, 96);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('EVENT CENTER', 256, 64);
    var signTex = new THREE.CanvasTexture(signCanvas);
    var sign = new THREE.Sprite(new THREE.SpriteMaterial({ map: signTex, transparent: true, depthTest: false }));
    sign.position.set(0, 14, -18);
    sign.scale.set(6, 1.1, 1);
    LIFE.addEnv(sign);

    // Outdoor amphitheater / stage area
    // Stage platform
    LIFE.addSolid(10, 1.5, 6, 0x4a148c, 0, 0.75, 12);
    // Stage back wall
    LIFE.addEnv(LIFE.makeBox(10, 5, 0.3, 0x311b92, 0, 3, 15));
    // Stage lights (colored boxes on poles)
    var lightColors = [0xff1744, 0x2979ff, 0x00e676, 0xffea00, 0xff6d00, 0xd500f9];
    for (var li = 0; li < 6; li++) {
        var lx = -4 + li * 1.6;
        LIFE.addEnv(LIFE.makeBox(0.08, 3, 0.08, 0x424242, lx, 5, 15.1));
        var bulb = LIFE.makeBox(0.3, 0.3, 0.3, lightColors[li], lx, 6.3, 15.1);
        bulb.material = new THREE.MeshPhongMaterial({ color: lightColors[li], emissive: lightColors[li], emissiveIntensity: 0.5 });
        LIFE.addEnv(bulb);
    }

    // Big event screen behind stage
    var screenMat = new THREE.MeshPhongMaterial({ color: 0x111111, emissive: 0x222244, emissiveIntensity: 0.3 });
    var screen = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 0.2), screenMat);
    screen.position.set(0, 5.5, 15.15);
    LIFE.addEnv(screen);

    // Seating rows (tiered benches)
    for (var row = 0; row < 4; row++) {
        var rz = 4 - row * 3;
        var ry = row * 0.3;
        LIFE.addEnv(LIFE.makeBox(12, 0.5, 1.5, 0x616161, 0, ry + 0.25, rz));
    }

    // Ticket booth (left side)
    LIFE.addSolid(3, 3, 3, 0x6a1b9a, -14, 1.5, 0);
    var boothCanvas = document.createElement('canvas');
    boothCanvas.width = 256; boothCanvas.height = 64;
    var bctx = boothCanvas.getContext('2d');
    bctx.fillStyle = 'rgba(156,39,176,0.8)';
    bctx.fillRect(0, 0, 256, 64);
    bctx.fillStyle = '#ffffff';
    bctx.font = 'bold 28px Arial';
    bctx.textAlign = 'center';
    bctx.fillText('TICKETS', 128, 44);
    var boothTex = new THREE.CanvasTexture(boothCanvas);
    var boothSign = new THREE.Sprite(new THREE.SpriteMaterial({ map: boothTex, transparent: true, depthTest: false }));
    boothSign.position.set(-14, 4, 0);
    boothSign.scale.set(2, 0.5, 1);
    LIFE.addEnv(boothSign);

    // Food stands (right side)
    LIFE.addSolid(3, 2.5, 3, 0xbf360c, 14, 1.25, -2);
    LIFE.addSolid(3, 2.5, 3, 0xe65100, 14, 1.25, 4);

    // Decorative lamp posts
    for (var lp = 0; lp < 6; lp++) {
        var lpx = -15 + lp * 6;
        LIFE.addEnv(LIFE.makeBox(0.12, 4, 0.12, 0x424242, lpx, 2, -6));
        var lamp = LIFE.makeBox(0.5, 0.3, 0.5, 0xffeb3b, lpx, 4.2, -6);
        lamp.material = new THREE.MeshPhongMaterial({ color: 0xffeb3b, emissive: 0xffeb3b, emissiveIntensity: 0.3 });
        LIFE.addEnv(lamp);
    }

    // Parking area
    LIFE.addEnv(LIFE.makeBox(20, 0.05, 12, 0x424242, 0, 0.02, -22));
    for (var pk = 0; pk < 5; pk++) {
        LIFE.addEnv(LIFE.makeBox(0.08, 0.02, 5, 0xffffff, -8 + pk * 4, 0.04, -22));
    }

    // Trees around perimeter
    LIFE.makeTree(-20, 10, 0.8);
    LIFE.makeTree(20, 10, 0.8);
    LIFE.makeTree(-20, -15, 0.9);
    LIFE.makeTree(20, -15, 0.9);
};
