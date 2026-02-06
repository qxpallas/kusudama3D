import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // High-def for mobile
document.getElementById('container3d').appendChild(renderer.domElement);

const kusudamaImages = [
    'kusudama1.jpeg', 'kusudama2.jpeg', 'kusudama3.jpeg', 'kusudama4.jpeg', 
    'kusudama5.jpeg', 'kusudama6.jpeg', 'kusudama7.jpeg', 'kusudama8.jpeg', 
    'kusudama9.jpeg', 'kusudama10.jpeg', 'kusudama11.jpeg', 'kusudama12.jpeg'
];

const group = new THREE.Group();
scene.add(group);

// 1. Create the Dodecahedron (12 faces)
const geometry = new THREE.DodecahedronGeometry(10, 0);
const textureLoader = new THREE.TextureLoader();
const tiles = [];

// 2. Math to find the center of each of the 12 faces
const vertices = geometry.attributes.position.array;
const faceCenters = [];

// A dodecahedron has 12 faces; each face is a pentagon (5 vertices)
// There are 60 indices (12 faces * 3 triangles/face * 3 vertices)
// But we can simply use the face normals to place our images
for (let i = 0; i < 12; i++) {
    const material = new THREE.MeshBasicMaterial({ 
        map: textureLoader.load(kusudamaImages[i]),
        side: THREE.DoubleSide
    });

    // Create a circular "disc" for each face to avoid triangular stretching
    const tileGeom = new THREE.CircleGeometry(4.5, 32); 
    const tile = new THREE.Mesh(tileGeom, material);

    // Position the tile based on the dodecahedron's face normals
    const normal = new THREE.Vector3();
    const plane = new THREE.Plane().setFromCoplanarPoints(
        new THREE.Vector3(vertices[i*15], vertices[i*15+1], vertices[i*15+2]),
        new THREE.Vector3(vertices[i*15+3], vertices[i*15+4], vertices[i*15+5]),
        new THREE.Vector3(vertices[i*15+6], vertices[i*15+7], vertices[i*15+8])
    );
    
    tile.position.copy(plane.normal).multiplyScalar(10.1); // Float slightly above
    tile.lookAt(plane.normal.multiplyScalar(20)); // Face outward
    
    tile.userData = { index: i };
    group.add(tile);
    tiles.push(tile);
}

// Add a faint wireframe for structure
const wireMat = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true, transparent: true, opacity: 0.05 });
const body = new THREE.Mesh(geometry, wireMat);
group.add(body);

camera.position.z = 30;

// 3. Mobile-Optimized Interaction (Pointer Events)
let isDragging = false;
let hasMoved = false;
let startX, startY;

window.addEventListener('pointerdown', (e) => {
    isDragging = true;
    hasMoved = false;
    startX = e.clientX;
    startY = e.clientY;
});

window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved = true;

    group.rotation.y += dx * 0.005;
    group.rotation.x += dy * 0.005;
    startX = e.clientX;
    startY = e.clientY;
});

window.addEventListener('pointerup', (e) => {
    isDragging = false;
    if (hasMoved) return; // Ignore clicks if the user was spinning

    const mouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(tiles);

    if (intersects.length > 0) {
        openLightbox(intersects[0].object.userData.index);
    }
});

function animate() {
    requestAnimationFrame(animate);
    if (!isDragging) {
        group.rotation.y += 0.002;
    }
    renderer.render(scene, camera);
}
animate();

function openLightbox(index) {
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    lbImg.src = kusudamaImages[index];
    lb.style.display = 'flex';
}
