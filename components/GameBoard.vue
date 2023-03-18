<template>
  <div
    v-if="playGame || placeUnits"
    id="gameBoard"
    class="p-3"
    >
    <img id="gameboardBackground" src="@/assets/images/_bg_2.png" alt="catfish background" />
    <b-col
      id="multipFunctionalBar"
      v-if="placeUnits"
      class="d-inline-flex position-sticky mb-3 border-curved"
      >
      <div class="p-2 d-flex justify-content-center flex-wrap text-white w-100">
        <b-col cols="12" class="text-center">
          <h6>Place {{ gameData.players[thisUserIndex].name }} Units</h6>
        </b-col>
        <div
          class="px-5 border-secondary"
          v-for="(piece, index) in gamePieces" :key="index"
          :class="index === gamePieces.length - 1 ? '' : 'border-right'"
          @click="$store.commit('setSelectedPieceType', {selectedPieceType: index})"
          >
          <span
            :data-type="selectedPieceType"
            :data-index="index"
            class="d-flex align-items-center py-1 px-3 border border-pill cursorPointer"
            :class="selectedPieceType === index ? 'border-' + gameData.players[thisUserIndex].color : 'border-dark'"
            >
            <i
              class="h3 mb-0"
              :class="[
                gamePieces[piece.value - 1].icon,
                'text-' + gameData.players[thisUserIndex].color,
                ]"
              >
              </i>
            <h5 class="mb-1">
              <b-badge
                pill
                :class="'bg-' + gameData.players[thisUserIndex].color"
                class="ml-2"
                >
                {{ startingPieces[index] }}
              </b-badge>
            </h5>

          </span>
        </div>
      </div>
    </b-col>
    <b-col cols="12" class="d-inline-flex flex-wrap">
      <template v-if="placeUnits">
        <div
          v-for="(tile, index ) in gameData.gameBoardData" :key="index"
          :id="'tile_' + index"
          class="tile"
          :class="[
            index % (((100 / tileSize) * 2) -1) === 0 ? 'tile_offset' : '',
            selectionPossibilities[index] != undefined && selectionPossibilities[index].canBeAttacked ? 'cursorPointer' : '',
            selectionPossibilities[index] != undefined && selectionPossibilities[index].canMoveTo  ? 'cursorPointer' : '',
            selectionPossibilities[index] != undefined && !selectionPossibilities[index].canBeAttacked && !selectionPossibilities[index].canMoveTo ? 'cursorNotAllowed' : '',
            ]"
          :style="'width:' + tileSize + '%; height:' + tileHeight + 'px'"
          @click="addToThisTile(index)"
          >
            <h1 class="mb-0">
                <i
                  v-if="tile.playerIndex > -1"
                  class="playerIcon"
                  :class="[
                    gamePieces[tile.value - 1] ? gamePieces[tile.value - 1].icon : '',
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
            <div
              class="hexagon hex1"
              ></div>
        </div>
      </template>

      <template v-if="playGame">
        <div
          v-for="(tile, index ) in gameData.gameBoardData" :key="index"
          :id="'tile_' + index"
          class="tile"
          :class="[
            index % (((100 / tileSize) * 2) -1) === 0 ? 'tile_offset' : '',
            selectionPossibilities[index] != undefined && selectionPossibilities[index].canBeAttacked ? 'cursorPointer' : '',
            selectionPossibilities[index] != undefined && selectionPossibilities[index].canMoveTo  ? 'cursorPointer' : '',
            selectionPossibilities[index] != undefined && !selectionPossibilities[index].canBeAttacked && !selectionPossibilities[index].canMoveTo ? 'cursorNotAllowed' : '',
            ]"
          :style="'width:' + tileSize + '%; height:' + tileHeight + 'px'"
          :data-edge="tile.edge ? tile.edge : ''"
          @click="tile.moved ? '' : selectOrMove(index)"
          >
            <h1 class="mb-0">
                <i
                  v-if="tile.playerIndex > -1"
                  class="playerIcon"
                  :class="[
                    gamePieces[tile.value - 1] ? gamePieces[tile.value - 1].icon : '',
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
            <div
              class="topTile hex1 bg-light"
              :class="[
                selectedTile === index ? 'selected' : '',
                selectionPossibilities[index] != undefined && selectionPossibilities[index].canBeAttacked ? 'canBeAttacked' : '',
                selectionPossibilities[index] != undefined && selectionPossibilities[index].canMoveTo ? 'canMoveTo' : ''
                ]"
              ></div>
            <div
              v-if="selectionPossibilities[index] != undefined && selectionPossibilities[index].canMoveTo"
              class="bottomTile hex1 bg-info"
              ></div>
            <div
              v-if="selectionPossibilities[index] != undefined && selectionPossibilities[index].canBeAttacked"
              class="bottomTile hex1 bg-warning"
              ></div>
        </div>
      </template>
    </b-col>
  </div>
