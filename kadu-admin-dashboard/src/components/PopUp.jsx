import React, { useState } from "react";
import { Box, Button, Modal } from "@mui/material";

const Popup = ({ message, onClose, onGoBack }) => {
  return (
    <Modal
      open={Boolean(message)}
      onClose={onClose}
      aria-labelledby="popup-message"
      aria-describedby="popup-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
        }}
      >
        <div id="popup-message" sx={{ textAlign: "center", margin: "2rem" }}>{message}</div>
        <Button onClick={onClose}>Close</Button>
        <Button color="secondary" onClick={onGoBack}>Go to Previous Page</Button>
      </Box>
    </Modal>
  );
};

export default Popup;