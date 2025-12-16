import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 10, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 10, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const cubes = [];
const cubeData = [];
let selectedCube = null;

function getRandomColor() {
    return Math.random() * 0xffffff;
}

function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

function createCubes() {
    for (let i = 0; i < 20; i++) {
        const width = randomInRange(0.5, 2.0);
        const height = randomInRange(0.5, 2.0);
        const depth = randomInRange(0.5, 2.0);
        
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshLambertMaterial({ 
            color: getRandomColor(),
            transparent: true,
            opacity: 0.9
        });
        
        const cube = new THREE.Mesh(geometry, material);
        
        const x = randomInRange(-10, 6);
        const y = randomInRange(0, 4);
        const z = randomInRange(-10, 6);
        
        cube.position.set(x, y, z);
        cube.castShadow = true;
        cube.receiveShadow = true;
        
        cube.userData = {
            originalColor: material.color.clone(),
            id: i
        };
        
        scene.add(cube);
        cubes.push(cube);
        
        cubeData.push({
            id: i,
            position: { x: x.toFixed(2), y: y.toFixed(2), z: z.toFixed(2) },
            size: { width: width.toFixed(2), height: height.toFixed(2), depth: depth.toFixed(2) }
        });
    }
}

function updateInfoPanel(cubeInfo) {
    const panel = document.getElementById('info-panel');
    if (cubeInfo) {
        panel.innerHTML = `
            <h3>Cube Information</h3>
            <p><strong>Cube ID:</strong> ${cubeInfo.id + 1}</p>
            <p><strong>Position:</strong></p>
            <p>&nbsp;&nbsp;X: ${cubeInfo.position.x}</p>
            <p>&nbsp;&nbsp;Y: ${cubeInfo.position.y}</p>
            <p>&nbsp;&nbsp;Z: ${cubeInfo.position.z}</p>
            <p><strong>Size:</strong></p>
            <p>&nbsp;&nbsp;Width: ${cubeInfo.size.width}</p>
            <p>&nbsp;&nbsp;Height: ${cubeInfo.size.height}</p>
            <p>&nbsp;&nbsp;Depth: ${cubeInfo.size.depth}</p>
        `;
    } else {
        panel.innerHTML = `
            <h3>Cube Information</h3>
            <p>No object selected. Click a cube to see its information here.</p>
        `;
    }
}

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(cubes);
    
    if (selectedCube) {
        selectedCube.material.color.copy(selectedCube.userData.originalColor);
        selectedCube.material.emissive.setHex(0x000000);
        selectedCube.scale.set(1, 1, 1);
    }
    
    if (intersects.length > 0) {
        selectedCube = intersects[0].object;
        const cubeId = selectedCube.userData.id;
        
        selectedCube.material.color.setHex(0xffff00);
        selectedCube.material.emissive.setHex(0x222222);
        
        animateSelection(selectedCube);
        
        updateInfoPanel(cubeData[cubeId]);
    } else {
        selectedCube = null;
        updateInfoPanel(null);
    }
}

function animateSelection(cube) {
    const originalScale = { x: 1, y: 1, z: 1 };
    const targetScale = { x: 1.1, y: 1.1, z: 1.1 };
    
    let progress = 0;
    const duration = 200;
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / duration, 1);
        
        const easeProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI);
        
        if (progress < 0.5) {
            const scale = 1 + easeProgress * 0.1;
            cube.scale.set(scale, scale, scale);
        } else {
            const scale = 1.1 - (easeProgress - 0.5) * 0.1;
            cube.scale.set(scale, scale, scale);
        }
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            cube.scale.set(1, 1, 1);
        }
    }
    
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    renderer.render(scene, camera);
}

function init() {
    createCubes();
    
    window.addEventListener('click', onMouseClick, false);
    window.addEventListener('resize', onWindowResize, false);
    
    animate();
}

init();
