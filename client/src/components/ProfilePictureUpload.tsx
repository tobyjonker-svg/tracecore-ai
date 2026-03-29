import React, { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';

interface ProfilePictureUploadProps {
  currentImageUrl?: string | null;
  onUploadComplete?: (url: string) => void;
}

export function ProfilePictureUpload({ currentImageUrl, onUploadComplete }: ProfilePictureUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadMutation = trpc.profile.uploadProfilePicture.useMutation();
  const deleteMutation = trpc.profile.deleteProfilePicture.useMutation();

  const handleFileSelect = async (file: File) => {
    setError(null);

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please upload a JPG, PNG, or WebP image');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let base64 = '';
      for (let i = 0; i < bytes.length; i++) {
        base64 += String.fromCharCode(bytes[i]);
      }
      base64 = btoa(base64);

      await uploadMutation.mutateAsync({
        imageData: base64,
        fileName: file.name,
        mimeType: file.type as 'image/jpeg' | 'image/png' | 'image/webp',
      });

      setPreview(null);
      onUploadComplete?.(uploadMutation.data?.url || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPreview(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync();
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const isLoading = uploadMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {/* Current or Preview Image */}
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
          {preview || currentImageUrl ? (
            <>
            <img
              src={preview || currentImageUrl || ''}
              alt="Profile"
              className="w-full h-full object-cover"
            />
              {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
              <span className="text-xs text-muted-foreground">No photo</span>
            </div>
          )}
        </div>

        {/* Upload Area */}
        <div className="flex-1">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              disabled={isLoading}
              className="hidden"
            />

            <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">Drag and drop or click to upload</p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, or WebP • Max 5MB</p>
          </div>

          {error && (
            <p className="text-sm text-destructive mt-2 flex items-center gap-1">
              <X className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Delete Button */}
      {currentImageUrl && !preview && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={isLoading}
          className="text-destructive hover:text-destructive"
        >
          {deleteMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <X className="w-4 h-4 mr-2" />
              Delete Photo
            </>
          )}
        </Button>
      )}
    </div>
  );
}
