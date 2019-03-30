const net = require('net');
const request = require('request-promise');

const { port, serverurl } = require('./secrets');

const serveCommands = net.createServer((socket) => {
  let token;
  socket.setEncoding('utf8');

  socket.on('data', (data) => {
    console.info(data);
    if (/#.*$/.test(data)) {
      const index = data.indexOf('#') + 1;
      const [imei, latitud, longitud, velocidad] = data.substring(index).split(',');
      request({
        method: 'POST',
        uri: `${serverurl}/ubicacion`,
        body: {
          imei,
          latitud: parseFloat(latitud),
          longitud: parseFloat(longitud),
          velocidad: parseFloat(velocidad),
        },
        json: true,
        headers: {
          Authorization: token,
        },
      })
        .then(() => {
          console.info('saved');
        })
        .catch((err) => {
          console.error(err);
        });
    } else if (/@.*$/.test(data)) {
      const index = data.indexOf('@') + 1;
      token = data.substring(index);
      console.info(token);
      request({
        method: 'PATCH',
        uri: `${serverurl}/policia/1`,
        body: {
          conectado: true,
        },
        json: true,
        headers: {
          Authorization: token,
        },
      })
        .then(() => {
          console.info('+conectado');
        })
        .catch((err) => {
          console.error(err);
        });
    }
  });

  socket.on('end', () => {
    request({
      method: 'PATCH',
      uri: `${serverurl}/policia`,
      body: {
        conectado: false,
      },
      json: true,
      headers: {
        Authorization: token,
      },
    })
      .then(() => {
        console.info('-desconectado');
      })
      .catch((err) => {
        console.error(err);
      });
    console.info('ended conection');
  });

  socket.on('error', (e) => {
    console.error(e);
  });
});

serveCommands.on('error', (error) => { console.info(error); });

serveCommands.listen(port);
console.info(`Listening at ${port}`);
