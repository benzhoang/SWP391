import React, { useState, useEffect } from "react";
import { showAlert, showConfirmAlert } from "../../../../../utils/alertUtils";
import axiosInstance from "../../../../../config/axiosConfig";
import { handleTokenError } from "../../../../../utils/tokenErrorHandle";

export default function FacilityList() {
    const [facilities, setFacilities] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [facilitiesPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchAllFacilities();
    }, []);

    const fetchAllFacilities = () => {
        axiosInstance
            .get("/court/all")
            .then((res) => {
                if (res.status === 200) {
                    setFacilities(res.data);
                } else {
                    showAlert("error", "Lỗi !", "Không lấy được dữ liệu", "top-end");
                    console.error("Response không thành công:", res.status);
                }
            })
            .catch((error) => {
                if (error.response && error.response.status === 401 && error.response.data.message === "Token không hợp lệ hoặc đã hết hạn.") {
                    handleTokenError();
                }
                handleRequestError(error);
            });
    };

    const handleRequestError = (error) => {
        console.error("Đã xảy ra lỗi:", error);
        showAlert("error", "Lỗi !", "Đã xảy ra lỗi khi lấy dữ liệu", "top-end");
    };

    // phân trang
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const indexOfLastFacility = currentPage * facilitiesPerPage;
    const indexOfFirstFacility = indexOfLastFacility - facilitiesPerPage;

    //search
    const filteredFacilities = facilities.filter((facility) => facility.courtName.toLowerCase().includes(searchTerm.toLowerCase()));
    const currentFacilities = filteredFacilities.slice(indexOfFirstFacility, indexOfLastFacility);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div className="container   ">
            <h3 className="text-center p-3">Danh sách các cơ sở cầu lông</h3>
            <div className="mb-3 w-75">
                <input
                    type="text"
                    className="form-control w-50"
                    aria-describedby="helpId"
                    placeholder="Nhập tên sân cần tìm"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>

            <div className="table-responsive overflow-x-auto">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th className="text-center">STT</th>
                            <th className="text-center">Ảnh</th>
                            <th className="text-center">ID</th>
                            <th>Tên cơ sở</th>
                            <th className="" style={{ width: "35%" }}>
                                Địa chỉ
                            </th>
                            <th>Giờ hoạt động</th>
                            {/* <th>Đánh giá</th> */}
                            <th>Số sân</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentFacilities.map((facility, index) => (
                            <tr key={facility.courtId}>
                                <td className="text-center">{indexOfFirstFacility + index + 1}</td>
                                <td>
                                    <img src={facility.imageUrl} alt={facility.courtName} style={{ width: "100px", height: "auto" }} />
                                </td>
                                <td className="text-center">{facility.courtId}</td>
                                <td>{facility.courtName}</td>
                                <td>{facility.address}</td>
                                <td>
                                    {facility.openTime} - {facility.closeTime}
                                </td>
                                {/* <td className="text-center">{facility.rate}</td> */}
                                <td className="text-center">{facility.yards ? facility.yards.length : 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <nav aria-label="Page navigation example">
                <ul className="pagination">
                    <li className="page-item">
                        <button className="page-link" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                            <span aria-hidden="true">&laquo;</span>
                        </button>
                    </li>
                    {[...Array(Math.ceil(filteredFacilities.length / facilitiesPerPage)).keys()].map((number) => (
                        <li key={number + 1} className={`page-item ${currentPage === number + 1 ? "active" : ""}`}>
                            <button onClick={() => paginate(number + 1)} className="page-link">
                                {number + 1}
                            </button>
                        </li>
                    ))}
                    <li className="page-item">
                        <button
                            className="page-link"
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === Math.ceil(filteredFacilities.length / facilitiesPerPage)}
                        >
                            <span aria-hidden="true">&raquo;</span>
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
}
