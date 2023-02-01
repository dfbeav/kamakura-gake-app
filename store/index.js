export const state = () => ({
  selectedPieceType: 0,
  completedUnitPlacement: false,
})

export const getters = {
  getSelectedPieceType(state) {
    return state.selectedPieceType
  },
  getCompletedUnitPlacement(state) {
    return state.completedUnitPlacement
  }
}

export const mutations = {
  setSelectedPieceType(state, newSetting) {
    state.selectedPieceType = newSetting.selectedPieceType
  },
  setCompletedUnitPlacement(state, newSetting) {
    state.completedUnitPlacement = newSetting.completedUnitPlacement
  }
}


export const actions = {

}
