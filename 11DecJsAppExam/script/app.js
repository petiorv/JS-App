const kinveyBaseUrl = 'https://baas.kinvey.com';
const kinveyAppKey = 'kid_B12O0_97l';
const kinveyAppSecret = 'badcbccaff134cc49b14993a867fd660';
const base64auth = btoa(`${kinveyAppKey}:${kinveyAppSecret}`);
const kinveyAppAuthHeaders = {
    'Authorization': `Basic ${base64auth}`,
    'Content-Type': 'application/json'
};

function startApp() {
    showHideMenuLinks();
    attachMenuLinksEvents();
    if (sessionStorage.getItem('authToken')) {
        let user = sessionStorage.getItem('username');
        $('#spanMenuLoggedInUser').html(`Welcome, ${user}!`);
        $('#linkUserHomeMyMessages').click(myMsgView);
        $('#linkUserHomeSendMessage').click(getUsers);
        $('#linkUserHomeArchiveSent').click(archiveMsgList);
        showUserHomeView();

    }else{
        showHomeView();
    }
    attachButtonsEvents();

    $(document).on({
        ajaxStart: () => $('#loadingBox').show(),
        ajaxStop: () => {
            $('#loadingBox').hide();
        }
    });
}

function showView (viewName) {
    $('main > section').hide();
    $(`#${viewName}`).show();
}


function saveAuthInSession (userInfo) {
    sessionStorage.setItem('authToken', userInfo._kmd.authtoken);
    sessionStorage.setItem('userId', userInfo._id);
    sessionStorage.setItem('username', userInfo.username);
}

function showHideMenuLinks() {
    if (sessionStorage.getItem('authToken')){
        $('#linkMenuAppHome').hide();
        $('#linkMenuLogout').show();
        $('#linkMenuArchiveSent').show();
        $('#linkMenuSendMessage').show();
        $('#linkMenuUserHome').show();
        $('#linkMenuMyMessages').show();
        $('#spanMenuLoggedInUser').show();
        $('#linkMenuLogin').hide();
        $('#linkMenuRegister').hide();

    }else{
        $('#linkMenuAppHome').show();
        $('#linkMenuLogout').hide();
        $('#linkMenuArchiveSent').hide();
        $('#linkMenuSendMessage').hide();
        $('#linkMenuUserHome').hide();
        $('#linkMenuMyMessages').hide();
        $('#spanMenuLoggedInUser').hide();
        $('#linkMenuRegister').show();
        $('#linkMenuLogin').show();

    }
}

//Info boxes
function showInfoBox (message) {
    $('#infoBox').text(message).show().fadeOut(3000);
}

function showError(message) {
    $('#errorBox').text(message).show().click(() => {
        $('#errorBox').hide();
    });
}

function handleAjaxError (response) {
    let errorMsg = JSON.stringify(response);

    if (response.readyState === 0) {
        errorMsg = 'Cannot connect due to network error.';
    }

    if (response.responseJSON && response.responseJSON.description) {
        errorMsg = response.responseJSON.description;
    }

    showError(errorMsg);
}
//_________

function attachMenuLinksEvents () {
    $('#linkMenuLogin').click(showLoginView);
    $('#linkMenuRegister').click(showRegisterView);
    $('#linkMenuAppHome').click(showHomeView);
    $('#linkMenuLogout').click(logoutUser);
    $('#linkMenuMyMessages').click(myMsgList);
    $('#linkMenuSendMessage').click(getUsers);
    $('#linkMenuUserHome').click(showUserHomeView);
    $('#linkMenuArchiveSent').click(archiveMsgList);

}
//____Messages
function archiveMsgList(event) {


    $('#sentMessages').empty();
    let authToken = sessionStorage.getItem('authToken');
    let username = sessionStorage.getItem('username');

    let getAllSentMsg = {
        method: 'GET',
        url: `https://baas.kinvey.com/appdata/kid_B12O0_97l/messages?query={"sender_username":"${username}"}`,
        headers: {
            'Authorization': `Kinvey ${authToken}`,
            'Content-Type': 'application/json'
        },
        success: listedArchive,
        error: handleAjaxError
    };

    $.ajax(getAllSentMsg);
    event.preventDefault();
    showArchiveMsg();
}
function listedArchive(archive) {
    let table = $(`<table>
                        <tr>
                            <th>To</th>
                            <th>Message</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </table>`);

    for (let msg of archive) {
        let date = msg._kmd.ect;

        function formatDate(dateISO8601) {
            let date = new Date(dateISO8601);
            if (Number.isNaN(date.getDate()))
                return '';
            return date.getDate() + '.' + padZeros(date.getMonth() + 1) +
                "." + date.getFullYear() + ' ' + date.getHours() + ':' +
                padZeros(date.getMinutes()) + ':' + padZeros(date.getSeconds());

            function padZeros(num) {
                return ('0' + num).slice(-2);
            }
        }

        table.append(`
            <tr>
                <td>${msg.recipient_username}</td>
                <td>${msg.text}</td>
                <td>${formatDate(date)}</td>
                <td><button>Delete</button></td>
            </tr>
        `);
    }
    $('#sentMessages').append(table);

}



