import React, { useState, useRef, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Image from '@mui/material/Image';
import './imagegallery.css';

const theme = createTheme();

const ImageGallery = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideshow, setSlideshow] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [left, setLeft] = useState(0);
  const sliderRef = useRef(null);

  const ImageURL = [

  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (slideshow) {
        const slider = sliderRef.current;
        const index = currentIndex === 9 ? 0 : currentIndex + 1;

        setLeft((prevLeft) => (index === 0 ? 0 : prevLeft - 60));

        setCurrentIndex(index);
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [slideshow, currentIndex]);

  const slideTransition = () => {
    const slider = sliderRef.current;
    if (currentIndex === 9) {
      setLeft(0);
    } else {
      setLeft((prevLeft) => prevLeft - 60);
    }
    slider.style.left = `${left}px`;
  };

  const slideshowHandler = () => {
    setSlideshow((prevSlideshow) => !prevSlideshow);
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }

    const imageContainer = document.querySelector('.gallery-img-container');
    imageContainer.style.height = '300px';
    imageContainer.style.width = '100%';

    setFullscreen(false);
  };

  const enterFullscreen = () => {
    const imageContainer = document.querySelector('.gallery-img-container');

    if (imageContainer.requestFullscreen) {
      imageContainer.requestFullscreen();
    } else if (imageContainer.mozRequestFullScreen) {
      imageContainer.mozRequestFullScreen();
    } else if (imageContainer.webkitRequestFullscreen) {
      imageContainer.webkitRequestFullscreen();
    }

    imageContainer.style.height = '100%';
    imageContainer.style.width = '100%';

    setFullscreen(true);
  };

  const dotHandler = (event) => {
    const imgIndex = event.target.id;
    setLeft(parseInt(imgIndex) * -60);
    setCurrentIndex(parseInt(imgIndex));
  };

  const updateImage = (event) => {
    const imgIndex = event.target.id;
    setLeft(parseInt(imgIndex) * -60);
    setCurrentIndex(parseInt(imgIndex));
  };

  const prevHandler = () => {
    const slider = sliderRef.current;
    const index = currentIndex === 0 ? 9 : currentIndex - 1;

    slideTransition();

    setCurrentIndex(index);
  };

  const nextHandler = () => {
    const slider = sliderRef.current;
    const index = currentIndex === 9 ? 0 : currentIndex + 1;

    slideTransition();

    setCurrentIndex(index);
  };

  const addImage = () => {
    // Add your logic to add an image to the ImageURL array
    // e.g., setImageURL([...ImageURL, 'new-image-url']);
  };

  const removeImage = () => {
    // Add your logic to remove an image from the ImageURL array
    // e.g., setImageURL(ImageURL.slice(0, -1));
  };

  const dotNumbers = Array.from(Array(ImageURL.length).keys());
  const carouselDots = dotNumbers.map((n, index) => (
    <div
      className={['carousel-dot', index === currentIndex ? 'active' : ''].join(' ')}
      key={n}
      id={n}
      onClick={dotHandler}
    >
      &#9679;
    </div>
  ));

  return (
    <ThemeProvider theme={theme}>
      <div id="gallery-container">
        <div className="gallery-img-container">
          <Image className="gallery-img" src={ImageURL[currentIndex]} alt={`img-${currentIndex}`} />
          <Button className="prev-carousel-button" onClick={prevHandler}>&#9664;</Button>
          <div id="carousel-dot-container">{carouselDots}</div>
          <Button className="next-carousel-button" onClick={nextHandler}>&#9654;</Button>
          <Button className="slideshow-button" onClick={slideshowHandler}>
            {slideshow ? 'Pause' : 'Play'}
          </Button>
          <Button className="fullscreen-button" onClick={fullscreen ? exitFullscreen : enterFullscreen}>
            {fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          </Button>
        </div>
        <div id="slider-img-container" ref={sliderRef}>
          {ImageURL.slice(0, 10).map((n, index) => (
            <Image
              className={['slider-img', index === currentIndex ? 'active' : ''].join(' ')}
              src={n}
              key={n}
              id={index}
              onClick={updateImage}
              alt={`img-${index}`}
            />
          ))}
        </div>
        <div>
          <Button onClick={addImage}>Add Image</Button>
          <Button onClick={removeImage}>Remove Image</Button>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default ImageGallery;