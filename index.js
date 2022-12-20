const PORT = 8000
const axios = require('axios')
const cheerio = require('cheerio')
const chalk = require('chalk')
const express = require('express')
const htmlparser = require('htmlparser2')
const csvStream = require('fast-csv');
const fs = require("fs");

let currentDate = new Date().toJSON().slice(0, 10);
const start = Date.now()
const filename = `${currentDate}.csv`
const writableFile = fs.createWriteStream(filename);

// international stores
let sportivaData = []
let salewaData = []
let evolData = []
let scarpaData = []
let madrockData = []

//local stores 
let adventureInc = []
let mmoData = []
let driftersData = []
let ramData = []
let togData = []


let pageLimit = 10
let pageCounter = 1
let checkFemale = true

// THE EVOLV METHOD
async function scrapeEvolv(url, shoe_type) {

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
                        currency : '€',
                        price: (row.price).toString().replace(',', '.'),
                        brand: 'Evolv',
                        catagory : shoe_type,
                        sex :null,
                        location: 'International',
                        supplier: 'EvolSports',
                    }))

                    evolData.push(shoe_data)
                }    
            })

        }).catch(err => console.log(err))
   
        if (shoe_type == 'Climbing Shoes' ) {

            scrapeEvolv('https://www.evolvsports.com/int/street-shoes','Approach Shoes')
        }
        return 
}

// -------------------------------------------------------------------------------------------- //

//THE SCARPA METHOD 

async function scrapeScarpa(url , shoe_type) {

    axios(url).then(response => {
            const html = htmlparser.parseDocument(response.data)
            const $ = cheerio.load(html)
            
            $('.product_preview_inner script', html).each(function() {

                const raw_data = $(this).text().split(';')
                rinse_data = raw_data[1].replace('enhanced_impressions.push({', '').replace('})', '').replace()
                shoe_data = rinse_data.split(',')
                let sex = 'Unisex'
                let shoeName = shoe_data[0].split(':')[1].replaceAll('"', '').split('-')[0].trim()

                if (/WOMAN|WMN/.test(shoeName) || shoeName.slice(-1) == 'W') {
                    sex = 'Woman'
                }
                else {
                    sex = 'Man'
                }
                scarpaData.push({
                    name :  shoe_data[0].split(':')[1].replaceAll('"', '').split('-')[0].trim(),
                    currency : '€',
                    price : shoe_data[2].split(':')[1].trim() ,
                    brand : 'Scarpa',
                    catagory: shoe_type,
                    sex :sex,
                    location: 'International',
                    supplier: 'Scarpa',
                })
            })

        }).catch(err => console.log(err))

        if (shoe_type == 'Climbing Shoes' ) {

            scrapeScarpa('https://world.scarpa.com/approach-shoe.html', 'Approach Shoes')
        }
    
        return
}

//------------------------------------------------------------------------------------------------//

//THE MADROCK METHOD 

async function scrapeMadRock(url) {

    axios(url).then(response => {
            const html = htmlparser.parseDocument(response.data)
            const $ = cheerio.load(html)
     
            $('.product-info', html).each(function() {
                
                madrockData.push({
                    name :  $(this).find('.black').text(),
                    currency : '€',
                    price : $(this).find('bdi').text().replaceAll(',', '.').split('€')[1],
                    brand : 'MadRock',
                    catagory: 'Climbing Shoes',
                    sex: 'Unisex',
                    location: 'International',
                    supplier: 'Mad Rock',
                }) 
            })

        }).catch(err => console.log(err))
        return
}

//------------------------------------------------------------------------------------------------//

//THE SALEWA METHOD

async function scrapeSalewa(url, sex) {

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
                            currency : '€',
                            price: (row.price).toString().replace(',', '.'),
                            brand: 'Salewa',
                            catagory : row.category,
                            sex :sex,
                            location: 'International',
                            supplier: 'Salewa',
                        }))
                        salewaData.push(shoe_data)
                    }
            })
    }).catch(err => console.log(err))

    if (sex == 'Man' ) {

        scrapeSalewa('https://www.salewa.com/women-footwear?p=1','Woman')
    }
    return 
}

//------------------------------------------------------------------------------------------------//


//LA SPORTIVA METHOD 

