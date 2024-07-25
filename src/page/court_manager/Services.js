import React, { Component } from "react";
import axiosInstance from "../../config/axiosConfig";
import { showAlert } from "../../utils/alertUtils";
import { handleTokenError } from "../../utils/tokenErrorHandle";

export default class Services extends Component {
    state = {
        services: [],
        selectedServices: [],
        selectedCourt: "",
        selectedCourtName: "",
        courts: [],
        facilityOfCourt: [],
    };

    componentDidMount() {
        this.fetchServices();
        this.fetchCourts();
    }

    fetchCourts = () => {
        axiosInstance
            .get("/court/courts-of-owner")
            .then((res) => {
                if (res.status === 200) {
                    this.setState({ courts: res.data }, () => {
                        // Set selectedCourt to the first court in the list and fetch its services
                        if (this.state.courts.length > 0) {
                            const firstCourt = this.state.courts[0];
                            this.setState({
                                selectedCourt: firstCourt.courtId,
                                selectedCourtName: firstCourt.courtName,
                            });
                            this.renderServicesInCourt(firstCourt.courtId);
                        }
                    });
                } else {
                    showAlert("error", "Lỗi !", "Không lấy được dữ liệu", "top-end");
                    console.error("Response không thành công:", res.status);
                }
            })
            .catch((error) => {
                this.handleRequestError(error);
            });
    };

    fetchServices = () => {
        axiosInstance
            .get("/facility/all")
            .then((res) => {
                if (res.status === 200) {
                    this.setState({ services: res.data });
                } else {
                    showAlert("error", "Lỗi !", "Không lấy được dữ liệu", "top-end");
                    console.error("Response không thành công:", res.status);
                }
            })
            .catch((error) => {
                this.handleRequestError(error);
            });
    };

    handleCourtChange = (event) => {
        const courtId = event.target.value;
        const courtName = event.target.options[event.target.selectedIndex].text;
        this.setState({
            selectedCourt: courtId,
            selectedCourtName: courtName,
            selectedServices: [],
        });

        this.renderServicesInCourt(courtId);
    };

    handleActionSelectServices = (facilityId) => {
        const { selectedCourt } = this.state;
        const isFacilityInCourt = this.state.facilityOfCourt.some((facility) => facility.facilityId === facilityId);

        if (isFacilityInCourt) {
            axiosInstance
                .delete(`/court/${selectedCourt}/deleteFacilityFromCourt/${facilityId}`)
                .then((res) => {
                    if (res.status === 200) {
                        showAlert("success", "Thành công", "Đã xóa dịch vụ khỏi sân", "top-end");
                        this.setState((prevState) => ({
                            facilityOfCourt: prevState.facilityOfCourt.filter((facility) => facility.facilityId !== facilityId),
                        }));
                    } else {
                        showAlert("error", "Lỗi !", "Không thể xóa dịch vụ", "top-end");
                        console.error("Response không thành công:", res.status);
                    }
                })
                .catch((error) => {
                    this.handleRequestError(error);
                });
        } else {
            axiosInstance
                .post(`/court/${selectedCourt}/addFacilityToCourt/${facilityId}`)
                .then((res) => {
                    if (res.status === 200) {
                        showAlert("success", "Thành công", "Đã thêm dịch vụ vào sân", "top-end");
                        this.renderServicesInCourt(selectedCourt);
                    } else {
                        showAlert("error", "Lỗi !", "Không thể thêm dịch vụ", "top-end");
                        console.error("Response không thành công:", res.status);
                    }
                })
                .catch((error) => {
                    this.handleRequestError(error);
                });
        }

        // Update selected services state
        this.setState((prevState) => ({
            selectedServices: prevState.facilityOfCourt.map((facility) => facility.facilityId),
        }));
    };

    renderServices = () => {
        const { facilityOfCourt } = this.state;
        return this.state.services.map((service) => {
            const isFacilityInCourt = facilityOfCourt.some((facility) => facility.facilityId === service.facilityId);

            return (
                <div
                    key={service.facilityId}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "10px",
                        justifyContent: "space-between",
                        backgroundColor: isFacilityInCourt ? "#000" : "#f5f5f5",
                        color: isFacilityInCourt ? "#fff" : "#000",
                        padding: "5px 0",
                    }}
                >
                    <div className="servicesItem">
                        <p style={{ margin: "0 10px 0 0" }}>
                            <i className={service.facilityIcon} style={{ marginRight: "20px" }} />
                            {service.facilityName}
                        </p>
                    </div>
                    <div>
                        <button onClick={() => this.handleActionSelectServices(service.facilityId)}>
                            {isFacilityInCourt ? <i className="fa-solid fa-minus"></i> : <i className="fa-solid fa-plus"></i>}
                        </button>
                    </div>
                </div>
            );
        });
    };

    renderServicesInCourt = (selectedCourtId) => {
        axiosInstance
            .get(`/court/facilities-of-court/${selectedCourtId}`)
            .then((res) => {
                if (res.status === 200) {
                    this.setState({ facilityOfCourt: res.data });
                } else {
                    showAlert("error", "Lỗi !", "Không lấy được dữ liệu", "top-end");
                    console.error("Response không thành công:", res.status);
                }
            })
            .catch((error) => {
                this.handleRequestError(error);
            });
    };

    handleRequestError = (error) => {
        let errorMessage = "Có lỗi xảy ra khi lấy dữ liệu";
        if (error.response) {
            if (error.response.status === 401 && error.response.data.message === "Token không hợp lệ hoặc đã hết hạn.") {
                handleTokenError();
                errorMessage = "Token không hợp lệ hoặc đã hết hạn.";
            } else {
                errorMessage = error.response.data.message || errorMessage;
            }
        }
        showAlert("error", "Lỗi !", errorMessage, "top-end");
        console.error("Request error:", error);
    };

    render() {
        return (
            <div className="services-for-court">
                <h3 className="text-center">Quản lý danh sách dịch vụ trong các cơ sở</h3>
                <div className="form-group">
                    <select id="courtSelect" className="form-control w-50 m-auto" onChange={this.handleCourtChange}>
                        {this.state.courts.map((court) => (
                            <option key={court.courtId} value={court.courtId} className="">
                                {court.courtName}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="list-services w-50 m-auto" style={{ fontSize: "20px" }}>
                    {this.renderServices()}
                </div>
            </div>
        );
    }
}
