import React, { useState } from 'react';
import { ImageUploader } from 'react-images-uploading';

const ImageUploadComponent = ({ existingImages, onImageUpload }) => {
  const [images, setImages] = useState(existingImages);
  const [isDragging, setIsDragging] = useState(false);

  const onChange = (imageList, addUpdateIndex) => {
    // imageList is an array of image objects
    setImages(imageList);

    // Call the parent component's callback with the updated imageList
    onImageUpload(imageList);
  };

  const handleDragEnter = () => {
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = () => {
    setIsDragging(false);
  };

  return (
    <ImageUploader
      withIcon={true}
      withPreview={true}
      onChange={onChange}
      imgExtension={['.jpg', '.gif', '.png']}
      maxFileSize={5242880}
      label="Max file size: 5MB, accepted: jpg, gif, png"
      dataURLKey="url"
      dragProps={{
        onDragEnter: handleDragEnter,
        onDragLeave: handleDragLeave,
        onDrop: handleDrop,
        style: isDragging ? { border: '2px dashed #007bff' } : {},
      }}
      defaultImages={existingImages.map(image => ({ url: image }))}
    />
  );
};

export default ImageUploadComponent;