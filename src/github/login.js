const base64 = require('base-64');
const fetch = require('node-fetch');
const config = require('config');
const co = require('co');

const credentials = {
  GITHUB_CLIENT_ID: config.get('credentials.github.clientId'),
  GITHUB_CLIENT_SECRET: config.get('credentials.github.clientSecret'),
};

const AUTH_URL_PATH = 'https://api.github.com/authorizations';

function* resolveRequest(request) {
  const response = yield request;
  const json = yield response.json();

  if (response.status < 400) {
    return json.token;
  } else {
    let error = new Error(json.message);
    error.status = response.status;
    throw error;
  }
}

/**
 * Login with github
 * @param  {string} user
 * @param  {string} pwd
 * @return {Promise}  Token
 */
function login(user, pwd) {
  const bytes = user.trim() + ':' + pwd.trim();
  const encoded = base64.encode(bytes);

  const request = fetch(AUTH_URL_PATH, {
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
  })

  return co(resolveRequest(request));
}

// Default export to work as a koa middleware
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
