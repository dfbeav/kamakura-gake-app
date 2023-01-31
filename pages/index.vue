<template>
  <b-col id="mainContainer" class="pt-3">
    <b-col id="alertContainer" cols="12" class="d-flex justify-content-center">
      <b-alert class="d-inline-block font-weight-bold m-2" :class="notification.animation" :show="notification.show" :variant="notification.type">{{ notification.message }}</b-alert>
    </b-col>


    <b-col cols="12" class="d-flex justify-content-center align-items-center">
      <b-col sm="6" md="2" lg="3" class="posRel d-flex align-items-center">
        <span id="musicPopoverButton" class="p-3">
          <span
            @click="stopMusic()"
            class="mb-0 mr-3 d-inline-flex bg-red musicButton cursorPointer"
            ><i class="h3 mb-0 ri-volume-up-line"></i>
          </span>
        </span>
        <b-col id="musicPopover" sm="11" md="10" lg="9" class="mt-2">
          <span class="w-100 d-flex">
            <b-form-input
              id="popover-input-1"
              class="mb-2 mr-2"
              v-model="musicVideoURL"
              size="sm"
            ></b-form-input>
            <b-button
              class="mb-2"
              variant="outline-primary"
              size="sm"
              @click="changeMusic()"
              ><i class="ri-check-line"></i>
            </b-button>
          </span>
            <!-- responsive youtube video -->
            <div class="embed-responsive embed-responsive-16by9">
              <iframe class="embed-responsive-item" :src="parsedMusicVideoURL()" allow='autoplay'></iframe>
            </div>
        </b-col>

        <h5 class="mb-0 px-3 d-flex align-items-center font-weight-bold" :class="'text-' + gameData.players[thisUserIndex].color">
          <i class="ri-account-circle-line pr-1"></i>
          {{ gameData.players[thisUserIndex].name }}'s Turn
        </h5>
      </b-col>
      <b-col sm="10" md="8" lg="6">
        <img class="w-100" :src="require('~/assets/images/logo.svg')" alt="Kamakura Geku Logo">
      </b-col>
      <b-col sm="6" md="2" lg="3" class="d-flex justify-content-end">
        <b-button
          v-if="placeUnits"
          class="pl-3 d-inline-flex justify-content-center align-items-center font-weight-bold"
          :variant="thisUserIndex === 0 ? 'outline-primary' : 'outline-danger'"
          :disabled="!completeUnitPlacement()"
          @click="thisUserIndex < gameData.players.length -1 ? thisUserIndex + 1 : [playGame = true, placeUnits = false, thisUserIndex = 0 ]">
          Finish Placement
          <i class="ri-arrow-right-s-line"></i>
        </b-button>
        <b-button
          v-if="playGame"
          class="pl-3 d-inline-flex justify-content-center align-items-center font-weight-bold"
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
      :tileHeight="tileHeight"
      :startingPieces="startingPieces"
      :playGame="playGame"
      :placeUnits="placeUnits"
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

      boardSize: 390,
      tileSize: 5, //in percentage
      tileHeight: 0, //in pixels

      thisUserIndex: 0,

      placeUnits: true,
      playGame: false,

      startingPieces: [10, 10, 10, 10, 10] as any,



      gameData: {

        players: [
          {
            id: 0,
            name: 'Blue',
            color: 'blue',
            score: 0,
            isTurn: true,
          },
          {
            id: 1,
            name: 'Red',
            color: 'red',
            score: 0,
            isTurn: false,
          },
        ],

        gameBoardData: [] as any,

      },

      notification: {
          show: false,
          message: '',
          type: '',
          animation: 'slide-in-top',
        } as any
    }
  },
  mounted() {
    this.createBoard()

    setTimeout(() => {
        //this.musicVideoURL = this.musicVideoURL + '&autoplay=1';
        this.setTileHeight();
      }, 1000)

      //Event listener for screen resize
      window.addEventListener('resize', this.resizeBoard)

  },
  methods: {
    createBoard: function() {
      for (let i = 0; i < this.boardSize; i++) {
        this.gameData.gameBoardData.push({
          playerIndex: -1,
        })
      }
    },
    resizeBoard: function() {
      this.setTileHeight()
    },
    setTileHeight: function() {
      //set tile height
      let firstTile = document.getElementById('tile_0')
      if (firstTile) {
        this.tileHeight = firstTile.clientWidth
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
    defaultGameData: function() {

      let player1Tiles = [
        {tileIndex: 3, playerIndex: 1, value: 5},
        {tileIndex: 4, playerIndex: 1, value: 5},
        {tileIndex: 5, playerIndex: 1, value: 5},
        {tileIndex: 6, playerIndex: 1, value: 5},
        {tileIndex: 7, playerIndex: 1, value: 5},
        {tileIndex: 8, playerIndex: 1, value: 5},
        {tileIndex: 9, playerIndex: 1, value: 5},
        {tileIndex: 10, playerIndex: 1, value: 5},
        {tileIndex: 11, playerIndex: 1, value: 5},
        {tileIndex: 12, playerIndex: 1, value: 5},
        {tileIndex: 13, playerIndex: 1, value: 5},
        {tileIndex: 14, playerIndex: 1, value: 5},
        {tileIndex: 15, playerIndex: 1, value: 5},

        {tileIndex: 22, playerIndex: 1, value: 4},
        {tileIndex: 23, playerIndex: 1, value: 4},
        {tileIndex: 24, playerIndex: 1, value: 4},
        {tileIndex: 25, playerIndex: 1, value: 4},
        {tileIndex: 26, playerIndex: 1, value: 4},
        {tileIndex: 27, playerIndex: 1, value: 4},
        {tileIndex: 28, playerIndex: 1, value: 4},
        {tileIndex: 29, playerIndex: 1, value: 4},
        {tileIndex: 30, playerIndex: 1, value: 4},
        {tileIndex: 31, playerIndex: 1, value: 4},
        {tileIndex: 32, playerIndex: 1, value: 4},
        {tileIndex: 33, playerIndex: 1, value: 4},
        {tileIndex: 34, playerIndex: 1, value: 4},
        {tileIndex: 35, playerIndex: 1, value: 4},

        {tileIndex: 42, playerIndex: 1, value: 3},
        {tileIndex: 43, playerIndex: 1, value: 3},
        {tileIndex: 44, playerIndex: 1, value: 3},
        {tileIndex: 45, playerIndex: 1, value: 3},
        {tileIndex: 46, playerIndex: 1, value: 3},
        {tileIndex: 47, playerIndex: 1, value: 3},
        {tileIndex: 48, playerIndex: 1, value: 3},
        {tileIndex: 49, playerIndex: 1, value: 3},
        {tileIndex: 50, playerIndex: 1, value: 3},
        {tileIndex: 51, playerIndex: 1, value: 3},
        {tileIndex: 52, playerIndex: 1, value: 3},
        {tileIndex: 53, playerIndex: 1, value: 3},
        {tileIndex: 54, playerIndex: 1, value: 3},

        {tileIndex: 61, playerIndex: 1, value: 2},
        {tileIndex: 62, playerIndex: 1, value: 2},
        {tileIndex: 63, playerIndex: 1, value: 2},
        {tileIndex: 64, playerIndex: 1, value: 2},
        {tileIndex: 65, playerIndex: 1, value: 2},
        {tileIndex: 66, playerIndex: 1, value: 2},
        {tileIndex: 67, playerIndex: 1, value: 2},
        {tileIndex: 68, playerIndex: 1, value: 2},
        {tileIndex: 69, playerIndex: 1, value: 2},
        {tileIndex: 70, playerIndex: 1, value: 2},
        {tileIndex: 71, playerIndex: 1, value: 2},
        {tileIndex: 72, playerIndex: 1, value: 2},
        {tileIndex: 73, playerIndex: 1, value: 2},
        {tileIndex: 74, playerIndex: 1, value: 2},

        {tileIndex: 81, playerIndex: 1, value: 1},
        {tileIndex: 82, playerIndex: 1, value: 1},
        {tileIndex: 83, playerIndex: 1, value: 1},
        {tileIndex: 84, playerIndex: 1, value: 1},
        {tileIndex: 85, playerIndex: 1, value: 1},
        {tileIndex: 86, playerIndex: 1, value: 1},
        {tileIndex: 87, playerIndex: 1, value: 1},
        {tileIndex: 88, playerIndex: 1, value: 1},
        {tileIndex: 89, playerIndex: 1, value: 1},
        {tileIndex: 90, playerIndex: 1, value: 1},
        {tileIndex: 91, playerIndex: 1, value: 1},
        {tileIndex: 92, playerIndex: 1, value: 1},
        {tileIndex: 93, playerIndex: 1, value: 1},

      ]

      let player2Tiles = [
        {tileIndex: 373, playerIndex: 0, value: 5},
        {tileIndex: 374, playerIndex: 0, value: 5},
        {tileIndex: 375, playerIndex: 0, value: 5},
        {tileIndex: 376, playerIndex: 0, value: 5},
        {tileIndex: 377, playerIndex: 0, value: 5},
        {tileIndex: 378, playerIndex: 0, value: 5},
        {tileIndex: 379, playerIndex: 0, value: 5},
        {tileIndex: 380, playerIndex: 0, value: 5},
        {tileIndex: 381, playerIndex: 0, value: 5},
        {tileIndex: 382, playerIndex: 0, value: 5},
        {tileIndex: 383, playerIndex: 0, value: 5},
        {tileIndex: 384, playerIndex: 0, value: 5},
        {tileIndex: 385, playerIndex: 0, value: 5},
        {tileIndex: 386, playerIndex: 0, value: 5},

        {tileIndex: 354, playerIndex: 0, value: 4},
        {tileIndex: 355, playerIndex: 0, value: 4},
        {tileIndex: 356, playerIndex: 0, value: 4},
        {tileIndex: 357, playerIndex: 0, value: 4},
        {tileIndex: 358, playerIndex: 0, value: 4},
        {tileIndex: 359, playerIndex: 0, value: 4},
        {tileIndex: 360, playerIndex: 0, value: 4},
        {tileIndex: 361, playerIndex: 0, value: 4},
        {tileIndex: 362, playerIndex: 0, value: 4},
        {tileIndex: 363, playerIndex: 0, value: 4},
        {tileIndex: 364, playerIndex: 0, value: 4},
        {tileIndex: 365, playerIndex: 0, value: 4},
        {tileIndex: 366, playerIndex: 0, value: 4},

        {tileIndex: 334, playerIndex: 0, value: 3},
        {tileIndex: 335, playerIndex: 0, value: 3},
        {tileIndex: 336, playerIndex: 0, value: 3},
        {tileIndex: 337, playerIndex: 0, value: 3},
        {tileIndex: 338, playerIndex: 0, value: 3},
        {tileIndex: 339, playerIndex: 0, value: 3},
        {tileIndex: 340, playerIndex: 0, value: 3},
        {tileIndex: 341, playerIndex: 0, value: 3},
        {tileIndex: 342, playerIndex: 0, value: 3},
        {tileIndex: 343, playerIndex: 0, value: 3},
        {tileIndex: 344, playerIndex: 0, value: 3},
        {tileIndex: 345, playerIndex: 0, value: 3},
        {tileIndex: 346, playerIndex: 0, value: 3},
        {tileIndex: 347, playerIndex: 0, value: 3},

        {tileIndex: 315, playerIndex: 0, value: 2},
        {tileIndex: 316, playerIndex: 0, value: 2},
        {tileIndex: 317, playerIndex: 0, value: 2},
        {tileIndex: 318, playerIndex: 0, value: 2},
        {tileIndex: 319, playerIndex: 0, value: 2},
        {tileIndex: 320, playerIndex: 0, value: 2},
        {tileIndex: 321, playerIndex: 0, value: 2},
        {tileIndex: 322, playerIndex: 0, value: 2},
        {tileIndex: 323, playerIndex: 0, value: 2},
        {tileIndex: 324, playerIndex: 0, value: 2},
        {tileIndex: 325, playerIndex: 0, value: 2},
        {tileIndex: 326, playerIndex: 0, value: 2},
        {tileIndex: 327, playerIndex: 0, value: 2},

        {tileIndex: 295, playerIndex: 0, value: 1},
        {tileIndex: 296, playerIndex: 0, value: 1},
        {tileIndex: 297, playerIndex: 0, value: 1},
        {tileIndex: 298, playerIndex: 0, value: 1},
        {tileIndex: 299, playerIndex: 0, value: 1},
        {tileIndex: 300, playerIndex: 0, value: 1},
        {tileIndex: 301, playerIndex: 0, value: 1},
        {tileIndex: 302, playerIndex: 0, value: 1},
        {tileIndex: 303, playerIndex: 0, value: 1},
        {tileIndex: 304, playerIndex: 0, value: 1},
        {tileIndex: 305, playerIndex: 0, value: 1},
        {tileIndex: 306, playerIndex: 0, value: 1},
        {tileIndex: 307, playerIndex: 0, value: 1},
        {tileIndex: 308, playerIndex: 0, value: 1},
      ]

      player1Tiles.forEach((tile:any) => {
        this.$set(this.gameData.gameBoardData, tile.tileIndex, {
          playerIndex: tile.playerIndex,
          value: tile.value,
        })
      })

      player2Tiles.forEach((tile:any) => {
        this.$set(this.gameData.gameBoardData, tile.tileIndex, {
          playerIndex: tile.playerIndex,
          value: tile.value,
        })
      })

      //Next tick
      this.$nextTick(() => {
        this.setTileHeight()
      })

    },
    parsedMusicVideoURL: function() {
      return this.musicVideoURL.replace('watch?v=', 'embed/')
    },
    stopMusic: function() {
      this.musicVideoURL = this.musicVideoURL.replace('&autoplay=1', '')
    },
    changeMusic: function() {
      setTimeout(() => {
        this.musicVideoURL = this.musicVideoURL + '?autoplay=1';
      }, 1000)
    },
    createNotification(message:any, type:any) {
      this.notification.message = message;
      this.notification.type = type;
      this.notification.show = true;

      setTimeout(() => {
        this.notification.animation = 'slide-out-top';

        setTimeout(() => {
          this.notification.show = false;

          setTimeout(() => {
            this.notification.animation = 'slide-in-top';
          }, 1000)
        }, 1000)
      }, 5000)
    },
    completeUnitPlacement: function() {
      //nextTick
      let complete = true

      this.startingPieces.forEach((piece: any, index: number) => {
        if (piece > 0) {
          complete = false
        }
      })

      return complete
    },
  },
  computed: {

  }
})

</script>
