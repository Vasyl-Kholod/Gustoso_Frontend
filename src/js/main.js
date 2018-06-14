isAuthorization();
localStorage = window.localStorage;
calendarIndex = 0;
selectedDate = null;
selectedTable = null;
reservationList = [];

window.url = '';
// window.url = 'http://localhost:3000';

$(document).ready(function () {
    toggleAccountForms();
    removeClassOnResize();
    initStarRating();
    initReservationFormValidator();
    initValidator();
    initDataTable();
    initScrollUp();
    initSlider();
    initEvents();
    initHanddleClickByDay();
    getActiveReservation();

    $('.timepicker-input').bootstrapMaterialDatePicker({ date: false, format: 'HH:mm' });
    $('i.icon-chevron-left').addClass('not-active');
    selectedDate = $('#calendar_header > h1').text().split(' ').reverse();
    selectedDate.push(+$('.today').addClass('active').text());
    convertStringToIntMonth(selectedDate[1]);

    $('#calendar_header > i').click(function (e) {
        if ($(this).hasClass('icon-chevron-right')) {
            ++calendarIndex;
            if (calendarIndex === 2) {
                $('i.icon-chevron-right').addClass('not-active');
            }
            $('i.icon-chevron-left').removeClass('not-active');
        } else {
            --calendarIndex;
            if (calendarIndex === 0) {
                selectedDate = +$('.today').addClass('active').text();
                $('i.icon-chevron-left').addClass('not-active');
            }
            $('i.icon-chevron-right').removeClass('not-active');
        }
        initHanddleClickByDay();
        markNotActiveDays();
    });

    markNotActiveDays();

    $('g.reservation-table').mouseover(function (event) {
        var tooltipContainer = document.getElementById('tooltip-container');
        const resList = reservationList.filter(r => r.tableNumber === +event.currentTarget.getAttribute('number-table'));
        if (resList.length) {
            $('#tooltip-container > h4').text('Reserved');
            resList.forEach(element => {
                $('#tooltip-container > div:last-child').append('<div>' + moment(element.dateOfReservation).format('HH:mm') + '</div>');                
            });       
        } else {
            $('#tooltip-container > h4').text('Not reserved');
        }
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
        $('#tooltip-container > div:last-child').empty();
    });

    $('g.reservation-table').click(function (e) {
        $('.timepicker-input').val(null);
        $('.reservation-input').val(null);
        selectedTable = +e.currentTarget.getAttribute('number-table');
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

function markNotActiveDays() {
    if (calendarIndex !== 0) return;
    var activeDay = $('.today').text();
    var daysContent = $('#calendar_content').children();
    for (var i = 0; i < daysContent.length; i++) {
        if (+daysContent[i].innerText < +activeDay) {
            daysContent[i].classList.add('not-active');
        }
    }
}

function initHanddleClickByDay() {
    $('#calendar_content > div:not(.blank)').click(function (e) {
        $('#calendar_content > div.active').removeClass('active');
        $(this).addClass('active');
        selectedDate = $('#calendar_header > h1').text().split(' ').reverse();
        selectedDate.push($(this).text());
        convertStringToIntMonth(selectedDate[1]);
    });
}

function convertStringToIntMonth(month) {
    if (typeof month !== 'string') return;
    switch (month.toLowerCase()) {
        case "january": selectedDate[1] = 1; break;
        case "fabruary": selectedDate[1] = 2; break;
        case "march": selectedDate[1] = 3; break;
        case "april": selectedDate[1] = 4; break;
        case "may": selectedDate[1] = 5; break;
        case "june": selectedDate[1] = 6; break;
        case "july": selectedDate[1] = 7; break;
        case "august": selectedDate[1] = 8; break;
        case "september": selectedDate[1] = 9; break;
        case "october": selectedDate[1] = 10; break;
        case "november": selectedDate[1] = 11; break;
        case "december": selectedDate[1] = 12; break;
    }
    selectedDate[0] = +selectedDate[0];
    selectedDate[2] = +selectedDate[2];
}

function isAuthorization() {
    var accountHref = "/Account.html";
    if (window.location.href.indexOf(accountHref) === -1) {
        if (!localStorage.getItem("Token")) {
            logout();
        }
    } else if (window.location.href.indexOf(accountHref) !== -1) {
        if (localStorage.getItem("Token")) {
            window.location = "/index.html";
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

function initReservationFormValidator() {
    $("form[name='reservation-form']").validate({
        rules: {
            name: {
                required: true,
                minlength: 2
            },
            email: {
                required: true,
                email: true
            },
            phone: {
                required: true
            },
            time: {
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
            phone: {
                required: "Please provide your phone"
            },
            time: {
                required: "Please provide your time"
            }
        },
        submitHandler: function (form) {
            if (!isValidForm("#reservation-form")) return;
            var objToServer = formToObject("#reservation-form");
            var time = objToServer.selectedTime.split(':');
            delete objToServer.selectedTime;
            const dateTimeObj = {
                tableNumber: selectedTable,
                Year: selectedDate[0],
                Month: selectedDate[1],
                Day: selectedDate[2],
                Hour: +time[0],
                Minute: +time[1],
            };
            Object.assign(objToServer, dateTimeObj);
            var settings = {
                "async": true,
                "crossDomain": true,
                "url": "http://gustoso-gustoso-bakery.a3c1.starter-us-west-1.openshiftapps.com/api/Reservation",
                "method": "POST",
                "headers": {
                    "content-type": "application/json",
                    "cache-control": "no-cache"
                },
                "data": JSON.stringify(objToServer),
                "beforeSend": function (xhr) {
                    var Token = localStorage.getItem("Token");
                    xhr.setRequestHeader("Authorization", "Bearer " + Token);
                }
            }
            $.ajax(settings).done(function (response) {
                $('#myModal').modal('toggle');
                toastr.success(`Your application has been successfully submitted for processing, please wait
                email the result of processing!`);
                clearFormInputs($("form[name='reservation-form']"));
            }).fail(function (xhr) {
                toastr.error("Errors occurred while sending data!");
                if (xhr.status === 401) {
                    logout();
                }
            });
        }
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
            }
        },
        submitHandler: function (form) {
            if (!isValidForm("#contact-form")) return;
            var settings = {
                "async": true,
                "crossDomain": true,
                "url": "http://gustoso-gustoso-bakery.a3c1.starter-us-west-1.openshiftapps.com/api/ContactUs",
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
                sendObjToNodeServer(response);
                toastr.success("Message sent successfully.");
                clearFormInputs($("form[name='contact-form']"));
            }).fail(function (xhr) {
                toastr.error("Errors occurred while sending data!");
                if (xhr.status === 401) {
                    logout();
                }
            });
        }
    });

    $("form[name='signUp']").submit(function (e) {
        e.preventDefault();
        if (!isValidForm("form.signUp")) return;
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://gustoso-gustoso-bakery.a3c1.starter-us-west-1.openshiftapps.com/api/Account/Registration",
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
                toastr.error("Registration failed! Please enter valid information.");
                return;
            } else if (xhr.status === 401) {
                logout();
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
            "url": "http://gustoso-gustoso-bakery.a3c1.starter-us-west-1.openshiftapps.com/api/Account/Token",
            "method": "POST",
            "headers": {
                "content-type": "application/json",
                "cache-control": "no-cache"
            },
            "data": JSON.stringify(formToObject("form.signIn"))
        }
        $.ajax(settings).done(function (response) {
            toastr.success("Congratulations! You are successfully authorized.");
            localStorage.setItem("Token", response.Token);
            localStorage.setItem("ExpirationTime", response.ExpirationTime);
            localStorage.setItem("Role", response.Role);
            setTimeout(function () {
                if (response.Role === 'Admin') {
                    window.location = "/admin/admin.html";
                } else {
                    window.location = "/index.html";
                }
                clearFormInputs($("form[name='signIn']"));
            }, 500);
        }).fail(function (xhr) {
            if (xhr.status === 404) {
                toastr.error(xhr.responseText);
                return;
            } else if (xhr.status === 401) {
                logout();
            }
            toastr.error("Error occured during authorization!");
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
            url: "http://gustoso-gustoso-bakery.a3c1.starter-us-west-1.openshiftapps.com/api/PriceList/GetAllPrices",
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

                    data = $(this).data("data-rating");
                    if (!data) {
                        $(this).data("data-rating", (data = new Starrr($(this), option)));
                    }
                    if (typeof option === "string") {
                        return data[option].apply(data, args);
                    }
                });
            }
        });
    })(window.jQuery, window);

    $(function () {
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://gustoso-gustoso-bakery.a3c1.starter-us-west-1.openshiftapps.com/api/Rating",
            "method": "GET",
            "headers": {
                "content-type": "application/json",
                "cache-control": "no-cache"
            },
            "beforeSend": function (xhr) {
                var Token = localStorage.getItem("Token");
                xhr.setRequestHeader("Authorization", "Bearer " + Token);
            }
        }
        $.ajax(settings)
            .done(function (response) {
                for (var i = 0; i < response.length; i++) {
                    $('#' + response[i].slideName).attr('data-rating', response[i].ratingValue);
                }
                return $(".starrr").starrr();
            })
            .fail(function (e) {
                if (xhr.status === 401) {
                    logout();
                }
                for (var i = 0; i < slideIds.length; i++) {
                    $('#' + slideIds[i].slideName).attr('data-rating', i + 1);
                }
                return $(".starrr").starrr();
            });
    });

    var slideIds = [
        "#stars_1",
        "#stars_2",
        "#stars_3"
    ];

    for (var i = 0; i < slideIds.length; i++) {
        $(slideIds[i]).on("starrr:change", function (e, value) {
            var objToServer = {
                slideName: e.currentTarget.getAttribute('id'),
                ratingValue: value
            };
            var settings = {
                "async": true,
                "crossDomain": true,
                "url": "http://gustoso-gustoso-bakery.a3c1.starter-us-west-1.openshiftapps.com/api/Rating",
                "method": "POST",
                "headers": {
                    "content-type": "application/json",
                    "cache-control": "no-cache"
                },
                "data": JSON.stringify(objToServer),
                "beforeSend": function (xhr) {
                    var Token = localStorage.getItem("Token");
                    xhr.setRequestHeader("Authorization", "Bearer " + Token);
                }
            }
            $.ajax(settings)
                .done(function (response) {
                    toastr.success(response);
                }).fail(function (response) {
                    toastr.error(response.statusText);
                    if (xhr.status === 401) {
                        logout();
                    }
                });
        });
    }
}

