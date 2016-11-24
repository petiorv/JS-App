$(document).ready(function () {

    const kinveyAppId = 'kid_ryYx-jXGe';
    const serviceUrl = 'https://baas.kinvey.com/appdata/' + kinveyAppId;
    const appId = 'kid_B1iu1jo-l';
    const appSecret = 'c1318fed59974df498964a7158d85bcc';
    const username = 'peter';
    const password = 'p';
    const base64auth = btoa(`${username}:${password}`);
    const authHeaders = {
        Authorization: 'Basic ' + base64auth
    };

   $('#btnLoadPosts').click(loadPostClicked);

    function loadPostClicked() {
        let getPostReq = {
            method: 'GET',
            url: serviceUrl+ '/posts',
            headers: authHeaders
        };
        $.ajax(getPostReq)
            .then(displayPostInDropDown)
            .catch(displayError)
    }
    function displayPostInDropDown(posts) {
       for(let post of posts){
           let option = $('<option>');
           option.text(post.title);
           option.val(post._id);
           $('#posts').append(option);
       }
    }

    function displayError(err) {

        let errDiv = $('<div>').text('Error: '+ err.status+ '(' + err.statusText +  '+');

        $(document.body).prepend(errDiv);
        setTimeout(function () {
            errDiv.fadeOut(function () {errDiv.remove()})
        }, 2000)
    }
});