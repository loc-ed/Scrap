// import initiateScrape from './shoeScrape.js'
// import initiateHardwareScrape from './hardwareScrape.js'

// const { response } = require("express")

// const PORT = 8000
// import express from 'express'
// const express = require('express')
// import chalk from 'chalk'

// const chalk = require('chalk')
// const parseDocument = require('htmlparser2')
// const write = require('fast-csv')
// const createWriteStream = require('fs')

// import  axios  from 'axios';
// import { response } from 'express';
// import { load } from 'cheerio';
// import chalk from 'chalk';
// import { parseDocument } from 'htmlparser2';
// import { write } from 'fast-csv';
// import { createWriteStream } from "fs";

// let currentDate = new Date().toJSON().slice(0, 10);
// const start = Date.now()
// const filename = `Hardware(${currentDate}).csv`
// const writableFile = createWriteStream(filename);

const HEADER = [{
    name : 'Product',
    currency : 'Currency',
    price : 'Price',
    brand : 'Brand',
    catagory : 'Catagory',
    sex : 'Gender',
    location : 'Location',
    supplier : 'Supplier',
}]


const button = document.querySelector('.glowing-btn');

    button.addEventListener('click', async () => {

        var hardwareFormatted = []
        var shoesFormatted = []
        const shoeResponse = await fetch('/.netlify/functions/shoeScrapeLocal')
                        .then(response => response.json()
        )
        const hardwareResponse = await fetch('/.netlify/functions/hardwareScrapeLocal')
                        .then(response => response.json()
        )

        const shoeArray = shoeResponse.content
        const hardwareArray = hardwareResponse.content

        console.log('testing the button with single scrape ')
        // responseText.innerText = JSON.stringify(response)
        // console.log(shoeResponse)
        // console.log(hardwareResponse)
        // console.log(hardwareArray[0])

        hardwareArray.forEach((item) => {
            hardwareFormatted.push({
                name : item.name,
                currency : item.currency,
                price : item.price,
                brand : item.brand,
                catagory : item.catagory,
                sex : item.sex,
                location : item.location,
                supplier : item.supplier,
            })
        })

        shoeArray.forEach((item) => {
            shoesFormatted.push({
                name : item.name,
                currency : item.currency,
                price : item.price,
                brand : item.brand,
                catagory : item.catagory,
                sex : item.sex,
                location : item.location,
                supplier : item.supplier,
            })
        })
    })


//------------------------------------------------------------------------------------------------//

// COMPILE DATA

// async function compileShoeData() {

//     shoeList = HEADER.concat(sportivaData,driftersData,mmoData,togData,ramData,adventureInc, evolData[0],evolData[1], scarpaData,madrockData, salewaData[0], salewaData[1])
//     // shoeList = HEADER.concat(evolData[0],evolData[1])
//     // console.log(shoeList)
//     // shoeCSV = convertToCSV(shoeList)
//     // write(shoeList).pipe(writableFile)
//     // console.log(chalk.green.bold(` Shoe CSV has been successfully generated`))
//     // const end = Date.now()
//     // let time = (end - start)/1000
//     // console.log(chalk.blue.bold(`Execution time: ${time} seconds`))

//     return
// }
//------------------------------------------------------------------------------------------------//

//GENERATE CSV 
 
// function convertToCSV(shoeData) {

//     const objArray = JSON.stringify(shoeData);
//     var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
//     var str = '';

//     for (var i = 0; i < array.length; i++) {
//         var line = '';
//         for (var index in array[i]) {
//             if (line != '') line += ','

//             line += array[i][index];
//         }

//         str += line + '\r\n';
//     }
//     return str;
// }


 // COMPILE DATA

// function compileData() {

//     const hardwareList = HEADER.concat(mmoData,driftersData,ramData)
//     write(hardwareList).pipe(writableFile)
//     console.log(green.bold(`Hardware CSV has been successfully generated`))
//     const end = Date.now()
//     let time = (end - start)/1000
//     console.log(blue.bold(`Execution time: ${time} seconds`))

// }

