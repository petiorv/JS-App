function attachEvents () {
    const baseUrl = 'https://judgetests.firebaseio.com';
    const weatherSymbols = {
        'Sunny': '&#x2600;',
        'Partly sunny': '&#x26C5;',
        'Overcast': '&#x2601;',
        'Rain': '&#x2614;',
        'Degrees': '&#176;'
    };

    let forecastContainer = $('#forecast');
    let currentForecastContainer = $('#current');
    let upcomingForecastContainer = $('#upcoming');
    let locationInputField = $('#location');

    $('#submit').click(getWeatherReport);

    function getWeatherReport () {
        let getLocationId = {
            method: 'GET',
            url: `${baseUrl}/locations.json`
        };

        $.ajax(getLocationId)
            .then(getLocationCode)
            .catch(displayError);
    }

    function getForeCast (locationCode) {
        let getCurrentForecastRequest = {
            method: 'GET',
            url: `${baseUrl}/forecast/today/${locationCode}.json`
        };

        let getUpcomingDaysForecastRequest = {
            method: 'GET',
            url: `${baseUrl}/forecast/upcoming/${locationCode}.json`
        };

        $.ajax(getCurrentForecastRequest)
            .then(renderCurrentCondition)
            .catch(displayError);

        $.ajax(getUpcomingDaysForecastRequest)
            .then(renderUpcomingForeCast)
            .catch(displayError);
    }

    function renderUpcomingForeCast (upcomingDaysData) {
        let forecast = upcomingDaysData.forecast;
        let html = '';
        for (let day of forecast) {
            let conditionSymbol = weatherSymbols[day.condition];
            html += `
                    <span class="upcoming">
                        <span class="symbol">${conditionSymbol}</span>
                        <span class="forecast-data">${day.low}/${day.high}</span>
                        <span class="forecast-data">${day.condition}</span>
                    </span>`;
        }

        upcomingForecastContainer.html(html);
    }

    function renderCurrentCondition (currentConditionData) {
        let conditionSymbol = weatherSymbols[currentConditionData.forecast.condition];
        let locationName = currentConditionData.name;
        let foreCastLow = currentConditionData.forecast.low;
        let foreCastHigh = currentConditionData.forecast.high;
        let forecastCondition = currentConditionData.forecast.condition;

        forecastContainer.css('display', '');
        let currentConditionsHtml = `
            <div class="label">Current conditions</div>
            <span class="condition symbol">${conditionSymbol}</span>
            <span class="condition"></span>
            <span class="forecast-data">${locationName}</span>
            <span class="forecast-data">${foreCastLow}/${foreCastHigh}</span>
            <span class="forecast-data">${forecastCondition}</span>`;


        currentForecastContainer.html(currentConditionsHtml);
    }

    function getLocationCode (locations) {
        let locationCode = '';
        let currentLocationName = locationInputField.val();
        locationInputField.val('');

        for (let location of locations) {
            if (location.name === currentLocationName) {
                getForeCast(location.code);
            }
        }
    }

    function displayError (err) {
        console.log('Error: ' + err);
        forecastContainer.css('display', 'none');
        let errorDiv = $('<div>').css('background', 'red').css('color', 'white').text('Error').fadeOut(5000);
        $('body').prepend(errorDiv);
    }
}