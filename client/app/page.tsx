"use client";

import ChatArea from "./components/ChatArea";
import FileUpload from "./components/FileUpload";
import { useState } from "react";

export default function Home() {
  // State to hold the name of the file
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  // State to track the successful upload status
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  // This function handles the file selection and upload process
  const handleFiles = async (files: FileList) => {
    if (files && files.length > 0) {
      const file = files[0];

      // 1. Reset states for the new upload
      setUploadedFileName(file.name);
      setUploadSuccess(false); // Reset success message on new upload

      // 2. Prepare and send the file to the server
      const formData = new FormData();
      formData.append("pdf", file);

      try {
        const response = await fetch("http://localhost:8000/upload/pdf", {
          method: "POST",
          body: formData,
        });

        // Check if the upload was successful on the server
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }

        const result = await response.json();

        // 3. If server confirms upload, update state to show success message
        if (result.message === "uploaded") {
          console.log("FILE UPLOADED SUCCESSFULLY");
          setUploadSuccess(true);
        } else {
          throw new Error("Server did not confirm upload.");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        setUploadedFileName("Upload failed. Please try again.");
        setUploadSuccess(false);
      }
    }
  };

  return (
    <div>
      <div className="min-h-screen w-screen flex">
        <div className="w-[40vw] min-h-screen flex flex-col justify-center px-6">
          <h1 className="mb-6 text-center text-3xl font-bold text-white tracking-wider">
            Upload Your File
          </h1>
          <FileUpload onFilesSelected={handleFiles} />

          {/* This block displays the status of the upload */}
          {uploadedFileName && (
            <div className="mt-4 rounded-lg bg-slate-800 p-4 text-left">
              <h3 className="font-semibold text-white">Selected File:</h3>
              <ul className="mt-2 list-disc list-inside text-sm text-slate-300">
                <li>{uploadedFileName}</li>
              </ul>

              {/* ✨ New block to display success message ✨ */}
              {uploadSuccess && (
                <div className="mt-3 rounded-md bg-green-900/50 p-3 text-center">
                  <p className="font-semibold text-green-300">
                    File uploaded! You are ready to query. ✅
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="w-[60vw] min-h-screen border-l-2">
          <ChatArea />
        </div>
      </div>
    </div>
  );
}