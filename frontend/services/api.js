
import axios from "axios";

const API = axios.create({
  baseURL: "https://todo-app-2026.onrender.com/api",
});

export default API;
