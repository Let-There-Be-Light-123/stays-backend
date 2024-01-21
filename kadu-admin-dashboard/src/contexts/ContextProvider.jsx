import { createContext, useContext, useState } from "react";

const StateContext = createContext({
  currentUser: null,
  token: null,
  firebaseMessageToken: null,
  notification: null,
  setUser: () => {},
  setToken: () => {},
  setFirebaseMessageToken: () => {},
  setNotification: () => {},
  logout: () => {},
});

export const ContextProvider = ({ children }) => {
  const [user, _setUser] = useState(localStorage.getItem("USER_DETAILS"));
  const [token, _setToken] = useState(localStorage.getItem("ACCESS_TOKEN"));
  const [firebaseMessageToken, _setFirebaseMessageToken] = useState(localStorage.getItem("FCM_TOKEN"));
  const [notification, _setNotification] = useState("");

  const setToken = (newToken) => {
    _setToken(newToken);
    if (newToken) {
      localStorage.setItem("ACCESS_TOKEN", newToken);
    } else {
      localStorage.removeItem("ACCESS_TOKEN");
    }
  };

  const setUser = (newUserDetails) => {
    _setUser(newUserDetails);
    if(newUserDetails){
      localStorage.setItem("USER_DETAILS", JSON.stringify(newUserDetails));
    }
    else{
      localStorage.setItem("USER_DETAILS");
    }
  };

  const setFirebaseMessageToken = (newToken) => {
    _setFirebaseMessageToken(newToken);
    if (newToken) {
      localStorage.setItem("FCM_TOKEN", newToken);
    } else {
      localStorage.removeItem("FCM_TOKEN");
    }
  };

  const setNotification = (message) => {
    _setNotification(message);

    setTimeout(() => {
      _setNotification("");
    }, 5000);
  };

  const logout = () => {
    setUser({});
    setToken(null);
    setFirebaseMessageToken(null);
    clearLocalStorage();
  };

  const clearLocalStorage = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("FCM_TOKEN");
  };

  return (
    <StateContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
        firebaseMessageToken,
        setFirebaseMessageToken,
        notification,
        setNotification,
        logout,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);