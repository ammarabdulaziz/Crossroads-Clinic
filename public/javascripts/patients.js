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
    $('.cancel-opt-tab').on('click','.opt-icon', function () {
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
        } else if (value == 'expired') {
            $('.expired').show().siblings().hide()
        }
    })
})

$(document).ready(function () {
    $('.app-tab').show().siblings().hide();
    $('.tab-menu a').click((e) => {
        e.preventDefault();
    })
    $('#app-tab').on('click', () => {
        $('.app-tab').show().siblings().hide();
    })
    $('#req-tab').on('click', () => {
        $('.req-tab').show().siblings().hide();
    })
    $('#res-tab').on('click', () => {
        $('.res-tab').show().siblings().hide();
    })
    $('#consulted-tab').on('click', () => {
        $('.consulted-tab').show().siblings().hide();
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

// Fuse Js Search Box Consultations Tab
$(document).ready(function () {
    $('#consult-input').keyup(function () {
        var searchValue = ($('#consult-input').val()).trim();
        if (searchValue != '') {
            $.ajax({
                url: '/get-consulted',
                method: 'get',
                success: (response) => {
                    var list = response.response;
                    const options = {
                        shouldSort: true,
                        location: 0,
                        threshold: 0.6,
                        distance: 100,
                        maxPatternLength: 32,
                        minMatchCharLength: 1,
                        keys: [
                            "_id",
                            "name",
                            "age",
                            "note",
                            "prescription",
                            "date",
                            "patientId",
                            "docId",
                            "docName",
                            "speciality",
                            "appId",
                        ]
                    };
                    var fuse = new Fuse(list, options);
                    var searchResult = fuse.search(searchValue)
                    if (searchResult.length > 0) {
                        $('#consulted-div').empty();
                        for (i = 0; i < searchResult.length; i++) {
                            $('#consulted-div').append('<div class="consulted" data-id="' + searchResult[i].item.docId + '"><div class="tab-content col-12 appointment v-center cancelled-tab"><div class="tab-img d-flex align-items-center"><img src="/images/' + searchResult[i].item.docId + '.jpg" alt="image" class="hero-img "><div class="img-name"><h4>Dr. ' + searchResult[i].item.docName + '</h4><h6>' + searchResult[i].item.speciality + '</h6></div></div><div class="tab-img d-flex"><div class="img-name"><h4>' + searchResult[i].item.name + '</h4><h6>Booking For</h6></div></div><div class="tab-img d-flex"><div class="img-name"><h4>' + searchResult[i].item.date + '</h4><h6>Session</h6></div></div><div class="tab-img d-flex"><a href="/app-sheet?appId=' + searchResult[i].item.appId + '"class="bx bx-cloud-download download-icon" ></a ></div ></div ></div > ')
                        }
                    } else {
                        $('#consulted-div').empty();
                        $('#consulted-div').append('<p></p><h6 class="text-center">No Results</h6>')
                    }
                }
            })
        }
    })
})

// Fuse Js Search Box Cancelled Tab
$(document).ready(function () {
    $('#cancelled-input').keyup(function () {
        var searchValue = ($('#cancelled-input').val()).trim();
        if (searchValue != '') {
            $.ajax({
                url: '/get-cancelled',
                method: 'get',
                success: (response) => {
                    var list = response.response;
                    const options = {
                        shouldSort: true,
                        location: 0,
                        threshold: 0.6,
                        distance: 100,
                        maxPatternLength: 32,
                        minMatchCharLength: 1,
                        includeMatches: true,
                        keys: [
                            "_id",
                            "name",
                            "age",
                            "phone",
                            "gender",
                            "date",
                            "patientId",
                            "docId",
                            "doctor.firstname",
                            "doctor.lastname",
                            "doctor.speciality",
                            "doctor._id",
                            "speciality",
                            "time",
                        ]
                    };
                    var fuse = new Fuse(list, options);
                    var searchResult = fuse.search(searchValue)
                    console.log(searchResult)
                    if (searchResult.length > 0) {
                        console.log(searchResult)
                        $('#cancelled-div').empty();
                        for (i = 0; i < searchResult.length; i++) {
                            $('#cancelled-div').append('<div class="tab-content col-12 appointment v-center cancelled-tab"><div class="tab-img d-flex align-items-center"><img src="/images/' + searchResult[i].item.doctor._id + '.jpg" alt="image" class="hero-img "><div class="img-name"><h4>Dr. ' + searchResult[i].item.doctor.firstname + ' ' + searchResult[i].item.doctor.lastname + '</h4><h6>' + searchResult[i].item.doctor.speciality + '</h6></div></div><div class="tab-img d-flex"><div class="img-name"><h4>' + searchResult[i].item.name + '</h4><h6>Booking For</h6></div></div><div class="tab-img d-flex"><div class="img-name"><h4>' + searchResult[i].item.date + ' ' + searchResult[i].item.time + '</h4><h6>Session</h6></div></div></div>')
                        }
                    } else {
                        $('#cancelled-div').empty();
                        $('#cancelled-div').append('<p></p><h6 class="text-center">No Results</h6>')
                    }
                }
            })
        }
    })
})

// Previous Consultations AJAX
$(document).ready(function () {

    $('.prev-tab').hide()
    $("#consulted-div").on('click', '.consulted', function () {
        $('.export').attr('href', '#');
        $('.prev-tab').show().siblings().hide()
        $('.presc-table').empty();

        var docId = $(this).data('id');
        $('.export').attr('href', '/previous-sheet?docId=' + docId);
        //$(this).
        $.ajax({
            url: '/previous?id=' + docId,
            method: 'get',
            success: (response) => {
                // Doctor data recieved in response.response object
                let prescriptions = response.response
                prescriptions.forEach(function (presc) {
                    var columns = ""
                    for (i = 0; i < presc.prescription.length; i++) {
                        var column = '<tr><td>' + presc.prescription[i] + '</td></tr>'
                        columns += column;
                    }
                    $('.presc-table').append('<div class="col-12 col-md-6"><table class="table"><thead><tr><th>' + presc.date +
                        '</th></tr></thead><tbody>' + columns + '</tbody></table></div>')
                })
            }
        })
    })
    $('.prev-tab h4 i').on('click', () => {
        $('.consulted-tab').show().siblings().hide()
    })
})

