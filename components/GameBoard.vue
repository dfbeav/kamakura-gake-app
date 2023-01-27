<template>
  <div id="gameBoard" class="p-3">
    <div class="d-flex flex-wrap">
      <div
        v-for="(tile, index ) in gameData.gameBoardData" :key="index"
        :id="'tile_' + index"
        class="tile"
        :class="[
          index % 39 === 0 ? 'tile_offset' : '',
          selectionPossibilities[index] != undefined && selectionPossibilities[index].canBeAttacked ? 'cursorPointer' : '',
          selectionPossibilities[index] != undefined && selectionPossibilities[index].canMoveTo  ? 'cursorPointer' : '',
          selectionPossibilities[index] != undefined && !selectionPossibilities[index].canBeAttacked && !selectionPossibilities[index].canMoveTo ? 'cursorNotAllowed' : '',
          ]"
        :style="'width:' + tileSize + '%;'"
        @click="selectOrMove(index)"
        >
          <h1 class="mb-0">
              <i
                v-if="tile.playerIndex > -1"
                class="playerIcon"
                :class="[gamePieces[tile.value - 1].icon, 'text-' + gameData.players[tile.playerIndex].color]"
                >
              </i>
          </h1>
          <p
            v-if="tile.playerIndex > -1"
            class="pieceValue"
            :class="'text-' + gameData.players[tile.playerIndex].color"
            >
              {{ tile.value }}
            </p>
            <!-- "Hove here" icon -->
          <i
            v-if="selectionPossibilities[index] != undefined && selectionPossibilities[index].canMoveTo"
            class="moveHereIcon ri-arrow-up-s-line"
            :class="selectionPossibilities[index].directionFromSelectedTile"></i>
          <div
            class="hexagon hex1"
            :class="[
              selectedTile === index ? 'selected' : '',
              selectionPossibilities[index] != undefined && selectionPossibilities[index].canBeAttacked ? 'canBeAttacked' : ''
              ]"
            ></div>
      </div>
    </div>
  </div>
</template>


<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'gameBoard',
  props: ['tileSize', 'thisUserIndex', 'gameData'],
  data() {
    return {
      selectedTile: -1 as any,

      selectionPossibilities: [] as any,

      gamePieces: [
        {
          value: 1,
          icon: 'ri-user-3-fill',
        },
        {
          value: 2,
          icon: 'ri-group-fill',
        },
        {
          value: 3,
          icon: 'ri-team-fill',
        },
        {
          value: 4,
          icon: 'ri-body-scan-fill',
        },
        {
          value: 5,
          icon: 'ri-vip-crown-fill',
        }
      ]
    }
  },
  mounted() {

  },
  methods: {
    checkSurroundingTiles: function() {

      this.surroundingTiles.forEach((tile: any) => {
        //exclude results that are below 0 or above the board size
        if (tile.surroundingTileIndex > -1 && tile.surroundingTileIndex < this.gameData.gameBoardData.length) {
          if (this.gameData.gameBoardData[tile.surroundingTileIndex].playerIndex != this.thisUserIndex) {

            let possibility = {
              tile: tile.surroundingTileIndex,
              canBeAttacked: this.checkCanBeAttacked(tile.surroundingTileIndex),
              canMoveTo: this.gameData.gameBoardData[tile.surroundingTileIndex].playerIndex === -1,
              directionFromSelectedTile: tile.direction
            }

            this.$set(this.selectionPossibilities, tile.surroundingTileIndex, possibility)

          }
        }
      })
    },
    checkCanBeAttacked: function(index:number): any {

      if (this.gameData.gameBoardData[index].playerIndex > -1) {
        if (this.gameData.gameBoardData[index].value <= this.gameData.gameBoardData[this.selectedTile].value) {
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    },
    selectOrMove: function(index:number) {
      //Select a tile if the player owns this tile
      if (this.gameData.gameBoardData[index].playerIndex === this.thisUserIndex) {
        //If player owns this tile, select it
        this.selectedTile = index
      } else  {
        //Check if the player can move to this tile
        if (this.selectionPossibilities[index] != undefined && this.selectionPossibilities[index].canMoveTo) {
          //Clear the selection possibilities
          this.selectionPossibilities = [];
          //Move the player to this tile
          (this.$parent as any).moveToTile(this.selectedTile, index);

          this.selectedTile = index;

        } else if (this.selectionPossibilities[index] != undefined && this.selectionPossibilities[index].canBeAttacked) {
          //Attack the tile
          (this.$parent as any).attackTile(this.selectedTile, index);
        } else {
          //Otherwise, the player is disselecting the tile
          this.selectedTile = -1
        }

      }
    },

  },
  watch: {
    selectedTile: function() {
      this.selectionPossibilities = []
      //check each tile surrounding the selected tile
      this.checkSurroundingTiles()
    },
  },
  computed: {
    surroundingTiles():any {
      let tileDistance = ( 100 / this.tileSize )

      console.log(tileDistance)

      let array = [
        {
          surroundingTileIndex: this.selectedTile - 1,
          direction: 'left'
        },
        {
          surroundingTileIndex: this.selectedTile + 1,
          direction: 'right'
        },
        {
          surroundingTileIndex: this.selectedTile - (tileDistance - 1 ),
          direction: 'topLeft'
        }, //top left
        {
          surroundingTileIndex: this.selectedTile - (tileDistance),
          direction: 'topRight'
        }, //top right
        {
          surroundingTileIndex: this.selectedTile + (tileDistance - 1),
          direction: 'bottomLeft'
        },  //bottom left
        {
          surroundingTileIndex: this.selectedTile + (tileDistance),
          direction: 'bottomRight'
        },
      ]

      return array
    },
  }

})
</script>
