// Check answer
function checkAnswer(selectedAnswer) {
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.onclick = null; // Disable further clicks
        if (option.textContent === currentTerm.normalBalance) {
            option.classList.add('correct');
        } else if (option.textContent === selectedAnswer && selectedAnswer !== currentTerm.normalBalance) {
            option.classList.add('incorrect');
        }
        if (option.textContent === selectedAnswer) {
            option.classList.add('selected');
        }
    });

    questionsAnswered++;
    if (selectedAnswer === currentTerm.normalBalance) {
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