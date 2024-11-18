# Minimalistic Tic-Tac-Toe Game

A modern, responsive Tic-Tac-Toe game built with React and Redux, featuring an intelligent AI opponent with multiple difficulty levels and a beautiful dark/light theme toggle.

![Choose your symbol](https://i.ibb.co/sFtxhVr/image.png)

## Features

- Smart AI opponent with three difficulty levels
- Beautiful dark/light theme toggle
- Choose your symbol (X or O)
- Undo move functionality
- Fully responsive design
- Game state persistence

## Live Demo

Try it out: [Minimalistic Tic-Tac-Toe Game](https://FrancisBernard34.github.io/tic-tac-toe-game)

## Gameplay

### Choose Your Symbol
Start by choosing your preferred symbol (X or O). The AI will take the opposite symbol.

### Game Progress
Make strategic moves and try to outsmart the AI! The game features a smart AI opponent that adapts to different difficulty levels.

![Middle game](https://i.ibb.co/vPKV9pX/image.png)

### Victory or Defeat
Experience the thrill of victory or the challenge of defeat! The game keeps track of your progress and AI difficulty adjustments.

![Victory/lose screen](https://i.ibb.co/D9JR639/image.png)

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/FrancisBernard34/tic-tac-toe-game.git
```

2. Navigate to the project directory
```bash
cd tic-tac-toe-game
```

3. Install dependencies
```bash
npm install
```

4. Start the development server
```bash
npm start
```

The game will open in your default browser at `http://localhost:3000`.

## Built With

- [React](https://reactjs.org/) - UI library
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [Sass](https://sass-lang.com/) - Styling
- [Create React App](https://create-react-app.dev/) - Build setup
- [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/react) - Testing

## Testing

The game includes a comprehensive test suite built with Jest and React Testing Library. The tests cover:

- Game initialization and setup
- Player and AI moves
- Win/loss/draw conditions
- Game controls (reset, undo, theme toggle)
- Edge cases and invalid moves

Run the tests with:
```bash
npm test
```

## Features in Detail

- **AI Difficulty Levels**:
  - Easy: Makes random moves
  - Medium: Blocks winning moves
  - Hard: Uses minimax algorithm for optimal play

- **Theme Toggle**: Switch between light and dark themes for comfortable gaming in any lighting condition

- **Responsive Design**: Perfectly playable on any device, from mobile phones to desktop computers

- **Game State**: Automatically saves your progress and preferences

## Contributing

Contributions are welcome! Feel free to open issues and submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Francis Bernard**
- GitHub: [@FrancisBernard34](https://github.com/FrancisBernard34)