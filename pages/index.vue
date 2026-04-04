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
          class="mb-0 px-3 font-weight-bold"
          :class="'text-' + gameData.players[thisUserIndex].color">
          <i :class="(aiEnabled && thisUserIndex === 1) || aiBothEnabled ? 'ri-robot-line pr-1' : 'ri-account-circle-line pr-1'"></i>
          {{ aiBothEnabled ? 'AI (' + gameData.players[thisUserIndex].name + ')' : (aiEnabled && thisUserIndex === 1 ? 'AI' : gameData.players[thisUserIndex].name) }}'s Turn
          <span v-if="aiThinking" class="ml-2 text-warning"><small>(thinking...)</small></span>
        </h5>
      </b-col>
      <b-col sm="10" md="8" lg="6">
        <img class="w-100" :src="require('~/assets/images/logo.svg')" alt="Kamakura Geku Logo">
      </b-col>
      <b-col sm="6" md="2" lg="3" class="d-flex justify-content-end">
        <b-button
          v-if="placeUnits && !aiEnabled && thisUserIndex < gameData.players.length - 1"
          class="pl-3 d-inline-flex justify-content-center align-items-center font-weight-bold"
          :variant="thisUserIndex === 0 ? 'primary' : 'danger'"
          :disabled="!completedUnitPlacement"
          @click="thisUserIndex++; $store.commit('setSelectedPieceType', {selectedPieceType: 0}); startingPieces = startingPiecesReset">
          Finish Placement
          <i class="ri-arrow-right-s-line"></i>
        </b-button>
        <b-button
          v-if="placeUnits && ((!aiEnabled && thisUserIndex === gameData.players.length - 1) || (aiEnabled && thisUserIndex === 0))"
          class="pl-3 d-inline-flex justify-content-center align-items-center font-weight-bold"
          :variant="thisUserIndex === 0 ? 'primary' : 'danger'"
          :disabled="!completedUnitPlacement"
          @click="startGameFromPlacement()">
          Start Game
          <i class="ri-arrow-right-s-line"></i>
        </b-button>
        <b-button
          v-if="playGame && !aiThinking"
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
        class="my-5 p-4 popupContainer fade-in-delayed"
        >
        <b-col cols="12" class="text-center text-dark mb-3">
          <h5 class="mb-0">New Game</h5>
        </b-col>

        <!-- Win Condition Dropdown -->
        <b-col cols="12" class="mb-3">
          <p class="modal-field-label">Win Condition</p>
          <custom-dropdown
            v-model="winCondition"
            :options="winConditionOptions"
          />
        </b-col>

        <!-- Game Mode selection -->
        <b-col cols="12" class="mb-3">
          <p class="modal-field-label">Game Mode</p>
          <div class="ai-options-row">
            <div
              class="ai-option-toggle"
              :class="{ 'is-active': gameMode === 'pvp' }"
              @click="gameMode = 'pvp'"
            >
              <i class="ri-group-line ai-option-icon"></i>
              <span class="ai-option-label text-center">Player vs Player</span>
            </div>
            <div
              class="ai-option-toggle"
              :class="{ 'is-active': gameMode === 'vsAI' }"
              @click="gameMode = 'vsAI'"
            >
              <i class="ri-robot-line ai-option-icon"></i>
              <span class="ai-option-label">vs AI</span>
            </div>
            <div
              class="ai-option-toggle"
              :class="{ 'is-active': gameMode === 'aiVsAI' }"
              @click="gameMode = 'aiVsAI'"
            >
              <i class="ri-cpu-line ai-option-icon"></i>
              <span class="ai-option-label">AI vs AI</span>
            </div>
          </div>
        </b-col>

        <!-- Fog of War Toggle -->
        <b-col cols="12" class="mb-3">
          <p class="modal-field-label">Fog of War</p>
          <div class="ai-options-row">
            <div
              class="ai-option-toggle"
              :class="{ 'is-active': !fogOfWar }"
              @click="fogOfWar = false"
            >
              <i class="ri-sun-line ai-option-icon"></i>
              <span class="ai-option-label text-center">Off</span>
            </div>
            <div
              class="ai-option-toggle"
              :class="{ 'is-active': fogOfWar }"
              @click="fogOfWar = true"
            >
              <i class="ri-eye-off-line ai-option-icon"></i>
              <span class="ai-option-label text-center">On</span>
            </div>
          </div>
        </b-col>

        <!-- Action Buttons -->
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


    <!-- Win Overlay -->
    <div v-if="gameOver" class="win-overlay">
      <div class="win-modal p-5 text-center">
        <h2 :class="'text-' + gameData.players[winnerIndex].color" class="font-weight-bold mb-2">
          {{ gameData.players[winnerIndex].name }} Wins!
        </h2>
        <p class="text-white mb-4">
          <span v-if="winCondition === 'eliminate'">All enemy units were eliminated.</span>
          <span v-else-if="winCondition === 'breakthrough'">A unit crossed the entire board!</span>
        </p>
        <b-button variant="light" class="font-weight-bold" @click="resetGame()">
          Play Again <i class="ri-refresh-line"></i>
        </b-button>
      </div>
    </div>

    <GameBoard
      :gameData="gameData"
      :thisUserIndex="thisUserIndex"
      :tileSize="tileSize"
      :tileHeight="tileHeight"
      :startingPieces="startingPieces"
      :playGame="playGame"
      :placeUnits="placeUnits"
      :aiThinking="aiThinking"
      :fogOfWar="fogOfWar"
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
import CustomDropdown from '~/components/CustomDropdown.vue'

