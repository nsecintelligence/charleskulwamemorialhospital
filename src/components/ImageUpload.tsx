import { useState, useRef } from 'react';
import { Upload, X, Loader2, ImagePlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { compressImage } from '../lib/imageUtils';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
}

export default function ImageUpload({ value, onChange, label = 'Image', folder = 'general' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setPreview(URL.createObjectURL(file));

    try {
      // Compress image before upload
      const compressedFile = await compressImage(file, 1200, 0.8);
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 10)}.jpg`;

      const { data, error } = await supabase.storage
        .from('hospital-images')
        .upload(fileName, compressedFile, { cacheControl: '31536000', upsert: false });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('hospital-images')
        .getPublicUrl(data.path);

      onChange(urlData.publicUrl);
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange('');
    setPreview(null);
  };

  const displayUrl = value || preview;

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}

      {displayUrl ? (
        <div className="relative group">
          <img
            src={displayUrl}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-200"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" /> Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-2 bg-red-600 rounded-lg text-sm font-medium text-white hover:bg-red-700 flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Remove
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-hospital-red hover:text-hospital-red transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <>
              <ImagePlus className="w-8 h-8" />
              <span className="text-sm font-medium">Click to upload image</span>
              <span className="text-xs text-gray-400">JPG, PNG, GIF, WebP up to 10MB</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
