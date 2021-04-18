const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const dotenv = require('dotenv').config()
const log4js = require("log4js");
const uuid = require('uuid')

const logger = log4js.getLogger();

// Reading env vars
let LOGGING_LEVEL = process.env.LOGGING_LEVEL.toString().toUpperCase()
// console.log(LOGGING_LEVEL)
const PORT = process.env.PORT || 3000
const envCors = process.env.ENABLE_CORS.toUpperCase()


LOGGING_LEVEL = LOGGING_LEVEL
if(LOGGING_LEVEL == 'DEBUG') {
    logger.level = "debug"
} else if(LOGGING_LEVEL == 'WARN') {
    logger.level = "warn"
} else {
    logger.level = "info"
}

logger.debug("Starting application");
const app = express()

enableCors = envCors == "TRUE" || envCors == "YES" || envCors == "ENABLED"

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

if(enableCors) {
	app.use(cors())
    logger.debug('Using CORS')
}

var data = {
    items : []
}
var items = data.items
var autoIncrementId = 1001

app.get('/', (req,res) => {
    logger.info('GET request at /')
    res.json({
        status: 'up'
    })
})

app.get('/items', (req, res) => {
    logger.info('GET request at /items')
    res.json({ items })
})

app.post('/items', (req, res) => {
    logger.info('POST request at /items')
    var item = req.body
    if(!item.name || !item.description || !item.price) {
        logger.warn(`missing one or more inputs or attribute spelling mistake`)
        return res.json({
            status : false,
            message : "missing one or more inputs or attribute spelling mistake. Please verify if you provided name, description & price"
        })
    }
    // item.id = autoIncrementId
    item.id = uuid.v1().substring(0,8)
    autoIncrementId += 1
    data.items.push(item)
    logger.debug(`Item created with id ${item.id}`)
    res.json({ items })
})

app.get('/items/:id', (req, res) => {
    logger.info(`GET request at /item/${req.params.id}`)
    var itemId = req.params.id
    let index = -1
    for(ind in items) {
        if(items[ind].id == itemId) {
            index = ind;
            break
        }
    }

    if(index == -1) {
        logger.warn(`item with id ${itemId} doesn't exist`)
        return res.json({
            found: false,
            message: `item with id ${itemId} doesn't exist`
        })
    }

    return res.json({
        found: true,
        item : items[index]
    });

    
})

app.delete('/items/:id', (req, res) => {
    var itemId = req.params.id
    logger.warn(`DELETE request on /items/${itemId}`)  
    logger.debug(`Attempting to delete item with id ${itemId}`)    

    var index = -1;
    var items = data.items

    for(ind in items) {
        if(items[ind].id == itemId) {
            index = ind;
            break
        }
    }

    if(index == -1) {
        logger.error(`Delete Failed - Item with id ${itemId} doesn't exist`)
        return res.json({
            found: false,
            message: `item with id ${itemId} doesn't exist`
        })
    }

       
    var item = data.items.splice(index, 1)
    logger.debug(`Successfully deleted item with id ${itemId}`) 
    return res.json({
        found: true,
        item : item
    })
})

app.put('/items/:id', (req, res) => {
    logger.info(`PUT request on /items/${itemId}`) 
    var itemId = req.params.id
    var newName = req.body.name
    var newDesc = req.body.description
    var newPrice = req.body.price

    logger.debug(`Attempting to modify item with id ${itemId}`) 

    for(ind in items) {
        if(items[ind].id == itemId) {
            index = ind;
            var item = items[ind]
            if(newName) item.name = newName
            if(newDesc) item.description = newDesc
            if(newPrice) item.price = newPrice

            return res.json({
                found : true,
                updatedItem : items[ind]
            })
        }
    }
    return res.json({
        found: false,
        message: `item with id ${itemId} doesn't exist`
    })
})


app.all('*', (req, res) => {
    logger.warn(`Incorrect request - Path ${req.url} is invalid`)

    res.json({
        status: 'up',
        message: `Incorrect request - Path ${req.url} is invalid`
    })
})


logger.debug(`Using PORT ${PORT}`);
app.listen(PORT, () => logger.info(`Listening at ${PORT}`))