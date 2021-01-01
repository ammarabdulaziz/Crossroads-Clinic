// Error box close
$("#closeMsg").click(function () {
    $("#errorDiv").hide();
    window.location.href = '/login'
})

$(document).ready(function () {
    // Login page tabs
    $('.forgot-pwd').show()
    $('#login-form').show().siblings().hide();
    $('.login-tab').click((event) => {
        event.preventDefault();
        $('#login-form').show().siblings().hide();
        $('.forgot-pwd').show()
        $('.login-tab').addClass('active')
        $('.register-tab').removeClass('active')
        $('.login-content h1').text('LOGIN');
        $('.login-content h4').text('Login to your account to continue');
    })
    $('.register-tab').click((event) => {
        event.preventDefault();
        $('.forgot-pwd').hide()
        $('#register-form').show().siblings().hide();
        $('.register-tab').addClass('active')
        $('.login-tab').removeClass('active')
        $('.login-content h1').text('REGISTER');
        $('.login-content h4').text('New to Clinic? Register your account');
    })
    $('.otp').click(() => {
        $('#login-form').hide();
        $('.forgot-pwd').hide()
        $('.login-tab').addClass('active')
        $('#otp-form').show();
        $('.send-otp-timer').hide();
        $.ajax({
            url: '/auth/get-countdown',
            method: 'get',
            success: (response) => {
                if (response.status) {
                    $('.send-otp').prop('disabled', true);
                    $('.send-otp-timer').show();
                }
            }
        })
    })

    // Send - Resend OTP Ajax
    $('.send-otp, .resendOTP').click((event) => {
        event.preventDefault();
        $('.forgot-pwd').hide()
        $('.login-tab').addClass('active')
        $('#otp-verify').show().siblings().hide();
        $('.resendOTP').hide()
        var phone = $('#phone').val()
        var channel = 'sms'
        $.ajax({
            url: '/auth/send-otp?phone=' + phone + '&channel=' + channel,
            method: 'get',
            success: (response) => {
                if (response.status) {
                    alert('We have sent you an OTP to your Phone number')
                }
                if (response.result == 'redirect') {
                    //redirecting to Login page from here.
                    window.location.replace(response.url);
                }

                // Timer code
                let timeSecond = 40;

                function displayTime(second) {
                    const min = Math.floor(second / 60);
                    const sec = Math.floor(second % 60);
                    timer = `${min < 10 ? "0" : ""}${min}:${sec < 10 ? "0" : ""}${sec}`;
                }
                function endCount() {
                    timer = "00:00";
                }
                displayTime(timeSecond);
                const countDown = setInterval(() => {
                    timeSecond--;
                    displayTime(timeSecond);
                    $('.verify-otp-timer').show()
                    console.log(timer);
                    $('.verify-otp-timer').text('Resend OTP in ' + timer + 's')
                    if (timeSecond == 0 || timeSecond < 1) {
                        endCount();
                        clearInterval(countDown);
                        $('.verify-otp-timer').hide()
                        $('.resendOTP').show().text('Resend OTP')
                    }
                }, 1000);

            }
        })
    })

    // Verify OTP Ajax
    $('.verify-otp').click((event) => {
        event.preventDefault();
        $('.forgot-pwd').hide()
        var phone = $('#phone').val()
        var otp = $('#otp').val()
        $.ajax({
            url: '/auth/verify-otp?phone=' + phone + '&code=' + otp,
            method: 'get',
            success: (response) => {
                if (response.status) {
                    alert('You have entered an incorrect code')
                }
                if (response.result == 'redirect') {
                    //redirecting to Login page from here.
                    window.location.replace(response.url);
                }
            }
        })
    })
})