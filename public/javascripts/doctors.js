$(document).ready(function () {
    $('.appointments').show().siblings().hide()
    $('.doc-tabs li').on('click', function (e) {
        e.preventDefault();
        var value = $(this).attr('data-filter');
        $(this).addClass('active').siblings().removeClass('active')
        if (value == 'appointments') {
            $('.appointments').show().siblings().hide()
        } else if (value == 'bookings') {
            $('.bookings').show().siblings().hide()
        } else if (value == 'myPatients') {
            $('.myPatients').show().siblings().hide()
        } else if (value == 'results') {
            $('.results').show().siblings().hide()
        }
    })
})

$(document).ready(function () {
    $('.display-tabs').addClass('hide-tabs');
    $('.doc-nav i').click(function () {
        $('.display-tabs').fadeToggle(300)
        $('.display-tabs li').click(function () {
            $('.display-tabs').hide()
        })
    })
})