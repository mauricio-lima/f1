(() => {
    let countriesData = []

    const database = {
        countries : new Map,
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
            circuits  : []
        }

        let drivers = []
        for(const [key, driver] of database.drivers.entries()) drivers.push(driver)
        drivers.sort( (a,b) => {
            if (a.points < b.points) return  1
            if (a.points > b.points) return -1
            return 0
        })
        drivers = drivers.map( driver => `<div class="row">
                                              <div class="col-sm-2" > ${driver.id}      </div>
                                              <div class="col-sm-5" > ${driver.name}    </div>
                                              <div class="col-sm-3" > ${driver.country} </div>
                                              <div class="col-sm-2" > ${driver.points}  </div>
                                          </div>`)

        const circuits = []
        for(const [key, circuit] of database.circuits.entries())
        {
            circuits.push(`<div class="row">
                              <div class="col-sm-1" >${circuit.id}  </div>
                              <div class="col-sm-9" >${circuit.name} </div>
                           </div>`)

            sql.circuits.push(`INSERT INTO tb_circuitos (ID_CIRCUITO, NM_CIRCUITO, ID_PAIS) VALUES (${circuit.id}, '${circuit.name}', '${circuit.country});`)
        }

        const countries = []
        for(const [key, country] of database.countries.entries())
        {
            countries.push(`<div class="row">
                              <div class="col-sm-1"  >${country.id}   </div>
                              <div class="col-sm-11" >${country.name} </div>
                           </div>`)

            sql.countries.push(`INSERT INTO tb_paises (ID_PAIS, NM_PAIS) VALUES (${country.id}, '${country.name}');`)
        }

        document.getElementById('drivers'  ).innerHTML =   drivers.join('\n')
        document.getElementById('circuits' ).innerHTML =  circuits.join('\n')
        document.getElementById('countries').innerHTML = countries.join('\n')
        document.getElementById('sql'      ).innerHTML = sql.countries.concat(sql.circuits).join('\n')

        await sleep(700)
    }


    function CountriesInsertIfNotFound(key)
    {
        if (database.countries.has(key.toLowerCase()))
            return false

        const country = (countriesData.filter(item => {
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


    async function TranslateData()
    {
        try
        {
            let response

            const urlParameters = new URLSearchParams(location.search)
            if (!urlParameters.has('season'))
                throw new Error('Need Season')

            response = await fetch(`../json/f1-season-${urlParameters.get('season')}.json`)
            const data = await response.json()

            if (!data.MRData && !data.RaceTable && !data.RaceTable.Races)
                throw new Error('Unexpected structure on retrieved season data')

            response = await fetch(`../json/countries.json`)
            countriesData = await response.json()

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
                    const driver = result.Driver
                    if (!database.drivers.has(driver.driverId))
                    {
                        database.drivers.set(driver.driverId, {
                            id      : database.drivers.size + 1,
                            name    : driver.givenName + ' ' + driver.familyName,
                            country : driver.nationality, 
                            points  : 0
                        })
                        await UpdateView
                    }
                    if (result.points != '0')
                    {
                        database.drivers.get(driver.driverId).points += parseInt(result.points)
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