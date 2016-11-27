function attachEvents () {
    // kinvey settings
    let appKey = 'kid_SyI9fy6We';
    let appSecret = '1b16a971dd4e45a39c9473c60c348940';
    let baseUrl = `https://baas.kinvey.com/appdata/${appKey}/biggestCatches`;
    let username = 'guest';
    let password = 'guest';
    let base64auth = btoa(`${username}:${password}`);
    let authHeaders = {
        Authorization: `Basic ${base64auth}`
    };

    let catchesContainer = $('#catches');

    // Input fields for adding new catch
    let anglerInputField = $('.angler');
    let weightInputField = $('.weight');
    let speciesInputField = $('.species');
    let locationInputField = $('.location');
    let baitInputField = $('.bait');
    let captureTimeInputField = $('.captureTime');

    $('.load').click(listAllCatches);
    $('.add').click(addCatch);

    function deleteCatch (catchId) {
        let deleteCatchRequest = {
            method: 'DELETE',
            url: `${baseUrl}/${catchId}`,
            headers: authHeaders,
            contentType: 'application/json',
            success: listAllCatches,
            error: displayError
        };

        $.ajax(deleteCatchRequest);
    }

    function updateCatch (catchId, data) {
        let updateCatchRequest = {
            method: 'PUT',
            url: `${baseUrl}/${catchId}`,
            headers: authHeaders,
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: listAllCatches,
            error: displayError
        };

        $.ajax(updateCatchRequest);
    }

    function addCatch () {
        let data = getNewCatchData();
        let createCatchRequest = {
            method: 'POST',
            url: baseUrl,
            headers: authHeaders,
            data: JSON.stringify(data),
            contentType:"application/json",
            success: listAllCatches,
            error: displayError
        };

        $.ajax(createCatchRequest)
            .then(resetInputFields);
    }

    function resetInputFields () {
        anglerInputField.val('');
        weightInputField.val('');
        speciesInputField.val('');
        locationInputField.val('');
        baitInputField.val('');
        captureTimeInputField.val('');
    }

    function getNewCatchData () {
        return {
            angler: anglerInputField.val(),
            weight: Number(weightInputField.val()),
            species: speciesInputField.val(),
            location: locationInputField.val(),
            bait: baitInputField.val(),
            captureTime: Number(captureTimeInputField.val())
        };
    }

    function listAllCatches () {
        let getCatchesRequest = {
            method: 'GET',
            url: baseUrl,
            headers: authHeaders,
            success: displayCatches,
            error: displayError
        };

        $.ajax(getCatchesRequest);
    }

    function displayCatches (catches) {
        let html = '';
        for (let fish of catches) {
            html += `<div class="catch" data-id="${fish._id}">
                            <label>Angler</label>
                            <input type="text" class="angler" value="${fish.angler}"/>
                            <label>Weight</label>
                            <input type="number" class="weight" value="${Number(fish.weight)}"/>
                            <label>Species</label>
                            <input type="text" class="species" value="${fish.species}"/>
                            <label>Location</label>
                            <input type="text" class="location" value="${fish.location}"/>
                            <label>Bait</label>
                            <input type="text" class="bait" value="${fish.bait}"/>
                            <label>Capture Time</label>
                            <input type="number" class="captureTime" value="${Number(fish.captureTime)}"/>
                            <button class="update">Update</button>
                            <button class="delete">Delete</button>
                        </div>`;
        }

        catchesContainer.html(html);

        $('.update').click(function (ev) {
            let catchContainer = $(this).parent();
            let catchId = catchContainer.attr('data-id');
            let inputFields = catchContainer.children().filter('input');
            let data = {};

            for (let inputField of inputFields) {
                let currentField = $(inputField);
                let key = currentField.attr('class');
                let value = currentField.val();
                if (key === 'weight' || key === 'captureTime') {
                    value = Number(value);
                }
                data[key] = value;
            }

            updateCatch(catchId, data);
        });

        $('.delete').click(function (ev) {
            let catchContainer = $(this).parent();
            let catchId = catchContainer.attr('data-id');
            deleteCatch(catchId);
        });
    }

    function displayError (err) {
        let errorDiv = $('<div>');
        errorDiv.css({
            background: 'red',
            color: 'white',
            fontSize: '20px',
            fontWeight: 'bold',
            width: '90%'
        })
            .text('Error');

        $('#aside').prepend(errorDiv);
    }
}