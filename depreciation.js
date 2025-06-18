document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const config = {
        apiKey: window.GEMINI_API_KEY || '', // Set this securely in your environment, not in code
        model: 'gemini-1.5-flash',
        apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
    };

    // Get DOM elements
    const questionTextElement = document.getElementById('question-text');
    const questionDataElement = document.getElementById('question-data');
    const questionOptionsElement = document.getElementById('question-options');
    const feedbackElement = document.getElementById('feedback');
    const generateBtn = document.getElementById('generate-btn');
    const chatInput = document.getElementById('chat-input');
    const chatSubmit = document.getElementById('chat-submit');
    const chatMessages = document.getElementById('chat-messages');
    const methodButtons = document.querySelectorAll('.method-btn');

    let currentAnswer = null;
    let currentQuestionData = null;
    let currentMethod = 'straight-line';

    // Function to format date as MM-DD-YY
    function formatDate(date) {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);
        return `${month}-${day}-${year}`;
    }

    // Function to generate random dates
    function generateRandomDates() {
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 5;
        
        // Generate random purchase year and month
        const purchaseYear = Math.floor(Math.random() * (currentYear - startYear)) + startYear;
        const purchaseMonth = Math.floor(Math.random() * 12) + 1;
        const purchaseDate = new Date(purchaseYear, purchaseMonth - 1, 1); // 1st of month
        
        // Generate random sale year and month (after purchase)
        const minSaleYear = purchaseYear + 1;
        const maxSaleYear = currentYear;
        const saleYear = Math.floor(Math.random() * (maxSaleYear - minSaleYear + 1)) + minSaleYear;
        const saleMonth = Math.floor(Math.random() * 12) + 1;
        
        // Randomly choose between 1st and last day of month
        const useLastDay = Math.random() < 0.5;
        const lastDay = new Date(saleYear, saleMonth, 0).getDate();
        const saleDay = useLastDay ? lastDay : 1;
        const saleDate = new Date(saleYear, saleMonth - 1, saleDay);
        
        return {
            purchaseDate: formatDate(purchaseDate),
            saleDate: formatDate(saleDate)
        };
    }

    // Function to generate random asset values
    function generateRandomValues() {
        const originalCost = Math.floor(Math.random() * (100000 - 10000) + 10000);
        const salvageValue = Math.floor(originalCost * (Math.random() * 0.2 + 0.1)); // 10-30% of original cost
        const estimatedLife = Math.floor(Math.random() * 5) + 3; // 3-7 years
        const assetSoldFor = Math.floor(originalCost * (Math.random() * 0.8 + 0.4)); // 40-120% of original cost
        
        return { originalCost, salvageValue, estimatedLife, assetSoldFor };
    }

    // Function to calculate double declining balance depreciation
    function calculateDoubleDecliningDepreciation(data) {
        // Parse dates in MM-DD-YY format
        const [purchaseMonth, purchaseDay, purchaseYear] = data.datePurchased.split('-').map(Number);
        const [saleMonth, saleDay, saleYear] = data.assetSoldDate.split('-').map(Number);
        
        const purchaseDate = new Date(2000 + purchaseYear, purchaseMonth - 1, purchaseDay);
        const soldDate = new Date(2000 + saleYear, saleMonth - 1, saleDay);
        
        // Calculate months between purchase and sale
        const months = (soldDate.getFullYear() - purchaseDate.getFullYear()) * 12 + 
                      (soldDate.getMonth() - purchaseDate.getMonth());
        
        // Calculate double declining rate (2 * straight-line rate)
        const straightLineRate = 1 / data.estimatedLife;
        const doubleDecliningRate = 2 * straightLineRate;
        const monthlyRate = doubleDecliningRate / 12;
        
        let bookValue = data.originalCost;
        let totalDepreciation = 0;
        
        // Calculate depreciation for each month
        for (let i = 0; i < months; i++) {
            let monthlyDepreciation = bookValue * monthlyRate;
            // Ensure we don't depreciate below salvage value
            if (bookValue - monthlyDepreciation < data.salvageValue) {
                monthlyDepreciation = bookValue - data.salvageValue;
            }
            totalDepreciation += monthlyDepreciation;
            bookValue -= monthlyDepreciation;
        }
        
        // Calculate gain/loss
        const gainLoss = data.assetSoldFor - bookValue;
        
        return Math.round(gainLoss);
    }

    // Function to calculate straight-line depreciation
    function calculateStraightLineDepreciation(data) {
        // Parse dates in MM-DD-YY format
        const [purchaseMonth, purchaseDay, purchaseYear] = data.datePurchased.split('-').map(Number);
        const [saleMonth, saleDay, saleYear] = data.assetSoldDate.split('-').map(Number);
        
        const purchaseDate = new Date(2000 + purchaseYear, purchaseMonth - 1, purchaseDay);
        const soldDate = new Date(2000 + saleYear, saleMonth - 1, saleDay);
        
        // Calculate months between purchase and sale
        const months = (soldDate.getFullYear() - purchaseDate.getFullYear()) * 12 + 
                      (soldDate.getMonth() - purchaseDate.getMonth());
        
        // Calculate monthly depreciation
        const monthlyDepreciation = (data.originalCost - data.salvageValue) / (data.estimatedLife * 12);
        
        // Calculate total depreciation
        const totalDepreciation = monthlyDepreciation * months;
        
        // Calculate book value at time of sale
        const bookValue = data.originalCost - totalDepreciation;
        
        // Calculate gain/loss
        const gainLoss = data.assetSoldFor - bookValue;
        
        return Math.round(gainLoss);
    }

    // Function to calculate depreciation based on current method
    function calculateDepreciation(data) {
        return currentMethod === 'straight-line' 
            ? calculateStraightLineDepreciation(data)
            : calculateDoubleDecliningDepreciation(data);
    }

    // Function to handle method toggle
    function handleMethodToggle(event) {
        const selectedMethod = event.target.dataset.method;
        if (selectedMethod === currentMethod) return;

        // Update active button
        methodButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.method === selectedMethod);
        });

        currentMethod = selectedMethod;
        generateQuestion(); // Generate new question with selected method
    }

    // Add event listeners for method toggle
    methodButtons.forEach(btn => {
        btn.addEventListener('click', handleMethodToggle);
    });

    // Function to clear chat messages
    function clearChat() {
        chatMessages.innerHTML = '';
    }

    // Function to generate a random question
    function generateRandomQuestion() {
        const { purchaseDate, saleDate } = generateRandomDates();
        const { originalCost, salvageValue, estimatedLife, assetSoldFor } = generateRandomValues();
        
        const questionData = {
            data: {
                originalCost,
                salvageValue,
                datePurchased: purchaseDate,
                estimatedLife,
                depreciationMethod: currentMethod === 'straight-line' ? "Straight-Line" : "Double Declining Balance",
                assetSoldDate: saleDate,
                assetSoldFor
            },
            question: "What is the amount of gain or loss on the sale of the asset? (If a loss, indicate in brackets.)",
            answer: 0 // Will be calculated
        };

        // Calculate the correct answer
        questionData.answer = calculateDepreciation(questionData.data);

        return questionData;
    }

    // Function to add a message to the chat
    function addChatMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user-message' : 'ai-message'}`;
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to handle chat messages
    async function handleChatMessage() {
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        // Add user message to chat
        addChatMessage(userMessage, true);
        chatInput.value = '';

        try {
            // Create context from current question
            const context = `Current Question: ${currentQuestionData.question}\n` +
                          `Question Data: ${JSON.stringify(currentQuestionData.data)}\n` +
                          `User Question: ${userMessage}\n` +
                          `Please provide a clear explanation of how to solve this depreciation problem.`;

            const response = await fetch(`${config.apiUrl}?key=${config.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: context }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get response from AI');
            }

            const data = await response.json();
            const aiResponse = data.candidates[0].content.parts[0].text;
            addChatMessage(aiResponse);
        } catch (error) {
            console.error('Chat Error:', error);
            addChatMessage('Sorry, I encountered an error while processing your question. Please try again.');
        }
    }

    // Add event listeners for chat
    chatSubmit.addEventListener('click', handleChatMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleChatMessage();
        }
    });

    // Generate a question
    async function generateQuestion() {
        try {
            generateBtn.disabled = true;
            generateBtn.textContent = 'Generating...';
            feedbackElement.textContent = 'Generating question...';
            feedbackElement.style.color = '#666';

            // Clear chat messages
            clearChat();

            // Generate a random question
            const questionJSON = generateRandomQuestion();

            // Display the question
            displayQuestion(questionJSON);
            feedbackElement.textContent = '';
        } catch (error) {
            console.error('Error details:', error);
            feedbackElement.textContent = `Error: ${error.message}. Please try again.`;
            feedbackElement.style.color = 'red';
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate New Question';
        }
    }

    function displayQuestion(questionJSON) {
        currentAnswer = questionJSON.answer;
        currentQuestionData = questionJSON;

        // Display question data
        const data = questionJSON.data;
        questionDataElement.innerHTML = `
            <div class="question-info">
                <p><strong>Original Cost:</strong> $${data.originalCost.toLocaleString()}</p>
                <p><strong>Salvage Value:</strong> $${data.salvageValue.toLocaleString()}</p>
                <p><strong>Date Purchased:</strong> ${data.datePurchased}</p>
                <p><strong>Estimated Useful Life:</strong> ${data.estimatedLife} years</p>
                <p><strong>Depreciation Method:</strong> ${data.depreciationMethod}</p>
                <p><strong>Asset Sold Date:</strong> ${data.assetSoldDate}</p>
                <p><strong>Asset Sold for:</strong> $${data.assetSoldFor.toLocaleString()}</p>
            </div>
        `;

        // Display question text
        questionTextElement.textContent = questionJSON.question;

        // Create answer dropdown
        questionOptionsElement.innerHTML = `
            <div class="answer-container">
                <button class="show-answer-btn" onclick="this.nextElementSibling.classList.toggle('show')">
                    Show Answer
                </button>
                <div class="answer-dropdown">
                    <p>The correct answer is $${currentAnswer.toLocaleString()}</p>
                </div>
            </div>
        `;
    }

    // Handle generate button
    generateBtn.addEventListener('click', generateQuestion);

    // Generate first question
    generateQuestion();
}); 