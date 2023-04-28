import initiateScrape from './shoeScrape.js'
import initiateHardwareScrape from './hardwareScrape.js'

const PORT = 8000
// import express from 'express'
const express = require('express')
// import chalk from 'chalk'

const button = document.querySelector('.glowing-btn');

function initiateSequence() {

    console.log('initiate sequence mode')
    alert('The button has been clicked!');
    // initiateScrape()
    // initiateHardwareScrape()
    // const app = express()
    // var server = app.listen(PORT, async function () {
    //     console.log(`server running on port ${PORT} `)
    //     initiateScrape()
    //     initiateHardwareScrape()
    // })
}

function alertMe(){
      console.log('clicked ')
      alert('The button has been clicked!');
    }
    
    button.addEventListener('click', initiateSequence)
    // button.addEventListener('click', alertMe);

// button.addEventListener('click', function() {
//     console.log('test')
//     initiateSequence()
// })


const app = express()
var server = app.listen(PORT, async function () {
    console.log(`server running on port ${PORT} `)
//     initiateScrape()
//     initiateHardwareScrape()
})

// button.addEventListener("click", initiateSequence())





