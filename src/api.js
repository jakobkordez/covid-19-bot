const fs = require('fs');

const EventEmitter = require('events');
const statTracker = new EventEmitter();

const request = require('request');
const Stats = require('./stats');

const cacheFile = '.cache'
const apiUrl = 'https://api.sledilnik.org/api/stats';

var cachedData = readCache();
if (!cachedData) {
    let today = new Date(Date.now());
    cachedData = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() - 1));
    writeCache(cachedData);
}

/**
 * @param {String} date
 * @returns {Promise<Stats>}
 */
const getData = (date) => new Promise((resolve, reject) => {
    request(`${apiUrl}?from=${date}`, (err, res, /** @type {string} */ body) => {
        if (err) return reject(err);
        if (!res) return reject('Unknown error');

        if (res.statusCode !== 200) return reject(body);

        resolve(JSON.parse(res.body)[0]);
    });
});

const checkNew = async () => {
    try {
        const stats = await getData(cachedData.toISOString().slice(0, 10));

        if (process.env.DEV_SERVER_ID || (stats && stats.performedTests)) {
            cachedData.setDate(cachedData.getDate() + 1);
            writeCache(cachedData);
            statTracker.emit('newData', stats);
        }
    }
    catch (e) {
        console.error(e);
    }
}

const start = () => {
    setTimeout(() => {
        checkNew();
        setInterval(checkNew, 10 * 60 * 1000);
    }, 5000);
}

module.exports = { statTracker, start }


/**
 * Async write to cache file
 * @param {*} data
 */
function writeCache(data) {
    fs.writeFile(cacheFile, JSON.stringify(data), () => { });
}

/**
 * Sync read from cache file
 */
function readCache() {
    if (!fs.existsSync(cacheFile)) return null;
    const data = fs.readFileSync(cacheFile);
    if (data == '') return null;
    return new Date(JSON.parse(data));
}
