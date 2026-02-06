import * as THREE from 'three';

const container = document.getElementById('container3d');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Create the Icosahedron Geometry
const geometry = new THREE.IcosahedronGeometry(10, 0); // Radius 10
const material = new THREE.MeshBasicMaterial({ color: 0xcccccc, wireframe: true, transparent: true, opacity: 0.2 });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Your 10 Images
const textureLoader = new THREE.TextureLoader();
const kusudamaImages = [
    'kusudama1.jpeg', 'kusudama2.jpeg', 'kusudama3.jpeg', 'kusudama4.jpeg', 'kusudama5.jpeg',
    'kusudama6.jpeg', 'kusudama7.jpeg', 'kusudama8.jpeg', 'kusudama9.jpeg', 'kusudama10.jpeg'
];

const spheres = [];
const vertices = geometry.attributes.position;
const v3 = new THREE.Vector3();

// Place a sphere with your photo at each vertex
for (let i = 0; i < kusudamaImages.length; i++) {
    v3.fromBufferAttribute(vertices, i);
    const tex = textureLoader.load(kusudamaImages[i]);
    const sphereGeom = new THREE.SphereGeometry(1.5, 32, 32);
    const sphereMat = new THREE.MeshBasicMaterial({ map: tex });
    const sphere = new THREE.Mesh(sphereGeom, sphereMat);
    
    sphere.position.copy(v3);
    sphere.userData = { index: i, name: `Kusudama ${i+1}` }; // Store info for clicking
    mesh.add(sphere);
    spheres.push(sphere);
}

camera.position.z = 25;

// Rotation Logic
let isDragging = false;
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();

function animate() {
    requestAnimationFrame(animate);
    if (!isDragging) {
        mesh.rotation.y += 0.005; // Slow auto-spin
    }
    renderer.render(scene, camera);
}
animate();

// Click detection
window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(spheres);
    
    if (intersects.length > 0) {
        const clickedObj = intersects[0].object;
        openLightbox(clickedObj.userData.index);
    }
});

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Integration with your existing Lightbox
function openLightbox(index) {
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    lbImg.src = kusudamaImages[index];
    lb.style.display = 'flex';
}
