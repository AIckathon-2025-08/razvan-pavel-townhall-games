# Townhall Games

A simple web application for hosting and playing games during townhall meetings. This project serves static HTML pages using Node.js and Express.

## Pages

- **index.html**: Main landing page for users to view and participate in games.
  ![Vote Page](./images/vote.png)
- **admin.html**: Admin interface for managing games and settings.
  ![Admin Page](./images/admin.png)

## Running Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the server:**
   ```bash
   node server.js
   ```
3. **Access the app:**
   - User page: [http://localhost:1992](http://localhost:1992)
   - Admin page: [http://localhost:1992/admin](http://localhost:1992/admin)

## Running in Production

### Using Docker Compose

1. **Start services:**
   ```bash
   docker-compose up --build
   ```
   - The app will be available at [http://localhost:1992](http://localhost:1992)

## Details

- **Express** serves static files from the project directory.
- No database or backend logic is included; all content is static HTML.
- Designed for easy deployment and local development.

---

Feel free to customize the HTML pages for your specific games or meeting needs.
