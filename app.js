const fetch = require('node-fetch')
const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3000
const compression = require('compression')
const helmet = require('helmet')

app.use(cors())
app.use(compression())
app.use(helmet())

app.get('/', function(req, res) {
	res.send('api reached')
})

app.get('/getChampions', async function(req, res) {
    let response = await fetch('http://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/champions.json')
    let data = await response.json()
    let champions = []
    for(var key in data) {
        champions.push(key)
    }
    res.send(champions)
})

app.get('/getItems', async function(req, res) {
    let response = await fetch('https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/items.json')
    let data = await response.json()
    let items = []
    for(var key in data) {
        items.push(data[key]['name'], data[key]['id'], data[key]['shop']['prices']['total'])
    }
    res.send(items)
})

app.get('/getChampStat', async function(req, res) {
    let championName = req.query.champ
    let response = await fetch(`http://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/champions/${championName}.json`)
    let data = await response.json()
    championInfo = {
                'hp':{}, 'hpRegen':{}, 'mana':{},
                'manaRegen':{}, 'armor':{}, 'magicResist':{},
                'ad':{}, 'ms':{}, 'crit':{}, 'as':{},
                }

    championInfo.name = data['name']
    championInfo.hp['flat'] = data['stats']['health']['flat']
    championInfo.hp['perL'] = data['stats']['health']['perLevel']
    championInfo.hpRegen['flat'] = data['stats']['healthRegen']['flat']
    championInfo.hpRegen['perL'] = data['stats']['healthRegen']['perLevel']
    championInfo.mana['flat'] = data['stats']['mana']['flat']
    championInfo.mana['perL'] = data['stats']['mana']['perLevel']
    championInfo.manaRegen['flat'] = data['stats']['manaRegen']['flat']
    championInfo.manaRegen['perL'] = data['stats']['manaRegen']['perLevel']
    championInfo.armor['flat'] = data['stats']['armor']['flat']
    championInfo.armor['perL'] = data['stats']['armor']['perLevel']
    championInfo.magicResist['flat'] = data['stats']['magicResistance']['flat']
    championInfo.magicResist['perL'] = data['stats']['magicResistance']['perLevel']
    championInfo.ad['flat'] = data['stats']['attackDamage']['flat']
    championInfo.ad['perL'] = data['stats']['attackDamage']['perLevel']
    championInfo.ms['flat'] = data['stats']['movespeed']['flat']
    championInfo.as['flat'] = data['stats']['attackSpeed']['flat']
    championInfo.as['perL'] = data['stats']['attackSpeed']['perLevel']
    championInfo.crit['flat'] = 175
    
    switch(data['name']) {
        case 'Jhin':
            championInfo.critMod = 0.86
            break;
        case 'Senna':
            championInfo.critMod = 0.915
            break;
        case 'Yasuo':
            championInfo.critMod = 0.9
            break;
        case 'Yone':
            championInfo.critMod = 0.9
            break;
        default:
            championInfo.critMod = 1
    }

    res.send(championInfo)
})

app.get('/getItemInfo', async function(req, res) {
    let id = req.query.item
    let response = await fetch('https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/items.json')
    let data = await response.json()
    
    itemInfo = {'abilityPower':{}, 'armor':{}, 'armorPenetration':{}, 'attackDamage':{}, 'attackSpeed': {},
                'criticalStrikeChance':{}, 'goldPer_10':{}, 'healAndShieldPower':{},
                'health':{}, 'healthRegen':{}, 'lethality':{}, 'lifesteal':{}, 'magicPenetration':{}, 'magicResistance':{},
                'mana':{}, 'manaRegen':{}, 'movespeed':{}, 'abilityHaste':{}, 'omnivamp':{}, 'tenacity':{}}

    for(let k in data[id]['stats']) {
        for(let i in data[id]['stats'][k]) {
            if(data[id]['stats'][k][i] != 0) {
                if(k.includes('_') && k != 'goldPer_10') {
                    let y = k.split('_')
                    let v = ''
                    for(let z = 1; z<y.length; z++) {
                        v += y[z].charAt(0).toUpperCase() + y[z].slice(1)
                    }
                    y = y[0] + v
                    itemInfo[y][i] = data[id]['stats'][k][i]
                } else {
                    itemInfo[k][i] = data[id]['stats'][k][i]
                }
            }
        }
    }
    res.send(itemInfo)
})
app.listen(port, () => console.log(`Listening on port ${port}`))