async function scrapeSportiva(url, sex) {

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
                sportivaData.push({
                    name :  $(this).find('.product-item-link').text().trim(),
                    currency : '€',
                    price : $(this).find('.price').text().replace('€',''),
                    brand : 'La Sportiva',
                    catagory: capture_catagory,
                    sex : sex,
                    location: 'International',
                    supplier: 'La Sportiva',
                })
                
            })

            //checking for multiple pages 
            if ($('.pages-item-next')) {
                nextPageUrl = $('.pages-item-next').find('a').attr('href')
                pageCounter++
            }

            if (pageCounter === pageLimit) {

                if (checkFemale == true) {
                    pageLimit = 8
                    pageCounter = 1
                    checkFemale = false
                    scrapeSportiva('https://www.lasportiva.com/en/woman/footwear/cst_layer/shoes', 'Woman')
                }
                else {
                    compileData()
                    // const shoes_list = sportivaData.concat(driftersData,mmoData,togData,ramData,adventureInc, evolData[0],evolData[1], scarpaData,madrockData, salewaData[0], salewaData[1])
                    // shoes_csv = convertToCSV(shoes_list)
                    // csvStream.write(shoes_list).pipe(writableFile)
                    // console.log(chalk.green.bold(` CSV has been successfully generated`))
                    // const end = Date.now()
                    // let time = (end - start)/1000
                    // console.log(chalk.blue.bold(`Execution time: ${time} seconds`))
                    // process.kill(process.pid, 'SIGTERM')
                    return
                }   
            }
            else {
                scrapeSportiva(nextPageUrl,sex)
            }

        }).catch(err => console.log(err))
        return
}

//------------------------------------------------------------------------------------------------//

//DRIFTERS METHOD 

async function scrapeDrifters(url, shoe_type, assignedSex) {

    axios(url).then(response => {

            const html = htmlparser.parseDocument(response.data)
            const $ = cheerio.load(html)
           

           $('.product-details', html).each(function() {

                shoeName = $(this).find('.title').text()
                price = $(this).find('.current_price').text()
                let sex = 'Unisex'
                let brand = null
                let shoe_catagory = null
                
                if (!price) {
                    price = 'Sold Out'
                }
                 
                //sex
                if (!assignedSex) {
                    if (/Women's|Woman's|Womens|Woman|Women|Woman|Lady|WMS|Wmn’s|W’s|WMNS/.test(shoeName) || shoeName.slice(-1) == 'W') {
                        sex = 'Woman'
                    }
                    if (/Men's|Men|Man|M’s/.test(shoeName) || shoeName.slice(-1) == 'M') {
                        sex = 'Man'
                    }
                }
                else {
                    sex = assignedSex
                }
          
                // brand
                if (!brand) {
                    if (/BOREAL|Boreal/.test(shoeName)) {
                        brand = 'Boreal'
                    }
                    else if (/SCARPA|Scarpa|Vapor/.test(shoeName)) {
                        brand = 'Scarpa'
                    }
                    else if (/La Sportiva/.test(shoeName)) {
                        brand = 'La Sportiva'
                    }
                    else if (/Black Diamond/.test(shoeName)) {
                        brand = 'Black Diamond'
                    }
                    else if (/Mad Rock/.test(shoeName)) {
                        brand = 'Mad Rock'
                    }
                    else if (/Inov8/.test(shoeName)) {
                        brand = 'Inov8'
                    }
                    else if (/Inov8/.test(shoeName)) {
                        brand = 'Inov8'
                    }
                    else if (/Altra/.test(shoeName)) {
                        brand = 'Altra'
                    }
                    else if (/Jim Green/.test(shoeName)) {
                        brand = 'Jim Green'
                        shoe_catagory= 'Ranger & Work Boots'
                    }
                    else if (/Salomon/.test(shoeName)) {
                        brand = 'Salomon'
                    }
                    else if (/Spenco/.test(shoeName)) {
                        brand = 'Spenco'
                    }
                    else if (/Gumbies/.test(shoeName)) {
                        brand = 'Gumbies'
                        shoe_catagory = 'Flip Flops'
                    }
                    else if (/Salewa/.test(shoeName)) {
                        brand = 'Salewa'
                    }
                    else if (/Sofsole/.test(shoeName)) {
                        brand = 'Sofsole'
                    }
                    else if (/The North Face/.test(shoeName)) {
                        brand = 'The North Face'
                    }
                    else if (/Little Hotties/.test(shoeName)) {
                        brand = 'Little Hotties'
                    }
                    else if (/Zamberlan/.test(shoeName)) {
                        brand = 'Zamberlan'
                    }

                }

                //shoe_type
                if (!shoe_type) {
                    if (/GTX|Hike|Zamberlan|The North Face|Alp Mate|HD|Ordesa/.test(shoeName)){
                        shoe_catagory = 'Hiking Shoes'
                    }
                    else if (/Inov8|Altra|Trail Running|Supercross|Ultra 4|XA Wild|Madcross/.test(shoeName)) {
                        shoe_catagory = 'Trail Running Shoes'
                    }
                    else if (/Approach Shoe|Drom|Approach|Technician Leather|Prime|Circuit|Mission LT|Session/.test(shoeName)) {
                    shoe_catagory = 'Approach Shoes'
                    }
                    
                    else if (/Trango|Mons Evo|Baruntse|G1/.test(shoeName)) {
                        shoe_catagory = 'Alpine & Expedition'
                    }
                    else if (/Sandals/.test(shoeName)) {
                        shoe_catagory = 'Sandals'
                    }
                    else  {
                        shoe_catagory = 'Shoe Accessories'
                    }
                }
                else {
                    shoe_catagory = shoe_type
                }


                driftersData.push({
                    name :  shoeName.replace(/Rock Climbing Shoes|Climbing Shoes|Trail|Running|running|Approach Shoe|Approach Shoes|Boreal|SCARPA|La Sportiva|Black Diamond|Mad Rock|Men's|Women's|Inov8|Altra|Jim Green|Salomon|Spenco|Gumbies|Salewa|Sofsole|The North Face|Little Hotties|Zamberlan|Shoe|Shoes/g,'').trim(),
                    currency : 'ZAR',
                    price : price.replace('R','').replace('from','').replace(',','').trim(),
                    brand : brand,
                    catagory: shoe_catagory,
                    sex : sex,
                    location: 'Local',
                    supplier: 'Drifters',
                })
            })

    }).catch(err => console.log(err))

    if (shoe_type == 'Climbing Shoes' ) {
        scrapeDrifters('https://www.driftersshop.co.za/collections/mens-footwear',null, 'Man')
    }
    else if (assignedSex == 'Man') {
        scrapeDrifters('https://www.driftersshop.co.za/collections/womens-footwear',null,'Woman')
    }

    
    return 
}

