class Stats {
    /**
     * @param {*} obj
     */
    constructor(obj) {
        this.date = new Date(obj['Datum']);
        this.tested = Number(obj['Opravljeni testi']);
        this.positive = Number(obj['Pozitivne osebe']);
        this.hospitalized = Number(obj['Hospitalizirane osebe']);
        this.hosp_intensive = Number(obj['Osebe na intenzivni negi']);
        this.hosp_released = Number(obj['Odpuščeni iz bolnišnice']);
        this.dead = Number(obj['Umrli']);
    }
}

module.exports = Stats;
