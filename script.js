import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('container3d').appendChild(renderer.domElement);

const kusudamaImages = [
    'kusudama1.jpeg', 'kusudama2.jpeg', 'kusudama3.jpeg', 'kusudama4.jpeg', 
    'kusudama5.jpeg', 'kusudama6.jpeg', 'kusudama7.jpeg', 'kusudama8.jpeg', 
    'kusudama9.jpeg', 'kusudama10.jpeg', 'kusudama11.jpeg', 'kusudama12.jpeg'
];

const group = new THREE.Group();
scene.add(group);

// 1. Create the Dodecahedron
const geometry = new THREE.DodecahedronGeometry(10, 0);
const textureLoader = new THREE.TextureLoader();
const tiles = [];

// 2. Exact Face Distribution Logic
// A dodecahedron has 12 faces. In Three.js, these are made of 36 triangles.
// We need to find the center of each group of 3 triangles.
const posAttribute = geometry.getAttribute('position');
const faceCount = 12;

for (let i = 0; i < faceCount; i++) {
    // Each pentagonal face is represented by 3 triangles (9 vertices)
    const startIndex = i * 9;
    const v1 = new THREE.Vector3().fromBufferAttribute(posAttribute, startIndex);
    const v2 = new THREE.Vector3().fromBufferAttribute(posAttribute, startIndex + 1);
    const v3 = new THREE.Vector3().fromBufferAttribute(posAttribute, startIndex + 2);

    // Find the center point of the face
    const center = new THREE.Vector3()
        .add(v1).add(v2).add(v3).divideScalar(3);

    // Find the vector pointing out from the center (the Normal)
    const normal = center.clone().normalize();

    // Create the Tile (Square/Circle works best to avoid distortion)
    const tex = textureLoader.load(kusudamaImages[i]);
    const tileGeom = new THREE.CircleGeometry(4.2, 32); 
    const tileMat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
    const tile = new THREE.Mesh(tileGeom, tileMat);

    // Position and Orient
    tile.position.copy(normal).multiplyScalar(10.05); // Sit slightly above the surface
    tile.lookAt(normal.multiplyScalar(20)); // Point the face of the photo outwards
    
    tile.userData = { index: i };
    group.add(tile);
    tiles.push(tile);
}

// Faint wireframe for geometric feel
const wireframe = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true, transparent: true, opacity: 0.1 })
);
group.add(wireframe);

camera.position.z = 30;

// 3. Interaction Logic (Same as before, ensures mobile and click work)
let isDragging = false;
let moveStarted = false;
let startX, startY;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('pointerdown', (e) => {
    isDragging = true;
    moveStarted = false;
    startX = e.clientX;
    startY = e.clientY;
});

window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) moveStarted = true;
    group.rotation.y += dx * 0.005;
    group.rotation.x += dy * 0.005;
    startX = e.clientX;
    startY = e.clientY;
});

window.addEventListener('pointerup', (e) => {
    isDragging = false;
    if (moveStarted) return;
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(tiles);
    if (intersects.length > 0) openLightbox(intersects[0].object.userData.index);
});

function animate() {
    requestAnimationFrame(animate);
    if (!isDragging) group.rotation.y += 0.003;
    renderer.render(scene, camera);
}
animate();

function openLightbox(index) {
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    lbImg.src = kusudamaImages[index];
    lb.style.display = 'flex';
}
