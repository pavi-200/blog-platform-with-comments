# Blog Platform with Comments

A complete full-stack blog platform built with Node.js, Express.js, MongoDB, HTML5, CSS3, and vanilla JavaScript.

## Features

- Secure registration and login
- JWT-based authentication
- Create, edit, delete, and view blog posts
- Search posts by title/content
- Add and delete comments
- Responsive dashboard and frontend UI
- Image upload support for posts
- Toast notifications and modern styling

## Project Structure

- backend/: Express API, Mongoose models, routes, controllers, middleware
- frontend/: Static HTML, CSS, and JavaScript files

## Setup Instructions

1. Install Node.js and MongoDB locally.
2. Start MongoDB on your machine.
3. Open a terminal in the backend folder and install dependencies:
   ```bash
   npm install
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
5. Open the frontend in your browser by visiting http://localhost:5000/.

## Environment Variables

Create a .env file inside the backend folder with the following values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/blog-platform
JWT_SECRET=supersecretblogjwtkey
```

## API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login

### Posts
- GET /api/posts
- GET /api/posts/:id
- POST /api/posts
- PUT /api/posts/:id
- DELETE /api/posts/:id

### Comments
- GET /api/comments/:postId
- POST /api/comments
- DELETE /api/comments/:id

## Notes

- The app uses a local MongoDB instance for persistence.
- Uploads are stored in backend/uploads.
- The frontend is served by the Express backend for a simple deployment workflow.
