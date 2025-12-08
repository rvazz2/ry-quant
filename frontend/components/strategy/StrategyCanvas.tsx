"use client";

import React, { useState, useCallback } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    BackgroundVariant,
    Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes: Node[] = [
    { id: '1', position: { x: 200, y: 100 }, data: { label: 'Market Data Trigger' }, type: 'input' },
    { id: '2', position: { x: 200, y: 300 }, data: { label: 'SMA Crossover' } },
    { id: '3', position: { x: 200, y: 500 }, data: { label: 'Buy Action' }, type: 'output' },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
];

export default function StrategyCanvas() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const addNode = (label: string, type: string = 'default') => {
        const newNode: Node = {
            id: Math.random().toString(),
            position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
            data: { label: label },
            type: type
        }
        setNodes((nds) => nds.concat(newNode));
    }

    return (
        <div className="w-full h-[80vh] bg-[#111] rounded-xl border border-[#222] overflow-hidden">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                colorMode="dark"
                fitView
            >
                <Controls className="bg-[#1A1A1A] border border-[#333] fill-gray-200" />
                <MiniMap className="bg-[#1A1A1A] border border-[#333]" nodeColor="#444" maskColor="rgba(0,0,0,0.6)" />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#333" />

                <Panel position="top-left" className="bg-[#1A1A1A] p-2 rounded-lg border border-[#333] flex gap-2">
                    <button onClick={() => addNode('Indicator', 'default')} className="px-3 py-1.5 text-xs bg-[#222] hover:bg-[#333] rounded text-gray-300 border border-[#444]">
                        + Indicator
                    </button>
                    <button onClick={() => addNode('Logic (AND/OR)', 'default')} className="px-3 py-1.5 text-xs bg-[#222] hover:bg-[#333] rounded text-gray-300 border border-[#444]">
                        + Logic
                    </button>
                    <button onClick={() => addNode('Action (Buy/Sell)', 'output')} className="px-3 py-1.5 text-xs bg-teal-900/30 hover:bg-teal-900/50 border border-teal-800 rounded text-teal-300">
                        + Action
                    </button>
                </Panel>
            </ReactFlow>
        </div>
    );
}
