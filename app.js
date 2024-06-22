const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors"); // Import the cors package
const indexRouter = require("./routes/indexRouter");
const app = express();
const mongoURI = `mongodb://localhost:27017/aloneshoppingmall`;

// Use CORS middleware
app.use(cors());

app.use(bodyParser.json());
app.use("/api", indexRouter);

async function connectToDatabase() {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Mongoose connected");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

connectToDatabase();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
