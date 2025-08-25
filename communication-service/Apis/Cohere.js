import { CohereClientV2 } from "cohere-ai";

const apiKey = process.env.COHERE_API_KEY;
const cohere = new CohereClientV2({
    token: apiKey,
});

const callCohereAi = async (requestStr) => {
    const response = await cohere.chat({
        model: 'command-a-03-2025',
        messages: [
            {
                role: 'user',
                "content": requestStr
            }
        ],
    });

    console.log(response);
    const content = response.message.content;
    return content;
}


const callCohereChatBot = async (requestStr) => {
    const response = await cohere.chat({
        model: 'command-a-03-2025',
        messages: [
            {
                role: 'user',
                content: requestStr,
            },
        ],
    });

    // Extract assistant reply (first text content)
    const reply = response.message?.content?.[0]?.text || "";

    // If you want it strictly one line
    const oneLineReply = reply.replace(/\s+/g, " ").trim();

    console.log(oneLineReply);
    return oneLineReply
};

export { callCohereAi, callCohereChatBot }