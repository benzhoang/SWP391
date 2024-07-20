import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../../../config/axiosConfig";

export default function NewCourtItem() {
    const [courts, setCourts] = useState([]);

    const getRatingColor = (rating) => {
        if (rating >= 4.5) {
            return "lightgreen";
        } else if (rating >= 4.0) {
            return "lightblue";
        } else if (rating >= 3.5) {
            return "lightgoldenrodyellow";
        } else {
            return "lightcoral";
        }
    };

    const fetchCourts = () => {
        axiosInstance
            .get("/court/all")
            .then((res) => {
                if (res.status === 200) {
                    setCourts(res.data);
                } else {
                    setCourts([]);
                }
            })
            .catch((error) => {
                console.error("Error fetching courts:", error);
                setCourts([]);
            });
    };

    useEffect(() => {
        fetchCourts();
    }, []);

    return (
        <div className="">
            {courts.slice(-5).map((court) => (
                <div
                    key={court.courtId}
                    className="newCourt-body-item"
                    style={{ margin: "5px", padding: "5px", border: "1px solid #ccc", borderRadius: "5px" }}
                >
                    <div className="newCourt-body-right" style={{ display: "flex", alignItems: "center" }}>
                        <div className="newCourt-avatar" style={{ marginRight: "10px" }}>
                            <img src={court.imageUrl} alt="Court Avatar" style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
                        </div>
                        <div className="newCourt-body-infoCourt">
                            <div className="newCourt-fullName" style={{ fontWeight: "bold" }}>
                                {court.courtName}
                            </div>
                            <div className="newCourt-address" style={{ color: "gray" }}>
                                {court.address}
                            </div>
                        </div>
                    </div>
                    <div
                        className="newCourt-rating"
                        style={{
                            backgroundColor: getRatingColor(court.rating),
                            padding: "5px 10px",
                            borderRadius: "5px",
                            textAlign: "center",
                            marginTop: "10px",
                        }}
                    >
                        {court.rating} ⭐
                    </div>
                </div>
            ))}
        </div>
    );
}
