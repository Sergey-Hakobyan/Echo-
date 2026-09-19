import { useEffect, useRef } from "react";
import * as THREE from "three";

function Sphere() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );

    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.setSize(
      container.clientWidth,
      container.clientHeight
    );

    container.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();

    const particles = 6000;

    const positions = new Float32Array(
      particles * 3
    );

    for (let i = 0; i < particles; i++) {
      const radius = 1.35;

      const theta =
        Math.random() * Math.PI * 2;

      const phi =
        Math.acos(2 * Math.random() - 1);

      const x =
        radius *
        Math.sin(phi) *
        Math.cos(theta);

      const y =
        radius *
        Math.sin(phi) *
        Math.sin(theta);

      const z =
        radius *
        Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3
      )
    );

    const material = new THREE.PointsMaterial({
      color: 0xdceaff,
      size: 0.012,
      transparent: true,
      opacity: 0.9,
    });

    const sphere = new THREE.Points(
      geometry,
      material
    );

    scene.add(sphere);

    let animationId;

    function animate() {
      animationId =
        requestAnimationFrame(animate);

      sphere.rotation.y += 0.0015;
      sphere.rotation.x += 0.0003;

      renderer.render(scene, camera);
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