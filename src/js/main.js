isAuthorization();
localStorage = window.localStorage;

$(document).ready(function () {
    toggleAccountForms();
    removeClassOnResize();
    initStarRating();
    initValidator();
    initDataTable();
    initScrollUp();
    initSlider();
    initEvents();

    $('g.reservation-table').mouseover(function (event) {
        var tooltipContainer = document.getElementById('tooltip-container');
        tooltipContainer.style.display = 'inline-block';
        var left, right, top, arrowLeft, arrowTop;
        var element = event.currentTarget.getBoundingClientRect();
        var elementTop = element.top;
        var elementLeft = element.left;
        var cssLeft = elementLeft + (element.width - tooltipContainer.offsetWidth) / 2;
        const rightOffset = cssLeft + tooltipContainer.offsetWidth;
        var cssTop = elementTop - tooltipContainer.offsetHeight - 7;
        const cssArrowLeft = elementLeft + (element.width - 8) / 2;
        var cssArrowTop = elementTop - 11;
        if (cssLeft < 0) {
            cssLeft = 10;
        }
        if (cssTop < 0) {
            cssTop = elementTop + element.offsetHeight + 7;
            cssArrowTop = elementTop + element.offsetHeight + 3;
        }
        if (document.body.offsetWidth < rightOffset) {
            cssLeft = 'auto';
            right = '10px';
        }
        left = (typeof cssLeft === 'number') ? +cssLeft + 'px' : cssLeft;
        top = cssTop + 'px';
        arrowLeft = cssArrowLeft + 'px';
        arrowTop = cssArrowTop + 'px';
        tooltipContainer.style.top = top;
        tooltipContainer.style.left = left;
        tooltipContainer.style.right = right;
        var arrow = document.getElementById('tooltip-container__arrow');
        arrow.style.top = arrowTop;
        arrow.style.left = arrowLeft;
    });

    $('g.reservation-table').mouseout(function (event) {
        var tooltipContainer = document.getElementById('tooltip-container');
        tooltipContainer.style.display = 'none';
    });

    //Header change background-color on page scroll
    $(window).on("scroll", function () {
        if ($(window).scrollTop() > 50) {
            $(".header").addClass("scrolled");
            $(".Menu__link").addClass("scroll");
        } else {
            $(".header").removeClass("scrolled");
            $(".Menu__link").removeClass("scroll");
        }
    });

    //Prevent map scrolling on hover
    $(".map-container").click(function () {
        $(this).find("iframe").addClass("clicked");
    }).mouseleave(function () {
        $(this).find("iframe").removeClass("clicked");
    });

    // JSsocials plugin
    jsSocials.shares.weibo = {
        label: "Share",
        logo: "fa fa-weibo",
        shareUrl: "http://service.weibo.com/share/share.php?url={url}&appkey=&title={text}&pic=&ralateUid=",
        countUrl: "",
        shareIn: "blank",
        css: "weibo-link",
        getCount: function (data) {
            return data.count;
        }
    };

    $("#share").jsSocials({
        shares: ["email", "twitter", { share: "facebook", label: "Share" }, "googleplus", "linkedin", "pinterest", "stumbleupon", "whatsapp", "weibo"]
    });
});

function isAuthorization() {
    var accountHref = "http://localhost:3000/Account.html";
    if (window.location.href !== accountHref) {
        if (!localStorage.getItem("Token")) {
            window.location = accountHref;
        }
    }
}

function toggleAccountForms() {
    $(".log-in").click(function () {
        $(".signIn").addClass("active-dx");
        $(".signUp").addClass("inactive-sx");
        $(".signUp").removeClass("active-sx");
        $(".signIn").removeClass("inactive-dx");
    });

    $(".back").click(function () {
        $(".signUp").addClass("active-sx");
        $(".signIn").addClass("inactive-dx");
        $(".signIn").removeClass("active-dx");
        $(".signUp").removeClass("inactive-sx");
    });
}

