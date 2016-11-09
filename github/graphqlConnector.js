const Lokka = require('lokka').Lokka;
const Transport = require('lokka-transport-http').Transport;
const co = require('co');
const config = require('config');
const login = require('./login.js').login;

let token;

function * executeQuery(query, fragments = []) {

  if (!token) {
    const { name, password } = config.get('credentials.user');
    token = yield login(name, password);
  }

  const headers = {Authorization:`Bearer ${token}`};
  const transport = new Transport('https://api.github.com/graphql', { headers });
  const client = new Lokka({
    transport
  });

  fragments.forEach( fragment => {
    client.createFragment(fragment);
  });

  return client.query(query);
}

module.exports = function() {
  return co(executeQuery.apply(this, arguments));
}
