<template>
  <div class="home">

    <div v-if="enterRoom === false">
      <div>
        <b-card-group deck>
          <b-card
              border-variant="primary"
              header="Nickname"
              header-bg-variant="primary"
              header-text-variant="white"
              align="center"
            >
            <div>
              <b-form inline>
                <b-input id="inline-form-input-name"
                  v-model="username"
                  class="mb-2 mr-sm-2 mb-sm-0"
                  placeholder="Name"></b-input>
                <b-button
                  @click="joinServer()"
                  variant="primary">Go</b-button>
              </b-form>
            </div>
          </b-card>
          </b-card-group>
      </div>
      <div v-if="isLobbyShow">
        <h1>isLobbyShow</h1>
        <div>
          <div class="mt-3">
            <b-card-group deck>
              <b-card
                @click="addRoom()"
                bg-variant="info"
                text-variant="white"
                header="addRoom"
                class="text-center">
                <b-card-text>+</b-card-text>
              </b-card>

              <b-card @click="joinRoom(room.nameRoom)"
              bg-variant="warning" text-variant="white" header="Warning" class="text-center"
              v-for="(room, i) in room" :key="i">
                <b-card-text>{{ room.nameRoom }}</b-card-text>
                <b-card-text>{{ room.status }}</b-card-text>
                <b-card-text v-if="room.client.length > 1">
                  {{ room.client[0].users }} vs {{ room.client[1].users }}</b-card-text>
                <b-card-text v-else-if="room.client.length > 0">{{ room.client[0].users }}
                  vs -
                </b-card-text>
                <b-card-text v-else > - vs - </b-card-text>
              </b-card>

              <b-card header="userOnline" class="text-center">
                <ul id="users">
                  <li v-for="v in users" :key="v.username">
                    {{ v.username }} {{ v.score }}
                  </li>
                </ul>
              </b-card>
            </b-card-group>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      in room
      <b-container class="bv-example-row bv-example-row-flex-cols">
        <b-row>
          <b-col align-self="center">{{ this.time }}</b-col>
          <b-col align-self="start">{{ this.myRoom.nameRoom }}</b-col>
          <b-col align-self="stretch">
            <b-card bg-variant="secondary"
              text-variant="white"
              class="text-center">
              <b-card-text>{{ this.myRoom.plaryer2.users }}</b-card-text>
              <b-card-text>Score</b-card-text>
              <b-card-text>{{ this.myRoom.plaryer2.score }}</b-card-text>
            </b-card>
          </b-col>
        </b-row>
        <b-row>
          <b-col align-self="stretch"></b-col>
          <b-col align-self="stretch" v-if="this.showWinLose === ''" ></b-col>
          <b-col align-self="stretch" v-else-if="this.showWinLose === 'win'" >you win</b-col>
          <b-col align-self="stretch" v-else-if="this.showWinLose === 'draw'" >draw</b-col>
          <b-col align-self="stretch" v-else-if="this.showWinLose === 'lose'" >you lose</b-col>
          <b-col align-self="stretch" v-else >code 404 </b-col>
          <b-col align-self="stretch" v-if="this.myRoom.plaryer2.bet === ''" >
            <img src="../img/waiting.png" alt="" width="100%"/></b-col>
          <b-col align-self="stretch" v-else-if="this.myRoom.plaryer2.bet === 'rock'" >
            <img src="../img/rock2.png" alt="" width="100%"/></b-col>
          <b-col align-self="stretch" v-else-if="this.myRoom.plaryer2.bet === 'scissors'" >
            <img src="../img/scissors2.png" alt="" width="100%"/></b-col>
          <b-col align-self="stretch" v-else-if="this.myRoom.plaryer2.bet === 'paper'" >
            <img src="../img/paper2.png" alt="" width="100%"/></b-col>
          <b-col align-self="stretch" v-else >
            <img src="../img/waiting.png" alt="" width="100%"/></b-col>
        </b-row>
        <b-row>
          <b-col align-self="stretch">
            <b-card bg-variant="success"
              text-variant="white"
              class="text-center">
              <b-card-text>{{ this.myRoom.plaryer1.users }}</b-card-text>
              <b-card-text>Score</b-card-text>
              <b-card-text>{{ this.myRoom.plaryer1.score }}</b-card-text>
            </b-card>
            </b-col>
          <b-col align-self="stretch" v-if="this.myRoom.plaryer1.bet === ''" >
            <img src="../img/rock.png" @click="betting('rock')" alt="" width="100%"/>
          </b-col>
          <b-col align-self="stretch" v-if="this.myRoom.plaryer1.bet === ''" >
            <img src="../img/scissors.png" @click="betting('scissors')"
          alt="" width="100%" /></b-col>
          <b-col align-self="stretch" v-if="this.myRoom.plaryer1.bet === ''" >
            <img src="../img/paper.png" @click="betting('paper')"
          alt="" width="100%"/></b-col>

          <b-col align-self="stretch" v-else-if="this.myRoom.plaryer1.bet === 'rock'" >
            <img src="../img/rock.png" alt="" width="60%"/></b-col>
          <b-col align-self="stretch" v-else-if="this.myRoom.plaryer1.bet === 'scissors'" >
            <img src="../img/scissors.png" alt="" width="60%"/></b-col>
          <b-col align-self="stretch" v-else-if="this.myRoom.plaryer1.bet === 'paper'" >
            <img src="../img/paper.png" alt="" width="60%"/></b-col>
          <b-col align-self="stretch" v-else ></b-col>
        </b-row>
      </b-container>
    </div>
  </div>
