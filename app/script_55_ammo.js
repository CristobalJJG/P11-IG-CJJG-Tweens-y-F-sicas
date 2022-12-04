let camera, controls, scene, renderer;
let textureLoader;
var stats;
const clock = new THREE.Clock();

const mouseCoords = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const ballMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    metalness: 1.,
    roughness: .25,
    transparent: true,
    opacity: .75,
});

// Mundo físico con Ammo
let physicsWorld;
const gravityConstant = 9.8;
let collisionConfiguration;
let dispatcher;
let broadphase;
let solver;

const margin = 0.05; //margen colisiones

const pos = new THREE.Vector3();
const quat = new THREE.Quaternion();
//Variebles temporales para actualizar transformación en el bucle
let transformAux1;
let tempBtVec3_1;

//------------Nuevo------------------//
//const convexBreaker = new ConvexObjectBreaker();
let numObjectsToRemove = 0;
const objectsToRemove = []
for (let i = 0; i < 500; i++) {
    objectsToRemove[i] = null;
}

const impactPoint = new THREE.Vector3();
const impactNormal = new THREE.Vector3();

// Objetos rígidos
const rigidBodies = [];
const softBodies = [];

let softBodyHelpers;


//Inicialización
Ammo().then(function(AmmoLib) {
    Ammo = AmmoLib;
    init();
    animationLoop();
});

function init() {
    initGraphics();
    initLigths()
    initPhysics();
    createObjects();
    initInput();
}

function initGraphics() {
    //Cámara, escena, renderer y control de cámara
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.2,
        2000
    );
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfd1e5);
    camera.position.set(-14, 8, 16);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // displays current and past frames per second attained by scene

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '0px';
    stats.domElement.style.zIndex = 100;
    document.body.appendChild(stats.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 2, 0);
    controls.update();

    textureLoader = new THREE.TextureLoader();

    //Redimensión de la ventana
    window.addEventListener("resize", onWindowResize);
}

function initPhysics() {
    // Configuración Ammo
    // Colisiones
    collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    // Gestor de colisiones convexas y cóncavas
    dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    // Colisión fase amplia
    broadphase = new Ammo.btDbvtBroadphase();
    // Resuelve resricciones de reglas físicas como fuerzas, gravedad, etc.
    solver = new Ammo.btSequentialImpulseConstraintSolver();
    // Crea en mundo físico
    physicsWorld = new Ammo.btDiscreteDynamicsWorld(
        dispatcher,
        broadphase,
        solver,
        collisionConfiguration
    );
    // Establece gravedad
    physicsWorld.setGravity(new Ammo.btVector3(0, -gravityConstant, 0));

    transformAux1 = new Ammo.btTransform();
    tempBtVec3_1 = new Ammo.btVector3(0, 0, 0);

    /*Intento por hacer softBody Ball */
    // const collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
    // const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    // const broadphase = new Ammo.btDbvtBroadphase();
    // const solver = new Ammo.btSequentialImpulseConstraintSolver();
    // const softBodySolver = new Ammo.btDefaultSoftBodySolver();
    // physicsWorld = new Ammo.btSoftRigidDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration, softBodySolver);
    // physicsWorld.setGravity(new Ammo.btVector3(0, gravityConstant, 0));
    // physicsWorld.getWorldInfo().set_m_gravity(new Ammo.btVector3(0, gravityConstant, 0));

    // transformAux1 = new Ammo.btTransform();
}

//Objeto con posición y orientación especificada con cuaternión
function createObject(mass, halfExtents, pos, quat, material) {
    const object = new THREE.Mesh(
        new THREE.BoxGeometry(
            halfExtents.x * 2,
            halfExtents.y * 2,
            halfExtents.z * 2
        ),
        material
    );
    object.position.copy(pos);
    object.quaternion.copy(quat);
    //convexBreaker.prepareBreakableObject(object, mass, new THREE.Vector3(), new THREE.Vector3(), true);
    createDebrisFromBreakableObject(object);
}

