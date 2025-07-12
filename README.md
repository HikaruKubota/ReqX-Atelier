# ReqX-Atelier

A modern API development and testing tool built with Electron, React, and TypeScript. Similar to Postman or Insomnia, but with a focus on simplicity and efficiency.

## Features

- **API Request Management**: Create, save, and organize HTTP requests
- **Collections & Folders**: Organize requests in a hierarchical structure
- **Environment Variables**: Manage variables across different environments
- **Response Viewer**: View formatted JSON, headers, and status information
- **Tab Interface**: Work with multiple requests simultaneously
- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **Import/Export**: Share collections with team members
- **Variable Extraction**: Extract values from responses for use in subsequent requests

## Requirements

- Node.js 22.16.0 (see `.node-version`)
- npm or yarn

## Installation

```bash
# Clone the repository
git clone https://github.com/HikaruKubota/ReqX-Atelier.git
cd ReqX-Atelier

# Install dependencies
npm install
```

## Running the Application

### Development Mode

```bash
# Run the Electron app with hot reload
npm run dev

# Run Electron + Storybook simultaneously
npm run dev:all
```

### Building for Production

```bash
# Build the application for distribution
npm run build

# This will:
# 1. Build the React app (npm run build:renderer)
# 2. Package the Electron app (npm run build:electron)
# The packaged application will be in the dist/ directory
```

### Creating Executable App

After building, you'll find the executable application in the `dist/` directory:

- **macOS**: `ReqX-Atelier.app` in `dist/mac/`
- **Windows**: `ReqX-Atelier.exe` in `dist/win-unpacked/`
- **Linux**: `ReqX-Atelier` AppImage in `dist/`

To distribute the app:

1. Run `npm run build`
2. Navigate to the `dist/` directory
3. Find the appropriate file for your platform
4. The app is ready to be distributed or installed

## Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Run type checking
npm run typecheck
```

## Development

### Project Structure

```
ReqX-Atelier/
├── main.js              # Electron main process
├── src/
│   └── renderer/        # React application
│       └── src/
│           ├── components/   # UI components (Atomic Design)
│           ├── hooks/        # Custom React hooks
│           ├── store/        # Zustand state management
│           ├── types/        # TypeScript type definitions
│           └── utils/        # Utility functions
└── _docs/               # Documentation
```

### Technology Stack

- **Frontend**: React 18.3 + TypeScript
- **Desktop**: Electron 36.x
- **Build Tool**: Vite 6.0
- **State Management**: Zustand 5.0
- **Styling**: Tailwind CSS + Headless UI
- **Testing**: Vitest + React Testing Library

### Component Architecture

The project follows the Atomic Design methodology:

- **Atoms**: Basic UI elements (buttons, inputs, etc.)
- **Molecules**: Composite components
- **Organisms**: Complex features
- **Templates/Pages**: Full application views

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure to:

- Run tests before submitting PR
- Follow the existing code style
- Update documentation as needed

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Postman and Insomnia
- Built with Electron and React
- Icons from Heroicons

## Support

If you encounter any issues or have questions, please:

1. Check the [documentation](./_docs)
2. Search existing [issues](https://github.com/HikaruKubota/ReqX-Atelier/issues)
3. Create a new issue if needed

---

Made by the ReqX-Atelier team
