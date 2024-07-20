import React, { Component } from "react";
import logoImg from "../../../assets/images/forbad_logo.png";
import UserDropdown from "./adminPage_Component/UserDropdown";
import SideBar from "./adminPage_Component/SideBar";
import Dashboard from "./adminPage_Component/SideBar_Components/Dashboard";
import FacilityList from "./adminPage_Component/SideBar_Components/FacilityList";
import ServicesManager from "./adminPage_Component/SideBar_Components/ServicesManager";
import Admin from "./adminPage_Component/SideBar_Components/Admin";
import UserList from "./adminPage_Component/SideBar_Components/UserList";

export default class AdminPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: false,
            user: {
                username: "",
                avatar: "",
                email: "",
            },
            isSidebarOpen: false,
        };
    }

    componentDidMount() {
        this.checkLoginStatus();
    }

    checkLoginStatus = () => {
        const user = JSON.parse(localStorage.getItem("user"));

        if (user) {
            this.setState({
                isLoggedIn: true,
                user: {
                    username: user.fullName,
                    avatar: user.imageUrl,
                    email: user.email,
                },
            });
        }
    };

    handleLogout = () => {
        localStorage.clear();
        this.setState({
            isLoggedIn: false,
            user: {
                username: "",
                avatar: "",
            },
        });
        window.location.href = "/";
    };
    toggleSidebar = () => {
        this.setState((prevState) => ({
            isSidebarOpen: !prevState.isSidebarOpen,
        }));
    };

    render() {
        const { isLoggedIn, user, isSidebarOpen } = this.state;

        return (
            <div className="admin">
                <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    <div className="px-3 lg:px-5 lg:pl-3">
                        <div className="flex items-center justify-between" style={{ height: 70 }}>
                            <div className="admin-nav-bar flex items-center justify-start rtl:justify-end ">
                                <button
                                    data-drawer-target="logo-sidebar"
                                    data-drawer-toggle="logo-sidebar"
                                    aria-controls="logo-sidebar"
                                    type="button"
                                    className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                                    onClick={() => this.setState({ isSidebarOpen: !this.state.isSidebarOpen })}
                                >
                                    <span className="sr-only">Open sidebar</span>
                                    <svg
                                        className="w-6 h-6"
                                        aria-hidden="true"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            clipRule="evenodd"
                                            fillRule="evenodd"
                                            d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                                        />
                                    </svg>
                                </button>

                                <a href="/adminPage" className="flex ms-2 md:me-24">
                                    <img src={logoImg} className="h-8 me-3 w-100" style={{ height: "70px" }} />
                                    <span
                                        className="self-center text-lg font-semibold sm:text-2xl whitespace-nowrap dark:text-white"
                                        style={{ color: "black" }}
                                    >
                                        4Badminton
                                    </span>
                                </a>
                            </div>
                            <div className="flex items-center">
                                <div>
                                    {isLoggedIn && <UserDropdown user={user} handleLogout={this.handleLogout} isLoggedIn={isLoggedIn} />}
                                    {!isLoggedIn && (
                                        <a href="/login" className="ms-4 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:underline">
                                            Đăng nhập
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                <SideBar isOpen={isSidebarOpen} />

                <div className="p-4 sm:ml-64 mt-5">
                    <div class="tab-content" id="pills-tabContent">
                        <div class="tab-pane fade show active" id="Dashboard" role="tabpanel" aria-labelledby="pills-Dashboard-tab">
                            <Dashboard />
                        </div>
                        <div class="tab-pane fade" id="admin" role="tabpanel" aria-labelledby="pills-admin-tab">
                            {isLoggedIn && <Admin />}
                        </div>
                        <div class="tab-pane fade" id="FacilityList" role="tabpanel" aria-labelledby="pills-FacilityList-tab">
                            {isLoggedIn && <FacilityList />}
                        </div>
                        <div class="tab-pane fade" id="ServicesManager" role="tabpanel" aria-labelledby="pills-ServicesManager-tab">
                            {isLoggedIn && <ServicesManager />}
                        </div>
                        <div class="tab-pane fade" id="UserList" role="tabpanel" aria-labelledby="pills-UserLiss-tab">
                            {isLoggedIn && <UserList />}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
