const net = require('net');
const request = require('request-promise');

const { port, serverurl } = process.env;

const serveCommands = net.createServer((socket) => {
  let token;
  socket.setEncoding('utf8');

  socket.on('data', (data) => {
    console.info(data);
    if (/^#.*/.test(data)) {
      const [imei, latitud, longitud, velocidad] = data.substring(1).split(',');
      request({
        method: 'POST',
        uri: serverurl,
        body: {
          imei,
          latitud,
          longitud,
          velocidad,
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
    } else {
      token = data;
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
