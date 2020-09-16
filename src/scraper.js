const request = require('request');

const csvUrl = 'https://www.gov.si/teme/koronavirus-sars-cov-2/element/67900/izvoz.csv';

function getData() {
    return new Promise((resolve, reject) => {
        request(csvUrl, (err, res, /** @type {string} */ body) => {
            if (err) reject(err);

            if (res.statusCode !== 200) reject(body);

            let x = body.split('\n').map(l => l.split(','));
            x.pop()
            x = x.map(r => r.map(c => c.substr(1, c.length-2)));
            let dic = {};
            x[0].forEach((e, i) => dic[e] = x[1][i]);
            dic['Datum'] = new Date(dic['Datum']);
            resolve(dic);
        });
    });
}

module.exports = {

    getData
    
}
