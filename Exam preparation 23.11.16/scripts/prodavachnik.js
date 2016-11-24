const kinveyBaseUrl = 'https://baas.kinvey.com/';
const kinveyAppKey = 'kid_S1QHMH7Gl';
const kinveyAppSecret =  '59955932cb3342c4b87d98a7e06202db';
const base64Auth = btoa(`${kinveyAppKey}:${kinveyAppSecret}`);
const kinveyAppAuthHeaders = {
    'Authorization' : `Basic ${base64Auth}`,
    'Content-Type' : 'application/json'
};



function startApp() {

    showHideMenu();
    $('#linkRegister').click(showRegisterView);
    $('#linkLogin').click(showViewLogin);
    $('#linkHome').click(showHomeView);
    $('#linkListAds').click(listAds);

    $('#buttonRegisterUser').click(registerUser);
    $('#linkLogout').click(logout);
    $('#buttonLoginUser').click(loginUser);
    $('#linkCreateAd').click(showViewCreate)

}
function showHideMenu() {
    if(sessionStorage.getItem("authToken")){
        $('#linkHome').show();
        $('#linkLogin').hide();
        $('#linkRegister').hide();
        $('#linkListAds').show();
        $('#linkCreateAd').show();
        $('#linkLogout').show();
    }else{
        $('#linkHome').show();
        $('#linkLogin').show();
        $('#linkRegister').show();
        $('#linkListAds').hide();
        $('#linkCreateAd').hide();
        $('#linkLogout').hide();
    }
}




function showView(viewName) {

    $("main >*").hide();

    $(`#${viewName}`).show();

}


function showRegisterView() {

    showView('viewRegister');
}

function showViewLogin() {

    showView('viewLogin');
}

function showHomeView() {

    showView('viewHome')
}

function showAdsView() {

    showView('viewAds')
}

function showViewCreate() {

    showView('viewCreateAd');
}

function listAds() {

        $('#books').empty();
        showView('viewBooks');
        $.ajax({
            method: "GET",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/ads",
            headers: {
                'Authorization' : `Kinvey ${authToken}`,
                'Content-Type' : `application/json`
            },
            success: loadAdds,
            error: handleAjaxError
        });

}
function loadAdds() {

}

function registerUser() {

        let userData = {
            username: $('#formRegister input[name=username]').val(),
            password: $('#formRegister input[name=passwd]').val()
        };
        let regajax = {
            method: "POST",
            url: kinveyBaseUrl + "user/" + kinveyAppKey + "/",
            headers: kinveyAppAuthHeaders,
            data: JSON.stringify(userData),
            success: registerSuccess,
            error: handleAjaxError
        };
        console.log(userData);
        $.ajax(regajax);

    function registerSuccess(userInfo) {
        saveAuthInSession(userInfo);
        showHideMenu();
        showHomeView();
    }
}

function saveAuthInSession(userInfo) {
    sessionStorage.setItem('authToken', userInfo._kmd.authtoken);

    sessionStorage.setItem('userId', userInfo._id);

}


function handleAjaxError(response) {
    console.log(response);
}

function logout() {
    sessionStorage.clear();
    showHideMenu();
    showHomeView();
}

function loginUser() {
    let userData = {
        username: $('#formLogin input[name=username]').val(),
        password: $('#formLogin input[name=passwd]').val()
    };


    let loginreq = {
        method: "POST",
        url: kinveyBaseUrl + "user/" + kinveyAppKey + "/login",
        headers: kinveyAppAuthHeaders,
        data: JSON.stringify(userData),
        success: loginSuccess,
        error: handleAjaxError
    };
    $.ajax(loginreq);
}

function loginSuccess(userInfo) {
    saveAuthInSession(userInfo);
    showAdsView();
    showHideMenu();

}
