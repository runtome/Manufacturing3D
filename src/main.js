import * as THREE from "three";
import "./styles.css";

const canvas = document.querySelector("#profile-scene");

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0c1014, 8, 28);

const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2.7, 9);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  canvas,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const clock = new THREE.Clock();
const pointer = new THREE.Vector2();

const root = new THREE.Group();
scene.add(root);

const ambient = new THREE.HemisphereLight(0xd9f5ff, 0x1f2326, 1.7);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffffff, 3.1);
keyLight.position.set(5, 7, 5);
scene.add(keyLight);

const rimLight = new THREE.PointLight(0x59ffd7, 35, 18);
rimLight.position.set(-4, 2.5, 4);
scene.add(rimLight);

const baseMaterial = new THREE.MeshStandardMaterial({
  color: 0x24282c,
  metalness: 0.78,
  roughness: 0.28,
});

const accentMaterial = new THREE.MeshStandardMaterial({
  color: 0x12c6a5,
  emissive: 0x06463d,
  emissiveIntensity: 0.55,
  metalness: 0.35,
  roughness: 0.32,
});

const copperMaterial = new THREE.MeshStandardMaterial({
  color: 0xd08b49,
  emissive: 0x2f1607,
  emissiveIntensity: 0.2,
  metalness: 0.65,
  roughness: 0.34,
});

const darkMaterial = new THREE.MeshStandardMaterial({
  color: 0x101316,
  metalness: 0.45,
  roughness: 0.42,
});

function createRoundedBox(width, height, depth, material) {
  const geometry = new THREE.BoxGeometry(width, height, depth, 3, 3, 3);
  return new THREE.Mesh(geometry, material);
}

const platform = createRoundedBox(5.2, 0.18, 3.2, darkMaterial);
platform.position.y = -1.05;
root.add(platform);

const grid = new THREE.GridHelper(12, 24, 0x12c6a5, 0x29333a);
grid.position.y = -1.14;
grid.material.transparent = true;
grid.material.opacity = 0.24;
root.add(grid);

const printerFrame = new THREE.Group();
const postGeometry = new THREE.BoxGeometry(0.11, 2.5, 0.11);
const beamGeometry = new THREE.BoxGeometry(2.8, 0.11, 0.11);

[
  [-1.35, 0.18, -1.15],
  [1.35, 0.18, -1.15],
  [-1.35, 0.18, 1.15],
  [1.35, 0.18, 1.15],
].forEach(([x, y, z]) => {
  const post = new THREE.Mesh(postGeometry, baseMaterial);
  post.position.set(x, y, z);
  printerFrame.add(post);
});

[
  [0, 1.46, -1.15, 0],
  [0, 1.46, 1.15, 0],
  [-1.35, 1.46, 0, Math.PI / 2],
  [1.35, 1.46, 0, Math.PI / 2],
].forEach(([x, y, z, rotation]) => {
  const beam = new THREE.Mesh(beamGeometry, baseMaterial);
  beam.position.set(x, y, z);
  beam.rotation.y = rotation;
  printerFrame.add(beam);
});

const carriage = createRoundedBox(0.78, 0.32, 0.52, accentMaterial);
carriage.position.set(0, 0.72, 0);
printerFrame.add(carriage);

const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.55, 5), copperMaterial);
nozzle.position.set(0, 0.26, 0);
nozzle.rotation.x = Math.PI;
printerFrame.add(nozzle);

const printedPart = new THREE.Group();
for (let i = 0; i < 7; i += 1) {
  const layer = new THREE.Mesh(new THREE.TorusGeometry(0.45 + i * 0.06, 0.028, 8, 56), accentMaterial);
  layer.position.y = -0.92 + i * 0.105;
  layer.rotation.x = Math.PI / 2;
  printedPart.add(layer);
}
printerFrame.add(printedPart);
root.add(printerFrame);

const orbitGroup = new THREE.Group();
const nodeGeometry = new THREE.IcosahedronGeometry(0.12, 1);
for (let i = 0; i < 18; i += 1) {
  const node = new THREE.Mesh(nodeGeometry, i % 3 === 0 ? copperMaterial : accentMaterial);
  const angle = (i / 18) * Math.PI * 2;
  const radius = 2.2 + (i % 2) * 0.38;
  node.position.set(Math.cos(angle) * radius, -0.25 + (i % 5) * 0.34, Math.sin(angle) * radius);
  orbitGroup.add(node);
}
root.add(orbitGroup);

const particles = new THREE.Points(
  new THREE.BufferGeometry().setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      Array.from({ length: 420 }, () => (Math.random() - 0.5) * 18),
      3,
    ),
  ),
  new THREE.PointsMaterial({
    color: 0xa8fff1,
    size: 0.018,
    transparent: true,
    opacity: 0.5,
  }),
);
scene.add(particles);

function updateCameraForViewport() {
  const isNarrow = window.innerWidth < 760;
  camera.position.set(isNarrow ? 0 : 1.45, isNarrow ? 3.1 : 2.55, isNarrow ? 10.8 : 8.7);
  root.position.set(isNarrow ? 0 : 1.85, isNarrow ? -0.25 : -0.1, 0);
  root.scale.setScalar(isNarrow ? 0.82 : 1);
}

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  updateCameraForViewport();
}

window.addEventListener("resize", resize);
window.addEventListener("pointermove", (event) => {
  pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
  pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
});

function animate() {
  const elapsed = clock.getElapsedTime();
  const carriageX = Math.sin(elapsed * 1.3) * 0.62;

  carriage.position.x = carriageX;
  nozzle.position.x = carriageX;
  printedPart.rotation.y = elapsed * 0.55;
  orbitGroup.rotation.y = elapsed * 0.18;
  orbitGroup.rotation.x = Math.sin(elapsed * 0.35) * 0.08;
  particles.rotation.y = elapsed * 0.025;

  root.rotation.y = pointer.x * 0.08 + Math.sin(elapsed * 0.2) * 0.03;
  root.rotation.x = -pointer.y * 0.035;
  rimLight.position.x = -4 + Math.sin(elapsed * 0.7) * 1.1;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

updateCameraForViewport();
animate();
