/*===== SHOW NAVBAR  =====*/

function navToggle() {
    const toggle = document.getElementById("header-toggle")
    const nav = document.getElementById("nav-bar")
    const bodypd = document.getElementById("body-pd")
    const headerpd = document.getElementById('header')

    // show navbar
    nav.classList.toggle('show')
    // change icon
    toggle.classList.toggle('bx-x')
    // add padding to body
    bodypd.classList.toggle('body-pd')
    // add padding to header
    headerpd.classList.toggle('header-pd')
}

/*===== LOGOUT POPUP  =====*/
function userPopup() {
    var userPop = document.getElementById("user-pop");
    userPop.classList.toggle('show-pop');
}

/*===== TABS  =====*/
var tabLinks = document.querySelectorAll(".nav .nav__list a");
var tabContents = document.querySelectorAll(".tab-container  .tab-content");

function showContent(navIndex, contentIndex) {
    tabLinks.forEach(node => node.classList.remove('active'))
    tabLinks[navIndex].classList.add('active')
    tabContents.forEach(node => node.style.display = "none");
    tabContents[contentIndex].style.display = "block";
}
showContent(0, 0);

if (window.location.hash == "#tab2") showContent(1, 1)
if (window.location.hash == "#tab3") showContent(2, 2)
if (window.location.hash == "#tab4") showContent(3, 3)
if (window.location.hash == "#tab2.1") showContent(1, 4)
if (window.location.hash == "#tab8") showContent(4, 9)



/*===== CROP IMAGE AND DISPLAY  =====*/
$(document).ready(function () {

    $('.image').on('change', function () {
        // Activate model after image select
        $('.modal-bg').addClass('bg-active')
        $('.image_demo').croppie('destroy');
        $('.image-label').attr('value', '');
        $image_crop = $('.image_demo').croppie({
            enableExif: true,
            viewport: {
                width: 200,
                height: 200,
                type: 'square' //circle
            },
            boundary: {
                width: 300,
                height: 300
            }
        });

        var reader = new FileReader();
        reader.onload = function (event) {
            $image_crop.croppie('bind', {
                url: event.target.result
            }).then(function () {
                console.log('jQuery bind complete');
            });
        }
        reader.readAsDataURL(this.files[0]);

        $('.close-icon ').on('click', function () {
            $('.modal-bg').removeClass('bg-active')
        })

        $('.crop-btn').click(function (event) {
            $image_crop.croppie('result', {
                type: 'canvas',
                size: 'viewport'
            }).then(function (response) {
                console.log('response', response)
                $('.displayImg').attr('src', response);
                // const base64Data = response.replace(/^data:([A-Za-z-+/]+);base64,/, '');
                $('.image-label').attr('value', response);
                $('.modal-bg').removeClass('bg-active')
            });
        })
    })

})


/*===== SWITCH TO ADD PAGE  =====*/
$(document).ready(function () {
    $('.btn-add').click(() => {
        $('.image-label').attr('value', '');
        $('.displayImg').attr('src', '');
        showContent(1, 4)

        // To bind selected image to image_demo
        $('#image_demo_edit').removeClass('image_demo')
        $('#image_demo_add').addClass('image_demo')
    })
    $('.btn-add-speciality').click(() => {
        showContent(4, 8)
    })
})


/*===== DOCTORS EDIT DATA AJAX  =====*/
$(document).ready(function () {
    // Edit 
    $('.edit-doctor').click(function () {
        // Load Edit page content
        showContent(1, 5)
        window.location.hash = "#tab2"

        // To bind selected image to image_demo
        $('#image_demo_add').removeClass('image_demo')
        $('#image_demo_edit').addClass('image_demo')

        // Edit id
        var docID = $(this).data('id');
        $.ajax({
            url: '/admin/edit-doctor?id=' + docID,
            method: 'get',
            success: (response) => {
                // Doctor data recieved in response.response object
                console.log(response)
                console.log(response.response._id)
                $('#edit-fname').attr('value', response.response.firstname);
                $('#edit-lname').attr('value', response.response.lastname);
                $('#edit-email').attr('value', response.response.email);
                $('#edit-phone').attr('value', response.response.phone);
                $('#edit-speciality').attr('value', response.response.speciality);
                $('#edit-specialized').attr('value', response.response.specialized);
                $('#edit-place').attr('value', response.response.place);
                $("input[name=gender][value=" + response.response.gender + "]").attr('checked', true);
                $('#displayImg-edit').attr('src', '../images/' + response.response._id + '.jpg');
                $('#update').attr('action', '/admin/edit-doctor?id=' + response.response._id);
            }
        })
    });
});