function createObjects() {
    // Suelo
    pos.set(0, -0.5, 0);
    quat.set(0, 0, 0, 1);
    const suelo = createBoxWithPhysics(
        40,
        1,
        40,
        0,
        pos,
        quat,
        new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    suelo.receiveShadow = true;
    textureLoader.load(
        "./suelo.png",
        function(texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(15, 15);
            suelo.material.map = texture;
            suelo.material.needsUpdate = true;
        }
    );

    // Stones
    const stoneMass = 120;
    const stoneHalfExtents = new THREE.Vector3(1, 2, 0.15);
    const numStones = 8;
    quat.set(0, 0, 0, 1);
    for (let i = 0; i < numStones; i++) {
        pos.set(0, 2, 15 * (0.5 - i / (numStones + 1)));
        createBoxWithPhysics(stoneMass, stoneHalfExtents, pos, quat, createMaterial(0xB0B0B0));
    }

    // Tower 1

    let tx = 5;
    let ty = tx * 0.5;
    let tz = tx * 0.5;
    const towerMass = 1000;
    //const towerHalfExtents = new THREE.Vector3(tx, ty, tz);
    pos.set(0, 5, 0);
    quat.set(0, 0, 0, 1);
    createObject(tx, ty, tz, towerMass, pos, quat, createMaterial(0xB03014));
    //createBoxWithPhysics(sx, sy, sz, mass, pos, quat, material) 
    // Muro
    createWall();
}

function createWall() {
    const brickMass = 20;
    const brickLength = 2.5;
    const brickDepth = brickLength * 0.5;
    const brickHeight = brickLength * 0.5;
    const numBricksLength = 15;
    const numBricksHeight = 20;
    const z0 = (-numBricksLength * brickLength * 0.5) + 1.5;
    pos.set(15, brickHeight * 0.5, z0);
    quat.set(0, 0, 0, 1);
    for (let j = 0; j < numBricksHeight; j++) {
        //Varía disposición entre filas pares e impares
        const oddRow = j % 2 == 1;

        pos.z = z0;
        if (oddRow)
            pos.z -= 0.25 * brickLength;

        const nRow = oddRow ? numBricksLength + 1 : numBricksLength;
        //Compone fila
        for (let i = 0; i < nRow; i++) {
            let brickLengthCurrent = brickLength;
            let brickMassCurrent = brickMass;

            if (oddRow && (i == 0 || i == nRow - 1)) {
                brickLengthCurrent *= 0.5;
                brickMassCurrent *= 0.5;
            }

            const brick = createBoxWithPhysics(
                brickDepth,
                brickHeight,
                brickLengthCurrent,
                brickMassCurrent,
                pos,
                quat,
                createMaterial()
            );
            brick.castShadow = true;
            brick.receiveShadow = true;

            if (oddRow && (i == 0 || i == nRow - 2))
                pos.z += 0.75 * brickLength;
            else
                pos.z += brickLength;
        }
        pos.y += brickHeight;
    }
}

function createBoxWithPhysics(sx, sy, sz, mass, pos, quat, material) {
    const object = new THREE.Mesh(
        new THREE.BoxGeometry(sx, sy, sz),
        material
    );
    //Estructura geométrica de colisión
    //Crea caja orientada en el espacio, especificando dimensiones
    const shape = new Ammo.btBoxShape(
        new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5)
    );
    //Margen para colisione
    shape.setMargin(margin);
    createRigidBody(object, shape, mass, pos, quat);
    return object;
}

//Creación de cuerpo rígido, con masa, sujeto a fuerzas, colisiones...
function createRigidBody(object, physicsShape, mass, pos, quat, vel, angVel) {
    //Posición
    if (pos) object.position.copy(pos);
    else pos = object.position;

    //Cuaternión, es decir orientación
    if (quat) object.quaternion.copy(quat);
    else quat = object.quaternion;

    //Matriz de transformación
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    const motionState = new Ammo.btDefaultMotionState(transform);
    //Inercia inicial y parámetros de rozamiento, velocidad
    const localInertia = new Ammo.btVector3(0, 0, 0);
    physicsShape.calculateLocalInertia(mass, localInertia);
    //Crea el cuerpo
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(
        mass,
        motionState,
        physicsShape,
        localInertia
    );
    const body = new Ammo.btRigidBody(rbInfo);

    body.setFriction(0.5);

    if (vel)
        body.setLinearVelocity(new Ammo.btVector3(vel.x, vel.y, vel.z));

    if (angVel)
        body.setAngularVelocity(new Ammo.btVector3(angVel.x, angVel.y, angVel.z));

    //Enlaza primitiva gráfica con física
    object.userData.physicsBody = body;
    object.userData.collided = false;

    scene.add(object);
    //Si tiene masa
    if (mass > 0) {
        rigidBodies.push(object);
        // Disable deactivation
        body.setActivationState(4);
    }
    //Añadido al universo físico
    physicsWorld.addRigidBody(body);

    return body;
}

