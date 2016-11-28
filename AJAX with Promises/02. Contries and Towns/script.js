$(solve);

function solve () {
    let appKey = 'kid_Bkq0kb5Gl';
    let baseUrl = `https://baas.kinvey.com/appdata/${appKey}`;
    let username = 'guest';
    let password = 'guest';
    let base64auth = btoa(`${username}:${password}`);
    let authHeaders = {
        'Authorization': `Basic ${base64auth}`,
        'Content-Type': 'application/json'
    };

    let countriesTable = $('#countries-table');
    let townsTable = $('#towns-table');
    let selectedCountryId = '';

    loadCountries();

    function loadCountries () {
        let getCountriesRequest = {
            method: 'GET',
            url: `${baseUrl}/countries`,
            headers: authHeaders
        };

        $.ajax(getCountriesRequest)
            .then(displayCountries)
            .catch(displayError);
    }

    function displayCountries (countries) {
        countriesTable.find('tr:not(:first)').remove();
        countries.sort((a, b) => a.name > b.name);

        for (let country of countries) {
            let row = `<tr data-id="${country._id}" class="country-row">
                        <td>${country.name}</td>
                        <td>
                            <button class="countries-table-delete-btn" data-id="${country._id}">Delete</button>
                        </td>
                    </tr>`;
            countriesTable.append($(row));
        }
        appendAddCountryRow();

        $('.country-row').click(getCountryTowns);
        $('.countries-table-delete-btn').click(deleteCountry);
    }

    function deleteCountry (event) {
        let countryId = $(event.currentTarget).attr('data-id');
        let deleteCountryRequest = {
            method: 'DELETE',
            url: `${baseUrl}/countries/${countryId}`,
            headers: authHeaders
        };

        $.ajax(deleteCountryRequest)
            .then(loadCountries)
            .catch(displayError);
    }

    function appendAddCountryRow () {
        let row = `<tr>
                        <td>
                            <input id="new-country-name" type="text" placeholder="Name" required />
                        </td>
                        <td><button id="add-country-btn">Add</button></td>
                    </tr>`;
        countriesTable.append($(row));
        $('#add-country-btn').click(addCountry);
    }

    function appendAddTownRow () {
        let row = `<tr id="add-town-row">
                        <td>
                            <input id="new-town-name" type="text" placeholder="Name" required />
                        </td>
                        <td><button id="add-town-btn">Add</button></td>
                    </tr>`;
        townsTable.append($(row));
        $('#add-town-btn').click(addTown);
    }

    function addTown (event) {
        let newTownName = $('#new-town-name').val();
        let countryId = townsTable.attr('data-country-id');
        if (newTownName !== '') {
            let newTown = {
                name: newTownName,
                country_id: countryId
            };

            let addTownRequest = {
                method: 'POST',
                url: `${baseUrl}/towns`,
                headers: authHeaders,
                data: JSON.stringify(newTown)
            };

            $.ajax(addTownRequest)
                .then(displayNewTown)
                .catch(displayError);
        }
    }

    function displayNewTown (town) {
        let row = `<tr data-id="${town._id}">
                        <td>${town.name}</td>
                        <td><button class="delete-town-btn" data-town-id="${town._id}">Delete</button></td>
                    </td>`;
        $('#add-town-row').before($(row));
        $('#new-town-name').val('');
        attachDeleteTownEvent();
    }

    function attachDeleteTownEvent () {
        $('.delete-town-btn').click(function (event) {
            let button = $(event.currentTarget);
            let townId = button.attr('data-town-id');
            let deleteTownRequest = {
                method: 'DELETE',
                url: `${baseUrl}/towns/${townId}`,
                headers: authHeaders
            };

            $.ajax(deleteTownRequest)
                .then(function () {
                    button.parent().parent().remove();
                })
                .catch(displayError);
        });
    }

    function addCountry () {
        let newCountryName = $('#new-country-name').val();

        if (newCountryName !== '') {
            let newCountry = {
                name: newCountryName
            };
            let addCountryRequest = {
                method: 'POST',
                url: `${baseUrl}/countries`,
                headers: authHeaders,
                data: JSON.stringify(newCountry)
            };

            $.ajax(addCountryRequest)
                .then(loadCountries)
                .catch(displayError);
        }
    }

    function getCountryTowns (event) {
        let countryId = $(event.currentTarget).attr('data-id');
        townsTable.attr('data-country-id', countryId);
        let getCountryTownsRequest = {
            method: 'GET',
            url: `${baseUrl}/towns?query={"country_id":"${countryId}"}`,
            headers: authHeaders
        };

        $.ajax(getCountryTownsRequest)
            .then(displayCountryTowns)
            .catch(displayError);
    }

    function displayCountryTowns (towns) {
        townsTable.find('tr:not(:first)').remove();
        towns.sort((a, b) => a.name.localeCompare(b.name));

        for (let town of towns) {
            let row = `<tr data-id="${town._id}">
                            <td>${town.name}</td>
                            <td><button class="delete-town-btn" data-town-id="${town._id}">Delete</button></td>
                        </tr>`;
            townsTable.append($(row));
        }

        appendAddTownRow();
        attachDeleteTownEvent();
    }

    function displayError (error) {

    }
}