</template>


<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'gameBoard',
  props: ['placeUnits', 'playGame', 'startingPieces', 'tileSize', 'tileHeight', 'thisUserIndex', 'gameData'],
  data() {
    return {

      selectedTile: -1 as number,

      surroundingTiles: [] as any,

      selectionPossibilities: [] as any,

      gamePieces: [
        {
          value: 1,
          movement: 4,
          icon: 'ri-user-3-fill',
        },
        {
          value: 2,
          movement: 1,
          icon: 'ri-group-fill',
        },
        {
          value: 3,
          movement: 1,
          icon: 'ri-team-fill',
        },
        {
          value: 4,
          movement: 1,
          icon: 'ri-sword-fill',
        },
        {
          value: 5,
          movement: 1,
          icon: 'ri-vip-crown-fill',
        }
      ],


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
    addToThisTile(index:number) {
      if (this.gameData.gameBoardData[index].playerIndex === -1 && !this.completedUnitPlacement) {
        //If the tile is empty, add the selected piece to it
        this.gameData.gameBoardData[index].playerIndex = this.thisUserIndex
        this.gameData.gameBoardData[index].value = this.selectedPieceType + 1;
        this.gameData.gameBoardData[index].movementRemaining = this.gamePieces[this.selectedPieceType].movement - 1

        //remove the piece from the player's starting pieces
        this.$set((this.$parent as any).startingPieces, this.selectedPieceType, (this.$parent as any).startingPieces[this.selectedPieceType] - 1)

        //if the player has no more pieces of this type left to place, select the next piece type
        if ( (this.$parent as any).startingPieces[this.selectedPieceType] === 0) {
          this.$store.commit('setSelectedPieceType', {selectedPieceType: this.selectedPieceType + 1})
        }

      } else if (this.gameData.gameBoardData[index].playerIndex === this.thisUserIndex) {
        //if the tile is owned by the player, remove the piece from it
        let thisTileOriginalValue = this.gameData.gameBoardData[index].value

        //remove the piece from the tile
        this.gameData.gameBoardData[index].playerIndex = -1
        this.gameData.gameBoardData[index].value = 0;

        //add the piece back to the player's starting pieces
        (this.$parent as any).startingPieces[thisTileOriginalValue - 1] = (this.$parent as any).startingPieces[thisTileOriginalValue - 1] + 1

        this.$store.commit('setSelectedPieceType', {selectedPieceType: thisTileOriginalValue - 1})

        this.$store.commit('setCompletedUnitPlacement', {completedUnitPlacement: false})

      } else if (this.completedUnitPlacement) {
        (this.$parent as any).createNotification(`You have no more pieces left to place`, 'danger')
      } else {
        //notify the player that they can't place a piece on an enemy tile
        (this.$parent as any).createNotification(`You can't place a piece on an enemy tile`, 'danger')
      }
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
      } else if (this.gameData.gameBoardData[index].playerIndex != this.thisUserIndex && this.selectedTile === -1 && this.gameData.gameBoardData[index].playerIndex > -1) {
        //User clicks on an enemy tile when no tile is selected
        (this.$parent as any).createNotification(`It is ` + this.gameData.players[this.thisUserIndex].name + `'s turn`, 'info')
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

        if (tileIndex > -1 && tileIndex === this.selectedTile) {
          array.forEach((tile, index) => {
            console.log(tile)
            //Check if current tile has 'edge' parameter
            if (this.gameData.gameBoardData[tile.surroundingTileId] != undefined) {
              //Check if the tile is on the edge of the board
              if (this.gameData.gameBoardData[tile.surroundingTileId].edge) {

                if (this.gameData.gameBoardData[tileIndex].edge === 'right') {
                  //If the tile is on the left edge of the board, remove it from the array
                  if (this.gameData.gameBoardData[tile.surroundingTileId].edge === 'left') {
                    array.splice(index, 1)

                    console.log(tile.surroundingTileId + ' removed')
                  }
                } else if (this.gameData.gameBoardData[tileIndex].edge === 'left') {
                  if (this.gameData.gameBoardData[tile.surroundingTileId].edge === 'right') {
                    array.splice(index, 1)

                    console.log(tile.surroundingTileId + ' removed')
                  }
                }

              }
            } else {
              //If the tile is undefined, remove it from the array
              array.splice(index, 1)
            }
        })
      }


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
    selectedPieceType () {
      return this.$store.state.selectedPieceType
    },
    completedUnitPlacement () {
      return this.$store.state.completedUnitPlacement
    },
  }

})
</script>
