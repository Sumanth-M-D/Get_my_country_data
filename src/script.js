'use strict';

import dotenv from 'dotenv';
dotenv.config();

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');
const latitudeEL = document.querySelector('.latitude');
const longitudeEl = document.querySelector('.longitude');
const form = document.querySelector('.latLng');
const h1 = document.querySelector('h1');
const APIKey = process.env.API_KEY;

function renderCountry(data, className = '') {
  const language =
    Object.values(data.languages)[1] || Object.values(data.languages)[0];
  const currency = Object.values(data.currencies)[0].name;
  const html = ` <article class="country ${className} ">
                           <img class="country__img" src="${data.flags.png}" />
                           <div class="country__data">
                              <h3 class="country__name">${data.name.common}</h3>
                              <h4 class="country__region">${data.region}</h4>
                              <p class="country__row"><span>👫</span>${(
                                +data.population / 1_00_00_000
                              ).toFixed(2)} Crores</p>
                              <p class="country__row"><span>🗣️</span>${language}</p>
                              <p class="country__row"><span>💰</span>${currency}</p>
                           </div>
                        </article>`;
  countriesContainer.insertAdjacentHTML('beforeend', html);
}

function renderError(msg) {
  countriesContainer.insertAdjacentText('beforeend', msg);
}

// Getting the data of country and its neighbour
function getCountryAndNeighbour(country) {
  fetch(`https://restcountries.com/v3.1/name/${country}`)
    .then(response => {
      if (!response.ok)
        throw new Error(`Incorrect country name ${response.status}`);

      return response.json();
    })
    .then(data => {
      const country = data[1] || data[0]; //preveiously colonised countries has 2 data
      renderCountry(country);

      const neighbours = country.borders;
      if (!neighbours) throw new Error(`no neighbour found`);

      getNeighbours(neighbours);
    })
    .catch(err => {
      console.log(`something went wrong ${err.message}`);
      renderError(`something went wrong ${err.message}`);
    })
    .finally(() => {
      countriesContainer.style.opacity = 1;
    });
}

// get Neighbours
function getNeighbours(neighbours) {
  neighbours.forEach(neighbour => {
    fetch(`https://restcountries.com/v3.1/alpha/${neighbour}`)
      .then(response => {
        if (!response.ok)
          throw new Error(`counstry not found ${response.message}`);
        return response.json();
      })
      .then(data => {
        renderCountry(data[1] || data[0], 'neighbour');
      })
      .catch(err => {
        console.log(`something went wrong ${err.message}`);
        renderError(`something went wrong ${err.message}`);
      });
  });
}

// reverse geocoding function
function whereAmI(lat, lng) {
  fetch(
    `https://us1.locationiq.com/v1/reverse?key=${APIKey}&lat=${lat}&lon=${lng}&format=json`
  )
    .then(response => {
      if (!response.ok)
        throw new Error(`Try after 2 seconds. ${response.status}.`);
      return response.json();
    })
    .then(data => {
      console.log(data);
      h1.textContent = `You are in ${
        data.address.city || data.address.state
      }, ${data.address.country}`;

      getCountryAndNeighbour(data.address.country);
    })
    .catch(err => console.log(`something went wrong ${err.message}`));
}

function getPosition() {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

//adding eventListner
btn.addEventListener('click', function () {
  getPosition()
    .then(pos => {
      const coordinates = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };

      const lat = latitudeEL.value || coordinates.lat;
      const lng = longitudeEl.value || coordinates.lng;
      whereAmI(lat, lng);
      form.style.opacity = 0;
    })
    .catch(err => {
      console.log('Error getting position:', err.message);
    });
});