//------------------------------------------------------------------------------------------------//

//TRAVERSEGEAR (TOG) METHOD

async function scrapeTOG(url) {

    axios(url).then(response => {

            const html = htmlparser.parseDocument(response.data)
            const $ = cheerio.load(html)
           

           $('.woocommerce-LoopProduct-link', html).each(function() {

                let shoeName = $(this).find('.woocommerce-loop-product__title').text().replace(/Climbing Shoes|Climb Shoes|Approach Shoes/, '').replace('Shoes','')
                let price = $(this).find('bdi').text().replace(',', '').replace('R','')
                let sex = 'Unisex'
                let brand = null
                let shoe_type = null
                          
                //sex
                if (/Women's|Woman's|Womens|Woman|Women|Woman|Lady|WMS|Wmn’s|W’s|WMNS/.test(shoeName) || shoeName.slice(-1) == 'W') {
                    sex = 'Woman'
                }
                if (/Men's|Men|Man|M’s/.test(shoeName) || shoeName.slice(-1) == 'M') {
                    sex = 'Man'
                }

                //brand
                if (!brand) {
                    if (/BOREAL|Boreal/.test(shoeName)) {
                        brand = 'Boreal'
                    }
                    else if (/SCARPA|Scarpa|Vapor/.test(shoeName)) {
                        brand = 'Scarpa'
                    }
                }

                //shoe_type
                if (!shoe_type) {
                    if (/Golden|Spin|Ribelle/.test(shoeName)) {
                        shoe_type = 'Running Shoes'
                    }
                    else if (/Mojito/.test(shoeName)) {
                        shoe_type = ['Mountain & Casual']
                    }
                    else if (/Gecko|Approach Shoe|Mescalito|MESCALITO/.test(shoeName)) {
                        shoe_type = 'Approach Shoes'
                    }
                    else if (/GTX|Ribelle HD|HD|Drom|Ordesa|ZANSKAR|G1/.test(shoeName)){
                        shoe_type = 'Hiking Shoes'
                    }
                    else if (/LACES|FOOTBED|Laces|Footbed/.test(shoeName)) {
                        shoe_type = ' Shoe Accessories'
                    }
                    else {
                        shoe_type = 'Climbing Shoes'
                    }
                }


                togData.push({
                    name :  shoeName,
                    currency : 'ZAR',
                    price : price,
                    brand : brand,
                    catagory: shoe_type,
                    sex : sex,
                    location: 'Local',
                    supplier: 'TraverseGear',
                })
                brand = null
                shoe_type = null
            })

    }).catch(err => console.log(err))

    return 
}

