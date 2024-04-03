const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const windowSize = 10;
let storedNumbers = [];

app.get('/numbers/:numberid', async (req, res) => {
    const numberId = req.params.numberid;
    let response = {};

    try {
        const numbers = await fetchNumbers(numberId);
        updateStoredNumbers(numbers);
        const average = calculateAverage();

        response.windowPrevState = storedNumbers.slice(0, storedNumbers.length - numbers.length);
        response.windowCurrState = storedNumbers.slice(-windowSize);
        response.numbers = numbers;
        response.avg = average;

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

async function fetchNumbers(numberId) {
    const response = await axios.get(`http://thirdpartyserver.com/${numberId}`);
    return response.data.filter((number, index, self) => self.indexOf(number) === index);
}

function updateStoredNumbers(newNumbers) {
    storedNumbers = [...storedNumbers, ...newNumbers].slice(-windowSize);
}

function calculateAverage() {
    if (storedNumbers.length === 0) return 0;
    const sum = storedNumbers.reduce((acc, num) => acc + num, 0);
    return (sum / Math.min(storedNumbers.length, windowSize)).toFixed(2);
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
