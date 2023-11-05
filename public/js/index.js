/* eslint-disable*/
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

document.addEventListener('DOMContentLoaded', (event) => {
  // Create DOM elements
  const mapBox = document.getElementById('map');
  const loginForm = document.querySelector('.form--login');
  const logOutBtn = document.querySelector(
    '.nav__el--logout',
  );
  const userUpdateForm = document.querySelector(
    '.form-user-data',
  );
  const passwordUpdateForm = document.querySelector(
    '.form-user-settings',
  );
  const bookTourBtn = document.getElementById('book-tour-btn');

  // VALUES

  // Delegation
  if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.location);

    displayMap(locations);
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = document.getElementById('email').value;
      const password =
        document.getElementById('password').value;
      login(email, password);
    });
  }

  if (logOutBtn) {
    logOutBtn.addEventListener('click', logout);
  }

  if (userUpdateForm) {
    userUpdateForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const form = new FormData();
      form.append(
        'name',
        document.getElementById('name').value,
      );
      form.append(
        'email',
        document.getElementById('email').value,
      );
      form.append(
        'photo',
        document.getElementById('photo').files[0],
      );
      updateSettings(form, 'data');
    });
  }

  if (passwordUpdateForm) {
    passwordUpdateForm.addEventListener(
      'submit',
      async (event) => {
        event.preventDefault();
        document.querySelector(
          '.btn--save-password',
        ).textContent = 'Updating...';
        const passwordCurrent = document.getElementById(
          'password-current',
        ).value;
        const newPassword =
          document.getElementById('password').value;
        const newPasswordConfirm = document.getElementById(
          'password-confirm',
        ).value;
        await updateSettings(
          {
            passwordCurrent,
            newPassword,
            newPasswordConfirm,
          },
          'password',
        );
        document.querySelector(
          '.btn--save-password',
        ).textContent = 'Update password';
        document.getElementById('password-current').value =
          '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value =
          '';
      },
    );
  }

  if (bookTourBtn)
    bookTourBtn.addEventListener('click', e => {
        e.target.textContent = 'Processing...';
        const { tourId } = e.target.dataset
        bookTour(tourId);
    })
});
