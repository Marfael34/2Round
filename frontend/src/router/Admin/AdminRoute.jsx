import { Navigate } from "react-router-dom";

const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const decoded = decodeToken(token);
  
  if (!decoded || !decoded.roles || !decoded.roles.includes("ROLE_ADMIN")) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
