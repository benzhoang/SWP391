import React from "react";
import '../../App.css';
import './index.css';

const Banner = ({ scrollToCourtList }) => (
    <section className="banner">
        <div className="banner-intro container">
            <h1>Chào mừng đến với ForBAD</h1>
            <h3>
                Bạn muốn tìm sân để thể hiện đam mê và nâng cao kỹ năng?{" "}
                <span>ForBAD</span> giúp bạn dễ dàng tìm và đặt sân cầu lông tốt
                nhất gần bạn. Dù bạn là người chơi giải trí hay vận động viên thi đấu,
                chúng tôi luôn sẵn sàng phục vụ. Trải nghiệm đặt sân nhanh chóng, linh
                hoạt với các sân chất lượng hàng đầu. Hãy sẵn sàng nâng tầm trận đấu
                của bạn cùng <span>ForBAD</span>.
            </h3>
            <button className="btn-link" onClick={scrollToCourtList}>ĐẶT SÂN NGAY</button>
        </div>
    </section>
);

export default Banner;