<template>
  <b-col>
    <b-col cols="12" class="d-flex justify-content-center align-items-center">
      <b-col sm="6" md="2" lg="3" class="posRel">
        <span id="musicPopoverButton" class="p-3">
          <span
            @click="stopMusic()"
            class="mb-0 d-inline-flex bg-red musicButton cursorPointer"
            ><i class="h3 mb-0 ri-volume-up-line"></i>
          </span>
        </span>
        <b-col id="musicPopover" sm="11" md="10" lg="9" class="mt-2">
          <b-form-input
              ref="input1"
              id="popover-input-1"
              class="w-100 mb-2"
              v-model="musicVideoURL"
              size="sm"
            ></b-form-input>
            <!-- responsive youtube video -->
            <div class="embed-responsive embed-responsive-16by9">
              <iframe class="embed-responsive-item" :src="parsedMusicVideoURL()" allow='autoplay'></iframe>

            </div>
        </b-col>
      </b-col>
      <b-col sm="10" md="8" lg="6">
        <img class="w-100" :src="require('~/assets/images/logo.svg')" alt="Kamakura Geku Logo">
      </b-col>
      <b-col sm="6" md="2" lg="3">
        <b-button
          class="w-100 d-flex justify-content-center align-items-center font-wight-bold"
          :variant="thisUserIndex === 0 ? 'outline-primary' : 'outline-danger'"
          @click="finishTurn">
          Finish Turn
          <i class="ri-arrow-right-s-line"></i>
        </b-button>
      </b-col>
    </b-col>
    <GameBoard
      :gameData="gameData"
      :thisUserIndex="thisUserIndex"
      :tileSize="tileSize"
    />
    <b-col cols="12" class="my-3 text-center">
      <p class="text-light">「最大の勝利は戦いをすることなくするものである」</p>
    </b-col>
  </b-col>
</template>

<script lang="ts">
import Vue from 'vue'

import 'remixicon/fonts/remixicon.css'


export default Vue.extend({
  name: 'Kamakura-Geku',
  data() {
    return {
      musicVideoURL: 'https://www.youtube.com/watch?v=ZxGiEoczryg?t=254',
      musicPopover: false,
      muted: true,

      boardSize: 253,

      tileSize: 5, //in percentage

      thisUserIndex: 0,

      gameData: {

        players: [
          {
            id: 0,
            name: 'Player 1',
            color: 'blue',
            score: 0,
            isTurn: true,
          },
          {
            id: 1,
            name: 'Player 2',
            color: 'red',
            score: 0,
            isTurn: false,
          },
        ],

        gameBoardData: [] as any,
      },

    }
  },
  mounted() {
    this.createBoard()

    // setTimeout(() => {
    //     this.musicVideoURL = this.musicVideoURL + '&autoplay=1';
    //   }, 1000)
  },
  methods: {
    createBoard: function() {
      for (let i = 0; i < this.boardSize; i++) {
        this.gameData.gameBoardData.push({
          playerIndex: -1,
        })

        if (i === this.boardSize - 1) {
          this.setupGameData();
        }
      }
    },
    moveToTile: function(previousTileIndex:number, index:number):any {

      console.log(JSON.stringify(this.gameData.gameBoardData[previousTileIndex]))

      this.$set(this.gameData.gameBoardData, index, {
        ...this.gameData.gameBoardData[previousTileIndex],
        moved: true,
      })
      this.$set(this.gameData.gameBoardData, previousTileIndex, {
        playerIndex: -1
      })

    },
    attackTile: function(index:number) {

    },
    finishTurn: function() {
      this.gameData.gameBoardData.forEach((tile:any) => {
        if (tile.moved) {
          tile.moved = false
        }
      })
      this.thisUserIndex = this.thisUserIndex === 1 ? 0 : this.thisUserIndex + 1
    },
    setupGameData: function() {
      const newData125 = {
        playerIndex: 0,
        value: 2,
      }
      this.$set(this.gameData.gameBoardData, 125, newData125)

      const newData126 = {
        playerIndex: 0,
        value: 3,
      }
      this.$set(this.gameData.gameBoardData, 126, newData126)

      const newData105 = {
        playerIndex: 1,
        value: 3,
      }
      this.$set(this.gameData.gameBoardData, 105, newData105)

      const newData106 = {
        playerIndex: 1,
        value: 5,
      }
      this.$set(this.gameData.gameBoardData, 106, newData106)

      const newData104 = {
        playerIndex: 1,
        value: 2,
      }
      this.$set(this.gameData.gameBoardData, 104, newData104)

      const newData124 = {
        playerIndex: 1,
        value: 1,
      }
      this.$set(this.gameData.gameBoardData, 124, newData124)
    },
    parsedMusicVideoURL: function() {
      return this.musicVideoURL.replace('watch?v=', 'embed/')
    },
    stopMusic: function() {
      this.musicVideoURL = this.musicVideoURL.replace('&autoplay=1', '')
    },
  },
  computed: {

  }

})

</script>
