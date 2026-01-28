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
  // Enhanced Content
  keyboardShortcuts?: Array<{ key: string; description: string; mac?: string }>;
  scenarios?: Array<{ context: string; solution: string; formula?: string }>;
  commonPitfalls?: string[];
  advancedTechniques?: string[];
  bestPractices?: string[];
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
        details: ['Ribbon navigation', 'Quick Access Toolbar', 'Name Box usage', 'View modes', 'Freeze Panes'],
        longDescription: "The Excel interface is your command center. Navigating it quickly distinguishes a rookie from a pro. Understanding the Ribbon hierarchy (Tabs > Groups > Commands) and customizing your workspace is step one. Excel's interface adapts to your workflow—master the Quick Access Toolbar to access your most-used commands in a single click. The Name Box isn't just for displaying cell addresses; it's a powerful navigation and selection tool. Professional users configure their workspace to minimize mouse usage and maximize efficiency through keyboard-driven workflows.",
        scenario: "You need to frequently access 'Paste Values' which is hidden in menus.",
        exampleStr: "Right-click any button > Add to Quick Access Toolbar",
        proTip: "Use 'Ctrl + Arrow Keys' to instantly jump to the edge of your data region.",
        keyboardShortcuts: [
          { key: "Ctrl + Home", description: "Jump to cell A1", mac: "Cmd + Home" },
          { key: "Ctrl + End", description: "Jump to last used cell", mac: "Cmd + End" },
          { key: "Ctrl + Page Up/Down", description: "Switch between worksheets", mac: "Cmd + Page Up/Down" },
          { key: "Alt (then release)", description: "Show keyboard shortcuts for Ribbon", mac: "Alt" },
          { key: "Ctrl + F1", description: "Toggle Ribbon display", mac: "Cmd + Option + R" },
          { key: "F5", description: "Open Go To dialog", mac: "F5" },
          { key: "Ctrl + G", description: "Go To Special", mac: "Cmd + G" },
          { key: "Alt + W + F + F", description: "Freeze Panes", mac: "Alt + W + F + F" }
        ],
        scenarios: [
          { context: "Finance: Navigate a large financial model with 50+ sheets", solution: "Use Ctrl+Page Up/Down to move between sheets, and right-click sheet tabs to 'Unhide' hidden sheets", formula: "Ctrl+Page Down (next sheet)" },
          { context: "Analysis: Jump to specific named ranges in a complex workbook", solution: "Click Name Box dropdown or press F5, type the range name like 'SalesData', press Enter", formula: "F5 > Type range name" },
          { context: "Data Entry: Keep headers visible while scrolling thousands of rows", solution: "Select the row below headers (e.g., row 2), then View > Freeze Panes > Freeze Panes", formula: "Alt + W + F + F" }
        ],
        commonPitfalls: [
          "Spending too much time using the mouse—learn keyboard shortcuts for 80% faster navigation",
          "Not customizing the Quick Access Toolbar—add your top 10 commands for instant access",
          "Ignoring the Name Box—it's not just for display, type a cell address to jump there instantly",
          "Forgetting to use 'Freeze Panes' on large datasets—always freeze headers and row labels",
          "Not knowing about Ctrl+Arrow keys—the fastest way to navigate data boundaries"
        ],
        advancedTechniques: [
          "Use 'Go To Special' (Ctrl+G > Special) to select all formulas, constants, or blanks at once",
          "Customize the Ribbon by right-clicking it > Customize Ribbon to create custom tabs for your workflow",
          "Split windows (Alt+W+S) to view two parts of the same sheet simultaneously"
        ],
        bestPractices: [
          "Always freeze panes when working with tables that have headers",
          "Use named ranges (Ctrl+F3) instead of cell references for clearer formulas",
          "Keep frequently-used files pinned to the 'Recent' list for quick access",
          "Set up custom views (View > Custom Views) to save different display configurations",
          "Use the Zoom slider strategically—zoom out for overview, zoom in for detail work"
        ]
      },
      {
        title: 'Data Entry',
        description: 'Efficient input methods.',
        icon: <FileSpreadsheet className="w-5 h-5" />,
        details: ['AutoFill & Flash Fill', 'Cell Formatting', 'Basic Data Types', 'Data validation', 'Custom formats'],
        longDescription: "Data entry shouldn't be manual drudgery. Excel offers powerful tools to automate pattern recognition and formatting. Flash Fill, in particular, uses AI to guess your intent based on examples you provide. AutoFill recognizes patterns in series (dates, numbers, custom lists) and extends them instantly. Understanding data types (Text, Number, Date, Boolean) prevents formatting headaches later. Excel's custom number formats can display data in virtually any format without changing the underlying value. Professional data entry combines speed with accuracy through strategic use of these automation tools.",
        scenario: "You have a list of full names 'John Doe' and need separate columns for First and Last Name.",
        exampleStr: "Type 'John' in adjacent column, press Ctrl + E (Flash Fill).",
        proTip: "Never manually type a sequence (1, 2, 3...). Type 1 and 2, highlight both, and drag the fill handle.",
        keyboardShortcuts: [
          { key: "Ctrl + E", description: "Flash Fill (auto-detect pattern)", mac: "Cmd + E" },
          { key: "Ctrl + D", description: "Fill Down", mac: "Cmd + D" },
          { key: "Ctrl + R", description: "Fill Right", mac: "Cmd + R" },
          { key: "Ctrl + ;", description: "Insert current date", mac: "Cmd + ;" },
          { key: "Ctrl + Shift + :", description: "Insert current time", mac: "Cmd + Shift + :" },
          { key: "Ctrl + Enter", description: "Fill selected range with same value", mac: "Cmd + Enter" },
          { key: "F2", description: "Edit active cell", mac: "F2" },
          { key: "Alt + Enter", description: "New line within cell", mac: "Option + Enter" }
        ],
        scenarios: [
          { context: "Sales: Extract product codes from compound SKU strings like 'ABC-12345-XL'", solution: "Type first extracted code manually, then Ctrl+E to Flash Fill the rest", formula: "Ctrl+E after example" },
          { context: "HR: Create employee IDs from Last Name + Hire Year (e.g., 'SMITH2024')", solution: "Type first example 'SMITH2024', press Ctrl+E to auto-generate remaining IDs", formula: "=UPPER(A2)&YEAR(B2)" },
          { context: "Finance: Enter the same date across 100 cells efficiently", solution: "Type date in first cell, select range A1:A100, press Ctrl+Enter to fill all at once", formula: "Ctrl+Enter fills range" }
        ],
        commonPitfalls: [
          "Not using Flash Fill (Ctrl+E)—it's a game-changer for extracting/combining text patterns",
          "Manually typing repetitive data instead of using AutoFill or Ctrl+D/Ctrl+R",
          "Forgetting that dates are just numbers formatted differently—don't type them as text!",
          "Not knowing about Ctrl+Enter to fill entire selections with the same value",
          "Ignoring custom number formats—you can display '1000' as '1K' without changing the actual value"
        ],
        advancedTechniques: [
          "Create custom lists (File > Options > Advanced > Edit Custom Lists) for AutoFill sequences like department names",
          "Use custom number formats like [Blue]0.00;[Red]-0.00 to color-code positive/negative values automatically",
          "Combine text with formulas: =A2&' - '&TEXT(B2,'mm/dd/yyyy') to create formatted strings"
        ],
        bestPractices: [
          "Always validate data types—use Data > Data Validation to restrict input to numbers, dates, or lists",
          "Use Flash Fill for one-off transformations, but formulas for recurring calculations",
          "Never store calculated values as static data—use formulas to maintain data integrity",
          "Format cells BEFORE entering data to avoid type conversion issues",
          "Use Text to Columns (Alt+A+E) to split data imported from other systems"
        ]
      },
      {
        title: 'Basic Formulas',
        description: 'Core calculation functions.',
        icon: <Calculator className="w-5 h-5" />,
        details: ['SUM, AVERAGE, COUNT', 'MIN, MAX functions', 'Relative vs Absolute References ($)', 'Error types', 'Formula auditing'],
        longDescription: "Formulas are the heart of Excel. Every formula must start with an equals sign (=). Understanding the difference between A1 (Relative) and $A$1 (Absolute) is the most critical concept for beginners. Relative references adjust when copied to new cells, while absolute references stay locked. Mixed references like $A1 (locked column) or A$1 (locked row) offer flexibility. Excel's statistical functions (SUM, AVERAGE, COUNT, MIN, MAX) form the foundation of data analysis. Recognizing error types (#DIV/0!, #N/A, #VALUE!, #REF!) helps you debug formulas quickly. Professional users structure formulas for readability and audit trails.",
        scenario: "Calculating total sales for a column of monthly revenue.",
        exampleStr: "=SUM(B2:B12) or Alt + =",
        proTip: "Press F4 while typing a cell reference to toggle between Relative and Absolute locking ($).",
        keyboardShortcuts: [
          { key: "Alt + =", description: "AutoSum (insert SUM formula)", mac: "Cmd + Shift + T" },
          { key: "F4", description: "Toggle absolute/relative reference ($)", mac: "F4" },
          { key: "Ctrl + `", description: "Show formulas (toggle)", mac: "Ctrl + `" },
          { key: "F9", description: "Calculate all worksheets", mac: "F9" },
          { key: "Shift + F9", description: "Calculate active worksheet", mac: "Shift + F9" },
          { key: "Ctrl + [", description: "Select direct precedents", mac: "Ctrl + [" },
          { key: "Ctrl + ]", description: "Select direct dependents", mac: "Ctrl + ]" },
          { key: "Alt + M + P", description: "Trace precedents", mac: "Alt + M + P" }
        ],
        scenarios: [
          { context: "Finance: Calculate quarterly average from monthly sales", solution: "Use =AVERAGE(B2:B4) for Q1, =AVERAGE(B5:B7) for Q2, etc.", formula: "=AVERAGE(B2:B4)" },
          { context: "Sales: Sum revenue but lock the total cell when copying formula", solution: "Use absolute reference: =SUM($B$2:$B$100) so the range doesn't change", formula: "=SUM($B$2:$B$100)" },
          { context: "Analysis: Find the highest and lowest values in a dataset", solution: "Use =MAX(A:A) for highest, =MIN(A:A) for lowest across entire column", formula: "=MAX(A:A), =MIN(A:A)" }
        ],
        commonPitfalls: [
          "Forgetting the equals sign (=) at the start—Excel treats it as text, not a formula",
          "Not understanding $ symbols—formulas break when copied without proper absolute references",
          "Using SUM with individual cells (=A1+A2+A3) instead of ranges (=SUM(A1:A3))",
          "Ignoring error messages—#DIV/0! means you're dividing by zero, #N/A means value not found",
          "Not using AutoSum (Alt+=) for quick totals—it's the fastest way to sum adjacent cells"
        ],
        advancedTechniques: [
          "Use Ctrl+` to toggle formula view—see all formulas at once for auditing",
          "Press F9 inside a formula to calculate just that part—great for debugging complex formulas",
          "Use the Evaluate Formula tool (Formulas tab) to step through nested calculations one at a time"
        ],
        bestPractices: [
          "Always use SUM/AVERAGE instead of manual addition—formulas update automatically",
          "Lock references with $ when creating templates that users will copy",
          "Use entire column references (A:A) for dynamic ranges that grow over time",
          "Name your ranges (Ctrl+F3) for formulas like =SUM(MonthlySales) instead of =SUM(B2:B50)",
          "Add comments to complex formulas (Shift+F2) to explain your logic for future reference"
        ]
      },
      {
        title: 'Data Organization',
        description: 'Sorting and restructuring data.',
        icon: <Filter className="w-5 h-5" />,
        details: ['Basic Sorting (A-Z)', 'Simple Filtering', 'Hiding/Unhiding Rows', 'Grouping/Outlining', 'Custom sorting'],
        longDescription: "Raw data is often messy. Filters allow you to slice and dice data to find specific records, while sorting helps rank items by magnitude or alphabet. Excel's AutoFilter feature enables multi-criteria filtering with dropdowns on each column header. Sorting can be single-level (just one column) or multi-level (sort by Region, then by Sales Rep, then by Date). Grouping and outlining create collapsible row/column sections for hierarchical data presentation. Professional data organization makes analysis faster and reports more digestible. The difference between a data dump and an insights-ready dataset is proper organization.",
        scenario: "You need to see only the sales transactions that happened in 'Q4' and were above $1000.",
        exampleStr: "Ctrl + Shift + L (Toggle Filters)",
        proTip: "Avoid hiding rows manually. Use Grouping (Shift + Alt + Right Arrow) to create collapsible sections instead.",
        keyboardShortcuts: [
          { key: "Ctrl + Shift + L", description: "Toggle AutoFilter on/off", mac: "Cmd + Shift + F" },
          { key: "Alt + Down Arrow", description: "Open filter dropdown (when in header)", mac: "Alt + Down" },
          { key: "Alt + A + S + S", description: "Open Sort dialog", mac: "Alt + A + S + S" },
          { key: "Shift + Alt + Right", description: "Group rows/columns", mac: "Shift + Alt + Right" },
          { key: "Shift + Alt + Left", description: "Ungroup rows/columns", mac: "Shift + Alt + Left" },
          { key: "Ctrl + 9", description: "Hide selected rows", mac: "Cmd + 9" },
          { key: "Ctrl + Shift + 9", description: "Unhide rows", mac: "Cmd + Shift + 9" },
          { key: "Alt + H + S + U", description: "Sort A to Z", mac: "Alt + H + S + U" }
        ],
        scenarios: [
          { context: "Sales: Show only Q4 transactions above $1000", solution: "Enable filters (Ctrl+Shift+L), click Date column dropdown > filter by Oct-Dec, then Amount column > Number Filters > Greater Than > 1000", formula: "Multi-criteria filtering" },
          { context: "HR: Sort employee list by Department, then by Hire Date within each department", solution: "Select data > Data > Sort > Add Level > Sort by Department, then by Hire Date", formula: "Multi-level sort" },
          { context: "Finance: Create collapsible expense categories (Travel, Office, Payroll)", solution: "Select category subtotal rows, press Shift+Alt+Right to group, click [-] to collapse", formula: "Shift+Alt+Right" }
        ],
        commonPitfalls: [
          "Sorting only one column—always select the entire data range to keep rows intact",
          "Forgetting to remove filters before analyzing—'23 of 150 records found' means data is filtered!",
          "Hiding rows manually instead of filtering—hidden rows are easy to forget about",
          "Not converting data to Tables (Ctrl+T)—Tables make filtering and sorting much easier",
          "Sorting dates stored as text—they'll sort alphabetically, not chronologically"
        ],
        advancedTechniques: [
          "Use custom sort orders (e.g., sort by 'Low, Medium, High' instead of alphabetically)",
          "Filter by color/icon after applying conditional formatting to visually segment data",
          "Use the 'Sort Left to Right' option to sort columns instead of rows"
        ],
        bestPractices: [
          "Always convert raw data to Tables (Ctrl+T) for automatic filter buttons and structured references",
          "Use Clear Filters frequently to ensure you're seeing the full dataset",
          "Group related sections (monthly data, expense categories) for cleaner presentation",
          "Document your filter criteria when sharing reports—others need to know what's hidden",
          "Sort data before charting—charts look better when data is pre-sorted by magnitude"
        ]
      },
      {
        title: 'Basic Charts',
        description: 'Visualizing simple datasets.',
        icon: <BarChart3 className="w-5 h-5" />,
        details: ['Bar & Column Charts', 'Pie Charts', 'Chart Elements', 'Chart formatting', 'Data labels'],
        longDescription: "A picture is worth a thousand numbers. Effective charting isn't just about making it look pretty, it's about choosing the right visualization for the story you want to tell. Column charts compare values across categories, line charts show trends over time, pie charts display parts of a whole, and bar charts work well for ranking. Chart elements (titles, axes, legends, gridlines, data labels) can clarify or clutter your message. Professional charts follow the 'data-ink ratio' principle—maximize information, minimize decoration. The right chart makes insights obvious at a glance.",
        scenario: "Comparing revenue across 5 different regions.",
        exampleStr: "Select Data > Insert > Clustered Column Chart",
        proTip: "Remove 'Chart Junk'—delete gridlines, unnecessary legends, and borders to make your data stand out.",
        keyboardShortcuts: [
          { key: "Alt + F1", description: "Create default chart on new sheet", mac: "Alt + F1" },
          { key: "F11", description: "Create chart on new chart sheet", mac: "F11" },
          { key: "Ctrl + 1", description: "Format selected chart element", mac: "Cmd + 1" },
          { key: "Alt + J + C", description: "Open Chart Design tab", mac: "Alt + J + C" },
          { key: "Ctrl + Arrow Keys", description: "Select next chart element", mac: "Cmd + Arrow Keys" },
          { key: "Delete", description: "Remove selected chart element", mac: "Delete" }
        ],
        scenarios: [
          { context: "Sales: Compare revenue across 5 regions (East, West, North, South, Central)", solution: "Select region names and revenue > Insert > Clustered Column Chart > Add data labels for exact values", formula: "Insert > Column Chart" },
          { context: "Finance: Show expense breakdown by category as percentages", solution: "Select categories and amounts > Insert > Pie Chart > Add data labels > Show Percentages", formula: "Insert > Pie Chart" },
          { context: "Analysis: Track monthly sales trend over a year", solution: "Select months and sales > Insert > Line Chart > Add trendline to show direction", formula: "Insert > Line Chart" }
        ],
        commonPitfalls: [
          "Using pie charts for more than 5-6 categories—they become unreadable",
          "Not labeling axes—viewers shouldn't have to guess what the numbers mean",
          "Using 3D charts—they distort data perception and look dated",
          "Forgetting to sort data before charting—unsorted charts are harder to interpret",
          "Over-decorating with colors, shadows, and effects—keep it clean and professional"
        ],
        advancedTechniques: [
          "Use combination charts (column + line) to show two different scales on one chart",
          "Add trendlines (right-click data series > Add Trendline) to show linear, exponential, or polynomial trends",
          "Create dynamic chart titles using cell references: =ChartTitle&' '&A1 to pull live data into titles"
        ],
        bestPractices: [
          "Choose column charts for comparisons, line charts for trends, pie charts for composition",
          "Always add descriptive titles and axis labels—context is critical",
          "Remove gridlines, borders, and backgrounds unless they add clarity",
          "Use consistent colors across related charts for brand recognition",
          "Test your chart on someone unfamiliar with the data—if they can't understand it in 5 seconds, simplify"
        ]
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
        details: ['IF statements', 'AND / OR logic', 'IFERROR handling', 'IFS function', 'SWITCH function'],
        longDescription: "Logic functions allow your spreadsheet to make decisions. The IF statement is the most fundamental: 'If this is true, do X, otherwise do Y'. Nested IFs handle multiple conditions but can get messy—use IFS or SWITCH for cleaner multi-condition logic. AND/OR functions let you test multiple criteria simultaneously. IFERROR handles errors gracefully by replacing error displayswith meaningful values. These functions transform static data into dynamic, intelligent spreadsheets that adapt to changing inputs.",
        scenario: "Assigning 'Bonus' if sales > $10,000, otherwise 'No Bonus'.",
        exampleStr: "=IF(B2>10000, \"Bonus\", \"No Bonus\")",
        proTip: "Wrap complex formulas in =IFERROR(formula, 0) to replace ugly #DIV/0! errors with clean zeros or dashes.",
        keyboardShortcuts: [
          { key: "Ctrl + Shift + A", description: "Insert function arguments after typing function name", mac: "Cmd + Shift + A" },
          { key: "F3", description: "Paste function", mac: "F3" },
          { key: "Shift + F3", description: "Insert Function dialog", mac: "Shift + F3" }
        ],
        scenarios: [
          { context: "Sales: Assign performance tier based on revenue (Elite > $100K, Pro > $50K, Standard)", solution: "Use nested IFs or IFS: =IFS(B2>100000,'Elite',B2>50000,'Pro',TRUE,'Standard')", formula: "=IFS(B2>100000,'Elite',B2>50000,'Pro',TRUE,'Standard')" },
          { context: "HR: Flag employees who meet both tenure (>5 years) AND performance (>90%) criteria", solution: "Use AND: =IF(AND(B2>5,C2>0.9),'Eligible','Not Eligible')", formula: "=IF(AND(B2>5,C2>0.9),'Eligible','Not Eligible')" },
          { context: "Finance: Handle division errors gracefully", solution: "Use IFERROR: =IFERROR(A2/B2,'N/A') to show 'N/A' instead of #DIV/0!", formula: "=IFERROR(A2/B2,'N/A')" }
        ],
        commonPitfalls: [
          "Nesting too many IFs (more than 3-4)—use IFS or SWITCH instead for readability",
          "Forgetting quotes around text values in IF results—Excel will treat them as named ranges",
          "Confusing AND/OR logic—AND requires ALL conditions true, OR requires ANY condition true",
          "Not using IFERROR to handle errors—users see ugly #DIV/0! or #N/A messages",
          "Hardcoding thresholds instead of referencing cells—makes updates harder"
        ],
        advancedTechniques: [
          "Use SWITCH instead of nested IFs for exact match scenarios: =SWITCH(A2,'Red',1,'Blue',2,'Green',3)",
          "Combine IF with AND/OR for complex multi-criteria logic",
          "Use IFNA to specifically handle #N/A errors from lookups: =IFNA(VLOOKUP(...),'Not Found')"
        ],
        bestPractices: [
          "Limit nested IFs to 3 levels deep—beyond that, use IFS, SWITCH, or lookup tables",
          "Always wrap lookup formulas in IFERROR or IFNA to handle missing data",
          "Reference threshold values from named cells instead of hardcoding in formulas",
          "Use TRUE as the final condition in IFS to create a 'catch-all' default",
          "Add line breaks  (Alt+Enter) in long formulas for readability"
        ]
      },
      {
        title: 'Lookup Functions',
        description: 'Connecting data across sheets.',
        icon: <Search className="w-5 h-5" />,
        details: ['VLOOKUP basics', 'HLOOKUP', 'Modern XLOOKUP', 'INDEX/MATCH', 'Approximate vs Exact match'],
        longDescription: "Lookups act like a phonebook: they find a unique ID in one list and return related information from another. XLOOKUP is the modern, superior replacement for VLOOKUP—it can look left, search from bottom, and return multiple columns. INDEX/MATCH combination offers maximum flexibility: INDEX returns a value from a position, MATCH finds that position. VLOOKUP only looks to the right and requires sorted data for approximate matches. Understanding the difference between exact (FALSE/0) and approximate (TRUE/1) matches prevents lookup errors. These functions are the backbone of relational data analysis in Excel.",
        scenario: "You have specific Product IDs and need to fetch their Prices from a master Price List sheet.",
        exampleStr: "=XLOOKUP(lookup_value, lookup_array, return_array)",
        proTip: "XLOOKUP defaults to an exact match (unlike VLOOKUP), so you don't need to specify 'FALSE' or '0' at the end.",
        keyboardShortcuts: [
          { key: "F3", description: "Paste defined name in formula", mac: "F3" },
          { key: "Ctrl + F3", description: "Define Name dialog", mac: "Cmd + F3" },
          { key: "Ctrl + Shift + Enter", description: "Array formula (legacy, for older Excel)", mac: "Cmd + Shift + Enter" }
        ],
        scenarios: [
          { context: "Sales: Match Product ID to fetch Price from a separate price list", solution: "Use XLOOKUP: =XLOOKUP(A2,PriceList!A:A,PriceList!B:B,'Not Found')", formula: "=XLOOKUP(A2,PriceList!A:A,PriceList!B:B)" },
          { context: "HR: Two-way lookup—find salary based on Employee Name AND Department", solution: "Use INDEX/MATCH: =INDEX(SalaryRange,MATCH(1,(Name=NameRange)*(Dept=DeptRange),0))", formula: "=INDEX(A:A,MATCH(1,(B:B=E1)*(C:C=F1),0))" },
          { context: "Finance: Legacy VLOOKUP for compatibility with older Excel versions", solution: "=VLOOKUP(A2,Table,3,FALSE) to return 3rd column, exact match", formula: "=VLOOKUP(A2,A:C,3,FALSE)" }
        ],
        commonPitfalls: [
          "Using VLOOKUP when the lookup column is to the right of return column—use XLOOKUP or INDEX/MATCH instead",
          "Forgetting FALSE/0 for exact match in VLOOKUP—defaults to approximate, causing wrong results",
          "Not handling #N/A errors when lookup value doesn't exist—wrap in IFERROR or IFNA",
          "Hardcoding column numbers in VLOOKUP—use MATCH to make formulas dynamic",
          "Not using absolute references ($) for lookup tables—breaks when copying formulas"
        ],
        advancedTechniques: [
          "Use XLOOKUP's if_not_found argument to customize error messages: =XLOOKUP(A2,B:B,C:C,'Product not found')",
          "Combine INDEX/MATCH for two-way lookups or lookups to the left",
          "Use XLOOKUP's search mode to enable wildcard or approximate matching"
        ],
        bestPractices: [
          "Use XLOOKUP when available (Excel 2021+)—it's more powerful and easier than VLOOKUP",
          "Always use absolute references ($) for lookup tables to prevent broken formulas",
          "Wrap lookups in IFERROR: =IFERROR(XLOOKUP(...),'Not Found') for clean error handling",
          "Use named ranges for lookup tables to make formulas readable: =XLOOKUP(A2,ProductIDs,Prices)",
          "For older Excel, master INDEX/MATCH as a superior alternative to VLOOKUP"
        ]
      },
      {
        title: 'Pivot Tables',
        description: 'Summarizing large datasets.',
        icon: <Table className="w-5 h-5" />,
        details: ['Creating Summaries', 'Slicers for filtering', 'Timelines', 'Calculated fields', 'Grouping dates'],
        longDescription: "Pivot Tables are the most powerful summary tool in Excel. They can aggregate 100,000 rows of transactional data into a clean summary report in seconds, with no formulas required. Drag fields to Rows, Columns, Values, and Filters areas to reshape data instantly. You can group dates by month/quarter/year, create calculated fields for custom metrics, and use Slicers for interactive filtering. Pivot Tables automatically update when source data changes (with manual refresh). They're essential for business intelligence, financial reporting, and any scenario requiring data aggregation. Mastering Pivot Tables transforms you from a data entry person to a data analyst.",
        scenario: "Summarizing total sales by Region and then breaking it down by Sales Rep.",
        exampleStr: "Insert > Pivot Table > Drag 'Region' to Rows, 'Sales' to Values",
        proTip: "Use 'Slicers' instead of standard filters to make your Pivot Tables interactive and dashboard-ready.",
        keyboardShortcuts: [
          { key: "Alt + N + V", description: "Insert Pivot Table", mac: "Alt + N + V" },
          { key: "Alt + J + T", description: "Open PivotTable Tools", mac: "Alt + J + T" },
          { key: "Alt + Down Arrow", description: "Open field dropdown in Pivot Table", mac: "Alt + Down" },
          { key: "Ctrl + -", description: "Delete selected field from Pivot", mac: "Cmd + -" },
          { key: "Alt + F5", description: "Refresh Pivot Table", mac: "Alt + F5" },
          { key: "Ctrl + A", description: "Select entire Pivot Table", mac: "Cmd + A" }
        ],
        scenarios: [
          { context: "Sales: Summarize total revenue by Region, then by Sales Rep within each region", solution: "Insert Pivot Table > Drag Region to Rows, Sales Rep below Region, Revenue to Values > Right-click value > Summarize by Sum", formula: "Insert > Pivot Table" },
          { context: "Finance: Group transaction dates by month and quarter to see trends", solution: "Right-click any date in Pivot Table > Group > Select Months and Quarters", formula: "Right-click date > Group" },
          { context: "HR: Calculate percentage of total headcount by department", solution: "Drag Department to Rows, Employee Count to Values > Right-click value > Show Values As > % of Grand Total", formula: "Show Values As > % of Grand Total" }
        ],
        commonPitfalls: [
          "Not refreshing Pivot Tables after source data changes—always right-click > Refresh or Alt+F5",
          "Forgetting to format Value fields—right-click > Value Field Settings > Number Format",
          "Not using Recommended Pivot Tables—Excel often suggests perfect layouts automatically",
          "Ignoring Slicers—they make Pivot Tables 10x more user-friendly for non-technical users",
          "Not converting source data to a Table first—Pivot Tables on Tables auto-expand as data grows"
        ],
        advancedTechniques: [
          "Create calculated fields: PivotTable Tools > Fields, Items & Sets > Calculated Field to add custom metrics",
          "Use GETPIVOTDATA function to reference Pivot Table values in formulas outside the Pivot",
          "Connect multiple Pivot Tables to the same Slicer for synchronized filtering across dashboards"
        ],
        bestPractices: [
          "Always convert source data to a Table (Ctrl+T) before creating Pivot Tables—auto-expands with new data",
          "Use Slicers (Alt+N+SF) for all filter fields to make Pivot Tables intuitive for end users",
          "Add Timelines for date fields to enable easy time-period filtering (This Month, Last Quarter, etc.)",
          "Right-click values > Value Field Settings to customize aggregation (Sum, Average, Count, etc.) and formatting",
          "Group dates by Month/Quarter/Year for time-based analysis—right-click date > Group"
        ]
      },
      {
        title: 'Conditional Formatting',
        description: 'Visual rules for data.',
        icon: <CheckCircle2 className="w-5 h-5" />,
        details: ['Highlight Rules (> X)', 'Data Bars', 'Color Scales', 'Icon Sets', 'Custom formula rules'],
        longDescription: "Conditional Formatting automatically colors cells based on their values. It grabs attention and highlights trends, outliers, or warnings instantly. Rules can be simple (highlight cells > 100) or complex (custom formulas testing multiple conditions). Data Bars create mini bar charts inside cells, Color Scales apply gradient coloring, and Icon Sets show traffic lights or arrows. You can apply multiple rules with priority ordering. Conditional formatting updates automatically as data changes, making dashboards dynamic. It's the difference between rows of numbers and actionable visual insights.",
        scenario: "Highlighting any student grade below 70 in red.",
        exampleStr: "Home > Conditional Formatting > Highlight Cells Rules > Less Than... 70",
        proTip: "Use 'Data Bars' to create mini-bar charts directly inside your cells to visualize magnitude.",
        keyboardShortcuts: [
          { key: "Alt + H + L", description: "Open Conditional Formatting menu", mac: "Alt + H + L" },
          { key: "Alt + H + L + C", description: "Clear rules from selected cells", mac: "Alt + H + L + C" },
          { key: "Alt + H + L + R", description: "Manage rules", mac: "Alt + H + L + R" }
        ],
        scenarios: [
          { context: "Sales: Highlight top 10% of sales performers in green", solution: "Select sales data > Conditional Formatting > Top/Bottom Rules > Top 10% > Green Fill", formula: "Top 10% Rule" },
          { context: "Finance: Show expenses visually with data bars (larger expenses = longer bars)", solution: "Select expense column > Conditional Formatting > Data Bars > choose color", formula: "Data Bars" },
          { context: "Project Management: Flag tasks where Status='Delayed' AND Priority='High'", solution: "Select range > Conditional Formatting > New Rule > Use formula: =AND($B2='Delayed',$C2='High')", formula: "=AND($B2=\"Delayed\",$C2=\"High\")" }
        ],
        commonPitfalls: [
          "Applying too many conflicting rules—use Manage Rules to see priority order and consolidate",
          "Not using absolute references ($) in custom formulas—rules break when applied to ranges",
          "Over-using colors—too much highlighting becomes visual noise, not clarity",
          "Forgetting that rules update automatically—test with different data to ensure rules work correctly",
          "Not using 'Stop If True' in Manage Rules—later rules can override earlier ones"
        ],
        advancedTechniques: [
          "Use custom formulas for complex conditions: =AND($B2>1000,$C2='Completed') to highlight based on multiple criteria",
          "Apply formula-based rules to entire rows: =$C2='Urgent' with range $A$2:$F$100 highlights entire row",
          "Use INDIRECT or OFFSET in formulas to create dynamic, shifting conditional formats"
        ],
        bestPractices: [
          "Keep it simple—use conditional formatting to highlight exceptions, not recolor everything",
          "Choose intuitive colors: Red=bad/warning, Green=good/complete, Yellow=caution/in progress",
          "Use Icon Sets (traffic lights, arrows) for quick visual status indicators",
          "Manage Rules regularly to delete unused or contradictory formatting rules",
          "Test your rules with edge cases—empty cells, zeros, text vs numbers—to avoid surprises"
        ]
      },
      {
        title: 'Data Validation',
        description: 'Controlling user input.',
        icon: <CheckCircle2 className="w-5 h-5" />,
        details: ['Dropdown Lists', 'Input Messages', 'Error Alerts', 'Custom validation formulas', 'Dependent dropdowns'],
        longDescription: "Garbage in, garbage out. Data Validation prevents users from entering invalid data by restricting input to specific types or lists. Dropdown lists ensure consistency (no typos like 'Recieved' vs 'Received'). Input Messages guide users before they type, Error Alerts stop invalid entries. You can validate by data type (whole number, date, text length), by list, or by custom formula. Dependent dropdowns (where List B options change based on List A selection) use INDIRECT function. Data Validation is crucial for shared workbooks, forms, and data quality control.",
        scenario: "Ensuring users selects a Department from a specific list rather than typing it manually.",
        exampleStr: "Data > Data Validation > Allow: List > Source: =A1:A5",
        proTip: "You can create dependent dropdowns (where list B depends on selection A) using the INDIRECT function.",
        keyboardShortcuts: [
          { key: "Alt + A + V + V", description: "Open Data Validation dialog", mac: "Alt + A + V + V" },
          { key: "Alt + Down Arrow", description: "Open dropdown list (when in validated cell)", mac: "Alt + Down" },
          { key: "Alt + A + V + C", description: "Circle invalid data", mac: "Alt + A + V + C" }
        ],
        scenarios: [
          { context: "HR: Restrict employee Department entry to predefined list (Sales, Engineering, HR, Finance)", solution: "Select cells > Data > Data Validation > Allow: List > Source: Sales,Engineering,HR,Finance", formula: "Data > Data Validation > List" },
          { context: "Finance: Ensure users enter dates only between Jan 1, 2024 and Dec 31, 2024", solution: "Data > Data Validation > Allow: Date > Between > 1/1/2024 and 12/31/2024", formula: "Date validation: Between dates" },
          { context: "Inventory: Create dependent dropdown where Product list changes based on selected Category", solution: "Data > Data Validation > Allow: List > Source: =INDIRECT($A2) where A2 contains 'Electronics', 'Clothing', etc., and named ranges match", formula: "=INDIRECT($A2)" }
        ],
        commonPitfalls: [
          "Not showing Input Messages—users don't know what's expected without guidance",
          "Using cell ranges instead of named ranges for dropdown sources—formulas break when you add/remove items",
          "Not testing validation rules—users get frustrated when rules are too restrictive or unclear",
          "Forgetting to use Circle Invalid Data to find existing bad data before applying validation",
          "Allowing copy/paste to bypass validation—it does! Users can paste anything, even with validation enabled"
        ],
        advancedTechniques: [
          "Use custom formulas for complex validation: =AND(A2>0,A2<100) to ensure values are between 0 and 100",
          "Create dependent dropdowns with INDIRECT: =INDIRECT($B$1) where B1 contains a named range name",
          "Combine Data Validation with Conditional Formatting to highlight valid/invalid entries visually"
        ],
        bestPractices: [
          "Always use named ranges for dropdown sources—easier to update and maintain",
          "Add Input Messages to explain what's expected: 'Enter department: Sales, Engineering, HR, or Finance'",
          "Use Error Alerts to provide helpful guidance, not just 'Invalid entry'",
          "Use 'Circle Invalid Data' (Data > Data Validation > Circle Invalid Data) to audit existing data before locking down",
          "Remember: validation doesn't prevent copy/paste—educate users or protect sheets if needed"
        ]
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
        details: ['FILTER & SORT', 'UNIQUE lists', 'SEQUENCE generation', 'Spill ranges', 'Array formulas'],
        longDescription: "Dynamic Arrays (introduced in Excel 2020) changed Excel forever. One formula can now spill results into multiple neighboring cells automatically. FILTER extracts rows matching criteria, SORT arranges data, UNIQUE removes duplicates, SEQUENCE generates number series. The # symbol references entire spill ranges. These functions eliminate the need for complex array formulas with Ctrl+Shift+Enter. Dynamic arrays make Excel feel like a programming language—you can chain functions to create powerful data transformations in a single formula.",
        scenario: "Extracting a list of unique customer names from a column of 1000 duplicates.",
        exampleStr: "=UNIQUE(A2:A1000)",
        proTip: "Combine functions! =SORT(UNIQUE(range)) gives you a sorted, clean list in one go.",
        keyboardShortcuts: [
          { key: "Ctrl + Shift + Enter", description: "Legacy array formula (not needed for new functions)", mac: "Cmd + Shift + Enter" },
          { key: "F9", description: "Evaluate array formula", mac: "F9" },
          { key: "Esc", description: "Clear spill error", mac: "Esc" }
        ],
        scenarios: [
          { context: "Sales: Extract all transactions for a specific sales rep", solution: "Use FILTER: =FILTER(A2:E100,B2:B100='Smith') to show only rows where column B = 'Smith'", formula: "=FILTER(A2:E100,B2:B100=\"Smith\")" },
          { context: "Finance: Generate a calendar of dates for the entire year 2024", solution: "Use SEQUENCE: =SEQUENCE(365,1,DATE(2024,1,1),1) creates 365 dates starting 1/1/2024", formula: "=SEQUENCE(365,1,DATE(2024,1,1),1)" },
          { context: "Analysis: Sort and deduplicate a list in one formula", solution: "Combine SORT and UNIQUE: =SORT(UNIQUE(A2:A1000)) for alphabetical unique list", formula: "=SORT(UNIQUE(A2:A1000))" }
        ],
        commonPitfalls: [
          "#SPILL! errors when target cells aren't empty—clear the spill range",
          "Not understanding the # symbol—=A2# references the entire spilled array from A2",
          "Forgetting these are Excel 2021/365 only—won't work in older versions",
          "Not leveraging function combinations—FILTER+SORT+UNIQUE in one formula is powerful",
          "Trying to edit individual cells in a spilled array—you must edit the source formula"
        ],
        advancedTechniques: [
          "Chain multiple conditions in FILTER: =FILTER(range,(column1='X')*(column2>100)) for AND logic",
          "Use the # symbol to reference spilled ranges: =SUM(A2#) sums entire dynamic array from A2",
          "Create dynamic dropdown lists with =UNIQUE(A:A) as the Data Validation source"
        ],
        bestPractices: [
          "Use FILTER instead of manual filtering—results update automatically as data changes",
          "Combine SORT, UNIQUE, and FILTER for powerful one-formula data transformations",
          "Reference spilled ranges with # to make formulas dynamic as arrays grow/shrink",
          "Use SEQUENCE to generate number series, date ranges, or test data",
          "Check Excel version before using—these functions don't work in Excel 2019 or earlier"
        ]
      },
      {
        title: 'Power Query',
        description: 'ETL (Extract, Transform, Load).',
        icon: <Zap className="w-5 h-5" />,
        details: ['Importing external data', 'Cleaning/Transforming', 'Automated Refresh', 'M language basics', 'Combining queries'],
        longDescription: "Power Query is a data transformation engine. It records your cleanup steps (removing rows, splitting columns, unpivoting) so you can replay them on new data with one click. Unlike formulas, Power Query creates a repeatable ETL pipeline. Import from CSVs, Excel files, databases, web pages—Power Query handles it. The interface shows each step visually, but power users can edit the underlying M language. Query results refresh on-demand or on file open. This is how professionals automate weekly reports that pull fresh data from multiple sources.",
        scenario: "Combining 12 monthly CSV files into one master dataset automatically.",
        exampleStr: "Data > Get Data > From Folder",
        proTip: "Power Query is non-destructive. It doesn't change your original file, it just reads and transforms it for the output.",
        keyboardShortcuts: [
          { key: "Alt + A + P + P", description: "Edit query in Power Query Editor", mac: "Alt + A + P + P" },
          { key: "Alt + A + R + A", description: "Refresh all queries", mac: "Alt + A + R + A" },
          { key: "Ctrl + Alt + F5", description: "Refresh query", mac: "Cmd + Alt + F5" }
        ],
        scenarios: [
          { context: "Finance: Combine 12 monthly sales CSV files from a folder", solution: "Data > Get Data > From Folder > select folder > Combine Files > Power Query auto-appends all CSVs", formula: "Data > From Folder > Combine" },
          { context: "HR: Clean messy employee data (remove duplicates, trim spaces, split full names)", solution: "Load data > Remove Duplicates > Transform > Trim > Split Column by Delimiter", formula: "Power Query transformations" },
          { context: "Analysis: Unpivot monthly columns (Jan, Feb, Mar...) into rows for Pivot Table analysis", solution: "Select data columns > Transform > Unpivot Columns to convert wide to long format", formula: "Transform > Unpivot" }
        ],
        commonPitfalls: [
          "Not loading queries to the data model—use 'Close & Load To' to control the output",
          "Forgetting to refresh queries after source data changes—Ctrl+Alt+F5 or right-click > Refresh",
          "Hardcoding file paths—use parameters for flexible, portable queries",
          "Not using Reference vs Duplicate wisely—Reference shares steps, Duplicate is independent",
          "Ignoring data types—Power Query auto-detects them, but verify to avoid errors"
        ],
        advancedTechniques: [
          "Write custom M code for complex transformations beyond the UI's capabilities",
          "Use parameters to create dynamic queries (e.g., file path, date range as variables)",
          "Merge queries to join datasets like SQL (left join, inner join, etc.)"
        ],
        bestPractices: [
          "Always use Power Query for recurring data imports—save hours vs. manual copy/paste",
          "Keep queries modular—break complex transforms into referenceable sub-queries",
          "Use 'From Folder' to auto-append files with the same structure (monthly reports, etc.)",
          "Enable 'Load to Data Model' for large datasets to avoid Excel's row limits",
          "Document your steps—rename query steps to describe what each transformation does"
        ]
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
        details: ['Recording Macros', 'VBA Basics', 'Automating repetitive tasks', 'Event-driven macros', 'Custom functions'],
        longDescription: "Macros allow you to record a series of actions and replay them. For deeper control, VBA (Visual Basic for Applications) lets you write code to manipulate Excel programmatically. Record simple macros for repetitive formatting tasks. Write VBA for complex logic, loops, and conditional automation. Event-driven macros (Workbook_Open, Worksheet_Change) run automatically on triggers. You can create custom worksheet functions (UDFs) that work like built-in Excel functions. Automation is the difference between spending 3 hours on a weekly report and 3 minutes.",
        scenario: "Formatting a report the exact same way every morning.",
        exampleStr: "Developer Tab > Record Macro",
        proTip: "Save your workbook as .xlsm (Macro-Enabled) or your code will be lost!",
        keyboardShortcuts: [
          { key: "Alt + F8", description: "Run macro dialog", mac: "Alt + F8" },
          { key: "Alt + F11", description: "Open VBA Editor", mac: "Alt + F11" },
          { key: "F5", description: "Run macro (in VBA Editor)", mac: "F5" },
          { key: "F8", description: "Step through code line-by-line (debug)", mac: "F8" }
        ],
        scenarios: [
          { context: "Finance: Automate monthly report formatting (fonts, borders, number formats)", solution: "Developer > Record Macro > perform formatting > Stop Recording > assign to button", formula: "Record Macro" },
          { context: "Sales: Create custom function to calculate commission based on complex multi-tier logic", solution: "VBA: Function Commission(sales) ... End Function, use in sheet as =Commission(A2)", formula: "VBA User-Defined Function" },
          { context: "HR: Auto-save backup copy whenever workbook is saved", solution: "VBA: Private Sub Workbook_BeforeSave... ThisWorkbook.SaveCopyAs 'Backup_'&Date&'.xlsm'", formula: "Event-driven VBA" }
        ],
        commonPitfalls: [
          "Not saving as .xlsm format—macros will be removed when you save as .xlsx",
          "Recording absolute cell references when you need relative—use 'Use Relative References' button",
          "Not adding error handling in VBA—unhandled errors crash macros",
          "Hardcoding file paths in VBA—use ThisWorkbook.Path for portable code",
          "Not enabling Developer tab—File > Options > Customize Ribbon > check Developer"
        ],
        advancedTechniques: [
          "Use Application.ScreenUpdating = False in VBA to speed up macro execution",
          "Create event-driven macros (Workbook_Open, Worksheet_Change) for automatic triggers",
          "Build custom Ribbon tabs and buttons to run your macros professionally"
        ],
        bestPractices: [
          "Always save macro workbooks as .xlsm to preserve code",
          "Use 'Use Relative References' when recording macros for flexible reusability",
          "Add error handling in all VBA: On Error Resume Next or On Error GoTo ErrorHandler",
          "Comment your VBA code liberally—you'll forget what it does in 3 months",
          "Digitally sign macros for distribution to avoid security warnings"
        ]
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
            <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">
              Dashboard
            </Link>
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
    </div >
  );
}

function CheckIconForLevel({ level }: { level: Level }) {
  if (level === 'Beginner') return <LayoutGrid className="w-8 h-8" />;
  if (level === 'Intermediate') return <BrainCircuit className="w-8 h-8" />;
  return <Zap className="w-8 h-8" />;
}
