(() => {
    function DOMLoaded()
    {
        TranslateData()
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

            const drivers = new Map
            const circuits = new Map
            for(let race of data.MRData.RaceTable.Races)
            {
                if (!circuits.has(race.Circuit.circuitId))
                {
                    circuits.set(race.Circuit.circuitId, {
                        name : race.Circuit.circuitName
                    })
                }

                for(let result of race.Results)
                {
                    const driver = result.Driver
                    if (!drivers.has(driver.driverId))
                    {
                        const country = countries.filter( item => item.nacionality == driver.nacionality) 
                        drivers.set(driver.driverId, {
                            name    : driver.givenName + ' ' + driver.familyName,
                            country : country.num_code
                        })
                    }

                }
            }
  
            const output = []
            for(const [key, circuit] of circuits.entries())
            {
                output.push(circuit.name)
            }

            document.getElementById('container').innerHTML = output.join('<br>')
        }
        catch (error)
        {
            alert(error.message)
        }
    }

    

    document.addEventListener('DOMContentLoaded', DOMLoaded)
})()