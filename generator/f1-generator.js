(() => {
    const database = {
        drivers  : new Map,
        circuits : new Map,
    }

    const sleep = (milliseconds) => new Promise( (resolve) => setTimeout(resolve, milliseconds) )

    function DOMLoaded()
    {
        TranslateData()
    }

    async function UpdateView()
    {
        let drivers = []
        for(const [key, driver] of database.drivers.entries()) drivers.push(driver)
        drivers.sort( (a,b) => {
            if (a.name < b.name) return -1
            if (a.name > b.name) return  1
            return 0
        })
        drivers = drivers.map( driver => `<div class="row">
                                              <div class="col-sm-1" >${driver.id}   </div>
                                              <div class="col-sm-9" >${driver.name} </div>
                                              <div class="col-sm-1" >45             </div>
                                          </div>`)

        const circuits = []
        for(const [key, circuit] of database.circuits.entries())
        {
            circuits.push(`<div class="row">
                              <div class="col-sm-1" >${circuit.id}  </div>
                              <div class="col-sm-9" >${circuit.name} </div>
                           </div>`)
        }

        document.getElementById('drivers').innerHTML  = drivers.join('<br>')
        document.getElementById('circuits').innerHTML = circuits.join('<br>')
        await sleep(200)
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
            const countries = await response.json()

            for(let race of data.MRData.RaceTable.Races)
            {
                if (!database.circuits.has(race.Circuit.circuitId))
                {
                    database.circuits.set(race.Circuit.circuitId, {
                        id   : database.circuits.size + 1,
                        name : race.Circuit.circuitName
                    })
                    await UpdateView()
                }

                for(let result of race.Results)
                {
                    const driver = result.Driver
                    if (!database.drivers.has(driver.driverId))
                    {
                        const country = countries.filter( item => item.nacionality == driver.nacionality) 
                        database.drivers.set(driver.driverId, {
                            id      : database.drivers.size + 1,
                            name    : driver.givenName + ' ' + driver.familyName,
                            country : country.num_code
                        })
                        await UpdateView()
                    }

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