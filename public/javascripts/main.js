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

if(window.location.hash == "#tab2") showContent(1,1)
if(window.location.hash == "#tab3") showContent(2,2)
if(window.location.hash == "#tab4") showContent(3,3)
if(window.location.hash == "#tab2.1") showContent(1,4)