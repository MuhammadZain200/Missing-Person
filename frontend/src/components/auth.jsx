// Checks if user is logged in by verifying if token exists in the local storage
export const isAuthenticated = () => {
    return !!localStorage.getItem("token");   
  };
  