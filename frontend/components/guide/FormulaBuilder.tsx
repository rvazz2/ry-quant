"use client";

import React, { useState } from 'react';
import { Wand2, Copy, CheckCircle2 } from 'lucide-react';

interface FormulaTemplate {
    name: string;
    category: string;
    description: string;
    template: string;
    fields: { name: string; placeholder: string; description: string }[];
}

const templates: FormulaTemplate[] = [
    {
        name: 'VLOOKUP',
        category: 'Lookup',
        description: 'Look up a value in a table and return a corresponding value',
        template: '=VLOOKUP({lookup}, {table}, {column}, {exact})',
        fields: [
            { name: 'lookup', placeholder: 'A2', description: 'Value to search for' },
            { name: 'table', placeholder: 'A:C', description: 'Table range to search in' },
            { name: 'column', placeholder: '3', description: 'Column number to return' },
            { name: 'exact', placeholder: 'FALSE', description: 'FALSE=exact, TRUE=approximate' }
        ]
    },
    {
        name: 'IF',
        category: 'Logic',
        description: 'Perform a logical test and return different values',
        template: '=IF({condition}, {if_true}, {if_false})',
        fields: [
            { name: 'condition', placeholder: 'B2>1000', description: 'Logical test' },
            { name: 'if_true', placeholder: '"High"', description: 'Value if TRUE' },
            { name: 'if_false', placeholder: '"Low"', description: 'Value if FALSE' }
        ]
    },
    {
        name: 'SUMIF',
        category: 'Math',
        description: 'Sum cells that meet a specific criteria',
        template: '=SUMIF({range}, {criteria}, {sum_range})',
        fields: [
            { name: 'range', placeholder: 'A:A', description: 'Range to evaluate' },
            { name: 'criteria', placeholder: '">100"', description: 'Criteria to match' },
            { name: 'sum_range', placeholder: 'B:B', description: 'Range to sum (optional)' }
        ]
    },
    {
        name: 'INDEX/MATCH',
        category: 'Lookup',
        description: 'Powerful two-way lookup combination',
        template: '=INDEX({return_range}, MATCH({lookup}, {lookup_range}, 0))',
        fields: [
            { name: 'return_range', placeholder: 'C:C', description: 'Column to return value from' },
            { name: 'lookup', placeholder: 'A2', description: 'Value to find' },
            { name: 'lookup_range', placeholder: 'A:A', description: 'Column to search in' }
        ]
    },
    {
        name: 'IFS',
        category: 'Logic',
        description: 'Test multiple conditions (cleaner than nested IFs)',
        template: '=IFS({condition1}, {value1}, {condition2}, {value2}, TRUE, {default})',
        fields: [
            { name: 'condition1', placeholder: 'B2>100', description: 'First condition' },
            { name: 'value1', placeholder: '"Elite"', description: 'Value if condition1 TRUE' },
            { name: 'condition2', placeholder: 'B2>50', description: 'Second condition' },
            { name: 'value2', placeholder: '"Pro"', description: 'Value if condition2 TRUE' },
            { name: 'default', placeholder: '"Standard"', description: 'Default value' }
        ]
    },
    {
        name: 'COUNTIFS',
        category: 'Math',
        description: 'Count cells that meet multiple criteria',
        template: '=COUNTIFS({range1}, {criteria1}, {range2}, {criteria2})',
        fields: [
            { name: 'range1', placeholder: 'A:A', description: 'First range' },
            { name: 'criteria1', placeholder: '"East"', description: 'First criteria' },
            { name: 'range2', placeholder: 'B:B', description: 'Second range' },
            { name: 'criteria2', placeholder: '">1000"', description: 'Second criteria' }
        ]
    }
];

const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

export default function FormulaBuilder() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedTemplate, setSelectedTemplate] = useState<FormulaTemplate | null>(null);
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
    const [builtFormula, setBuiltFormula] = useState('');
    const [copied, setCopied] = useState(false);

    const filteredTemplates = selectedCategory === 'All'
        ? templates
        : templates.filter(t => t.category === selectedCategory);

    const selectTemplate = (template: FormulaTemplate) => {
        setSelectedTemplate(template);
        setFieldValues({});
        setBuiltFormula('');
        setCopied(false);
    };

    const updateField = (fieldName: string, value: string) => {
        const newValues = { ...fieldValues, [fieldName]: value };
        setFieldValues(newValues);

        // Build formula
        if (selectedTemplate) {
            let formula = selectedTemplate.template;
            selectedTemplate.fields.forEach(field => {
                const val = newValues[field.name] || `{${field.name}}`;
                formula = formula.replace(`{${field.name}}`, val);
            });
            setBuiltFormula(formula);
        }
    };

    const copyFormula = () => {
        if (builtFormula) {
            navigator.clipboard.writeText(builtFormula);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="glass-panel p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-500/20 p-2 rounded-lg border border-purple-500/30">
                    <Wand2 className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Formula Builder</h2>
                    <p className="text-sm text-slate-400">Build complex formulas step-by-step</p>
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 mb-6">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === cat
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                                : 'bg-slate-900/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {!selectedTemplate ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTemplates.map((template, idx) => (
                        <button
                            key={idx}
                            onClick={() => selectTemplate(template)}
                            className="group p-4 bg-slate-900/50 border border-slate-700 hover:border-purple-500/50 rounded-lg transition-all text-left hover:bg-slate-900"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">{template.name}</h3>
                                <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-400">
                                    {template.category}
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 mb-3">{template.description}</p>
                            <code className="text-xs font-mono text-slate-500 block bg-slate-950 p-2 rounded">
                                {template.template}
                            </code>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Template Header */}
                    <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/30">
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="text-xl font-bold text-white">{selectedTemplate.name}</h3>
                            <button
                                onClick={() => setSelectedTemplate(null)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <p className="text-slate-300 mb-3">{selectedTemplate.description}</p>
                        <code className="text-sm font-mono text-purple-300 block bg-slate-950/50 p-3 rounded">
                            {selectedTemplate.template}
                        </code>
                    </div>

                    {/* Field Inputs */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-white">Fill in the parameters:</h4>
                        {selectedTemplate.fields.map((field, idx) => (
                            <div key={idx}>
                                <label className="block text-sm text-slate-400 mb-2">
                                    {field.name}
                                    <span className="text-xs text-slate-500 ml-2">({field.description})</span>
                                </label>
                                <input
                                    type="text"
                                    value={fieldValues[field.name] || ''}
                                    onChange={(e) => updateField(field.name, e.target.value)}
                                    placeholder={field.placeholder}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Built Formula Display */}
                    <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-emerald-400">Your Formula:</h4>
                            <button
                                onClick={copyFormula}
                                disabled={!builtFormula || builtFormula.includes('{')}
                                className="flex items-center gap-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded text-sm transition-all"
                            >
                                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <code className="block bg-slate-950 p-3 rounded font-mono text-white text-sm break-all">
                            {builtFormula || selectedTemplate.template}
                        </code>
                        {builtFormula.includes('{') && (
                            <p className="text-xs text-amber-400 mt-2">
                                ⚠️ Fill in all fields above to complete the formula
                            </p>
                        )}
                    </div>

                    {/* Tips */}
                    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                        <h4 className="font-bold text-white mb-2">💡 Tips:</h4>
                        <ul className="text-sm text-slate-400 space-y-1">
                            <li>• Use absolute references ($) when you want to lock cells</li>
                            <li>• Text values need quotes: "value"</li>
                            <li>• Cell ranges use colon: A1:A10</li>
                            <li>• For criteria, operators need quotes: "&gt;100" or "=East"</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
