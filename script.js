import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio); // Sharpness for mobile
document.getElementById('container3d').appendChild(renderer.domElement);

const kusudamaImages = [
    'kusudama1.jpeg', 'kusudama2.jpeg', 'kusudama3.jpeg', 'kusudama4.jpeg', 
    'kusudama5.jpeg', 'kusudama6.jpeg', 'kusudama7.jpeg', 'kusudama8.jpeg', 
    'kusudama9.jpeg', 'kusudama10.jpeg', 'kusudama11.jpeg', 'kusudama12.jpeg'
];

const group = new THREE.Group();
scene.add(group);

// 1. Create a wireframe icosahedron as a guide
const baseGeom = new THREE.IcosahedronGeometry(12, 0);
const wireframe = new THREE.Mesh(
    baseGeom, 
    new THREE.MeshBasicMaterial({ color: 0x888888, wireframe: true, transparent: true, opacity: 0.1 })
);
group.add(wireframe);

// 2. Place Floating Rectangular Tiles on the faces
const textureLoader = new THREE.TextureLoader();
const tiles = [];

for (let i = 0; i < kusudamaImages.length; i++) {
    const tex = textureLoader.load(kusudamaImages[i]);
    const tileGeom = new THREE.PlaneGeometry(6, 6); // Square tiles won't distort!
    const tileMat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
    const tile = new THREE.Mesh(tileGeom, tileMat);

    // Position logic: Put them at the vertex positions but pushed out slightly
    const vertex = new THREE.Vector3().fromBufferAttribute(baseGeom.attributes.position, i);
    tile.position.copy(vertex).multiplyScalar(1.1); // Float 10% above the surface
    tile.lookAt(0, 0, 0); // Make them face the center
    tile.rotation.y += Math.PI; // Flip to face outward
    
    tile.userData = { index: i };
    group.add(tile);
    tiles.push(tile);
}

camera.position.z = 30;

// 3. Mobile-Optimized Interaction
let isDragging = false;
let moveStarted = false;
let startX, startY;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Detect "Tap" vs "Swipe"
window.addEventListener('pointerdown', (e) => {
    isDragging = true;
    moveStarted = false;
    startX = e.clientX;
    startY = e.clientY;
});

window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    // If moved more than 5px, it's a drag, not a click
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) moveStarted = true;

    group.rotation.y += deltaX * 0.005;
    group.rotation.x += deltaY * 0.005;
    
    startX = e.clientX;
    startY = e.clientY;
});

window.addEventListener('pointerup', (e) => {
    isDragging = false;
    if (moveStarted) return; // Don't open if they were spinning

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(tiles);

    if (intersects.length > 0) {
        openLightbox(intersects[0].object.userData.index);
    }
});

function animate() {
    requestAnimationFrame(animate);
    if (!isDragging) {
        group.rotation.y += 0.003;
    }
    renderer.render(scene, camera);
}
animate();
