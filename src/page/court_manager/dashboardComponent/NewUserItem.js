import React, { useEffect, useState } from "react";
import axiosInstance from "../../../config/axiosConfig";
import { showAlert } from "../../../utils/alertUtils";
import { handleTokenError } from "../../../utils/tokenErrorHandle";

const NewUserItem = () => {
    const [newUsers, setNewUsers] = useState([]);

    useEffect(() => {
        fetchNewUsers();
    }, []);

    const fetchNewUsers = () => {
        axiosInstance
            .get("/member/users")
            .then((res) => {
                if (res.status === 200) {
                    const reversedUsers = res.data.reverse().slice(0, 10);
                    setNewUsers(reversedUsers);
                } else {
                    showAlert("error", "Lỗi !", "Không lấy được dữ liệu", "top-end");
                    console.error("Response không thành công:", res.status);
                }
            })
            .catch((error) => {
                if (error.response && error.response.status === 401 && error.response.data.message === "Token không hợp lệ hoặc đã hết hạn.") {
                    handleTokenError();
                }
                console.error("Lỗi fetch users:", error);
            });
    };

    return (
        <div>
            {newUsers.map((user) => (
                <div key={user.userId} className="newUser-body-item my-3">
                    <div className="newUser-body-right">
                        <div className="newUser-avatar">
                            <img src={user.profileAvatar} alt="User Avatar" style={{ width: 200, height: 50 }} />
                        </div>
                        <div className="newUser-body-infoUser">
                            <div className="newUser-name">{user.fullName}</div>
                            <div className="newUser-email">{user.email}</div>
                        </div>
                    </div>
                    <div className="newUser-role-container">
                        {user.roles.map((role, index) => (
                            <div
                                key={index}
                                className="newUser-role text-center"
                                style={{
                                    backgroundColor: getRoleBackgroundColor(role.roleName),
                                    padding: "5px",
                                    borderRadius: "5px",
                                    margin: "2px 0",
                                }}
                            >
                                {role.roleName}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const getRoleBackgroundColor = (role) => {
    switch (role) {
        case "customer":
            return "lightgreen";
        case "manager":
            return "lightcoral";
        case "admin":
            return "lightblue";
        default:
            return "lightgray";
    }
};

export default NewUserItem;
