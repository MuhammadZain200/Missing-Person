// auth.js
export const isAuthenticated = () => {
    return !!localStorage.getItem("token");   //Checks if user is loggined in with JWT Token in localStorage
  };
  