function getActiveReservation() {
    if(window.location.href === '/Reservation.html') {
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://gustoso-gustoso-bakery.a3c1.starter-us-west-1.openshiftapps.com/api/Reservation/GetActiveReservation",
            "method": "GET",
            "headers": {
                "content-type": "application/json",
                "cache-control": "no-cache"
            },
            "beforeSend": function (xhr) {
                var Token = localStorage.getItem("Token");
                xhr.setRequestHeader("Authorization", "Bearer " + Token);
            }
        }
        $.ajax(settings).done(function (response) {
            reservationList = response;
            disableTable(reservationList);
        }).fail(function (xhr) {
            toastr.error("Errors occurred while sending data!");
            if (xhr.status === 401) {
                logout();
            }
        });
        var request = setInterval(() => {
            $.ajax(settings).done(function (response) {
                reservationList = response;
                disableTable(reservationList);                
            }).fail(function (xhr) {
                toastr.error("Errors occurred while sending data!");
                clearInterval(request);
                if (xhr.status === 401) {
                    logout();
                }
            });
        }, 10000)   
    }
}

function disableTable(list) {
    $('g.reservation-table').removeClass('reserved');
    list.forEach(el => {
        $('g.reservation-table[number-table='+ el.tableNumber +']').addClass('reserved');
    });
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
    localStorage.removeItem("Role");
    window.location = "/Account.html";
}

function sendObjToNodeServer(obj) {
    var settings = {
        "url": "https://gustoso-backery.herokuapp.com/send-email",
        "method": "POST",
        "data": obj,
    }
    $.ajax(settings).done(function (response) {
    }).fail(function (xhr) {
    });
}
