let scene, renderer;
let camera;
let objetos = [];
let textures = [];
let tomove;
let x2 = 0,
    y2 = 0,
    z2 = -15,
    dif = 0;

init();
animationLoop();

function init() {
    //Defino cámara
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        75, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    camera.position.set(0, 0, 10);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    //Plano
    Plano(0, 0, -15, 10, 10, new THREE.TextureLoader().load("../Fotos IA/DALL·E 2022-12-01 18.38.41 - panda red mad scientist mixing sparkling chemicals, digital art.png"));
    Plano(0, 0, -15, 10, 10, new THREE.TextureLoader().load("../Fotos IA/DALL·E 2022-12-01 18.39.26 - panda mad scientist mixing sparkling chemicals, digital art.png"));
    Plano(0, 0, -15, 10, 10, new THREE.TextureLoader().load("../Fotos IA/DALL·E 2022-12-01 18.39.35 - panda mad scientist mixing sparkling chemicals, digital art.png"));
    Plano(0, 0, -15, 10, 10, new THREE.TextureLoader().load("../Fotos IA/DALL·E 2022-12-01 18.40.17 - panda samurai, digital art.png"));
    Plano(0, 0, -15, 10, 10, new THREE.TextureLoader().load("../Fotos IA/DALL·E 2022-12-01 18.40.40 - panda mago, digital art.png"));
    Plano(0, 0, -15, 10, 10, new THREE.TextureLoader().load("../Fotos IA/DALL·E 2022-12-01 18.41.33 - panda wizard, digital art.png"));
    Plano(0, 0, -15, 10, 10, new THREE.TextureLoader().load("../Fotos IA/DALL·E 2022-12-01 18.42.35 - panda dressed like doctor strange, digital art.png"));
    Plano(0, 0, -15, 10, 10, new THREE.TextureLoader().load("../Fotos IA/DALL·E 2022-12-01 18.42.41 - panda dressed like doctor strange, digital art.png"));
    Plano(0, 0, -15, 10, 10, new THREE.TextureLoader().load("../Fotos IA/DALL·E 2022-12-01 18.42.46 - panda dressed like doctor strange, digital art.png"));
    Plano(0, 0, -15, 10, 10, new THREE.TextureLoader().load("../Fotos IA/DALL·E 2022-12-01 18.44.16 - panda like thor, digital art.png"));
    Plano(0, 0, -15, 10, 10, new THREE.TextureLoader().load("../Fotos IA/DALL·E 2022-12-01 18.45.00 - panda like black panther, digital art.png"));
    Plano(0, 0, -15, 10, 10, new THREE.TextureLoader().load("../Fotos IA/DALL·E 2022-12-01 18.45.34 - panda informatic digital art.png"));
    Plano(0, 0, -15, 10, 10, new THREE.TextureLoader().load("../Fotos IA/DALL·E 2022-12-01 18.46.07 - panda ciberpunk, digital art.png"));
    Plano(0, 0, -15, 10, 10, new THREE.TextureLoader().load("../Fotos IA/DALL·E 2022-12-01 18.46.59 - panda harry potter, digital art.png"));

    // Define keyframes y propiedades a interpolar
    const tween1 = new TWEEN.Tween({ x: 0, y: 0, z: -15 })
        .to({ x: 0, y: 0, z: 2 }, 5000)
        .onUpdate((coords) => {
            tomove.position.x = coords.x;
            tomove.position.y = coords.y;
            tomove.position.z = coords.z;
        })
        .easing(TWEEN.Easing.Exponential.InOut)
        .delay(100);

    const tween2 = new TWEEN.Tween({ x: 0, y: 0, z: 2 })
        .to({ x: 0, y: 0, z: -15 }, 2000)
        .onUpdate((coords) => {
            tomove.position.x = coords.x;
            tomove.position.y = coords.y;
            tomove.position.z = coords.z;
            updatePosition(i);
        })
        .easing(TWEEN.Easing.Exponential.InOut)
        .delay(100);

    const tween3 = new TWEEN.Tween({ x: 0, y: 0, z0: -15 })
        .to({ x: x2, y: y2, z: z2 }, 100)
        .onUpdate(() => {
            tomove.position.x = x2;
            tomove.position.y = y2;
            tomove.position.z = z2;
        })
        .easing(TWEEN.Easing.Exponential.InOut)
        .delay(100)

    const tweenChangePicture = new TWEEN.Tween()
        .to({}, 0)
        .onUpdate(() => {
            i++;
            if (i > objetos.length - 1) {
                i = 0;
                z2 += 2;
                dif++;
            }
            tomove = objetos[i];
        })

    tween1.chain(tween2);
    tween2.chain(tween3);
    tween3.chain(tweenChangePicture);
    tweenChangePicture.chain(tween1);

    let i = 0;
    tomove = objetos[i];
    tween1.start();
}

function updatePosition(i) {
    i = i % 8
    switch (i) {
        case 0:
            x2 = -13 + dif;
            y2 = 13 - dif;
            break;
        case 1:
            x2 = 0;
            y2 = 13 - dif;
            break;
        case 2:
            x2 = 13 - dif;
            y2 = 13 - dif;
            break;
        case 3:
            x2 = -13 + dif;
            y2 = 0;
            break;
        case 4:
            x2 = 13 - dif;
            y2 = 0;
            break;
        case 5:
            x2 = -13 + dif;
            y2 = -13 + dif;
            break;
        case 6:
            x2 = 0;
            y2 = -13 + dif;
            break;
        case 7:
            x2 = 13 - dif;
            y2 = -13 + dif;
            break;
    }
}

function Plano(x, y, z, w, h, texture) {
    let geometry = new THREE.PlaneGeometry(w, h);
    let material = new THREE.MeshBasicMaterial({});
    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.material.map = texture;
    mesh.material.needsUpdate = true;
    scene.add(mesh);
    objetos.push(mesh);
}

//Bucle de animación
function animationLoop() {
    requestAnimationFrame(animationLoop);
    TWEEN.update();
    renderer.render(scene, camera);
}