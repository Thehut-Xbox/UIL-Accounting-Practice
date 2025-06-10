// Sample debit/credit questions by level
const questions = {
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
    ]
};

let currentQuestion = null;
let score = 0;
let totalQuestions = 0;
let currentLevel = 'district';

// Initialize the first question
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
    
    // Get random question from district level
    const districtQuestions = questions.district;
    currentQuestion = districtQuestions[Math.floor(Math.random() * districtQuestions.length)];
    questionText.textContent = currentQuestion.text;
    
    // Add click handlers to answer buttons
    const answerButtons = document.querySelectorAll('.answer-btn');
    answerButtons.forEach(button => {
        button.addEventListener('click', handleAnswer);
    });
}

// Handle answer selection
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
            const districtQuestions = questions.district;
            currentQuestion = districtQuestions[Math.floor(Math.random() * districtQuestions.length)];
            document.getElementById('question-text').textContent = currentQuestion.text;
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
            const districtQuestions = questions.district;
            currentQuestion = districtQuestions[Math.floor(Math.random() * districtQuestions.length)];
            document.getElementById('question-text').textContent = currentQuestion.text;
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

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', initializeQuestion);

function checkAnswer(selectedAnswer) {
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach(button => {
        button.disabled = true;
        if (button.dataset.answer === currentTerm.normalBalance.toLowerCase()) {
            button.classList.add('correct');
        } else if (button.dataset.answer === selectedAnswer && selectedAnswer !== currentTerm.normalBalance.toLowerCase()) {
            button.classList.add('incorrect');
        }
        if (button.dataset.answer === selectedAnswer) {
            button.classList.add('selected');
        }
    });

    questionsAnswered++;
    if (selectedAnswer === currentTerm.normalBalance.toLowerCase()) {
        correctAnswers++;
        feedbackElement.textContent = 'Correct!';
        feedbackElement.className = 'feedback correct';
    } else {
        feedbackElement.textContent = `Incorrect. The normal balance of ${currentTerm.term} is ${currentTerm.normalBalance}.`;
        feedbackElement.className = 'feedback incorrect';
    }
    
    feedbackElement.style.display = 'block';
    nextButton.style.display = 'block';
} 