let currentDate = new Date().toJSON().slice(0, 10);
const shoeFilename = `ShoeData(${currentDate}).csv`
const hardwareFilename = `HardwareData(${currentDate}).csv`

const HEADER = {
    name : 'Product',
    currency : 'Currency',
    price : 'Price',
    brand : 'Brand',
    catagory : 'Catagory',
    sex : 'Gender',
    location : 'Location',
    supplier : 'Supplier',
}

function convertToCSV(objArray) {

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

function exportCSVFile(headers, items, fileTitle) {
    
    if (headers) {
        items.unshift(headers)
    }

    var jsonObject = JSON.stringify(items)
    var csv = convertToCSV(jsonObject)

    var blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'})
    if (window.navigator && window.navigator.msSaveBlob) { // for IE
        window.navigator.msSaveBlob(blob, fileTitle)
    }
    else {
        var link = document.createElement("a")
        if (link.download !== undefined) {
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob)
            link.setAttribute("href", url)
            link.setAttribute("download", fileTitle)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }
}

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

        exportCSVFile(HEADER,shoesFormatted,shoeFilename)
        exportCSVFile(HEADER,hardwareFormatted,hardwareFilename)
    })

