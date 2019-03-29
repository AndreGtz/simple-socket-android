const net = require('net');
const request = require('request-promise');

const { port, serverurl } = process.env;

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
        uri: serverurl,
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
        .then((resp) => {
          console.info(resp);
          console.info('saved');
        })
        .catch((err) => {
          console.error(err);
        });
    } else if (/@.*$/.test(data)) {
      const index = data.indexOf('@') + 1;
      token = data.substring(index);
      console.info(token);
    }
  });

  socket.on('end', () => {
    console.info('ended conection');
  });

  socket.on('error', (e) => {
    console.error(e);
  });
});

serveCommands.on('error', (error) => { console.info(error); });

serveCommands.listen(port);
console.info(`Listening at ${port}`);
