$("#closeMsg").click(function () {
    $("#errorDiv").hide();
})

$(document).ready(function () {
    $('#login-form').show();
    $('#register-form').hide();
    $('.login-tab').click((event) => {
        event.preventDefault();
        $('#login-form').show();
        $('#register-form').hide();
        $('.login-tab').addClass('active')
        $('.register-tab').removeClass('active')
        $('.login-content h1').text('LOGIN');
        $('.login-content h4').text('Login to your account to continue');
    })
    $('.register-tab').click((event) => {
        event.preventDefault();
        $('#login-form').hide();
        $('#register-form').show();
        $('.register-tab').addClass('active')
        $('.login-tab').removeClass('active')
        $('.login-content h1').text('REGISTER');
        $('.login-content h4').text('New to Clinic? Register your account');
    })
})