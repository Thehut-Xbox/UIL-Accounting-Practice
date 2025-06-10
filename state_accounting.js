// State level accounting terms
const stateTerms = [
    { term: "Accounts Receivable", answer: "debit" },
    { term: "Accounts Payable", answer: "credit" },
    { term: "Cash", answer: "debit" },
    { term: "Common Stock", answer: "credit" },
    { term: "Equipment", answer: "debit" },
    { term: "Notes Payable", answer: "credit" },
    { term: "Prepaid Insurance", answer: "debit" },
    { term: "Retained Earnings", answer: "credit" },
    { term: "Supplies", answer: "debit" },
    { term: "Unearned Revenue", answer: "credit" },
    { term: "Wages Payable", answer: "credit" },
    { term: "Building", answer: "debit" },
    { term: "Dividends", answer: "debit" },
    { term: "Service Revenue", answer: "credit" },
    { term: "Rent Expense", answer: "debit" },
    { term: "Utilities Expense", answer: "debit" },
    { term: "Salaries Expense", answer: "debit" },
    { term: "Interest Revenue", answer: "credit" },
    { term: "Depreciation Expense", answer: "debit" },
    { term: "Accumulated Depreciation", answer: "credit" },
    { term: "Bonds Payable", answer: "credit" },
    { term: "Premium on Bonds Payable", answer: "credit" },
    { term: "Discount on Bonds Payable", answer: "debit" },
    { term: "Investment in Bonds", answer: "debit" },
    { term: "Premium on Investment in Bonds", answer: "debit" },
    { term: "Discount on Investment in Bonds", answer: "credit" },
    { term: "Interest Expense", answer: "debit" },
    { term: "Amortization of Premium", answer: "debit" },
    { term: "Amortization of Discount", answer: "credit" }
];

let currentQuestion = null;
let score = 0;
let totalQuestions = 0;

function initializeQuestion() {
    const questionText = document.getElementById('question-text');
    const feedback = document.getElementById('feedback');
    const scoreDisplay = document.getElementById('score');
    
    // Reset score
    score = 0;
    totalQuestions = 0;
    scoreDisplay.textContent = `${score}/${totalQuestions}`;
    
    // Clear feedback
    feedback.textContent = '';
    feedback.className = '';
    
    // Get random question
    currentQuestion = stateTerms[Math.floor(Math.random() * stateTerms.length)];
    questionText.textContent = currentQuestion.term;
    
    // Add click handlers to answer buttons
    const answerButtons = document.querySelectorAll('.answer-btn');
    answerButtons.forEach(button => {
        button.addEventListener('click', handleAnswer);
    });
}

function handleAnswer(event) {
    const selectedAnswer = event.target.dataset.answer;
    const feedback = document.getElementById('feedback');
    const scoreDisplay = document.getElementById('score');
    const buttons = document.querySelectorAll('.answer-btn');
    
    // Add selected class to clicked button
    buttons.forEach(button => {
        button.disabled = true;
        if (button.dataset.answer === selectedAnswer) {
            button.classList.add('selected');
        }
    });
    
    totalQuestions++;
    
    if (selectedAnswer === currentQuestion.answer) {
        feedback.textContent = 'Correct!';
        feedback.className = 'correct';
        score++;
        
        // Get new question after a short delay (750ms for correct answers)
        setTimeout(() => {
            currentQuestion = stateTerms[Math.floor(Math.random() * stateTerms.length)];
            document.getElementById('question-text').textContent = currentQuestion.term;
            feedback.textContent = '';
            feedback.className = '';
            
            // Reset buttons
            buttons.forEach(button => {
                button.disabled = false;
                button.classList.remove('selected', 'correct', 'incorrect');
            });
        }, 750);
    } else {
        feedback.textContent = `Incorrect. The correct answer is ${currentQuestion.answer}.`;
        feedback.className = 'incorrect';
        
        // Show correct answer
        buttons.forEach(button => {
            if (button.dataset.answer === currentQuestion.answer) {
                button.classList.add('correct');
            }
        });

        // Get new question after a longer delay (1000ms for incorrect answers)
        setTimeout(() => {
            currentQuestion = stateTerms[Math.floor(Math.random() * stateTerms.length)];
            document.getElementById('question-text').textContent = currentQuestion.term;
            feedback.textContent = '';
            feedback.className = '';
            
            // Reset buttons
            buttons.forEach(button => {
                button.disabled = false;
                button.classList.remove('selected', 'correct', 'incorrect');
            });
        }, 1000);
    }
    
    scoreDisplay.textContent = `${score}/${totalQuestions}`;
}

// Initialize the first question when the page loads
document.addEventListener('DOMContentLoaded', function() {
    const startScreen = document.getElementById('startScreen');
    const startButton = document.getElementById('startButton');
    
    startButton.addEventListener('click', function() {
        startScreen.classList.add('hidden');
        initializeQuestion();
    });
}); 