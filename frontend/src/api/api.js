import axios from "axios";

const API_BASE_URL = "http://localhost:5000";  //URL for backend 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",           //Content-type is always application/json
  },
});


export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;         //Adds / removez token in the Authorization in the input field using JWT
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export default api;
