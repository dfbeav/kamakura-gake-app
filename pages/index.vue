<template>
  <b-col>
    <b-col cols="12" class="d-flex justify-content-center">
      <b-col sm="12" md="10" lg="8">
        <img class="w-100" :src="require('~/assets/images/logo.svg')" alt="Kamakura Geku Logo">
      </b-col>
    </b-col>
    <GameBoard
      :gameData="gameData"
      :thisUserIndex="thisUserIndex"
      :tileSize="tileSize"
    />
  </b-col>
</template>

<script lang="ts">
import Vue from 'vue'

import 'remixicon/fonts/remixicon.css'


export default Vue.extend({
  name: 'Kamakura-Geku',
  data() {
    return {
      boardSize: 234,

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
          {
            id: 2,
            name: 'Player 3',
            color: 'purple',
            score: 0,
            isTurn: false,
          },
          {
            id: 3,
            name: 'Player 4',
            color: 'yellow',
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
  },
  methods: {
    createBoard: function() {
      for (let i = 0; i < this.boardSize; i++) {
        this.gameData.gameBoardData.push({
          playerIndex: -1,
        })

        if (i === this.boardSize - 1) {
          this.loadFakeData();
        }
      }
    },
    moveToTile: function(previousTileIndex:number, index:number):any {

      console.log(JSON.stringify(this.gameData.gameBoardData[previousTileIndex]))

      this.$set(this.gameData.gameBoardData, index, this.gameData.gameBoardData[previousTileIndex])
      this.$set(this.gameData.gameBoardData, previousTileIndex, {
        value: 0,
        playerIndex: -1
      })

    },
    attackTile: function(index:number) {
      console.log('attack space ' + index)
    },
    loadFakeData: function() {
      const newData125 = {
        playerIndex: 0,
        value: 3,
      }
      this.$set(this.gameData.gameBoardData, 125, newData125)

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
    }
  },
  computed: {

  }

})
</script>
