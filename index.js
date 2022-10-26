const PORT = 8000
const axios = require('axios')
const cheerio = require('cheerio')
const chalk = require('chalk')
const express = require('express')
const htmlparser = require('htmlparser2')
const csvStream = require('fast-csv');
const fs = require("fs");


let currentDate = new Date().toJSON().slice(0, 10);
const filename = `${currentDate}.csv`
const writableFile = fs.createWriteStream(filename);

let sportiva_data = []
let salewa_data = []
let evolv_data = []
let scarpa_data = []
let madrock_data = []

let pageLimit = 10
let pageCounter = 1
let checkFemale = true

// THE EVOLV METHOD
function scrapeEvolv(url, shoe_type) {

    axios(url).then(response => {
            const html = htmlparser.parseDocument(response.data)
            const $ = cheerio.load(html)
                
            $('div[data-oa-analytics-content]', html).each(function() {
                
                const json_text = $(this).attr('data-oa-analytics-content')
                const raw_data = JSON.parse(json_text)
                const shoes = raw_data['ecommerce']
                
                if (shoes?.impressions) {

                    const shoe_data = shoes.impressions.map(row => ({
                        name: row.name,
                        id: row.id,
                        currency : '€',
                        price: (row.price).toString().replace(',', '.'),
                        brand: 'Evolv',
                        catagory : shoe_type,
                        sex :null,
                    }))

                    evolv_data.push(shoe_data)
                }    
            })

        }).catch(err => console.log(err))

        console.log(chalk.cyan.dim(` completed : Evolv ${shoe_type}`))
   
        if (shoe_type == 'Climbing Shoes' ) {

            scrapeEvolv('https://www.evolvsports.com/int/street-shoes','Approach Shoes')
        }
        return 
}

// -------------------------------------------------------------------------------------------- //

//THE SCARPA METHOD 

function scrapeScarpa(url , shoe_type) {

    axios(url).then(response => {
            const html = htmlparser.parseDocument(response.data)
            const $ = cheerio.load(html)
            
            $('.product_preview_inner script', html).each(function() {

                const raw_data = $(this).text().split(';')
                rinse_data = raw_data[1].replace('enhanced_impressions.push({', '').replace('})', '').replace()
                shoe_data = rinse_data.split(',')

                scarpa_data.push({
                    name :  shoe_data[0].split(':')[1].replaceAll('"', ''),
                    id : shoe_data[1].split(':')[1],
                    currency : '€',
                    price : shoe_data[2].split(':')[1].trim() ,
                    brand : 'Scarpa',
                    catagory: shoe_type,
                    sex :null,
                })
            })

        }).catch(err => console.log(err))

        console.log(chalk.cyan.dim(` completed : Scarpa ${shoe_type}`))
        if (shoe_type == 'Climbing Shoes' ) {

            scrapeScarpa('https://world.scarpa.com/approach-shoe.html', 'Approach Shoes')
        }
    
        return
}

//------------------------------------------------------------------------------------------------//

//THE MADROCK METHOD 

function scrapeMadRock(url) {

    axios(url).then(response => {
            const html = htmlparser.parseDocument(response.data)
            const $ = cheerio.load(html)
     
            $('.product-info', html).each(function() {
                
                madrock_data.push({
                    name :  $(this).find('.black').text(),
                    id : null,
                    currency : '€',
                    price : $(this).find('bdi').text().replaceAll(',', '.').split('€')[1],
                    brand : 'MadRock',
                    catagory: 'Climbing Shoes',
                    sex: null,
                }) 
            })

        }).catch(err => console.log(err))

        console.log(chalk.cyan.dim(` completed : MadRock Climbing Shoes`))
        return
}

//------------------------------------------------------------------------------------------------//

//THE SALEWA METHOD

function scrapeSalewa(url, sex) {

    axios(url).then(response => {

            const html = htmlparser.parseDocument(response.data)
            const $ = cheerio.load(html)

           $('.listing--content', html).each(function() {

                const json_text = $(this).attr('data-oa-analytics-content')
                const raw_data = JSON.parse(json_text)
                const shoes = raw_data['ecommerce']

                    if (shoes?.impressions) {

                        const shoe_data = shoes.impressions.map(row => ({
                            name: row.name,
                            id: row.id,
                            currency : '€',
                            price: (row.price).toString().replace(',', '.'),
                            brand: 'Salewa',
                            catagory : row.category,
                            sex :sex,
                        }))
                        salewa_data.push(shoe_data)
                    }
            })
    }).catch(err => console.log(err))

    console.log(chalk.cyan.dim(` completed : Salewa ${sex}`))
    if (sex == 'Man' ) {

        scrapeSalewa('https://www.salewa.com/women-footwear?p=1','Woman')
    }
    return 
}

