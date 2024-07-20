import React, { useState, useEffect } from "react";
import { showAlert } from "../../../../../utils/alertUtils";
import axiosInstance from "../../../../../config/axiosConfig";
import { handleTokenError } from "../../../../../utils/tokenErrorHandle";

export default function UserList() {
    const [userAcc, setUserAcc] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const userAccPage = 5;

    useEffect(() => {
        fetchAllUser();
    }, []);

    const fetchAllUser = () => {
        axiosInstance
            .get("/member/users")
            .then((res) => {
                if (res.status === 200) {
                    setUserAcc(res.data);
                } else {
                    showAlert("error", "Lỗi khi lấy dữ liệu.");
                }
            })
            .catch((error) => {
                if (error.response && error.response.status === 401 && error.response.data.message === "Token không hợp lệ hoặc đã hết hạn.") {
                    handleTokenError();
                } else {
                    handleRequestError(error);
                }
            });
    };

    const handleRequestError = (error) => {
        console.error("Lỗi từ server:", error.response.data);
    };

    const renderUserAccount = () => {
        const startIndex = (currentPage - 1) * userAccPage;
        const currentUsers = userAcc.slice(startIndex, startIndex + userAccPage);

        return currentUsers.map((user, index) => (
            <tr key={user.userId}>
                <td>{startIndex + index + 1}</td>
                <td>
                    <img src={user.profileAvatar} alt="Avatar" style={{ width: "50px", height: "50px" }} />
                </td>
                <td>{user.userId}</td>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
            </tr>
        ));
    };

    const totalPages = Math.ceil(userAcc.length / userAccPage);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <li key={i} className={`page-item ${currentPage === i ? "active" : ""}`}>
                    <button className="page-link" onClick={() => handlePageChange(i)}>
                        {i}
                    </button>
                </li>
            );
        }

        return (
            <nav aria-label="Page navigation example">
                <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <button
                            className="page-link"
                            aria-label="Previous"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <span aria-hidden="true">&laquo;</span>
                        </button>
                    </li>
                    {pages}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                        <button
                            className="page-link"
                            aria-label="Next"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <span aria-hidden="true">&raquo;</span>
                        </button>
                    </li>
                </ul>
            </nav>
        );
    };

    return (
        <div className="py-5">
            <h3 className="py-3 text-center">Danh sách thông tin khách hàng</h3>
            <div className="overflow-x-auto">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Ảnh đại diện</th>
                            <th>ID</th>
                            <th>Tên người dùng</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody>{renderUserAccount()}</tbody>
                </table>
            </div>
            {renderPagination()}
        </div>
    );
}