import 'remixicon/fonts/remixicon.css'


export default Vue.extend({
  name: 'Kamakura-Geku',
  components: { CustomDropdown },
  data() {
    return {
      musicVideoURL: 'https://www.youtube.com/watch?v=ZxGiEoczryg?t=254',
      musicPopover: false,
      muted: true,

      boardSize: 468,
      tileSize: 5, //in percentage
      tileHeight: 0, //in pixels

      thisUserIndex: 0,

      placeUnits: false as boolean,
      playGame: false as boolean,

      startingPieces: [12, 12, 12, 12, 12] as any,
      startingPiecesReset: [12, 12, 12, 12, 12] as any,

      gameMode: 'pvp' as string,
      aiThinking: false as boolean,

      fogOfWar: false as boolean,

      winCondition: 'eliminate' as string,
      winConditionOptions: [
        { label: 'Eliminate All Enemies', value: 'eliminate' },
        { label: 'Get a Unit Across the Board', value: 'breakthrough' },
      ],
      gameOver: false as boolean,
      winnerIndex: -1 as number,

      gamePieces: [
        { value: 1, movement: 6 },
        { value: 2, movement: 5 },
        { value: 3, movement: 4 },
        { value: 4, movement: 3 },
        { value: 5, movement: 2 },
      ],


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
    playSound: function(type: string) {
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext
        if (!AudioCtxClass) return
        const ctx = new AudioCtxClass()
        const playTone = (freq: number, start: number, duration: number, vol: number = 0.3) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.frequency.value = freq
          gain.gain.setValueAtTime(vol, ctx.currentTime + start)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration)
          osc.start(ctx.currentTime + start)
          osc.stop(ctx.currentTime + start + duration)
        }
        if (type === 'start') {
          playTone(330, 0, 0.12)
          playTone(440, 0.13, 0.12)
          playTone(550, 0.26, 0.2)
        } else if (type === 'capture') {
          playTone(220, 0, 0.05, 0.4)
          playTone(140, 0.05, 0.18, 0.3)
        } else if (type === 'win') {
          playTone(440, 0, 0.12)
          playTone(550, 0.13, 0.12)
          playTone(660, 0.26, 0.12)
          playTone(880, 0.39, 0.4)
        }
      } catch (e) {}
    },
    moveToTile: function(previousTileIndex:number, index:number):any {

      console.log(JSON.stringify(this.gameData.gameBoardData[previousTileIndex]))

      const movingPlayerIndex = this.gameData.gameBoardData[previousTileIndex].playerIndex
      const isCapture = this.gameData.gameBoardData[index].playerIndex > -1

      this.$set(this.gameData.gameBoardData, index, {
        ...this.gameData.gameBoardData[previousTileIndex],
        moved: true,
        edge: this.gameData.gameBoardData[index].edge,
      })
      this.$set(this.gameData.gameBoardData, previousTileIndex, {
        playerIndex: -1
      })

      if (isCapture) this.playSound('capture')
      this.checkWinCondition(movingPlayerIndex, index)
    },
    checkWinCondition: function(movingPlayerIndex:number, movedToIndex:number) {
      if (this.gameOver) return

      if (this.winCondition === 'eliminate') {
        const enemyExists = this.gameData.gameBoardData.some((tile:any) =>
          tile.playerIndex > -1 && tile.playerIndex !== movingPlayerIndex
        )
        if (!enemyExists) {
          this.gameOver = true
          this.winnerIndex = movingPlayerIndex
          this.playSound('win')
        }
      } else if (this.winCondition === 'breakthrough') {
        const tileDistance = Math.round(100 / this.tileSize)
        let won = false
        // Player 0 (Blue) starts at bottom, wins by reaching the top rows
        if (movingPlayerIndex === 0 && movedToIndex < tileDistance) {
          won = true
        }
        // Player 1 (Red) starts at top, wins by reaching the bottom rows
        if (movingPlayerIndex === 1 && movedToIndex >= this.boardSize - tileDistance) {
          won = true
        }
        if (won) {
          this.gameOver = true
          this.winnerIndex = movingPlayerIndex
          this.playSound('win')
        }
      }
    },
    resetGame: function() {
      this.gameOver = false
      this.winnerIndex = -1
      this.playGame = false
      this.placeUnits = false
      this.thisUserIndex = 0
      this.aiThinking = false
      this.startingPieces = [...this.startingPiecesReset]
      this.$store.commit('setSelectedPieceType', {selectedPieceType: 0})
      this.$store.commit('setCompletedUnitPlacement', {completedUnitPlacement: false})
      this.gameData.gameBoardData = []
      this.createBoard()
    },
    finishTurn: function() {
      if (this.gameOver) return
      this.gameData.gameBoardData.forEach((tile:any) => {
        if (tile.moved) {
          tile.moved = false
        }
      })
      this.thisUserIndex = this.thisUserIndex === 1 ? 0 : this.thisUserIndex + 1

      // Trigger AI turn if enabled and it's AI's turn (player 1)
      if (this.aiBothEnabled) {
        this.$nextTick(() => {
          this.aiTurn(this.thisUserIndex)
        })
      } else if (this.aiEnabled && this.thisUserIndex === 1) {
        this.$nextTick(() => {
          this.aiTurn(1)
        })
      }
    },
    startGameFromPlacement: function() {
      if (this.aiEnabled) {
        this.aiPlaceUnits()
      }
      this.playGame = true
      this.placeUnits = false
      this.thisUserIndex = 0
      this.playSound('start')
      if (this.aiBothEnabled) {
        this.$nextTick(() => {
          this.aiTurn(0)
        })
      }
    },
    aiPlaceUnitsPlayer0: function() {
      const aiTiles:any[] = [
        // Value 5 (front line)
        {tileIndex: 373, value: 5}, {tileIndex: 374, value: 5}, {tileIndex: 375, value: 5},
        {tileIndex: 376, value: 5}, {tileIndex: 377, value: 5}, {tileIndex: 378, value: 5},
        {tileIndex: 379, value: 5}, {tileIndex: 380, value: 5}, {tileIndex: 381, value: 5},
        {tileIndex: 382, value: 5}, {tileIndex: 383, value: 5}, {tileIndex: 384, value: 5},
        {tileIndex: 385, value: 5},
        // Value 4
        {tileIndex: 354, value: 4}, {tileIndex: 355, value: 4}, {tileIndex: 356, value: 4},
        {tileIndex: 357, value: 4}, {tileIndex: 358, value: 4}, {tileIndex: 359, value: 4},
        {tileIndex: 360, value: 4}, {tileIndex: 361, value: 4}, {tileIndex: 362, value: 4},
        {tileIndex: 363, value: 4}, {tileIndex: 364, value: 4}, {tileIndex: 365, value: 4},
        {tileIndex: 366, value: 4},
        // Value 3
        {tileIndex: 334, value: 3}, {tileIndex: 335, value: 3}, {tileIndex: 336, value: 3},
        {tileIndex: 337, value: 3}, {tileIndex: 338, value: 3}, {tileIndex: 339, value: 3},
        {tileIndex: 340, value: 3}, {tileIndex: 341, value: 3}, {tileIndex: 342, value: 3},
        {tileIndex: 343, value: 3}, {tileIndex: 344, value: 3}, {tileIndex: 345, value: 3},
        {tileIndex: 346, value: 3},
        // Value 2
        {tileIndex: 315, value: 2}, {tileIndex: 316, value: 2}, {tileIndex: 317, value: 2},
        {tileIndex: 318, value: 2}, {tileIndex: 319, value: 2}, {tileIndex: 320, value: 2},
        {tileIndex: 321, value: 2}, {tileIndex: 322, value: 2}, {tileIndex: 323, value: 2},
        {tileIndex: 324, value: 2}, {tileIndex: 325, value: 2}, {tileIndex: 326, value: 2},
        {tileIndex: 327, value: 2},
        // Value 1 (scouts)
        {tileIndex: 295, value: 1}, {tileIndex: 296, value: 1}, {tileIndex: 297, value: 1},
        {tileIndex: 298, value: 1}, {tileIndex: 299, value: 1}, {tileIndex: 300, value: 1},
        {tileIndex: 301, value: 1}, {tileIndex: 302, value: 1}, {tileIndex: 303, value: 1},
        {tileIndex: 304, value: 1}, {tileIndex: 305, value: 1}, {tileIndex: 306, value: 1},
        {tileIndex: 307, value: 1},
      ]

      aiTiles.forEach((tile:any) => {
        this.$set(this.gameData.gameBoardData, tile.tileIndex, {
          playerIndex: 0,
          value: tile.value,
          movementRemaining: this.gamePieces[tile.value - 1].movement - 1,
          edge: this.gameData.gameBoardData[tile.tileIndex].edge,
        })
      })
    },
    aiPlaceUnits: function() {
      const aiTiles:any[] = [
        // Value 5 (front line)
        {tileIndex: 3, value: 5}, {tileIndex: 4, value: 5}, {tileIndex: 5, value: 5},
        {tileIndex: 6, value: 5}, {tileIndex: 7, value: 5}, {tileIndex: 8, value: 5},
        {tileIndex: 9, value: 5}, {tileIndex: 10, value: 5}, {tileIndex: 11, value: 5},
        {tileIndex: 12, value: 5}, {tileIndex: 13, value: 5}, {tileIndex: 14, value: 5},
        {tileIndex: 15, value: 5},
        // Value 4
        {tileIndex: 22, value: 4}, {tileIndex: 23, value: 4}, {tileIndex: 24, value: 4},
        {tileIndex: 25, value: 4}, {tileIndex: 26, value: 4}, {tileIndex: 27, value: 4},
        {tileIndex: 28, value: 4}, {tileIndex: 29, value: 4}, {tileIndex: 30, value: 4},
        {tileIndex: 31, value: 4}, {tileIndex: 32, value: 4}, {tileIndex: 33, value: 4},
        {tileIndex: 34, value: 4}, {tileIndex: 35, value: 4},
        // Value 3
        {tileIndex: 42, value: 3}, {tileIndex: 43, value: 3}, {tileIndex: 44, value: 3},
        {tileIndex: 45, value: 3}, {tileIndex: 46, value: 3}, {tileIndex: 47, value: 3},
        {tileIndex: 48, value: 3}, {tileIndex: 49, value: 3}, {tileIndex: 50, value: 3},
        {tileIndex: 51, value: 3}, {tileIndex: 52, value: 3}, {tileIndex: 53, value: 3},
        {tileIndex: 54, value: 3},
        // Value 2
        {tileIndex: 61, value: 2}, {tileIndex: 62, value: 2}, {tileIndex: 63, value: 2},
        {tileIndex: 64, value: 2}, {tileIndex: 65, value: 2}, {tileIndex: 66, value: 2},
        {tileIndex: 67, value: 2}, {tileIndex: 68, value: 2}, {tileIndex: 69, value: 2},
        {tileIndex: 70, value: 2}, {tileIndex: 71, value: 2}, {tileIndex: 72, value: 2},
        {tileIndex: 73, value: 2}, {tileIndex: 74, value: 2},
        // Value 1 (scouts)
        {tileIndex: 81, value: 1}, {tileIndex: 82, value: 1}, {tileIndex: 83, value: 1},
        {tileIndex: 84, value: 1}, {tileIndex: 85, value: 1}, {tileIndex: 86, value: 1},
        {tileIndex: 87, value: 1}, {tileIndex: 88, value: 1}, {tileIndex: 89, value: 1},
        {tileIndex: 90, value: 1}, {tileIndex: 91, value: 1}, {tileIndex: 92, value: 1},
        {tileIndex: 93, value: 1},
      ]

      aiTiles.forEach((tile:any) => {
        this.$set(this.gameData.gameBoardData, tile.tileIndex, {
          playerIndex: 1,
          value: tile.value,
          movementRemaining: this.gamePieces[tile.value - 1].movement - 1,
          edge: this.gameData.gameBoardData[tile.tileIndex].edge,
        })
      })
    },
    aiTurn: function(playerIndex: number = 1) {
      this.aiThinking = true

      let moveCount = 0
      const maxMoves = this.gameData.gameBoardData.filter((tile: any) => tile.playerIndex === playerIndex && !tile.moved).length

      const makeOneMove = () => {
        if (this.gameOver) {
          this.aiThinking = false
          return
        }

        if (moveCount >= maxMoves) {
          this.aiThinking = false
          this.finishTurn()
          return
        }

        const bestMove = this.findBestAIMove(playerIndex)
        if (!bestMove) {
          this.aiThinking = false
          this.finishTurn()
          return
        }

        this.moveToTile(bestMove.from, bestMove.to)
        moveCount++
        setTimeout(makeOneMove, 500)
      }

      setTimeout(makeOneMove, 800)
    },
    tileToRowCol: function(tileIndex:number):any {
      const offsetRowSize = (100 / this.tileSize) - 1
      const normalRowSize = 100 / this.tileSize
      const tilesPerPair = offsetRowSize + normalRowSize

      const pairIndex = Math.floor(tileIndex / tilesPerPair)
      const posInPair = tileIndex % tilesPerPair

      if (posInPair < offsetRowSize) {
        return { row: pairIndex * 2, col: posInPair, isOffsetRow: true }
      } else {
        return { row: pairIndex * 2 + 1, col: posInPair - offsetRowSize, isOffsetRow: false }
      }
    },
    nearestEnemyDistance: function(tileIndex:number, enemyPositions:number[]):number {
      const pos = this.tileToRowCol(tileIndex)
      const x1 = pos.isOffsetRow ? pos.col + 0.5 : pos.col
      const y1 = pos.row
      let minDist = Infinity

      enemyPositions.forEach((enemyIndex:number) => {
        const ePos = this.tileToRowCol(enemyIndex)
        const x2 = ePos.isOffsetRow ? ePos.col + 0.5 : ePos.col
        const y2 = ePos.row
        const dist = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))
        if (dist < minDist) minDist = dist
      })

      return minDist
    },
    findBestAIMove: function(aiPlayerIndex: number = 1):any {
      let allMoves:any[] = []

      // In eliminate mode, find all enemy positions for distance-based scoring
      let enemyPositions:number[] = []
      if (this.winCondition === 'eliminate') {
        this.gameData.gameBoardData.forEach((tile:any, index:number) => {
          if (tile.playerIndex > -1 && tile.playerIndex !== aiPlayerIndex) {
            enemyPositions.push(index)
          }
        })
      }

      this.gameData.gameBoardData.forEach((tile:any, index:number) => {
        if (tile.playerIndex !== aiPlayerIndex || tile.moved) return

        const possibilities = this.getAIPossibilities(index, aiPlayerIndex)
        possibilities.forEach((p:any) => {
          let score = 0

          if (p.isAttack) {
            // High priority: attack higher value targets first
            const targetValue = this.gameData.gameBoardData[p.tileId].value
            score = 1000 + targetValue * 100
          } else if (this.winCondition === 'eliminate' && enemyPositions.length > 0) {
            // In eliminate mode, move toward the nearest enemy
            const currentDist = this.nearestEnemyDistance(index, enemyPositions)
            const newDist = this.nearestEnemyDistance(p.tileId, enemyPositions)
            const distReduction = currentDist - newDist
            if (distReduction > 0) {
              score = 200 + distReduction * 50
            } else {
              score = 10
            }
          } else {
            // Player 1 (Red) advances toward higher indices; Player 0 (Blue) toward lower
            const indexDiff = aiPlayerIndex === 0 ? index - p.tileId : p.tileId - index
            if (indexDiff > 0) {
              score = 100 + indexDiff
            } else {
              score = 10
            }
          }

          // Add randomness for variety
          score += Math.random() * 40

          allMoves.push({ from: index, to: p.tileId, score, isAttack: p.isAttack })
        })
      })

      if (allMoves.length === 0) return null

      allMoves.sort((a:any, b:any) => b.score - a.score)
      return allMoves[0]
    },
    getAIPossibilities: function(selectedTileIndex:number, aiPlayerIndex:number):any[] {
      const selectedValue = this.gameData.gameBoardData[selectedTileIndex].value
      const maxMovement = this.gamePieces[selectedValue - 1].movement
      const boardSize = this.gameData.gameBoardData.length

      let visited:any = {}
      visited[selectedTileIndex] = true

      let queue:any[] = []
      let possibilities:any[] = []

      const initialNeighbors = this.findSurroundingTilesAI(selectedTileIndex)
      initialNeighbors.forEach((tile:any) => {
        if (tile.surroundingTileId >= 0 && tile.surroundingTileId < boardSize && !visited[tile.surroundingTileId]) {
          queue.push({ tileId: tile.surroundingTileId, depth: 1, direction: tile.direction })
        }
      })

      while (queue.length > 0) {
        const current = queue.shift()
        const tileId = current.tileId
        const depth = current.depth

        if (visited[tileId]) continue
        visited[tileId] = true

        const tileData = this.gameData.gameBoardData[tileId]
        if (!tileData) continue

        if (tileData.playerIndex === -1) {
          // Empty tile — can move here
          possibilities.push({ tileId, isAttack: false, direction: current.direction })

          if (depth < maxMovement) {
            const nextNeighbors = this.findSurroundingTilesAI(tileId)
            nextNeighbors.forEach((adj:any) => {
              if (adj.surroundingTileId >= 0 && adj.surroundingTileId < boardSize && !visited[adj.surroundingTileId]) {
                queue.push({ tileId: adj.surroundingTileId, depth: depth + 1, direction: adj.direction })
              }
            })
          }
        } else if (tileData.playerIndex === aiPlayerIndex) {
          // Friendly — pass through but don't land on
          if (depth < maxMovement) {
            const nextNeighbors = this.findSurroundingTilesAI(tileId)
            nextNeighbors.forEach((adj:any) => {
              if (adj.surroundingTileId >= 0 && adj.surroundingTileId < boardSize && !visited[adj.surroundingTileId]) {
                queue.push({ tileId: adj.surroundingTileId, depth: depth + 1, direction: adj.direction })
              }
            })
          }
        } else {
          // Enemy — check if attackable
          if (this.checkCanBeAttackedAI(selectedTileIndex, tileId, aiPlayerIndex)) {
            possibilities.push({ tileId, isAttack: true, direction: current.direction })
          }
        }
      }

      return possibilities
    },
    checkCanBeAttackedAI: function(selectedTileIndex:number, targetIndex:number, aiPlayerIndex:number):boolean {
      const selectedValue = this.gameData.gameBoardData[selectedTileIndex].value
      const targetValue = this.gameData.gameBoardData[targetIndex].value

      // Sum adjacent friendly AI unit values around the target
      const adjacentTiles = this.findSurroundingTilesAI(targetIndex)
      let adjacentCombinations = 0

      adjacentTiles.forEach((adj:any) => {
        if (adj.surroundingTileId >= 0 && adj.surroundingTileId < this.gameData.gameBoardData.length) {
          const adjData = this.gameData.gameBoardData[adj.surroundingTileId]
          if (adjData && adjData.playerIndex === aiPlayerIndex && adj.surroundingTileId !== selectedTileIndex) {
            adjacentCombinations += adjData.value
          }
        }
      })

      return targetValue <= selectedValue + adjacentCombinations
    },
    findSurroundingTilesAI: function(tileIndex:number):any[] {
      const offsetRowSize = (100 / this.tileSize) - 1   // 19
      const normalRowSize = 100 / this.tileSize          // 20
      const tilesPerPair = offsetRowSize + normalRowSize  // 39
      const boardSize = this.gameData.gameBoardData.length

      const pairIndex = Math.floor(tileIndex / tilesPerPair)
      const posInPair = tileIndex % tilesPerPair

      let row: number, col: number, isOffsetRow: boolean
      if (posInPair < offsetRowSize) {
        row = pairIndex * 2
        col = posInPair
        isOffsetRow = true
      } else {
        row = pairIndex * 2 + 1
        col = posInPair - offsetRowSize
        isOffsetRow = false
      }

      const getRowSize = (r: number): number => r % 2 === 0 ? offsetRowSize : normalRowSize

      const fullPairs = Math.floor(boardSize / tilesPerPair)
      const remaining = boardSize % tilesPerPair
      let totalRows = fullPairs * 2
      if (remaining > 0) totalRows++
      if (remaining > offsetRowSize) totalRows++

      const toIndex = (r: number, c: number): number => {
        const rPair = Math.floor(r / 2)
        if (r % 2 === 0) {
          return rPair * tilesPerPair + c
        } else {
          return rPair * tilesPerPair + offsetRowSize + c
        }
      }

      let array: any[] = []
      const currentRowSize = getRowSize(row)

      if (col > 0) {
        array.push({ surroundingTileId: toIndex(row, col - 1), direction: 'left' })
      }
      if (col < currentRowSize - 1) {
        array.push({ surroundingTileId: toIndex(row, col + 1), direction: 'right' })
      }

      if (isOffsetRow) {
        if (row > 0) {
          const aboveSize = getRowSize(row - 1)
          if (col + 1 < aboveSize) {
            array.push({ surroundingTileId: toIndex(row - 1, col + 1), direction: 'topLeft' })
          }
          if (col >= 0 && col < aboveSize) {
            array.push({ surroundingTileId: toIndex(row - 1, col), direction: 'topRight' })
          }
        }
        if (row + 1 < totalRows) {
          const belowSize = getRowSize(row + 1)
          if (col < belowSize) {
            array.push({ surroundingTileId: toIndex(row + 1, col), direction: 'bottomLeft' })
          }
          if (col + 1 < belowSize) {
            array.push({ surroundingTileId: toIndex(row + 1, col + 1), direction: 'bottomRight' })
          }
        }
      } else {
        if (row > 0) {
          const aboveSize = getRowSize(row - 1)
          if (col < aboveSize) {
            array.push({ surroundingTileId: toIndex(row - 1, col), direction: 'topLeft' })
          }
          if (col - 1 >= 0 && col - 1 < aboveSize) {
            array.push({ surroundingTileId: toIndex(row - 1, col - 1), direction: 'topRight' })
          }
        }
        if (row + 1 < totalRows) {
          const belowSize = getRowSize(row + 1)
          if (col - 1 >= 0 && col - 1 < belowSize) {
            array.push({ surroundingTileId: toIndex(row + 1, col - 1), direction: 'bottomLeft' })
          }
          if (col < belowSize) {
            array.push({ surroundingTileId: toIndex(row + 1, col), direction: 'bottomRight' })
          }
        }
      }

      return array
    },
    startPlaceUnits: function() {
      if (this.aiBothEnabled) {
        this.aiPlaceUnitsPlayer0()
        this.aiPlaceUnits()
        this.playGame = true
        this.thisUserIndex = 0
        this.$nextTick(() => {
          this.setTileHeight()
          this.aiTurn(0)
        })
        return
      }
      this.placeUnits = true;
      this.$store.commit('setSelectedPieceType', {selectedPieceType: 0});

      this.$nextTick(() => {
        this.setTileHeight()
      })
    },
    defaultGameData: function() {

      this.playGame = true;
      this.playSound('start')

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
        {tileIndex: 451, playerIndex: 0, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 452, playerIndex: 0, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 453, playerIndex: 0, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 454, playerIndex: 0, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 455, playerIndex: 0, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 456, playerIndex: 0, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 457, playerIndex: 0, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 458, playerIndex: 0, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 459, playerIndex: 0, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 460, playerIndex: 0, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 461, playerIndex: 0, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 462, playerIndex: 0, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 463, playerIndex: 0, edge: null, value: 5, movementRemaining: 1},
        {tileIndex: 464, playerIndex: 0, edge: null, value: 5, movementRemaining: 1},

        {tileIndex: 432, playerIndex: 0, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 433, playerIndex: 0, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 434, playerIndex: 0, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 435, playerIndex: 0, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 436, playerIndex: 0, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 437, playerIndex: 0, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 438, playerIndex: 0, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 439, playerIndex: 0, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 440, playerIndex: 0, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 441, playerIndex: 0, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 442, playerIndex: 0, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 443, playerIndex: 0, edge: null, value: 4, movementRemaining: 1},
        {tileIndex: 444, playerIndex: 0, edge: null, value: 4, movementRemaining: 1},

        {tileIndex: 412, playerIndex: 0, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 413, playerIndex: 0, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 414, playerIndex: 0, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 415, playerIndex: 0, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 416, playerIndex: 0, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 417, playerIndex: 0, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 418, playerIndex: 0, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 419, playerIndex: 0, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 420, playerIndex: 0, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 421, playerIndex: 0, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 422, playerIndex: 0, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 423, playerIndex: 0, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 424, playerIndex: 0, edge: null, value: 3, movementRemaining: 1},
        {tileIndex: 425, playerIndex: 0, edge: null, value: 3, movementRemaining: 1},

        {tileIndex: 393, playerIndex: 0, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 394, playerIndex: 0, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 395, playerIndex: 0, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 396, playerIndex: 0, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 397, playerIndex: 0, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 398, playerIndex: 0, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 399, playerIndex: 0, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 400, playerIndex: 0, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 401, playerIndex: 0, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 402, playerIndex: 0, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 403, playerIndex: 0, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 404, playerIndex: 0, edge: null, value: 2, movementRemaining: 1},
        {tileIndex: 405, playerIndex: 0, edge: null, value: 2, movementRemaining: 1},

        {tileIndex: 373, playerIndex: 0, edge: null, value: 1, movementRemaining: 5},
        {tileIndex: 374, playerIndex: 0, edge: null, value: 1, movementRemaining: 5},
        {tileIndex: 375, playerIndex: 0, edge: null, value: 1, movementRemaining: 5},
        {tileIndex: 376, playerIndex: 0, edge: null, value: 1, movementRemaining: 5},
        {tileIndex: 377, playerIndex: 0, edge: null, value: 1, movementRemaining: 5},
        {tileIndex: 378, playerIndex: 0, edge: null, value: 1, movementRemaining: 5},
        {tileIndex: 379, playerIndex: 0, edge: null, value: 1, movementRemaining: 5},
        {tileIndex: 380, playerIndex: 0, edge: null, value: 1, movementRemaining: 5},
        {tileIndex: 381, playerIndex: 0, edge: null, value: 1, movementRemaining: 5},
        {tileIndex: 382, playerIndex: 0, edge: null, value: 1, movementRemaining: 5},
        {tileIndex: 383, playerIndex: 0, edge: null, value: 1, movementRemaining: 5},
        {tileIndex: 384, playerIndex: 0, edge: null, value: 1, movementRemaining: 5},
        {tileIndex: 385, playerIndex: 0, edge: null, value: 1, movementRemaining: 5},
        {tileIndex: 386, playerIndex: 0, edge: null, value: 1, movementRemaining: 5},
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
        if (this.aiBothEnabled) {
          this.aiTurn(0)
        }
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
    aiEnabled (): boolean {
      return this.gameMode === 'vsAI'
    },
    aiBothEnabled (): boolean {
      return this.gameMode === 'aiVsAI'
    },
  }
})

</script>

<style scoped>
#positionSelectionModal {
  min-width: 300px;
}

.modal-field-label {
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6c757d;
  margin-bottom: 6px;
}

.ai-options-row {
  display: flex;
  gap: 10px;
}

.ai-option-toggle {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px 8px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  background: #fff;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
  user-select: none;
}

.ai-option-toggle:hover {
  border-color: #adb5bd;
  background: #f8f9fa;
}

.ai-option-toggle.is-active {
  border-color: #495057;
  background: #e9ecef;
  box-shadow: 0 0 0 3px rgba(73, 80, 87, 0.12);
}

.ai-option-icon {
  font-size: 1.4rem;
  color: #495057;
}

.ai-option-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #333;
}
</style>
