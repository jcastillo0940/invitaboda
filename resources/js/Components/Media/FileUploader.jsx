import React, { useState, useRef } from 'react';
import axios from 'axios';
import ImageCropper from './ImageCropper';
import { Upload, X, Check, Loader2, Music, Video, Image as ImageIcon } from 'lucide-react';

export default function FileUploader({
    event,
    type = 'gallery',
    onUploadSuccess,
    aspect = 1,
    multiple = false,
    label = "Subir Archivo"
}) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [croppingImage, setCroppingImage] = useState(null);
    const fileInputRef = useRef();

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => setCroppingImage(reader.result);
            reader.readAsDataURL(file);
        } else {
            // For non-images (video/music), we use the original file directly
            uploadFile(file, file.name);
        }
    };

    const uploadFile = async (fileBlob, fileName = null) => {
        setUploading(true);
        setCroppingImage(null);

        const finalFileName = fileName || `upload-${Date.now()}.webp`;

        const formData = new FormData();
        formData.append('file', fileBlob, finalFileName);
        formData.append('type', type);

        try {
            const response = await axios.post(route('assets.upload', event.id), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                }
            });
            onUploadSuccess(response.data.url);
        } catch (error) {
            console.error('Error uploading:', error);
            alert('Error al subir archivo');
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    return (
        <div className="w-full">
            <div
                onClick={() => !uploading && fileInputRef.current.click()}
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center cursor-pointer
                    ${uploading ? 'bg-gray-50 border-gray-200 cursor-wait' : 'bg-[#FAF9F6] border-gray-200 hover:border-[#C5A059] group'}
                `}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                    accept={
                        type === 'video' ? 'video/*' :
                            type === 'music' ? 'audio/*' :
                                'image/*'
                    }
                />

                {uploading ? (
                    <div className="text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-[#C5A059] mx-auto mb-4" />
                        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                            Subiendo... {progress}%
                        </p>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                            {type === 'video' ? <Video className="w-5 h-5 text-gray-400" /> :
                                type === 'music' ? <Music className="w-5 h-5 text-gray-400" /> :
                                    <ImageIcon className="w-5 h-5 text-gray-400" />}
                        </div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-1">
                            {label}
                        </p>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest">
                            Arrastra o haz clic
                        </p>
                    </div>
                )}
            </div>

            {croppingImage && (
                <ImageCropper
                    image={croppingImage}
                    aspect={aspect}
                    onCropComplete={(blob) => uploadFile(blob)}
                    onCancel={() => setCroppingImage(null)}
                />
            )}
        </div>
    );
}