</template>

<script>
// import socket from '../socketServer';
import io from 'socket.io-client';

export default {
  name: 'Home',
  components: {},
  data() {
    return {
      username: '',
      users: [],
      socket: '',
      isLobbyShow: false,
      enterRoom: false,
      room: [],
      myRoom: {},
      time: 0,
      showWinLose: '',
    };
  },

  methods: {
    joinServer() {
      console.log('joinLoby');
      this.socket = io('http://localhost:3000');
      this.socket.emit('joinLoby', { username: this.username });
      this.mounted();
    },
    addRoom() {
      this.socket.emit('newRoom', { username: this.username });
    },
    mounted() {
      this.socket.on('room', (data) => {
        console.log('room', data);
        this.room = data;
      });
      this.socket.on('userOnline', (data) => {
        this.users = (data);
        console.log('userOnline', data);
        this.joinLoby(data);
      });
      this.socket.on('joinRoom', (data) => {
        this.users.joinRoom = (data);
        console.log('joinRoom:', data);
      });
      this.socket.on('clientOnRoom', (data) => {
        // this.users.joinRoom = (data);
        console.log('clientOnRoom:', data);
      });
      this.socket.on('enterRoom', (data) => {
        this.enterRoom = true;
        this.setRoomData(data, this.username);
        // this.users.joinRoom = (data);
        console.log('enterRoom:', data);
      });
      this.socket.on('playing', (data) => {
        console.log('playing:', data);
        this.time = data;
        if (data === 10) {
          this.showWinLose = '';
        } // ควร มี Event ไว้ set newRoom
      });
      this.socket.on('result', (data) => {
        console.log('result:', data);
        this.setRoomData(data, this.username);
      });
      this.socket.on('disconnect', (data) => {
        console.log('disconnect', data);
      });
    },
    joinLoby(user) {
      if (user) {
        if ((user).find((v) => v.username === this.username)) {
          console.log('ifif', this.username);
          this.isLobbyShow = true;
        }
        console.log('Gotoloby');
      } else {
        console.log('not user');
      }
    },
    joinRoom(data) {
      const joinRoom = {
        username: this.username,
        room: data,
      };
      console.log('joinRoom', joinRoom);
      this.socket.emit('joinRoom', joinRoom);
      console.log('joinRoom(data)', joinRoom(data));
    },
    setRoomData(data, username) {
      const a = Object.values(data.client);
      this.myRoom = {
        nameRoom: data.nameRoom,
        status: data.status,
        client: data.client,
        my: username,
        plaryer1: a.length === 1 ? '' : a.find((e) => e.users === username),
        plaryer2: a.length === 1 ? '' : a.find((e) => e.users !== username),
      };
      console.log('myRoom', this.myRoom);
      if (this.myRoom.plaryer1.winner === this.myRoom.plaryer2.winner && this.myRoom.plaryer1.winner
      === false && this.myRoom.plaryer2.winner === false) {
        this.showWinLose = 'draw';
      } else if (this.myRoom.plaryer1.winner === true) {
        this.showWinLose = 'win';
      } else if (this.myRoom.plaryer1.winner === false) {
        this.showWinLose = 'lose';
      }
    },
    betting(data) {
      console.log(data);
      const betData = {
        users: this.username,
        nameRoom: this.myRoom.nameRoom,
        bet: data,
        winner: false,
      };
      this.socket.emit('betting', betData);
    },
  },
};
</script>
