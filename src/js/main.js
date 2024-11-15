import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 0);
document.getElementById('three-container').appendChild(renderer.domElement);

const gridHelper = new THREE.GridHelper(100, 10);
scene.add(gridHelper);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const lineMaterial = new LineMaterial({
    color: 0x00ff00,
    linewidth: 10,
    resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
});

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 60, 40);

// const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
// const pointGeometry = new THREE.SphereGeometry(0.3, 8, 8);
const lineGeometry = new LineGeometry();
let line;

let points = [];
let drawnLines = [];
// let pointMarkers = [];
let modelMesh = null;
let drawingActive = false;
let eraserActive = false;

// const loadingPlaces = async () => {
//     const apiKey = import.meta.env.VITE_PLACES_API_KEY

//     const location = document.getElementById('address-input').value;

//     const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(placeName)}&inputtype=textquery&fields=photos,formatted_address,name,geometry&key=${apiKey}`;


// }

// Scene background setup
const loadGoogleMapsImage = async () => {
    console.log('Loading google')
    const apiKey = import.meta.env.VITE_API_KEY;
    const location = document.getElementById('address-input').value || 'Zahradnicka 4833/43, 821 08 Bratislava';
    const zoom = parseInt(document.getElementById('zoom-input').value, 10) || 18
    const url = `https://maps.googleapis.com/maps/api/staticmap?center=${location}&zoom=${zoom}&size=600x400&maptype=satellite&key=${apiKey}`;
    return new Promise((resolve, reject) => {
        if (!url || !location) {
            reject(new Error("No image URL found"));
            return;
        }
        new THREE.TextureLoader().load(url, resolve, undefined, reject);
    });
}

const applyGoogleMapsBackground = async () => {
    const googleTexture = await loadGoogleMapsImage();
    if (!googleTexture) {
        return
    }
    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const planeMaterial = new THREE.MeshBasicMaterial({ map: googleTexture, side: THREE.FrontSide });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    scene.children.filter(child => child.isMesh && child.material.map).forEach(child => scene.remove(child));
    scene.add(plane);
};
const debounce = (func, delay) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    };
};

applyGoogleMapsBackground();
const debouncedUpdateBackground = debounce(() => applyGoogleMapsBackground(), 500);
document.getElementById('address-button').addEventListener('click', () => {
    applyGoogleMapsBackground();
});

const updateLine = () => {
    if (line) {
        scene.remove(line);
        line.geometry.dispose();
        line.material.dispose();
    }
    if (points.length > 1) {
        lineGeometry.setPositions(points.flatMap(p => [p.x, p.y, p.z]));
        line = new Line2(lineGeometry, lineMaterial);
        line.computeLineDistances();
        scene.add(line);
    }
};

//need to fix this function
const eraseLine = (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    if (eraserActive) {
        drawnLines.forEach((line, index) => {
            const intersects = raycaster.intersectObject(line);
            if (intersects.length > 0) {
                scene.remove(line);
                line.geometry.dispose();
                line.material.dispose();
                drawnLines.splice(index, 1);
            }
        });
    } else if (drawingActive) {
        const intersects = raycaster.intersectObject(scene.children.find(child => child.isMesh && child.material.map));
        if (intersects.length > 0) {
            points.push(intersects[0].point.clone());
            updateLine();
        }
    }
};

const toggleDrawing = () => {

    drawingActive = !drawingActive;

    if (drawingActive) {
        console.log('Drawing Started');
        points = [];
    } else {
        console.log('Drawing Stopped');
    }
    console.log(drawingActive)
};


const toggleEraser = () => {
    eraserActive = !eraserActive;
    if (eraserActive) {
        console.log('Eraser Started');
    } else {
        console.log('Eraser Stopped');
    }

    console.log(eraserActive)
};

const onMouseDown = (event) => {
    eraseLine(event);
};

const onMouseMove = (event) => {
    if (drawingActive) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObject(scene.children.find(child => child.isMesh && child.material.map));
        if (intersects.length > 0 && points.length > 0) {
            points[points.length - 1] = intersects[0].point.clone();
            updateLine();
        }
    }
};

const onMouseUp = () => {
    if (drawingActive && points.length > 2 && points[0].distanceTo(points[points.length - 1]) < 1) {
        points[points.length - 1] = points[0];
        updateLine();
    }
};

// Marker for each point
// const addPointMarker = (point) => {
//     const pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);
//     pointMesh.position.copy(point);
//     scene.add(pointMesh);
//     pointMarkers.push(pointMesh);
// };

document.getElementById('eraser-button').addEventListener('click', toggleEraser);

