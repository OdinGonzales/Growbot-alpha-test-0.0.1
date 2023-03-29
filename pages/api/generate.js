import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function generateAction(req, res) {
  // Check if OpenAI API key is configured
  if (!configuration.apiKey) {
    return res.status(500).json({
      error: { message: 'OpenAI API key not configured' },
    });
  }

  // Check if plant question is provided
  const plant = (req.body.plant || '').trim();
  const conversation = req.body.conversation || [];

  if (!plant) {
    return res.status(400).json({
      error: { message: 'Please enter a plant question' },
    });
  }

  try {
    const response = await generateResponse(conversation, plant);

    return res.status(200).json({ result: response });
  } catch (error) {
    // Handle errors from OpenAI API
    console.error(`Error with OpenAI API request: ${error.message}`);

    const status = error.response?.status || 500;
    const message =
      error.response?.data?.error?.message ||
      'An error occurred during your request.';

    return res.status(status).json({ error: { message } });
  }
}

async function generateResponse(conversation, newQuestion) {
  const model = 'text-davinci-003';
  const temperature = 0.8;
  const maxTokens = 250;

  // Format the conversation history for the prompt
  let conversationHistory = '';
  for (const entry of conversation) {
    conversationHistory += `${entry.role}: ${entry.text}\n`;
  }

  // Add the new question to the conversation history
  conversationHistory += `User: ${newQuestion}\n`;
  const prompt = `You are about to immerse yourself into the role of a Al model known as Gary The Grower whom is also known as the Greatest Plant Expert. Gary The Grower
  as the name suggests, Is a proffesional AI model designed specificly to help the user with all of their plant questions. .\n\n${conversationHistory}Gary The Grower:`;

  const response = await openai.createCompletion({
    model: model,
    prompt: prompt,
    temperature: temperature,
    max_tokens: maxTokens,
    n: 1,
  });

  let output = response.data.choices[0].text.trim();
  return output;
}

export default function handler(req, res) {
  if (req.method === 'POST') {
    generateAction(req, res);
  } else {
    res.status(405).json({ error: { message: 'Method not allowed' } });
  }
}

// These functions are not used in the current implementation, and can be removed if not needed.

// Collect user feedback on the accuracy of the chatbot's response
async function collectFeedback(response, question) {
  // This is just an example of how you could collect user feedback
  // You could modify this to suit your specific use case
  console.log(`Response to question "${question}": ${response}`);
  console.log(`Was the response correct? (y/n)`);
  const answer = await prompt();

  return answer === 'y' ? 'correct' : 'incorrect';
}

function prompt() {
  return new Promise((resolve, reject) => {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    readline.question('', answer => {
      readline.close();
      resolve(answer);
    });
  });
}

async function feedbackAction(req, res) {
  const { response, question, feedback } = req.body;
  console.log(`Response to question "${question}": ${response}`);
  console.log(`User feedback: ${feedback}`);

  // Do something with the user feedback

  return res.status(200).json({});
}

function generatePrompt(plant) {
  const capitalizedPlant = plant[0].toUpperCase() + plant.slice(1).toLowerCase();
  return `Provide an accurate response to plant questions and if that is not possible, ask follow up questions
  Question: How often should I water my plant?
  Reply: It depends on the type of plant and its specific watering needs. Some plants prefer to be watered once a week, while others may need to be watered more or less frequently. Can you tell me what kind of plant you have?
  Question: Can cannabis plants be grown outdoors?
  Reply: Yes, cannabis plants can be grown outdoors, provided that they receive enough sunlight and are planted in a suitable climate. They typically need a minimum of 6 hours of direct sunlight daily for healthy growth.
  Question:  My plant's leaves are turning yellow. What should I do?
  Reply: Yellowing leaves could be a sign of overwatering, underwatering, or a nutrient deficiency. Can you tell me more about your plant's environment and care routine?
  Question: How much sunlight does my plant need?
  Reply: Different plants have different sunlight requirements. Some prefer bright, direct sunlight, while others prefer indirect light. Can you tell me what kind of plant you have and where it's currently located?
  Question: Can I use tap water to water my plant?
  Reply: It depends on the quality of your tap water and the specific needs of your plant. Some plants are sensitive to certain chemicals commonly found in tap water, while others are more tolerant. Can you tell me more about your plant and the water you've been using?
  Question: ${capitalizedPlant}
  Reply:`;
  }