/*===== DELETE DOCTOR DATA AJAX  =====*/
$(document).ready(function () {
    // Delete 
    $('.delete-doctor').click(function () {

        // Delete id
        var docID = $(this).data('id');

        // Confirm box
        var deleteConfirm = confirm("Are you sure you want to delete the record?");
        if (deleteConfirm) {
            deleteDoctor(docID)
        }
        function deleteDoctor(docID) {
            $.ajax({
                url: '/admin/delete-doctor',
                method: 'post',
                data: {
                    id: docID
                },
                success: (response) => {
                    // Data removed from HTML Table
                    if (response.status) {
                        window.location.hash = "#tab2"
                        window.location.reload();
                        alert('You have successfully deleted the data')
                    }
                }
            })
        }
    });
});

/*===== BLOCK DOCTOR DATA AJAX  =====*/
$(document).ready(function () {
    // Block 
    $('.block-doctor').click(function () {

        // Block id
        var docID = $(this).data('id');

        // Confirm box
        var blockConfirm = confirm("Are you sure you want to block this Doctor?");
        if (blockConfirm) {
            blockDoctor(docID)
        }
        function blockDoctor(docID) {
            $.ajax({
                url: '/admin/block-doctor',
                method: 'post',
                data: {
                    id: docID
                },
                success: (response) => {
                    // Data removed from HTML Table
                    if (response.status) {
                        window.location.hash = "#tab2"
                        window.location.reload();
                        alert('You have successfully blocked the doctor')
                    }
                }
            })
        }
    });
});

/*===== UNBLOCK DOCTOR DATA AJAX  =====*/
$(document).ready(function () {
    // Unblock 
    $('.unblock-doctor').click(function () {

        // Unblock id
        var docID = $(this).data('id');

        // Confirm box
        var unblockConfirm = confirm("Are you sure you want to unblock this Doctor?");
        if (unblockConfirm) {
            unblockDoctor(docID)
        }
        function unblockDoctor(docID) {
            $.ajax({
                url: '/admin/unblock-doctor',
                method: 'post',
                data: {
                    id: docID
                },
                success: (response) => {
                    // Data removed from HTML Table
                    if (response.status) {
                        window.location.hash = "#tab2"
                        window.location.reload();
                        alert('You have successfully unblocked the doctor')
                    }
                }
            })
        }
    });
});


/*===== DELETE PATIENT DATA AJAX  =====*/
$(document).ready(function () {
    // Delete 
    $('.delete-ptnt').click(function () {

        // Delete id
        var patientID = $(this).data('id');

        // Confirm box
        var deleteConfirm = confirm("Are you sure you want to delete the record?");
        if (deleteConfirm) {
            deletePatient(patientID)
        }
        function deletePatient(patientID) {
            $.ajax({
                url: '/admin/delete-patient',
                method: 'post',
                data: {
                    id: patientID
                },
                success: (response) => {
                    // Data removed from HTML Table
                    if (response.status) {
                        window.location.hash = "#tab3"
                        window.location.reload();
                        alert('You have successfully deleted the data')
                    }
                }
            })
        }
    });
});

/*===== BLOCK PATIENT DATA AJAX  =====*/
$(document).ready(function () {
    // Block 
    $('.block-ptnt').click(function () {
        // Load Edit page content
        showContent(2, 2)
        window.location.hash = "#tab3"

        // Block id
        var patientId = $(this).data('id');

        // Confirm box
        var blockConfirm = confirm("Are you sure you want to block this Patient?");
        if (blockConfirm) {
            blockPatient(patientId)
        }
        function blockPatient(patientId) {
            $.ajax({
                url: '/admin/block-patient',
                method: 'post',
                data: {
                    id: patientId
                },
                success: (response) => {
                    // Data removed from HTML Table
                    if (response.status) {
                        window.location.hash = "#tab3"
                        window.location.reload();
                        alert('You have successfully blocked the Patient')
                    }
                }
            })
        }
    });
});

