let baseUrl = 'https://baas.kinvey.com';
let appKey = 'kid_BJ_Ke8hZg';
let username = 'guest';
let password = 'pass';
let base64auth = btoa(`${username}:${password}`);
let authHeaders = {
    'Authorization': `Basic ${base64auth}`,
    'Content-Type': 'application/json'
};
let venueInfoContainer = '';

$(attachEvents);

function attachEvents () {
    $('#getVenues').click(getAvailableVenuesIds);
    venueInfoContainer = $('#venue-info');
}

function getAvailableVenuesIds () {
    let dateInputElement = $('#venueDate');

    if (dateInputElement.val() !== '') {
        let date = dateInputElement.val();
        let getVenuesIdsRequest = {
            method: 'POST',
            url: `${baseUrl}/rpc/kid_BJ_Ke8hZg/custom/calendar?query=${date}`,
            headers: authHeaders
        };

        $.ajax(getVenuesIdsRequest)
            .then(getVenues)
            .catch(displayError);
    }
}

function getVenues (venuesIds) {
    let getVenueRequests = [];

    for (let id of venuesIds) {
        let currentGetVenueRequest = $.ajax({
            method: 'GET',
            url: `${baseUrl}/appdata/kid_BJ_Ke8hZg/venues/${id}`,
            headers: authHeaders
        });

        getVenueRequests.push(currentGetVenueRequest);
    }

    Promise.all([...getVenueRequests])
        .then(displayVnues)
        .catch(displayError);
}

function displayVnues () {
    let html = ``;
    let venues = arguments[0];
    for (let venue of venues) {
        html += `<div class="venue" id="${venue._id}">
                    <span class="venue-name"><input class="info" type="button" value="More info">${venue.name}</span>
                    <div class="venue-details" style="display: none;">
                        <table>
                        <tr><th>Ticket Price</th><th>Quantity</th><th></th></tr>
                        <tr>
                            <td class="venue-price">${venue.price} lv</td>
                            <td><select class="quantity">
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            </select></td>
                            <td><input class="purchase" type="button" value="Purchase"></td>
                        </tr>
                        </table>
                        <span class="head">Venue description:</span>
                        <p class="description">${venue.description}</p>
                        <p class="description">Starting time: ${venue.startingHour}</p>
                    </div>
                </div>`;
    }

    venueInfoContainer.html(html);
    attachVenueEvents();
}

function attachVenueEvents () {
    $('.info').click(toggleVenueDetails);
    $('.purchase').click(showConfirmPurchase);
}

function showConfirmPurchase (event) {
    let currentVenueContainer = $($(event.currentTarget).parent().parent().parent().parent().parent().parent());
    let venueId = currentVenueContainer.attr('id');
    let name = currentVenueContainer.find('.venue-name').text();
    let price = Number(currentVenueContainer.find('.venue-price').text().replace(/\s[lv]+/, ''));
    let quantity = Number(currentVenueContainer.find('.quantity').val());

    let html = `<span class="head">Confirm purchase</span>
                <div class="purchase-info">
                    <span>${name}</span>
                    <span>${quantity} x ${price}</span>
                    <span>Total: ${quantity * price} lv</span>
                    <input id="confirm" type="button" value="Confirm">
                </div>`;

    venueInfoContainer.html(html);
    $('#confirm').click(function (event) {
        let getTicketRequest = {
            method: 'POST',
            url: `${baseUrl}/rpc/kid_BJ_Ke8hZg/custom/purchase?venue=${venueId}&qty=${quantity}`,
            headers: authHeaders
        };

        $.ajax(getTicketRequest)
            .then(displayTicket)
            .catch(displayError);
    });
}

function displayTicket (ticket) {
    venueInfoContainer.html(`You may print this page as your ticket ${ticket.html}`);
}

function toggleVenueDetails (event) {
    let currentVenueDetailsContainer = $($(event.currentTarget).parent().parent().children()[1]);
    if (currentVenueDetailsContainer.css('display') === 'block') {
        currentVenueDetailsContainer.css('display', 'none');
    } else {
        currentVenueDetailsContainer.css('display', 'block');
    }
}

function displayError (error) {
    let errorDiv = $('<div>').css({
        background: 'red',
        color: 'white',
        fontWight: 'bold',
        fontSize: '16px'
    })
        .text('Error')
        .fadeOut(5000);

    $('body').prepend(errorDiv);
}
