// ============================================================
// THREE.JS SCENE SETUP
// ============================================================
LIFE.canvas = document.getElementById('c');

LIFE.renderer = new THREE.WebGLRenderer({ canvas: LIFE.canvas, antialias: true });
LIFE.renderer.setSize(window.innerWidth, window.innerHeight);
LIFE.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
LIFE.renderer.shadowMap.enabled = true;
LIFE.renderer.shadowMap.type = THREE.PCFShadowMap;

LIFE.scene = new THREE.Scene();
LIFE.scene.background = new THREE.Color(0x87ceeb);
LIFE.scene.fog = new THREE.Fog(0x87ceeb, 80, 350);

LIFE.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 800);

LIFE.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
LIFE.scene.add(LIFE.ambientLight);

LIFE.dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
LIFE.dirLight.position.set(10, 20, 10);
LIFE.dirLight.castShadow = true;
LIFE.dirLight.shadow.mapSize.set(1024, 1024);
LIFE.dirLight.shadow.camera.near = 0.5;
LIFE.dirLight.shadow.camera.far = 180;
LIFE.dirLight.shadow.camera.left = -60;
LIFE.dirLight.shadow.camera.right = 60;
LIFE.dirLight.shadow.camera.top = 60;
LIFE.dirLight.shadow.camera.bottom = -60;
LIFE.scene.add(LIFE.dirLight);
LIFE.scene.add(LIFE.dirLight.target);

LIFE.clock = new THREE.Clock();

// ============================================================
// MATERIAL CACHE — share materials by config to enable batching
// ============================================================
LIFE._matCache = {};
LIFE.getMaterial = function(opts) {
    // Build a cache key from material properties
    var key = (opts.color || 0) + '|' + (opts.emissive || 0) + '|' + (opts.emissiveIntensity || 0) +
              '|' + (opts.transparent ? 1 : 0) + '|' + (opts.opacity !== undefined ? opts.opacity : 1) +
              '|' + (opts.side || 0) + '|' + (opts.polygonOffset ? 1 : 0) +
              '|' + (opts.wireframe ? 1 : 0) + '|' + (opts.depthWrite !== undefined ? (opts.depthWrite ? 1 : 0) : 1);
    if (!LIFE._matCache[key]) {
        var mat = new THREE.MeshPhongMaterial(opts);
        // Ensure polygonOffset properties are applied
        if (opts.polygonOffset) {
            mat.polygonOffset = true;
            mat.polygonOffsetFactor = opts.polygonOffsetFactor || -1;
            mat.polygonOffsetUnits = opts.polygonOffsetUnits || -1;
        }
        LIFE._matCache[key] = mat;
    }
    return LIFE._matCache[key];
};

// ============================================================
// 3D HELPER FUNCTIONS
// ============================================================
LIFE.envObjects = [];
LIFE.colliders = [];

LIFE.makeBox = function(w, h, d, color, x, y, z) {
    const m = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        LIFE.getMaterial({ color: color })
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

LIFE.addCollider = function(x, z, w, d, y, h) {
    LIFE.colliders.push({
        minX: x - w / 2,
        maxX: x + w / 2,
        minZ: z - d / 2,
        maxZ: z + d / 2,
        minY: (y !== undefined && h !== undefined) ? y - h / 2 : -999,
        maxY: (y !== undefined && h !== undefined) ? y + h / 2 : 999
    });
};

// make a box, add it to env, and add a collider
LIFE.addSolid = function(w, h, d, color, x, y, z) {
    var box = LIFE.makeBox(w, h, d, color, x, y, z);
    LIFE.addEnv(box);
    LIFE.addCollider(x, z, w, d, y, h);
    // Physics static body
    if (LIFE.physics && LIFE.physics.addStaticBox) {
        LIFE.physics.addStaticBox(w, h, d, x, y, z);
    }
    return box;
};

LIFE.makeTree = function(x, z, scale) {
    scale = scale || 1;
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15 * scale, 0.2 * scale, 2 * scale, 6),
        LIFE.getMaterial({ color: 0x8B4513 })
    );
    trunk.position.set(x, scale, z);
    trunk.castShadow = true;
    g.add(trunk);
    const leaves = new THREE.Mesh(
        new THREE.SphereGeometry(1.2 * scale, 8, 6),
        LIFE.getMaterial({ color: 0x2e7d32 })
    );
    leaves.position.set(x, 2.2 * scale, z);
    leaves.castShadow = true;
    g.add(leaves);
    LIFE.addCollider(x, z, 0.5 * scale, 0.5 * scale, scale, 2 * scale);
    // Physics static body for trunk
    if (LIFE.physics && LIFE.physics.addStaticCylinder) {
        LIFE.physics.addStaticCylinder(0.2 * scale, 2 * scale, x, scale, z);
    }
    return LIFE.addEnv(g);
};

LIFE.makeBuilding = function(x, z, w, h, d, color, roofColor) {
    const g = new THREE.Group();
    const body = LIFE.makeBox(w, h, d, color, x, h / 2, z);
    g.add(body);
    if (roofColor !== undefined) {
        const roof = LIFE.makeBox(w + 0.5, 0.3, d + 0.5, roofColor, x, h + 0.15, z);
        roof.castShadow = false; // roofs don't need to cast shadows
        g.add(roof);
    }
    const winMat = LIFE.getMaterial({ color: 0xbbdefb, emissive: 0x445566, emissiveIntensity: 0.3 });
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
    g._isBuilding = true; // flag for merge pass
    LIFE.addCollider(x, z, w, d, h / 2, h);
    // Physics static body for building
    if (LIFE.physics && LIFE.physics.addStaticBox) {
        LIFE.physics.addStaticBox(w, h, d, x, h / 2, z);
    }
    return LIFE.addEnv(g);
};

