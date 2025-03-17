export default {
  async fetch(request, env) {
    // Handle CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const { message } = await request.json();

      // System prompt to maintain Harry Potter persona
      const systemPrompt = `You are Harry Potter, a friendly and knowledgeable wizard assistant. 
      You should respond in a way that reflects Harry's personality and knowledge of the wizarding world. 
      Use magical terms and references when appropriate, but keep responses helpful and clear.`;

      // Prepare messages for the AI
      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ];

      // Call Cloudflare AI
      const response = await fetch("https://api.cloudflare.com/client/v4/accounts/" + env.CF_ACCOUNT_ID + "/ai/run/@cf/meta/llama-2-7b-chat-int8", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.CF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages,
          stream: false
        }),
      });

      const result = await response.json();
      
      return new Response(JSON.stringify({
        response: result.result.response
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  },
}; 