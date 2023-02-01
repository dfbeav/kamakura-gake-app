export const state = () => ({
  selectedPieceType: 0,
})

export const getters = {
  getSelectedPieceType(state) {
    return state.selectedPieceType
  }
}

export const mutations = {
  setSelectedPieceType(state, newSetting) {
    state.selectedPieceType = newSetting.selectedPieceType
  }
}


export const actions = {

}
