import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Initialize Three.js scene, camera, and renderer

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('three-container').appendChild(renderer.domElement);

// Set up controls to rotate the scene
const controls = new OrbitControls(camera, renderer.domElement);

// Function to fetch the background image from the API
// const fetchAndSetBackgroundImage = async () => {
//     const apiKey = import.meta.env.VITE_API_KEY
//     const location = "Zahradnicka+4833/43,+821+08+Bratislava";
//     const url = `https://maps.googleapis.com/maps/api/staticmap?center=${location}&zoom=18&size=600x400&maptype=satellite&key=${apiKey}`;
//     const loader = new THREE.TextureLoader();
//     return loader.load(url);
// };
// fetchAndSetBackgroundImage(); // Call to set the background

async function loadGoogleMapsImage() {
    const apiKey = import.meta.env.VITE_API_KEY;
    const location = "Zahradnicka+4833/43,+821+08+Bratislava";
    const url = `https://maps.googleapis.com/maps/api/staticmap?center=${location}&zoom=18&size=600x400&maptype=satellite&key=${apiKey}`;
    // Load the image as a texture
    return new Promise((resolve, reject) => {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
            url,
            (texture) => {
                resolve(texture); // Resolves with the loaded texture
            },
            undefined,
            (error) => {
                console.error('Error loading Google Maps image:', error);
                reject(error);
            }
        );
    });
}

const googleTexture = await loadGoogleMapsImage();



// Plane for drawing (remains the same as before)
const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshBasicMaterial({ map: googleTexture, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Raycaster for drawing lines (remains the same)
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const points = [];
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
const geometry = new THREE.BufferGeometry();
const line = new THREE.Line(geometry, lineMaterial);
scene.add(line);

// Handle mouse events for drawing
let drawing = false;

const onMouseDown = (event) => {
    drawing = true;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(plane);

    if (intersects.length > 0) {
        points.push(intersects[0].point);
        updateLine();
    }
};

const onMouseMove = (event) => {
    if (!drawing) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(plane);

    if (intersects.length > 0) {
        points[points.length - 1] = intersects[0].point;
        updateLine();
    }
};

const onMouseUp = () => {
    drawing = false;
};

// Close the polygon if it’s near the first point
const closePolygon = () => {
    if (points.length > 2 && points[0].distanceTo(points[points.length - 1]) < 0.1) {
        points.push(points[0]);
        updateLine();
    }
};

// Update line geometry
const updateLine = () => {
    const positions = [];
    points.forEach(p => positions.push(p.x, p.y, p.z));
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
};

// Event listeners for mouse actions
window.addEventListener('mousedown', onMouseDown);
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('mouseup', onMouseUp);

// Handle apply button for height and pitch
document.getElementById('apply-button').addEventListener('click', () => {
    const heightInput = document.getElementById('height-input').value;
    const pitchInput = document.getElementById('pitch-input').value;

    const height = parseFloat(heightInput);
    const pitch = parseFloat(pitchInput);

    if (isNaN(height) || isNaN(pitch)) {
        alert('Please enter valid numbers for both height and pitch.');
        return;
    }

    // Apply height and pitch to the polygon
    applyHeightAndPitch(height, pitch);
});

// Apply height and pitch to the drawn polygon
function applyHeightAndPitch(height, pitch) {
    if (points.length < 3) {
        alert('Please draw a polygon first.');
        return;
    }

    // Raise the polygon to the specified height
    points.forEach(p => {
        p.z = height;
    });

    // Apply pitch to the polygon (rotating along X axis)
    const angle = THREE.MathUtils.degToRad(pitch);
    const rotationMatrix = new THREE.Matrix4().makeRotationX(angle);

    points.forEach(p => {
        const vector = new THREE.Vector3(p.x, p.y, p.z);
        vector.applyMatrix4(rotationMatrix);
        p.set(vector.x, vector.y, vector.z);
    });

    updateLine();
}

// Set camera position and start rendering loop
camera.position.z = 50;


function animate() {
    requestAnimationFrame(animate);
    controls.update();  // Update controls
    renderer.render(scene, camera);
}
animate();