// ============================================================
// CHARACTER CREATION
// ============================================================
LIFE.createCharacter = function(height, skinColor, clothesColor, isPlayer) {
    var ch = { group: new THREE.Group(), height: height, parts: {} };

    // babies have much bigger heads, stubbier limbs
    var isBaby = height < 0.5;
    var isToddler = height >= 0.5 && height < 0.7;
    var headR, bodyH, bodyW, bodyD, legH, legW, armH, armW;

    if (isBaby) {
        // very babylike proportions: huge head, tiny round body, stubby limbs
        headR  = height * 0.3;
        bodyH  = height * 0.28;
        bodyW  = height * 0.3;
        bodyD  = height * 0.25;
        legH   = height * 0.15;
        legW   = height * 0.1;
        armH   = height * 0.15;
        armW   = height * 0.08;
    } else if (isToddler) {
        headR  = height * 0.2;
        bodyH  = height * 0.3;
        bodyW  = height * 0.24;
        bodyD  = height * 0.18;
        legH   = height * 0.22;
        legW   = height * 0.09;
        armH   = height * 0.2;
        armW   = height * 0.07;
    } else {
        headR  = height * 0.13;
        bodyH  = height * 0.32;
        bodyW  = height * 0.22;
        bodyD  = height * 0.14;
        legH   = height * 0.28;
        legW   = height * 0.08;
        armH   = height * 0.28;
        armW   = height * 0.07;
    }

    var skinMat = new THREE.MeshPhongMaterial({ color: skinColor });
    var clothesMat = new THREE.MeshPhongMaterial({ color: clothesColor });

    // Head (sphere, bigger for babies)
    var headGeo = isBaby ? new THREE.SphereGeometry(headR, 12, 10) : new THREE.SphereGeometry(headR, 10, 8);
    var head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = legH + bodyH + headR;
    head.castShadow = true;
    ch.group.add(head);
    ch.parts.head = head;

    // Eyes
    var eyeMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
    var eyeWhiteMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
    var eyeR = headR * (isBaby ? 0.2 : 0.15);
    // eye whites for babies (bigger, cuter eyes)
    if (isBaby) {
        var lwh = new THREE.Mesh(new THREE.SphereGeometry(eyeR * 1.6, 6, 4), eyeWhiteMat);
        lwh.position.set(-headR * 0.32, legH + bodyH + headR + headR * 0.05, headR * 0.78);
        ch.group.add(lwh);
        var rwh = new THREE.Mesh(new THREE.SphereGeometry(eyeR * 1.6, 6, 4), eyeWhiteMat);
        rwh.position.set(headR * 0.32, legH + bodyH + headR + headR * 0.05, headR * 0.78);
        ch.group.add(rwh);
    }
    var lEye = new THREE.Mesh(new THREE.SphereGeometry(eyeR, 6, 4), eyeMat);
    lEye.position.set(-headR * 0.32, legH + bodyH + headR + headR * 0.05, headR * 0.85);
    ch.group.add(lEye);
    var rEye = new THREE.Mesh(new THREE.SphereGeometry(eyeR, 6, 4), eyeMat);
    rEye.position.set(headR * 0.32, legH + bodyH + headR + headR * 0.05, headR * 0.85);
    ch.group.add(rEye);

    // Mouth (tiny for baby, adds expression)
    if (isBaby) {
        var mouth = new THREE.Mesh(
            new THREE.SphereGeometry(headR * 0.08, 6, 4),
            new THREE.MeshPhongMaterial({ color: 0xcc6666 })
        );
        mouth.position.set(0, legH + bodyH + headR - headR * 0.25, headR * 0.9);
        ch.group.add(mouth);
    }

    // Body
    var bodyGeo = isBaby
        ? new THREE.SphereGeometry(bodyW * 0.6, 8, 6) // round baby body
        : new THREE.BoxGeometry(bodyW, bodyH, bodyD);
    var body = new THREE.Mesh(bodyGeo, clothesMat);
    body.position.y = isBaby ? legH + bodyH * 0.4 : legH + bodyH / 2;
    if (isBaby) body.scale.y = 1.2;
    body.castShadow = true;
    ch.group.add(body);

    // Legs
    var legColor = isPlayer ? 0x1a237e : new THREE.Color(clothesColor).multiplyScalar(0.7);
    var legMat = new THREE.MeshPhongMaterial({ color: legColor });

    var llG = new THREE.Group();
    llG.position.set(-legW * 0.7, legH, 0);
    var llM = new THREE.Mesh(new THREE.BoxGeometry(legW, legH, legW), legMat);
    llM.position.y = -legH / 2;
    llM.castShadow = true;
    llG.add(llM);
    ch.group.add(llG);
    ch.parts.leftLeg = llG;

    var rlG = new THREE.Group();
    rlG.position.set(legW * 0.7, legH, 0);
    var rlM = new THREE.Mesh(new THREE.BoxGeometry(legW, legH, legW), legMat);
    rlM.position.y = -legH / 2;
    rlM.castShadow = true;
    rlG.add(rlM);
    ch.group.add(rlG);
    ch.parts.rightLeg = rlG;

    // Arms
    var laG = new THREE.Group();
    laG.position.set(-bodyW / 2 - armW / 2, legH + bodyH * (isBaby ? 0.6 : 1), 0);
    var laM = new THREE.Mesh(new THREE.BoxGeometry(armW, armH, armW), skinMat);
    laM.position.y = -armH / 2;
    laM.castShadow = true;
    laG.add(laM);
    ch.group.add(laG);
    ch.parts.leftArm = laG;

    var raG = new THREE.Group();
    raG.position.set(bodyW / 2 + armW / 2, legH + bodyH * (isBaby ? 0.6 : 1), 0);
    var raM = new THREE.Mesh(new THREE.BoxGeometry(armW, armH, armW), skinMat);
    raM.position.y = -armH / 2;
    raM.castShadow = true;
    raG.add(raM);
    ch.group.add(raG);
    ch.parts.rightArm = raG;

    // Diaper for baby (not in womb - naked in womb)
    if (isBaby && skinColor !== clothesColor) {
        var diaper = new THREE.Mesh(
            new THREE.SphereGeometry(bodyW * 0.45, 8, 6),
            new THREE.MeshPhongMaterial({ color: 0xffffff })
        );
        diaper.position.set(0, legH * 0.5, 0);
        diaper.scale.set(1, 0.7, 1.1);
        ch.group.add(diaper);
    }

    ch.group.castShadow = true;
    return ch;
};
