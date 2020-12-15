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
        } else if (value == 'cancelled') {
            $('.cancelled').show().siblings().hide()
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


// Add-Remove Prescription
const prescInput = document.querySelector(".presc-input");
const prescBtn = document.querySelector(".presc-button");
const prescList = document.querySelector(".presc-list");

//Event Listeners
prescBtn.addEventListener("click", addPresc);

//Functions
function addPresc(e) {
    e.preventDefault();
    const prescDiv = document.createElement("li");
    prescDiv.innerHTML = prescInput.value + "<input type='hidden' name='prescription' value='" + prescInput.value + "'/><a class='bx bx-trash nav__icon ml-5 presc-delete' onclick='deletePresc(this)'></a>";
    prescInput.value = "";
    prescList.appendChild(prescDiv)
}

function deletePresc(e) {
    e.parentNode.remove();
}