function initValidator() {
    //form validation plugin
    $("form[name='contact-form']").validate({
        rules: {
            name: {
                required: true,
                minlength: 2
            },
            email: {
                required: true,
                email: true
            },
            subject: {
                required: true,
                minlength: 5
            },
            message: {
                required: true
            },
            number: {
                required: true,
                minlength: 10
            },
            date: {
                required: true
            }
        },
        messages: {
            name: {
                required: "Please enter your name",
                minlength: "Your name is too short"
            },
            email: {
                required: "Please enter your email",
                email: "Please enter your valid email"
            },
            subject: {
                required: "Please provide a subject",
                minlength: "Your subject must be at least 10 characters long"
            },
            message: {
                required: "Please provide your message"
            },
            number: {
                required: "Please, enter your valid phone number",
                minlength: "Your phone number is to short"
            },
            date: {
                required: "Please, choose convenient date and time for call"
            }
        },
        submitHandler: function (form) {
            if (!isValidForm("#contact-form")) return;
            var settings = {
                "async": true,
                "crossDomain": true,
                "url": "http://localhost:54334/api/ContactUs",
                "method": "POST",
                "headers": {
                    "content-type": "application/json",
                    "cache-control": "no-cache"
                },
                "data": JSON.stringify(formToObject("#contact-form")),
                "beforeSend": function (xhr) {
                    var Token = localStorage.getItem("Token");
                    xhr.setRequestHeader("Authorization", "Bearer " + Token);
                }
            }
            $.ajax(settings).done(function (response) {
                toastr.success("Повідомлення успішно надіслане");
                clearFormInputs($("form[name='contact-form']"));
            }).fail(function (xhr) {
                toastr.error("Виникли помилки під час надсилання даних!");
            });
        }
    });

    $("form[name='signUp']").submit(function (e) {
        e.preventDefault();
        if (!isValidForm("form.signUp")) return;
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://localhost:54334/api/Account/Registration",
            "method": "POST",
            "headers": {
                "content-type": "application/json",
                "cache-control": "no-cache"
            },
            "data": JSON.stringify(formToObject("form.signUp"))
        }
        $.ajax(settings).done(function (response) {
            clearFormInputs($("form[name='signUp']"));
            toastr.success(response);
        }).fail(function (xhr) {
            if (xhr.status === 400) {
                toastr.error("Помилка реєстрації! Будь ласка, введіть валідні дані.");
                return;
            }
            toastr.error(xhr.responseText);
        });
    });

    $("form[name='signIn']").submit(function (e) {
        e.preventDefault();
        if (!isValidForm("form.signIn")) return;
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://localhost:54334/api/Account/Token",
            "method": "POST",
            "headers": {
                "content-type": "application/json",
                "cache-control": "no-cache"
            },
            "data": JSON.stringify(formToObject("form.signIn"))
        }
        $.ajax(settings).done(function (response) {
            toastr.success("Вітаємо! Ви успішно авторизувалися.");
            localStorage.setItem("Token", response.Token);
            localStorage.setItem("ExpirationTime", response.ExpirationTime);
            setTimeout(function () {
                window.location = "http://localhost:3000/index.html";
                clearFormInputs($("form[name='signIn']"));
            }, 500);
        }).fail(function (xhr) {
            if (xhr.status === 404) {
                toastr.error(xhr.responseText);
                return;
            }
            toastr.error("Виникли помилки під час авторизації!");
        });
    });
};

function isValidForm(queryString) {
    var isValidForm = true;
    var formObj = formToObject(queryString);
    Object.keys(formObj).map(function (objectKey, index) {
        if (formObj[objectKey] === '') {
            isValidForm = false;
            return;
        }
    });
    return isValidForm;
}

function formToObject(queryString) {
    var config = {};
    $(queryString).serializeArray().map(function (item) {
        if (config[item.name]) {
            if (typeof (config[item.name]) === "string") {
                config[item.name] = [config[item.name]];
            }
            config[item.name].push(item.value);
        } else {
            config[item.name] = item.value;
        }
    });
    return config;
}

function clearFormInputs(target) {
    target.find(":input").val("");
}

function initSlider() {
    $(".bxslider").bxSlider({
        nextSelector: "#slider-next",
        prevSelector: "#slider-prev",
        pagerCustom: "#bx-pager",
        controls: true,
        pager: true,
        nextText: "<img src='/Images/interface-arrow_right.svg' height='30' width='30'/>",
        prevText: "<img src='/Images/interface-arrow_left.svg' height='30' width='30'/>"
    });
}

function initScrollUp() {
    $.scrollUp({
        scrollImg: true
    });
}

