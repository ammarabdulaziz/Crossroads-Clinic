//   To delete

function userPopup1() {
    var userPop = document.getElementById("user-pop-1");
    userPop.classList.toggle('show-pop');
}
function userPopup2() {
    var userPop = document.getElementById("user-pop-2");
    userPop.classList.toggle('show-pop');
}

//Cancel Option
$(document).ready(function () {
    $('.opt-icon').on('click', function () {
        $('.opt-icon').not(this).each(function () {
            $(this).parent().find('.options-box').removeClass('show-cancel')
        })
        $(this).parent().find('.options-box').toggleClass('show-cancel')
    })
})

$(document).ready(function () {
    $('.today').show().siblings().hide()
    $('.tab-menu li').on('click', function () {
        $('.tab-menu li').removeClass('active')
        $(this).addClass('active')
        var value = $(this).attr('data-filter');
        if (value == 'today') {
            $('.today').show().siblings().hide()
        } else if (value == 'upcoming') {
            $('.upcoming').show().siblings().hide()
        } else if (value == 'consulted') {
            $('.consulted').show().siblings().hide()
        }else if (value == 'expired') {
            $('.expired').show().siblings().hide()
        }
    })
})

$(document).ready(function () {
    $('.req-tab').hide();
    $('.res-tab').hide();
    $('.tab-menu a').click((e) => {
        e.preventDefault();
    })
    $('#app-tab').on('click', () => {
        $('.req-tab').hide();
        $('.res-tab').hide();
        $('.app-tab').show();
    })
    $('#req-tab').on('click', () => {
        $('.app-tab').hide();
        $('.res-tab').hide();
        $('.req-tab').show();
    })
    $('#res-tab').on('click', () => {
        $('.app-tab').hide();
        $('.req-tab').hide();
        $('.res-tab').show();
    })
})

// Dropdown
$('.dropdown-toggle').click(() => {
    $('.dropdown-menu').toggle()
})

$(document).ready(function () {
    $('.dropdown-item').click(function () {
        var value = $(this).attr('data-filter');
        if (value == 'all') {
            $('.doc-box').show('1000');
        } else {
            $('.doc-box').filter('.' + value).show('1000');
            $('.doc-box').not('.' + value).hide('1000');
        }
    })
    $('.dropdown-item').click(function (e) {
        e.preventDefault();
        $(this).addClass('active').siblings().removeClass('active');
    })
})

// To display the first name of Patient

