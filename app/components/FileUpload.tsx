'use client';

import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Toast } from './ui/toast';

interface FileUploadProps {
  onUploadComplete: () => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'PUT',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }
      }
      setToast({ message: 'Files uploaded successfully', type: 'success' });
      onUploadComplete();
    } catch (error) {
      console.error(error);
      setToast({ message: 'Error uploading files', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input type="file" multiple onChange={handleFileChange} />
      <Button onClick={handleUpload} disabled={files.length === 0 || uploading}>
        {uploading ? 'Uploading...' : 'Upload Files'}
      </Button>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
