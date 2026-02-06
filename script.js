import * as THREE from 'three';

const container = document.getElementById('container3d');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Your 10 Images
const kusudamaImages = [
    'kusudama1.jpeg', 'kusudama2.jpeg', 'kusudama3.jpeg', 'kusudama4.jpeg', 'kusudama5.jpeg',
    'kusudama6.jpeg', 'kusudama7.jpeg', 'kusudama8.jpeg', 'kusudama9.jpeg', 'kusudama10.jpeg'
];

const textureLoader = new THREE.TextureLoader();

// Create an array of 20 materials (one for each face)
// We loop through your 10 images twice to fill all 20 faces
const materials = [];
for (let i = 0; i < 20; i++) {
    const imageIndex = i % kusudamaImages.length;
    const texture = textureLoader.load(kusudamaImages[imageIndex]);
    materials.push(new THREE.MeshBasicMaterial({ 
        map: texture, 
        side: THREE.DoubleSide 
    }));
}

// Create Icosahedron
const geometry = new THREE.IcosahedronGeometry(10, 0);

// Assign a unique material index to each face (0 through 19)
geometry.clearGroups();
for (let i = 0; i < 20; i++) {
    geometry.addGroup(i * 3, 3, i);
}

const mesh = new THREE.Mesh(geometry, materials);
scene.add(mesh);

camera.position.z = 25;

// Rotation & Interaction Logic
let isDragging = false;
let previousMouseX = 0;
let previousMouseY = 0;

function animate() {
    requestAnimationFrame(animate);
    if (!isDragging) {
        mesh.rotation.y += 0.005;
        mesh.rotation.x += 0.002;
    }
    renderer.render(scene, camera);
}
animate();

// Raycaster for clicking faces
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(mesh);

    if (intersects.length > 0) {
        // The faceIndex tells us which face was clicked
        const faceIndex = intersects[0].faceIndex;
        const imageIndex = faceIndex % kusudamaImages.length;
        openLightbox(imageIndex);
    }
});

// Drag to Rotate
window.addEventListener('mousedown', () => isDragging = true);
window.addEventListener('mouseup', () => isDragging = false);
window.addEventListener('mousemove', (e) => {
    if (isDragging) {
        mesh.rotation.y += (e.clientX - previousMouseX) * 0.01;
        mesh.rotation.x += (e.clientY - previousMouseY) * 0.01;
    }
    previousMouseX = e.clientX;
    previousMouseY = e.clientY;
});

window.addEventListener('click', (event) => {
    // 1. Calculate mouse position in normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // 2. Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // 3. Calculate objects intersecting the picking ray
    // 'true' checks all children (the faces we added to the mesh)
    const intersects = raycaster.intersectObject(mesh, true);

    if (intersects.length > 0) {
        // Find the index of the face that was hit
        const faceIndex = intersects[0].faceIndex;
        
        // Since each image is on 2 faces (20 faces / 10 images), 
        // we map the faceIndex back to our 10-image array
        const imageIndex = Math.floor(faceIndex / 2); 
        
        console.log("Clicked face:", faceIndex, "Showing image:", imageIndex);
        openLightbox(imageIndex);
    }
});

function openLightbox(index) {
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const caption = document.getElementById('caption');
    lbImg.src = kusudamaImages[index];
    caption.innerText = `Kusudama Design ${index + 1}`;
    lb.style.display = 'flex';
}
