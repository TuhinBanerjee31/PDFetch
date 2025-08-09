import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
});

export const chatResult = async (selfQueryRetriever, userQuery) => {
  //PROMPT TO GET THE FINAL RESULT
  const prompt = ChatPromptTemplate.fromTemplate(`
        Answer the question based only on the context provided.
        
        Context: {context}
        
        Question: {question}`);

  //CONTEXT DOCS FORMATTER
  const formatDocs = (docs) => {
    return docs.map((doc) => JSON.stringify(doc)).join("\n\n");
  };

  //FUNC THAT GEMERATE THE FINAL RESULT COMBINING LLM, DB CONTEXT, PROMPT, USER QUERY
  const ragChain = RunnableSequence.from([
    {
      context: selfQueryRetriever.pipe(formatDocs),
      question: new RunnablePassthrough(),
    },
    prompt,
    llm,
    new StringOutputParser(),
  ]);

  const ans = await ragChain.invoke(userQuery);

  return ans;
};
