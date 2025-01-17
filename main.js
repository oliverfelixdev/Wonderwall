let swiperAllLanding = () => {
    let swiper = new Swiper(".mySwiper", {
        spaceBetween: 30,
        effect: "fade",
        on: { slideChange: updateNavigationButtons, }
    });

    function updateNavigationButtons () {
        updateButtonState('.el-prev', swiper.isBeginning);
        updateButtonState('.el-next', swiper.isEnd);
    }

    function updateButtonState(selector, condition){
        let button = document.querySelector(selector);
        button.style.opacity = condition ? '0.3' : '1';
        button.style.pointerEvents = condition ? 'none' : 'auto';
    }

    updateNavigationButtons();
    let swiperSlide = document.querySelector('.swiper-slide');
    document.querySelector('.el-prev').addEventListener("click", () => {
        swiper.slidePrev()
    })

    document.querySelector('.el-next').addEventListener("click", () => {
        swiper.slideNext();
    });

}; swiperAllLanding();