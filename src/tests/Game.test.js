import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import gameReducer from '../features/gameSlice';
import Game from '../App';

jest.mock('../icons/light-icon.svg', () => 'light-icon.svg');
jest.mock('../icons/dark-icon.svg', () => 'dark-icon.svg');

const createTestStore = () => {
  return configureStore({
    reducer: {
      game: gameReducer
    }
  });
};

describe('Game Component', () => {
  let store;

  beforeEach(() => {
    store = createTestStore();
    localStorage.clear();
  });

  test('renders symbol choice screen initially', () => {
    render(
      <Provider store={store}>
        <Game />
      </Provider>
    );
    
    expect(screen.getByText('Choose your symbol')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'X' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'O' })).toBeInTheDocument();
  });

  test('starts game after symbol choice', () => {
    render(
      <Provider store={store}>
        <Game />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'X' }));
    

    expect(screen.getByText(/turn/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button').length).toBeGreaterThan(10);
  });

  test('allows player moves', () => {
    render(
      <Provider store={store}>
        <Game />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'X' }));

    let squares;

    if (store.getState().game.playerIsNext) {
      squares = screen.getAllByRole('button').filter(button => button.textContent === '');
      fireEvent.click(squares[0]);
    } else {
      squares = screen.getAllByRole('button').filter(button => button.textContent === '');
      fireEvent.click(squares[0]);
    }

    expect(squares[0].textContent === 'X' || squares[0].textContent === 'O').toBeTruthy();

  });

  test('handles game reset', () => {
    render(
      <Provider store={store}>
        <Game />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'X' }));
    const restartButton = screen.getByRole('button', { name: 'Restart' });
    
    fireEvent.click(restartButton);
    
    expect(screen.getByText('Choose your symbol')).toBeInTheDocument();
  });

  test('toggles dark mode', () => {
    render(
      <Provider store={store}>
        <Game />
      </Provider>
    );

    const darkModeToggle = screen.getByRole('button', { name: 'Toggle theme' });
    fireEvent.click(darkModeToggle);
    
    expect(document.body.classList.contains('dark-mode')).toBeTruthy();
    
    fireEvent.click(darkModeToggle);
    expect(document.body.classList.contains('dark-mode')).toBeFalsy();
  });

  test('AI makes a move after player', async () => {
    jest.useFakeTimers();
    
    render(
      <Provider store={store}>
        <Game />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'X' }));
    const squares = screen.getAllByRole('button').filter(button => button.textContent === '');
    
    fireEvent.click(squares[0]);
    
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });
    
    const filledSquares = screen.getAllByRole('button')
      .filter(button => button.textContent !== '')
      .filter(button => !['Restart', 'Reset AI Difficulty', 'Toggle theme'].includes(button.textContent));
    
    expect(filledSquares.length).toBeGreaterThanOrEqual(2);
    
    jest.useRealTimers();
  });

  test('detects win condition', () => {
    render(
      <Provider store={store}>
        <Game />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'X' }));
    
    const squares = screen.getAllByRole('button').filter(button => button.textContent === '');
    
    for(let i = 0; i < 3; i++) {
      if(squares[i]) {
        fireEvent.click(squares[i]);
        act(() => {
          jest.advanceTimersByTime(1500);
        });
      }
    }
    
    const status = screen.getByText(/won|lost|draw/i);
    expect(status).toBeInTheDocument();
  });
});
