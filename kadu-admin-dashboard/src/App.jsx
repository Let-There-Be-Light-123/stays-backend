import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Invoices from "./scenes/invoices";
import Contacts from "./scenes/contacts";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Calendar from "./scenes/calendar/calendar";
import TimelineRenderer from "./scenes/scheduler/scheduler";
import Properties from "./scenes/properties";
import AppUsers from "./scenes/appusers";
import EditProperty from "./scenes/editproperty";
import CreateNewProperty from "./scenes/createnewproperty";
import RoomManagement from "./scenes/roommanagement";
import Bookings from "./scenes/bookings/bookings";
import UserApplications from "./scenes/userapplications";
import BookingApplicationDetails from "./scenes/bookingapplicationdetails";
import MyComponent from "./apitest";
import { useStateContext } from "./contexts/ContextProvider";
import ProtectedRoute from "./protectedroute/ProtectedRoute";
import LoginForm from "./scenes/login";
import { AuthProvider } from './contexts/AuthContext';
import MockAPI from './scenes/scheduler/MockAPI'
import firebase from './firebase';
import React, { useEffect } from 'react';
import { getMessaging, getToken } from 'firebase/messaging';
import BookingVoucher from "./scenes/bookingdetailspopup/booking_voucher";


function App() {
  const { token, user } = useStateContext();

  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const mockAPI = new MockAPI();
  const { setFirebaseMessageToken } = useStateContext();
  
  return (
    // <AuthProvider> {/* Wrap your component with AuthProvider */}

    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          {token && <Sidebar isSidebar={isSidebar} />}
          <main className="content">
            {token && <Topbar setIsSidebar={setIsSidebar} />}
            {/* <MyComponent /> */}
            <Routes>

              <Route path="/" element={<ProtectedRoute element={<Dashboard />} />} />
              <Route path="/team" element={<ProtectedRoute element={<Team />} />} />
              <Route path="/contacts" element={<ProtectedRoute element={<Contacts />} />} />
              <Route path="/appusers/:userType" element={<ProtectedRoute element={<AppUsers />} />} />
              <Route path="/properties/:status" element={<ProtectedRoute element={<Properties />} />} />
              <Route path="/invoices" element={<ProtectedRoute element={<Invoices />} />} />
              <Route path="/form" element={<ProtectedRoute element={<Form />} />} />
              <Route path="/bar" element={<ProtectedRoute element={<Bar />} />} />
              <Route path="/pie" element={<ProtectedRoute element={<Pie />} />} />
              <Route path="/line" element={<ProtectedRoute element={<Line />} />} />
              <Route path="/faq" element={<ProtectedRoute element={<FAQ />} />} />
              <Route path="/bk" element={<ProtectedRoute element={<BookingVoucher />} />} />
              <Route path="/Scheduler" element={<ProtectedRoute element={<TimelineRenderer dataComponent={mockAPI} />} />} />
              <Route path="/geography" element={<ProtectedRoute element={<Geography />} />} />
              <Route path="/bookings/:status" element={<ProtectedRoute element={<Bookings />} />} />
              <Route path="/userapplications" element={<ProtectedRoute element={<UserApplications />} />} />
              <Route path="/createnewproperty" element={<ProtectedRoute element={<CreateNewProperty />} />} />
              <Route path="/editproperty/:propertyId" element={<ProtectedRoute element={<EditProperty />} />} />
              <Route path="/bookingapplicationdetails/:bookingId" element={<BookingApplicationDetails />} />
              <Route path="/roommanagement/:propertyId" element={<ProtectedRoute element={<RoomManagement />} />} />

              {!token && <Route path="/login" element={<LoginForm />} />}
              {/* {!token && <Route path="/protected-route" element={<ProtectedRoute />} />} */}


            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
    // </AuthProvider>

  );
}

export default App;
