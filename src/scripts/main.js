'use strict';

const BASE_URL = 'https://mate-academy.github.io/phone-catalogue-static/api';

const request = (url) => {
  return fetch(`${BASE_URL}${url}`)
    .then(response => response.json());
};

function getFirstReceivedDetails() {
  return request('/phones.json')
    .then(response => Promise.race(response.map(phone =>
      new Promise(resolve =>
        resolve(request(`/phones/${phone.id}.json`))
      ))));
}

function getAllSuccessfulDetails() {
  return request('/phones.json')
    .then(response => Promise.allSettled(response.map(phone =>
      new Promise(resolve =>
        resolve(request(`/phones/${phone.id}.json`))
      ))))
    .then(result => result.filter(phone =>
      phone.status === 'fulfilled').map(phone => phone.value));
}

function getThreeFastestDetails() {
  return Promise.all([
    getFirstReceivedDetails(),
    getFirstReceivedDetails(),
    getFirstReceivedDetails(),
  ]);
}

getFirstReceivedDetails()
  .then(response => {
    const firstReceived = document.createElement('div');

    firstReceived.classList.add('first-received');

    firstReceived.insertAdjacentHTML('beforeend', `
      <h2>First Received</h2>
      <ul>
        <li>${JSON.stringify(response)}</li>
      </ul>
    `);

    document.body.append(firstReceived);
  });

getAllSuccessfulDetails()
  .then(response => {
    const allSuccessful = document.createElement('div');
    const ul = document.createElement('ul');

    allSuccessful.classList.add('all-successful');
    allSuccessful.insertAdjacentHTML('beforeend', `<h2>All Successful</h2>`);

    for (const phone of response) {
      ul.insertAdjacentHTML('beforeend', `
        <h3>${phone.id.toUpperCase()}</h3>
        <li>
          ${JSON.stringify(phone)}
        </li>
      `);

      allSuccessful.append(ul);
      document.body.append(allSuccessful);
    }
  });

getThreeFastestDetails()
  .then(response => {
    const threeFastest = document.createElement('div');
    const ul = document.createElement('ul');

    threeFastest.insertAdjacentHTML('beforeend', `<h2>Three Fastest</h2>`);

    for (const phone of response) {
      ul.insertAdjacentHTML('beforeend', `
        <li>${JSON.stringify(phone)}</li>
      `);
    }

    // threeFastest.append(ul);
    document.body.append(threeFastest);
  });
