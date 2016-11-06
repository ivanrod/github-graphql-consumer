const base64 = require('base-64');
const fetch = require('node-fetch');
const config = require('config');

const credentials = {
  GITHUB_CLIENT_ID: config.get('credentials.github.clientId'),
  GITHUB_CLIENT_SECRET: config.get('credentials.github.clientSecret'),
};

const AUTH_URL_PATH = 'https://api.github.com/authorizations';

function login(name, pwd) {
  const bytes = name.trim() + ':' + pwd.trim();
  const encoded = base64.encode(bytes);

  return fetch(AUTH_URL_PATH, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + encoded,
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/vnd.github.inertia-preview+json'
    },
    body: JSON.stringify({
      'client_id': credentials.GITHUB_CLIENT_ID,
      'client_secret': credentials.GITHUB_CLIENT_SECRET,
      'scopes': ['user', 'repo'],
      'note': 'not abuse'
    })
  }).then(response => response.json()
      .then(json => {
        if (response.status < 400) {
          return json.token;
        } else {
          let error = new Error(json.message);
          error.status = response.status;
          throw error;
        }
      })
    );
}

module.exports = function *() {
  try {
    yield login.apply(this, arguments).then(token => this.body = {token});
  } catch (err) {

    if (!err.status) {
      this.status = 500;
    } else {
      this.set('WWW-Authenticate', 'Basic');
      this.status = 401;
      this.body = {error: 'Unauthorized', message: err.message};
    }
  }
};

module.exports.login = login;
