import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import gameReducer from "../features/gameSlice";
import Game from "../App";

jest.mock("../icons/light-icon.svg", () => "light-icon.svg");
jest.mock("../icons/dark-icon.svg", () => "dark-icon.svg");

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      game: gameReducer,
    },
    preloadedState: initialState,
  });
};

describe("Game Component", () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
    localStorage.clear();
    document.body.classList.remove("dark-mode");
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe("Initial Game Setup", () => {
    test("renders symbol choice screen initially", () => {
      render(
        <Provider store={store}>
          <Game />
        </Provider>
      );

      expect(screen.getByText("Choose your symbol")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "X" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "O" })).toBeInTheDocument();
    });

    test("starts game with correct initial state after symbol choice", () => {
      jest.useFakeTimers();

      render(
        <Provider store={store}>
          <Game />
        </Provider>
      );

      fireEvent.click(screen.getByRole("button", { name: "X" }));

      expect(screen.getByText(/turn/i)).toBeInTheDocument();

      const emptySquares = screen.getAllByTestId("board-square-empty");
      expect(emptySquares).toHaveLength(9);

      expect(store.getState().game.playerSymbol).toBe("X");
      expect(store.getState().game.aiSymbol).toBe("O");
    });
  });

  describe("Game Mechanics", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    test("handles player moves correctly", () => {
      const initialState = {
        game: {
          playerIsNext: true,
          playerSymbol: "X",
          aiSymbol: "O",
          squares: Array(9).fill(null),
        },
      };

      store = createTestStore(initialState);

      render(
        <Provider store={store}>
          <Game />
        </Provider>
      );

      const emptySquare = screen.getAllByTestId("board-square-empty")[0];
      fireEvent.click(emptySquare);

      expect(screen.getByTestId("board-square-X")).toBeInTheDocument();
      expect(store.getState().game.playerIsNext).toBe(false);
    });

    test("AI makes valid moves", () => {
      const initialState = {
        game: {
          playerIsNext: false,
          playerSymbol: "X",
          aiSymbol: "O",
          squares: Array(9).fill(null),
        },
      };

      store = createTestStore(initialState);

      render(
        <Provider store={store}>
          <Game />
        </Provider>
      );

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      const emptySquare = screen.getAllByTestId("board-square-empty")[0];
      fireEvent.click(emptySquare);

      const gameState = store.getState().game;

      const movesCount = gameState.squares.filter(
        (square) => square !== null
      ).length;

      expect(movesCount).toBe(2);
      expect(gameState.playerIsNext).toBe(false);
    });

    test("detects player win", () => {
      const initialState = {
        game: {
          playerIsNext: true,
          playerSymbol: "X",
          aiSymbol: "O",
          squares: ["X", "O", "X", "X", "O", "O", null, "X", "O"],
        },
      };

      store = createTestStore(initialState);

      render(
        <Provider store={store}>
          <Game />
        </Provider>
      );

      fireEvent.click(screen.getByTestId("board-square-empty"));

      expect(screen.getByText("You won!")).toBeInTheDocument();
    });

    test("detects AI win", () => {
      const initialState = {
        game: {
          playerIsNext: false,
          playerSymbol: "X",
          aiSymbol: "O",
          squares: ["O", "X", "O", "O", "X", "X", null, "O", "X"],
          difficultyLevel: 1,
        },
      };

      store = createTestStore(initialState);

      render(
        <Provider store={store}>
          <Game />
        </Provider>
      );

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(screen.getByText("You lost.")).toBeInTheDocument();
    });
  });

  describe("Game Controls", () => {
    test("resets game state correctly", async () => {
      render(
        <Provider store={store}>
          <Game />
        </Provider>
      );

      fireEvent.click(screen.getByRole("button", { name: "X" }));
      const restartButton = screen.getByRole("button", { name: "Restart" });

      fireEvent.click(restartButton);

      expect(screen.getByText("Choose your symbol")).toBeInTheDocument();
    });

    test("toggles dark mode with proper UI updates", () => {
      render(
        <Provider store={store}>
          <Game />
        </Provider>
      );

      const darkModeToggle = screen.getByRole("button", {
        name: "Toggle theme",
      });

      fireEvent.click(darkModeToggle);
      expect(document.body.classList.contains("dark-mode")).toBe(true);
      expect(localStorage.getItem("isDarkMode")).toBe("true");

      fireEvent.click(darkModeToggle);
      expect(document.body.classList.contains("dark-mode")).toBe(false);
      expect(localStorage.getItem("isDarkMode")).toBe("false");
    });

    test("handles AI difficulty reset", () => {
      const initialState = {
        game: {
          ...store.getState().game,
          playerIsNext: true,
          playerSymbol: "X",
          aiSymbol: "O",
          squares: Array(9).fill(null),
          difficultyLevel: 3,
          gamesPlayed: 10,
        },
      };
      store = createTestStore(initialState);

      render(
        <Provider store={store}>
          <Game />
        </Provider>
      );

      const resetAIButton = screen.getByRole("button", {
        name: "Reset AI Difficulty",
      });
      fireEvent.click(resetAIButton);

      expect(store.getState().game.difficultyLevel).toBe(1);
      expect(store.getState().game.gamesCountForChangeDifficulty).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    test("handles draw condition correctly", async () => {
      const drawState = {
        game: {
          ...store.getState().game,
          squares: ["X", "O", "X", "X", "O", "O", "O", "X", null],
          playerSymbol: "X",
          aiSymbol: "O",
          playerIsNext: true,
        },
      };
      store = createTestStore(drawState);

      render(
        <Provider store={store}>
          <Game />
        </Provider>
      );

      const lastSquare = screen.getByTestId("board-square-empty");
      fireEvent.click(lastSquare);

      expect(screen.getByText(/draw/i)).toBeInTheDocument();
    });

    test("prevents moves after game end", async () => {
      const wonState = {
        game: {
          ...store.getState().game,
          squares: ["X", "X", "X", null, null, null, null, null, null],
          playerSymbol: "X",
          aiSymbol: "O",
          playerIsNext: false,
          statusMessage: "You won!",
        },
      };
      store = createTestStore(wonState);

      render(
        <Provider store={store}>
          <Game />
        </Provider>
      );

      const emptySquare = screen.getAllByTestId("board-square-empty")[0];
      fireEvent.click(emptySquare);

      expect(store.getState().game.squares[3]).toBeNull();
    });
  });
});
