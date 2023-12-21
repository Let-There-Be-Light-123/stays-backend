import { Box, Button, TextField, Avatar, FormControl, InputLabel, Select, MenuItem, FormHelperText } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import Config from "../../config/config";
import { useState } from "react";
import { useStateContext } from "../../contexts/ContextProvider";

const Form = () => {
  const [file, setFile] = useState(null); // State to hold the selected file
  const { user } = useStateContext();

  const isNonMobile = useMediaQuery("(min-width:600px)");
  const handleFormSubmit = async (values) => {

  const filledValues = Object.entries(values)
  .filter(([key, value]) => value !== '' && value !== null)
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

const address = [filledValues.address1, filledValues.address2]
  .filter(Boolean) // Remove empty or null addresses
  .join(', ');

const modifiedValues = {
  ...filledValues,
  address: address,
  name: `${values.firstName} ${values.lastName}`,
};
    delete modifiedValues.firstName;
    delete modifiedValues.lastName;
    delete modifiedValues.address1;
    delete modifiedValues.address2;
    console.log("User Registratioon with", modifiedValues);
    try {

      const formData = new FormData();

      Object.entries(modifiedValues).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (file) {
        formData.append('photo', file);
      }
  
      debugger;
      const response = await fetch(`${Config.BASE_URL}/api/register-by-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ACCESS_TOKEN')}`
        },
        body: formData,
      });
      if (!response.ok) {
        console.error('Registration failed:', response);
        return;
      }
      console.log('Registration successful');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const uploadUserImage = async () => {
    try {
      let user_id = 554455; // Replace this with the actual user ID
      if (file && user_id) {
        const imageFile = new File([file], 'user_photo.jpeg', { type: file.type });
  
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('user_id', user_id);
  
        const response = await fetch(`${Config.BASE_URL}/api/uploadUser`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('ACCESS_TOKEN')}`,
          },
        });
  
        if (!response.ok) {
          console.error('Image upload failed:', response);
          return;
        }
  
        console.log('Image upload successful');
      }
    } catch (error) {
      console.error('Image upload failed:', error);
    }
  };

  return (
    <Box m="20px">
      <Header title="CREATE USER" subtitle="Create a New User Profile" />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldValue
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
               <Box id="photo-container" gridColumn="span 4">
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="photo-upload"
                type="file"
                onChange={(e) => {
                  if (e.target.files.length > 0) {
                    const selectedFile = e.target.files[0];
                    console.log("The selected file",selectedFile);
                    console.log("The selected file type",selectedFile.type);

                    setFile(selectedFile); 
                    const reader = new FileReader();

                    reader.onload = (event) => {
                      setFieldValue('photoUrl', event.target.result);
                    };

                    reader.readAsDataURL(selectedFile);
                  }
                }}
              />
              <label htmlFor="photo-upload">
                <Avatar
                  alt="User Photo"
                  src={values.photoUrl || "#"}
                  sx={{
                    width: "100px",
                    height: "100px",
                    backgroundColor: "#bdbdbd",
                    cursor: 'pointer',
                    backgroundSize: 'cover',
                    margin: "auto",
                  }}
                />
                <div>Click to upload photo</div>
              </label>
              <Button
                  color="secondary"
                  variant="outlined"
                  component="span"
                  onClick={uploadUserImage}
                  sx={{ marginTop: '10px' }}
                >
                  Upload Profile Image
                </Button>
            </Box>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="First Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.firstName}
                name="firstName"
                error={!!touched.firstName && !!errors.firstName}
                helperText={touched.firstName && errors.firstName}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Last Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.lastName}
                name="lastName"
                error={!!touched.lastName && !!errors.lastName}
                helperText={touched.lastName && errors.lastName}
                sx={{ gridColumn: "span 2" }}
              />
              <FormControl fullWidth sx={{ gridColumn: "span 4" }}>
                <InputLabel id="role-label">User Role</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  name="role_id"
                  value={values.role_id}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!touched.role_id && !!errors.role_id}
                >
                  <MenuItem value="" disabled>
                    Select User Role
                  </MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="superadmin">SuperAdmin</MenuItem>
                  <MenuItem value="appuser">AppUser</MenuItem>
                  <MenuItem value="staff">Staff</MenuItem>
                  {/* Add more roles as needed */}
                </Select>
                {touched.role_id && errors.role_id && (
                  <FormHelperText error>{errors.role_id}</FormHelperText>
                )}
              </FormControl>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Social Security"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.social_security}
                name="social_security"
                error={!!touched.social_security && !!errors.social_security}
                helperText={touched.social_security && errors.social_security}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Contact Number"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.contact}
                name="contact"
                error={!!touched.contact && !!errors.contact}
                helperText={touched.contact && errors.contact}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Address 1"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.address1}
                name="address1"
                error={!!touched.address1 && !!errors.address1}
                helperText={touched.address1 && errors.address1}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Address 2"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.address2}
                name="address2"
                error={!!touched.address2 && !!errors.address2}
                helperText={touched.address2 && errors.address2}
                sx={{ gridColumn: "span 4" }}
              />
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Create New User
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

const phoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

const checkoutSchema = yup.object().shape({
  firstName: yup.string().required("required"),
  lastName: yup.string().required("required"),
  email: yup.string().email("invalid email").required("required"),
  contact: yup
    .string()
    .matches(phoneRegExp, "Phone number is not valid")
    .required("required"),
  address1: yup.string().required("required"),
  address2: yup.string().required("required"),
  role_id: yup.string().required("required"),
  social_security: yup
    .string()
    .matches(/^\d{9}$/, 'Social Security must be 9 digits')
    .required('Social Security is required'),
});

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  contact: "",
  address1: "",
  address2: "",
  role_id: "",
  social_security: "",
};

export default Form;