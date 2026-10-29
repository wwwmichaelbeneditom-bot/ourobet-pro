import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Crash3DPlaneProps {
  gameState: 'idle' | 'waiting' | 'flying' | 'crashed';
  multiplier: number;
}

export const Crash3DPlane: React.FC<Crash3DPlaneProps> = ({ gameState, multiplier }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070b16, 0.012);

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 320;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(-18, 9, 28);
    camera.lookAt(2, 4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 2.8);
    sunLight.position.set(20, 40, 25);
    scene.add(sunLight);

    const redRimLight = new THREE.DirectionalLight(0xf43f5e, 2.2);
    redRimLight.position.set(-30, -10, -20);
    scene.add(redRimLight);

    const cyanFillLight = new THREE.DirectionalLight(0x06b6d4, 1.5);
    cyanFillLight.position.set(10, -20, 30);
    scene.add(cyanFillLight);

    // --- AIRPLANE (AVIONETA 3D) ASSEMBLY ---
    const planeGroup = new THREE.Group();
    scene.add(planeGroup);

    // Materials
    const fuselageMat = new THREE.MeshStandardMaterial({
      color: 0xd91636, // Vibrant crimson racing red
      metalness: 0.65,
      roughness: 0.25,
    });

    const whiteAccentMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.4,
      roughness: 0.3,
    });

    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Gold metallic trim
      metalness: 0.85,
      roughness: 0.2,
    });

    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.3,
    });

    const canopyMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.7,
      transparent: true,
      opacity: 0.85,
      reflectivity: 0.9,
    });

    const jetFlameMat = new THREE.MeshBasicMaterial({
      color: 0xffa500,
      transparent: true,
      opacity: 0.9,
    });

    const jetCoreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
    });

    // 1. Fuselage (Aerodynamic body)
    const fuselageGeo = new THREE.ConeGeometry(1.3, 7.5, 32);
    fuselageGeo.rotateZ(-Math.PI / 2);
    const fuselage = new THREE.Mesh(fuselageGeo, fuselageMat);
    fuselage.scale.set(1, 0.75, 0.85);
    planeGroup.add(fuselage);

    // Nose Cone (Gold spinner)
    const noseGeo = new THREE.SphereGeometry(0.65, 16, 16);
    noseGeo.scale(1.8, 0.7, 0.7);
    const nose = new THREE.Mesh(noseGeo, goldTrimMat);
    nose.position.set(3.7, 0, 0);
    planeGroup.add(nose);

    // 2. Cockpit / Bubble Canopy
    const canopyGeo = new THREE.SphereGeometry(0.85, 24, 16);
    canopyGeo.scale(2.2, 0.8, 0.9);
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(0.6, 0.65, 0);
    planeGroup.add(canopy);

    // 3. Main Swept Wings
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, -3.8);
    wingShape.lineTo(2.2, -3.8);
    wingShape.lineTo(1.1, 3.8);
    wingShape.lineTo(-0.8, 3.8);
    wingShape.closePath();

    const wingExtrudeSettings = { depth: 0.14, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 };
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, wingExtrudeSettings);
    wingGeo.rotateX(Math.PI / 2);
    wingGeo.rotateZ(Math.PI / 2);
    const mainWings = new THREE.Mesh(wingGeo, fuselageMat);
    mainWings.position.set(0.2, -0.05, 0);
    planeGroup.add(mainWings);

    // Wingtip Winglets (angled up)
    const wingletGeo = new THREE.BoxGeometry(0.9, 0.9, 0.1);
    const leftWinglet = new THREE.Mesh(wingletGeo, goldTrimMat);
    leftWinglet.position.set(-0.3, 0.45, 3.8);
    leftWinglet.rotation.x = -Math.PI / 6;
    planeGroup.add(leftWinglet);

    const rightWinglet = new THREE.Mesh(wingletGeo, goldTrimMat);
    rightWinglet.position.set(-0.3, 0.45, -3.8);
    rightWinglet.rotation.x = Math.PI / 6;
    planeGroup.add(rightWinglet);

    // Navigation lights on wingtips
    const navLightGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const leftNav = new THREE.Mesh(navLightGeo, new THREE.MeshBasicMaterial({ color: 0x10b981 })); // Green
    leftNav.position.set(-0.1, 0.8, 3.9);
    planeGroup.add(leftNav);

    const rightNav = new THREE.Mesh(navLightGeo, new THREE.MeshBasicMaterial({ color: 0xf43f5e })); // Red
    rightNav.position.set(-0.1, 0.8, -3.9);
    planeGroup.add(rightNav);

    // 4. Tail Section: Vertical Fin and Dual Horizontal Stabilizers
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.lineTo(1.8, 0);
    finShape.lineTo(0.7, 2.2);
    finShape.lineTo(0.1, 2.2);
    finShape.closePath();

    const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.12, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03 });
    const verticalFin = new THREE.Mesh(finGeo, fuselageMat);
    verticalFin.position.set(-3.4, 0.2, -0.06);
    planeGroup.add(verticalFin);

    // Gold fin stripe
    const finStripeGeo = new THREE.BoxGeometry(0.25, 1.8, 0.15);
    const finStripe = new THREE.Mesh(finStripeGeo, goldTrimMat);
    finStripe.position.set(-2.8, 1.2, 0);
    finStripe.rotation.z = -Math.PI / 10;
    planeGroup.add(finStripe);

    // Horizontal tail stabilizers
    const hTailGeo = new THREE.BoxGeometry(1.2, 0.08, 3.2);
    const hTail = new THREE.Mesh(hTailGeo, whiteAccentMat);
    hTail.position.set(-3.2, 0.35, 0);
    planeGroup.add(hTail);

    // 5. Twin Turbines & Jet Exhaust Engines
    const engineGeo = new THREE.CylinderGeometry(0.42, 0.38, 2.4, 16);
    engineGeo.rotateZ(Math.PI / 2);

    const leftEngine = new THREE.Mesh(engineGeo, darkMetalMat);
    leftEngine.position.set(0.1, -0.35, 1.6);
    planeGroup.add(leftEngine);

    const rightEngine = new THREE.Mesh(engineGeo, darkMetalMat);
    rightEngine.position.set(0.1, -0.35, -1.6);
    planeGroup.add(rightEngine);

    // Jet Exhaust Nozzle Rings
    const nozzleGeo = new THREE.TorusGeometry(0.38, 0.06, 8, 24);
    nozzleGeo.rotateY(Math.PI / 2);
    const leftNozzle = new THREE.Mesh(nozzleGeo, goldTrimMat);
    leftNozzle.position.set(-1.1, -0.35, 1.6);
    planeGroup.add(leftNozzle);

    const rightNozzle = new THREE.Mesh(nozzleGeo, goldTrimMat);
    rightNozzle.position.set(-1.1, -0.35, -1.6);
    planeGroup.add(rightNozzle);

    // Dynamic Jet Flame Cones (outer orange flame + inner white core)
    const flameGeo = new THREE.ConeGeometry(0.36, 2.5, 16);
    flameGeo.rotateZ(-Math.PI / 2);

    const leftFlame = new THREE.Mesh(flameGeo, jetFlameMat);
    leftFlame.position.set(-2.4, -0.35, 1.6);
    planeGroup.add(leftFlame);

    const rightFlame = new THREE.Mesh(flameGeo, jetFlameMat);
    rightFlame.position.set(-2.4, -0.35, -1.6);
    planeGroup.add(rightFlame);

    const flameCoreGeo = new THREE.ConeGeometry(0.18, 1.6, 16);
    flameCoreGeo.rotateZ(-Math.PI / 2);

    const leftCore = new THREE.Mesh(flameCoreGeo, jetCoreMat);
    leftCore.position.set(-1.9, -0.35, 1.6);
    planeGroup.add(leftCore);

    const rightCore = new THREE.Mesh(flameCoreGeo, jetCoreMat);
    rightCore.position.set(-1.9, -0.35, -1.6);
    planeGroup.add(rightCore);

    // Front Nose Propeller / Turbine Disk
    const propGroup = new THREE.Group();
    propGroup.position.set(4.35, 0, 0);
    const propBladeGeo = new THREE.BoxGeometry(0.1, 2.6, 0.2);
    const propBlade = new THREE.Mesh(propBladeGeo, darkMetalMat);
    propGroup.add(propBlade);
    const propBlade2 = new THREE.Mesh(propBladeGeo, darkMetalMat);
    propBlade2.rotation.x = Math.PI / 2;
    propGroup.add(propBlade2);
    planeGroup.add(propGroup);

    // 6. 3D Neon Horizon Grid (Synthwave / Casino runway look)
    const gridHelper = new THREE.GridHelper(180, 45, 0xf43f5e, 0x1e293b);
    gridHelper.position.y = -8;
    scene.add(gridHelper);

    // 7. Dynamic Speed Lines / Star Particles in 3D
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 80;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 35;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 60;
      particleSpeeds[i] = 0.8 + Math.random() * 1.5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.45,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 8. Glowing Trail Ribbon behind plane
    const trailCount = 30;
    const trailPositions = new Float32Array(trailCount * 3);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.LineBasicMaterial({
      color: 0xef4444,
      linewidth: 3,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const trailLine = new THREE.Line(trailGeo, trailMat);
    scene.add(trailLine);

    // Initial plane orientation
    planeGroup.scale.set(1.1, 1.1, 1.1);
    planeGroup.rotation.y = Math.PI / 12; // Angled slightly towards viewer
    planeGroup.rotation.z = Math.PI / 18; // Slight pitch up

    // --- ANIMATION LOOP ---
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Turbine / Propeller spin
      propGroup.rotation.x += delta * 45;

      // Pulse Jet Flames
      const flameFlicker = 1.0 + Math.sin(time * 35) * 0.25;
      const flameStretch = gameState === 'flying' ? Math.min(3.5, 1.2 + multiplier * 0.25) : 0.8;
      leftFlame.scale.set(flameStretch, flameFlicker, flameFlicker);
      rightFlame.scale.set(flameStretch, flameFlicker, flameFlicker);
      leftCore.scale.set(flameStretch * 0.9, flameFlicker, flameFlicker);
      rightCore.scale.set(flameStretch * 0.9, flameFlicker, flameFlicker);

      // State-specific behavior
      if (gameState === 'waiting') {
        // Idle rumble on tarmac
        planeGroup.position.set(0, Math.sin(time * 6) * 0.15 - 1.5, 0);
        planeGroup.rotation.set(0, Math.PI / 14, Math.sin(time * 3) * 0.04);
        gridHelper.position.x = -(time * 4) % 4;
        leftFlame.visible = true;
        rightFlame.visible = true;
        trailLine.visible = false;
        camera.position.lerp(new THREE.Vector3(-16, 7, 24), delta * 2);
        camera.lookAt(2, 2, 0);
      } else if (gameState === 'flying') {
        // High speed climbing dynamics
        const progress = Math.min(1.0, (multiplier - 1.0) / 12);
        const pitchAngle = Math.min(0.55, 0.18 + progress * 0.35); // Nose up
        const rollAngle = Math.sin(time * 4) * 0.08; // Aerodynamic roll oscillation
        const yawAngle = Math.PI / 14 + Math.sin(time * 2.5) * 0.03;

        // Plane climb altitude
        const targetY = -1.0 + Math.min(7.0, Math.pow(progress, 0.7) * 8.0);
        planeGroup.position.y = THREE.MathUtils.lerp(planeGroup.position.y, targetY, delta * 3);
        planeGroup.position.x = THREE.MathUtils.lerp(planeGroup.position.x, 2.0 + progress * 3.5, delta * 2);
        planeGroup.position.z = Math.sin(time * 3.2) * 0.5;

        planeGroup.rotation.z = pitchAngle + Math.sin(time * 8) * 0.02; // Engine vibration
        planeGroup.rotation.x = rollAngle;
        planeGroup.rotation.y = yawAngle;

        // Ground grid rushes backwards proportional to multiplier
        const groundSpeed = Math.min(60, 15 + multiplier * 4);
        gridHelper.position.x = -(time * groundSpeed) % 4;

        // Particles rush past
        const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < particleCount; i++) {
          posAttr.array[i * 3] -= (particleSpeeds[i] * (0.8 + multiplier * 0.4));
          if (posAttr.array[i * 3] < -40) {
            posAttr.array[i * 3] = 40;
            posAttr.array[i * 3 + 1] = (Math.random() - 0.5) * 35;
            posAttr.array[i * 3 + 2] = (Math.random() - 0.5) * 60;
          }
        }
        posAttr.needsUpdate = true;

        // Dynamic Camera tracking with speed shake
        const shakeX = (Math.random() - 0.5) * Math.min(0.12, 0.01 + multiplier * 0.005);
        const shakeY = (Math.random() - 0.5) * Math.min(0.12, 0.01 + multiplier * 0.005);
        camera.position.set(-18 + shakeX, 9 + targetY * 0.45 + shakeY, 26 - progress * 4);
        camera.lookAt(planeGroup.position.x + 3, planeGroup.position.y, planeGroup.position.z);

        leftFlame.visible = true;
        rightFlame.visible = true;
      } else if (gameState === 'crashed') {
        // Plane banks wildly & spins out
        planeGroup.rotation.z -= delta * 12;
        planeGroup.rotation.x += delta * 8;
        planeGroup.position.x += delta * 25; // Shoots off to the right
        planeGroup.position.y += delta * 12; // Flies away
        leftFlame.visible = false;
        rightFlame.visible = false;

        // Camera shakes violently
        camera.position.x += (Math.random() - 0.5) * 0.3;
        camera.position.y += (Math.random() - 0.5) * 0.3;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      fuselageGeo.dispose();
      fuselageMat.dispose();
      canopyGeo.dispose();
      canopyMat.dispose();
      wingGeo.dispose();
      finGeo.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [gameState, multiplier]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
    />
  );
};
