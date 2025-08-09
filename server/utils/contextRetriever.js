import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { SelfQueryRetriever } from "langchain/retrievers/self_query";
import { QdrantTranslator } from "@langchain/community/structured_query/qdrant";

const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0,
  });

export const contextRetriever = async () => {

  // SETTING OUT EMBEDDING MODEL
  const embeddings = new GoogleGenerativeAIEmbeddings({
    modelName: "embedding-001",
  });

  //SETTING VECTORDB CONNECTION
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: process.env.QDRANT_URL,
      collectionName: "pdf-docs",
    }
  );

  //CONTEXT FORMAT
  const attributeInfo = [
    {
      name: "source",
      description: "The file path or name of the PDF document",
      type: "string",
    },
    {
      name: "page_number",
      description: "The page number of the content within the PDF",
      type: "number",
    },
  ];

  //GENERATES THE CONTEXT ON INVOKE
  const selfQueryRetriever = SelfQueryRetriever.fromLLM({
    llm: llm,
    vectorStore: vectorStore,
    /** A short summary of what the document contents represent. */
    // documentContents: "Informative",
    attributeInfo: attributeInfo,
    structuredQueryTranslator: new QdrantTranslator(),
  });

  return selfQueryRetriever;
};
