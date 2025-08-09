"use client";

import { UploadCloud } from "lucide-react";

import React, { useState, useRef } from "react";

// Define a prop type for the callback function so the parent can receive files

interface TemptingFileUploadProps {
  onFilesSelected: (files: FileList) => void;
}

/**

 * A visually appealing and interactive file upload component.

 * Supports both drag-and-drop and click-to-browse.

 */

const FileUpload: React.FC<TemptingFileUploadProps> = ({ onFilesSelected }) => {
  // State to track if a file is being dragged over the drop zone

  const [isDragging, setIsDragging] = useState(false); // Ref to access the hidden file input element

  const fileInputRef = useRef<HTMLInputElement>(null); // --- Event Handlers ---

  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onFilesSelected(event.target.files);

      console.log("FILES: ", event.target.files); // Reset the input value to allow re-uploading the same file

      event.target.value = "";
    }
  }; // --- Drag and Drop Handlers ---

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Prevent default browser behavior

    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    setIsDragging(false);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // This is necessary to allow dropping
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    setIsDragging(false);

    const files = event.dataTransfer.files;

    if (files && files.length > 0) {
      onFilesSelected(files); // Associate dropped files with the file input

      if (fileInputRef.current) {
        fileInputRef.current.files = files;
      }
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`

        group relative flex w-full cursor-pointer flex-col items-center

        justify-center rounded-xl border-4 border-dashed bg-slate-900/50

        p-8 text-center shadow-2xl transition-all duration-300 ease-in-out

        hover:border-sky-400 hover:bg-slate-800/60

        ${isDragging ? "border-sky-500 bg-slate-800" : "border-slate-700"}

      `}
    >
            {/* Hidden file input, controlled by the container div */}
           {" "}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
            {/* Upload Icon with animations */}
           {" "}
      <UploadCloud
        className={`

          z-10 mb-4 h-16 w-16 text-slate-400

          transition-transform duration-300 ease-in-out

          group-hover:scale-110 group-hover:text-sky-400

          ${isDragging ? "scale-110 text-sky-500" : ""}

        `}
      />
            {/* Text Prompts */}     {" "}
      <p className="z-10 text-lg font-semibold text-slate-200">
                <span className="text-sky-400">Drag & drop</span> files here    
         {" "}
      </p>
           {" "}
      <p className="z-10 mt-1 text-sm text-slate-500">or click to browse</p>   {" "}
    </div>
  );
};

export default FileUpload;
