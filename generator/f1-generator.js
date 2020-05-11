(() => {
    const staticData = {
        countries : []
    } 

    const options = {
        delete    : true,
        bulkMySQL : true
    }

    const database = {
        countries : new Map,
        circuits  : new Map,
        teams     : new Map,
        drivers   : new Map,
        races     : [],
        results   : []
    }

    const sleep = (milliseconds) => new Promise( (resolve) => setTimeout(resolve, milliseconds) )

    function DOMLoaded()
    {
        TranslateData()
    }

    async function UpdateView()
    {
        let sql = {
            prefix    : [],
            countries : [],
            circuits  : [],
            teams     : [],
            drivers   : [],
            races     : []
        }
        let largest

        if (options.delete)
        {
            sql.prefix.push('DELETE FROM tb_resultado;' )
            sql.prefix.push('DELETE FROM tb_prova;'     )
            sql.prefix.push('DELETE FROM tb_piloto;'    )
            sql.prefix.push('DELETE FROM tb_equipe;'    )
            sql.prefix.push('DELETE FROM tb_circuito;'  )
            sql.prefix.push('DELETE FROM tb_pais;'      )
        }

        let countries = Array.from(database.countries)
        largest = countries.reduce( (largest,item) => largest = item[1].name.length > largest ? item[1].name.length : largest, 0 )
        countries = countries.map( country => {
            sql.countries.push(`INSERT INTO tb_pais      (ID_PAIS,     NM_PAIS,     NR_POPULACAO)           VALUES (${country[1].id.toString().padStart(2)}, '${country[1].name}',${' '.repeat(largest - country[1].name.length)} NULL);`)

            return `
                    <div class="row">
                        <div class="col-sm-1"  >${country[1].id}   </div>
                        <div class="col-sm-11" >${country[1].name} </div>
                    </div>`
        })

        let circuits = Array.from(database.circuits)
        largest = circuits.reduce( (largest,item) => largest = item[1].name.length > largest ? item[1].name.length : largest, 0 )
        circuits = circuits.map( circuit => {
            sql.circuits
                .push(`INSERT INTO tb_circuito  (ID_CIRCUITO, NM_CIRCUITO, NR_EXTENSAO,   ID_PAIS) VALUES (${circuit[1].id.toString().padStart(2)}, '${circuit[1].name}',${' '.repeat(largest - circuit[1].name.length)} NULL, ${circuit[1].country.toString().padStart(2)});`)

            return `
                    <div class="row">
                               <div class="col-sm-1" >${circuit[1].id}  </div>
                               <div class="col-sm-9" >${circuit[1].name} </div>
                    </div>`
        })

        let teams = Array.from(database.teams)
        largest = teams.reduce( (largest,item) => largest = item[1].name.length > largest ? item[1].name.length : largest, 0 )
        teams = teams.map(team => {
            sql.teams.push(`INSERT INTO tb_equipe    (ID_EQUIPE,   NM_EQUIPE,                  ID_PAIS) VALUES (${team[1].id.toString().padStart(2)}, '${team[1].name}',${' '.repeat(largest - team[1].name.length)} ${team[1].country});`)

            const country = Array.from(database.countries).filter( item => item[1].id == team[1].country ).pop()
            return `
                    <div class="row">
                        <div class="col-sm-1" > ${team[1].id}         </div>
                        <div class="col-sm-4" > ${team[1].name}       </div>
                        <div class="col-sm-4" > ${country[1].name} </div>
                    </div>`
        })

        let drivers = []
        for(const [key, driver] of database.drivers.entries()) 
        {
            drivers.push(driver)
        }

        drivers.sort( (a,b) => {
            if (a.points < b.points) return  1
            if (a.points > b.points) return -1
            return 0
        })

        largest = drivers.reduce( (largest,item) => largest = item.name.length > largest ? item.name.length : largest, 0 )
        const countriesArray = Array.from(database.countries) 
        drivers = drivers.map( driver => {
            sql.drivers.push(`INSERT INTO tb_piloto    (ID_PILOTO,   NM_PILOTO,                  ID_PAIS) VALUES (${driver.id.toString().padStart(2)}, '${driver.name}',${' '.repeat(largest - driver.name.length)} ${driver.country.toString().padStart(2)});`)

            const country = countriesArray.filter( item => item[1].id == driver.country ).pop()
            return `
                    <div class="row">
                        <div class="col-sm-1" > ${driver.id}       </div>
                        <div class="col-sm-5" > ${driver.name}     </div>
                        <div class="col-sm-4" > ${country[1].name} </div>
                        <div class="col-sm-2" > ${driver.points}   </div>
                    </div>`
        })

        sql.drivers = Array.from(database.drivers).map(item => item[1]).map( driver => {
            if (options.bulkMySQL)
                return `${' '.repeat(77)} (${driver.id.toString().padStart(2)}, '${driver.name}',${' '.repeat(largest - driver.name.length)} ${driver.country.toString().padStart(2)}),`
            else
                return `INSERT INTO tb_piloto    (ID_PILOTO,   NM_PILOTO,                  ID_PAIS) VALUES (${driver.id.toString().padStart(2)}, '${driver.name}',${' '.repeat(largest - driver.name.length)} ${driver.country.toString().padStart(2)});`
        })
        if ( (options.bulkMySQL) && (sql.drivers.length > 0) )
        {
            sql.drivers.splice(0, 0, `INSERT INTO tb_piloto    (ID_PILOTO,   NM_PILOTO,                  ID_PAIS) VALUES`)
            sql.drivers[sql.drivers.length - 1] = sql.drivers[sql.drivers.length - 1].slice(0, -1) + ';'
        }

        sql.races = database.races.map( race => {
            if (options.bulkMySQL)
                return `${' '.repeat(77)} (${race.id.toString().padStart(2)}, '${race.date}', NULL, ${race.circuit.toString().padStart(2)}),`
            else
                return `INSERT INTO tb_prova     (ID_PROVA,    DT_PROVA,  NM_SITUACAO, ID_CIRCUITO) VALUES (${race.id.toString().padStart(2)}, '${race.date}', NULL, ${race.circuit.toString().padStart(2)});`
        })
        if ( (options.bulkMySQL) && (sql.races.length > 0) )
        {
            sql.races.splice(0, 0, `INSERT INTO tb_prova     (ID_PROVA,    DT_PROVA,  NM_SITUACAO, ID_CIRCUITO) VALUES`)
            sql.races[sql.races.length - 1] = sql.races[sql.races.length - 1].slice(0, -1) + ';'
        }

        sql.results = database.results.map( result => {
            if (options.bulkMySQL)
                return `${' '.repeat(114)} (${result.race.toString().padStart(2)}, ${result.driver.toString().padStart(2)}, NULL, ${result.position.toString().padStart(2)}, ${result.grid.toString().padStart(2)}, NULL),`
            else
                return `INSERT INTO tb_resultado (ID_PROVA, ID_PILOTO, NR_TEMPO_PROVA, NR_COLOC_FINAL, NR_POSICAO_GRID, NR_MELHOR_VOLTA) VALUES (${result.race.toString().padStart(2)}, ${result.driver.toString().padStart(2)}, NULL, ${result.position.toString().padStart(2)}, ${result.grid.toString().padStart(2)}, NULL);`
        })
        if ( (options.bulkMySQL) && (sql.results.length > 0) )
        {
            sql.results.splice(0, 0, `INSERT INTO tb_resultado (ID_PROVA, ID_PILOTO, NR_TEMPO_PROVA, NR_COLOC_FINAL, NR_POSICAO_GRID, NR_MELHOR_VOLTA) VALUES`)
            sql.results[sql.results.length - 1] = sql.results[sql.results.length - 1].slice(0, -1) + ';'
        }

        document.getElementById('drivers'  ).innerHTML =   drivers.join('\n')
        document.getElementById('circuits' ).innerHTML =  circuits.join('\n')
        document.getElementById('countries').innerHTML = countries.join('\n')
        document.getElementById('teams'    ).innerHTML =     teams.join('\n')

        document.getElementById('sql'      ).innerHTML = []
                                                            .concat(sql.prefix)
                                                            .concat(sql.countries)
                                                            .concat(sql.circuits)
                                                            .concat(sql.teams)
                                                            .concat(sql.drivers)
                                                            .concat(sql.races)
                                                            .concat(sql.results)
                                                            .join('\n')

        await sleep(30)
    }


    async function CountriesDataLoad()
    {
        if ( Array.isArray(staticData.countries) && (staticData.countries.length == 0) )
        {
            staticData.countries.splice(0, staticData.countries.length)
            const response = await fetch(`../json/countries.json`)
            staticData.countries = await response.json()
        }
    }


    function CountriesInsertIfNotFound(key)
    {
        if (database.countries.has(key.toLowerCase()))
            return false

        const country = (staticData.countries.filter(item => {
            const options = ['en_short_name', 'alpha_2_code', 'alpha_3_code']
            for(let option of options)
            {
                if ( item[option].toLowerCase() == key.toLowerCase() ) return true
            }
            return false
        }) || [{ en_short_name : key }]).pop()

        const normalized = ((name) => {
            const words = name.split(' ').filter(word => word.length != 0)
            words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            
            return words.join(' ')
        })(country.en_short_name)

        database.countries.set(key.toLowerCase(), {
            id   : database.countries.size + 1,
            name : normalized
        })

        return true
    }


    function CountryFromNationality(nationality)
    {
        try
        {
            const country = staticData.countries.filter( country => {
                const options = country.nationality.split(',')
                const found = options.filter( option => option.toLowerCase().trim() == nationality.toLowerCase() )
                return !!found.pop()
            }).pop()
    
            if (!country)
                return [null, false]

            const newCountry = CountriesInsertIfNotFound(country.en_short_name)
            return [country.en_short_name, newCountry]
        }
        catch (error)
        {
            throw error
        }
    }


    function TeamsInsertIfNotFound(team)
    {
        if ( database.teams.has(team.constructorId) )
            return [false, false]

        const [country, isNewCountry] = CountryFromNationality(team.nationality)
        database.teams.set(team.constructorId, {
            id      : database.teams.size + 1,
            name    : team.name,
            country : database.countries.get(country.toLowerCase()).id
        })

        return [true, isNewCountry]
    }


    function DriverInsertIfNotFound(driver)
    {
        if ( database.drivers.has(driver.driverId) )
            return [false, false, database.drivers.get(driver.driverId).id]

        const [country, isNewCountry] = CountryFromNationality(driver.nationality)
        database.drivers.set(driver.driverId, {
            id      : database.drivers.size + 1,
            name    : driver.givenName + ' ' + driver.familyName,
            country : database.countries.get(country.toLowerCase()).id, 
            points  : 0
        })

        return [true, isNewCountry, database.drivers.size]
    }


    function RacesInsertIfNotFound(raceData)
    {
        const race = database.races.filter( race => {
            return (race.date == raceData.date) && (race.circuit == raceData.circuit)
        }).pop()

        if (!!race)
            return race.id

        database.races.push({
            id      : database.races.length + 1,
            date    : raceData.date,
            circuit : raceData.circuit
        })

        return database.races.length
    }


    async function TranslateData()
    {
        try
        {
            const urlParameters = new URLSearchParams(location.search)
            if (!urlParameters.has('season'))
                throw new Error('Need Season')

            const response = await fetch(`../json/f1-season-${urlParameters.get('season')}.json`)
            const data = await response.json()

            if (!data.MRData && !data.RaceTable && !data.RaceTable.Races)
                throw new Error('Unexpected structure on retrieved season data')

            await CountriesDataLoad()

            for(let race of data.MRData.RaceTable.Races)
            {
                if (CountriesInsertIfNotFound(race.Circuit.Location.country))
                {
                    await UpdateView()
                }

                if (!database.circuits.has(race.Circuit.circuitId))
                {
                    database.circuits.set(race.Circuit.circuitId, {
                        id      : database.circuits.size + 1,
                        name    : race.Circuit.circuitName,
                        country : database.countries.get(race.Circuit.Location.country.toLowerCase()).id,
                        date    : race.date
                    })
                    await UpdateView()
                }
                
                for(let result of race.Results)
                {
                    const teamInsertion = TeamsInsertIfNotFound(result.Constructor) 
                    if ( teamInsertion[0] || teamInsertion[1] )
                    {
                        await UpdateView()
                    }

                    const driverInsertion = DriverInsertIfNotFound(result.Driver) 
                    if ( driverInsertion[0] || driverInsertion[1] )
                    {
                        await UpdateView()
                    }
                    
                    const raceInsertion = RacesInsertIfNotFound({ 
                        date    : race.date, 
                        circuit : database.circuits.get(race.Circuit.circuitId).id,
                        season  : parseInt(race.season) 
                    })

                    database.results.push({
                        race     : raceInsertion,
                        driver   : driverInsertion[2],
                        grid     : parseInt(result.grid),
                        position : parseInt(result.position)
                    })

                    if (result.points != '0')
                    {
                        database.drivers.get(result.Driver.driverId).points += parseInt(result.points)
                    }

                    await UpdateView()
                }
            }
        }
        catch (error)
        {
            alert(error.message)
        }
    }

    document.addEventListener('DOMContentLoaded', DOMLoaded)
})()