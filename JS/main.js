let SwiperLnNHeadMn = () => {
    // SWIPER MAIN - SLIDE CONFIGURATION
    let swiper = new Swiper(".mySwiper", {
        spaceBetween: 30,
        effect: "fade",
        slidesPerView: 1,
        on: {
            slideChange: function () {
                updateNavigationButtons();
                updateSlideNumber(this);
                splitTextIntoSpans();
                animateSlide(this);
            },
            init: function () {
                updateSlideNumber(this);
                animateSlide(this);
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
        const totalSlide = swiper.slides.length;

        document.querySelector('.current-slide').textContent = currentSlide;
        document.querySelector('.total-slide').textContent = totalSlide;
    }
    updateNavigationButtons();

    document.querySelector('.el-prev').addEventListener("click", () => {
        swiper.slidePrev();
    });
    document.querySelector('.el-next').addEventListener("click", () => {
        swiper.slideNext();
    });
    // MAIN TITLE ANIMATION ON EACH SLIDE
    function splitTextIntoSpans() {
        const titleMain = document.querySelectorAll('.title-main');

        titleMain.forEach((elem) => {
            let clutter = "";
            let titleMainText = elem.textContent;
            let splittedText = titleMainText.split("");
            splittedText.forEach((char) => {
                clutter += `<span>${char}</span>`;
            });

            elem.innerHTML = clutter;
        });

        gsap.fromTo(
            ".title-main span",
            { y: 75 },
            { stagger: 0.02, y: 0, duration: 0.8, ease: "power4.out" }
        );
    }
    splitTextIntoSpans();
    // ZOOM & FADE ANIMATION
    function animateSlide(swiper) {
        let slides = document.querySelectorAll('.swiper-slide img');

        slides.forEach((slide, index) => {
            if (index === swiper.realIndex) {
                gsap.fromTo(slide,
                    { scale: 1.1, opacity: .8 },
                    { scale: 1, opacity: 1, duration: 1, ease: "expo.out", }
                );
            }
        });
    }
}; SwiperLnNHeadMn();

let svgStrokeAnimations = () => {
    const buttons = document.querySelectorAll('.svgInsideBtn');
    buttons.forEach(button => {
        button.addEventListener("mouseenter", function () {
            const svgPaths = this.querySelectorAll(".svgIcon path");
            let tl = gsap.timeline({ repeat: 0 });
            tl.fromTo(svgPaths,
                { strokeDasharray: "80", strokeDashoffset: 100 },
                { strokeDasharray: "50, 100, 50, 100", strokeDashoffset: 0, duration: 2, ease: "slow(0.7,0.7,false)", }
            );
        });

    });
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
            const angle = (this.vel.x * this.options.delta * 0) / Math.PI; // !!!!!!!!!!!!!!!!!!!!!!! THIS IS TILT/ROTATE CONFIGURATION HERE
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

}; hoverImageReveal();

let showVideoConfig = () => {
    let cnstrctrVidCntrls = document.querySelector(".constructorVideoControls");
    let cnstrctrVideo = document.querySelector(".constructor_video");

    cnstrctrVidCntrls.addEventListener("click", () => {
        cnstrctrVidCntrls.style.display = "none"
        cnstrctrVideo.play();
    })

    cnstrctrVideo.addEventListener("click", () => {
        cnstrctrVideo.pause();
        cnstrctrVidCntrls.style.display = "flex"
        cnstrctrVideo.load();
    })

    cnstrctrVideo.addEventListener("contextmenu", e => {
        e.preventDefault();
    })

}; showVideoConfig();

let s4SldiderSwprConfig = () => {
    var swiper = new Swiper(".s4-mySwiper", {
        slidesPerView: 3,
        spaceBetween: 30,
        freeMode: true,
        grab: true
    });
}; s4SldiderSwprConfig();

let s4TrailImageEffect = () => {
    {
        const container = document.querySelector(".instagram-main");
        if (!container) return;

        const MathUtils = {
            lerp: (a, b, n) => (1 - n) * a + n * b,
            distance: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
        };

        const getMousePos = (ev) => {
            let posx = ev.clientX - container.getBoundingClientRect().left;
            let posy = ev.clientY - container.getBoundingClientRect().top;
            return { x: posx, y: posy };
        };

        let mousePos = { x: 0, y: 0 }, lastMousePos = { x: 0, y: 0 }, cacheMousePos = { x: 0, y: 0 };

        container.addEventListener("mousemove", (ev) => (mousePos = getMousePos(ev)));

        const getMouseDistance = () =>
            MathUtils.distance(mousePos.x, mousePos.y, lastMousePos.x, lastMousePos.y);

        class Image {
            constructor(el) {
                this.DOM = { el: el };
                this.defaultStyle = { scale: 1, x: 0, y: 0, opacity: 0 };
                this.getRect();
            }

            getRect() {
                this.rect = this.DOM.el.getBoundingClientRect();
            }
            isActive() {
                return gsap.getTweensOf(this.DOM.el).length > 0 || this.DOM.el.style.opacity != 0;
            }
        }

        class ImageTrail {
            constructor() {
                this.DOM = { content: container.querySelector(".s4-content") };
                this.images = [];
                [...this.DOM.content.querySelectorAll("img")].forEach((img) =>
                    this.images.push(new Image(img))
                );
                this.imagesTotal = this.images.length;
                this.imgPosition = 0;
                this.zIndexVal = 1;
                this.threshold = 100;
                requestAnimationFrame(() => this.render());
            }

            render() {
                let distance = getMouseDistance();
                cacheMousePos.x = MathUtils.lerp(cacheMousePos.x || mousePos.x, mousePos.x, 0.1);
                cacheMousePos.y = MathUtils.lerp(cacheMousePos.y || mousePos.y, mousePos.y, 0.1);

                if (distance > this.threshold) {
                    this.showNextImage();
                    ++this.zIndexVal;
                    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
                    lastMousePos = mousePos;
                }

                let isIdle = true;
                for (let img of this.images) {
                    if (img.isActive()) {
                        isIdle = false;
                        break;
                    }
                }
                if (isIdle && this.zIndexVal !== 1) {
                    this.zIndexVal = 1;
                }
                requestAnimationFrame(() => this.render());
            }

            showNextImage() {
                const img = this.images[this.imgPosition];
                gsap.killTweensOf(img.DOM.el);

                gsap.timeline()
                    .set(img.DOM.el, {
                        opacity: 1,
                        scale: 1,
                        zIndex: this.zIndexVal,
                        x: cacheMousePos.x - img.rect.width / 2,
                        y: cacheMousePos.y - img.rect.height / 2
                    })
                    .to(img.DOM.el, { duration: 0.9, ease: "expo.out", x: mousePos.x - img.rect.width / 2, y: mousePos.y - img.rect.height / 2 })
                    .to(img.DOM.el, { duration: 1, ease: "power1.out", opacity: 0 }, 0.4)
                    .to(img.DOM.el, { duration: 1, ease: "quint.out", scale: 0.2 }, 0.4);
            }
        }

        const preloadImages = () => {
            return new Promise((resolve) => {
                imagesLoaded(container.querySelectorAll(".s4-content__img"), resolve);
            });
        };

        preloadImages().then(() => {
            new ImageTrail();
        });
    }
}; s4TrailImageEffect();


// Initialize Lenis
const lenis = new Lenis();

// Use requestAnimationFrame to continuously update the scroll
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);