// Company name components
const adjectives = [
    'Jingle', 'Jangle', 'Jungle', 'Sparkle', 'Glitter', 'Shimmer',
    'Breeze', 'Crystal', 'Diamond', 'Emerald', 'Golden', 'Silver'
];

// Financial statement templates with dependencies marked as null
const statementTemplates = {
    incomeStatement: {
        revenue: { min: 50000, max: 200000 },
        costOfGoodsSold: { min: 20000, max: 100000 },
        grossProfit: null, // Calculated as revenue - costOfGoodsSold
        operatingExpenses: { min: 10000, max: 50000 },
        netIncome: null // Calculated as grossProfit - operatingExpenses
    },
    equityStatement: {
        beginningCapital: { min: 10000, max: 50000 },
        additionalInvestment: { min: 0, max: 20000 },
        netIncome: null, // Linked to Income Statement netIncome
        withdrawals: { min: 1000, max: 20000 },
        endingCapital: null // Calculated as beginningCapital + additionalInvestment + netIncome - withdrawals
    },
    balanceSheet: {
        assets: {
            cash: { min: 5000, max: 30000 },
            accountsReceivable: { min: 5000, max: 40000 },
            inventory: { min: 10000, max: 50000 },
            equipment: { min: 20000, max: 100000 }
        },
        liabilities: {
            accountsPayable: { min: 5000, max: 30000 },
            notesPayable: { min: 10000, max: 50000 }
        },
        equity: {
             // Linked to Equity Statement endingCapital
        }
    }
};

let problemData = null; // To store the generated problem data and solutions

// Generate random number within range
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate random company names
function generateCompanyNames() {
    const shuffled = [...adjectives].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).map(adj => `${adj} Co.`);
}

// Generate random year
function generateYear() {
    return getRandomNumber(2020, 2023);
}

// Generate financial statements for a company ensuring mathematical consistency
function generateCompanyStatements() {
    const statements = {
        income: {},
        equity: {},
        balance: {
            assets: {},
            liabilities: {},
            equity: {}
        }
    };

    // Generate income statement values
    statements.income.revenue = Math.round(getRandomNumber(
        statementTemplates.incomeStatement.revenue.min,
        statementTemplates.incomeStatement.revenue.max
    ) / 1000) * 1000;
    statements.income.operatingExpenses = Math.round(getRandomNumber(
        statementTemplates.incomeStatement.operatingExpenses.min,
        statementTemplates.incomeStatement.operatingExpenses.max
    ) / 1000) * 1000;
    statements.income.netIncome = statements.income.revenue - statements.income.operatingExpenses;

    // Generate equity statement values
    statements.equity.beginningCapital = Math.round(getRandomNumber(
        statementTemplates.equityStatement.beginningCapital.min,
        statementTemplates.equityStatement.beginningCapital.max
    ) / 1000) * 1000;
    statements.equity.netIncome = statements.income.netIncome; // Link to Income Statement
    statements.equity.withdrawals = Math.round(getRandomNumber(
        statementTemplates.equityStatement.withdrawals.min,
        statementTemplates.equityStatement.withdrawals.max
    ) / 1000) * 1000;
    statements.equity.endingCapital = 
        statements.equity.beginningCapital + 
        statements.equity.netIncome - 
        statements.equity.withdrawals;

    // Generate balance sheet values
    // First, generate total assets
    statements.balance.assets.totalAssets = Math.round(getRandomNumber(
        statementTemplates.balanceSheet.assets.cash.min * 4, // Using a reasonable range
        statementTemplates.balanceSheet.assets.cash.max * 4
    ) / 1000) * 1000;

    // Generate total liabilities
    statements.balance.liabilities.totalLiabilities = Math.round(getRandomNumber(
        statementTemplates.balanceSheet.liabilities.accountsPayable.min * 2,
        statementTemplates.balanceSheet.liabilities.accountsPayable.max * 2
    ) / 1000) * 1000;

    // Calculate total owner's equity using the equation: Total Owner's Equity = Total Assets - Total Liabilities
    statements.balance.equity.totalEquity = statements.balance.assets.totalAssets - statements.balance.liabilities.totalLiabilities;

    // Ensure the balance sheet balances
    if (statements.balance.equity.totalEquity !== statements.equity.endingCapital) {
        // Adjust total assets to make it balance
        const difference = statements.equity.endingCapital - statements.balance.equity.totalEquity;
        statements.balance.assets.totalAssets += difference;
        statements.balance.equity.totalEquity = statements.balance.assets.totalAssets - statements.balance.liabilities.totalLiabilities;
    }

    return statements;
}