function getUsers() {

//https://baas.kinvey.com/user/kid_B12O0_97l/ GET

    $('#msgRecipientUsername').empty();
    let authToken = sessionStorage.getItem('authToken');

    let getAdsRequest = {
        method: 'GET',
        url: `${kinveyBaseUrl}/user/${kinveyAppKey}/`,
        headers: {
            'Authorization': `Kinvey ${authToken}`,
            'Content-Type': 'application/json'
        },
        success: listedUsers,
        error: handleAjaxError
    };

    $.ajax(getAdsRequest);
    showSendMsgView();
}
function listedUsers(users) {
    for(let user of users){

        $('#msgRecipientUsername').append(`<option>${user.username}</option>`);
    }
}

function sendNewMsg(event) {
event.preventDefault();

    let recipient = $('#msgRecipientUsername').val();
    let text = $('#msgText').val();


    let username = sessionStorage.getItem("username");
    let name = sessionStorage.getItem("name");

    let newMsg = {
        sender_username: username,
        sender_name: name,
        recipient_username: recipient,
        text: text

    };



    let sendMsgRequest = {
        method: 'POST',
        url: `${kinveyBaseUrl}/appdata/${kinveyAppKey}/messages`,
        headers: {
            'Authorization': `Kinvey ${sessionStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(newMsg),
        success: myMsgView,
        error: handleAjaxError
    };

    $.ajax(sendMsgRequest)
        .then(() => {
            showInfoBox('Your message was sent');
        });

}




//https://baas.kinvey.com/appdata/app_id/messages?query={"recipient_username":"username"} <- My Msg

function myMsgList() {
    $('#myMessages').empty();
    let authToken = sessionStorage.getItem('authToken');
    let username = sessionStorage.getItem('username');
    let getAdsRequest = {
        method: 'GET',
        url: `${kinveyBaseUrl}/appdata/${kinveyAppKey}/messages?query={"recipient_username":"${username}"}`,
        headers: {
            'Authorization': `Kinvey ${authToken}`,
            'Content-Type': 'application/json'
        },
        success: myMessages,
        error: handleAjaxError
    };

    $.ajax(getAdsRequest);
}

function myMessages(msgs) {

    let table = $(`<table>
                        <tr>
                            <th>From</th>
                            <th>Message</th>
                            <th>Date</th>                          
                        </tr>
                    </table>`);


    for (let msg of msgs) {
        let date = msg._kmd.ect;
        function formatDate(dateISO8601) {
            let date = new Date(dateISO8601);
            if (Number.isNaN(date.getDate()))
                return '';
            return date.getDate() + '.' + padZeros(date.getMonth() + 1) +
                "." + date.getFullYear() + ' ' + date.getHours() + ':' +
                padZeros(date.getMinutes()) + ':' + padZeros(date.getSeconds());

            function padZeros(num) {
                return ('0' + num).slice(-2);
            }
        }

        let name = msg.sender_name;
        let username = msg.sender_username;

        function formatSender(name, username) {
            if (!name)
                return username;
            else
                return username + ' (' + name + ')';
        }


        table.append(`
            <tr>
                <td>${formatSender(name, username)}</td>
                <td>${msg.text}</td>
                <td>${formatDate(date)}</td>
            </tr>
        `);

        $('#myMessages').append(table);

        myMsgView();

    }
}

//___________


//User Account ________
function logoutUser() {
    sessionStorage.clear();
    showHideMenuLinks();
    showHomeView();
}

function loginUser (event) {
    let userData = {
        username: $('#formLogin input[name=username]').val(),
        password: $('#formLogin input[name=password]').val()
    };

    let loginUserRequest = {
        method: 'POST',
        url: `${kinveyBaseUrl}/user/${kinveyAppKey}/login`,
        headers: kinveyAppAuthHeaders,
        data: JSON.stringify(userData),
        success: loginSuccess,
        error: handleAjaxError
    };

    event.preventDefault();
    $.ajax(loginUserRequest)
        .then(() => {
        showInfoBox('You are logged in');
    });
}

function loginSuccess (userInfo) {
    saveAuthInSession(userInfo);
    showHideMenuLinks();
    showUserHomeView();

}



function registerUser (event) {
    let userData = {
        username: $('#formRegister input[name=username]').val(),
        password: $('#formRegister input[name=password]').val(),
        name:$('#formRegister input[name=name]').val()
    };

    let registerUserRequest = {
        method: 'POST',
        url: `${kinveyBaseUrl}/user/${kinveyAppKey}`,
        headers: kinveyAppAuthHeaders,
        data: JSON.stringify(userData),
        success: registerSuccess,
        error: handleAjaxError
    };
    event.preventDefault();
    $.ajax(registerUserRequest)
        .then(() => {
            showInfoBox('Regsitered successfully');
        });
}

function registerSuccess (userInfo) {
    saveAuthInSession(userInfo);
    showHideMenuLinks();
    showUserHomeView();
}



//________________



//___Buttons______


function attachButtonsEvents () {
    $('#formRegister').submit(registerUser);
    $('#formLogin').submit(loginUser);
    $('#formSendMessage').submit(sendNewMsg)

}


//________________

function showHomeView () {
    showView('viewAppHome');
}
function showLoginView() {
    showView('viewLogin')
}
function showRegisterView() {
    showView('viewRegister')
}

function showUserHomeView() {
    showView('viewUserHome');
    let user = sessionStorage.getItem('username');

    $('#viewUserHomeHeading').html(`Welcome, ${user}!`);

}

function myMsgView() {
    showView('viewMyMessages');
}

function showSendMsgView() {
    showView('viewSendMessage')
}

function showArchiveMsg() {
    showView('viewArchiveSent')
}
//_________

