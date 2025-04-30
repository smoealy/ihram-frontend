export async function askAI(messages) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are Ihram AI, a warm, respectful, and spiritual guide...` // your prompt
        },
        ...messages
      ]
    })
  });

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "No response.";
}