// Generate a complete problem with missing values and store solutions
function generateProblem() {
    const companies = generateCompanyNames();
    const year = generateYear();
    const companyStatements = companies.map(() => generateCompanyStatements());

    // Define all possible missing items with their corresponding dependencies/equations (labels will be assigned later)
    const allPossibleMissingDefinitions = [
        // Company 1 Income Statement
        { companyIndex: 0, statement: 'income', field: 'revenue', equation: 'Revenues = Net Income + Operating Expenses', dependencies: ['netIncome', 'operatingExpenses'] },
        { companyIndex: 0, statement: 'income', field: 'operatingExpenses', equation: 'Operating Expenses = Revenues - Net Income', dependencies: ['revenue', 'netIncome'] },
        { companyIndex: 0, statement: 'income', field: 'netIncome', equation: 'Net Income = Revenues - Operating Expenses', dependencies: ['revenue', 'operatingExpenses'] },
        // Company 1 Equity Statement
        { companyIndex: 0, statement: 'equity', field: 'beginningCapital', equation: 'Capital, Jan 1 = Capital, Dec 31 - Net Income + Drawing', dependencies: ['endingCapital', 'netIncome', 'withdrawals'] },
        { companyIndex: 0, statement: 'equity', field: 'withdrawals', equation: 'Drawing = Capital, Jan 1 + Net Income - Capital, Dec 31', dependencies: ['beginningCapital', 'netIncome', 'endingCapital'] },
        { companyIndex: 0, statement: 'equity', field: 'endingCapital', equation: 'Capital, Dec 31 = Capital, Jan 1 + Net Income - Drawing', dependencies: ['beginningCapital', 'netIncome', 'withdrawals'] },
        // Company 1 Balance Sheet
        { companyIndex: 0, statement: 'balance', field: 'assets', subfield: 'totalAssets', equation: 'Total Assets = Total Liabilities + Total Owner\'s Equity', dependencies: ['totalLiabilities', 'totalEquity'] },
        { companyIndex: 0, statement: 'balance', field: 'liabilities', subfield: 'totalLiabilities', equation: 'Total Liabilities = Total Assets - Total Owner\'s Equity', dependencies: ['totalAssets', 'totalEquity'] },
        { companyIndex: 0, statement: 'balance', field: 'equity', subfield: 'totalEquity', equation: 'Total Owner\'s Equity = Total Assets - Total Liabilities', dependencies: ['totalAssets', 'totalLiabilities'] },

        // Company 2 Income Statement
        { companyIndex: 1, statement: 'income', field: 'revenue', equation: 'Revenues = Net Income + Operating Expenses', dependencies: ['netIncome', 'operatingExpenses'] },
        { companyIndex: 1, statement: 'income', field: 'operatingExpenses', equation: 'Operating Expenses = Revenues - Net Income', dependencies: ['revenue', 'netIncome'] },
        { companyIndex: 1, statement: 'income', field: 'netIncome', equation: 'Net Income = Revenues - Operating Expenses', dependencies: ['revenue', 'operatingExpenses'] },
        // Company 2 Equity Statement
        { companyIndex: 1, statement: 'equity', field: 'beginningCapital', equation: 'Capital, Jan 1 = Capital, Dec 31 - Net Income + Drawing', dependencies: ['endingCapital', 'netIncome', 'endingCapital'] },
        { companyIndex: 1, statement: 'equity', field: 'withdrawals', equation: 'Drawing = Capital, Jan 1 + Net Income - Capital, Dec 31', dependencies: ['beginningCapital', 'netIncome', 'endingCapital'] },
        { companyIndex: 1, statement: 'equity', field: 'endingCapital', equation: 'Capital, Dec 31 = Capital, Jan 1 + Net Income - Drawing', dependencies: ['beginningCapital', 'netIncome', 'withdrawals'] },
        // Company 2 Balance Sheet
        { companyIndex: 1, statement: 'balance', field: 'assets', subfield: 'totalAssets', equation: 'Total Assets = Total Liabilities + Total Owner\'s Equity', dependencies: ['totalLiabilities', 'totalEquity'] },
        { companyIndex: 1, statement: 'balance', field: 'liabilities', subfield: 'totalLiabilities', equation: 'Total Liabilities = Total Assets - Total Owner\'s Equity', dependencies: ['totalAssets', 'totalEquity'] },
        { companyIndex: 1, statement: 'balance', field: 'equity', subfield: 'totalEquity', equation: 'Total Owner\'s Equity = Total Assets - Total Liabilities', dependencies: ['totalAssets', 'totalLiabilities'] },

        // Company 3 Income Statement
        { companyIndex: 2, statement: 'income', field: 'revenue', equation: 'Revenues = Net Income + Operating Expenses', dependencies: ['netIncome', 'operatingExpenses'] },
        { companyIndex: 2, statement: 'income', field: 'operatingExpenses', equation: 'Operating Expenses = Revenues - Net Income', dependencies: ['revenue', 'netIncome'] },
        { companyIndex: 2, statement: 'income', field: 'netIncome', equation: 'Net Income = Revenues - Operating Expenses', dependencies: ['revenue', 'operatingExpenses'] },
        // Company 3 Equity Statement
        { companyIndex: 2, statement: 'equity', field: 'beginningCapital', equation: 'Capital, Jan 1 = Capital, Dec 31 - Net Income + Drawing', dependencies: ['endingCapital', 'netIncome', 'withdrawals'] },
        { companyIndex: 2, statement: 'equity', field: 'withdrawals', equation: 'Drawing = Capital, Jan 1 + Net Income - Capital, Dec 31', dependencies: ['beginningCapital', 'netIncome', 'endingCapital'] },
        { companyIndex: 2, statement: 'equity', field: 'endingCapital', equation: 'Capital, Dec 31 = Capital, Jan 1 + Net Income - Drawing', dependencies: ['beginningCapital', 'netIncome', 'withdrawals'] },
        // Company 3 Balance Sheet
        { companyIndex: 2, statement: 'balance', field: 'assets', subfield: 'totalAssets', equation: 'Total Assets = Total Liabilities + Total Owner\'s Equity', dependencies: ['totalLiabilities', 'totalEquity'] },
        { companyIndex: 2, statement: 'balance', field: 'liabilities', subfield: 'totalLiabilities', equation: 'Total Liabilities = Total Assets - Total Owner\'s Equity', dependencies: ['totalAssets', 'totalEquity'] },
        { companyIndex: 2, statement: 'balance', field: 'equity', subfield: 'totalEquity', equation: 'Total Owner\'s Equity = Total Assets - Total Liabilities', dependencies: ['totalAssets', 'totalLiabilities'] }
    ];

    // Define the order of fields as they appear in the HTML for consistent labeling
    const displayOrder = {
        income: ['revenue', 'operatingExpenses', 'netIncome'],
        equity: ['beginningCapital', 'netIncome', 'withdrawals', 'endingCapital'],
        balance: { // Balance sheet has subfields
            assets: ['totalAssets'],
            liabilities: ['totalLiabilities'],
            equity: ['totalEquity']
        }
    };

    // Include the cross-statement dependency: Equity Ending Capital === Balance Sheet Total Equity
    const crossStatementDependency = {
        statement: 'equity', field: 'endingCapital',
        dependentStatement: 'balance', dependentField: 'equity', dependentSubfield: 'totalEquity'
    };

    let potentialMissing = [...allPossibleMissingDefinitions];
    let itemsToHide = [];
    let availableValues = JSON.parse(JSON.stringify(companyStatements));
    let remainingItems = [...potentialMissing];

    // Helper to get a value from either the original or potentially missing data
    function getValue(statementData, item) {
        if (item.subfield) {
            return statementData[item.statement]?.[item.field]?.[item.subfield];
        } else {
            return statementData[item.statement]?.[item.field];
        }
    }

     // Helper to check if a value is available (not null in the current state)
    function isValueAvailable(companyIndex, statement, field, subfield = null) {
        if (subfield) {
            return availableValues[companyIndex]?.[statement]?.[field]?.[subfield] !== null;
        } else {
            return availableValues[companyIndex]?.[statement]?.[field] !== null;
        }
    }

    // Helper to check if an item is solvable based on currently available values
    function isSolvable(item) {
        // Direct dependencies within the same statement/equation
        const directDependenciesAvailable = item.dependencies.every(depField => {
             // Find the definition for the dependency. Check current statement, then others if applicable.
             const depDefinition = allPossibleMissingDefinitions.find(def => 
                def.companyIndex === item.companyIndex &&
                def.statement === item.statement && 
                (def.field === depField || (def.subfield && def.subfield === depField))
            );
            
            if (depDefinition) {
                 // Dependency is within the same statement
                 if (depDefinition.subfield) {
                     return isValueAvailable(item.companyIndex, item.statement, depDefinition.field, depDefinition.subfield);
                 } else {
                     return isValueAvailable(item.companyIndex, item.statement, depDefinition.field);
                 }
            } else { 
                // Handle cross-statement dependencies (netIncome from income to equity, equity ending capital to balance sheet equity)
                 if (depField === 'netIncome' && item.statement === 'equity') {
                     return isValueAvailable(item.companyIndex, 'income', 'netIncome');
                 }
                  if ((depField === 'endingCapital' && item.statement === 'balance') || (depField === 'totalEquity' && item.statement === 'equity')) {
                       return isValueAvailable(item.companyIndex, 'equity', 'endingCapital') || isValueAvailable(item.companyIndex, 'balance', 'equity', 'totalEquity');
                  }
                // If the dependency isn't explicitly listed in allPossibleMissingDefinitions (like specific assets/liabilities)
                // We assume if the total is needed, its components aren't enough to find the total if it's missing
                return true; // Assume primitive dependencies are available if not explicitly missing
            }
        });

        return directDependenciesAvailable; // For now, rely on direct and known cross-statement dependencies
    }

    // Try to select 9 solvable items to hide
    let attempts = 0;
    const maxAttempts = 1000; // Prevent infinite loops
    const numItemsToHide = 9;

    while (itemsToHide.length < numItemsToHide && attempts < maxAttempts) {
        attempts++;
        // Shuffle remaining items for randomness
        remainingItems.sort(() => 0.5 - Math.random());

        for (const item of remainingItems) {
            // Temporarily mark the item as missing in the available values
            const originalValue = getValue(availableValues[item.companyIndex], item);
            if (item.subfield) {
                if (availableValues[item.companyIndex][item.statement] && availableValues[item.companyIndex][item.statement][item.field]) {
                    availableValues[item.companyIndex][item.statement][item.field][item.subfield] = null;
                }
            } else {
                if (availableValues[item.companyIndex][item.statement]) {
                    availableValues[item.companyIndex][item.statement][item.field] = null;
                }
            }

            // Check if all currently selected items (including the potential one) are still solvable
            const allHiddenAreSolvable = itemsToHide.every(hiddenItem => isSolvable(hiddenItem)) && isSolvable(item);

            if (allHiddenAreSolvable) {
                // If adding this item keeps the set solvable, add it to itemsToHide
                itemsToHide.push(item);
                // Remove it from remaining items
                remainingItems = remainingItems.filter(p => p !== item);
                break;
            } else {
                // If adding this item makes the set unsolvable, revert the temporary change
                if (item.subfield) {
                    if (availableValues[item.companyIndex][item.statement] && availableValues[item.companyIndex][item.statement][item.field]) {
                        availableValues[item.companyIndex][item.statement][item.field][item.subfield] = originalValue;
                    }
                } else {
                    if (availableValues[item.companyIndex][item.statement]) {
                        availableValues[item.companyIndex][item.statement][item.field] = originalValue;
                    }
                }
            }
        }

        // If we couldn't find any more solvable items, reset and try again
        if (itemsToHide.length < numItemsToHide && remainingItems.length === 0) {
            // Reset everything and try again
            availableValues = JSON.parse(JSON.stringify(companyStatements));
            remainingItems = [...potentialMissing];
            itemsToHide = [];
        }
    }

    // If we still don't have 9 items, use what we have
    if (itemsToHide.length < numItemsToHide) {
        console.warn(`Could only find ${itemsToHide.length} solvable items to hide after ${maxAttempts} attempts.`);
    }

    // Sort the selected itemsToHide based on display order for consistent labeling
    itemsToHide.sort((itemA, itemB) => {
        // Sort by company index
        if (itemA.companyIndex !== itemB.companyIndex) {
            return itemA.companyIndex - itemB.companyIndex;
        }

        // Sort by statement type (income, equity, balance)
        const statementOrder = ['income', 'equity', 'balance'];
        if (itemA.statement !== itemB.statement) {
            return statementOrder.indexOf(itemA.statement) - statementOrder.indexOf(itemB.statement);
        }

        // Sort by field order within the statement
        const fieldOrderA = itemA.subfield ? displayOrder[itemA.statement][itemA.field].indexOf(itemA.subfield) : displayOrder[itemA.statement].indexOf(itemA.field);
        const fieldOrderB = itemB.subfield ? displayOrder[itemB.statement][itemB.field].indexOf(itemB.subfield) : displayOrder[itemB.statement].indexOf(itemB.field);
        return fieldOrderA - fieldOrderB;
    });

    // Assign letters based on which box the item appears in
    const solutions = {};
    const missingItemsLabels = [];
    const boxLetters = {
        income: 'abcdefgh',    // First box: a-h
        equity: 'ijklmnop',    // Middle box: i-p
        balance: 'qrstuvwx'    // Last box: q-x
    };

    // Create a map to track used letters
    const usedLetters = new Set();

    itemsToHide.forEach((item, index) => {
        // Get the appropriate letter set based on the statement type
        const availableLetters = boxLetters[item.statement];
        
        // Find the first unused letter from the box-specific range
        let label = null;
        for (let i = 0; i < availableLetters.length; i++) {
            if (!usedLetters.has(availableLetters[i])) {
                label = availableLetters[i];
                break;
            }
        }
        
        // If no letter is available in the box-specific range, use the next available letter from any range
        if (!label) {
            const allLetters = 'abcdefghijklmnopqrstuvwx';
            for (let i = 0; i < allLetters.length; i++) {
                if (!usedLetters.has(allLetters[i])) {
                    label = allLetters[i];
                    break;
                }
            }
        }
        
        // Mark the letter as used
        usedLetters.add(label);
        item.label = label;
        missingItemsLabels.push(label);

        // Populate solutions with the original value using the new label
        if (item.subfield) {
            solutions[label] = companyStatements[item.companyIndex][item.statement][item.field][item.subfield];
        } else {
            solutions[label] = companyStatements[item.companyIndex][item.statement][item.field];
        }
    });

    problemData = {
        year,
        companies,
        statements: availableValues,
        solutions,
        missingItemsLabels,
        originalStatements: companyStatements,
        hiddenItems: itemsToHide
    };

    return problemData;
}

