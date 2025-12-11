"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, QuadraticBezierLine } from "@react-three/drei";
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

    const quaternion = useMemo(() => {
        const dummy = new THREE.Object3D();
        dummy.position.copy(position);
        dummy.lookAt(0, 0, 0);
        return dummy.quaternion;
    }, [position]);

    const color = data.performance > 0.3 ? "#10b981" : data.performance < -0.3 ? "#ef4444" : "#f59e0b";

    useFrame((state) => {
        if (meshRef.current) {
            const s = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
            meshRef.current.scale.set(s, s, s);
        }
    });

    return (
        <group position={position} quaternion={quaternion}>
            <mesh
                onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false); }}
                rotation={[Math.PI / 2, 0, 0]}
                position={[0, 0, 0.05]}
            >
                <cylinderGeometry args={[0.008, 0.008, 0.15, 8]} />
                <meshBasicMaterial color={color} toneMapped={false} />
            </mesh>

            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.01]}>
                <ringGeometry args={[0.015, 0.025, 16]} />
                <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.6} />
            </mesh>

            <Html position={[0, 0.18, 0]} center transform sprite distanceFactor={10}>
                <div className={`text-[8px] font-bold tracking-widest uppercase pointer-events-none select-none text-center whitespace-nowrap text-slate-700`}
                    style={{ textShadow: "0px 0px 2px rgba(255,255,255,0.8)" }}>
                    {data.city}
                </div>
            </Html>

            {hovered && (
                <Html distanceFactor={1.5} position={[0, 0, 0.2]} style={{ pointerEvents: 'none' }}>
                    <div className="bg-white/95 text-slate-900 p-3 rounded-md border border-slate-200 text-xs w-48 shadow-xl z-50 select-none transform -translate-x-1/2 -translate-y-1/2">
                        <div className="font-bold mb-2 text-sm border-b border-slate-100 pb-1 flex justify-between items-center">
                            <span className="text-blue-600">{data.city}, {data.code}</span>
                            <span className="text-[10px] text-slate-500">{data.country}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span className="text-slate-500">Market (1D):</span>
                            <span className={data.performance >= 0 ? "text-emerald-600 font-bold" : "text-red-500 font-bold"}>
                                {data.performance > 0 ? "+" : ""}{data.performance}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Inflation:</span>
                            <span className={data.inflation < 3 ? "text-emerald-600 font-bold" : "text-amber-500 font-bold"}>
                                {data.inflation}%
                            </span>
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
}

function DataArc({ startLat, startLon, endLat, endLon, color = "#3b82f6" }: { startLat: number, startLon: number, endLat: number, endLon: number, color?: string }) {
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
    const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(1.25);

    return (
        <QuadraticBezierLine
            start={start}
            end={end}
            mid={mid}
            color={color}
            lineWidth={1}
            dashed={true}
            dashScale={5}
            // @ts-ignore
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
            {/* White/Grey Ocean Sphere */}
            <mesh ref={earthRef}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshPhongMaterial
                    color="#f1f5f9" // Slate-100
                    emissive="#ffffff"
                    emissiveIntensity={0.2}
                    specular="#cbd5e1"
                    shininess={5}
                />
            </mesh>

            {/* Blue/Grey Grid Overlay */}
            <mesh>
                <sphereGeometry args={[1.002, 32, 32]} />
                <meshBasicMaterial
                    color="#94a3b8" // Slate-400
                    wireframe={true}
                    transparent={true}
                    opacity={0.3}
                />
            </mesh>

            {/* Inner Glow to simulate atmosphere volume */}
            <mesh scale={[0.9, 0.9, 0.9]}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshBasicMaterial
                    color="#bfdbfe" // Blue-200
                    transparent
                    opacity={0.1}
                    side={THREE.BackSide}
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

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsFullScreen(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

    if (loading) {
        return (
            <div className={`bg-white border border-slate-200 rounded-xl h-[500px] flex items-center justify-center ${className}`}>
                <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            </div>
        );
    }

    const containerClass = isFullScreen
        ? "fixed inset-0 z-[100] w-screen h-screen bg-slate-50"
        : `bg-white border border-slate-200 rounded-xl h-[500px] w-full overflow-hidden relative shadow-sm ${className}`;

    return (
        <div className={containerClass}>
            {/* Header / HUD Overlay (Light Mode) */}
            <div className={`absolute top-4 left-4 z-10 pointer-events-none select-none transition-all duration-500 ${isFullScreen ? 'top-8 left-8 scale-110 origin-top-left' : ''}`}>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    Global Markets
                </h3>
                <p className="text-slate-500 text-sm">Real-time Index Performance & Inflation</p>
                <div className="flex gap-2 mt-3 pointer-events-auto">
                    <div className="flex items-center gap-1.5 bg-slate-900 text-white px-2 py-1 rounded shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-[#10b981]"></div>
                        <span className="text-xs font-medium">Bullish</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-900 text-white px-2 py-1 rounded shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-[#f59e0b]"></div>
                        <span className="text-xs font-medium">Mixed</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-900 text-white px-2 py-1 rounded shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-[#ef4444]"></div>
                        <span className="text-xs font-medium">Bearish</span>
                    </div>
                </div>
            </div>

            {/* View Controls */}
            <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleFullScreen}
                    className="bg-white border-slate-200 hover:bg-slate-100 text-slate-700 shadow-sm"
                >
                    {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </Button>
            </div>

            {/* Exit Button */}
            {isFullScreen && (
                <div className="absolute top-8 right-8 z-20">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsFullScreen(false)}
                        className="text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                    >
                        <X className="w-8 h-8" />
                    </Button>
                    <div className="text-xs text-slate-400 text-center mt-1">ESC</div>
                </div>
            )}

            <Canvas camera={{ position: [0, 0, isFullScreen ? 3.0 : 2.5], fov: 45 }}>
                <ambientLight intensity={1.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
                <pointLight position={[-10, 5, 2]} intensity={0.5} color="#bfdbfe" />

                <Earth />

                <DataArc startLat={40.71} startLon={-74.00} endLat={51.50} endLon={-0.12} color="#3b82f6" />
                <DataArc startLat={51.50} startLon={-0.12} endLat={35.67} endLon={139.65} color="#3b82f6" />
                <DataArc startLat={40.71} startLon={-74.00} endLat={35.67} endLon={139.65} color="#3b82f6" />
                <DataArc startLat={51.50} startLon={-0.12} endLat={47.37} endLon={8.54} color="#6366f1" />
                <DataArc startLat={35.86} startLon={104.19} endLat={1.35} endLon={103.81} color="#6366f1" />

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
