"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import type {
  AmbientLight,
  DirectionalLight,
  Group,
  Mesh,
  PerspectiveCamera,
  Scene,
  Sprite,
  Texture,
  WebGLRenderer,
} from "three";

import { LANDING_SOCIAL_ORBIT_ICONS } from "@/components/marketing/light/landingSocialOrbitPlatforms";
import { POSTSIVA_BLUE } from "@/components/marketing/light/light-tokens";

const BRAND_BLUE = Number.parseInt(POSTSIVA_BLUE.replace("#", ""), 16);

type OrbitNode = {
  sprite: Sprite;
  angle: number;
  phase: number;
  speed: number;
  radius: number;
  verticalRadius: number;
  depthRadius: number;
  tilt: number;
};

type RendererWithCamera = WebGLRenderer & { __camera?: PerspectiveCamera };

type PointerTarget = {
  x: number;
  y: number;
};

function loadTexture(
  loader: InstanceType<typeof import("three").TextureLoader>,
  url: string,
): Promise<Texture> {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (texture) => {
        texture.colorSpace = "srgb";
        resolve(texture);
      },
      undefined,
      reject,
    );
  });
}

export function LandingSocialOrbitBackground(): React.ReactElement | null {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;

    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let frameId = 0;
    let renderer: RendererWithCamera | null = null;
    let scene: Scene | null = null;
    let scrollDepth = 0;
    let scrollDepthTarget = 0;
    const pointer: PointerTarget = { x: 0, y: 0 };
    const pointerTarget: PointerTarget = { x: 0, y: 0 };
    const textures: Texture[] = [];

    const updateScrollDepth = (): void => {
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      );
      scrollDepthTarget = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
    };

    const resize = (): void => {
      if (!renderer || !container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      const camera = renderer.__camera;
      if (camera) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      renderer.setSize(w, h);
    };

    const onPointerMove = (event: PointerEvent): void => {
      pointerTarget.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerTarget.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const onPointerLeave = (): void => {
      pointerTarget.x = 0;
      pointerTarget.y = 0;
    };

    void import("three").then(async (THREE) => {
      if (disposed || !container) return;

      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      }) as RendererWithCamera;
      renderer.__camera = camera;

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      container.appendChild(renderer.domElement);

      const group: Group = new THREE.Group();
      scene.add(group);

      const coreGeom = new THREE.IcosahedronGeometry(1.65, 2);
      const coreMat = new THREE.MeshPhongMaterial({
        color: BRAND_BLUE,
        wireframe: true,
        transparent: true,
        opacity: 0.82,
      });
      const core: Mesh = new THREE.Mesh(coreGeom, coreMat);
      group.add(core);

      const loader = new THREE.TextureLoader();
      const nodes: OrbitNode[] = [];
      const iconCount = LANDING_SOCIAL_ORBIT_ICONS.length;

      await Promise.all(
        LANDING_SOCIAL_ORBIT_ICONS.map(async (icon, index) => {
          const texture = await loadTexture(loader, icon.src);
          if (disposed) {
            texture.dispose();
            return;
          }
          textures.push(texture);

          const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.92,
            depthWrite: false,
          });
          const sprite = new THREE.Sprite(material);
          sprite.scale.set(0.46, 0.46, 1);

          const angle = (index / iconCount) * Math.PI * 2;
          const orbitPlane = index % 4;
          const radius = 3.35 + orbitPlane * 0.36;
          const verticalRadius =
            orbitPlane === 0 ? 0.95 : orbitPlane === 1 ? 2.1 : orbitPlane === 2 ? 1.65 : 2.45;
          const depthRadius =
            orbitPlane === 0 ? 2.9 : orbitPlane === 1 ? 1.9 : orbitPlane === 2 ? 3.3 : 2.35;
          const tilt =
            orbitPlane === 0
              ? 0.2
              : orbitPlane === 1
                ? Math.PI / 2.8
                : orbitPlane === 2
                  ? -Math.PI / 3.4
                  : Math.PI / 1.75;
          const phase = index * 0.73;

          sprite.position.set(
            Math.cos(angle) * radius,
            Math.sin(angle + phase) * verticalRadius,
            Math.sin(angle + tilt) * depthRadius,
          );
          group.add(sprite);

          nodes.push({
            sprite,
            angle,
            phase,
            speed: 0.0028 + (index % 4) * 0.0014,
            radius,
            verticalRadius,
            depthRadius,
            tilt,
          });
        }),
      );

      const light: DirectionalLight = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(5, 5, 5);
      scene.add(light);
      const ambient: AmbientLight = new THREE.AmbientLight(0xffffff, 0.55);
      scene.add(ambient);

      camera.position.z = 9.5;
      group.position.x = 0;
      group.position.y = 0;

      const animate = (): void => {
        if (disposed || !renderer || !scene) return;
        frameId = requestAnimationFrame(animate);

        core.rotation.y += 0.0035;
        core.rotation.x += 0.0018;
        pointer.x += (pointerTarget.x - pointer.x) * 0.055;
        pointer.y += (pointerTarget.y - pointer.y) * 0.055;
        scrollDepth += (scrollDepthTarget - scrollDepth) * 0.045;
        camera.position.z = 10.6 - scrollDepth * 1.15;
        group.scale.setScalar(0.86 + scrollDepth * 0.08);

        const t = performance.now() * 0.001;
        nodes.forEach((node) => {
          node.angle += node.speed;
          const pointerPull = 0.28 + (node.depthRadius / 4.75) * 0.12;
          node.sprite.position.x =
            Math.cos(node.angle) * node.radius + pointer.x * pointerPull;
          node.sprite.position.y =
            Math.sin(node.angle + node.phase) * node.verticalRadius +
            Math.sin(t * 1.15 + node.phase) * 0.2 -
            pointer.y * pointerPull;
          node.sprite.position.z =
            Math.sin(node.angle + node.tilt) * node.depthRadius + pointer.x * 0.25;
          node.sprite.rotation.z = Math.sin(t + node.angle) * 0.08;
        });

        group.rotation.x = pointer.y * 0.1 - scrollDepth * 0.12;
        group.rotation.y = pointer.x * 0.16 + scrollDepth * 0.32;
        group.rotation.z += 0.0007;
        renderer.render(scene, camera);
      };

      updateScrollDepth();
      animate();
      window.addEventListener("resize", resize);
      window.addEventListener("scroll", updateScrollDepth, { passive: true });
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerleave", onPointerLeave);
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", updateScrollDepth);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      }

      textures.forEach((texture) => texture.dispose());

      if (scene) {
        scene.traverse((object) => {
          const mesh = object as Mesh & { geometry?: { dispose: () => void } };
          if (mesh.geometry) mesh.geometry.dispose();
          const mat = (object as Mesh).material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else if (mat && "dispose" in mat) mat.dispose();
        });
      }
    };
  }, [reduceMotion]);

  if (reduceMotion) return null;

  return (
    <div aria-hidden className="absolute inset-0">
      <div className="absolute inset-0 bg-slate-950/12" />
      <div
        ref={containerRef}
        className="absolute inset-0 h-full w-full opacity-[0.12] sm:opacity-[0.16]"
      />
    </div>
  );
}
