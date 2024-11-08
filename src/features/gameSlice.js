import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  squares: Array(9).fill(null),
  lastSquares: null,
  playerSymbol: null,
  aiSymbol: null,
  playerIsNext: null,
  statusMessage: "Choose your symbol",
  gamesPlayed: 0,
  gamesCountForChangeDifficulty: 0,
  difficultyLevel: 1,
  resetting: false,
  isButtonDisabled: false,
  isDarkMode: false
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setSquares: (state, action) => {
      state.squares = action.payload;
    },
    setLastSquares: (state, action) => {
      state.lastSquares = action.payload;
    },
    setPlayerSymbol: (state, action) => {
      state.playerSymbol = action.payload;
    },
    setAiSymbol: (state, action) => {
      state.aiSymbol = action.payload;
    },
    setPlayerIsNext: (state, action) => {
      state.playerIsNext = action.payload;
    },
    setStatusMessage: (state, action) => {
      state.statusMessage = action.payload;
    },
    setGamesPlayed: (state, action) => {
      state.gamesPlayed = action.payload;
    },
    setGamesCountForChangeDifficulty: (state, action) => {
      state.gamesCountForChangeDifficulty = action.payload;
    },
    setDifficultyLevel: (state, action) => {
      state.difficultyLevel = action.payload;
    },
    setResetting: (state, action) => {
      state.resetting = action.payload;
    },
    setIsButtonDisabled: (state, action) => {
      state.isButtonDisabled = action.payload;
    },
    setIsDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
    },
    resetGame: (state) => {
      state.squares = Array(9).fill(null);
      state.lastSquares = null;
      state.playerSymbol = null;
      state.aiSymbol = null;
      state.playerIsNext = null;
      state.statusMessage = "Choose your symbol";
      state.resetting = false;
      state.isButtonDisabled = false;
    },
    resetAI: (state) => {
      state.gamesCountForChangeDifficulty = 0;
      state.difficultyLevel = 1;
    }
  }
});

export const {
  setSquares,
  setLastSquares,
  setPlayerSymbol,
  setAiSymbol,
  setPlayerIsNext,
  setStatusMessage,
  setGamesPlayed,
  setGamesCountForChangeDifficulty,
  setDifficultyLevel,
  setResetting,
  setIsButtonDisabled,
  setIsDarkMode,
  resetGame,
  resetAI
} = gameSlice.actions;

export default gameSlice.reducer;
