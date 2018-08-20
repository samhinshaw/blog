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
  toggleMessageVisibility: (headerID, bodyID) => {
    // Note to self: read this post later to animate this:
    // https://gomakethings.com/how-to-add-transition-animations-to-vanilla-javascript-show-and-hide-methods/
    // Listen for clicks on a message header

    const messageHeader = document.getElementById(headerID);
    const messageBody = document.getElementById(bodyID);

    // Listen for clicks and toggle visibility
    messageHeader.addEventListener('click', () => {
      // First, toggle visibility of the body text
      messageBody.style.display = messageBody.style.display === 'none' ? '' : 'none';
      // then change the chevron icon
      const iconContainer = [...messageHeader.childNodes].find(node => node.className === 'icon');
      const faContainer = [...iconContainer.childNodes].find(node => node.tagName === 'I');
      const svg = [...faContainer.childNodes].find(node => node.tagName === 'svg');

      // Toggle the classes of the SVG element, and font-awesome will do the rest
      svg.classList.toggle('fa-chevron-down');
      svg.classList.toggle('fa-chevron-up');
    });
  },
};

// This is necessary for manipulation of icon style.
// https://stackoverflow.com/questions/46210501/switch-between-icons-when-using-fontawesome-5-0-svg-framework
window.FontAwesomeConfig = { autoReplaceSvg: 'nest' };

// Process all actions after DOM content has loaded
document.addEventListener('DOMContentLoaded', () => {
  handlers.toggleNavBarBurger();
  handlers.toggleCopyrightModal();
  handlers.toggleMessageVisibility('lti-definition-header', 'lti-definition-body');
});
