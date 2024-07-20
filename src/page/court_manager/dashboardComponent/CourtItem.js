import React, { Component } from "react";
import axiosInstance from "../../../config/axiosConfig";

export default class CourtItem extends Component {
    state = {
        courts: [],
    };

    componentDidMount() {
        this.fetchCourts();
    }

    fetchCourts = () => {
        axiosInstance
            .get("/court/courts-of-owner")
            .then((res) => {
                if (res.status === 200) {
                    this.setState({ courts: res.data });
                } else {
                    this.setState({ courts: [] });
                }
            })
            .catch((error) => {
                console.error("Error fetching courts:", error);
                this.setState({ courts: [] });
            });
    };

    render() {
        return (
            <div>
                <div className="">
                    {this.state.courts.map((court) => (
                        <div
                            className="d-flex my-3"
                            key={court.courtId}
                            style={{
                                alignItems: "center",
                                justifyContent: "space-between",
                                boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                                padding: 10,
                            }}
                        >
                            <div className="imgCourt w-12">
                                <img src={court.imageUrl}></img>
                            </div>
                            <div className="courtName">{court.courtName}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}
