export default async function feedbackAction(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: { message: "Method not allowed" } });
    }
  
    const { response, question, feedback } = req.body;
    console.log(`Response to question "${question}": ${response}`);
    console.log(`User feedback: ${feedback}`);
  
    // Do something with the user feedback
  
    return res.status(200).json({});
  }
  