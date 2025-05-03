// Fixed typo in constant name (PREMADE_QUESTIONS instead of PREMADE_QUESTIONS)
const PREMADE_QUESTIONS = {
    district: [
        { text: "Decrease in Accounts Receivable", answer: "credit" },
        { text: "Decrease in Accounts Payable", answer: "debit" },
        { text: "Increase in Sales Discounts", answer: "debit" },
        { text: "Increase in Purchases", answer: "debit" },
        { text: "Increase in the capital account", answer: "credit" },
        { text: "Increase in Transportation In", answer: "debit" },
        { text: "Sales", answer: "credit" },
        { text: "Prepaid Insurance", answer: "debit" },
        { text: "Partner's Capital Account", answer: "credit" },
        { text: "Purchases", answer: "debit" },
        { text: "Accounts Payable", answer: "credit" },
        { text: "Sales Discounts", answer: "debit" },
        { text: "Supplies Expense", answer: "debit" }
    ],
    regional: [
        { text: "Bad Debts Expense", answer: "debit" },
        { text: "Purchases Discounts", answer: "credit" },
        { text: "Partner's Drawing Account", answer: "debit" },
        { text: "Property Taxes Payable", answer: "credit" },
        { text: "Accumulated Depreciation--Building", answer: "credit" },
        { text: "Loss on Plant Assets", answer: "debit" },
        { text: "Allowance for Uncollectible Accounts", answer: "credit" },
        { text: "Land", answer: "debit" },
        { text: "Sales Tax Payable", answer: "credit" },
        { text: "Merchandise Inventory", answer: "debit" },
        { text: "Gain on Plant Assets", answer: "credit" },
        { text: "Purchases Returns & Allowances", answer: "credit" },
        { text: "Petty Cash", answer: "debit" },
        { text: "Uncollectible Accounts Expense", answer: "debit" },
        { text: "Cash in Bank", answer: "debit" },
        { text: "Depreciation Expense", answer: "debit" },
        { text: "Property Tax Expense", answer: "debit" },
        { text: "Social Security Tax Payable", answer: "credit" }
    ],
    state: [
        { text: "Retained Earnings", answer: "credit" },
        { text: "Interest Receivable", answer: "debit" },
        { text: "Dividends—Common", answer: "debit" },
        { text: "Loss on Plant Assets", answer: "debit" },
        { text: "Unearned Fees", answer: "credit" },
        { text: "Discount on Notes Payable", answer: "debit" },
        { text: "Paid-in Capital in Excess of Par", answer: "credit" },
        { text: "Federal Income Tax Payable", answer: "credit" }
    ]
};

// Game state
let currentQuestion = '';
let correctAnswer = '';
let score = { correct: 0, total: 0 };
let currentLevel = 'district';
let apiStatus = 'checking';

// DOM elements
const questionEl = document.getElementById('question');
const feedbackEl = document.getElementById('feedback');
const scoreEl = document.getElementById('score');
const generateBtn = document.getElementById('generate-btn');
const answerBtns = document.querySelectorAll('.answer-btn');
const statusIndicator = document.getElementById('connection-status');
const levelBoxes = document.querySelectorAll('.box');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded'); // Debug log
    
    // Set up level selection
    levelBoxes.forEach(box => {
        box.addEventListener('click', () => {
            console.log('Level selected:', box.dataset.level); // Debug log
            levelBoxes.forEach(b => b.classList.remove('active'));
            box.classList.add('active');
            currentLevel = box.dataset.level;
            generateNewQuestion();
        });
    });

    // Activate default level - FIXED SELECTOR (was .level-box, should be .box)
    document.querySelector('.box[data-level="district"]').classList.add('active');
    
    // Check API status
    checkAPIStatus();
    
    // Set up event listeners with more robust error handling
    generateBtn.addEventListener('click', () => {
        console.log('Generate button clicked'); // Debug log
        generateNewQuestion();
    });
    
    answerBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            console.log('Answer button clicked:', e.target.dataset.answer); // Debug log
            if (!currentQuestion) {
                console.warn('No question generated yet');
                feedbackEl.textContent = 'Please generate a question first';
                feedbackEl.className = 'incorrect';
                return;
            }
            handleAnswer(e);
        });
    });
});

function updateStatusIndicator() {
    statusIndicator.className = `connection-status status-${apiStatus}`;
}

async function checkAPIStatus() {
    apiStatus = 'checking';
    updateStatusIndicator();
    
    try {
        const response = await fetch('http://localhost:3000/api/status');
        apiStatus = response.ok ? 'connected' : 'disconnected';
    } catch (error) {
        apiStatus = 'disconnected';
        console.error("API connection failed:", error);
    } finally {
        updateStatusIndicator();
    }
}

