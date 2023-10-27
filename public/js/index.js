/* eslint-disable*/
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';

document.addEventListener('DOMContentLoaded', (event) => {
  // Create DOM elements
  const mapBox = document.getElementById('map');
  const loginForm = document.querySelector('form');
  const logOutBtn = document.querySelector('.nav__el--logout')

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
    logOutBtn.addEventListener('click', logout)
  }
});
