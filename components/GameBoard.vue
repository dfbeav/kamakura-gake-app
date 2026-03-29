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
    <b-col
      v-if="playGame"
      id="balanceOfPowerBar"
      cols="12"
      class="position-sticky mb-3 px-3 mb-6"
      >
      <div class="d-flex justify-content-between mb-1" style="font-size: 0.75rem;">
        <span class="bg-white rounded-lg py-1 px-2" :class="'text-' + gameData.players[0].color">{{ gameData.players[0].name }}: {{ unitCounts[0] }}</span>
        <span class="text-white opacity-75">Balance of Power</span>
        <span class="bg-white rounded-lg py-1 px-2" :class="'text-' + gameData.players[gameData.players.length - 1].color">{{ gameData.players[gameData.players.length - 1].name }}: {{ unitCounts[gameData.players.length - 1] }}</span>
      </div>
      <div class="d-flex w-100 border rounded-lg" style="height: 18px; overflow: hidden;">
        <div
          v-for="(player, i) in gameData.players"
          :key="i"
          :class="'bg-' + player.color"
          :style="{ width: totalUnitsOnBoard > 0 ? (unitCounts[i] / totalUnitsOnBoard * 100) + '%' : (100 / gameData.players.length) + '%', transition: 'width 0.5s ease' }"
          ></div>
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
  props: ['placeUnits', 'playGame', 'startingPieces', 'tileSize', 'tileHeight', 'thisUserIndex', 'gameData', 'aiThinking'],
  data() {
    return {

      selectedTile: -1 as number,

      surroundingTiles: [] as any,

      selectionPossibilities: [] as any,

      gamePieces: [
        {
          value: 1,
          movement: 6,
          icon: 'ri-user-3-fill',
        },
        {
          value: 2,
          movement: 5,
          icon: 'ri-group-fill',
        },
        {
          value: 3,
          movement: 4,
          icon: 'ri-team-fill',
        },
        {
          value: 4,
          movement: 3,
          icon: 'ri-sword-fill',
        },
        {
          value: 5,
          movement: 2,
          icon: 'ri-vip-crown-fill',
        }
      ],


    }
  },
  mounted() {

  },
  methods: {
    checkSurroundingTiles: function() {
      const selectedValue = this.gameData.gameBoardData[this.selectedTile].value
      const maxMovement = this.gamePieces[selectedValue - 1].movement
      const boardSize = this.gameData.gameBoardData.length

      // BFS to find all reachable tiles within movement range
      let visited: any = {}
      visited[this.selectedTile] = true

      // Queue entries: { tileId, depth }
      let queue: any[] = []

      // Start BFS from the selected tile at depth 0
      const initialNeighbors = this.findSurroundingTiles(this.selectedTile)
      initialNeighbors.forEach((tile: any) => {
        if (tile.surroundingTileId > -1 && tile.surroundingTileId < boardSize && !visited[tile.surroundingTileId]) {
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
        if (tileData === undefined) continue

        if (tileData.playerIndex === -1) {
          // Empty tile — mark as canMoveTo
          if (!this.selectionPossibilities[tileId]) {
            this.$set(this.selectionPossibilities, tileId, {
              tile: tileId,
              canMoveTo: true,
              directionFromSelectedTile: current.direction
            })
          }

          // Continue BFS through empty tiles if we have movement left
          if (depth < maxMovement) {
            const nextNeighbors = this.findSurroundingTiles(tileId)
            nextNeighbors.forEach((adj: any) => {
              if (adj.surroundingTileId > -1 && adj.surroundingTileId < boardSize && !visited[adj.surroundingTileId]) {
                queue.push({ tileId: adj.surroundingTileId, depth: depth + 1, direction: adj.direction })
              }
            })
          }
        } else if (tileData.playerIndex === this.thisUserIndex) {
          // Friendly tile — can pass through but not land on
          if (depth < maxMovement) {
            const nextNeighbors = this.findSurroundingTiles(tileId)
            nextNeighbors.forEach((adj: any) => {
              if (adj.surroundingTileId > -1 && adj.surroundingTileId < boardSize && !visited[adj.surroundingTileId]) {
                queue.push({ tileId: adj.surroundingTileId, depth: depth + 1, direction: adj.direction })
              }
            })
          }
        } else {
          // Enemy tile — mark as attackable if within movement range and not already processed
          if (!this.selectionPossibilities[tileId]) {
            // Build surroundingTiles info for attack calculation
            const adjTiles = this.findSurroundingTiles(tileId)
            let surroundingTilesInfo: any[] = []
            adjTiles.forEach((adj: any) => {
              if (adj.surroundingTileId > -1 && adj.surroundingTileId < boardSize) {
                surroundingTilesInfo.push({
                  ...this.gameData.gameBoardData[adj.surroundingTileId],
                  direction: adj.direction,
                  surroundingTileId: adj.surroundingTileId,
                })
              }
            })

            this.$set(this.selectionPossibilities, tileId, {
              tile: tileId,
              canMoveTo: false,
              canBeAttacked: false,
              directionFromSelectedTile: current.direction,
              surroundingTiles: surroundingTilesInfo
            })

            this.$set(this.selectionPossibilities[tileId], 'canBeAttacked', this.checkCanBeAttacked(tileId))
          }
          // Don't BFS through enemy tiles
        }
      }
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

        const selectedValue = this.gameData.gameBoardData[this.selectedTile].value
        const targetValue = this.gameData.gameBoardData[index].value

        // If the selected unit is strong enough on its own, no help needed
        if (selectedValue >= targetValue) {
          this.$set(this.selectionPossibilities[index], 'requiresHelp', false)
          return true
        }

        let adjacentTileCombinations:number = 0;

        //Add up the value of the surrounding friendly units, they can be used in attacks
        this.selectionPossibilities[index].surroundingTiles.forEach((tile: any) => {
          if (tile.playerIndex === this.thisUserIndex && tile.surroundingTileId != this.selectedTile) {
            adjacentTileCombinations = adjacentTileCombinations + tile.value
          }
        })

        //Check if combined strength is enough
        if (targetValue <= selectedValue + adjacentTileCombinations) {
          this.$set(this.selectionPossibilities[index], 'requiresHelp', true)
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
      //Block interaction during AI turn
      if (this.aiThinking) return

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

          // Only exhaust adjacent helpers if the attack actually required their support
          const attackedTilePossibility = this.selectionPossibilities[index]
          if (attackedTilePossibility.requiresHelp && attackedTilePossibility.surroundingTiles) {
            attackedTilePossibility.surroundingTiles.forEach((tile: any) => {
              if (
                tile.playerIndex === this.thisUserIndex &&
                tile.surroundingTileId !== this.selectedTile
              ) {
                this.$set(this.gameData.gameBoardData[tile.surroundingTileId], 'moved', true)
              }
            })
          }

          this.resetSelectedTile()

        } else {
          //Otherwise, the player is disselecting the tile
          this.resetSelectedTile()
        }

      }
    },
    findSurroundingTiles(tileIndex:number):any {
      const offsetRowSize = (100 / this.tileSize) - 1   // 19
      const normalRowSize = 100 / this.tileSize          // 20
      const tilesPerPair = offsetRowSize + normalRowSize  // 39
      const boardSize = this.gameData.gameBoardData.length

      // Determine row and column for a given tile index
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

      // Calculate total rows based on board size
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

      let neighbors: any[] = []
      const currentRowSize = getRowSize(row)

      // Left
      if (col > 0) {
        neighbors.push({ surroundingTileId: toIndex(row, col - 1), direction: 'left' })
      }
      // Right
      if (col < currentRowSize - 1) {
        neighbors.push({ surroundingTileId: toIndex(row, col + 1), direction: 'right' })
      }

      if (isOffsetRow) {
        // Offset row neighbors
        if (row > 0) {
          const aboveSize = getRowSize(row - 1)
          if (col + 1 < aboveSize) {
            neighbors.push({ surroundingTileId: toIndex(row - 1, col + 1), direction: 'topLeft' })
          }
          if (col >= 0 && col < aboveSize) {
            neighbors.push({ surroundingTileId: toIndex(row - 1, col), direction: 'topRight' })
          }
        }
        if (row + 1 < totalRows) {
          const belowSize = getRowSize(row + 1)
          if (col < belowSize) {
            neighbors.push({ surroundingTileId: toIndex(row + 1, col), direction: 'bottomLeft' })
          }
          if (col + 1 < belowSize) {
            neighbors.push({ surroundingTileId: toIndex(row + 1, col + 1), direction: 'bottomRight' })
          }
        }
      } else {
        // Non-offset row neighbors
        if (row > 0) {
          const aboveSize = getRowSize(row - 1)
          if (col < aboveSize) {
            neighbors.push({ surroundingTileId: toIndex(row - 1, col), direction: 'topLeft' })
          }
          if (col - 1 >= 0 && col - 1 < aboveSize) {
            neighbors.push({ surroundingTileId: toIndex(row - 1, col - 1), direction: 'topRight' })
          }
        }
        if (row + 1 < totalRows) {
          const belowSize = getRowSize(row + 1)
          if (col - 1 >= 0 && col - 1 < belowSize) {
            neighbors.push({ surroundingTileId: toIndex(row + 1, col - 1), direction: 'bottomLeft' })
          }
          if (col < belowSize) {
            neighbors.push({ surroundingTileId: toIndex(row + 1, col), direction: 'bottomRight' })
          }
        }
      }

      return neighbors
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
    unitCounts (): Record<number, number> {
      const counts: Record<number, number> = {}
      this.gameData.players.forEach((_: any, i: number) => {
        counts[i] = 0
      })
      this.gameData.gameBoardData.forEach((tile: any) => {
        if (tile.playerIndex > -1) {
          counts[tile.playerIndex] = (counts[tile.playerIndex] || 0) + 1
        }
      })
      return counts
    },
    totalUnitsOnBoard (): number {
      return (Object.values(this.unitCounts) as number[]).reduce((sum, count) => sum + count, 0)
    },
  }

})
</script>
