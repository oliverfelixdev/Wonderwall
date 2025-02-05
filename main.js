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

let svgStrokeAnimations = () => {
    const buttons = document.querySelectorAll('.svgInsideBtn')
    buttons.forEach(button => {
        button.addEventListener("mouseenter", function () {
            const svgPaths = this.querySelectorAll(".svgIcon path");
            gsap.fromTo(svgPaths,
                { strokeDasharray: "80", strokeDashoffset: 100 }, /* from */
                { strokeDasharray: "50, 100, 50, 100", strokeDashoffset: 0, duration: 2, ease: "power4.inOut", } /* to */
            );
        });
    })
}; svgStrokeAnimations();

let hoverImageReveal = () => {
    class HoverImage {
        constructor(element, options) {
            this.el = element;
            this.imgUrl = element.dataset.hoverImg;
            this.img = this.createHoverImage();
            this.imgDimensions = this.getDimensions(this.img);
            this.init();

            this.options = Object.assign({}, {
                maxVel: 20,
                lerp: 0.1,
                base: 0.085,
                delta: 0.0005,
            }, options);

            this.x = 0;
            this.y = 0;
            this.lastX = 0;
            this.lastY = 0;
            this.vel = { x: 0, y: 0 };
            this.lerpVel = { x: 0, y: 0 };
            this.paused = false;
            this.points = this.getPoints();
            this.maskPath = this.getMaskPath();
            this.mask = this.createMask();
            this.render();

        }
        render() {
            if (this.paused === true) return;
            requestAnimationFrame(() => this.render());
            this.vel = {
                x: 100 / this.options.maxVel * clamp(this.x - this.lastX, -this.options.maxVel, this.options.maxVel),
                y: 100 / this.options.maxVel * clamp(this.y - this.lastY, -this.options.maxVel, this.options.maxVel),
            };
            this.lerpVel = {
                x: lerp(this.lerpVel.x, this.vel.x, this.options.lerp),
                y: lerp(this.lerpVel.y, this.vel.y, this.options.lerp),
            }

            this.points = this.getPoints();

            this.maskPath = this.getMaskPath();
            gsap.to(this.mask, {
                attr: { d: this.maskPath }
            });

            const distance = Math.sqrt(Math.pow(this.vel.x, 2) + Math.pow(this.vel.y, 2));
            const scale = Math.min(distance * this.options.delta, 1);
            const angle = (this.vel.x * this.options.delta * 180) / Math.PI;
            gsap.to(this.img, {
                scale: 1 - scale,
                rotate: angle,
            })

            this.lastX = this.x;
            this.lastY = this.y;
        }
        init() {
            this.el.parentElement.addEventListener('mousemove', (e) => {
                if (this.paused === true) return;
                this.x = e.clientX;
                this.y = e.clientY;
                this.move();
            });
            this.el.addEventListener('mouseenter', () => {
                if (this.paused === true) return;
                this.toggleVisibility(this.img, true)
            });
            this.el.addEventListener('mouseleave', () => {
                if (this.paused === true) return;
                this.toggleVisibility(this.img, false)
            });
        }
        createHoverImage() {
            let imageElm = new Image(900);
            imageElm.src = this.imgUrl;
            imageElm.classList.add('hover-image');
            // let the browser rasterize the image and hide it after
            // cause strange behavior where browser dont really load images with opacity set to 0
            imageElm.addEventListener('load', () => {
                imageElm.style.opacity = '0.01';
                this.el.appendChild(imageElm);
                setTimeout(() => {
                    this.toggleVisibility(imageElm, false, 0);
                }, 100);
            });
            return imageElm;
        }
        move() {
            this.imgDimensions = this.getDimensions(this.img)
            const y = this.y - this.imgDimensions.height / 2;
            const x = this.x - this.imgDimensions.width / 2;
            console.log(x, y)
            gsap.to(this.img, {
                y: y,
                x: x,
            });
        }
        createMask() {
            let maskpath = document.querySelector('#hover-image__mask path');
            this.img.style.cssText +=
                '-webkit-clip-path: url(#hover-image__mask);clip-path: url(#hover-image__mask);';
            if (maskpath) return maskpath;

            document.body.insertAdjacentHTML(
                'beforeend',
                `
                <svg height="0" width="0" style="position:absolute;">
                    <!--   https://yqnn.github.io/svg-path-editor/ -->
                    <defs>
                        <clipPath id="hover-image__mask" clipPathUnits="objectBoundingBox">
                            <path
                                d="${this.maskPath}"
                                data-path-normal="${this.maskPath}"
                            />
                        </clipPath>
                    </defs>
                </svg>
                `
            );
            return document.querySelector('#hover-image__mask path');
        }
        toggleVisibility(el, show, duration = null) {
            let time = {};
            if (duration !== null) {
                time = {
                    duration: 0,
                };
            }
            gsap.to(el, {
                opacity: show ? 1 : 0,
                ...time,
            });
        }
        getMaskPath() {
            return `M ${this.options.base} ${this.options.base} C ${this.points.left.top} 0.25 ${this.points.left.bottom} 0.75 ${this.options.base} ${1 - this.options.base} C 0.25 ${this.points.bottom.left} 0.75 ${this.points.bottom.right} ${1 - this.options.base} ${1 - this.options.base} C ${this.points.right.bottom} 0.75 ${this.points.right.top} 0.25 ${1 - this.options.base} ${this.options.base} C 0.75 ${this.points.top.right} 0.25 ${this.points.top.left} ${this.options.base} ${this.options.base} Z`;
        }
        getPoints() {
            return {
                left: {
                    top: this.options.base + (this.options.base / 100 * this.lerpVel.x),
                    bottom: this.options.base + (this.options.base / 100 * this.lerpVel.x),
                },
                bottom: {
                    left: (1 - this.options.base) + (this.options.base / 100 * this.lerpVel.y),
                    right: (1 - this.options.base) + (this.options.base / 100 * this.lerpVel.y),
                },
                right: {
                    bottom: (1 - this.options.base) + (this.options.base / 100 * this.lerpVel.x),
                    top: (1 - this.options.base) + (this.options.base / 100 * this.lerpVel.x),
                },
                top: {
                    right: this.options.base + (this.options.base / 100 * this.lerpVel.y),
                    left: this.options.base + (this.options.base / 100 * this.lerpVel.y),
                },
            };
        }
        getDimensions(el) {
            return { width: el.clientWidth, height: el.clientHeight };
        }
        start() {
            this.paused = false;
            this.render();
        }
        stop() {
            this.paused = true;
        }
    }
    function clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    }
    function lerp(v0, v1, t) {
        return v0 * (1 - t) + v1 * t;
    }
    for (const item of document.querySelectorAll("[data-hover-img]")) {
        new HoverImage(item);
    }

}; hoverImageReveal()