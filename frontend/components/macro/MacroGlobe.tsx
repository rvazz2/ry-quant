"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Stars } from "@react-three/drei";
import * as THREE from "three";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";

// Define prop interface - make it optional/flexible if needed
interface MacroGlobeProps {
    className?: string;
}

interface CountryData {
    country: string;
    lat: number;
    lon: number;
    gdp_growth: number;
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

    const color = data.color === "green" ? "#10b981" : data.color === "red" ? "#ef4444" : "#f59e0b";

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
                <meshBasicMaterial color={color} />
            </mesh>
            {hovered && (
                <Html distanceFactor={1.5}>
                    <div className="bg-slate-900/90 text-white p-3 rounded-md border border-slate-700 text-xs w-40 backdrop-blur-md shadow-xl pointer-events-none">
                        <div className="font-bold mb-2 text-sm border-b border-slate-700 pb-1">{data.country}</div>
                        <div className="flex justify-between mb-1">
                            <span className="text-slate-400">GDP Growth:</span>
                            <span className={data.gdp_growth >= 2 ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                                {data.gdp_growth}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Inflation:</span>
                            <span className={data.inflation < 3 ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
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

    useFrame(() => {
        if (earthRef.current) {
            earthRef.current.rotation.y += 0.0005; // Slow rotation
        }
    });

    return (
        <mesh ref={earthRef}>
            <sphereGeometry args={[1, 64, 64]} />
            <meshStandardMaterial
                color="#1e293b" // Dark Slate
                emissive="#0f172a"
                emissiveIntensity={0.2}
                wireframe={true}
                transparent
                opacity={0.15}
            />
            <mesh>
                <sphereGeometry args={[0.99, 64, 64]} />
                <meshBasicMaterial color="#020617" />
            </mesh>
        </mesh>
    );
}

export function MacroGlobe({ className }: MacroGlobeProps) {
    const [data, setData] = useState<CountryData[]>([]);
    const [loading, setLoading] = useState(true);

    // API URL handling for dev/prod
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
                // Fallback or empty data
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [API_URL]);

    if (loading) {
        return (
            <Card className={`h-[500px] flex items-center justify-center bg-slate-950 border-slate-800 ${className}`}>
                <Loader2 className="animate-spin h-8 w-8 text-slate-500" />
            </Card>
        );
    }

    return (
        <Card className={`h-[500px] w-full bg-slate-950 border-slate-800 overflow-hidden relative ${className}`}>
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <h3 className="text-xl font-bold text-white tracking-tight">Global Economic Pulse</h3>
                <p className="text-slate-400 text-sm">Real-time GDP & Inflation Data</p>
                <div className="flex gap-2 mt-3">
                    <div className="flex items-center gap-1.5 bg-slate-900/50 px-2 py-1 rounded border border-slate-800">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-xs text-slate-300">Strong</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-900/50 px-2 py-1 rounded border border-slate-800">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-xs text-slate-300">Neutral</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-900/50 px-2 py-1 rounded border border-slate-800">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-xs text-slate-300">Weak/High Infl</span>
                    </div>
                </div>
            </div>

            <Canvas camera={{ position: [0, 0, 2.8], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                <Earth />

                {data.map((country) => (
                    <Marker key={country.code} data={country} />
                ))}

                <OrbitControls
                    enablePan={false}
                    enableZoom={true}
                    minDistance={1.8}
                    maxDistance={4.5}
                    autoRotate
                    autoRotateSpeed={0.8}
                />
            </Canvas>
        </Card>
    );
}