//------------------------------------------------------------------------------------------------//

//RAM METHOD

async function scrapeRam(url, shoe_type) {

    axios(url).then(response => {

            const html = htmlparser.parseDocument(response.data)
            const $ = cheerio.load(html)
           

           $('.woocommerce-LoopProduct-link', html).each(function() {

                let shoeName = $(this).find('.woocommerce-loop-product__title').text().replace(/Climbing Shoes|Climb Shoes|Approach Shoes/, '').replace('Shoes','')
                let price = $(this).find('bdi').text().replace(',', '').replace('R','')
                let sex = 'Unisex'
                          
                //sex
                if (/Women's|Woman's|Womens|Woman|Women|Woman|Lady|WMS|Wmn’s|W’s/.test(shoeName)) {
                    sex = 'Woman'
                }
                if (/Men's|Men|Man|M’s/.test(shoeName)) {
                    sex = 'Man'
                }

                ramData.push({
                    name :  shoeName,
                    currency : 'ZAR',
                    price : price,
                    brand : 'Black Diamond',
                    catagory: shoe_type,
                    sex : sex,
                    location: 'Local',
                    supplier: 'RAM',
                })
            })

    }).catch(err => console.log(err))

    if (shoe_type == 'Climbing Shoes' ) {
        scrapeRam('https://blackdiamondequipment.co.za/product-category/approach-shoes/', 'Approach Shoes' )
    }
    else if (shoe_type == 'Approach Shoes') {
        scrapeRam('https://blackdiamondequipment.co.za/product-category/performance-footwear-m-w/street-shoes/','Street Shoes')
    }
    
    return 
}

//------------------------------------------------------------------------------------------------//

//MMO METHOD

async function scrapeMMO(url, shoe_type) {

    axios(url).then(response => {

            const html = htmlparser.parseDocument(response.data)
            const $ = cheerio.load(html)
           

           $('.product', html).each(function() {

                let brand = $(this).find('.brand').text().replace('\n', '')
                let shoeName = $(this).find('.card-title').text().replace(brand, '').replace('-', ' ').trim()
                let price = $(this).find('.price--withoutTax').text().replace('R', '').replace(',','')
                let sex = 'Unisex'

                if (shoeName === "") {
                    return
                }
                //shoe type
                if (!shoe_type) {
                    if (/Approach Shoe/.test(shoeName)) {
                        shoe_type = 'Approach Shoes'
                    }
                    else if (/Hiking|GTX|Boreal/.test(shoeName)) {
                        shoe_type = 'Hiking Shoes'
                    }
                    else {
                        shoe_type = 'Mountain'
                    }
                }
                
                //sex
                if (/Women's|Woman's|Womens|Woman|Women|Woman|Boreal|Lady|WMS|W’s/.test(shoeName)) {
                    sex = 'Woman'
                }
                if (/Men's|Men|Man/.test(shoeName)) {
                    sex = 'Man'
                }

                mmoData.push({
                    name :  shoeName.replace('Approach Shoe ', ''),
                    currency : 'ZAR',
                    price : price,
                    brand : brand,
                    catagory: shoe_type,
                    sex : sex,
                    location: 'Local',
                    supplier: 'MMO',
                })
                if (shoe_type != 'Climbing Shoes' || shoe_type != 'Alpine & Expedition')   {
                    shoe_type = null
                }
            })

    }).catch(err => console.log(err))

    if (shoe_type == 'Climbing Shoes' ) {
        scrapeMMO('https://www.mountainmailorder.co.za/footwear/alpine-and-expedition/', 'Alpine & Expedition' )
    }
    else if (shoe_type == 'Alpine & Expedition') {
        scrapeMMO('https://www.mountainmailorder.co.za/footwear/hiking-and-approach/',null)
    }
    
    return 
}

//------------------------------------------------------------------------------------------------//

//ADVENTURE INC 

