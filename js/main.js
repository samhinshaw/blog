// Function 1 to listen for: hamburger menu
document.addEventListener("DOMContentLoaded", function() {
  // Get all "navbar-burger" elements
  const navbarBurgers = Array.prototype.slice.call(
    document.querySelectorAll(".navbar-burger"),
    0
  );

  // Check if there are any nav burgers
  if (navbarBurgers.length > 0) {
    // Add a click event on each of them
    navbarBurgers.forEach(function(el) {
      el.addEventListener("click", function() {
        // Get the target from the "data-target" attribute
        let target = el.dataset.target;
        target = document.getElementById(target);

        // Toggle the class on both the "navbar-burger" and the "navbar-menu"
        el.classList.toggle("is-active");
        target.classList.toggle("is-active");
      });
    });
  }
});

// Function 2 to listen for: copyright logo/modal
document.addEventListener("DOMContentLoaded", function() {
  // Find the copyright logo and and the copyright modal.
  const copyrightLogo = document.getElementById("copyrightLogo");
  const copyrightModalClose = document.getElementById("copyrightModalClose");
  const copyrightModal = document.getElementById("copyrightModal");

  // Add an event listener to logo watch for clicks
  copyrightLogo.addEventListener("click", function() {
    copyrightModal.classList.toggle("is-active");
  });
  // Add an event listener to close button watch for clicks
  copyrightModalClose.addEventListener("click", function() {
    copyrightModal.classList.toggle("is-active");
  });
  copyrightModalBackground.addEventListener("click", function() {
    copyrightModal.classList.toggle("is-active");
  });
});
