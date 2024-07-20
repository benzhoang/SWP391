import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../../../config/axiosConfig";

export default function NewUserItem() {
    const [users, setUsers] = useState([]);

    const getRoleBackgroundColor = (roleName) => {
        switch (roleName) {
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

    const fetchUsers = () => {
        axiosInstance
            .get("/member/users")
            .then((res) => {
                if (res.status === 200) {
                    setUsers(res.data);
                } else {
                    setUsers([]);
                }
            })
            .catch((error) => {
                console.error("Error fetching users:", error);
                setUsers([]);
            });
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div>
            {users.slice(-5).map((user) => (
                <div
                    key={user.userId}
                    className="newUser-body-item"
                    style={{ margin: "5px", padding: "5px", border: "1px solid #ccc", borderRadius: "5px" }}
                >
                    <div className="newUser-body-right" style={{ display: "flex", alignItems: "center" }}>
                        <div className="newUser-avatar" style={{ marginRight: "10px" }}>
                            <img src={user.profileAvatar} alt="User Avatar" style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
                        </div>
                        <div className="newUser-body-infoUser">
                            <div className="newUser-name" style={{ fontWeight: "bold" }}>
                                {user.fullName}
                            </div>
                            <div className="newUser-email" style={{ color: "gray" }}>
                                {user.email}
                            </div>
                        </div>
                    </div>
                    <div className="newUser-role" style={{ display: "flex", gap: "5px", marginTop: "10px" }}>
                        {user.roles.map((role) => (
                            <div
                                key={role.roleId}
                                style={{
                                    backgroundColor: getRoleBackgroundColor(role.roleName),
                                    padding: "5px 10px",
                                    borderRadius: "5px",
                                    textAlign: "center",
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
}
