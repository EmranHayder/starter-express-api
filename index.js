const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const { Parser } = require("json2csv");

const app = express();
const port = 3000;

// Middleware to parse incoming POST request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Serve HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Handle POST request
app.post('/submit', async(req, res) => {
    const userInput = req.body.userInput;
    console.log(userInput);
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto(userInput);

    const grabParagraph = await page.evaluate(() => {
        const allBoxes = document.querySelectorAll(".class-37RyWMg");
        const date = document.querySelector(".class-JhqjZgj div div div button span");
        let gameBoxArr = [];
        allBoxes.forEach((item) => {
            const sportsInfo = item.querySelector(".class-Medfj11 a ul");
            const getList = sportsInfo.querySelector(".class-xuy-sj0");
            const getSpan = getList.querySelector(".class-JBRBGd-");
            const teamOneName = getSpan.querySelector(".class-jer7RpM");

            const sportsInfoSpread = item.querySelector(".class-Medfj11");
            const sportsInfoSpreadOne = sportsInfoSpread.querySelector(".class-HQMRLi6");
            const sportsInfoSpreadTwo = sportsInfoSpreadOne.querySelector(".class-Pd3IDQ4");
            const sportsInfoSpreadThree = sportsInfoSpreadTwo.querySelector(".class-QA1t2Tt table tbody tr td span b");
            const trElement = sportsInfoSpreadThree.closest('tr');
            const secondTdElement = trElement.querySelector('td:nth-child(3)');
            const moneyLineValue = secondTdElement.querySelector('span b');

            gameBoxArr.push({
                'Date': date.innerText,
                'TeamA': teamOneName.innerText,
                'Spread': sportsInfoSpreadThree.innerHTML.toString(),
                'MoneyLine': moneyLineValue.innerHTML.toString(),
            });
        })
        return gameBoxArr;
    });

    const json2csvParser = new Parser({
        fields: [{
                label: "Date",
                value: 'Date'

            },
            {
                label: "Team A",
                value: 'TeamA'
            },
            {
                label: "Spread",
                value: 'Spread'

            },
            {
                label: "Money Line",
                value: 'MoneyLine'
            }
        ]
    });

    const parsedData = json2csvParser.parse(grabParagraph);
    await browser.close();
    res.setHeader('Content-disposition', 'attachment; filename=timelinehistory.csv');
    res.set('Content-Type', 'text/csv');
    res.send(parsedData);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});