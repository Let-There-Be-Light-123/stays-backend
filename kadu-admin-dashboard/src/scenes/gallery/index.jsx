import React, { useState } from 'react';

const ImageUploader = () => {
  const [images, setImages] = useState([]);

  const handleImageChange = (e) => {
    const selectedImages = Array.from(e.target.files);

    setImages((prevImages) => [...prevImages, ...selectedImages]);
  };

  const handleRemoveImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  return (
    <div>
      <input type="file" multiple onChange={handleImageChange} />
      <div style={{ display: 'flex', marginTop: '10px' }}>
        {images.map((image, index) => (
          <div key={index} style={{ marginRight: '10px' }}>
            <img
              src={URL.createObjectURL(image)}
              alt={`Image ${index + 1}`}
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
            />
            <button onClick={() => handleRemoveImage(index)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;
