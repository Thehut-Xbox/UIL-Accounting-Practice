document.addEventListener('DOMContentLoaded', function() {
    const employeeData = document.getElementById('employeeData');
    const questionsContainer = document.getElementById('questionsContainer');
    const generateBtn = document.getElementById('generateBtn');

    // List of first and last names for randomization
    const firstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

    // Generate random employee data
    function generateEmployeeData() {
        // Randomly choose between 3 and 4 employees
        const numEmployees = Math.floor(Math.random() * 2) + 3; // 3 or 4
        const employees = [];
        
        for (let i = 0; i < numEmployees; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            // Random wage between $10.00 and $25.00, rounded to nearest cent
            const hourlyWage = (Math.round((Math.random() * 15 + 10) * 100) / 100).toFixed(2);
            const hours = [];
            let totalHours = 0;
            
            // Generate initial hours for each day
            for (let j = 0; j < 5; j++) {
                // Random hours between 6 and 12, rounded to nearest tenth
                const dayHours = (Math.round((Math.random() * 6 + 6) * 10) / 10).toFixed(1);
                hours.push(dayHours);
                totalHours += parseFloat(dayHours);
            }

            // Ensure total hours is over 40 by adjusting random days
            while (totalHours < 40.5) { // Using 40.5 to ensure we're well over 40
                const randomDay = Math.floor(Math.random() * 5);
                const currentHours = parseFloat(hours[randomDay]);
                // Add between 0.5 and 2 hours to a random day, rounded to nearest tenth
                const additionalHours = (Math.round((Math.random() * 1.5 + 0.5) * 10) / 10).toFixed(1);
                hours[randomDay] = (Math.round((currentHours + parseFloat(additionalHours)) * 10) / 10).toFixed(1);
                totalHours += parseFloat(additionalHours);
            }

            employees.push({
                name: `${firstName} ${lastName}`,
                hourlyWage: hourlyWage,
                hours: hours
            });
        }
        return employees;
    }

    // Calculate answers for the questions
    function calculateAnswers(employees) {
        const answers = {
            totalOvertime: 0,
            grossPay: {},
            overtimePay: {},
            overtimeRate: {},
            regularPay: {},
            totalGrossPay: 0
        };

        employees.forEach(employee => {
            const totalHours = employee.hours.reduce((sum, hours) => sum + parseFloat(hours), 0);
            const overtimeHours = Math.max(0, totalHours - 40);
            const regularHours = totalHours - overtimeHours;
            const overtimeRate = Math.round((parseFloat(employee.hourlyWage) * 1.5) * 100) / 100;
            const regularPay = Math.round((regularHours * parseFloat(employee.hourlyWage)) * 100) / 100;
            const overtimePay = Math.round((overtimeHours * overtimeRate) * 100) / 100;
            const grossPay = Math.round((regularPay + overtimePay) * 100) / 100;

            answers.totalOvertime += overtimeHours;
            answers.grossPay[employee.name] = grossPay;
            answers.overtimePay[employee.name] = overtimePay;
            answers.overtimeRate[employee.name] = overtimeRate;
            answers.regularPay[employee.name] = regularPay;
            answers.totalGrossPay += grossPay;
        });

        // Round totalOvertime to nearest tenth, totalGrossPay to nearest cent
        answers.totalOvertime = Math.round(answers.totalOvertime * 10) / 10;
        answers.totalGrossPay = Math.round(answers.totalGrossPay * 100) / 100;
        return answers;
    }

    // Format currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    // Generate and display the problem
    function generateProblem() {
        const employees = generateEmployeeData();
        const answers = calculateAnswers(employees);
        employeeData.innerHTML = employees.map(employee => `
            <tr>
                <td>${employee.name}</td>
                <td>$${employee.hourlyWage}</td>
                ${employee.hours.map(hours => `<td>${hours}</td>`).join('')}
            </tr>
        `).join('');

        // Array of question/solution pairs
        const questions = [
            {
                q: 'How many overtime hours did all employees work for the week?',
                a: `${answers.totalOvertime.toFixed(1)} hours`
            },
            {
                q: `What is the amount of gross pay for ${employees[0].name} for the week?`,
                a: `${formatCurrency(answers.grossPay[employees[0].name])}`
            },
            {
                q: `What is the amount of overtime pay for ${employees[Math.floor(employees.length/2)].name} for the week?`,
                a: `${formatCurrency(answers.overtimePay[employees[Math.floor(employees.length/2)].name])}`
            },
            {
                q: `What is the hourly overtime rate of pay for ${employees[1].name}?`,
                a: `${formatCurrency(answers.overtimeRate[employees[1].name])}`
            },
            {
                q: `What is the amount of regular pay for ${employees[employees.length-1].name}?`,
                a: `${formatCurrency(answers.regularPay[employees[employees.length-1].name])}`
            },
            {
                q: 'What is the amount of total gross pay for all employees for the week?',
                a: `${formatCurrency(answers.totalGrossPay)}`
            }
        ];

        // Render questions with individual show/hide buttons
        questionsContainer.innerHTML = questions.map((item, idx) => `
            <div class="question">
                <span class="question-number">${idx+1}.</span>
                <span class="question-text">${item.q}</span>
                <button class="show-solution-btn" data-idx="${idx}">Show Solution</button>
                <div class="solution" style="display:none; margin-left: 20px;">${item.a}</div>
            </div>
        `).join('');

        // Add event listeners for each show/hide button
        const showBtns = document.querySelectorAll('.show-solution-btn');
        showBtns.forEach((btn, idx) => {
            btn.addEventListener('click', function() {
                const solutionDiv = btn.parentElement.querySelector('.solution');
                if (solutionDiv.style.display === 'none') {
                    solutionDiv.style.display = 'block';
                    btn.textContent = 'Hide Solution';
                } else {
                    solutionDiv.style.display = 'none';
                    btn.textContent = 'Show Solution';
                }
            });
        });
    }

    // Generate initial problem
    generateProblem();

    // Add event listener for generate button
    generateBtn.addEventListener('click', generateProblem);
}); 