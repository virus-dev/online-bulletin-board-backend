const express = require('express');

const app = express();

app.get('/', (req, res) => res.json({ message: 'Hi' }));

app.listen(process.env.PORT || 5000, () => console.log('Start server'))