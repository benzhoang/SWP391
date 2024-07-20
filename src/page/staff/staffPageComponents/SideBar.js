import React, { useState } from "react";
import "../staff.css";
import { Link } from "react-router-dom";
const SideBar = () => {
    const [activeTab, setActiveTab] = useState("Dashboard");

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
    };

    return (
        <aside
            id="logo-sidebar"
            className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700"
            aria-label="Sidebar"
        >
            <div className=" sidebar-item h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
                <ul className="p-0 font-normal nav nav-pills" id="pills-tab" role="tablist">
                    <li
                        className={`mt-2 nav-item ${activeTab === "Dashboard" ? "active" : ""}`}
                        id="pills-home-tab"
                        data-bs-toggle="pill"
                        data-bs-target="#Dashboard"
                    >
                        <button
                            className="nav-link  flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                            onClick={() => handleTabClick("Dashboard")}
                        >
                            <svg
                                className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 22 21"
                            >
                                <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                                <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                            </svg>
                            <span className="ms-3">Bảng điều khiển</span>
                        </button>
                    </li>
                    <li
                        className={`mt-2 nav-item ${activeTab === "FacilityList" ? "active" : ""}`}
                        id="pills-home-tab"
                        data-bs-toggle="pill"
                        data-bs-target="#FacilityList"
                    >
                        <button
                            className="nav-link flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                            onClick={() => handleTabClick("FacilityList")}
                        >
                            <i className="fa-solid fa-shop"></i>
                            <span className="flex-1 ms-3 whitespace-nowrap">Danh sách cơ sở</span>
                        </button>
                    </li>
                    <li
                        className={`mt-2 nav-item ${activeTab === "ServicesManager" ? "active" : ""}`}
                        data-bs-toggle="pill"
                        data-bs-target="#ServicesManager"
                    >
                        <button
                            className="nav-link flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                            onClick={() => handleTabClick("ServicesManager")}
                        >
                            <i className="fa-solid fa-mug-saucer"></i>
                            <span className="flex-1 ms-3 whitespace-nowrap">Quản lý dịch vụ</span>
                        </button>
                    </li>
                    <li className={`mt-2 nav-item ${activeTab === "UserList" ? "active" : ""}`} data-bs-toggle="pill" data-bs-target="#UserList">
                        <button
                            className="nav-link flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                            onClick={() => handleTabClick("UserList")}
                        >
                            <svg
                                className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 20 18"
                            >
                                <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
                            </svg>
                            <span className="flex-1 ms-3 whitespace-nowrap">Danh sách người dùng</span>
                        </button>
                    </li>
                    <li className={`mt-2 nav-item ${activeTab === "Admin" ? "active" : ""}`} data-bs-toggle="pill" data-bs-target="#admin">
                        <button
                            className="nav-link flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
                            onClick={() => handleTabClick("Admin")}
                        >
                            <i class="fa-solid fa-user-tie"></i>
                            <span className="flex-1 ms-3 whitespace-nowrap">Quản trị viên</span>
                        </button>
                    </li>
                    <li className="w-100 mt-3">
                        <Link
                            to="/"
                            className="d-flex justify-center"
                            style={{ backgroundColor: "#002e86", padding: "10px", textAlign: "center", borderRadius: 10, color: "white" }}
                        >
                            Trở về trang chủ
                        </Link>
                    </li>
                </ul>
            </div>
        </aside>
    );
};

export default SideBar;
