import { ContextProvider, useStateContext } from "../contexts/ContextProvider"; 
import React from 'react';
import { Route, Navigate } from 'react-router-dom';


const ProtectedRoute = ({ element, ...props }) => {
  const { token } = useStateContext();

  if (!token) {
    // If the user is not authenticated, redirect to the login form
    return <Navigate to="/login" />;
  }

  // If the user is authenticated, render the specified element (component)
  return <>{element}</>;
};

export default ProtectedRoute;