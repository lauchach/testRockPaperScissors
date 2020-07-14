
let app = require('express')();
let http = require('http').createServer(app);
let Socketio = require("socket.io")(http);
let users = [];
let messages = [];
let allRoom = [];
let room = [];
let pushBetting = {}


class game {
  constructor() {
    this.socketTest()
  }

  socketTest() {
    Socketio.on('connect', (socket) => {
      console.log('connect', 'users', users)

      socket.on('joinLoby', (data) => {
        console.log('joinLoby:', data)
        let _data = {}
        if (_data) {
          _data.username = data.username
          _data.score = 0
        }
        users.push(_data)
        console.log('joinLoby/users.push(data):', users)
        Socketio.sockets.emit('userOnline', users);
        Socketio.sockets.emit('room', allRoom);
      });

      socket.on('newRoom', (data) => {
        this.createRoom()
      });

      socket.on('joinRoom', data => {
        let joinRoom = allRoom.find(e => e.nameRoom === data.room)
        if (joinRoom.client.length < 2) {
          joinRoom.status = 'WAITING'
          joinRoom.client.push({
            users: data.username,
            nameRoom: '', bet: '', winner: false, score: 0
          })

          // 'roomdata' /////
          socket.join([joinRoom.nameRoom]);
          let roomData = this.roomData(joinRoom.nameRoom)
          Socketio.to([joinRoom.nameRoom]).emit('enterRoom', roomData);

          if (roomData.client.length === 2) {
            let _joinRoom = allRoom.find(e => e.nameRoom === data.room)
            if (_joinRoom) {
              _joinRoom.status = 'PLAYING'
            }
            this.gameStart(roomData)
          }
          Socketio.sockets.emit('room', allRoom);
        } else {
          ///emit max client
          console.log('roomFull')
        }
      });

      socket.on('betting', data => {
        console.log('betting:', data)
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
    if (data.client.length > 1) {
      console.log('readyStart:', data)

      let res_findRoom = allRoom.find(e => e.nameRoom === data.nameRoom)
      let findWinner = res_findRoom.client.find(e => e.bet) //ควรแก้ไข
      if (findWinner) {
        findWinner.bet = ''
        findWinner.winner = false
      }
      this.gameStart(res_findRoom)
      console.log('readyStart/allRoom', JSON.stringify(allRoom))
    } else {
      console.log('WAITING:', 'WAITING')
    }
  }

  gameStart(data) {
    console.log('gameStart')
    let coutDownTime = 11
    let timeInterval = setInterval(() => {
      if (--coutDownTime === -1) {
        clearInterval(timeInterval)
        console.log('coutDownTime in if:', coutDownTime)
        this.result(data.nameRoom)
      } else {
        Socketio.to(data.nameRoom).emit('playing', coutDownTime);
      }
    }, 1000)
  }

  pushBetting(data) {
    let findClient = allRoom.find((e, i) => e.nameRoom === data.nameRoom)

    if (findClient) {
      let _findClient = findClient.client.find(e => e.users === data.users)
      if (_findClient) {
        _findClient.users = data.users
        _findClient.nameRoom = data.nameRoom
        _findClient.bet = data.bet
        _findClient.winner = data.winner
      }
    }
  }

  result(data) {
    console.log('result data>>>', data)
    let findRoom = allRoom.find((e, i) => e.nameRoom === data)
    if (findRoom.client[0].bet === findRoom.client[1].bet) {
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
    let findWinner = res_findRoom.client.find(e => e.winner === true)
    if (findWinner) {
      findWinner.score = findWinner.score + 1
    }
    Socketio.to(data).emit('result', res_findRoom);
    this.usersScore(res_findRoom)
    this.readyStart(res_findRoom)
    Socketio.sockets.emit('userOnline', users);
  }

  usersScore(data) {
    console.log('usersScore/usersBefor:', users)
    console.log('usersScore/data1:', data)
    let _data = data
    for (let i = 0; i < users.length; i++) {
      let findUsersScore = _data.client.filter(e => e.users === users[i].username)
      console.log('usersScore/findUsers:', findUsersScore)
      if (findUsersScore[0]) {
        users[i].score = findUsersScore[0].score
      }
    }
    console.log('usersScore/usersAfter:', users)
  }

}

new game