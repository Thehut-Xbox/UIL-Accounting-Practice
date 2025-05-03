require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

// Enhanced CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  next();
});

const API_TIMEOUT = 5000; // 5 seconds

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: "ready", 
    timestamp: new Date().toISOString(),
    proxy: true,
    deepseek: process.env.API_KEY ? "configured" : "missing_api_key"
  });
});

// Single improved question endpoint
app.post('/api/question', async (req, res) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    // Validate request
    if (!req.body?.messages) {
      throw new Error("Invalid request format");
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_KEY}`
      },
      body: JSON.stringify({
        ...req.body,
        model: req.body.model || 'deepseek-chat', // Default model
        max_tokens: req.body.max_tokens || 50,
        temperature: req.body.temperature || 0.7
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API responded with ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    clearTimeout(timeout);
    console.error('Proxy Error:', error.message);
    
    // Provide fallback questions if API fails
    if (error.name === 'AbortError') {
      res.status(504).json({ error: "Request timeout" });
    } else {
      res.status(500).json({ 
        error: "API request failed",
        details: error.message 
      });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`DeepSeek API Key: ${process.env.API_KEY ? 'Configured' : 'MISSING - Add to .env file'}`);
});