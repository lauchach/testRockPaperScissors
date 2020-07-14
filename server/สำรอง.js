
let app = require('express')();
let http = require('http').createServer(app);
let Socketio = require("socket.io")(http);
let users = [];
let messages = [];
let allRoom = [];
let room = [];
let pushBetting = {}
// let time = [];



class game {
  constructor() {
    this.socketTest()
  }

  socketTest() {
    Socketio.on('connect', (socket) => {
      console.log('connect', 'users', users)


      socket.on('joinLoby', (data) => {
        users.push(data)
        console.log('data', data);
        Socketio.sockets.emit('userOnline', users);
        // Socketio.sockets.emit('room', room);
        Socketio.sockets.emit('room', allRoom);
      });


      socket.on('newRoom', (data) => {
        // console.log('newRoom')
        // newRoom.newRoom()
        this.createRoom()
      });

      socket.on('joinRoom', data => {
        // console.log('joinRoom1:', data, 'allRoom1:', allRoom)

        let joinRoom = allRoom.find(e => e.nameRoom === data.room)
        console.log('allRoom:', allRoom)
        joinRoom.client.push({ users: data.username,
          nameRoom: '', bet: '', winner: false
         })
        // allRoom. = joinRoom.client.push(data.username)
        // console.log('joinRoom2:', joinRoom, 'allRoom2:', allRoom)
        // console.log('allRoom2', JSON.stringify(allRoom))


        // 'getroomdata' /////
        socket.join([joinRoom.nameRoom]);
        //-to cli emit-
        // console.log('this.roomData(joinRoom.nameRoom):', this.roomData(joinRoom.nameRoom))
        let roomData = this.roomData(joinRoom.nameRoom)
        Socketio.to([joinRoom.nameRoom]).emit('enterRoom', roomData);
        // Socketio.to([joinRoom.nameRoom]).emit("enterRoom")
        if (roomData.client.length === 2) {
          console.log('roomData:', roomData.client.length)
          this.gameStart(roomData)
        }
      });

      socket.on('betting', data => {
        // console.log('betting:', data)
        this.pushBetting(data)
      });




      // Disconnect
      socket.on("disconnect", () => {
        console.log(`${socket.username} Exit room.`);
        Socketio.emit("userOut", socket.username);
        users.splice(users.indexOf(socket), 1);
      });
    });

    http.listen(3000, () => {
      console.log('listening on *:3000')
    });
  }


  createRoom() {
    console.log('allRoom.length', allRoom.length)
    let roomName = allRoom.length === 0 ? 'ROOM1' : `ROOM${allRoom.length + 1}`
    room = {
      nameRoom: roomName,
      status: 'normal',
      client: []
    }
    allRoom.push(room)
    console.log('create room:', allRoom)
    Socketio.sockets.emit('room', allRoom)
  }

  roomData(data) {
    let roomData = allRoom.find(e => e.nameRoom === data)
    return roomData
  }

  readyStart(data) {
    if (data.client.length === 2) {
    console.log('roomData:', data.client.length)
    this.gameStart(data)
    }
  }

  gameStart(data) {
    console.log('gameStart', data)
    // coutdowntime
    let coutDownTime = 6
    this.timeInterval = setInterval(() => {
      if (--coutDownTime === -1) {
        clearInterval(this.timeInterval)
        console.log('coutDownTime in if:', coutDownTime)
        this.result(data.nameRoom)
      } else {
        Socketio.to(data.nameRoom).emit('playing', coutDownTime);
      }
    }, 1000)
  }

  pushBetting(data) {
    // console.log('pushBetting', data)
    // console.log('allRoom>>', allRoom)
    // console.log('allRoom>>',JSON.stringify(allRoom))
    let findClient = allRoom.find((e, i) => e.nameRoom === data.nameRoom)
    
    if (findClient) {
      // console.log('findClient', findClient)
      let _findClient = findClient.client.find(e => e.users === data.users)
      if(_findClient){
        // console.log('_findClient', _findClient)
        _findClient.users = data.users
        _findClient.nameRoom = data.nameRoom
        _findClient.bet = data.bet
        _findClient.winner = data.winner
      }
    }
    // console.log('allRoom2', JSON.stringify(allRoom))
      // console.log('pushBet' ,pushBet)
      // allRoom.client.users.push(data)
      // console.log('allRoom', allRoom)
    
    

    // let findClient = pushBet.client.find((e, i) => e.users === data.users)
    // console.log('findClient1', findClient)
    // findClient = (data)
    // console.log('findClient2',findClient)
    // pushBet.client.users.push(data)
    // console.log('pushBet>>', pushBet)
    // let room = this.roomData(data.nameRoom)
    // console.log('room>>>', room)
    // let pushBet = room.client.find(e => e.users === data.users)
    //     console.log('pushBet::', pushBet)
    //     pushBet.client.push({ data })
    //   console.log('pushBet2', pushBet)
    // // this.pushBetting[`${data.nameRoom}`] = {
    // //   nameRoom: data.nameRoom,
    // //   betdata: data 
    // // }
    // let joinRoom = allRoom.find(e => e.nameRoom === data.room)
    //     console.log('allRoom:', allRoom)
    //     joinRoom.client.push({ users: data.username })
  }


  result(data) {
    console.log('result data>>>',data)
    let findRoom = allRoom.find((e, i) => e.nameRoom === data)
    // let findClient = findRoom.client.users.bet
    if(findRoom.client[0].bet === findRoom.client[1].bet){
      findRoom.client[0].winner = false
      findRoom.client[1].winner = false
    } else if (findRoom.client[0].bet === "rock") {
      if (findRoom.client[1].bet === "scissors") {
        findRoom.client[0].winner = true
        findRoom.client[1].winner = false
      } else if (findRoom.client[1].bet === "paper") {
        findRoom.client[0].winner = false
        findRoom.client[1].winner = true
      }
    } else if (findRoom.client[0].bet === "scissors") {
      if (findRoom.client[1].bet === "paper") {
        findRoom.client[0].winner = true
        findRoom.client[1].winner = false
      } else if (findRoom.client[1].bet === "rock") {
        findRoom.client[0].winner = false
        findRoom.client[1].winner = true
      }
    } else if (findRoom.client[0].bet === "paper") {
      if (findRoom.client[1].bet === "rock") {
        findRoom.client[0].winner = true
        findRoom.client[1].winner = false
      } else if (findRoom.client[1].bet === "scissors") {
        findRoom.client[0].winner = false
        findRoom.client[1].winner = true
      }
    } else {
        console.log('error 404')
    }
    let res_findRoom = allRoom.find(e => e.nameRoom === data)
    Socketio.to(data).emit('result', res_findRoom);
    this.readyStart(res_findRoom)
    // console.log('allRoom end', JSON.stringify(allRoom))
  }

}

new game






// const io = require('socket.io')(3000);
// console.log('3000')
// let users = []

// app.get('/', (req, res) => {
//   res.send('<h1>Hello world TEST</h1>');
// });

// io.on('connect', (socket) => {
//   console.log('connect')
//   socket.emit('userOnline', { key: 'users'});
//   // console.log('connect:', 'socket.conn.server', 'clients:', socket.server.engine);

//   // socket.send('Hello!'); 

//   socket.on('joinLoby', (data) => {
//     console.log('data');
//     users.push({
//       username: data
//     })
//     // socket.emit('userOnline', users);
//   });

//   socket.on('message', (data) => {
//     console.log(data);
//   });

// });
