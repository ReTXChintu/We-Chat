const express = require("express");
const path = require("path");
const app = express();

// Serve static files from the build folder
app.use(express.static(path.join(__dirname, "build")));

// Define a route that serves index.html for any path
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
