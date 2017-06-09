const express  = require('express'),
      app = express(),
      path = require('path'),
      server = require('http').Server(app),
      io = require('socket.io')(server),
      port = process.env.PORT || 3000;

app.get('/', (req, res, next)=>{
  res.sendFile(__dirname + '/public/index.html');
});
var SOCKET_LIST = {};

io.sockets.on('connection', (socket)=>{
  console.log('Nuevo usuario');

  socket.id = Math.random();
  socket.x = 0;
  socket.y = 0;
  SOCKET_LIST[socket.id] = socket;

});

setInterval(()=>{
  var pack = [];
  for(let i in SOCKET_LIST) {
      var socket = SOCKET_LIST[i];
      socket.x++;
      socket.y++;
      pack.push({
          x:socket.x,
          y:socket.y
      });
    }
  for(let i in SOCKET_LIST){
    var socket = SOCKET_LIST[i];
    socket.emit('newPositions',pack);
  }
  },1000/25);

app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, 'bower_components')));

server.listen(port, (err) => {
  console.log(err || 'listening on my very special port ' + port)
});