async function generateNewQuestion() {
    console.log('Generating new question for level:', currentLevel); // Debug log
    feedbackEl.textContent = '';
    feedbackEl.className = '';
    
    try {
        if (currentLevel === 'ai' && apiStatus === 'connected') {
            currentQuestion = await generateQuestionFromAPI();
            correctAnswer = determineCorrectAnswer(currentQuestion);
        } else {
            // Fallback to local questions if AI fails or not selected
            if (currentLevel === 'ai') currentLevel = 'district';
            
            const questions = PREMADE_QUESTIONS[currentLevel];
            const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
            currentQuestion = randomQuestion.text;
            correctAnswer = randomQuestion.answer;
        }
        
        questionEl.textContent = currentQuestion;
        console.log('Generated question:', currentQuestion, 'Answer:', correctAnswer); // Debug log
    } catch (error) {
        console.error('Error generating question:', error);
        questionEl.textContent = currentLevel === 'ai' 
            ? 'API unavailable. Please try local levels.' 
            : 'Ready for your question - click "Generate Question"';
        
        if (currentLevel === 'ai') {
            apiStatus = 'disconnected';
            updateStatusIndicator();
        }
    }
}

async function generateQuestionFromAPI() {
    const levels = ['district', 'regional', 'state'];
    const randomLevel = levels[Math.floor(Math.random() * levels.length)];
    
    const prompt = `Generate a UIL Accounting question at ${randomLevel} level about debits/credits.
        Return ONLY the question text with no additional commentary. Example formats:
        "Increase in Accounts Receivable"
        "Sales Discounts"
        "Decrease in Capital Account"`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    try {
        const response = await fetch('http://localhost:3000/api/question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 50,
                temperature: 0.7
            }),
            signal: controller.signal
        });
        
        clearTimeout(timeout);
        
        if (!response.ok) throw new Error(`API request failed: ${response.status}`);
        
        const data = await response.json();
        const question = data.choices[0]?.message?.content?.trim();
        
        if (!question) throw new Error("Empty response from API");
        
        return question;
    } catch (error) {
        clearTimeout(timeout);
        throw error;
    }
}

function determineCorrectAnswer(question) {
    // First check if it matches any premade questions exactly
    for (const level in PREMADE_QUESTIONS) {
        const match = PREMADE_QUESTIONS[level].find(q => q.text.toLowerCase() === question.toLowerCase());
        if (match) return match.answer;
    }
    
    // Then check for increase/decrease patterns
    const changeMatch = question.match(/(Increase|Decrease) in (.+)/i);
    if (changeMatch) {
        const [_, change, term] = changeMatch;
        const normalizedTerm = term.trim();
        
        // Find matching term in premade questions
        for (const level in PREMADE_QUESTIONS) {
            const termMatch = PREMADE_QUESTIONS[level].find(q => 
                q.text.toLowerCase().includes(normalizedTerm.toLowerCase()) ||
                normalizedTerm.toLowerCase().includes(q.text.toLowerCase())
            );
            
            if (termMatch) {
                const baseAnswer = termMatch.answer;
                // Reverse answer for decreases
                return (change.toLowerCase() === 'decrease') 
                    ? (baseAnswer === 'debit' ? 'credit' : 'debit')
                    : baseAnswer;
            }
        }
    }
    
    // Final fallback - check if term exists in any question
    for (const level in PREMADE_QUESTIONS) {
        const termMatch = PREMADE_QUESTIONS[level].find(q => 
            question.toLowerCase().includes(q.text.toLowerCase()) ||
            q.text.toLowerCase().includes(question.toLowerCase())
        );
        if (termMatch) return termMatch.answer;
    }
    
    // Ultimate fallback (should rarely happen)
    console.warn("Could not determine answer for:", question);
    return "debit";
}

function handleAnswer(e) {
    console.log('Handling answer...'); // Debug log
    if (!currentQuestion) {
        console.warn('No current question to answer!');
        return;
    }
    
    const userAnswer = e.target.dataset.answer;
    console.log('User answer:', userAnswer, 'Correct answer:', correctAnswer); // Debug log
    
    if (userAnswer === correctAnswer) {
        feedbackEl.textContent = 'Correct!';
        feedbackEl.className = 'correct';
        score.correct++;
    } else {
        feedbackEl.textContent = `Incorrect! The correct answer was ${correctAnswer.toUpperCase()}`;
        feedbackEl.className = 'incorrect';
    }
    
    score.total++;
    updateScore();
}

function updateScore() {
    scoreEl.textContent = `${score.correct}/${score.total}`;
    console.log('Score updated:', score); // Debug log
}

// Debugging utilities
window.debugAPI = {
    testConnection: async () => {
        const response = await fetch('http://localhost:3000/api/status');
        console.log("API Test Response:", await response.json());
    },
    forceLocal: () => {
        apiStatus = 'disconnected';
        updateStatusIndicator();
        console.warn("Forced local mode");
    },
    forceAPI: () => {
        apiStatus = 'connected';
        updateStatusIndicator();
        console.warn("Forced API mode");
    },
    getState: () => {
        return {
            currentLevel,
            currentQuestion,
            correctAnswer,
            score,
            apiStatus
        };
    },
    addQuestion: (level, question, answer) => {
        if (!PREMADE_QUESTIONS[level]) {
            PREMADE_QUESTIONS[level] = [];
        }
        PREMADE_QUESTIONS[level].push({ text: question, answer });
        console.log(`Added question to ${level}: ${question} (${answer})`);
    }
};