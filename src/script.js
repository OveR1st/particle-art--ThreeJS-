import './style.scss'

import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

const IMG = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/204808/mj.png';
const AMOUNT = 50; // max: 1000\
const DEPTH = 20;

const getRandomArbitrary = (min, max) => {
  return Math.random() * (max - min) + min;
}

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}

const getRandomColor = () => {
  const ch = getRandomInt(0, 360);
  const cs = getRandomInt(0, 100);
  const cl = getRandomInt(0, 100);
  const ca = getRandomInt(0, 0.7);

  return `hsla(${ch}, ${cs}%, ${cl}%, ${ca})`;
}

/**
 * Size
 */
const HEIGHT = window.innerHeight;
const WIDTH = window.innerWidth;

/**
 * Scene
 */
const scene = new THREE.Scene();

/**
 * Camera
 */
const filedOfView = 60;
const aspectRatio = WIDTH / HEIGHT;
const nearArt = 1;
const farArt = 10000;

const camera = new THREE.PerspectiveCamera(
  filedOfView,
  aspectRatio,
  nearArt,
  farArt
);

camera.position.set(0, 0, 400);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
});

renderer.setSize(WIDTH, HEIGHT)
renderer.shadowMap.enabled = true;

const container = document.getElementById('world');
container.appendChild(renderer.domElement)

const axes = new THREE.AxesHelper(100)
scene.add(axes)

/**
 * Controls
 */
const controls = new OrbitControls(camera, renderer.domElement)
controls.autoRotate = true;
controls.autoRotateSpeed = 7;

/**
 * Lights
 */
const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9);
const ambientLight = new THREE.AmbientLight(0xdc8874, 0.5);
const shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);

scene.add(hemisphereLight)
scene.add(ambientLight)
scene.add(shadowLight)


/**
 * Class Particles
 */
class Particles {
  constructor(ctx, art, dpr) {
    // get the image data
    ctx.drawImage(art, 0, 0);

    const artData = ctx.getImageData(0, 0, art.width * dpr, art.height * dpr);

    this.mesh = new THREE.Object3D();

    // for loop
    // create geom and mat, and add them to the mesh
    for (let y = 0; y < artData.height; y++) {
      for (let x = 0; x < artData.width; x++) {
        if (artData.data[(y * 4 * artData.width) + (x * 4) + 3] > 128 && getRandomArbitrary(1, 1000) < AMOUNT) {
          const color = getRandomColor();
          const size = getRandomArbitrary(1, 5);

          const geomParticle = new THREE.SphereGeometry(size, 25, 25)
          const matParticle = new THREE.MeshPhongMaterial({
            color,
            opacity: getRandomArbitrary(0.3, 0.65),
            transparent: true,
            flatShading: true,
          });

          const m = new THREE.Mesh(geomParticle.clone(), matParticle);
          m.position.x = x - art.width / 2;
          m.position.y = y * -1 + art.height / 2;
          m.position.z = getRandomInt(-DEPTH, DEPTH);
          this.mesh.add(m)
        }
      }
    }
  }
}

/**
 * Class ParticleArt
 */
class ParticleArt {
  constructor() {
    // set up the canvas
    const canvas = document.getElementById('canvas')
    const dpr = window.devicePixelRatio || 1;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';

    // define the image
    const art = new Image();
    art.crossOrigin = "Anonymous";
    const artSrc = IMG;

    this.mesh = new THREE.Object3D();

    // load the image
    art.onload = () => {
      // define a function
      const particles = new Particles(ctx, art, dpr);
      // add the particle mesh to the particle art mesh which is 'this'
      this.mesh.add(particles.mesh)
    }

    art.src = artSrc;

  }
}


// define a function
const particleArt = new ParticleArt();

// add the mesh to the scene
scene.add(particleArt.mesh);

function loop() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(loop)
}

loop();