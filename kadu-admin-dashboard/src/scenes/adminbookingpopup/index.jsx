import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  TextField,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Config from '../../config/config';


const AdminBookPopup = ({ open, onClose, availableRooms, onBook, propertyId, check_in_date, check_out_date }) => {
  const [users, setUsers] = useState([]);
  const [guestCount, setGuestCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);


  const fetchUsers = async (query) => {
    if(query !== null || query !== ''){
      try {
        setLoading(true);
        const response = await fetch(`${Config.BASE_URL}/api/users/search?query=${query}`);
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const userData = await response.json();
        console.log(userData.users);
        const mappedUsers = userData.users.map((user) => ({
          name: user.name,
          email: user.email,
          social_security: user.social_security,
        }));
  
        setUsers(mappedUsers);
        console.log(users);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedSearchQuery) {
      fetchUsers(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery]);


  const {
    handleSubmit,
    control,
    register,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const bookingData = {
        property_id: propertyId,
        check_in_date: check_in_date,
        check_out_date: check_out_date,
        booked_by: data.user.social_security,
        guest_ids: Array.from({ length: guestCount }, (_, index) => data[`ssn${index}`]),
        room_ids: [data.room],
      };
  
      const response = await fetch(`${Config.BASE_URL}/api/admin/book-rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
  
      if (!response.ok) {
        throw new Error('Failed to book the rooms. Please try again.');
      }
  
      onBook();
      onClose();
    } catch (error) {
      console.error('Error booking the rooms:', error.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Admin Booking Panel</DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* User Search Bar */}
            <Grid item xs={12}>
              <Typography variant="h6">Search User</Typography>
              <Controller
                name="user"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={users}
                    getOptionLabel={(option) => `${option.name} - ${option.email} - ${option.social_security}`}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Search User"
                        variant="outlined"
                        fullWidth
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    )}
                    value={users.find((user) => user.id === field.value) || null}
                    onChange={(_, newValue) => field.onChange(newValue)}
                  />
                )}
              />
            </Grid>
            {/* Guest Counter */}
            <Grid item xs={12}>
              <Typography variant="h6">Number of Guests</Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <IconButton onClick={() => setGuestCount(Math.max(0, guestCount - 1))} disabled={guestCount === 0}>
                    <RemoveIcon />
                  </IconButton>
                </Grid>
                <Grid item>
                  <Typography>{guestCount}</Typography>
                </Grid>
                <Grid item>
                  <IconButton onClick={() => setGuestCount(Math.min(3, guestCount + 1))} disabled={guestCount === 3}>
                    <AddIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
            {/* Guest Details */}
            {Array.from({ length: guestCount }).map((_, index) => (
              <Grid container spacing={2} key={index}>
                <Grid item xs={6}>
                  <TextField
                    label={`Social Security Number ${index + 1}`}
                    fullWidth
                    variant="outlined"
                    {...register(`ssn${index}`, { required: 'SSN is required' })}
                  />
                  {errors[`ssn${index}`] && (
                    <Typography color="error">{errors[`ssn${index}`].message}</Typography>
                  )}
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label={`Name ${index + 1}`}
                    fullWidth
                    variant="outlined"
                    {...register(`name${index}`, { required: 'Name is required' })}
                  />
                  {errors[`name${index}`] && (
                    <Typography color="error">{errors[`name${index}`].message}</Typography>
                  )}
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label={`Email ${index + 1}`}
                    fullWidth
                    variant="outlined"
                    {...register(`email${index}`, {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
                    })}
                  />
                  {errors[`email${index}`] && (
                    <Typography color="error">{errors[`email${index}`].message}</Typography>
                  )}
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label={`Phone ${index + 1}`}
                    fullWidth
                    variant="outlined"
                    {...register(`phone${index}`, { required: 'Phone is required' })}
                  />
                  {errors[`phone${index}`] && (
                    <Typography color="error">{errors[`phone${index}`].message}</Typography>
                  )}
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label={`Age ${index + 1}`}
                    fullWidth
                    variant="outlined"
                    {...register(`age${index}`, { required: 'Age is required' })}
                  />
                  {errors[`age${index}`] && (
                    <Typography color="error">{errors[`age${index}`].message}</Typography>
                  )}
                </Grid>
              </Grid>
            ))}
            {/* Room Selection */}
            <Grid item xs={12}>
              <Typography variant="h6">Room Selection</Typography>
              <Controller
                name="room"
                control={control}
                defaultValue=""
                rules={{ required: 'Room is required' }}
                render={({ field }) => (
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel>Select Room</InputLabel>
                    <Select {...field} label="Select Room">
                      {availableRooms && availableRooms.length > 0 ? (
                        availableRooms.map((room) => (
                          <MenuItem key={room.room_id} value={room.room_id}>
                            {room.room_name  ? `${room.room_name} -- ${room.room_id}`: 'No Name'}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No rooms available</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                )}
              />
              {errors.room && <Typography color="error">{errors.room.message}</Typography>}
            </Grid>
          </Grid>

          <DialogActions>
            <Button type="submit" color="secondary">
              Book Now
            </Button>
            <Button onClick={onClose} color="secondary">
              Cancel
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminBookPopup;
