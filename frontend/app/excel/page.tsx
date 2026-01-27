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
  ArrowRight,
  Code2,
  Lightbulb,
  X,
  Keyboard
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';

type Level = 'Beginner' | 'Intermediate' | 'Advanced';

interface SkillItem {
  title: string;
  description: string;
  icon: React.ReactElement<{ className?: string }>;
  details: string[];
  // Interactive Content
  longDescription: string;
  scenario?: string;
  exampleStr: string; // Formula, Shortcut, or Concept
  proTip: string;
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
    color: 'text-emerald-400',
    bgStart: 'from-emerald-950/30',
    bgEnd: 'to-transparent',
    description: 'Foundations & Basics',
    skills: [
      {
        title: 'Interface Basics',
        description: 'Master the Excel environment.',
        icon: <LayoutGrid className="w-5 h-5" />,
        details: ['Ribbon navigation', 'Quick Access Toolbar', 'Name Box usage'],
        longDescription: "The Excel interface is your command center. Navigating it quickly distinguishes a rookie from a pro. Understanding the Ribbon hierarchy (Tabs > Groups > Commands) and customizing your workspace is step one.",
        scenario: "You need to frequently access 'Paste Values' which is hidden in menus.",
        exampleStr: "Right-click any button > Add to Quick Access Toolbar",
        proTip: "Use 'Ctrl + Arrow Keys' to instantly jump to the edge of your data region."
      },
      {
        title: 'Data Entry',
        description: 'Efficient input methods.',
        icon: <FileSpreadsheet className="w-5 h-5" />,
        details: ['AutoFill & Flash Fill', 'Cell Formatting', 'Basic Data Types'],
        longDescription: "Data entry shouldn't be manual drudgery. Excel offers powerful tools to automate pattern recognition and formatting. Flash Fill, in particular, uses AI to guess your intent.",
        scenario: "You have a list of full names 'John Doe' and need separate columns for First and Last Name.",
        exampleStr: "Type 'John' in adjacent column, press Ctrl + E (Flash Fill).",
        proTip: "Never manually type a sequence (1, 2, 3...). Type 1 and 2, highlight both, and drag the fill handle."
      },
      {
        title: 'Basic Formulas',
        description: 'Core calculation functions.',
        icon: <Calculator className="w-5 h-5" />,
        details: ['SUM, AVERAGE, COUNT', 'MIN, MAX functions', 'Relative vs Absolute References ($)'],
        longDescription: "Formulas are the heart of Excel. Every formula must start with an equals sign (=). Understanding the difference between A1 (Relative) and $A$1 (Absolute) is the most critical concept for beginners.",
        scenario: "Calculating total sales for a column of monthly revenue.",
        exampleStr: "=SUM(B2:B12) or Alt + =",
        proTip: "Press F4 while typing a cell reference to toggle between Relative and Absolute locking ($)."
      },
      {
        title: 'Data Organization',
        description: 'Sorting and restructuring data.',
        icon: <Filter className="w-5 h-5" />,
        details: ['Basic Sorting (A-Z)', 'Simple Filtering', 'Hiding/Unhiding Rows'],
        longDescription: "Raw data is often messy. Filters allow you to slice and dice data to find specific records, while sorting helps rank items by magnitude or alphabet.",
        scenario: "You need to see only the sales transactions that happened in 'Q4' and were above $1000.",
        exampleStr: "Ctrl + Shift + L (Toggle Filters)",
        proTip: "Avoid hiding rows manually. Use Grouping (Shift + Alt + Right Arrow) to create collapsible sections instead."
      },
      {
        title: 'Basic Charts',
        description: 'Visualizing simple datasets.',
        icon: <BarChart3 className="w-5 h-5" />,
        details: ['Bar & Column Charts', 'Pie Charts', 'Chart Elements'],
        longDescription: "A picture is worth a thousand numbers. Effective charting isn't just about making it look pretty, it's about choosing the right visualization for the story you want to tell.",
        scenario: "Comparing revenue across 5 different regions.",
        exampleStr: "Select Data > Insert > Clustered Column Chart",
        proTip: "Remove 'Chart Junk'—delete gridlines, unnecessary legends, and borders to make your data stand out."
      }
    ]
  },
  {
    id: 'Intermediate',
    color: 'text-cyan-400',
    bgStart: 'from-cyan-950/30',
    bgEnd: 'to-transparent',
    description: 'Data Management & Logic',
    skills: [
      {
        title: 'Logical Functions',
        description: 'Decision-making formulas.',
        icon: <BrainCircuit className="w-5 h-5" />,
        details: ['IF statements', 'AND / OR logic', 'IFERROR handling'],
        longDescription: "Logic functions allow your spreadsheet to make decisions. The IF statement is the most fundamental: 'If this is true, do X, otherwise do Y'.",
        scenario: "Assigning 'Bonus' if sales > $10,000, otherwise 'No Bonus'.",
        exampleStr: "=IF(B2>10000, \"Bonus\", \"No Bonus\")",
        proTip: "Wrap complex formulas in =IFERROR(formula, 0) to replace ugly #DIV/0! errors with clean zeros or dashes."
      },
      {
        title: 'Lookup Functions',
        description: 'Connecting data across sheets.',
        icon: <Search className="w-5 h-5" />,
        details: ['VLOOKUP basics', 'HLOOKUP', 'Modern XLOOKUP'],
        longDescription: "Lookups act like a phonebook: they find a unique ID in one list and return related information from another. XLOOKUP is the modern, superior replacement for VLOOKUP.",
        scenario: "You have specific Product IDs and need to fetch their Prices from a master Price List sheet.",
        exampleStr: "=XLOOKUP(lookup_value, lookup_array, return_array)",
        proTip: "XLOOKUP defaults to an exact match (unlike VLOOKUP), so you don't need to specify 'FALSE' or '0' at the end."
      },
      {
        title: 'Pivot Tables',
        description: 'Summarizing large datasets.',
        icon: <Table className="w-5 h-5" />,
        details: ['Creating Summaries', 'Slicers for filtering', 'Timelines'],
        longDescription: "Pivot Tables are the most powerful summary tool in Excel. They can aggregate 100,000 rows of transactional data into a clean summary report in seconds, with no formulas required.",
        scenario: "Summarizing total sales by Region and then breaking it down by Sales Rep.",
        exampleStr: "Insert > Pivot Table > Drag 'Region' to Rows, 'Sales' to Values",
        proTip: "Use 'Slicers' instead of standard filters to make your Pivot Tables interactive and dashboard-ready."
      },
      {
        title: 'Conditional Formatting',
        description: 'Visual rules for data.',
        icon: <CheckCircle2 className="w-5 h-5" />,
        details: ['Highlight Rules (> X)', 'Data Bars', 'Color Scales'],
        longDescription: "Conditional Formatting automatically colors cells based on their values. It grabs attention and highlights trends, outliers, or warnings instantly.",
        scenario: "Highlighting any student grade below 70 in red.",
        exampleStr: "Home > Conditional Formatting > Highlight Cells Rules > Less Than... 70",
        proTip: "Use 'Data Bars' to create mini-bar charts directly inside your cells to visualize magnitude."
      },
      {
        title: 'Data Validation',
        description: 'Controlling user input.',
        icon: <CheckCircle2 className="w-5 h-5" />,
        details: ['Dropdown Lists', 'Input Messages', 'Error Alerts'],
        longDescription: "Garbage in, garbage out. Data Validation prevents users from entering invalid data by restricting input to specific types or lists.",
        scenario: "Ensuring users selects a Department from a specific list rather than typing it manually.",
        exampleStr: "Data > Data Validation > Allow: List > Source: =A1:A5",
        proTip: "You can create dependent dropdowns (where list B depends on selection A) using the INDIRECT function."
      }
    ]
  },
  {
    id: 'Advanced',
    color: 'text-purple-400',
    bgStart: 'from-purple-950/30',
    bgEnd: 'to-transparent',
    description: 'Automation & Analysis',
    skills: [
      {
        title: 'Dynamic Arrays',
        description: 'Modern array handling.',
        icon: <Database className="w-5 h-5" />,
        details: ['FILTER & SORT', 'UNIQUE lists', 'SEQUENCE generation'],
        longDescription: "Dynamic Arrays (introduced in 2020) changed Excel forever. One formula can now spill results into multiple neighboring cells automatically.",
        scenario: "Extracting a list of unique customer names from a column of 1000 duplicates.",
        exampleStr: "=UNIQUE(A2:A1000)",
        proTip: "Combine functions! =SORT(UNIQUE(range)) gives you a sorted, clean list in one go."
      },
      {
        title: 'Power Query',
        description: 'ETL (Extract, Transform, Load).',
        icon: <Zap className="w-5 h-5" />,
        details: ['Importing external data', 'Cleaning/Transforming', 'Automated Refresh'],
        longDescription: "Power Query is a data transformation engine. It records your cleanup steps (removing rows, splitting columns, unpivoting) so you can replay them on new data with one click.",
        scenario: "Combining 12 monthly CSV files into one master dataset automatically.",
        exampleStr: "Data > Get Data > From Folder",
        proTip: "Power Query is non-destructive. It doesn't change your original file, it just reads and transforms it for the output."
      },
      {
        title: 'Advanced Formulas',
        description: 'Complex nested logic.',
        icon: <Calculator className="w-5 h-5" />,
        details: ['Nested IFs', 'INDEX / MATCH', 'LAMBDA functions'],
        longDescription: "Advanced formulas involve nesting multiple functions to solve complex logic puzzles. LAMBDA allows you to define your own custom reusable functions.",
        scenario: "Looking up values based on two criteria (Row and Column intersection).",
        exampleStr: "=INDEX(Data, MATCH(RowVal, RowRange, 0), MATCH(ColVal, ColRange, 0))",
        proTip: "Use 'Evaluate Formula' tool in the Formulas tab to step through nested logic one piece at a time."
      },
      {
        title: 'Automation',
        description: 'Scripting and Macros.',
        icon: <BotIcon className="w-5 h-5" />,
        details: ['Recording Macros', 'VBA Basics', 'Automating repetitive tasks'],
        longDescription: "Macros allow you to record a series of actions and replay them. For deeper control, VBA (Visual Basic for Applications) lets you write code to manipulate Excel.",
        scenario: "Formatting a report the exact same way every morning.",
        exampleStr: "Developer Tab > Record Macro",
        proTip: "Save your workbook as .xlsm (Macro-Enabled) or your code will be lost!"
      },
      {
        title: 'Modeling',
        description: 'What-If Analysis tools.',
        icon: <TrendingUp className="w-5 h-5" />,
        details: ['Solver Add-in', 'Goal Seek', 'Scenario Manager'],
        longDescription: "Modeling uses Excel to predict future outcomes. Tools like Solver can find the optimal solution for complex problems with many constraints.",
        scenario: "Determining the optimal product mix to maximize profit given limited raw materials.",
        exampleStr: "Data > Solver (requires activation in Add-ins)",
        proTip: "Goal Seek is great for 'Backsolving'—e.g., 'What interest rate do I need to get my payment down to $500?'"
      }
    ]
  }
];

