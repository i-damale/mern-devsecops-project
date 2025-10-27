import React, { createContext, useContext, useState } from 'react';

const FileContext = createContext();

export const useFile = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFile must be used within a FileProvider');
  }
  return context;
};

export const FileProvider = ({ children }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isFileUploaded, setIsFileUploaded] = useState(false);

  const setFile = (file) => {
    setUploadedFile(file);
    setIsFileUploaded(true);
  };

  const clearFile = () => {
    setUploadedFile(null);
    setIsFileUploaded(false);
  };

  const value = {
    uploadedFile,
    isFileUploaded,
    setFile,
    clearFile
  };

  return (
    <FileContext.Provider value={value}>
      {children}
    </FileContext.Provider>
  );
};