//------------------------------------------------------------------------------------------------//


//LA SPORTIVA MEHOD 

function scrapeSportiva(url, sex) {

    axios(url).then(response => {
            const html = htmlparser.parseDocument(response.data)
            const $ = cheerio.load(html)
            var nextPageUrl = ''
            var counter = 0
            
            $('.product-item-info', html).each(function() {

                shoe_catagories  = $(this).find('span').text().split('\n')
                capture_catagory = ''
                counter = 0
                
                while (counter < shoe_catagories.length) {
                    if (/[a-zA-Z]/.test(shoe_catagories[counter])) {
                        if (!shoe_catagories[counter].includes("new")) {
                            capture_catagory = shoe_catagories[counter].trim()
                            counter = shoe_catagories.length
                        }
                    }
                    counter ++
                }
                sportiva_data.push({
                    name :  $(this).find('.product-item-link').text().trim(),
                    id : null,
                    currency : '€',
                    price : $(this).find('.price').text().replace('€',''),
                    brand : 'La Sportiva',
                    catagory: capture_catagory,
                    sex : sex
                })
                
            })

            //checking for multiple pages 
            if ($('.pages-item-next')) {
                nextPageUrl = $('.pages-item-next').find('a').attr('href')
                pageCounter++
            }

            if (pageCounter === pageLimit) {

                if (checkFemale == true) {

                    console.log(chalk.cyan.dim(` Complete Scrape: La Sportiva ${sex}`))
                    pageLimit = 8
                    pageCounter = 1
                    checkFemale = false
                    scrapeSportiva('https://www.lasportiva.com/en/woman/footwear/cst_layer/shoes', 'Woman')
                }
                else {

                    console.log(chalk.cyan.dim(` completed : La Sportiva ${sex}`))
                    const shoes_list = sportiva_data.concat(evolv_data[0],evolv_data[1], scarpa_data,madrock_data, salewa_data[0], salewa_data[1])
                    shoes_csv = convertToCSV(shoes_list)
                    csvStream.write(shoes_list).pipe(writableFile)
                    console.log(chalk.green.bold(` CSV has been successfully generated`))
                    return
                }   
            }
            else {
                // console.log(chalk.cyan(`  Scraping: ${nextPageUrl}`))
                scrapeSportiva(nextPageUrl,sex)
            }

        }).catch(err => console.log(err))
        return
}

//------------------------------------------------------------------------------------------------//


//THE BLACK DIAMOND METHOD

//------------------------------------------------------------------------------------------------//

//GENERATE CSV 
 
function convertToCSV(shoe_data) {

    const objArray = JSON.stringify(shoe_data);
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ','

            line += array[i][index];
        }

        str += line + '\r\n';
    }
    return str;
}
 
//-----------------------------------------------------------------------------------------------//

//MAIN 

function initiateScrape() {

    console.log(chalk.blue.bold(`Scrape sequence initialized ...`))

    console.log(chalk.magenta(`Scraping: Evolv Shoes`))
    scrapeEvolv('https://www.evolvsports.com/int/climbing-shoes', 'Climbing Shoes')

    console.log(chalk.magenta(`Scraping: Scarpa Shoes`))
    scrapeScarpa('https://world.scarpa.com/shop/category/19267839/', 'Climbing Shoes')

    console.log(chalk.magenta(`Scraping: Mad Rock Shoes`))
    scrapeMadRock('https://madrock.eu/product-category/shoes/?number=24')

    console.log(chalk.magenta(`Scraping: La Sportiva Shoes`))
    scrapeSportiva('https://www.lasportiva.com/en/man/footwear/cst_layer/shoes', 'Man')

    console.log(chalk.magenta(`Scraping: Salewa Shoes`))
    scrapeSalewa('https://www.salewa.com/men-mountain-footwear?p=1', 'Man')

    //tenaya doesnt feature any price info because they supply wholesale 
    // scrapeTenaya()

    return true 
}

const app = express()
app.listen(PORT, () => console.log(`server running on port ${PORT} `))
initiateScrape()





