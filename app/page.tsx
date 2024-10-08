'use client';

import React, { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { Chat } from '@/components/Chat';

export default function Home() {
  const [filesUploaded, setFilesUploaded] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Chat with Documents</h1>
      {!filesUploaded ? (
        <FileUpload onUploadComplete={() => setFilesUploaded(true)} />
      ) : (
        <Chat />
      )}
    </div>
  );
}
