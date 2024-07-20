import React, { useState } from "react";
import { Link } from "react-router-dom";
export default function UserDropdown({ user, handleLogout, isLoggedIn }) {
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const handleProfileClick = () => {
        // Redirect to profile page if logged in
        window.location.href = "/profile";
    };

    return (
        <div className="relative">
            <div className="flex items-center ms-3">
                <div>
                    <button
                        type="button"
                        className="infor-userAccount flex text-sm"
                        aria-expanded={dropdownVisible ? "true" : "false"}
                        onClick={toggleDropdown}
                        style={{ alignItems: "center" }}
                    >
                        <span className="sr-only">Open user menu</span>
                        <img
                            className="w-8 h-8 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 me-3"
                            src={user.avatar}
                            alt="user photo"
                        />
                        <div className="userName">{user.username}</div>
                    </button>
                </div>

                {dropdownVisible && (
                    <div
                        className={`z-100 block my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600 absolute right-0 mt-2 w-180 top-100`}
                        id="dropdown-user"
                    >
                        <div className="px-2 py-3" role="none">
                            <p className="text-sm text-gray-900 dark:text-white" role="none">
                                {user.username}
                            </p>
                            <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-300" role="none">
                                {user.email}
                            </p>
                        </div>
                        <ul className="px-2" role="none">
                            {isLoggedIn && (
                                <li className="hover:bg-gray-100">
                                    <a
                                        href="#"
                                        className="block py-2 text-sm text-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                                        role="menuitem"
                                        onClick={handleProfileClick}
                                    >
                                        Hồ sơ
                                    </a>
                                </li>
                            )}
                            <li className="hover:bg-gray-100">
                                <Link
                                    to="/"
                                    className="block py-2 text-sm text-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                                    role="menuitem"
                                >
                                    Về trang chủ
                                </Link>
                            </li>
                            <li className="hover:bg-gray-100 my-2">
                                <Link
                                    to=""
                                    className="flex align-items-center justify-center rounded py-2 text-sm"
                                    role="menuitem"
                                    style={{ backgroundColor: "#002e86", color: "white" }}
                                    onClick={handleLogout}
                                >
                                    Đăng xuất
                                </Link>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
