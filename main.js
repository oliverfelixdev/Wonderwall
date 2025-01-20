let SwiperLnNHeadMn = () => {
    // SWIPER MAIN - SLIDE CONFIGURATION
    let swiper = new Swiper(".mySwiper", {
        spaceBetween: 30,
        effect: "fade",
        slidesPerView: 1,
        on: {
            slideChange: function () {
                updateNavigationButtons();
                updateSlideNumber(this)
                splitTextIntoSpans()
            },

            init: function () {
                updateSlideNumber(this);
            }
        }
    });

    function updateNavigationButtons() {
        updateButtonState('.el-prev', swiper.isBeginning);
        updateButtonState('.el-next', swiper.isEnd);
    }

    function updateButtonState(selector, condition) {
        let button = document.querySelector(selector);
        button.style.opacity = condition ? '0.5' : '1';
        button.style.pointerEvents = condition ? 'none' : 'auto';
    }

    function updateSlideNumber(swiper) {
        const currentSlide = swiper.realIndex + 1;
        const totalSlide = swiper.slides.length

        document.querySelector('.current-slide').textContent = currentSlide;
        document.querySelector('.total-slide').textContent = totalSlide

    }

    updateNavigationButtons();
    let swiperSlide = document.querySelector('.swiper-slide');
    document.querySelector('.el-prev').addEventListener("click", () => {
        swiper.slidePrev()
    })

    document.querySelector('.el-next').addEventListener("click", () => {
        swiper.slideNext();
    });

    // MAIN TITLE ANIMATION ON EACH SLIDE
    function splitTextIntoSpans() {
        const titleMain = document.querySelectorAll('.title-main')

        titleMain.forEach((elem) => {
            let clutter = ""
            let titleMainText = elem.textContent
            let splittedText = titleMainText.split("");
            splittedText.forEach((char) => {
                clutter += `<span>${char}</span>`
            })

            elem.innerHTML = clutter;

        });

        gsap.fromTo(".title-main span",
            { y: 75 },
            { stagger: 0.02, y: 0, duration: .8, ease: "power4.out", })

    };
    splitTextIntoSpans();

}; SwiperLnNHeadMn();