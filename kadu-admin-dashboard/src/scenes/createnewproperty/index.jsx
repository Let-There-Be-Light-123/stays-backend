import React, { useState, useEffect, useMemo } from 'react';
import { Button, TextField, Typography, Container, Grid, Card, CardContent, Switch, Snackbar, Dialog,DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MuiAlert from '@mui/material/Alert';

import FileManagerPopup from '../filemanager';
import CustomGallery from '../gallery';
import GoogleMapReact from 'google-map-react';
import Config from '../../config/config';
import RoomIcon from '@mui/icons-material/Room';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";

const CreateNewProperty = () => {
  const navigate = useNavigate();
  const [isFileManagerOpen, setFileManagerOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedLocation, setSelectedLocation] = useState();
  const [predictions, setPredictions] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 13.010000, lng: 77.650020 });
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 }); // Example coordinates for San Francisco
  const [openDialog, setOpenDialog] = useState(false);




  const [propertyDetails, setPropertyDetails] = useState({
    id: '',
    name: '',
    category: '',
    isActive: false,
    isFeatured: false,
    location: '',
    images: [],
  });
  const generatePropertyId = (propertyName, address, propertyType) => {
    const truncatedName = propertyName.substring(0, 3);
    const truncatedAddress = address.substring(0, 3);
    const truncatedType = propertyType.substring(0, 3);
    return `${truncatedName}-${truncatedAddress}-${truncatedType}`;
  };

  const createProperty = async (event) => {
    event.preventDefault();
    console.log('New property details:', propertyDetails);
    try {
      const requestBody = {
        property_id: generatePropertyId(propertyDetails.name, selectedLocation?.description, propertyDetails.category),
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
      await fetch(`${Config.BASE_URL}/api/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      setOpenSnackbar(true);     
      setOpenDialog(true); // Open the Dialog

      console.log('Property details updated successfully', requestBody);
    } catch (error) {
      console.error('Error updating property details:', error);
    }

    // navigate('/properties');
  };

  const handleBack = () => {
    navigate(-1);
  };
  const handleImageUpload = (event) => {
    const files = event.target.files;
    const uploadedImages = Array.from(files).map((file) => URL.createObjectURL(file));
    setPropertyDetails((prevDetails) => ({
      ...prevDetails,
      images: [...prevDetails.images, ...uploadedImages],
    }));
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
      if (map) {
        const { lat, lng } = location;
        map.panTo({ lat, lng });
        map.setView([lat, lng], 15); // Adjust zoom level as needed
        L.marker([lat, lng]).addTo(map)
          .bindPopup(`Latitude: ${lat}, Longitude: ${lng}`)
          .openPopup();
      }
      setMapCenter({
        lat: geometry.location.lat(),
        lng: geometry.location.lng(),
      });

      console.log("The selected location is", mapCenter);
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };
  const containerStyle = {
    width: '100%',
    height: '300px',
  };
  const defaultCenter = {
    lat: selectedLocation ? parseFloat(selectedLocation.lat) : 0.00,
    lng: selectedLocation ? parseFloat(selectedLocation.lng) : 0.00,
  };
  const defaultProps = {
    center: {
      lat: selectedLocation ? parseFloat(selectedLocation.lat) : 0.00,
      lng: selectedLocation ? parseFloat(selectedLocation.lng) : 0.00,
    },
    zoom: 14,
  };
  const position = { lat: 53.54, lng: 10 };
  const [open, setOpen] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenSnackbar(false);
  };
  const AnyReactComponent = ({ text, style }) => (
    <div style={{ ...style, color: 'black' }}>
      <RoomIcon fontSize="large" />
    </div>
  );
  return (
    <Container maxWidth="md">
      <Grid container spacing={3}>

        <Grid item xs={12}>
          <Button variant="contained" onClick={handleBack}>
            Go Back
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Create New Property
              </Typography>
              <form >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Property Name"
                      fullWidth
                      variant="outlined"
                      value={propertyDetails.name}
                      onChange={(e) => setPropertyDetails({ ...propertyDetails, name: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Property Category"
                      fullWidth
                      variant="outlined"
                      value={propertyDetails.category}
                      onChange={(e) => setPropertyDetails({ ...propertyDetails, category: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Property Description"
                      fullWidth
                      color='secondary'
                      variant="outlined"
                      value={propertyDetails.description}
                      onChange={(e) => setPropertyDetails({ ...propertyDetails, description: e.target.value })}
                    />
                  </Grid>
                  {/* <Grid item xs={12}>
                    <Switch
                      checked={propertyDetails.isActive}
                      onChange={(e) => setPropertyDetails({ ...propertyDetails, isActive: e.target.checked })}
                      color="secondary"
                    />
                    <Typography>Active Status</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Switch
                      checked={propertyDetails.isFeatured}
                      onChange={(e) => setPropertyDetails({ ...propertyDetails, isFeatured: e.target.checked })}
                      color="secondary"
                    />
                    <Typography>Featured</Typography>
                  </Grid> */}
                     
                  <Grid item xs={12}>
                    <TextField
                      label="Contact"
                      fullWidth
                      variant="outlined"
                      value={propertyDetails.contact}
                      onChange={(e) => setPropertyDetails({ ...propertyDetails, location: e.target.value })}
                    />
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

                  <Grid item xs={12} style={{ height: '300px', width: '100%' }}>

                    <GoogleMap
                      mapContainerStyle={containerStyle}
                      center={selectedLocation && selectedLocation.location ? selectedLocation.location : defaultCenter}
                      zoom={14}
                      onLoad={(map) => setMap(map)}
                    >
                      <Marker position={selectedLocation} />
                    </GoogleMap>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Button type="button" variant="contained" color="secondary" onClick={createProperty}>
                      Create Property
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity="success"
        >
          Property created successfully!
        </MuiAlert>
      </Snackbar>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Property Created</DialogTitle>
        <DialogContent>
          <Typography>
            Property created successfully!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenDialog(false); handleBack(); }}  color="secondary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CreateNewProperty;
