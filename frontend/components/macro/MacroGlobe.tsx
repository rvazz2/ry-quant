"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Stars } from "@react-three/drei";
import * as THREE from "three";
// import { Card } from "@/components/ui/card"; // Removing unused
import { Loader2 } from "lucide-react";

interface MacroGlobeProps {
    className?: string;
}

interface CountryData {
    country: string;
    lat: number;
    lon: number;
    performance: number; // Market Perf (Renamed from gdp_growth)
    inflation: number;
    color: string;
    code: string;
}

function Marker({ data }: { data: CountryData }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    // Convert Lat/Lon to Vector3
    const position = useMemo(() => {
        const phi = (90 - data.lat) * (Math.PI / 180);
        const theta = (data.lon + 180) * (Math.PI / 180);
        const x = -(Math.sin(phi) * Math.cos(theta));
        const z = Math.sin(phi) * Math.sin(theta);
        const y = Math.cos(phi);
        return new THREE.Vector3(x, y, z).multiplyScalar(1.02); // Radius slightly > 1
    }, [data.lat, data.lon]);

    // Color logic
    const color = data.performance > 0.3 ? "#10b981" : data.performance < -0.3 ? "#ef4444" : "#fbbf24";

    useFrame((state) => {
        if (meshRef.current) {
            // Pulse animation if hovered
            const scale = hovered ? 1.5 : 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
            meshRef.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <group position={position}>
            <mesh
                ref={meshRef}
                onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false); }}
            >
                <sphereGeometry args={[0.025, 16, 16]} />
                <meshBasicMaterial color={color} toneMapped={false} />
            </mesh>
            {hovered && (
                <Html distanceFactor={1.5}>
                    <div className="bg-slate-900/95 text-white p-3 rounded-md border border-slate-700 text-xs w-48 backdrop-blur-md shadow-2xl pointer-events-none z-50 select-none">
                        <div className="font-bold mb-2 text-sm border-b border-slate-700 pb-1 flex justify-between items-center">
                            <span>{data.country}</span>
                            <span className="text-[10px] text-slate-500">{data.code}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span className="text-slate-400">Market (1D):</span>
                            <span className={data.performance >= 0 ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                                {data.performance > 0 ? "+" : ""}{data.performance}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Inflation (Est):</span>
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

function Earth() {
    const earthRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (earthRef.current) {
            earthRef.current.rotation.y += 0.0008; // Gentle rotation
        }
    });

    return (
        <group>
            {/* Wireframe Globe - Holographic Cyan */}
            <mesh ref={earthRef}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshBasicMaterial
                    color="#22d3ee" // Cyan-400
                    wireframe={true}
                    transparent={true}
                    opacity={0.3}
                />
            </mesh>

            {/* Solid Core - Dark Slate */}
            <mesh>
                <sphereGeometry args={[0.98, 64, 64]} />
                <meshBasicMaterial color="#020617" />
            </mesh>

            {/* Atmosphere Glow */}
            <mesh scale={[1.15, 1.15, 1.15]}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshBasicMaterial
                    color="#0ea5e9"
                    transparent
                    opacity={0.05}
                    side={THREE.BackSide}
                />
            </mesh>
        </group>
    );
}

export function MacroGlobe({ className }: MacroGlobeProps) {
    const [data, setData] = useState<CountryData[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <div className={`glass-panel h-[500px] flex items-center justify-center ${className}`}>
                <Loader2 className="animate-spin h-8 w-8 text-cyan-400" />
            </div>
        );
    }

    return (
        <div className={`glass-panel h-[500px] w-full overflow-hidden relative ${className}`}>
            <div className="absolute top-4 left-4 z-10 pointer-events-none select-none">
                <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tracking-tight drop-shadow-md">Global Markets</h3>
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

            <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }}>
                <ambientLight intensity={1.5} />
                <pointLight position={[10, 10, 10]} intensity={2.0} />
                <pointLight position={[-10, 5, 2]} intensity={1.0} color="#38bdf8" />

                <Stars radius={100} depth={50} count={3000} factor={3} saturation={0} fade speed={0.5} />

                <Earth />

                {data.map((country) => (
                    <Marker key={country.code} data={country} />
                ))}

                <OrbitControls
                    enablePan={false}
                    enableZoom={true}
                    minDistance={1.8}
                    maxDistance={4.0}
                    autoRotate
                    autoRotateSpeed={0.5}
                />
            </Canvas>
        </div>
    );
}

