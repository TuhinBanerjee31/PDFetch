import "dotenv/config";
import { Worker } from "bullmq";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { QdrantClient } from "@qdrant/js-client-rest";

const worker = new Worker(
  "file-queue",
  async (job) => {
    console.log("Job:", job.data);
    const data = JSON.parse(job.data);

    //LOAD PDF
    const loader = new PDFLoader(data.path);
    const docs = await loader.load();

    //VECTORDB CLIENT CONNNECTION
    const client = new QdrantClient({ url: process.env.QDRANT_URL });

    //VECTOR EMBEDDING MODEL
    const embeddings = new GoogleGenerativeAIEmbeddings({
      modelName: "embedding-001",
    });

    //UPLOAD VECTOR EMBEDDINGS OF PDF TO VECTORDB
    await QdrantVectorStore.fromDocuments(docs, embeddings, {
      client,
      collectionName: "pdf-docs",
    });

    console.log("ALL ADDED..");
  },
  {
    concurrency: 100,
    connection: {
      host: "localhost",
      port: "6379",
    },
  }
);