// Format currency with $   (x) for missing values
function formatCurrency(amount, label = null) {
    if (amount === null) {
        return `$   <span class="missing-label">(${label})</span>`;
    }
    // Ensure the amount is a number before formatting
    if (typeof amount !== 'number' || isNaN(amount)) {
        console.error('Attempted to format a non-number value:', amount);
        return 'N/A';
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Generate HTML for the problem
function generateProblemHTML(problem) {
    const incomeStatementFields = ['revenue', 'operatingExpenses']; // Revenues, Expenses
    const equityStatementFields = ['beginningCapital', 'netIncome', 'withdrawals', 'endingCapital']; // Capital Jan 1, Net Income, Drawing, Capital Dec 31
    const balanceSheetFields = ['totalAssets', 'totalLiabilities', 'totalEquity']; // Total assets, Total liabilities, Total owner's equity

    const fieldLabels = {
        revenue: 'Revenues',
        costOfGoodsSold: 'Cost of Goods Sold',
        grossProfit: 'Gross Profit',
        operatingExpenses: 'Operating Expenses',
        netIncome: 'Net Income',
        beginningCapital: 'Capital, January 1',
        additionalInvestment: 'Additional Investment',
        withdrawals: 'Drawing',
        endingCapital: 'Capital, Dec. 31',
        cash: 'Cash',
        accountsReceivable: 'Accounts Receivable',
        inventory: 'Inventory',
        equipment: 'Equipment',
        totalAssets: 'Total assets',
        accountsPayable: 'Accounts Payable',
        notesPayable: 'Notes Payable',
        totalLiabilities: 'Total liabilities',
        capital: 'Total owner\'s equity',
        totalEquity: 'Total owner\'s equity'
    };

    let statementsHTML = `
        <div class="statement-box">
            <div class="statement-title">Income Statement</div>
            <div class="statement-date">For the Year Ended December 31, ${problem.year}</div>
            <table class="accounting-table">
                <tr>
                    <td></td>
                    ${problem.companies.map(company => `<td class="company-name">${company}</td>`).join('')}
                </tr>
                ${incomeStatementFields.map((field, index) => {
                    const isLastRow = index === incomeStatementFields.length - 1;
                    return `
                        <tr>
                            <td class="account-name ${isLastRow ? 'border-bottom' : ''}">${fieldLabels[field]}</td>
                            ${problem.statements.map((statement, companyIndex) => {
                                const value = statement.income[field];
                                const missingLabelEntry = Object.entries(problem.solutions).find(([label, solValue]) => 
                                    value === null && solValue === problem.originalStatements[companyIndex].income[field]
                                );
                                const missingLabel = missingLabelEntry ? missingLabelEntry[0] : null;
                                return `<td class="${value === null ? 'missing-value' : 'amount'} ${isLastRow ? 'border-bottom' : ''}">${formatCurrency(value, missingLabel)}</td>`;
                            }).join('')}
                        </tr>
                    `;
                }).join('')}
            </table>
        </div>

        <div class="statement-box">
            <div class="statement-title">Owner's Equity Statement</div>
            <div class="statement-date">For the Year Ended December 31, ${problem.year}</div>
            <table class="accounting-table">
                 <tr>
                    <td></td>
                    ${problem.companies.map(company => `<td class="company-name">${company}</td>`).join('')}
                </tr>
                ${equityStatementFields.map((field, index) => {
                     const isLastRow = index === equityStatementFields.length - 1;
                    return `
                        <tr>
                            <td class="account-name ${isLastRow ? 'double-border-bottom' : ''}">${fieldLabels[field]}</td>
                            ${problem.statements.map((statement, companyIndex) => {
                                const value = statement.equity[field];
                                const missingLabelEntry = Object.entries(problem.solutions).find(([label, solValue]) => 
                                    value === null && solValue === problem.originalStatements[companyIndex].equity[field]
                                );
                                const missingLabel = missingLabelEntry ? missingLabelEntry[0] : null;
                                return `<td class="${value === null ? 'missing-value' : 'amount'} ${isLastRow ? 'double-border-bottom' : ''}">${formatCurrency(value, missingLabel)}</td>`;
                            }).join('')}
                        </tr>
                    `;
                }).join('')}
            </table>
        </div>

        <div class="statement-box">
            <div class="statement-title">Balance Sheet</div>
            <div class="statement-date">December 31, ${problem.year}</div>
            <table class="accounting-table">
                 <tr>
                    <td></td>
                    ${problem.companies.map(company => `<td class="company-name">${company}</td>`).join('')}
                </tr>
                 ${balanceSheetFields.map((field, index) => {
                     const isLastRow = index === balanceSheetFields.length - 1;
                    return `
                        <tr>
                            <td class="account-name ${isLastRow ? 'double-border-bottom' : ''}">${fieldLabels[field]}</td>
                             ${problem.statements.map((statement, companyIndex) => {
                                let value;
                                if (field === 'totalAssets') {
                                    value = statement.balance.assets.totalAssets;
                                } else if (field === 'totalLiabilities') {
                                    value = statement.balance.liabilities.totalLiabilities;
                                } else if (field === 'totalEquity') {
                                    value = statement.balance.equity.totalEquity;
                                }

                                const missingLabelEntry = Object.entries(problem.solutions).find(([label, solValue]) => 
                                    value === null && 
                                    ((field === 'totalAssets' && solValue === problem.originalStatements[companyIndex].balance.assets.totalAssets) ||
                                     (field === 'totalLiabilities' && solValue === problem.originalStatements[companyIndex].balance.liabilities.totalLiabilities) ||
                                     (field === 'totalEquity' && solValue === problem.originalStatements[companyIndex].balance.equity.totalEquity))
                                );
                                const missingLabel = missingLabelEntry ? missingLabelEntry[0] : null;

                                return `<td class="${value === null ? 'missing-value' : 'amount'} ${isLastRow ? 'double-border-bottom' : ''}">${formatCurrency(value, missingLabel)}</td>`;
                            }).join('')}
                        </tr>
                    `;
                }).join('')}
            </table>
        </div>
    `;

    let questionsHTML = '<h3>Questions</h3>';
    // Only show questions for items that are actually hidden and rendered with a label in the data tables
    const renderedLabels = new Set();

    // Function to process statements and collect rendered labels
    const processStatements = (statementType, fields) => {
        fields.forEach(field => {
            problem.statements.forEach((statement, companyIndex) => {
                let value;
                // Handle nested structure for balance sheet
                if (statementType === 'balance') {
                    if (field === 'totalAssets') value = statement.balance.assets.totalAssets;
                    else if (field === 'totalLiabilities') value = statement.balance.liabilities.totalLiabilities;
                    else if (field === 'totalEquity') value = statement.balance.equity.totalEquity;
                } else {
                    value = statement[statementType][field];
                }

                if (value === null) {
                     const missingLabelEntry = Object.entries(problem.solutions).find(([label, solValue]) => {
                        // Find the corresponding original value to match with the solution
                        let originalValue;
                         if (statementType === 'balance') {
                            if (field === 'totalAssets') originalValue = problem.originalStatements[companyIndex].balance.assets.totalAssets;
                            else if (field === 'totalLiabilities') originalValue = problem.originalStatements[companyIndex].balance.liabilities.totalLiabilities;
                            else if (field === 'totalEquity') originalValue = problem.originalStatements[companyIndex].balance.equity.totalEquity;
                        } else {
                            originalValue = problem.originalStatements[companyIndex][statementType][field];
                        }
                        return solValue === originalValue;
                     });

                     if (missingLabelEntry) {
                         renderedLabels.add(missingLabelEntry[0]);
                     }
                }
            });
        });
    };

    // Process each statement type
    processStatements('income', incomeStatementFields);
    processStatements('equity', equityStatementFields);
    processStatements('balance', balanceSheetFields);

    // Sort the rendered labels to maintain consistent order
    const sortedLabels = Array.from(renderedLabels).sort();
    sortedLabels.forEach((label, index) => {
        questionsHTML += `<div class="question-item"><span class="question-number">${index + 1}.</span> Item ${label} _____</div>`;
    });

    let solutionsHTML = '';
    sortedLabels.forEach((label, index) => {
        const solution = problem.solutions[label];
        if (solution !== undefined) {
            solutionsHTML += `<div class="question-item"><span class="question-number">${index + 1}.</span> Item ${label}: <span class="solution">${formatCurrency(solution)}</span></div>`;
        }
    });

    return { statementsHTML, questionsHTML, solutionsHTML };
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generateBtn');
    const solutionsToggle = document.getElementById('solutionsToggle');
    const problemContainer = document.getElementById('problemContainer');
    const questionsList = document.getElementById('questionsList');
    const solutionsDiv = document.getElementById('solutions');
    const solutionsContentDiv = document.getElementById('solutionsContent');

    console.log('DOM fully loaded and parsed');

    function displayProblem() {
        console.log('Attempting to generate and display problem...');
        const problem = generateProblem();
        console.log('Generated problem data:', problem);
        if (!problem || !problem.statements || !problem.originalStatements) {
             console.error('Problem data is not valid:', problem);
             problemContainer.innerHTML = '<p>Error generating problem. Please try again.</p>';
             questionsList.innerHTML = '';
             solutionsContentDiv.innerHTML = '';
             solutionsDiv.style.display = 'none';
             return;
        }

        const { statementsHTML, questionsHTML, solutionsHTML } = generateProblemHTML(problem);
        console.log('Generated HTML:', { statementsHTML, questionsHTML, solutionsHTML });
        problemContainer.innerHTML = statementsHTML;
        questionsList.innerHTML = questionsHTML;
        solutionsContentDiv.innerHTML = solutionsHTML;
        
        // Make sure the containers are visible
        questionsList.style.display = 'block';
        solutionsDiv.style.display = 'none'; // Initially hide solutions
        solutionsToggle.textContent = 'Show Solutions';
    }

    generateBtn.addEventListener('click', displayProblem);

    solutionsToggle.addEventListener('click', function() {
        const isHidden = solutionsDiv.style.display === 'none';
        solutionsDiv.style.display = isHidden ? 'block' : 'none';
        solutionsToggle.textContent = isHidden ? 'Hide Solutions' : 'Show Solutions';
    });

    displayProblem(); // Display initial problem
}); 