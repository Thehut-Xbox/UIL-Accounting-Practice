// --- Configuration ---
const apiKey = window.GEMINI_API_KEY || ''; // Set this securely in your environment, not in code
const model = 'gemini-1.5-flash'; // Or 'gemini-pro', 'gemini-2.0-flash', etc.
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

// The text prompt you want to send
const textPrompt = "Explain how AI works";

// The data payload for the API request
const requestData = {
    contents: [{
        parts: [{ text: textPrompt }]
    }]
};

// --- Function to make the API call ---
async function callGeminiApi() {
    if (!apiKey) {
        console.error("Error: GEMINI_API_KEY environment variable not set.");
        return; // Exit if the key is missing
    }

    console.log("Sending request to Gemini API...");

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData) // Convert JS object to JSON string
        });

        // Check if the request was successful
        if (!response.ok) {
            // Try to get more details from the response body
            const errorBody = await response.text(); // Use text() in case it's not JSON
            throw new Error(`API request failed with status ${response.status}: ${response.statusText}. Body: ${errorBody}`);
        }

        // Parse the JSON response
        const responseData = await response.json();

        // --- Extract the generated text ---
        if (responseData.candidates && responseData.candidates.length > 0 &&
            responseData.candidates[0].content && responseData.candidates[0].content.parts &&
            responseData.candidates[0].content.parts.length > 0) {

            const generatedText = responseData.candidates[0].content.parts[0].text;
            console.log("\nAI Response:");
            console.log("----------------------------------------");
            console.log(generatedText);
            console.log("----------------------------------------");
            return generatedText;
        } else {
            console.warn("Could not extract generated text from the response structure.");
            console.log("Full Response:", JSON.stringify(responseData, null, 2));
            return responseData;
        }

    } catch (error) {
        console.error("Error calling Gemini API:", error);
    }
}

// --- Run the function ---
callGeminiApi().then(() => {
    // This ensures the script waits for the API call to complete before exiting
    process.exit(0);
}).catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
});

// If you were using this in an Express.js app, you'd wrap callGeminiApi
// inside an endpoint handler:
/*
const express = require('express');
const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

app.post('/api/generate', async (req, res) => {
    try {
        // You might get the prompt from the request body:
        // const userPrompt = req.body.prompt || "Explain how AI works";
        // const generatedContent = await callGeminiApi(userPrompt); // Modify callGeminiApi to accept a prompt

        const generatedContent = await callGeminiApi(); // Using the hardcoded prompt for now
        if (generatedContent) {
            res.json({ success: true, text: generatedContent });
        } else {
            res.status(500).json({ success: false, message: "Failed to get generation from API" });
        }
    } catch (error) {
        console.error("API endpoint error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
*/