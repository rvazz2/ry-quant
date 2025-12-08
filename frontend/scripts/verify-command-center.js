#!/usr/bin/env node

/**
 * Command Center Verification Script
 * This script verifies that all Command Center components are properly implemented
 */

const fs = require('fs');
const path = require('path');

const checks = {
    passed: [],
    failed: []
};

function checkFileExists(filePath, description) {
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
        checks.passed.push(`✅ ${description}`);
        return true;
    } else {
        checks.failed.push(`❌ ${description} - File not found: ${filePath}`);
        return false;
    }
}

function checkFileContains(filePath, searchString, description) {
    const fullPath = path.join(__dirname, '..', filePath);
    try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes(searchString)) {
            checks.passed.push(`✅ ${description}`);
            return true;
        } else {
            checks.failed.push(`❌ ${description} - String not found in ${filePath}`);
            return false;
        }
    } catch (e) {
        checks.failed.push(`❌ ${description} - Error reading file: ${e.message}`);
        return false;
    }
}

console.log('🔍 Command Center Verification\n');
console.log('='.repeat(50));

// Check core files exist
console.log('\n📁 Checking Files...');
checkFileExists('contexts/SettingsContext.tsx', 'SettingsContext exists');
checkFileExists('components/ui/Tooltip.tsx', 'Tooltip component exists');
checkFileExists('components/settings/HelpSidebar.tsx', 'HelpSidebar component exists');
checkFileExists('app/settings/page.tsx', 'Settings page exists');

// Check SettingsContext has new properties
console.log('\n⚙️  Checking Settings Context...');
checkFileContains('contexts/SettingsContext.tsx', 'maxDailyLoss', 'maxDailyLoss setting');
checkFileContains('contexts/SettingsContext.tsx', 'stopLossDefault', 'stopLossDefault setting');
checkFileContains('contexts/SettingsContext.tsx', 'takeProfitDefault', 'takeProfitDefault setting');
checkFileContains('contexts/SettingsContext.tsx', 'maxSlippage', 'maxSlippage setting');
checkFileContains('contexts/SettingsContext.tsx', 'positionSizingMethod', 'positionSizingMethod setting');
checkFileContains('contexts/SettingsContext.tsx', 'numberFormat', 'numberFormat setting');
checkFileContains('contexts/SettingsContext.tsx', 'dateFormat', 'dateFormat setting');
checkFileContains('contexts/SettingsContext.tsx', 'marketDataSource', 'marketDataSource setting');
checkFileContains('contexts/SettingsContext.tsx', 'autoUpdate', 'autoUpdate setting');
checkFileContains('contexts/SettingsContext.tsx', 'betaFeatures', 'betaFeatures setting');
checkFileContains('contexts/SettingsContext.tsx', 'rowHeight', 'rowHeight setting');
checkFileContains('contexts/SettingsContext.tsx', 'fontSize', 'fontSize setting');

// Check Tooltip implementation
console.log('\n💬 Checking Tooltip Component...');
checkFileContains('components/ui/Tooltip.tsx', 'interface TooltipProps', 'Tooltip has TypeScript interface');
checkFileContains('components/ui/Tooltip.tsx', 'onMouseEnter', 'Tooltip has mouse events');
checkFileContains('components/ui/Tooltip.tsx', 'adjustPosition', 'Tooltip has position adjustment logic');

// Check HelpSidebar implementation
console.log('\n📖 Checking Help Sidebar...');
checkFileContains('components/settings/HelpSidebar.tsx', 'interface HelpSidebarProps', 'HelpSidebar has TypeScript interface');
checkFileContains('components/settings/HelpSidebar.tsx', 'getHelpContent', 'HelpSidebar has content function');
checkFileContains('components/settings/HelpSidebar.tsx', 'Risk & Execution', 'HelpSidebar has Risk & Execution content');

// Check Settings Page integration
console.log('\n🎨 Checking Settings Page...');
checkFileContains('app/settings/page.tsx', 'import Tooltip', 'Settings page imports Tooltip');
checkFileContains('app/settings/page.tsx', 'import HelpSidebar', 'Settings page imports HelpSidebar');
checkFileContains('app/settings/page.tsx', 'maxDailyLoss', 'Settings page uses maxDailyLoss');
checkFileContains('app/settings/page.tsx', 'helpSidebarOpen', 'Settings page has help sidebar state');
checkFileContains('app/settings/page.tsx', 'Daily Loss Circuit Breaker', 'Settings page has circuit breaker UI');

// Summary
console.log('\n' + '='.repeat(50));
console.log(`\n📊 Summary:`);
console.log(`   ✅ Passed: ${checks.passed.length}`);
console.log(`   ❌ Failed: ${checks.failed.length}`);

if (checks.failed.length > 0) {
    console.log('\n❌ Failed Checks:');
    checks.failed.forEach(f => console.log(`   ${f}`));
    process.exit(1);
} else {
    console.log('\n🎉 All checks passed! Command Center is ready to use.');
    console.log('\n📍 Navigate to http://localhost:3000/settings to see it in action.');
    process.exit(0);
}
