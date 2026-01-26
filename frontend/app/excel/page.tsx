'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  BarChart3,
  Database,
  Filter,
  Table,
  Search,
  Zap,
  FileSpreadsheet,
  BrainCircuit,
  TrendingUp,
  LayoutGrid,
  CheckCircle2,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

type Level = 'Beginner' | 'Intermediate' | 'Advanced';

interface SkillItem {
  title: string;
  description: string;
  icon: React.ReactElement;
  details?: string[];
}

interface LevelData {
  id: Level;
  color: string;
  bgStart: string;
  bgEnd: string;
  description: string;
  skills: SkillItem[];
}

// Helper icon component since Bot is not in lucide-react standard export sometimes
const BotIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
);

const roadmapData: LevelData[] = [
  {
    id: 'Beginner',
    color: 'text-emerald-600',
    bgStart: 'from-emerald-50',
    bgEnd: 'to-white',
    description: 'Foundations & Basics',
    skills: [
      {
        title: 'Interface Basics',
        description: 'Master the Excel environment.',
        icon: <LayoutGrid className="w-5 h-5" />,
        details: ['Ribbon navigation', 'Quick Access Toolbar', 'Name Box usage']
      },
      {
        title: 'Data Entry',
        description: ' efficient input methods.',
        icon: <FileSpreadsheet className="w-5 h-5" />,
        details: ['AutoFill & Flash Fill', 'Cell Formatting (Borders, Numbers)', 'Basic Data Types']
      },
      {
        title: 'Basic Formulas',
        description: 'Core calculation functions.',
        icon: <Calculator className="w-5 h-5" />,
        details: ['SUM, AVERAGE, COUNT', 'MIN, MAX functions', 'Relative vs Absolute References ($)']
      },
      {
        title: 'Data Organization',
        description: 'Sorting and restructuring data.',
        icon: <Filter className="w-5 h-5" />,
        details: ['Basic Sorting (A-Z)', 'Simple Filtering', 'Hiding/Unhiding Rows']
      },
      {
        title: 'Basic Charts',
        description: 'Visualizing simple datasets.',
        icon: <BarChart3 className="w-5 h-5" />,
        details: ['Bar & Column Charts', 'Pie Charts', 'Chart Elements']
      }
    ]
  },
  {
    id: 'Intermediate',
    color: 'text-blue-600',
    bgStart: 'from-blue-50',
    bgEnd: 'to-white',
    description: 'Data Management & Logic',
    skills: [
      {
        title: 'Logical Functions',
        description: 'Decision-making formulas.',
        icon: <BrainCircuit className="w-5 h-5" />,
        details: ['IF statements', 'AND / OR logic', 'IFERROR handling']
      },
      {
        title: 'Lookup Functions',
        description: 'Connecting data across sheets.',
        icon: <Search className="w-5 h-5" />,
        details: ['VLOOKUP basics', 'HLOOKUP', 'Modern XLOOKUP']
      },
      {
        title: 'Pivot Tables',
        description: 'Summarizing large datasets.',
        icon: <Table className="w-5 h-5" />,
        details: ['Creating Summaries', 'Slicers for filtering', 'Timelines']
      },
      {
        title: 'Conditional Formatting',
        description: 'Visual rules for data.',
        icon: <CheckCircle2 className="w-5 h-5" />,
        details: ['Highlight Rules (> X)', 'Data Bars', 'Color Scales']
      },
      {
        title: 'Data Validation',
        description: 'Controlling user input.',
        icon: <CheckCircle2 className="w-5 h-5" />,
        details: ['Dropdown Lists', 'Input Messages', 'Error Alerts']
      }
    ]
  },
  {
    id: 'Advanced',
    color: 'text-purple-600',
    bgStart: 'from-purple-50',
    bgEnd: 'to-white',
    description: 'Automation & Analysis',
    skills: [
      {
        title: 'Dynamic Arrays',
        description: 'Modern array handling.',
        icon: <Database className="w-5 h-5" />,
        details: ['FILTER & SORT', 'UNIQUE lists', 'SEQUENCE generation']
      },
      {
        title: 'Power Query',
        description: 'ETL (Extract, Transform, Load).',
        icon: <Zap className="w-5 h-5" />,
        details: ['Importing external data', 'Cleaning/Transforming', 'Automated Refresh']
      },
      {
        title: 'Advanced Formulas',
        description: 'Complex nested logic.',
        icon: <Calculator className="w-5 h-5" />,
        details: ['Nested IFs', 'INDEX / MATCH', 'LAMBDA functions']
      },
      {
        title: 'Automation',
        description: 'Scripting and Macros.',
        icon: <BotIcon className="w-5 h-5" />,
        details: ['Recording Macros', 'VBA Basics', 'Automating repetitive tasks']
      },
      {
        title: 'Modeling',
        description: 'What-If Analysis tools.',
        icon: <TrendingUp className="w-5 h-5" />,
        details: ['Solver Add-in', 'Goal Seek', 'Scenario Manager']
      }
    ]
  }
];