const createRoof = (points, height, pitch, pitchSide) => {
    if (points.length < 3) {
        alert('Please draw a closed polygon first.');
        return;
    }
    if (modelMesh) {
        scene.remove(modelMesh);
        modelMesh.geometry.dispose();
        modelMesh.material.dispose();
    }


    const shape = new THREE.Shape();
    shape.moveTo(points[0].x, points[0].z); // Start the shape at the first point (x, z)
    for (let i = 1; i < points.length; i++) {
        shape.lineTo(points[i].x, points[i].z);
    }
    shape.lineTo(points[0].x, points[0].z); // Close the shape by connecting back to the first point


    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    modelMesh = new THREE.Mesh(geometry, material);
    modelMesh.position.set(0, height, 0);


    const pitchInRadians = THREE.MathUtils.degToRad(pitch);
    if (pitchSide === 'x') {
        modelMesh.rotation.x = pitchInRadians;
    } else if (pitchSide === 'z') {
        modelMesh.rotation.z = pitchInRadians;
    }
    modelMesh.rotation.y = 0;
    scene.add(modelMesh);
};

const createWallsFromPolygonToRoof = (points, roofHeight) => {
    if (points.length < 3) {
        return;
    }

    scene.children.forEach(child => {
        if (child.name === 'wall') {
            scene.remove(child);
            child.geometry.dispose();
            child.material.dispose();
        }
    });

    for (let i = 0; i < points.length; i++) {
        const startPoint = points[i];
        const endPoint = points[(i + 1) % points.length];

        const wallWidth = startPoint.distanceTo(endPoint);
        const wallHeight = roofHeight;
        const wallDepth = 0.1;


        const geometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth);
        const material = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
        const wall = new THREE.Mesh(geometry, material);
        wall.name = 'wall';


        const midpoint = new THREE.Vector3().addVectors(startPoint, endPoint).multiplyScalar(0.5);
        wall.position.set(midpoint.x, wallHeight / 2, midpoint.z);

        // Calculate the rotation to face the correct direction
        const direction = new THREE.Vector3().subVectors(endPoint, startPoint).normalize();
        const angle = Math.atan2(direction.z, direction.x); // Angle to rotate the wall
        wall.rotation.y = angle; // Rotate the wall to face the edge direction

        // Add the wall to the scene
        scene.add(wall);
    }
};

// const createWallsFromPolygonToRoof = (points, roofHeight) => {
//     if (points.length < 3) {
//         return;
//     }

//     scene.children.forEach(child => {
//         if (child.name === 'wall') {
//             scene.remove(child);
//             child.geometry.dispose();
//             child.material.dispose();
//         }
//     });
//     for (let i = 0; i < points.length; i++) {
//         const startPoint = points[i];
//         const endPoint = points[(i + 1) % points.length];

//         const wallWidth = startPoint.distanceTo(endPoint);
//         const geometry = new THREE.PlaneGeometry(wallWidth, roofHeight);
//         const material = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
//         const wall = new THREE.Mesh(geometry, material);
//         wall.name = 'wall';
//         const midpoint = new THREE.Vector3().addVectors(startPoint, endPoint).multiplyScalar(0.5);
//         wall.position.set(midpoint.x, roofHeight / 2, midpoint.z);
//         const direction = new THREE.Vector3().subVectors(endPoint, startPoint).normalize();
//         wall.lookAt(new THREE.Vector3(midpoint.x + direction.x, roofHeight / 2, midpoint.z + direction.z));
//         scene.add(wall);
//     }
// };



// Example usage:
document.getElementById('apply-button').addEventListener('click', () => {
    const height = parseFloat(document.getElementById('height-input').value);
    const pitch = parseFloat(document.getElementById('pitch-input').value);
    const pitchSide = document.getElementById('pitch-side-input').value; // 'x' or 'z'

    if (isNaN(height) || isNaN(pitch)) {
        alert('Please enter valid numbers for height and pitch.');
        return;
    }

    createRoof(points, height, pitch, pitchSide);
    createWallsFromPolygonToRoof(points, height);
});
// Event listeners for mouse or keys actions
window.addEventListener('mousedown', onMouseDown);
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('mouseup', onMouseUp);
document.getElementById('drawing-button').addEventListener('click', toggleDrawing);

document.getElementById('zoom-input').addEventListener('input', (event) => {
    debouncedUpdateBackground(parseInt(event.target.value, 10) || 18);
});
document.onkeydown = function (evt) {
    evt = evt || window.event;
    let isEscape = false;
    if ("key" in evt) {
        isEscape = (evt.key === "Escape" || evt.key === "Esc");
    } else {
        isEscape = (evt.keyCode === 27);
    }
    if (isEscape) {
        drawingActive = false;
        eraserActive = false;
    }
};

// Render loop
const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
};

animate();

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// eraser bug
// walls bugs
// roof angle bug
//