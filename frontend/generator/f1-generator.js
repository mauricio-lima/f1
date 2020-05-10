(() => {
    const staticData = {
        countries : []
    } 

    const database = {
        countries : new Map,
        teams     : new Map,
        drivers   : new Map,
        circuits  : new Map,
    }

    const sleep = (milliseconds) => new Promise( (resolve) => setTimeout(resolve, milliseconds) )

    function DOMLoaded()
    {
        TranslateData()
    }

    async function UpdateView()
    {
        let sql = {
            countries : [],
            circuits  : [],
            teams     : [],
            drivers   : []
        }
        let largest

        let countries = Array.from(database.countries)
        largest = countries.reduce( (largest,item) => largest = item[1].name.length > largest ? item[1].name.length : largest, 0 )
        countries = countries.map( country => {
            sql.countries.push(`INSERT INTO tb_pais      (ID_PAIS,     NM_PAIS,     NR_POPULACAO)         VALUES (${country[1].id.toString().padStart(2)}, '${country[1].name}',${' '.repeat(largest - country[1].name.length)} NULL);`)

            return `
                    <div class="row">
                        <div class="col-sm-1"  >${country[1].id}   </div>
                        <div class="col-sm-11" >${country[1].name} </div>
                    </div>`
        })

        let circuits = Array.from(database.circuits)
        largest = circuits.reduce( (largest,item) => largest = item[1].name.length > largest ? item[1].name.length : largest, 0 )
        circuits = circuits.map( circuit => {
            sql.circuits.push(`INSERT INTO tb_circuitos (ID_CIRCUITO, NM_CIRCUITO, NR_EXTENSAO, ID_PAIS) VALUES (${circuit[1].id.toString().padStart(2)}, '${circuit[1].name}',${' '.repeat(largest - circuit[1].name.length)} NULL, ${circuit[1].country.toString().padStart(2)});`)

            return `
                    <div class="row">
                               <div class="col-sm-1" >${circuit[1].id}  </div>
                               <div class="col-sm-9" >${circuit[1].name} </div>
                    </div>`
        })

        let teams = []
        for(const [key, driver] of database.teams.entries()) teams.push(driver)
        
        largest = teams.reduce( (largest,item) => largest = item.name.length > largest ? item.name.length : largest, 0 )
        
        teams = teams.map(team => {
            sql.teams.push(`INSERT INTO tb_equipes   (ID_EQUIPE,   NM_EQUIPE,                ID_PAIS) VALUES (${team.id.toString().padStart(2)}, '${team.name}',${' '.repeat(largest - team.name.length)} ${team.country});`)

            const country = Array.from(database.countries).filter( item => item[1].id == team.country ).pop()
            teams.push(`<div class="row">
                            <div class="col-sm-1" > ${team.id}         </div>
                            <div class="col-sm-4" > ${team.name}       </div>
                            <div class="col-sm-4" > ${country[1].name} </div>
                        </div>`)
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
            sql.drivers.push(`INSERT INTO tb_pilotos   (ID_PILOTO,   NM_PILOTO,                ID_PAIS) VALUES (${driver.id.toString().padStart(2)}, '${driver.name}',${' '.repeat(largest - driver.name.length)} ${driver.country.toString().padStart(2)});`)

            const country = countriesArray.filter( item => item[1].id == driver.country ).pop()
            return `
                    <div class="row">
                        <div class="col-sm-1" > ${driver.id}       </div>
                        <div class="col-sm-5" > ${driver.name}     </div>
                        <div class="col-sm-4" > ${country[1].name} </div>
                        <div class="col-sm-2" > ${driver.points}   </div>
                    </div>`
        })


        document.getElementById('drivers'  ).innerHTML =   drivers.join('\n')
        document.getElementById('circuits' ).innerHTML =  circuits.join('\n')
        document.getElementById('countries').innerHTML = countries.join('\n')
        document.getElementById('teams'    ).innerHTML =     teams.join('\n')

        document.getElementById('sql'      ).innerHTML = []
                                                            .concat(sql.countries)
                                                            .concat(sql.circuits)
                                                            .concat(sql.teams)
                                                            .concat(sql.drivers)
                                                            .join('\n')

        await sleep(700)
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
            return [false, false]

        const [country, isNewCountry] = CountryFromNationality(driver.nationality)
        database.drivers.set(driver.driverId, {
            id      : database.drivers.size + 1,
            name    : driver.givenName + ' ' + driver.familyName,
            country : database.countries.get(country.toLowerCase()).id, 
            points  : 0
        })

        return [true, isNewCountry]
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
                        country : database.countries.get(race.Circuit.Location.country.toLowerCase()).id
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
                    
                    if (result.points != '0')
                    {
                        database.drivers.get(result.Driver.driverId).points += parseInt(result.points)
                    }
                }
            }
            await UpdateView()
        }
        catch (error)
        {
            alert(error.message)
        }
    }

    document.addEventListener('DOMContentLoaded', DOMLoaded)
})()