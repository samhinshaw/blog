// Define functions for handling navbar and copyright modal
const handlers = {
  // Function 1 to listen for: hamburger menu
  toggleNavBarBurger: () => {
    // Get all "navbar-burger" elements
    const navbarBurgers = Array.prototype.slice.call(
      document.querySelectorAll('.navbar-burger'),
      0,
    );
    // Check if there are any nav burgers
    if (navbarBurgers.length > 0) {
      // Add a click event on each of them
      navbarBurgers.forEach((el) => {
        el.addEventListener('click', () => {
          // Get the target from the "data-target" attribute
          let target = el.dataset.target;
          target = document.getElementById(target);

          // Toggle the class on both the "navbar-burger" and the "navbar-menu"
          el.classList.toggle('is-active');
          target.classList.toggle('is-active');
        });
      });

      navbarBurgers.forEach((el) => {
        el.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            // Get the target from the "data-target" attribute
            let target = el.dataset.target;
            target = document.getElementById(target);

            // Toggle the class on both the "navbar-burger" and the "navbar-menu"
            el.classList.toggle('is-active');
            target.classList.toggle('is-active');
          }
        });
      });
    }
  },
  toggleCopyrightModal: () => {
    // Function 2 to listen for: copyright logo/modal
    // Find the copyright logo and and the copyright modal.
    const copyrightLogo = document.getElementById('copyrightLogo');
    const copyrightModalClose = document.getElementById('copyrightModalClose');
    const copyrightModal = document.getElementById('copyrightModal');
    const copyrightModalBackground = document.getElementById('copyrightModalBackground');

    // Add an event listener to logo watch for clicks
    copyrightLogo.addEventListener('click', () => {
      copyrightModal.classList.toggle('is-active');
    });
    // Add an event listener to close button watch for clicks
    copyrightModalClose.addEventListener('click', () => {
      copyrightModal.classList.toggle('is-active');
    });
    copyrightModalBackground.addEventListener('click', () => {
      copyrightModal.classList.toggle('is-active');
    });
  },
};

// Process all actions after DOM content has loaded
document.addEventListener('DOMContentLoaded', () => {
  handlers.toggleNavBarBurger();
  handlers.toggleCopyrightModal();
});
