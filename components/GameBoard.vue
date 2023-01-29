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
        :style="'width:' + tileSize + '%; height:' + tileHeight + 'px'"
        @click="tile.moved ? '' : selectOrMove(index)"
        >
          <h1 class="mb-0">
              <i
                v-if="tile.playerIndex > -1"
                class="playerIcon"
                :class="[
                  gamePieces[tile.value - 1].icon,
                  'text-' + gameData.players[tile.playerIndex].color,
                  tile.moved ? 'moved' : ''
                  ]"
                >
              </i>
          </h1>
          <p
            v-if="tile.playerIndex > -1"
            class="pieceValue"
            :class="[
              'text-' + gameData.players[tile.playerIndex].color,
              tile.moved ? 'moved' : ''
              ]"
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
  props: ['tileSize', 'tileHeight', 'thisUserIndex', 'gameData'],
  data() {
    return {
      selectedTile: -1 as any,

      surroundingTiles: [] as any,

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
          icon: 'ri-sword-fill',
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

      this.surroundingTiles.forEach((tile: any, index: number) => {

        //exclude results that are below 0 or above the board size
        if (tile.surroundingTileId > -1 && tile.surroundingTileId < this.gameData.gameBoardData.length) {
          if (this.gameData.gameBoardData[tile.surroundingTileId].playerIndex != this.thisUserIndex) {

            let possibility = {
              tile: tile.surroundingTileId,
              canMoveTo: this.gameData.gameBoardData[tile.surroundingTileId].playerIndex === -1,
              directionFromSelectedTile: tile.direction
            }

            this.$set(this.selectionPossibilities, tile.surroundingTileId, possibility)



            //find the surrounding tiles of the surrounding tiles
            this.findSurroundingTiles(tile.surroundingTileId).forEach((adjacentTile: any) => {

              //exclude results that are below 0 or above the board size
              if (adjacentTile.surroundingTileId > -1 && adjacentTile.surroundingTileId < this.gameData.gameBoardData.length) {

                if (!this.selectionPossibilities[tile.surroundingTileId].hasOwnProperty('surroundingTiles')) {
                  this.$set(this.selectionPossibilities[tile.surroundingTileId], 'surroundingTiles' , [])
                }

                let fullTileInfo = {
                  ...this.gameData.gameBoardData[adjacentTile.surroundingTileId],
                  'direction': adjacentTile.direction,
                  'surroundingTileId': adjacentTile.surroundingTileId,
                }

                console.log(this.selectedTile, tile.surroundingTileId)

                this.selectionPossibilities[tile.surroundingTileId].surroundingTiles.push(fullTileInfo)


                //add the canBeAttacked property to the surrounding tiles
                this.$set(this.selectionPossibilities[tile.surroundingTileId], 'canBeAttacked', this.checkCanBeAttacked(tile.surroundingTileId))

              }
            })

          }
        }
      })
    },
    checkCanBeAttacked: function(index:number): any {

      if (this.gameData.gameBoardData[this.selectedTile].playerIndex > -1) {

        let adjacentTileCombinations:number = 0;

        //Add up the value of the surrounding friendly units, they can be used in attacks
        this.selectionPossibilities[index].surroundingTiles.forEach((tile: any) => {
          if (tile.playerIndex === this.thisUserIndex && tile.surroundingTileId != this.selectedTile) {
            adjacentTileCombinations = adjacentTileCombinations + tile.value
            console.log()
          }
        })

        //Check if the player can attack this tile (is it's value less than or equal to this adjacent tile?)
        if (this.gameData.gameBoardData[index].value <= this.gameData.gameBoardData[this.selectedTile].value + adjacentTileCombinations) {
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    },
    resetSelectedTile: function() {
      this.selectionPossibilities = [];
      this.selectedTile = -1;
    },
    selectOrMove: function(index:number) {
      //Select a tile if the player owns this tile
      if (this.gameData.gameBoardData[index].playerIndex === this.thisUserIndex) {
        //If player owns this tile, select it
        this.selectedTile = index
      } else  {
        //Check if the player can move to this tile
        if (this.selectionPossibilities[index] != undefined && this.selectionPossibilities[index].canMoveTo) {

          //MOVE the player to this tile
          (this.$parent as any).moveToTile(this.selectedTile, index);

          this.resetSelectedTile()

        } else if (this.selectionPossibilities[index] != undefined && this.selectionPossibilities[index].canBeAttacked) {
          //Attack the tile
          (this.$parent as any).moveToTile(this.selectedTile, index);

          this.resetSelectedTile()
        } else {
          //Otherwise, the player is disselecting the tile
          this.resetSelectedTile()
        }

      }
    },
    findSurroundingTiles(tileIndex:number):any {
      let tileDistance = ( 100 / this.tileSize )

      let array = [
        {
          surroundingTileId: tileIndex - 1,
          direction: 'left'
        },
        {
          surroundingTileId: tileIndex + 1,
          direction: 'right'
        },
        {
          surroundingTileId: tileIndex - (tileDistance - 1 ),
          direction: 'topLeft'
        }, //top left
        {
          surroundingTileId: tileIndex - (tileDistance),
          direction: 'topRight'
        }, //top right
        {
          surroundingTileId: tileIndex + (tileDistance - 1),
          direction: 'bottomLeft'
        },  //bottom left
        {
          surroundingTileId: tileIndex + (tileDistance),
          direction: 'bottomRight'
        },
      ]

      return array
    },

  },
  watch: {
    selectedTile: function() {
      this.selectionPossibilities = []

      this.surroundingTiles = this.findSurroundingTiles(this.selectedTile)
      //check each tile surrounding the selected tile

      if (this.selectedTile > -1) {
        this.checkSurroundingTiles()
      }
    },
  },
  computed: {
  }

})
</script>
