
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
      socket.on('joinLoby', (data) => {
        users = [...users, {
          username: data.username,
          score: 0
        }]
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
          console.log('roomFull')
        }
      });

      socket.on('betting', data => {
        console.log('betting', data)
        this.pushBetting(data)
      });

      socket.on("disconnect", () => {
        Socketio.emit("userOut", socket.username);
        users.splice(users.indexOf(socket), 1);
      });
    });

    http.listen(3000, () => {
      console.log('listening on *:3000')
    });
  }

  createRoom() {
    let roomName = allRoom.length === 0 ? 'ROOM1' : `ROOM${allRoom.length + 1}`
    room = {
      nameRoom: roomName,
      status: 'normal',
      client: []
    }
    allRoom.push(room)
    Socketio.sockets.emit('room', allRoom)
  }

  roomData(data) {
    let roomData = allRoom.find(e => e.nameRoom === data)
    return roomData
  }

  readyStart(data) {
    if (data.client.length > 1) {
      let res_findRoom = allRoom.find(e => e.nameRoom === data.nameRoom)
      let playIsBetting = res_findRoom.client.filter(e => e.bet !== '') //ควรแก้ไข
      if (playIsBetting) {
        for (let i = 0; i < playIsBetting.length; i++) {
          playIsBetting[i] = {
            users: playIsBetting[i].users,
            nameRoom: playIsBetting[i].nameRoom,
            bet: '',
            winner: false,
            score: playIsBetting[i].score
          }
        }
        res_findRoom.client = playIsBetting
      }
      this.gameStart(res_findRoom)
    } else {
      console.log('WAITING:', 'WAITING')
    }
  }

  gameStart(data) {
    let coutDownTime = 11
    let timeInterval = setInterval(() => {
      if (--coutDownTime === -1) {
        clearInterval(timeInterval)
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
    let findRoom = allRoom.find((e, i) => e.nameRoom === data)
    if (findRoom.client[0].bet && findRoom.client[1].bet) {
      if (findRoom.client[0].bet === findRoom.client[1].bet) {
        findRoom.client[0].winner = false
        findRoom.client[1].winner = false
      } else if (findRoom.client[0].bet === "rock") {
        if (findRoom.client[1].bet === "scissors") {
          findRoom.client[0].winner = true
          findRoom.client[0].score = findRoom.client[0].score + 1
          findRoom.client[1].winner = false
        } else if (findRoom.client[1].bet === "paper") {
          findRoom.client[0].winner = false
          findRoom.client[1].winner = true
          findRoom.client[1].score = findRoom.client[1].score + 1
        }
      } else if (findRoom.client[0].bet === "scissors") {
        if (findRoom.client[1].bet === "paper") {
          findRoom.client[0].winner = true
          findRoom.client[0].score = findRoom.client[0].score + 1
          findRoom.client[1].winner = false
        } else if (findRoom.client[1].bet === "rock") {
          findRoom.client[0].winner = false
          findRoom.client[1].winner = true
          findRoom.client[1].score = findRoom.client[1].score + 1
        }
      } else if (findRoom.client[0].bet === "paper") {
        if (findRoom.client[1].bet === "rock") {
          findRoom.client[0].winner = true
          findRoom.client[0].score = findRoom.client[0].score + 1
          findRoom.client[1].winner = false
        } else if (findRoom.client[1].bet === "scissors") {
          findRoom.client[0].winner = false
          findRoom.client[1].winner = true
          findRoom.client[1].score = findRoom.client[1].score + 1
        }
      } else {
        console.log('error 404')
      }
    }
    let res_findRoom = allRoom.find(e => e.nameRoom === data)
    // let findWinner = res_findRoom.client.find(e => e.winner === true)
    // if (findWinner) {
    // findWinner.score = findWinner.score + 1
    // }
    Socketio.to(data).emit('result', res_findRoom);
    // this.usersScore(res_findRoom)
    this.readyStart(res_findRoom)
    Socketio.sockets.emit('userOnline', users);
  }

  // usersScore(data) {
  //   let _data = data
  //   for (let i = 0; i < users.length; i++) {
  //     let findUsersScore = _data.client.filter(e => e.users === users[i].username)
  //     if (findUsersScore[0]) {
  //       users[i].score = findUsersScore[0].score
  //     }
  //   }
  // }

}

new game