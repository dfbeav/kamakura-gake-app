<template>
  <b-col id="mainContainer"
    class="pt-3"
    :class="playGame || placeUnits ? '' : 'catfishBackground'"
    >
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

        <h5
          v-if="placeUnits || playGame"
          class="mb-0 px-3 d-flex align-items-center font-weight-bold"
          :class="'text-' + gameData.players[thisUserIndex].color">
          <i class="ri-account-circle-line pr-1"></i>
          {{ gameData.players[thisUserIndex].name }}'s Turn
        </h5>
      </b-col>
      <b-col sm="10" md="8" lg="6">
        <img class="w-100" :src="require('~/assets/images/logo.svg')" alt="Kamakura Geku Logo">
      </b-col>
      <b-col sm="6" md="2" lg="3" class="d-flex justify-content-end">
        <b-button
          v-if="placeUnits && thisUserIndex < gameData.players.length - 1"
          class="pl-3 d-inline-flex justify-content-center align-items-center font-weight-bold"
          :variant="thisUserIndex === 0 ? 'primary' : 'danger'"
          :disabled="!completedUnitPlacement"
          @click="thisUserIndex++; $store.commit('setSelectedPieceType', {selectedPieceType: 0}); startingPieces = startingPiecesReset">
          Finish Placement
          <i class="ri-arrow-right-s-line"></i>
        </b-button>
        <b-button
          v-if="placeUnits && thisUserIndex === gameData.players.length - 1"
          class="pl-3 d-inline-flex justify-content-center align-items-center font-weight-bold"
          :variant="thisUserIndex === 0 ? 'primary' : 'danger'"
          :disabled="!completedUnitPlacement"
          @click="playGame = true; placeUnits = false; thisUserIndex = 0">
          Start Game
          <i class="ri-arrow-right-s-line"></i>
        </b-button>
        <b-button
          v-if="playGame"
          class="pl-3 d-inline-flex justify-content-center align-items-center font-weight-bold"
          :variant="thisUserIndex === 0 ? 'primary' : 'danger'"
          @click="finishTurn">
          Finish Turn
          <i class="ri-arrow-right-s-line"></i>
        </b-button>
      </b-col>
    </b-col>


    <!-- Start Selection -->
    <b-col cols="12" class="d-flex justify-content-center align-items-center">
      <div
        v-if="!placeUnits && !playGame"
        id="positionSelectionModal"
        class="my-5 p-3 popupContainer fade-in-delayed"
        >
        <b-col cols="12" class="text-center text-dark">
          <h5>Select Unit Placement or Start with Default</h5>
        </b-col>
        <b-col cols="12" class="d-flex justify-content-center mt-3 mb-1">
          <b-button
            class="pl-3 mx-1 d-inline-flex justify-content-center align-items-center font-weight-bold"
            variant="primary"
            @click="startPlaceUnits();"
            >
            Place Units
            <i class="ri-arrow-right-s-line"></i>
          </b-button>
          <b-button
            class="pl-3 mx-1 d-inline-flex justify-content-center align-items-center font-weight-bold"
            variant="danger"
            @click="defaultGameData()"
            >
            Default Start
            <i class="ri-arrow-right-s-line"></i>
          </b-button>
        </b-col>
      </div>
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


    <b-col
      cols="12"
      class="my-3 text-center"
      v-if="placeUnits || playGame"
      >
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

      placeUnits: false as boolean,
      playGame: false as boolean,

      startingPieces: [12, 12, 12, 12, 12] as any,
      startingPiecesReset: [12, 12, 12, 12, 12] as any,


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
        } as any,
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
          edge: null,
        })
      }

      //get the number of tiles in a row, double it to only get the even rows
      let evenTilesInRows = ((100 / this.tileSize) * 2) -1;
      //set the edges of the board
      //every 19th tile, add a left edge
      let evenTileCount = 0;
      let evenTileEdge = () => {
        this.gameData.gameBoardData[evenTileCount].edge = 'left'

        if (evenTileCount !== 0) {
          this.gameData.gameBoardData[(evenTileCount - 1)].edge = 'right'
        }

        if (evenTileCount + evenTilesInRows < this.boardSize) {
          evenTileCount += evenTilesInRows
          evenTileEdge();
        }
      }

      evenTileEdge();


      //get the number of tiles in a row, double it to only get the even rows
      let oddTilesInRows = ((100 / this.tileSize) * 2) - 1;

      console.log(oddTilesInRows)
      //set the edges of the board
      //every 19th tile, add a left edge
      let oddTileCount = (100 / this.tileSize) -1;
      let oddTileEdge = () => {
        this.gameData.gameBoardData[oddTileCount].edge = 'left'

        if (oddTileCount !== 0) {
          this.gameData.gameBoardData[(oddTileCount - 1)].edge = 'right'
        }

        if (oddTileCount + oddTilesInRows < this.boardSize) {
          oddTileCount += oddTilesInRows
          oddTileEdge();
        }
      }

      oddTileEdge();


      // for (let i = 0; i < this.boardSize; i++) {
      //   if (i % tilesInRow1 === 0) {
      //     this.gameData.gameBoardData[i].edge = 'left'

      //     if (i !== 0) {
      //       this.gameData.gameBoardData[(i - 1)].edge = 'right'
      //     }
      //   }

      //   if (i % (tilesInRow1 - (100 / this.tileSize)) === 0) {
      //     this.gameData.gameBoardData[i].edge = 'left'

      //     if (i !== 0) {
      //       this.gameData.gameBoardData[(i - 1)].edge = 'right'
      //     }
      //   }
      // }
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
        edge: this.gameData.gameBoardData[index].edge,
      })
      this.$set(this.gameData.gameBoardData, previousTileIndex, {
        playerIndex: -1
      })

    },
    finishTurn: function() {
      this.gameData.gameBoardData.forEach((tile:any) => {
        if (tile.moved) {
          tile.moved = false
        }
      })
      this.thisUserIndex = this.thisUserIndex === 1 ? 0 : this.thisUserIndex + 1
    },
    startPlaceUnits: function() {
      this.placeUnits = true;
      this.$store.commit('setSelectedPieceType', {selectedPieceType: 0});

      this.$nextTick(() => {
        this.setTileHeight()
      })
    },
    defaultGameData: function() {

      this.playGame = true;

      let player1Tiles = [
        {tileIndex: 3, playerIndex: 1, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 4, playerIndex: 1, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 5, playerIndex: 1, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 6, playerIndex: 1, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 7, playerIndex: 1, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 8, playerIndex: 1, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 9, playerIndex: 1, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 10, playerIndex: 1, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 11, playerIndex: 1, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 12, playerIndex: 1, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 13, playerIndex: 1, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 14, playerIndex: 1, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 15, playerIndex: 1, edge: null, value: 5, movementRemaining: 1},

        {tileIndex: 22, playerIndex: 1, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 23, playerIndex: 1, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 24, playerIndex: 1, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 25, playerIndex: 1, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 26, playerIndex: 1, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 27, playerIndex: 1, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 28, playerIndex: 1, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 29, playerIndex: 1, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 30, playerIndex: 1, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 31, playerIndex: 1, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 32, playerIndex: 1, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 33, playerIndex: 1, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 34, playerIndex: 1, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 35, playerIndex: 1, edge: null, value: 4, movementRemaining: 1},

        {tileIndex: 42, playerIndex: 1, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 43, playerIndex: 1, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 44, playerIndex: 1, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 45, playerIndex: 1, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 46, playerIndex: 1, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 47, playerIndex: 1, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 48, playerIndex: 1, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 49, playerIndex: 1, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 50, playerIndex: 1, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 51, playerIndex: 1, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 52, playerIndex: 1, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 53, playerIndex: 1, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 54, playerIndex: 1, edge: null, value: 3, movementRemaining: 1},

        {tileIndex: 61, playerIndex: 1, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 62, playerIndex: 1, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 63, playerIndex: 1, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 64, playerIndex: 1, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 65, playerIndex: 1, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 66, playerIndex: 1, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 67, playerIndex: 1, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 68, playerIndex: 1, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 69, playerIndex: 1, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 70, playerIndex: 1, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 71, playerIndex: 1, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 72, playerIndex: 1, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 73, playerIndex: 1, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 74, playerIndex: 1, edge: null, value: 2, movementRemaining: 1},

        {tileIndex: 81, playerIndex: 1, edge: null, value: 1, movementRemaining: 4},
        {tileIndex: 82, playerIndex: 1, edge: null, value: 1, movementRemaining: 4},
        {tileIndex: 83, playerIndex: 1, edge: null, value: 1, movementRemaining: 4},
        {tileIndex: 84, playerIndex: 1, edge: null, value: 1, movementRemaining: 4},
        {tileIndex: 85, playerIndex: 1, edge: null, value: 1, movementRemaining: 4},
        {tileIndex: 86, playerIndex: 1, edge: null, value: 1, movementRemaining: 4},
        {tileIndex: 87, playerIndex: 1, edge: null, value: 1, movementRemaining: 4},
        {tileIndex: 88, playerIndex: 1, edge: null, value: 1, movementRemaining: 4},
        {tileIndex: 89, playerIndex: 1, edge: null, value: 1, movementRemaining: 4},
        {tileIndex: 90, playerIndex: 1, edge: null, value: 1, movementRemaining: 4},
        {tileIndex: 91, playerIndex: 1, edge: null, value: 1, movementRemaining: 4},
        {tileIndex: 92, playerIndex: 1, edge: null, value: 1, movementRemaining: 4},
        {tileIndex: 93, playerIndex: 1, edge: null, value: 1, movementRemaining: 4},

      ]

      let player2Tiles = [
        {tileIndex: 373, playerIndex: 0, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 374, playerIndex: 0, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 375, playerIndex: 0, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 376, playerIndex: 0, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 377, playerIndex: 0, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 378, playerIndex: 0, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 379, playerIndex: 0, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 380, playerIndex: 0, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 381, playerIndex: 0, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 382, playerIndex: 0, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 383, playerIndex: 0, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 384, playerIndex: 0, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 385, playerIndex: 0, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 386, playerIndex: 0, edge: null, value: 5, movementRemaining: 1},

        {tileIndex: 354, playerIndex: 0, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 355, playerIndex: 0, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 356, playerIndex: 0, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 357, playerIndex: 0, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 358, playerIndex: 0, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 359, playerIndex: 0, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 360, playerIndex: 0, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 361, playerIndex: 0, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 362, playerIndex: 0, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 363, playerIndex: 0, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 364, playerIndex: 0, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 365, playerIndex: 0, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 366, playerIndex: 0, edge: null, value: 4, movementRemaining: 1},

        {tileIndex: 334, playerIndex: 0, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 335, playerIndex: 0, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 336, playerIndex: 0, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 337, playerIndex: 0, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 338, playerIndex: 0, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 339, playerIndex: 0, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 340, playerIndex: 0, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 341, playerIndex: 0, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 342, playerIndex: 0, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 343, playerIndex: 0, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 344, playerIndex: 0, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 345, playerIndex: 0, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 346, playerIndex: 0, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 347, playerIndex: 0, edge: null, value: 3, movementRemaining: 1},

        {tileIndex: 315, playerIndex: 0, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 316, playerIndex: 0, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 317, playerIndex: 0, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 318, playerIndex: 0, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 319, playerIndex: 0, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 320, playerIndex: 0, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 321, playerIndex: 0, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 322, playerIndex: 0, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 323, playerIndex: 0, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 324, playerIndex: 0, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 325, playerIndex: 0, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 326, playerIndex: 0, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 327, playerIndex: 0, edge: null, value: 2, movementRemaining: 1},

        {tileIndex: 295, playerIndex: 0, edge: null, value: 1, movementRemaining: 5},
        {tileIndex: 296, playerIndex: 0, edge: null, value: 1, movementRemaining: 5},
        {tileIndex: 297, playerIndex: 0, edge: null, value: 1, movementRemaining: 5},
        {tileIndex: 298, playerIndex: 0, edge: null, value: 1, movementRemaining: 5},
        {tileIndex: 299, playerIndex: 0, edge: null, value: 1, movementRemaining: 5},
        {tileIndex: 300, playerIndex: 0, edge: null, value: 1, movementRemaining: 5},
        {tileIndex: 301, playerIndex: 0, edge: null, value: 1, movementRemaining: 5},
        {tileIndex: 302, playerIndex: 0, edge: null, value: 1, movementRemaining: 5},
        {tileIndex: 303, playerIndex: 0, edge: null, value: 1, movementRemaining: 5},
        {tileIndex: 304, playerIndex: 0, edge: null, value: 1, movementRemaining: 5},
        {tileIndex: 305, playerIndex: 0, edge: null, value: 1, movementRemaining: 5},
        {tileIndex: 306, playerIndex: 0, edge: null, value: 1, movementRemaining: 5},
        {tileIndex: 307, playerIndex: 0, edge: null, value: 1, movementRemaining: 5},
        {tileIndex: 308, playerIndex: 0, edge: null, value: 1, movementRemaining: 5},
      ]

      player1Tiles.forEach((tile:any) => {
        this.$set(this.gameData.gameBoardData, tile.tileIndex, {
          playerIndex: tile.playerIndex,
          value: tile.value,
          movementRemaining: tile.movementRemaining,
          edge: null,
        })
      })

      player2Tiles.forEach((tile:any) => {
        this.$set(this.gameData.gameBoardData, tile.tileIndex, {
          playerIndex: tile.playerIndex,
          value: tile.value,
          movementRemaining: tile.movementRemaining,
          edge: null,
        })
      })

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
  },
  watch: {
    startingPieces: function() {
      let remaining = 0
      this.startingPieces.forEach((piece: any) => {
        remaining = remaining + piece
      })

      console.log(remaining)

      if (remaining === 0) {
        this.$store.commit('setCompletedUnitPlacement', {completedUnitPlacement: true})
      } else {
        this.$store.commit('setCompletedUnitPlacement', {completedUnitPlacement: false})
      }
    },
  },
  computed: {
    selectedPieceType () {
      return this.$store.state.selectedPieceType
    },
    completedUnitPlacement () {
      return this.$store.state.completedUnitPlacement
    },
  }
})

</script>
