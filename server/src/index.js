import express from 'express';

const app = express();
const port = 8000;

app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).send('Hello from the server');
});

app.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`Server listening at ${url}`);
});
