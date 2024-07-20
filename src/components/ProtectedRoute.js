import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user ? user.accessToken : null;

    return token ? React.cloneElement(children, { user }) : <Navigate to="/login" />;
};

export default ProtectedRoute;
