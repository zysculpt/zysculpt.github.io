exports.handler = async (event) => {
  const { title, company, description } = JSON.parse(event.body);
  
  try {
    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${process.env.HF_TOKEN || "HF_TOKEN_PLACEHOLDER"}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: `Write a professional cover letter for ${title} position at ${company}. Key requirements: ${description}`
      })
    });

    const result = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ letter: result[0]?.generated_text || "Generation failed" })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
