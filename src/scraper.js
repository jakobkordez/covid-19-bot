const fs = require('fs');

const EventEmitter = require('events');
const statTracker = new EventEmitter();

const request = require('request');
const Stats = require('./stats');

const cacheFile = '.cache'
const csvUrl = 'https://www.gov.si/teme/koronavirus-sars-cov-2/element/67900/izvoz.csv';

var cachedData = new Date(readCache());

/** @returns {Promise<Stats>} */
const getData = () => new Promise((resolve, reject) => {
    request(csvUrl, (err, res, /** @type {string} */ body) => {
        if (err) reject(err);

        if (res.statusCode !== 200) reject(body);

        let x = body.trim().split('\n').map(l => l.split(','));
        x = x.map(r => r.map(c => c.substr(1, c.length - 2)));
        let dic = {};
        x[0].forEach((e, i) => dic[e] = x[1][i]);

        resolve(new Stats(dic));
    });
});

const checkNew = async () => {
    try {
        const stats = await getData();

        if (!cachedData || stats.date > cachedData) {
            cachedData = stats.date;
            writeCache(cachedData);
            statTracker.emit('newData', stats);
        }
    }
    catch (e) {
        console.error(e);
    }
}

setTimeout(() => {
    checkNew();
    setTimeout(checkNew, 10 * 60 * 1000);
}, 5000);


module.exports = { statTracker }


/**
 * Async write to cache file
 * @param {*} data
 */
function writeCache(data) {
    fs.writeFile(cacheFile, JSON.stringify(data), () => {});
}

/**
 * Sync read from cache file
 */
function readCache() {
    if (!fs.existsSync(cacheFile)) return null;
    return JSON.parse(fs.readFileSync(cacheFile));
}