LIFE.makeGround = function(size, color) {
    var mat = LIFE.getMaterial({ color: color, polygonOffset: true });
    const g = new THREE.Mesh(
        new THREE.PlaneGeometry(size * 2, size * 2),
        mat
    );
    g.rotation.x = -Math.PI / 2;
    g.position.y = 0.01;
    g.receiveShadow = true;
    return LIFE.addEnv(g);
};

// ============================================================
// STATIC GEOMETRY MERGE — reduces draw calls dramatically
// ============================================================
// Merges all static meshes in a group by material into single meshes.
// Call after building a zone or environment.
LIFE.mergeStaticGroup = function(group) {
    // Collect all leaf meshes grouped by material uuid
    var buckets = {};  // materialUuid -> { mat, geoms[], castShadow, receiveShadow }
    var toRemove = [];

    // Precompute group inverse matrix once
    group.updateWorldMatrix(true, false);
    var groupInverse = new THREE.Matrix4().copy(group.matrixWorld).invert();

    group.traverse(function(obj) {
        if (!obj.isMesh) return;
        if (obj._noMerge) return; // skip flagged meshes (e.g. dynamic)
        var mat = obj.material;
        if (!mat || !mat.uuid) return;
        var key = mat.uuid;
        if (!buckets[key]) {
            buckets[key] = { mat: mat, geoms: [], castShadow: false, receiveShadow: false };
        }
        // Compute matrix relative to the group
        obj.updateWorldMatrix(true, false);
        var localMatrix = new THREE.Matrix4();
        localMatrix.multiplyMatrices(groupInverse, obj.matrixWorld);

        var geom = obj.geometry.clone();
        geom.applyMatrix4(localMatrix);
        buckets[key].geoms.push(geom);
        if (obj.castShadow) buckets[key].castShadow = true;
        if (obj.receiveShadow) buckets[key].receiveShadow = true;
        toRemove.push(obj);
    });

    // Remove old meshes
    for (var ri = 0; ri < toRemove.length; ri++) {
        var m = toRemove[ri];
        if (m.parent) m.parent.remove(m);
        if (m.geometry) m.geometry.dispose();
    }
    // Also remove now-empty groups (but not the root group)
    var emptyGroups = [];
    group.traverse(function(obj) {
        if (obj !== group && obj.isGroup && obj.children.length === 0) emptyGroups.push(obj);
    });
    for (var eg = 0; eg < emptyGroups.length; eg++) {
        if (emptyGroups[eg].parent) emptyGroups[eg].parent.remove(emptyGroups[eg]);
    }

    // Merge each bucket into a single mesh
    for (var key in buckets) {
        var bucket = buckets[key];
        if (bucket.geoms.length === 0) continue;
        var merged = LIFE._mergeBufferGeometries(bucket.geoms);
        if (!merged) continue;
        var mesh = new THREE.Mesh(merged, bucket.mat);
        mesh.castShadow = bucket.castShadow;
        mesh.receiveShadow = bucket.receiveShadow;
        mesh._noMerge = true; // prevent re-merging
        group.add(mesh);
        // Dispose source cloned geometries (skip if merge returned one directly)
        if (bucket.geoms.length > 1) {
            for (var gi = 0; gi < bucket.geoms.length; gi++) bucket.geoms[gi].dispose();
        }
    }
};

// Manual BufferGeometry merge (since BufferGeometryUtils isn't loaded)
LIFE._mergeBufferGeometries = function(geometries) {
    if (geometries.length === 0) return null;
    if (geometries.length === 1) return geometries[0];

    var totalVerts = 0, totalIndices = 0;
    var hasNormals = true, hasUVs = true;

    for (var i = 0; i < geometries.length; i++) {
        var g = geometries[i];
        if (!g.attributes.position) return null;
        totalVerts += g.attributes.position.count;
        if (g.index) totalIndices += g.index.count;
        else totalIndices += g.attributes.position.count;
        if (!g.attributes.normal) hasNormals = false;
        if (!g.attributes.uv) hasUVs = false;
    }

    var positions = new Float32Array(totalVerts * 3);
    var normals = hasNormals ? new Float32Array(totalVerts * 3) : null;
    var uvs = hasUVs ? new Float32Array(totalVerts * 2) : null;
    var indices = new Uint32Array(totalIndices);

    var vertOffset = 0, idxOffset = 0;

    for (var j = 0; j < geometries.length; j++) {
        var geom = geometries[j];
        var pos = geom.attributes.position.array;
        positions.set(pos, vertOffset * 3);

        if (hasNormals && geom.attributes.normal) {
            normals.set(geom.attributes.normal.array, vertOffset * 3);
        }
        if (hasUVs && geom.attributes.uv) {
            uvs.set(geom.attributes.uv.array, vertOffset * 2);
        }

        if (geom.index) {
            var idx = geom.index.array;
            for (var k = 0; k < idx.length; k++) {
                indices[idxOffset + k] = idx[k] + vertOffset;
            }
            idxOffset += idx.length;
        } else {
            // Non-indexed: generate sequential indices
            var count = geom.attributes.position.count;
            for (var k2 = 0; k2 < count; k2++) {
                indices[idxOffset + k2] = vertOffset + k2;
            }
            idxOffset += count;
        }
        vertOffset += geom.attributes.position.count;
    }

    var merged = new THREE.BufferGeometry();
    merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    if (normals) merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    if (uvs) merged.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    merged.setIndex(new THREE.BufferAttribute(indices, 1));
    return merged;
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
    // Clear containers (for interior stages)
    if (LIFE.clearContainers) LIFE.clearContainers();
    // Clear physics static bodies
    if (LIFE.physics && LIFE.physics.clearStatic) LIFE.physics.clearStatic();
};
