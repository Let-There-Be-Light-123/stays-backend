import React from 'react';
import {
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Divider,
} from '@mui/material';

const Gallery = ({ images, handleImageUpload }) => {
  return (
    <div>
      <Typography variant="h6">Property Images</Typography>
      <Divider style={{ margin: '10px 0' }} />
      <Grid container spacing={2}>
        {images.map((imageUrl, index) => (
          <Grid item key={index}>
            <Card>
              <CardMedia
                component="img"
                height="100"
                alt={`Image ${index + 1}`}
                src={imageUrl}
              />
              <CardContent>
                <Typography variant="caption" color="textSecondary">
                  Image {index + 1}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <input type="file" multiple accept="image/*" onChange={handleImageUpload} />
      <Button variant="outlined" onClick={handleImageUpload}>
        Upload Images
      </Button>
    </div>
  );
};

export default Gallery;
