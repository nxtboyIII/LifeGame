// ============================================================
// THREE.JS SCENE SETUP
// ============================================================
LIFE.canvas = document.getElementById('c');

LIFE.renderer = new THREE.WebGLRenderer({ canvas: LIFE.canvas, antialias: true });
LIFE.renderer.setSize(window.innerWidth, window.innerHeight);
LIFE.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
LIFE.renderer.shadowMap.enabled = true;
LIFE.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

LIFE.scene = new THREE.Scene();
LIFE.scene.background = new THREE.Color(0x87ceeb);
LIFE.scene.fog = new THREE.Fog(0x87ceeb, 50, 200);

LIFE.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);

LIFE.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
LIFE.scene.add(LIFE.ambientLight);

LIFE.dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
LIFE.dirLight.position.set(10, 20, 10);
LIFE.dirLight.castShadow = true;
LIFE.dirLight.shadow.mapSize.set(1024, 1024);
LIFE.dirLight.shadow.camera.near = 0.5;
LIFE.dirLight.shadow.camera.far = 120;
LIFE.dirLight.shadow.camera.left = -50;
LIFE.dirLight.shadow.camera.right = 50;
LIFE.dirLight.shadow.camera.top = 50;
LIFE.dirLight.shadow.camera.bottom = -50;
LIFE.scene.add(LIFE.dirLight);
LIFE.scene.add(LIFE.dirLight.target);

LIFE.clock = new THREE.Clock();

// ============================================================
// 3D HELPER FUNCTIONS
// ============================================================
LIFE.envObjects = [];
LIFE.colliders = [];

LIFE.makeBox = function(w, h, d, color, x, y, z) {
    const m = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshPhongMaterial({ color })
    );
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
};

LIFE.addEnv = function(obj) {
    LIFE.scene.add(obj);
    LIFE.envObjects.push(obj);
    return obj;
};

LIFE.addCollider = function(x, z, w, d) {
    LIFE.colliders.push({
        minX: x - w / 2,
        maxX: x + w / 2,
        minZ: z - d / 2,
        maxZ: z + d / 2
    });
};

// make a box, add it to env, and add a collider
LIFE.addSolid = function(w, h, d, color, x, y, z) {
    var box = LIFE.makeBox(w, h, d, color, x, y, z);
    LIFE.addEnv(box);
    LIFE.addCollider(x, z, w, d);
    return box;
};

LIFE.makeTree = function(x, z, scale) {
    scale = scale || 1;
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15 * scale, 0.2 * scale, 2 * scale, 6),
        new THREE.MeshPhongMaterial({ color: 0x8B4513 })
    );
    trunk.position.set(x, scale, z);
    trunk.castShadow = true;
    g.add(trunk);
    const leaves = new THREE.Mesh(
        new THREE.SphereGeometry(1.2 * scale, 8, 6),
        new THREE.MeshPhongMaterial({ color: 0x2e7d32 })
    );
    leaves.position.set(x, 2.2 * scale, z);
    leaves.castShadow = true;
    g.add(leaves);
    LIFE.addCollider(x, z, 0.5 * scale, 0.5 * scale);
    return LIFE.addEnv(g);
};

LIFE.makeBuilding = function(x, z, w, h, d, color, roofColor) {
    const g = new THREE.Group();
    const body = LIFE.makeBox(w, h, d, color, x, h / 2, z);
    g.add(body);
    if (roofColor !== undefined) {
        const roof = LIFE.makeBox(w + 0.5, 0.3, d + 0.5, roofColor, x, h + 0.15, z);
        g.add(roof);
    }
    const winMat = new THREE.MeshPhongMaterial({ color: 0xbbdefb, emissive: 0x445566, emissiveIntensity: 0.3 });
    for (let wy = 2; wy < h - 0.5; wy += 2) {
        for (let wx = -w / 2 + 1; wx < w / 2; wx += 2) {
            const win1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.1), winMat);
            win1.position.set(x + wx, wy, z + d / 2 + 0.06);
            g.add(win1);
            const win2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.1), winMat);
            win2.position.set(x + wx, wy, z - d / 2 - 0.06);
            g.add(win2);
        }
    }
    LIFE.addCollider(x, z, w, d);
    return LIFE.addEnv(g);
};

LIFE.makeGround = function(size, color) {
    var mat = new THREE.MeshPhongMaterial({ color: color });
    mat.polygonOffset = true;
    mat.polygonOffsetFactor = -1;
    mat.polygonOffsetUnits = -1;
    const g = new THREE.Mesh(
        new THREE.PlaneGeometry(size * 2, size * 2),
        mat
    );
    g.rotation.x = -Math.PI / 2;
    g.position.y = 0.01;
    g.receiveShadow = true;
    return LIFE.addEnv(g);
};

LIFE.clearEnvironment = function() {
    LIFE.envObjects.forEach(obj => LIFE.scene.remove(obj));
    LIFE.envObjects = [];
    LIFE.colliders = [];
    // Clear pathfinding cache since colliders changed
    if (LIFE.pathfinding) LIFE.pathfinding._cache = {};
    // Clear dropped items and world items
    if (LIFE.clearDroppedItems) LIFE.clearDroppedItems();
    if (LIFE.clearWorldItems) LIFE.clearWorldItems();
};
