class Stats {
    /**
     * @param {*} obj
     */
    constructor(obj) {
        this.date = new Date(obj['Datum']);
        this.tested = Number(obj['?']);
        this.positive = Number(obj['Dnevno število pozitivnih oseb']);
        this.hospitalized = Number(obj['Skupno število hospitaliziranih oseb na posamezni dan']);
        this.hosp_intensive = Number(obj['Skupno število oseb na intenzivni negi na posamezni dan']);
        this.hosp_released = Number(obj['Dnevno število odpuščenih oseb iz bolnišnice']);
        this.dead = Number(obj['Skupno število umrlih']);
    }
}

module.exports = Stats;
