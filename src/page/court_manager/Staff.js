import React, { Component } from "react";
import axiosInstance from "../../config/axiosConfig";
import { showAlert, showConfirmAlert } from "../../utils/alertUtils";
import { handleTokenError } from "../../utils/tokenErrorHandle";

export default class Staff extends Component {
    state = {
        staffs: [],
        courts: [],
        newStaff: {
            email: "",
            password: "",
            fullName: "",
            role: ["staff", "customer"],
            managerId: this.props.managerId,
        },
        selectedStaffId: null,
        selectedCourtId: "",
        currentPage: 1,
        itemsPerPage: 5,
        searchInput: "",
    };

    componentDidMount() {
        this.fetchAllStaff();
        this.fetchCourts();
    }

    componentDidUpdate(prevProps) {
        if (this.props.managerId !== prevProps.managerId) {
            this.setState((prevState) => ({
                newStaff: {
                    ...prevState.newStaff,
                    managerId: this.props.managerId,
                },
            }));
        }
    }

    fetchAllStaff = () => {
        axiosInstance
            .get("/member/all-staff")
            .then((res) => {
                if (res.status === 200) {
                    this.setState({ staffs: res.data });
                } else {
                    this.setState({ staffs: [] });
                    showAlert("error", "Lỗi !", "Không lấy được dữ liệu", "top-end");
                    console.error("Response không thành công:", res.status);
                }
            })
            .catch((error) => {
                throw error;
            });
    };

    fetchCourts = () => {
        axiosInstance
            .get("/court/courts-of-owner")
            .then((res) => {
                if (res.status === 200) {
                    this.setState({ courts: res.data });
                } else {
                    this.setState({ courts: [] });
                    showAlert("error", "Lỗi !", "Không lấy được dữ liệu", "top-end");
                    console.error("Response không thành công:", res.status);
                }
            })
            .catch((error) => {
                throw error;
            });
    };

    fetchStaffWithCourt = (courtId) => {
        axiosInstance
            .get(`/court/staffs-of-court/${courtId}`)
            .then((res) => {
                if (res.status === 200) {
                    if (res.data.length > 0) {
                        this.setState({ staffs: res.data });
                    } else {
                        this.setState({ staffs: [] });
                        showAlert("info", "Thông báo", "Không có nhân viên nào trong sân", "top-end");
                    }
                } else {
                    this.setState({ staffs: [] });
                    showAlert("error", "Lỗi !", "Không lấy được dữ liệu", "top-end");
                }
            })
            .catch((error) => {
                this.setState({ staffs: [] });
                // showAlert("info", "Lỗi !", "Danh sách trống", "top-end");
                throw error;
            });
    };

    handleChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            newStaff: {
                ...this.state.newStaff,
                [name]: value,
            },
        });
    };

    createAccountStaff = (e) => {
        e.preventDefault();
        axiosInstance
            .post("/auth/signup", this.state.newStaff)
            .then((response) => {
                this.setState({
                    staffs: [...this.state.staffs, response.data],
                    newStaff: {
                        email: "",
                        password: "",
                        fullName: "",
                        role: ["staff", "customer"],
                        managerId: this.props.managerId,
                    },
                });
                this.fetchAllStaff();
                showAlert("success", "", "Tài khoản nhân viên được thêm thành công", "top-end");
            })
            .catch((error) => {
                handleTokenError(error);
                showAlert("error", "Lỗi !", "Tạo tài khoản không thành công", "top-end");
            });
    };

    deleteStaff = (staffId) => {
        showConfirmAlert("Xác nhận xóa", "Bạn có chắc chắn muốn xóa nhân viên này không?", "Xóa", "center").then((result) => {
            if (result.isConfirmed) {
                const { selectedCourtId } = this.state;
                const deleteUrl = selectedCourtId ? `/court/${selectedCourtId}/deleteStaffFromCourt/${staffId}` : `/member/delete?userId=${staffId}`;

                axiosInstance
                    .delete(deleteUrl)
                    .then((res) => {
                        if (res.status === 200) {
                            showAlert("success", "", "Đã xóa nhân viên thành công", "top-end");

                            selectedCourtId ? this.fetchStaffWithCourt(selectedCourtId) : this.fetchAllStaff();
                            this.fetchStaffWithCourt();
                        } else {
                            showAlert("error", "Lỗi !", "Xóa nhân viên không thành công", "top-end");
                            console.error("Response không thành công:", res.status);
                        }
                    })
                    .catch((error) => {
                        handleTokenError(error);
                        showAlert("error", "", "Không thể xóa được sân", "top-end");
                    });
            }
        });
    };

    assignCourt = (courtId) => {
        const { selectedStaffId } = this.state;
        axiosInstance
            .post(`/court/${courtId}/add-staff/${selectedStaffId}`)
            .then((res) => {
                this.fetchStaffWithCourt(courtId);
                showAlert("success", "", "Cập nhật sân làm việc cho nhân viên này thành công", "top-end");
                this.fetchAllStaff();
                const updatedStaffs = this.state.staffs.map((staff) => {
                    if (staff.userId === selectedStaffId) {
                        return { ...staff, courtId: courtId };
                    }
                    return staff;
                });
                this.setState({ staffs: updatedStaffs, selectedStaffId: null });
                this.fetchAllStaff();
            })
            .catch((error) => {
                showAlert("error", "", "Nhân viên này đã có trong cơ sở", "top-end");
            });
    };

    handleCourtChange = (e) => {
        const selectedCourtId = e.target.value;
        this.setState({ selectedCourtId });
        if (selectedCourtId) {
            this.fetchStaffWithCourt(selectedCourtId);
        } else {
            this.fetchAllStaff();
        }
    };
    handlePageChange = (pageNumber) => {
        this.setState({ currentPage: pageNumber });
    };
    handleSearchStaff = (e) => {
        this.setState({ searchInput: e.target.value });
    };

    renderStaff = () => {
        const { staffs, currentPage, itemsPerPage, searchInput, selectedCourtId } = this.state;

        const filteredStaffs = staffs.filter((staff) => staff.fullName && staff.fullName.toLowerCase().includes(searchInput.toLowerCase()));

        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentStaffs = filteredStaffs.slice(indexOfFirstItem, indexOfLastItem);

        const renderContent =
            currentStaffs.length > 0 ? (
                currentStaffs.map((staff, index) => (
                    <tr key={staff.userId}>
                        <td className="text-center">{indexOfFirstItem + index + 1}</td>
                        <td>
                            <img className="" src={staff.profileAvatar} style={{ width: 50, height: 50 }} alt="Avatar" />
                        </td>
                        <td className="text-center">
                            <p>{staff.userId}</p>
                        </td>
                        <td>{staff.fullName}</td>
                        <td>{staff.email}</td>
                        <td className="d-flex align-items-center justify-between">
                            <button
                                type="button"
                                className="btn btn-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#modalSelectCourt"
                                onClick={() => this.setState({ selectedStaffId: staff.userId })}
                            >
                                <i className="fa-solid fa-house"></i>
                            </button>
                            <button type="button" className="btn btn-danger ms-2" onClick={() => this.deleteStaff(staff.userId)}>
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="6" className="text-center">
                        Hiện chưa có nhân viên nào trong sân {selectedCourtId ? "này" : "này"}
                    </td>
                </tr>
            );

        return <>{renderContent}</>;
    };

    renderPagination = () => {
        const { staffs, currentPage, itemsPerPage } = this.state;
        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(staffs.length / itemsPerPage); i++) {
            pageNumbers.push(i);
        }

        return (
            <nav>
                <ul className="pagination">
                    {pageNumbers.map((number) => (
                        <li key={number} className={`page-item ${currentPage === number ? "active" : ""}`}>
                            <a onClick={() => this.handlePageChange(number)} className="page-link">
                                {number}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        );
    };
    render() {
        const { newStaff, selectedCourtId, searchInput } = this.state;
        const { managerId } = this.props;

        return (
            <div className="staffManager py-4">
                <div>
                    <div className="d-flex align-items-top-end justify-between">
                        <select onChange={this.handleCourtChange} value={selectedCourtId} className="form-select w-50">
                            <option value="">Tất cả cơ sở</option>
                            {this.state.courts.map((court) => (
                                <option key={court.courtId} value={court.courtId}>
                                    {court.courtName}
                                </option>
                            ))}
                        </select>
                        <div className="w-50 d-flex align-items-top-end justify-end" style={{ height: "100%" }}>
                            <label for="" class="form-label"></label>
                            <input
                                type="text"
                                className="form-control w-50 ms-3"
                                placeholder="Nhập nhân viên cần tìm"
                                value={searchInput}
                                onChange={this.handleSearchStaff}
                            />
                        </div>
                    </div>
                    <button type="button" className="btn btn-primary w-25 my-4" data-bs-toggle="modal" data-bs-target="#exampleModal">
                        Tạo tài khoản nhân viên
                    </button>
                    <div className="overflow-x-auto">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Ảnh</th>
                                    <th>ID</th>
                                    <th className="text-start">Họ và tên</th>
                                    <th className="text-start">Email</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>{this.renderStaff()}</tbody>
                        </table>
                        {this.renderPagination()}
                    </div>

                    {/* modal add nhan vien mới */}
                    <div className="modal fade" id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalLabel">
                                        Tạo tài khoản nhân viên
                                    </h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                                </div>
                                <div className="modal-body">
                                    <form onSubmit={this.createAccountStaff}>
                                        <div className="">
                                            <label htmlFor="nameStaff" className="form-label">
                                                Tên
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control w-100"
                                                name="fullName"
                                                id="nameStaff"
                                                value={newStaff.fullName}
                                                onChange={this.handleChange}
                                                placeholder="Nhập tên nhân viên"
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="emailStaff" className="form-label">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                name="email"
                                                id="emailStaff"
                                                value={newStaff.email}
                                                onChange={this.handleChange}
                                                placeholder="Nhập Email"
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="passwordStaff" className="form-label">
                                                Mật khẩu
                                            </label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                name="password"
                                                id="passwordStaff"
                                                value={newStaff.password}
                                                onChange={this.handleChange}
                                                placeholder="Nhập mật khẩu"
                                                required
                                            />
                                        </div>
                                        <div className="modal-footer">
                                            <button type="submit" className="btn btn-primary">
                                                Tạo tài khoản
                                            </button>
                                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                                Đóng
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* modal chọn sân */}
                    <div className="modal fade" id="modalSelectCourt" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalLabel">
                                        Chọn cơ sở làm việc cho nhân viên
                                    </h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                                </div>
                                <div className="modal-body">
                                    {this.state.courts.map((court) => (
                                        <div
                                            key={court.courtId}
                                            style={{ display: "flex", alignItems: "top-end", justifyContent: "space-between", marginTop: 10 }}
                                        >
                                            <>{court.courtName}</>
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => this.assignCourt(court.courtId)}
                                                data-bs-dismiss="modal"
                                                style={{ height: 30, width: 30 }}
                                            >
                                                +
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
