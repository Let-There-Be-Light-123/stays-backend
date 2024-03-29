import React, { useState, useEffect } from "react";
import { Box, Button,Grid } from "@mui/material";
import { DataGrid, GridToolbar  } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { mockProperties } from "../../data/mockData";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import PropertyModel from "../../models/PropertyModel";
import Config from "../../config/config";
import Popup from "../../components/PopUp";
import { useStateContext } from "../../contexts/ContextProvider";

const Properties = () => {
  const navigate = useNavigate();
  const {status} = useParams();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState(null);
  const colors = tokens(theme.palette.mode);
  const [selectedRows, setSelectedRows] = useState([]);
  const [popupMessage, setPopupMessage] = useState('');
  const { firebaseMessageToken,setFirebaseMessageToken } = useStateContext();



  useEffect(() => {
    fetchProperties();
  }, [status]);


  const fetchProperties = async () => {
    try {
      const response = await fetch(`${Config.BASE_URL}/api/properties`);
      if (!response.ok) {
        throw new Error("Failed to fetch properties");
      }
      const data = await response.json();
      if(status === "active"){
        const filteredProperties = data.data.filter(propertyData => propertyData.is_active);
        const mappedProperties = filteredProperties.map((propertyData) => new PropertyModel(propertyData));
        setProperties(mappedProperties);
      }else if(status === "inactive"){
        const filteredProperties = data.data.filter(propertyData => !propertyData.is_active);
        const mappedProperties = filteredProperties.map((propertyData) => new PropertyModel(propertyData));
        setProperties(mappedProperties);
      }
      else{
        const mappedProperties = data.data.map((propertyData) => new PropertyModel(propertyData));
        setProperties(mappedProperties);

      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (param) => {
    navigate(`/editproperty/${param.row.id}`);
  };

  const handleCreateNewProperty = () => {
    navigate("/createnewproperty");
  };

  const handleDeleteProperties = async () => {
    try {
      if (selectedRows.length === 0) {
        setPopupMessage("No properties selected for deletion.");
        return;
      }
      const propertyIdsToDelete = selectedRows;
      const response = await fetch(`${Config.BASE_URL}/api/properties/destroy-multiple`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          property_ids: propertyIdsToDelete,
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to delete properties: ${response.statusText}`);
      }
      setPopupMessage("Properties deleted successfully.");
    } catch (error) {
      console.error('Error deleting properties:', error.message);
      setPopupMessage(`Error deleting properties: ${error.message}`);
    }
  };
  const closePopup = () => {
    setPopupMessage(null);
    fetchProperties();
  };  
  const goBack = () => {
    setPopupMessage(null);
    fetchProperties();
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    {
      field: "imgUrl",
      headerName: "Main Image",
      align: "center",
      headerAlign:"center",
      flex: 1,
      renderCell: (params) => (
        <img
          src={params.row?.imgUrl}
          alt={`Property ${params.row.id}`}
          style={{ width: "50%", height: "100%", objectFit: "cover", padding: "10px" }}
        />
      ),
    },
    {
      field: "title",
      headerName: "Property Name",
      flex: 1,
      cellClassName: "name-column--cell",
      align: "center",
      headerAlign:"center",
    },
    {
      field: "category",
      headerName: "Category",
      headerAlign: "center",
      align: "center",
    },
    {
      field: "totalRooms",
      headerName: "Rooms",
      headerAlign:"center",
      align:"center"
    },
    {
      field: "isActive",
      headerName: "Active Status",
      flex: 1,
      align: "center",
      headerAlign:"center",
    },
    {
      field: "isFeatured",
      headerName: "Featured",
      flex: 1,
      align: "center",
      headerAlign:"center",
    },
    {
      field: "address",
      headerName: "Location",
      flex: 1,
      align: "center",
      headerAlign:"center",
    },
  ];
  const handleSelectionModelChange = (newSelection) => {
    setSelectedRows(newSelection);
  };
  return (
    <Box m="20px">
      <Header title="TOTAL PROPERTIES" subtitle="List of Total Properties" />
      <Box
        p="40px 0 0 0"
        height="75vh"
        width="83vw"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-row": {
            // height: "100px",
            cursor: "pointer", // Add a pointer cursor to indicate clickable rows
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <Button variant="contained" color="secondary" onClick={handleCreateNewProperty}>
          Create New Property
        </Button>
        <Grid item xs={12} container justifyContent="flex-end" spacing={2}>
          <Grid item>
            <Button variant="contained" color="error" onClick={handleDeleteProperties}>
              Delete Properties
            </Button>
          </Grid>
        </Grid>
        <DataGrid
          rows={properties}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          onRowClick={handleRowClick}
          onRowSelectionModelChange={handleSelectionModelChange}
          selectionModel={selectedRows.map((row) => row.id)} // assuming 'id' is the unique identifier field
          checkboxSelection
          getRowHeight={() => 100} // Set the desired height for each row
        />
      </Box>
      <Box p="20px">
        <Popup message={popupMessage} onClose={closePopup} onGoBack={goBack} />
      </Box>
    </Box>
  );
};

export default Properties;
