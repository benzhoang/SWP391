import React, { Component } from "react";
import "./booking.css";
import axiosInstance from "../../../config/axiosConfig";
import { showAlert } from "../../../utils/alertUtils";
export default class selectedCourt extends Component {
    state = {
        facilities: [],
    };

    componentDidMount() {
        const { court } = this.props;

        // Example API call to fetch amenities for a court
        axiosInstance
            .get(`court/facilities-of-court/${court.courtId}`)
            .then((response) => {
                this.setState({ facilities: response.data });
            })
            .catch((error) => {
                console.error("There was an error fetching the facilities!", error);
            });
    }

    render() {
        const { court } = this.props;
        const { facilities } = this.state;

        if (!court) {
            return <div>No court information available</div>;
        }

        return (
            <div>
                <section className="detail-yard">
                    <h1 className="text-center" style={{ fontSize: 40 }}>
                        THÔNG TIN CHI TIẾT
                    </h1>
                    <h1>{court.courtName}</h1>
                    <div className="detail-yard-title">
                        <div className="address">
                            <p>
                                <i className="fa-solid fa-location-dot" /> Địa chỉ:
                                <span> {court.address}</span>
                            </p>
                        </div>
                    </div>
                    <div className="detail-yard-info row">
                        <div className="yard-left col-md-6">
                            <h3>Thông tin sân</h3>
                            <p>
                                Số sân: <span>{court.yards.length}</span>
                            </p>
                            <p>
                                Giờ hoạt động:{" "}
                                <span>
                                    {court.openTime} - {court.closeTime}
                                </span>
                            </p>
                            <div className="yard-service row">
                                <h4>Dịch vụ tiện ích</h4>
                                {facilities.length > 0 ? (
                                    facilities.map((facility, index) => (
                                        <div className=" nameServices col-md-6" key={index}>
                                            <i className={`fa-solid ${facility.facilityIcon}`} /> {facility.facilityName}
                                        </div>
                                    ))
                                ) : (
                                    <p>Trống</p>
                                )}
                            </div>
                        </div>
                        <div className="yard-right col-md-6">
                            <img className="h-100" src={court.imageUrl} alt />
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}
