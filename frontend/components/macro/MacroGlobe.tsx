"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Stars, QuadraticBezierLine } from "@react-three/drei";
import * as THREE from "three";
import { Loader2, Maximize2, X, Minimize2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MacroGlobeProps {
    className?: string;
}

interface CountryData {
    country: string;
    city: string;
    lat: number;
    lon: number;
    performance: number;
    inflation: number;
    color: string;
    code: string;
}

// --- Visual Components ---

function Beacon({ data }: { data: CountryData }) {
    const meshRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);

    // Position calc
    const position = useMemo(() => {
        const phi = (90 - data.lat) * (Math.PI / 180);
        const theta = (data.lon + 180) * (Math.PI / 180);
        const x = -(Math.sin(phi) * Math.cos(theta));
        const z = Math.sin(phi) * Math.sin(theta);
        const y = Math.cos(phi);
        return new THREE.Vector3(x, y, z).multiplyScalar(1.0);
    }, [data.lat, data.lon]);

    // Orientation to point outwards from center
    const quaternion = useMemo(() => {
        const dummy = new THREE.Object3D();
        dummy.position.copy(position);
        dummy.lookAt(0, 0, 0);
        return dummy.quaternion;
    }, [position]);

    const color = data.performance > 0.3 ? "#10b981" : data.performance < -0.3 ? "#ef4444" : "#fbbf24";

    useFrame((state) => {
        if (meshRef.current) {
            // Gentle pulse
            const s = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
            meshRef.current.scale.set(s, s, s);
        }
    });

    return (
        <group position={position} quaternion={quaternion}>
            <mesh
                onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false); }}
                rotation={[Math.PI / 2, 0, 0]} // Rotate cylinder to point out
                position={[0, 0, 0.05]} // Offset so base is on surface
            >
                {/* The Beacon Pillar */}
                <cylinderGeometry args={[0.006, 0.006, 0.15, 8]} />
                <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.8} />
            </mesh>

            {/* Glowing Base Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.01]}>
                <ringGeometry args={[0.015, 0.02, 16]} />
                <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.5} />
            </mesh>

            {/* City Label (Persistent) */}
            <Html position={[0, 0.18, 0]} center transform sprite distanceFactor={10}>
                <div className={`text-[6px] font-bold tracking-widest uppercase pointer-events-none select-none text-center whitespace-nowrap ${hovered ? 'text-white' : 'text-slate-400 opacity-60'}`}
                    style={{ textShadow: "0px 1px 2px rgba(0,0,0,0.8)" }}>
                    {data.city}
                </div>
            </Html>

            {/* Hover Tooltip */}
            {hovered && (
                <Html distanceFactor={1.5} position={[0, 0, 0.2]} style={{ pointerEvents: 'none' }}>
                    <div className="bg-slate-900/95 text-white p-3 rounded-md border border-slate-700 text-xs w-48 backdrop-blur-md shadow-2xl z-50 select-none transform -translate-x-1/2 -translate-y-1/2">
                        <div className="font-bold mb-2 text-sm border-b border-slate-700 pb-1 flex justify-between items-center">
                            <span className="text-cyan-400">{data.city}, {data.code}</span>
                            <span className="text-[10px] text-slate-500">{data.country}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span className="text-slate-400">Market (1D):</span>
                            <span className={data.performance >= 0 ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                                {data.performance > 0 ? "+" : ""}{data.performance}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Inflation:</span>
                            <span className={data.inflation < 3 ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                                {data.inflation}%
                            </span>
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
}

function DataArc({ startLat, startLon, endLat, endLon, color = "#0ea5e9" }: { startLat: number, startLon: number, endLat: number, endLon: number, color?: string }) {
    // Helper to get vector
    const getPos = (lat: number, lon: number) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const x = -(Math.sin(phi) * Math.cos(theta));
        const z = Math.sin(phi) * Math.sin(theta);
        const y = Math.cos(phi);
        return new THREE.Vector3(x, y, z);
    };

    const start = getPos(startLat, startLon);
    const end = getPos(endLat, endLon);

    // Midpoint elevated
    const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(1.25); // Arch height

    return (
        <QuadraticBezierLine
            start={start}
            end={end}
            mid={mid}
            color={color}
            lineWidth={1}
            dashed={true}
            dashScale={5}
            // @ts-ignore - types are finicky with drei sometimes
            dashOffset={0}
        >
        </QuadraticBezierLine>
    );
}

function Earth() {
    const earthRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (earthRef.current) {
            earthRef.current.rotation.y += 0.0005;
        }
    });

    return (
        <group>
            {/* Solid Core - Dark Tech Sphere */}
            <mesh ref={earthRef}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshPhongMaterial
                    color="#0f172a"
                    emissive="#020617"
                    specular="#22d3ee"
                    shininess={10}
                    transparent={false}
                />
            </mesh>

            {/* Wireframe Overlay - Cyber Grid */}
            <mesh>
                <sphereGeometry args={[1.002, 32, 32]} />
                <meshBasicMaterial
                    color="#0ea5e9" // Cyan-500
                    wireframe={true}
                    transparent={true}
                    opacity={0.15}
                />
            </mesh>

            {/* Atmosphere Glow */}
            <mesh scale={[1.2, 1.2, 1.2]}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshBasicMaterial
                    color="#38bdf8"
                    transparent
                    opacity={0.06}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    );
}

