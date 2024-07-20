import React, { Component } from "react";
import Header from "../../components/header";
import Footer from "../../components/footer";
import Banner from "../../components/banner";
import "../guest/index.css";
import CourtList from "../../components/court-list";
import "../../App.css";

class GuestPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: false,
            user: {
                username: "",
                avatar: "",
                roles: [],
            },
        };
    }

    componentDidMount() {
        const user = JSON.parse(localStorage.getItem("user"));

        if (user) {
            this.setState({
                isLoggedIn: true,
                user: {
                    username: user.fullName,
                    avatar: user.imageUrl,
                    roles: user.roles,
                },
            });
        }
    }

    handleLogout = () => {
        localStorage.removeItem("user");

        this.setState({
            isLoggedIn: false,
            user: {
                username: "",
                avatar: "",
                roles: [],
            },
        });

        window.location.href = "/";
    };

    scrollToCourtList = () => {
        const courtListSection = document.getElementById("court-list");
        if (courtListSection) {
            courtListSection.scrollIntoView({ behavior: "smooth" });
        }
    };

    handleSearchChange = (event) => {
        this.setState({ searchKeyword: event.target.value });
    };

    render() {
        const { isLoggedIn, user } = this.state;

        return (
            <div className="GuestPage">
                <section className="header">
                    <Header isLoggedIn={isLoggedIn} user={user} handleLogout={this.handleLogout} />
                </section>
                <Banner scrollToCourtList={this.scrollToCourtList} />
                <CourtList /> {/* Truyền searchKeyword vào CourtList */}
                <Footer />
            </div>
        );
    }
}

export default GuestPage;
