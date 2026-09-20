import { useEffect, useRef } from "react";
import * as THREE from "three";

function Sphere({
  openness = 0,
  rotation = 0,
}) {
  const containerRef = useRef(null);

  const opennessRef = useRef(openness);
  const rotationRef = useRef(rotation);

  opennessRef.current = openness;
  rotationRef.current = rotation;

  useEffect(() => {
    const container = containerRef.current;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth /
        container.clientHeight,
      0.1,
      100
    );

    camera.position.z = 4;

    const renderer =
      new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
      container.clientWidth,
      container.clientHeight
    );

    container.appendChild(
      renderer.domElement
    );

    const geometry =
      new THREE.BufferGeometry();

    const particles = 6000;

    const positions =
      new Float32Array(
        particles * 3
      );

    for (let i = 0; i < particles; i++) {
      const radius = 1.35;

      const theta =
        Math.random() * Math.PI * 2;

      const phi =
        Math.acos(2 * Math.random() - 1);

      positions[i * 3] =
        radius *
        Math.sin(phi) *
        Math.cos(theta);

      positions[i * 3 + 1] =
        radius *
        Math.sin(phi) *
        Math.sin(theta);

      positions[i * 3 + 2] =
        radius *
        Math.cos(phi);
    }

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3
      )
    );

    const material =
      new THREE.PointsMaterial({
        color: 0xdceaff,
        size: 0.012,
        transparent: true,
        opacity: 0.9,
      });

    const sphere =
      new THREE.Points(
        geometry,
        material
      );

    scene.add(sphere);

    let animationId;

    let currentScale = 0.6;

    let manualRotation = 0;

    function animate() {
      animationId =
        requestAnimationFrame(
          animate
        );

      // Обычное медленное вращение
      manualRotation += 0.0015;

      // Вращение руками
      manualRotation +=
        rotationRef.current;

      sphere.rotation.y =
        manualRotation;

      sphere.rotation.x +=
        0.0003;

      // Размер
      const minScale = 0.6;
      const maxScale = 1.5;

      const targetScale =
        minScale +
        (maxScale - minScale) *
          opennessRef.current;

      currentScale +=
        (targetScale -
          currentScale) *
        0.05;

      sphere.scale.set(
        currentScale,
        currentScale,
        currentScale
      );

      renderer.render(
        scene,
        camera
      );
    }

    animate();

    return () => {
      cancelAnimationFrame(animationId);

      geometry.dispose();
      material.dispose();
      renderer.dispose();

      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="particle-sphere"
    />
  );
}

export default Sphere;