/*===== UNBLOCK PATIENT DATA AJAX  =====*/
$(document).ready(function () {
    // Block 
    $('.unblock-ptnt').click(function () {
        // Load Edit page content
        showContent(2, 2)
        window.location.hash = "#tab3"

        // Block id
        var patientId = $(this).data('id');

        // Confirm box
        var unblockConfirm = confirm("Are you sure you want to unblock this Patient?");
        if (unblockConfirm) {
            unblockPatient(patientId)
        }
        function unblockPatient(patientId) {
            $.ajax({
                url: '/admin/unblock-patient',
                method: 'post',
                data: {
                    id: patientId
                },
                success: (response) => {
                    // Data removed from HTML Table
                    if (response.status) {
                        window.location.hash = "#tab3"
                        window.location.reload();
                        alert('You have successfully unblocked the Patient')
                    }
                }
            })
        }
    });
});


/*===== PROFILE AJAX  =====*/
$(document).ready(function () {
    // Edit 
    $('.btn-view').click(function () {
        // Load Edit page content
        showContent(1, 6)
        window.location.hash = "#tab2"

        // Edit id
        var docID = $(this).data('id');
        $.ajax({
            url: '/admin/profile?id=' + docID,
            method: 'get',
            success: (response) => {
                // Doctor data recieved in response.response object
                $('.profile-content h2').text('Dr. ' + response.response.firstname + ' ' + response.response.lastname);
                $('.sub-name h5').text(response.response.speciality + ' | ' + response.response.specialized);
                $('.join-date h5').text('Join date ' + response.response.date);
                $('.detail-1 a').text('+91' + response.response.phone);
                $('.detail-2 a').text(response.response.email);
                $('.detail-3 a').text(response.response.place);
                $('.detail-3 a').text(response.response.place);
                $('.myPatientCount').text(response.response.count);
                $('.edit-profile').attr('data-id', response.response._id);
                $('.hero-img').attr('src', '../images/' + response.response._id + '.jpg');

                console.log('response.response', response.response)
                console.log('response.report', response.response.report)
                //Graph
                let doctorReport = document.getElementById("myChart");
                Chart.defaults.global.defaultFontFamily = 'Montserrat'
                let myChart = new Chart(doctorReport, {
                    type: 'doughnut',
                    data: {
                        labels: ['Consulted', 'Approved', 'Requests', 'Cancelled'],
                        datasets: [{
                            label: 'Of Orders',
                            data: response.response.report,
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(255, 159, 64, 0.2)',
                            ], borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)'
                            ],
                            borderWidth: .5
                        }]
                    },
                    options: {
                        title: {
                            display: true,
                            text: 'Doctor Appointment Status',
                            fontSize: 25
                        }
                    }
                });
            }
        })
    });
});


/*===== SPECIALITY EDIT DATA  =====*/
$(document).ready(function () {
    // Edit 
    $('.edit-speciality').click(function () {
        // Load Edit page content
        showContent(4, 9)
        window.location.hash = "#tab8"

        // Edit id
        var specID = $(this).data('id');
        var specName = $(this).attr('name');

        console.log(specID)
        console.log(specName)

        $('.speciality').attr('value', specName);
        $('.edit-spec-form').attr('action', '/admin/edit-speciality?id=' + specID);

    });
});


/*===== DELETE DATA AJAX  =====*/
$(document).ready(function () {
    // Delete 
    $('.dlt-spec').click(function () {

        // Delete id
        var dltSpec = $(this).data('id');

        // Confirm box
        var deleteConfirm = confirm("Are you sure you want to delete the record?");
        if (deleteConfirm) {
            deleteDoctor(dltSpec)
        }
        function deleteDoctor(dltSpec) {
            $.ajax({
                url: '/admin/delete-speciality',
                method: 'post',
                data: {
                    id: dltSpec
                },
                success: (response) => {
                    // Data removed from HTML Table
                    if (response.status) {
                        window.location.hash = "#tab8"
                        window.location.reload();
                        alert('You have successfully deleted the data')
                    }
                }
            })
        }
    });
});