export function MacroGlobe({ className }: MacroGlobeProps) {
    const [data, setData] = useState<CountryData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`${API_URL}/api/macro/globe`);
                if (!res.ok) throw new Error("Failed to fetch");
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error("Error fetching globe data:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [API_URL]);

    // Handle ESC key to exit full screen
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsFullScreen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    if (loading) {
        return (
            <div className={`glass-panel h-[500px] flex items-center justify-center ${className}`}>
                <Loader2 className="animate-spin h-8 w-8 text-cyan-400" />
            </div>
        );
    }

    const containerClass = isFullScreen
        ? "fixed inset-0 z-[100] w-screen h-screen bg-slate-950/95 backdrop-blur-md"
        : `glass-panel h-[500px] w-full overflow-hidden relative ${className}`;

    return (
        <div className={containerClass}>
            {/* Header / HUD Overlay */}
            <div className={`absolute top-4 left-4 z-10 pointer-events-none select-none transition-all duration-500 ${isFullScreen ? 'top-8 left-8 scale-110 origin-top-left' : ''}`}>
                <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-tight drop-shadow-md flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    Global Markets
                </h3>
                <p className="text-slate-400 text-sm">Real-time Index Performance & Inflation</p>
                <div className="flex gap-2 mt-3">
                    <div className="flex items-center gap-1.5 bg-slate-900/50 px-2 py-1 rounded border border-slate-800">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-xs text-slate-300">Bullish</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-900/50 px-2 py-1 rounded border border-slate-800">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-xs text-slate-300">Mixed</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-900/50 px-2 py-1 rounded border border-slate-800">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-xs text-slate-300">Bearish</span>
                    </div>
                </div>
            </div>

            {/* View Controls */}
            <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleFullScreen}
                    className="bg-slate-900/80 border-slate-700 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 backdrop-blur-sm"
                >
                    {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </Button>
            </div>

            {/* Full Screen Exit Button (Top Right) */}
            {isFullScreen && (
                <div className="absolute top-8 right-8 z-20">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsFullScreen(false)}
                        className="text-slate-400 hover:text-white hover:bg-slate-800/50"
                    >
                        <X className="w-8 h-8" />
                    </Button>
                    <div className="text-xs text-slate-500 text-center mt-1">ESC</div>
                </div>
            )}

            <Canvas camera={{ position: [0, 0, isFullScreen ? 3.2 : 2.6], fov: 45 }}>
                <ambientLight intensity={1.5} />
                <pointLight position={[10, 10, 10]} intensity={2.0} color="#38bdf8" />
                <pointLight position={[-10, 5, 2]} intensity={1.0} color="#c084fc" />

                <Stars radius={100} depth={50} count={isFullScreen ? 5000 : 3000} factor={3} saturation={0} fade speed={0.5} />

                <Earth />

                {/* Connectivity Arcs (Hardcoded Major Routes) */}
                <DataArc startLat={40.71} startLon={-74.00} endLat={51.50} endLon={-0.12} color="#0ea5e9" /> {/* NY - London */}
                <DataArc startLat={51.50} startLon={-0.12} endLat={35.67} endLon={139.65} color="#0ea5e9" /> {/* London - Tokyo */}
                <DataArc startLat={40.71} startLon={-74.00} endLat={35.67} endLon={139.65} color="#0ea5e9" /> {/* NY - Tokyo */}
                <DataArc startLat={51.50} startLon={-0.12} endLat={47.37} endLon={8.54} color="#6366f1" />   {/* London - Zurich */}
                <DataArc startLat={35.86} startLon={104.19} endLat={1.35} endLon={103.81} color="#6366f1" />  {/* China - Singapore */}


                {data.map((country) => (
                    <Beacon key={country.code} data={country} />
                ))}

                <OrbitControls
                    enablePan={false}
                    enableZoom={true}
                    minDistance={1.8}
                    maxDistance={6.0}
                    autoRotate
                    autoRotateSpeed={0.5}
                />
            </Canvas>
        </div>
    );
}