export default function ExcelDashboard() {
  const [activeTab, setActiveTab] = useState<Level>('Beginner');

  const currentLevelData = roadmapData.find(d => d.id === activeTab) || roadmapData[0];

  return (
    // Main Container
    <div className="min-h-screen bg-[#0b0e14] text-slate-200 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">

      {/* Header */}
      <header className="bg-[#0b0e14]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="mr-6 hover:opacity-80 transition-opacity">
              <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent cursor-pointer tracking-tighter drop-shadow-[0_2px_10px_rgba(6,182,212,0.3)]">
                QUANT<span className="font-light text-slate-400">DASH</span>
              </h1>
            </Link>
            <div className="h-8 w-px bg-white/10 mx-2"></div>
            <div className="bg-emerald-500/20 p-2 rounded-lg border border-emerald-500/30">
              <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">Excel Mastery Roadmap</h1>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm text-slate-500">
            <span>v1.0.0</span>
            <span className="w-px h-4 bg-slate-700"></span>
            <span>Dashboard</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Intro Section */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-3">Master Excel, Step by Step</h2>
          <p className="text-slate-400 text-lg">
            A comprehensive curriculum designed to take you from data entry basics to advanced automation and modeling.
          </p>
        </div>

        {/* Tab Navigation */}
        <nav className="flex justify-center mb-12">
          <div className="bg-white/5 p-1.5 rounded-xl border border-white/10 inline-flex">
            {roadmapData.map((level) => (
              <button
                key={level.id}
                onClick={() => setActiveTab(level.id)}
                className={clsx(
                  "px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                  activeTab === level.id
                    ? "bg-emerald-500/20 text-emerald-300 shadow-sm border border-emerald-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                )}
              >
                {activeTab === level.id && (
                  <motion.div
                    layoutId="active-dot"
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                  />
                )}
                {level.id}
              </button>
            ))}
          </div>
        </nav>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Level Description Card */}
            <div className={clsx(
              "col-span-full mb-4 p-8 rounded-2xl bg-gradient-to-br border border-white/10 shadow-sm",
              // We need to update these gradient classes in the data object or map them here. 
              // Since the data object has 'bgStart' and 'bgEnd', we should override them for dark mode or just use inline styles/conditional classes that work with dark mode.
              // For now, let's just make generic dark mode gradients based on the level color.
              "from-white/5 to-transparent backdrop-blur-sm"
            )}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={clsx("text-2xl font-bold mb-2", currentLevelData.color.replace('text-', 'text-'))}>
                    {/* We might need to adjust text colors if they are too dark for dark mode. emerald-600 is okay, but emerald-400 is better on dark. */}
                    <span className={clsx(
                      currentLevelData.id === 'Beginner' ? 'text-emerald-400' :
                        currentLevelData.id === 'Intermediate' ? 'text-blue-400' : 'text-purple-400'
                    )}>
                      {currentLevelData.id} Level
                    </span>
                  </h3>
                  <p className="text-slate-300 text-lg">{currentLevelData.description}</p>
                </div>
                <div className={clsx("p-3 rounded-full bg-white/5 border border-white/10",
                  currentLevelData.id === 'Beginner' ? 'text-emerald-400' :
                    currentLevelData.id === 'Intermediate' ? 'text-blue-400' : 'text-purple-400'
                )}>
                  <CheckIconForLevel level={currentLevelData.id} />
                </div>
              </div>
            </div>

            {/* Skill Cards */}
            {currentLevelData.skills.map((skill, index) => (
              <motion.div
                key={skill.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white/5 rounded-xl p-6 border border-white/10 shadow-sm hover:shadow-md hover:border-emerald-500/50 hover:bg-white/10 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-500 group-hover:text-emerald-400 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500">
                  {React.cloneElement(skill.icon, { className: "w-24 h-24" } as any)}
                </div>

                <div className="relative z-10">
                  <div className={clsx(
                    "w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors duration-300",
                    "bg-white/5 text-slate-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 border border-white/5 group-hover:border-emerald-500/30"
                  )}>
                    {skill.icon}
                  </div>

                  <h4 className="text-lg font-semibold text-slate-200 mb-2 group-hover:text-emerald-300 transition-colors">
                    {skill.title}
                  </h4>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {skill.description}
                  </p>

                  <div className="space-y-2">
                    {skill.details?.map((detail, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-slate-500 group-hover:text-slate-300 transition-colors">
                        <ArrowRight className="w-3 h-3 mt-1 text-emerald-500/70 group-hover:text-emerald-400 flex-shrink-0" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

      </main>

      <footer className="max-w-7xl mx-auto px-4 py-8 border-t border-white/10 mt-12">
        <div className="flex justify-between items-center text-sm text-slate-600">
          <p>© {new Date().getFullYear()} Excel Mastery Roadmap by Ry Quant</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-emerald-400 transition-colors">Documentation</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CheckIconForLevel({ level }: { level: Level }) {
  if (level === 'Beginner') return <LayoutGrid className="w-8 h-8" />;
  if (level === 'Intermediate') return <BrainCircuit className="w-8 h-8" />;
  return <Zap className="w-8 h-8" />;
}
