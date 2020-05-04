(() => {
    function DOMLoaded()
    {
        TranslateData()
    }

    async function TranslateData()
    {
        try
        {
            const urlParameters = new URLSearchParams(location.search)
            if (!urlParameters.has('season'))
                throw new Error('Need Season')

            alert('season is ' + urlParameters.get('season'))
        }
        catch (error)
        {
            alert(error.message)
        }
    }

    

    document.addEventListener('DOMContentLoaded', DOMLoaded)
})()