function initEvents() {
    $("#inlineRadio2").change(function () {
        if ($(this).prop("checked")) {
            $("#request-data").slideDown();
        } else {
            $("#request-data").slideUp();
        }
    });

    $("#inlineRadio1").change(function () {
        if ($("#inlineRadio1").prop("checked")) {
            $("#request-data").slideUp();
        }
    });
}

function initDataTable() {
    $("#menu-table").DataTable({
        ajax: {
            url: "http://localhost:54334/api/PriceList/GetAllPrices",
            dataSrc: "",
            beforeSend: function (xhr) {
                var Token = localStorage.getItem("Token");
                xhr.setRequestHeader("Authorization", "Bearer " + Token);
            }
        },
        columns: [
            { data: "dish" },
            { data: "ingredients" },
            { data: "weight" },
            { data: "price" }
        ]
    });
}

function initStarRating() {
    var __slice = [].slice;

    (function ($, window) {
        var Starrr;

        Starrr = (function () {
            Starrr.prototype.defaults = {
                rating: void 0,
                numStars: 5,
                change: function (e, value) { }
            };

            function Starrr($el, options) {
                var i, _, _ref,
                    _this = this;

                this.options = $.extend({}, this.defaults, options);
                this.$el = $el;
                _ref = this.defaults;
                for (i in _ref) {
                    _ = _ref[i];
                    if (this.$el.data(i) != null) {
                        this.options[i] = this.$el.data(i);
                    }
                }
                this.createStars();
                this.syncRating();
                this.$el.on("mouseover.starrr", "i", function (e) {
                    return _this.syncRating(_this.$el.find("i").index(e.currentTarget) + 1);
                });
                this.$el.on("mouseout.starrr", function () {
                    return _this.syncRating();
                });
                this.$el.on("click.starrr", "i", function (e) {
                    return _this.setRating(_this.$el.find("i").index(e.currentTarget) + 1);
                });
                this.$el.on("starrr:change", this.options.change);
            }

            Starrr.prototype.createStars = function () {
                var _i, _ref, _results;

                _results = [];
                for (_i = 1, _ref = this.options.numStars; 1 <= _ref ? _i <= _ref : _i >= _ref; 1 <= _ref ? _i++ : _i--) {
                    _results.push(this.$el.append("<i class='fa fa-star-o'></i>"));
                }
                return _results;
            };

            Starrr.prototype.setRating = function (rating) {
                if (this.options.rating === rating) {
                    rating = void 0;
                }
                this.options.rating = rating;
                this.syncRating();
                return this.$el.trigger("starrr:change", rating);
            };

            Starrr.prototype.syncRating = function (rating) {
                var i, _i, _j, _ref;

                rating || (rating = this.options.rating);
                if (rating) {
                    for (i = _i = 0, _ref = rating - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
                        this.$el.find("i").eq(i).removeClass("fa-star-o").addClass("fa-star");
                    }
                }
                if (rating && rating < 5) {
                    for (i = _j = rating; rating <= 4 ? _j <= 4 : _j >= 4; i = rating <= 4 ? ++_j : --_j) {
                        this.$el.find("i").eq(i).removeClass("fa-star").addClass("fa-star-o");
                    }
                }
                if (!rating) {
                    return this.$el.find("i").removeClass("fa-star").addClass("fa-star-o");
                }
            };

            return Starrr;

        })();
        return $.fn.extend({
            starrr: function () {
                var args, option;

                option = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
                return this.each(function () {
                    var data;

                    data = $(this).data("star-rating");
                    if (!data) {
                        $(this).data("star-rating", (data = new Starrr($(this), option)));
                    }
                    if (typeof option === "string") {
                        return data[option].apply(data, args);
                    }
                });
            }
        });
    })(window.jQuery, window);

    $(function () {
        return $(".starrr").starrr();
    });

    var slideIds = [
        "#stars",
        "#stars1",
        "#stars2"
    ];

    for (var i = 0; i < slideIds.length; i++) {
        $(slideIds[i]).on("starrr:change", function (e, value) {
            $("#count").html(value);
        });
    }
}

function removeClassOnResize() {
    $(window).on("resize", function () {
        var windowSize = $(window).width();

        if (windowSize < 992) {
            $(".img-div").removeClass("hvr-curl-bottom-left");
        } else {
            $(".img-div").addClass("hvr-curl-bottom-left");
        }
    });
}

function logout() {
    localStorage.removeItem("Token");
    localStorage.removeItem("ExpirationTime");
    window.location = "http://localhost:3000/Account.html";
}
