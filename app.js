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
var PLAYER_LIST = {};

var Player =  (id)=>{
  var self = {
    x:250,
    y:250,
    id:id,
    number: "" + Math.floor(10 * Math.random()),
    pressingRight:false,
    pressingLeft:false,
    pressingUp:false,
    pressingDown:false,
    maxSpd:10
  }
  self.updatePosition = ()=>{
    if(self.pressingRight)
      self.x +=self.maxSpd;
    if(self.pressingLeft)
      self.x -=self.maxSpd;
    if(self.pressingUp)
      self.y -=self.maxSpd;
    if(self.pressingDown)
      self.y +=self.maxSpd;


  }
  return self;
}

io.sockets.on('connection', (socket)=>{
  console.log('Nuevo usuario');

  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;
  let player = Player(socket.id);
  PLAYER_LIST[socket.id] = player;
  socket.on('disconnect',()=>{
    delete SOCKET_LIST[socket.id];
    delete PLAYER_LIST[socket.id];
  });
  socket.on('keyPress',(data)=>{
    if(data.inputId === 'left')
      player.pressingLeft = data.state;
    else if(data.inputId === 'right')
      player.pressingRight = data.state;
    else if(data.inputId === 'up')
      player.pressingUp = data.state;
    else if(data.inputId === 'down')
      player.pressingDown = data.state;
  });
});

setInterval(()=>{
  var pack = [];
  for(let i in PLAYER_LIST) {
      let player = PLAYER_LIST[i];
      player.updatePosition();
      pack.push({
          x:player.x,
          y:player.y,
          number:player.number
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
