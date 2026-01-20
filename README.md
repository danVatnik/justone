# Express + React Full-Stack Application

A full-stack web application with a Node.js Express backend and React frontend.

## Project Structure

```
just-one/
├── server/          # Express backend
│   ├── index.js
│   ├── package.json
│   └── .gitignore
├── client/          # React frontend
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── .gitignore
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Backend Dependencies

```bash
cd server
npm install
```

### 2. Install Frontend Dependencies

```bash
cd ../client
npm install
```

## Development

### Start the Backend Server

```bash
cd server
npm run dev
```

The backend will run on `http://localhost:5000`

### Start the React Frontend

In a new terminal:

```bash
cd client
npm start
```

The frontend will run on `http://localhost:3000` and will automatically proxy API requests to the backend.

## Building for Production

### Build the React Frontend

```bash
cd client
npm run build
```

### Run Production Server

```bash
cd server
npm start
```

The Express server will serve the built React app at `http://localhost:5000`

## API Endpoints

- `GET /api/hello` - Returns a greeting message
- `GET /api/data` - Returns sample data

## Features

- Express backend with CORS enabled
- React frontend with hooks
- Hot reload development environment
- Production build with static file serving