export default function ExcelDashboard() {
  const [activeTab, setActiveTab] = useState<Level>('Beginner');
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);

  const currentLevelData = roadmapData.find(d => d.id === activeTab) || roadmapData[0];

  return (
    // Main Container
    <div className="min-h-screen bg-[#0b0e14] text-slate-200 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">

      {/* Header */}
      <header className="bg-[#0b0e14]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="mr-6 hover:opacity-80 transition-opacity">
              <Image src="/quantdash_logo.png" alt="QuantDash" width={200} height={64} className="h-16 w-auto object-contain mix-blend-lighten" style={{ filter: 'contrast(1.5)' }} />
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
              currentLevelData.bgStart, currentLevelData.bgEnd
            )}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={clsx("text-2xl font-bold mb-2", currentLevelData.color)}>
                    <span>
                      {currentLevelData.id} Level
                    </span>
                  </h3>
                  <p className="text-slate-300 text-lg">{currentLevelData.description}</p>
                </div>
                <div className={clsx("p-3 rounded-full bg-white/5 border border-white/10", currentLevelData.color)}>
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
                onClick={() => setSelectedSkill(skill)}
                className="group bg-white/5 rounded-xl p-6 border border-white/10 shadow-sm hover:shadow-md hover:border-emerald-500/50 hover:bg-white/10 transition-all duration-300 relative overflow-hidden cursor-pointer"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-500 group-hover:text-emerald-400 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500">
                  {React.cloneElement(skill.icon, { className: "w-24 h-24" })}
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

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-xs text-emerald-500/0 group-hover:text-emerald-400 transition-all font-medium uppercase tracking-wide">
                    Click to learn more <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedSkill && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedSkill(null)}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              />
              <motion.div
                layoutId={`card-${selectedSkill.title}`}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-[#0F1218] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                {/* Modal Header */}
                <div className="relative h-32 bg-gradient-to-r from-emerald-900/40 to-slate-900 border-b border-white/10 flex items-center px-8 shrink-0">
                  <div className="absolute top-4 right-4 z-20">
                    <button
                      onClick={() => setSelectedSkill(null)}
                      className="p-2 bg-black/20 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="absolute right-0 bottom-0 opacity-10">
                    {React.cloneElement(selectedSkill.icon, { className: "w-48 h-48 translate-y-12 translate-x-12" })}
                  </div>

                  <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-xl bg-slate-950/50 border border-white/10 flex items-center justify-center text-emerald-400 shadow-lg">
                      {React.cloneElement(selectedSkill.icon, { className: "w-8 h-8" })}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-1">{selectedSkill.title}</h2>
                      <p className="text-emerald-400 font-medium opacity-90">{selectedSkill.description}</p>
                    </div>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar">
                  <div className="prose prose-invert max-w-none space-y-8">

                    {/* Long Description */}
                    <div className="text-lg text-slate-300 leading-relaxed font-light">
                      {selectedSkill.longDescription}
                    </div>

                    {/* Example/Scenario Section */}
                    {selectedSkill.scenario && (
                      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                        <div className="bg-white/5 px-6 py-3 border-b border-white/5 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Real-World Scenario</span>
                        </div>
                        <div className="p-6">
                          <p className="text-slate-300 mb-4">{selectedSkill.scenario}</p>
                          <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm border border-white/10 text-emerald-300 flex items-start gap-3">
                            <Code2 className="w-4 h-4 mt-0.5 opacity-50 shrink-0" />
                            <span>{selectedSkill.exampleStr}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Key Concepts Grid */}
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Key Concepts</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedSkill.details.map((detail, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 border border-white/5 text-slate-300 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500/50" />
                            {detail}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pro Tip */}
                    {selectedSkill.proTip && (
                      <div className="flex items-start gap-4 p-5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <Keyboard className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-purple-400 font-bold text-sm uppercase tracking-wide mb-1">Pro Tip</h4>
                          <p className="text-purple-100/80 text-sm leading-relaxed">
                            {selectedSkill.proTip}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </motion.div>
            </div>
          )}
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
