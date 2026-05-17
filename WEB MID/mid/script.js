// MENU
const menu = document.getElementById("menu-icon");
const navbar = document.getElementById("navbar");

menu.addEventListener("click", ()=>{
    navbar.classList.toggle("active");
});

// close on click
document.querySelectorAll(".navbar a").forEach(a=>{
    a.addEventListener("click", ()=>{
        navbar.classList.remove("active");
    });
});

// SCROLL HEADER
const header = document.querySelector(".header");

window.addEventListener("scroll", ()=>{

    if(window.scrollY > 50){
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }

});