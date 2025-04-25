const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Validate request method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { title, company, description } = JSON.parse(event.body);
    
    // Input validation
    if (!title || !company || !description) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Get token from environment (injected by GitHub Actions)
    const HF_TOKEN = process.env.HF_TOKEN;
    if (!HF_TOKEN) {
      throw new Error('Hugging Face token not configured');
    }

    // Generate cover letter via Hugging Face
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: `Write a professional cover letter for ${title} position at ${company}. 
                  Focus on these requirements: ${description.substring(0, 1000)}` // Truncate to avoid token limits
        })
      }
    );

    // Handle API errors
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Hugging Face API error: ${error}`);
    }

    const [result] = await response.json();
    const letter = result?.generated_text || 'Failed to generate letter';

    // Basic grammar check (client-side will do deeper check)
    const sanitizedLetter = letter.replace(/\n+/g, '\n').trim();

    return {
      statusCode: 200,
      body: JSON.stringify({ letter: sanitizedLetter })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        details: error.message 
      })
    };
  }
};
