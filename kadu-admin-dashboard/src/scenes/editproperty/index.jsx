import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  TextField,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Switch,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { RoomIcon } from '@mui/icons-material/Room';
import GoogleMapReact from 'google-map-react';
import Property from '../../models/PropertyModel.js';
import FileModel from '../../models/FileModel.js';
import Config from '../../config/config.js';
import ImageUploader from '../gallery/index';
import Application from './gallery.jsx';
import { DateRangePicker, DesktopDateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import AdminBookPopup from '../adminbookingpopup/index'
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const EditProperty = () => {
  const { propertyId } = useParams();
  const [propertyDetails, setPropertyDetails] = useState(new Property({  isActive: false
}));
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [images, setImages] = useState([]);
  const [map, setMap] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [unavailableRooms, setUnavailableRooms] = useState([]);
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 13.010000, lng: 77.650020 });
  const [openDialog, setOpenDialog] = useState(false);
  const [checkAvailabilityLoading, setCheckAvailabilityLoading] = useState(false);
  const [bookingPopupOpen, setBookingPopupOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [triggerRender, setTriggerRender] = useState(false);
  const [bounds, setBounds] = useState(null);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const propertyResponse = await fetch(`${Config.BASE_URL}/api/properties/${propertyId}`);
        if (!propertyResponse.ok) {
          console.error('Error fetching property details:', propertyResponse.statusText);
          setSnackbarSeverity('error');
          setSnackbarMessage('Error fetching property details. Please try again.');
          setSnackbarOpen(true);
          return;
        }
        const propertyData = await propertyResponse.json();
        setPropertyDetails({
          id: propertyData.data.property_id,
          name: propertyData.data.property_name || '',
          description: propertyData.data.property_description || '',
          category: propertyData.data.property_type || '',
          isActive: propertyData.data.is_active || false,
          isFeatured: propertyData.data.is_featured || false,
          isOnHome: propertyData.data.on_homepage || false,
          lat: parseFloat(propertyData.data.lat) || 0.00,
          lng: parseFloat(propertyData.data.lng) || 0.00,
          address: propertyDetails?.address,
          files: propertyData.data.files,
          rooms: propertyData.data.rooms
        });
        const imageUrls = propertyData.data.files
          .filter(file => file.filetype.includes('image'))
          .map(file => `${Config.BASE_URL}/storage/public/uploads/properties/${propertyData.data.property_id}/${file.filename}`);
        setImages(imageUrls);
        setTriggerRender(prev => !prev);
        setSelectedLocation({
          placeId: propertyData.data.address_id,
          description: propertyData.data.address || '',
          location: {
            lat: parseFloat(propertyData.data.lat) || 0.00,
            lng: parseFloat(propertyData.data.lng) || 0.00,
          },
        });
        setMapCenter({
          lat: parseFloat(propertyData.data.lat) || 0.00,
          lng: parseFloat(propertyData.data.lng) || 0.00,
        });

        const roomsResponse = await fetch(`${Config.BASE_URL}/api/properties/${propertyId}/rooms`);
        if (!roomsResponse.ok) {
          console.error('Error fetching rooms:', roomsResponse.statusText);
          return;
        }
        const roomsData = await roomsResponse.json();
        const availableRoomsData = roomsData.filter(room => room.is_active);
        const unavailableRoomsData = roomsData.filter(room => !room.is_active);
        setRooms(roomsData);
        setAvailableRooms(availableRoomsData);
        setUnavailableRooms(unavailableRoomsData);
      } catch (error) {
        console.error('Error fetching property details or rooms:', error);
      }

    };
    fetchPropertyDetails();
  }, [propertyId]);


  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const detailsChanged = Object.keys(propertyDetails).some(
        key => propertyDetails[key] !== propertyDetails?.propertyDetails?.[key]
      );
      const onlyFilesChanged = propertyDetails.files.some(file =>
        !propertyDetails?.propertyDetails?.files?.some(existingFile => existingFile.filename === file.filename)
      );

      if (!detailsChanged && onlyFilesChanged) {
        console.log('No changes in property details. Skipping update property API call.');
        return;
      }

      const requestBody = {
        property_name: propertyDetails.name || '',
        property_type: propertyDetails.category || '',
        is_active: propertyDetails.isActive || false,
        is_featured: propertyDetails.isFeatured || false,
        property_description: propertyDetails.description || '',
        lat: selectedLocation?.location?.lat || 0,
        lng: selectedLocation?.location?.lng || 0,
        address: selectedLocation?.description || '',
        address_id: selectedLocation?.place_id || '',
      };


      await fetch(`${Config.BASE_URL}/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (propertyDetails.updatedFiles.length > 0) {
        await handleUpload({
          target: {
            files: propertyDetails.updatedFiles
          },
        });
      } else {
        console.log('No new files detected.');
      }
      setOpenDialog(true);
    } catch (error) {
      console.error('Error updating property details:', error);
      setSnackbarSeverity('error');
      setSnackbarMessage(`Error updating property details: ${error.message}`);
      setSnackbarOpen(true);
    }
  };

  const handleSearchLocation = (value) => {
    setSearchLocation(value);

    const autocompleteService = new window.google.maps.places.AutocompleteService();
    autocompleteService.getPlacePredictions({ input: value }, (predictions, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setPredictions(predictions);
      } else {
        setPredictions([]);
      }
    });
  };
  const handleUpload = async (updatedImages) => {
    console.log("Updated images are", updatedImages);

    try {
      const form = new FormData();
      propertyDetails.updatedFiles?.forEach((updatedImage, index) => {
        if (updatedImage && updatedImage.type !== undefined) {
          form.append(`images[${index}]`, updatedImage, updatedImage.name);
        }
      });
      const response = await fetch(
        `${Config.BASE_URL}/api/properties/${propertyDetails.id}/images`,
        {
          method: 'POST',
          body: form,
          headers: {
            // Remove the 'Content-Type' header, let the browser set it automatically
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to upload images: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log(responseData);

      setPropertyDetails({ ...propertyDetails, updatedFiles: [] });

      // Display a success toast
      // toast.success('Images uploaded successfully!', { position: toast.POSITION.BOTTOM_RIGHT });
    } catch (error) {
      console.error('Error uploading images:', error.message);

      // toast.error(`Error uploading images: ${error.message}`, { position: toast.POSITION.BOTTOM_RIGHT });
    }
  };
  const handleSelectLocation = async (prediction) => {
    setSearchLocation(prediction.description);
    setPredictions([]);
    try {
      const details = await fetchPlaceDetails(prediction.place_id);
      const { formatted_address, geometry } = details;

      setSelectedLocation({
        placeId: prediction.place_id,
        description: formatted_address,
        location: {
          lat: geometry.location.lat(),
          lng: geometry.location.lng(),
        },
      });
      setMapCenter({
        lat: geometry.location.lat(),
        lng: geometry.location.lng(),
      });

    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };
  const fetchPlaceDetails = (placeId) => {
    return new Promise((resolve, reject) => {
      const placesService = new window.google.maps.places.PlacesService(document.createElement('div'));
      placesService.getDetails({ placeId }, (result, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          resolve(result);
        } else {
          reject(new Error(`Place details request failed with status: ${status}`));
        }
      });
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    navigate(-1);
  };

  const handleImageUpload = async (event) => {
    const yourChunkNumber = 1;
    const yourChunkSize = 1024 * 1024;
    const yourTotalSize = 1024 * 1024 * 10;
    const yourIdentifier = 'uniqueIdentifier';
    const yourFilename = 'example.txt';

    const files = event.target.files;

    function isBase64(str) {
      const base64Regex = /^(data:)?[a-zA-Z0-9+/]+={0,2};base64,/;
      return base64Regex.test(str);
    }

    try {
      const formData = new FormData();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64String = file.fileData;

        if (isBase64(base64String)) {
          console.log('Valid base64 string');
          const contentType = file.filetype;
          const blob = base64ToBlob(base64String, contentType);
          formData.append(`file[${i}]`, blob, file.filename);
        } else {
          console.log('Not a valid base64 string');
        }
      }

      // Append other form data
      formData.append('property_id', propertyDetails.id);
      formData.append('resumableChunkNumber', yourChunkNumber);
      formData.append('resumableChunkSize', yourChunkSize);
      formData.append('resumableTotalSize', yourTotalSize);
      formData.append('resumableIdentifier', yourIdentifier);
      formData.append('resumableFilename', yourFilename);

      const response = await fetch(`${Config.BASE_URL}/api/files/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        console.error('Error uploading images:', response.statusText);
        return;
      }

      const responseData = await response.json();

      setPropertyDetails((prevDetails) => ({
        ...prevDetails,
        files: [...prevDetails.files, ...responseData.data],
      }));

      const imageUrls = responseData.data.map((file) => `${Config.BASE_URL}/storage/${file.filepath}`);
      setImages(imageUrls);

      console.log('Images uploaded successfully. Response:', responseData);
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };

  function base64ToBlob(base64String, contentType = '') {
    try {
      const cleanedBase64String = base64String.replace(/^data:[^;]+;base64,/, '');
      const byteCharacters = atob(cleanedBase64String);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);

        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      return new Blob(byteArrays, { type: contentType });
    } catch (error) {
      console.error('Error converting base64 to Blob:', error);
      return null;
    }
  }

  const handleRoomManagementClick = () => {
    navigate(`/roommanagement/${propertyDetails.id}`);
  };

  const handleCheckAvailability = async () => {
    try {
      const startDate = dateRange[0].startDate;
      const endDate = dateRange[0].endDate;

      if (startDate < endDate) {
        const requestBody = {
          property_id: propertyDetails.id,
          check_in_date: startDate.toISOString().split('T')[0],
          check_out_date: endDate.toISOString().split('T')[0]
        };
        console.log("the Request body is", requestBody);
        const response = await fetch(`${Config.BASE_URL}/api/available-rooms`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          console.error('Error checking availability:', response.statusText);
          return;
        }

        const availabilityData = await response.json();
        console.log('Availability Data:', availabilityData);
        setBookingPopupOpen(true);
      } else {
        console.error('Start date must be less than end date');
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    } finally {
      setCheckAvailabilityLoading(false);
    }
  };

  const handleLocationSearch = async (searchTerm) => {
    try {
      const autocompleteService = new window.google.maps.places.AutocompleteService();

      autocompleteService.getPlacePredictions(
        {
          input: searchTerm,
          types: ['geocode'],
          componentRestrictions: { country: 'us' },
        },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            console.log('Autocomplete predictions:', predictions);
          } else {
            console.error('Autocomplete request failed:', status);
          }
        }
      );
    } catch (error) {
      console.error('Error performing location search:', error);
    }
  };

  const handleBookRooms = () => {
    navigate('/Scheduler', {
      state: {
        propertyDetails: propertyDetails,
      },
    });
  };

  function handleImagesChange(updatedImages) {
    if (!propertyDetails.updatedFiles) {
      propertyDetails.updatedFiles = [];
    }

    updatedImages.forEach(updatedImage => {
      const isDuplicate = propertyDetails.updatedFiles.some(existingFile =>
        existingFile?.name === updatedImage.file?.name && existingFile?.type === updatedImage.file?.type
      );

      if (!isDuplicate) {
        propertyDetails.updatedFiles.push(updatedImage.file);
      }
    });
  }

  const AnyReactComponent = ({ text, style, lat, lng }) => (
    <div style={{ ...style, color: 'red', position: 'absolute', transform: 'translate(-50%, -50%)' }}>
      <LocationOnIcon fontSize="large" />
    </div>
  );

  return (
    <Container maxWidth="md">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Button variant="contained" color="secondary" onClick={handleBack}>
            Go Back
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              width="200"
              alt="Property Image"
              src={propertyDetails.files && propertyDetails.files.length > 0
                ? `${Config.BASE_URL}/storage/public/uploads/properties/${propertyDetails.id}/${propertyDetails.files[0].filename}`
                : null}

            />
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Edit Property
              </Typography>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Property Name"
                      fullWidth
                      color="secondary"
                      variant="outlined"
                      value={propertyDetails.name || ''}
                      onChange={(e) =>
                        setPropertyDetails({
                          ...propertyDetails,
                          name: e.target.value,
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Property Category"
                      fullWidth
                      color="secondary"
                      variant="outlined"
                      value={propertyDetails.category || ''}
                      onChange={(e) =>
                        setPropertyDetails({
                          ...propertyDetails,
                          category: e.target.value,
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Property Description"
                      fullWidth
                      multiline
                      color="secondary"
                      rows={2}
                      maxRows={4}
                      variant="outlined"
                      value={propertyDetails.description || ''}
                      onChange={(e) =>
                        setPropertyDetails({
                          ...propertyDetails,
                          description: e.target.value,
                        })
                      }
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <Typography>Active Status</Typography>

                    <Switch
                      checked={propertyDetails.isActive}
                      onChange={(e) => setPropertyDetails({ ...propertyDetails, isActive: e.target.checked })}
                      color="secondary"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>Featured</Typography>

                    <Switch
                      checked={propertyDetails.isFeatured}
                      onChange={(e) => {
                        setPropertyDetails({ ...propertyDetails, isFeatured: e.target.checked });
                      }}
                      color="secondary"
                    />
                  </Grid>
                  <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                    <Grid item xs={6}>
                      <Button variant="contained" color="secondary" onClick={handleRoomManagementClick}>
                        Go to Rooms Management
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button variant="contained" color="secondary" onClick={handleBookRooms}>
                        Check Calendar
                      </Button>
                    </Grid>
                  </Grid>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle1">Available Rooms:</Typography>
                      <Typography variant="h6">{availableRooms.length}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle1">Total Rooms :</Typography>
                      <Typography variant="h6">{rooms.length}</Typography>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Search Location"
                      fullWidth
                      color="secondary"
                      variant="outlined"
                      value={searchLocation}
                      onChange={(e) => handleSearchLocation(e.target.value)}
                    />
                    {predictions.length > 0 && (
                      <ul>
                        {predictions.map((prediction) => (
                          <li key={prediction.place_id} onClick={() => handleSelectLocation(prediction)}>
                            {prediction.description}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Grid>
                  <Grid container style={{ margin: '20px' }}>
                    <Grid item xs={12} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Grid item xs={4} style={{ width: '100%', padding: '0 10px' }}>
                        {propertyDetails.files && images.length&&  (
                          <Application images={images} onImagesChange={handleImagesChange} />
                        )}
                        { images.length === 0 &&  (
                          <Application images={images} onImagesChange={handleImagesChange} />
                        )}
                      </Grid>
                      <Grid item xs={5} style={{ marginLeft: '10px', width: '100%', height: '300px', paddingTop: '50px', paddingBottom: '50px', padding: '0 10px' }}>
                        <GoogleMapReact
                          bootstrapURLKeys={{ key: Config.API_KEY }}
                          center={mapCenter}
                          defaultZoom={18}
                          bounds={bounds} // Use the calculated bounds to fit the map
                          >
                          {propertyDetails.lat && propertyDetails.lng && (
                            <AnyReactComponent
                              text=""
                              lat={parseFloat(propertyDetails.lat)}
                              lng={parseFloat(propertyDetails.lng)}
                            />
                          )}
                        </GoogleMapReact>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid style={{ margin: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'space-between', width: '100%', height: '500px' }}>
                    <Grid item xs={6} >
                      <DateRangePicker
                        ranges={dateRange}
                        definedRangesWrapper='none'
                        definedRanges={[]}
                        minDate={new Date()}
                        onChange={(ranges) => setDateRange([ranges.selection])}
                        showSelectionPreview={false}
                      />
                    </Grid>
                    <Grid item xs={6} style={{ textAlign: 'end' }}>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleCheckAvailability}
                        disabled={checkAvailabilityLoading}
                      >
                        Check Availability
                      </Button>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Button type="submit" variant="contained" color="secondary">
                      Save Changes
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>
          Property Update
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleDialogClose}
            aria-label="close"
            style={{ position: 'absolute', top: '8px', right: '8px' }}
          >
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            The property has been successfully edited.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBack} color="secondary" autoFocus>
            Go Back to Property List
          </Button>
        </DialogActions>
      </Dialog>

      <AdminBookPopup 
      check_in_date={dateRange[0].startDate}
      check_out_date={dateRange[0].endDate}
      propertyId={propertyDetails.id}
       availableRooms={rooms} 
       open={bookingPopupOpen}
        onClose={() => setBookingPopupOpen(false)} />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000} // Adjust the duration as needed
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};
export default EditProperty
