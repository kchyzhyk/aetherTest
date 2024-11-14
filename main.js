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

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const lineMaterial = new LineMaterial({
    color: 0x00ff00, // Green color
    linewidth: 10,
    resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
});

let points = [];
let drawnLines = [];
let pointMarkers = [];
let eraserActive = false;
let modelMesh = null;

const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const pointGeometry = new THREE.SphereGeometry(0.3, 8, 8);
const lineGeometry = new LineGeometry();
let line;

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 60, 40);

// Background setup
const loadGoogleMapsImage = async (zoom) => {
    const apiKey = import.meta.env.VITE_API_KEY;
    const location = "Zahradnicka+4833/43,+821+08+Bratislava";
    const url = `https://maps.googleapis.com/maps/api/staticmap?center=${location}&zoom=${zoom}&size=600x400&maptype=satellite&key=${apiKey}`;
    return new Promise((resolve, reject) => {
        new THREE.TextureLoader().load(url, resolve, undefined, reject);
    });
};

const applyGoogleMapsBackground = async (zoomLevel) => {
    const googleTexture = await loadGoogleMapsImage(zoomLevel);
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

const initialZoom = parseInt(document.getElementById('zoom-input').value, 10) || 18;
applyGoogleMapsBackground(initialZoom);

const debouncedUpdateBackground = debounce((zoom) => applyGoogleMapsBackground(zoom), 500);
document.getElementById('zoom-input').addEventListener('input', (event) => {
    debouncedUpdateBackground(parseInt(event.target.value, 10) || 18);
});

// Update drawn line based on points
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

// Mouse-based point or erase actions
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
    } else {
        const intersects = raycaster.intersectObject(scene.children.find(child => child.isMesh && child.material.map));
        if (intersects.length > 0) {
            points.push(intersects[0].point.clone());
            updateLine();
            addPointMarker(intersects[0].point.clone());
        }
    }
};

const onMouseDown = (event) => {
    eraseLine(event);
};

const onMouseMove = (event) => {
    if (!eraserActive) {
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
    if (!eraserActive && points.length > 2 && points[0].distanceTo(points[points.length - 1]) < 1) {
        points[points.length - 1] = points[0];
        updateLine();
    }
};

// Marker for each point
const addPointMarker = (point) => {
    const pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);
    pointMesh.position.copy(point);
    scene.add(pointMesh);
    pointMarkers.push(pointMesh);
};

// Toggle eraser mode
const toggleEraser = () => {
    eraserActive = !eraserActive;
    console.log(eraserActive ? 'Eraser Activated' : 'Eraser Deactivated');
};

document.getElementById('eraser-button').addEventListener('click', toggleEraser);

const createRoof = (points, height, pitch, pitchSide) => {
    if (points.length < 3) {
        alert('Please draw a closed polygon first.');
        return;
    }

    // Remove any existing roof model before adding a new one
    if (modelMesh) {
        scene.remove(modelMesh);
        modelMesh.geometry.dispose();
        modelMesh.material.dispose();
    }

    // Create a shape from the polygon points (only x, z for the outline)
    const shape = new THREE.Shape();
    shape.moveTo(points[0].x, points[0].z); // Start the shape at the first point (x, z)
    for (let i = 1; i < points.length; i++) {
        shape.lineTo(points[i].x, points[i].z); // Continue creating the polygon
    }
    shape.lineTo(points[0].x, points[0].z); // Close the shape by connecting back to the first point

    // Create the geometry for the roof (without extrusion)
    const geometry = new THREE.ShapeGeometry(shape);

    // Create the material for the roof
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });

    // Create the mesh for the roof
    modelMesh = new THREE.Mesh(geometry, material);

    // Position the roof directly above the polygon at the specified height
    modelMesh.position.set(0, height, 0);  // Move the roof upwards by the 'height' value

    // Apply pitch based on the specified axis and angle
    const pitchInRadians = THREE.MathUtils.degToRad(pitch);  // Convert pitch to radians
    if (pitchSide === 'x') {
        modelMesh.rotation.x = pitchInRadians;  // Apply pitch on X-axis
    } else if (pitchSide === 'z') {
        modelMesh.rotation.z = pitchInRadians;  // Apply pitch on Z-axis
    }

    // Ensure the roof stays flat on the XZ plane (no Y rotation)
    modelMesh.rotation.y = 0;

    // Add the roof mesh to the scene
    scene.add(modelMesh);
};

const createWallsFromPolygonToRoof = (points, roofHeight) => {
    if (points.length < 3) {
        alert('Пожалуйста, нарисуйте замкнутый многоугольник.');
        return;
    }

    // Удаляем старые стены, если они есть
    scene.children.forEach(child => {
        if (child.name === 'wall') {
            scene.remove(child);
            child.geometry.dispose();
            child.material.dispose();
        }
    });

    // Проходим по всем точкам полигона
    for (let i = 0; i < points.length; i++) {
        const startPoint = points[i];
        const endPoint = points[(i + 1) % points.length];  // Следующая точка (с возвратом к первой)

        // Находим соответствующую точку на крыше (т.е. добавляем высоту вдоль оси Y)
        const roofStartPoint = new THREE.Vector3(startPoint.x, roofHeight, startPoint.z);
        const roofEndPoint = new THREE.Vector3(endPoint.x, roofHeight, endPoint.z);

        // Создаём прямоугольную геометрию стены (ширина = длина стороны, высота = высота от полигона до крыши)
        const geometry = new THREE.BoxGeometry(startPoint.distanceTo(endPoint), roofHeight, 1);  // Толщина стены = 1

        // Создаём материал для стены
        const material = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });

        // Создаём меш для стены
        const wall = new THREE.Mesh(geometry, material);
        wall.name = 'wall';

        // Размещаем стену по центру отрезка (параллельно стороне полигона)
        const midpoint = new THREE.Vector3().addVectors(startPoint, endPoint).multiplyScalar(0.5);
        wall.position.set(midpoint.x, roofHeight / 2, midpoint.z);  // Размещаем стену посередине

        // Рассчитываем угол поворота стены
        const dx = endPoint.x - startPoint.x;
        const dz = endPoint.z - startPoint.z;
        const angle = Math.atan2(dz, dx); // Угол наклона относительно оси XZ

        // Поворачиваем стену на угол, чтобы она была параллельна стороне полигона
        wall.rotation.y = angle;

        // Добавляем стену в сцену
        scene.add(wall);

        // Линии для визуализации роста стен из полигона до крыши
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });

        // Линия от точки полигона до крыши
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([startPoint, roofStartPoint]);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);

        const line2Geometry = new THREE.BufferGeometry().setFromPoints([endPoint, roofEndPoint]);
        const line2 = new THREE.Line(line2Geometry, lineMaterial);
        scene.add(line2);
    }
};


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
    // Create the walls
    createWallsFromPolygonToRoof(points, height);
});

// Event listeners for mouse actions
window.addEventListener('mousedown', onMouseDown);
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('mouseup', onMouseUp);

document.onkeydown = function (evt) {
    evt = evt || window.event;
    var isEscape = false;
    if ("key" in evt) {
        isEscape = (evt.key === "Escape" || evt.key === "Esc");
    } else {
        isEscape = (evt.keyCode === 27);
    }
    if (isEscape) {
        eraserActive = true;
    }
};

// Render loop
const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
};

animate();
