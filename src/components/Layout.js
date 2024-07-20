// src/components/Layout.js
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./header";
import Footer from "./footer";

const Layout = ({ isLoggedIn, user, handleLogout }) => {
    return (
        <>
            <Header isLoggedIn={isLoggedIn} user={user} handleLogout={handleLogout} />
            <main>
                <Outlet />
            </main>
            <Footer />
        </>
    );
};

export default Layout;
