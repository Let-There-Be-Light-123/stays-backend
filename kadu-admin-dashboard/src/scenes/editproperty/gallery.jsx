import React from 'react';
import './gallery.css';

class ImageUploaderThumbnails extends React.Component {
  render() {
    let Input = this.props.input || null;
    return (
      <div className="image-thumbnails">
        <div className="image-thumbnail image-upload-button-container">
          <Input />
          <span>+</span>
        </div>
        {this.props.thumbnails.map((thumbnail, index) => (
          <div
            key={index}
            className={"image-thumbnail" + (index === this.props.current ? " image-thumbnail-selected" : "")}
            style={{ "backgroundImage": `url(${thumbnail})` }}
            onClick={e => {
              this.props.onSelect && this.props.onSelect(index);
            }}
          />
        ))}
      </div>
    );
  }
}

class ImageUploader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [...props.images],
      previewIndex: 0,
      showDropArea: false,
    };
    this.showNextImage = this.showNextImage.bind(this);
    this.showPreviousImage = this.showPreviousImage.bind(this);
  }

  readFileData(file) {
    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = () => {
        reject("Something went wrong when reading the file");
      };
      reader.readAsDataURL(file);
    });
  }

  selectImageForPreview(previewIndex, relative) {
    if (relative) {
      this.setState((prevState) => {
        let newState = { ...prevState };
        let imageCount = this.state.files.length;
        newState.previewIndex = (prevState.previewIndex + previewIndex + imageCount) % (imageCount);
        return newState;
      });
    } else {
      this.setState({ previewIndex });
    }
  }

  showNextImage() {
    this.selectImageForPreview(1, true);
  }

  showPreviousImage() {
    this.selectImageForPreview(-1, true);
  }

  removeCurrentImage = (e) => {
    e && e.preventDefault();
    let indexToRemove = this.state.previewIndex;

    this.setState((prevState) => {
      let nextState = { ...prevState };
      nextState.files = prevState.files.filter((_, index) => index !== indexToRemove);
      nextState.previewIndex = Math.max(Math.min(nextState.files.length - 1, nextState.previewIndex), 0);

      this.props.onImagesChange && this.props.onImagesChange(nextState.files);
      console.log('ImageUploader - Image Removed:', indexToRemove);
      return nextState;
    });
  };

  handleInputChange = async (e) => {
    e && e.stopPropagation();
    let files = e.target.files;

    const fileReadProcesses = [];
    for (const file of files) {
      const thumbnail = await this.readFileData(file);
      fileReadProcesses.push({ file, thumbnail });
    }

    Promise.all(fileReadProcesses).then((thumbnails) => {
      let newFilesData = thumbnails.map((item, index) => ({
        file: item.file,
        thumbnail: item.thumbnail,
      }));

      this.setState((prevState) => {
        let newState = { ...prevState };

        // Check for duplicates before adding new files
        for (const newFileData of newFilesData) {
          const isDuplicate = newState.files.some(
            (existingFile) => existingFile.thumbnail === newFileData.thumbnail
          );

          if (!isDuplicate) {
            newState.files.push(newFileData);
          }
        }

        this.props.onImagesChange && this.props.onImagesChange(newState.files);
        console.log('ImageUploader - New Images Added:', newFilesData);
        return newState;
      });
    });
  };

  showDropArea = (e) => {
    e && e.preventDefault();
    this.setState({ showDropArea: true });
  };

  hideDropArea = (e) => {
    e && e.preventDefault();
    this.setState({ showDropArea: false });
  };

  render() {
    const { previewIndex, files, showDropArea } = this.state;
    const { multiple } = this.props;
    const previewImage = files.length ? files[previewIndex].thumbnail : "";

    return (
      <div className="image-uploader">
        <div className="image-uploader-container">
          {!files.length || showDropArea ? (
            <div className="image-upload-button-container image-upload-button-view-full">
              <input
                type="file"
                accept="image/png, image/jpg, image/jpeg"
                multiple= {false}
                onChange={this.handleInputChange}
                className="image-upload-button"
              />
              Click here or drag images here to upload
            </div>
          ) : (
            <>
              <div
                className="image-upload-preview"
                style={{ backgroundImage: `url(${previewImage})` }}
              >
                {multiple && files.length && (
                  <div className="image-preview-index">
                    {previewIndex + 1} &#x2f; {files.length}
                  </div>
                )}
                {multiple && files.length && (
                  <div className="image-navigation-buttons">
                    <button className="image-navigation-button" onClick={this.showPreviousImage}>
                      &#10092;
                    </button>
                    <button className="image-navigation-button" onClick={this.showNextImage}>
                      &#10093;
                    </button>
                  </div>
                )}
              </div>
              <div className="image-action-buttons">
                <button className="image-action-button" onClick={this.removeCurrentImage}>
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
        {multiple && files.length && (
          <ImageUploaderThumbnails
            thumbnails={files.map((image) => image.thumbnail)}
            current={previewIndex}
            onSelect={(index) => {
              this.selectImageForPreview(index);
            }}
            input={() => (
              <input
                type="file"
                accept="image/png, image/jpg, image/jpeg"
                multiple={false}
                onChange={this.handleInputChange}
                className="image-upload-button"
              />
            )}
          />
        )}
      </div>
    );
  }
}

class Application extends React.Component {
  state = {
    images: this.props.images.map((url, i) => ({
      key: i,
      thumbnail: url,
    })),
  };

  componentDidUpdate(prevProps) {
    if (this.props.images !== prevProps.images) {
      console.log('Component Did Update - New Images Length:', this.props.images.length);
      const uniqueImages = Array.from(new Set(this.props.images));

      this.setState({
        images: uniqueImages.map((url, i) => ({
          key: i,
          thumbnail: url,
        })),
      });
      this.props.onImagesChange && this.props.onImagesChange(this.props.images);
    }
  }
  

  render() {
    return (
      <div>
        <ImageUploader multiple={true} images={this.state.images} onImagesChange={this.props.onImagesChange} />
      </div>
    );
  }
}

export default Application;