function createMaterial(color) {
    color = color || createRandomColor();
    return new THREE.MeshPhongMaterial({ color: color });
}

function createRandomColor() {
    return Math.floor(Math.random() * (15 << 28));
}

//Evento de ratón
function initInput() {
    window.addEventListener("pointerdown", function(event) {
        //Coordenadas del puntero
        mouseCoords.set(
            (event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1
        );

        raycaster.setFromCamera(mouseCoords, camera);

        // Crea bola como cuerpo rígido y la lanza según coordenadas de ratón
        const ballMass = 200;
        const ballRadius = 0.3;
        const ball = new THREE.Mesh(
            new THREE.SphereGeometry(ballRadius, 14, 10),
            ballMaterial
        );
        ball.castShadow = true;
        ball.receiveShadow = true;
        //Ammo
        //Estructura geométrica de colisión esférica
        const ballShape = new Ammo.btSphereShape(ballRadius);
        ballShape.setMargin(margin);
        pos.copy(raycaster.ray.direction);
        pos.add(raycaster.ray.origin);
        quat.set(0, 0, 0, 1);
        const ballBody = createRigidBody(ball, ballShape, ballMass, pos, quat);

        pos.copy(raycaster.ray.direction);
        pos.multiplyScalar(24);
        ballBody.setLinearVelocity(new Ammo.btVector3(pos.x, pos.y, pos.z));
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animationLoop() {
    requestAnimationFrame(animationLoop);

    const deltaTime = clock.getDelta();
    updatePhysics(deltaTime);

    renderer.render(scene, camera);

    stats.update();
}

function updatePhysics(deltaTime) {
    // Avanza la simulación en función del tiempo
    physicsWorld.stepSimulation(deltaTime, 10);

    // Actualiza cuerpos rígidos
    for (let i = 0, il = rigidBodies.length; i < il; i++) {
        const objThree = rigidBodies[i];
        const objPhys = objThree.userData.physicsBody;
        //Obtiene posición y rotación
        const ms = objPhys.getMotionState();
        //Actualiza la correspondiente primitiva gráfica asociada
        if (ms) {
            ms.getWorldTransform(transformAux1);
            const p = transformAux1.getOrigin();
            const q = transformAux1.getRotation();
            objThree.position.set(p.x(), p.y(), p.z());
            objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());

            objThree.userData.collided = false;
        }
    }

    //Actualiza los objetos
    for (let i = 0, il = dispatcher.getNumManifolds(); i < il; i++) {

        const contactManifold = dispatcher.getManifoldByIndexInternal(i);
        const rb0 = Ammo.castObject(contactManifold.getBody0(), Ammo.btRigidBody);
        const rb1 = Ammo.castObject(contactManifold.getBody1(), Ammo.btRigidBody);

        const threeObject0 = Ammo.castObject(rb0.getUserPointer(), Ammo.btVector3).threeObject;
        const threeObject1 = Ammo.castObject(rb1.getUserPointer(), Ammo.btVector3).threeObject;

        if (!threeObject0 && !threeObject1) {
            continue;
        }

        const userData0 = threeObject0 ? threeObject0.userData : null;
        const userData1 = threeObject1 ? threeObject1.userData : null;

        const breakable0 = userData0 ? userData0.breakable : false;
        const breakable1 = userData1 ? userData1.breakable : false;

        const collided0 = userData0 ? userData0.collided : false;
        const collided1 = userData1 ? userData1.collided : false;

        if ((!breakable0 && !breakable1) || (collided0 && collided1)) {
            continue;
        }

        let contact = false;
        let maxImpulse = 0;
        for (let j = 0, jl = contactManifold.getNumContacts(); j < jl; j++) {

            const contactPoint = contactManifold.getContactPoint(j);

            if (contactPoint.getDistance() < 0) {
                contact = true;
                const impulse = contactPoint.getAppliedImpulse();
                if (impulse > maxImpulse) {
                    maxImpulse = impulse;
                    const pos = contactPoint.get_m_positionWorldOnB();
                    const normal = contactPoint.get_m_normalWorldOnB();
                    impactPoint.set(pos.x(), pos.y(), pos.z());
                    impactNormal.set(normal.x(), normal.y(), normal.z());
                }
                break;
            }

        }
        // If no point has contact, abort
        if (!contact) continue;

        // Subdivision
        const fractureImpulse = 250;

        if (breakable0 && !collided0 && maxImpulse > fractureImpulse) {
            const debris = convexBreaker.subdivideByImpact(threeObject0, impactPoint, impactNormal, 1, 2, 1.5);
            const numObjects = debris.length;
            for (let j = 0; j < numObjects; j++) {
                const vel = rb0.getLinearVelocity();
                const angVel = rb0.getAngularVelocity();
                const fragment = debris[j];
                fragment.userData.velocity.set(vel.x(), vel.y(), vel.z());
                fragment.userData.angularVelocity.set(angVel.x(), angVel.y(), angVel.z());

                createDebrisFromBreakableObject(fragment);
            }
            objectsToRemove[numObjectsToRemove++] = threeObject0;
            userData0.collided = true;
        }

        if (breakable1 && !collided1 && maxImpulse > fractureImpulse) {
            const debris = convexBreaker.subdivideByImpact(threeObject1, impactPoint, impactNormal, 1, 2, 1.5);
            const numObjects = debris.length;
            for (let j = 0; j < numObjects; j++) {
                const vel = rb1.getLinearVelocity();
                const angVel = rb1.getAngularVelocity();
                const fragment = debris[j];
                fragment.userData.velocity.set(vel.x(), vel.y(), vel.z());
                fragment.userData.angularVelocity.set(angVel.x(), angVel.y(), angVel.z());

                createDebrisFromBreakableObject(fragment);
            }
            objectsToRemove[numObjectsToRemove++] = threeObject1;
            userData1.collided = true;
        }
    }

    for (let i = 0; i < numObjectsToRemove; i++) {
        removeDebris(objectsToRemove[i]);
    }
    numObjectsToRemove = 0;
}

function initLigths() {
    const ambientLight = new THREE.AmbientLight(0x707070);
    scene.add(ambientLight);

    const light = new THREE.DirectionalLight("#dddddd", 1);
    light.position.set(-20, 20, 20);
    light.castShadow = true;
    const d = 14;
    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;

    light.shadow.camera.near = 2;
    light.shadow.camera.far = 50;

    light.shadow.mapSize.x = 1024;
    light.shadow.mapSize.y = 1024;

    scene.add(light);
}

function createDebrisFromBreakableObject(object) {
    object.castShadow = true;
    object.receiveShadow = true;

    const shape = createConvexHullPhysicsShape(object.geometry.attributes.position.array);
    shape.setMargin(margin);

    const body = createRigidBody(object, shape, object.userData.mass, null, null, object.userData.velocity, object.userData.angularVelocity);

    // Set pointer back to the three object only in the debris objects
    const btVecUserData = new Ammo.btVector3(0, 0, 0);
    btVecUserData.threeObject = object;
    body.setUserPointer(btVecUserData);
}

function removeDebris(object) {
    scene.remove(object);
    physicsWorld.removeRigidBody(object.userData.physicsBody);

}

function createConvexHullPhysicsShape(coords) {
    const shape = new Ammo.btConvexHullShape();
    for (let i = 0, il = coords.length; i < il; i += 3) {
        tempBtVec3_1.setValue(coords[i], coords[i + 1], coords[i + 2]);
        const lastOne = (i >= (il - 3));
        shape.addPoint(tempBtVec3_1, lastOne);
    }
    return shape;
}