async function scrapeAdventureInc(url, shoe_type) {

    axios(url).then(response => {

            const html = htmlparser.parseDocument(response.data)
            const $ = cheerio.load(html)
            let sex

           $('.woo-entry-inner', html).each(function() {

                const scrappyText = $(this).text().split('\n')

                // if (/Women's|Woman's|Womens|Woman|Women|Woman|Lady|WMS/.test(scrappyText[4])) {
                //     sex = 'Woman'
                // }
                sex = getSex(scrappyText[4])
               
                adventureInc.push({
                    name :  scrappyText[4].substring(21).replace('Running ', ''),
                    currency : 'ZAR',
                    price : scrappyText[5].replace('\tR', '').replace(',', ''),
                    brand : 'La Sportiva',
                    catagory: shoe_type,
                    sex : sex,
                    location: 'Local',
                    supplier: 'Adventure Inc',
                })
            })

    }).catch(err => console.log(err))
 
    if (shoe_type == 'Climbing Shoes' ) {
        scrapeAdventureInc('https://www.adventureinc.co.za/product-category/la-sportiva/approach-footwear-la-sportiva/?products-per-page=all','Approach Shoes')
    }
    if (shoe_type == 'Approach Shoes' ) {
        scrapeAdventureInc('https://www.adventureinc.co.za/product-category/la-sportiva/mountain-running-footwear/?products-per-page=all','Mountain Running')
    }
    return 
}

//------------------------------------------------------------------------------------------------//

async function getSex(shoeName) {

    let sex = 'Unisex'

    if (/Women's|Woman's|Womens|Woman|Women|Woman|Lady|WMS|Wmn’s|W’s|WMNS/.test(shoeName) || shoeName.slice(-1) == 'W') {
        sex = 'Woman'
    }
    if (/Men's|Men|Man|M’s/.test(shoeName) || shoeName.slice(-1) == 'M') {
        sex = 'Man'
    }
    return sex

}


//------------------------------------------------------------------------------------------------//

// COMPILE DATA

function compileData() {

    const shoes_list = sportivaData.concat(driftersData,mmoData,togData,ramData,adventureInc, evolData[0],evolData[1], scarpaData,madrockData, salewaData[0], salewaData[1])
    shoes_csv = convertToCSV(shoes_list)
    csvStream.write(shoes_list).pipe(writableFile)
    console.log(chalk.green.bold(` CSV has been successfully generated`))
    const end = Date.now()
    let time = (end - start)/1000
    console.log(chalk.blue.bold(`Execution time: ${time} seconds`))

}
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

async function initiateScrape() {


    console.log(chalk.blue.bold(`Scrape sequence initialized ...`))


    //scraping local domains
    console.log(chalk.green.bold(`Scraping Local Domains`))

    console.log(chalk.magenta(`Scraping: Adventure Inc Shoes`))
    await scrapeAdventureInc('https://www.adventureinc.co.za/product-category/la-sportiva/climbing-footwear/?products-per-page=all','Climbing Shoes')

    console.log(chalk.magenta(`Scraping: MMO Shoes`))
    await scrapeMMO('https://www.mountainmailorder.co.za/footwear/climbing-shoes/','Climbing Shoes')

    console.log(chalk.magenta(`Scraping: RAM Shoes`))
    await scrapeRam('https://blackdiamondequipment.co.za/product-category/rock/climbing-shoes/','Climbing Shoes')

    console.log(chalk.magenta(`Scraping: TraverseGear Shoes`))
    await scrapeTOG('https://traversegear.co.za/product-category/footwear/')

    console.log(chalk.magenta(`Scraping: Drifters Shoes`))
    await scrapeDrifters('https://www.driftersshop.co.za/collections/climbing-footwear','Climbing Shoes',null)


    // scraping international domains 
    console.log(chalk.green.bold(`Scraping International Domains`))

    console.log(chalk.magenta(`Scraping: Evolv Shoes`))
    await scrapeEvolv('https://www.evolvsports.com/int/climbing-shoes', 'Climbing Shoes')

    console.log(chalk.magenta(`Scraping: Scarpa Shoes`))
    await scrapeScarpa('https://world.scarpa.com/shop/category/19267839/', 'Climbing Shoes')

    console.log(chalk.magenta(`Scraping: Mad Rock Shoes`))
    await scrapeMadRock('https://madrock.eu/product-category/shoes/?number=24')

    console.log(chalk.magenta(`Scraping: La Sportiva Shoes`))
    await scrapeSportiva('https://www.lasportiva.com/en/man/footwear/cst_layer/shoes', 'Man')

    console.log(chalk.magenta(`Scraping: Salewa Shoes`))
    await scrapeSalewa('https://www.salewa.com/men-mountain-footwear?p=1', 'Man')

    return
}
  

const app = express()
var server = app.listen(PORT, async function () {
    console.log(`server running on port ${PORT} `)
    await initiateScrape()
})







