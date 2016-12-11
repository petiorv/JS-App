const kinveyBaseUrl = 'https://baas.kinvey.com';
const kinveyAppKey = 'kid_B1Z36CWfl';
const kinveyAppSecret = 'f37a819a4cb44857addcd4eaeecee717';
const base64auth = btoa(`${kinveyAppKey}:${kinveyAppSecret}`);
const kinveyAppAuthHeaders = {
    'Authorization': `Basic ${base64auth}`,
    'Content-Type': 'application/json'
};

// Forms
let editBookForm;
let createBookForm;
let loginForm;
let registerForm;

// Notifications
let loadingBox;
let errorBox;
let infoBox;

// Sections
let homeViewSection;
let createBookSection;
let editBookSection;
let loginSection;
let registerSection;
let booksSection;

// Books container
let booksContainer;

// Menu links
let homeLink;
let listBooksLink;
let createBookLink;
let logoutLink;
let loginLink;
let registerLink;

function startApp () {
    // Attach elements to variables    
    // Forms
    editBookForm = $('#formEditBook');
    createBookForm = $('#formCreateBook');
    loginForm = $('#formLogin');
    registerForm = $('#formRegister');

    // Notifications
    loadingBox = $('#loadingBox');
    errorBox = $('#errorBox');
    infoBox = $('#infoBox');

    // Sections
    homeViewSection = $('#viewHome');
    booksSection = $('#viewBooks');
    createBookSection = $('#viewCreateBook');
    editBookSection = $('#viewEditBook');
    loginSection = $('#viewLogin');
    registerSection = $('#viewRegister');

    // Books container
    booksContainer = $('#books');

    // Menu links
    homeLink = $("#linkHome");
    listBooksLink = $("#linkListBooks");
    createBookLink = $("#linkCreateBook");
    logoutLink = $("#linkLogout");
    loginLink = $("#linkLogin");
    registerLink = $("#linkRegister");

    // Bind the navigation menu links
    homeLink.click(showHomeView);
    loginLink.click(showLoginView);
    registerLink.click(showRegisterView);
    listBooksLink.click(listBooks);
    createBookLink.click(showCreateBookView);
    logoutLink.click(logoutUser);

    sessionStorage.clear();
    showHideMenuLinks();
    showView('viewHome');

    // Bind the form submit buttons
    $("#buttonLoginUser").click(loginUser);
    $("#buttonRegisterUser").click(registerUser);
    $("#buttonCreateBook").click(createBook);
    $("#buttonEditBook").click(editBook);

    // Bind the info / error boxes: hide on click
    errorBox.click(function() {
        $("#errorBox").slideUp();
    });

    // Attach AJAX "loading" event listener
    $(document).on({
        ajaxStart: function () {
            $('main').hide();
             $('#loader').show();
        },
        ajaxStop: function () {
             $('#loader').hide();
              $('main').fadeIn(500);
        }
    });

    function showHideMenuLinks () {
        homeLink.show();
        if (sessionStorage.getItem('authToken')) {
            // We have logged in user
            loginLink.hide();
            registerLink.hide();
            listBooksLink.show();
            createBookLink.show();
            logoutLink.show();
        } else {
            // No logged in user
            loginLink.show();
            registerLink.show();
            listBooksLink.hide();
            createBookLink.hide();
            logoutLink.hide();
        }
    }

    function showView (viewName) {
        // Hide all views and show the selected view only
        hideAllViews();

        switch (viewName) {
            case 'viewHome':
                homeViewSection.show();
                break;
            case 'viewBooks':
                booksSection.show();
                break;
            case 'viewLogin':
                loginSection.show();
                break;
            case 'viewRegister':
                registerSection.show();
                break;
            case 'viewEditBook':
                editBookSection.show();
                break;
            case 'viewCreateBook':
                createBookSection.show();
                break;
        }
    }

    function hideAllViews () {
        homeViewSection.hide();
        booksSection.hide();
        createBookSection.hide();
        editBookSection.hide();
        loginSection.hide();
        registerSection.hide();
    }

    function showHomeView () {
        showView('viewHome');
    }

    function showLoginView () {
        showView('viewLogin');
        loginForm.trigger('reset');
    }

    function showRegisterView () {
        registerForm.trigger('reset');
        showView('viewRegister');
    }

    function showCreateBookView () {
        createBookForm.trigger('reset');
        showView('viewCreateBook');
    }

    function loginUser () { 
        let userData = {
            username: loginForm.find('input[name=username]').val(),
            password: loginForm.find('input[name=passwd]').val()
        };

        $.ajax({
            method: "POST",
            url: `${kinveyBaseUrl}/user/${kinveyAppKey}/login`,
            headers: kinveyAppAuthHeaders,
            data: JSON.stringify(userData),
            success: loginSuccess,
            error: handleAjaxError
        });

        function loginSuccess (userInfo) {
            saveAuthInSession(userInfo);
            showHideMenuLinks();
            listBooks();
            showInfo('Login successful.');
        }
    }

    function registerUser () { 
        let userData = {
            username: registerForm.find('input[name=username]').val(),
            password: registerForm.find('input[name=passwd]').val()
        };
        $.ajax({
            method: 'POST',
            url: `${kinveyBaseUrl}/user/${kinveyAppKey}`,
            headers: kinveyAppAuthHeaders,
            data: JSON.stringify(userData),
            success: registerSuccess,
            error: handleAjaxError
        });

        function registerSuccess (userInfo) {
            saveAuthInSession(userInfo);
            showHideMenuLinks();
            listBooks();
            showInfo('User registration successful.');
        }
    }

    function saveAuthInSession (userInfo) {
        sessionStorage.setItem('authToken', userInfo._kmd.authtoken);
        sessionStorage.setItem('userId',  userInfo._id);
        $('#loggedInUser').text(`Welcome, ${userInfo.username}!`);
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

    function showInfo (message) {
        infoBox.text(message);
        infoBox.show();
        setTimeout(function() {
            infoBox.fadeOut();
        }, 4000);
    }

    function showError (errorMsg) {
        errorBox.text("Error: " + errorMsg);
        errorBox.slideDown(1000);
    }

    function logoutUser () { 
        sessionStorage.clear();
        $('#loggedInUser').text("");
        showHideMenuLinks();
        showView('viewHome');
        showInfo('Logout successful.');
    }

    function listBooks (event) {
        booksContainer.empty();
        listBooksLink.unbind('click');
        let authToken = sessionStorage.getItem('authToken');
        showView('viewBooks');
        let getBooksRequest = {
            method: 'GET',
            url: `${kinveyBaseUrl}/appdata/${kinveyAppKey}/books`,
            headers: {
                'Authorization': `Kinvey ${authToken}`
            },
            success: displayBooks,
            error: handleAjaxError
        };

        $.ajax(getBooksRequest);
    }

    function displayBooks (books) {
        let table = $(`<table>
                        <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>`);
        for (let book of books) {
            let tr = $(`<tr data-book-id="${book._id}">`);
            let titleCol = $('<td>').text(book.title);
            let authorCol = $('<td>').text(book.author);
            let descriptionCol = $('<td>').text(book.description);

            tr.append(titleCol)
                .append(authorCol)
                .append(descriptionCol)
            
            if (book._acl.creator === sessionStorage.getItem('userId')) {
                let actionsTd = $('<td>');
                let deleteButton = $('<a class="delete-book-btn" href="#"></a>')
                                    .text('[Delete] ').attr('data-book-id', book._id);
                let editButton = $('<a class="edit-book-btn" href="#"></a>')
                                    .text(' [Edit]').attr('data-book-id', book._id);
                actionsTd.append(deleteButton).append(editButton);
                tr.append(actionsTd);
            } else {
                tr.append($('<td>'));
            }

            table.append(tr);
        }

        booksContainer.append(table);
        attachBookEvents();
        listBooksLink.bind('click', listBooks)
    }

    function attachBookEvents () {
        $('.delete-book-btn').click(deleteBook);
        $('.edit-book-btn').click(loadBookForEdit);
    }

    function loadBookForEdit (event) {
        let authToken = sessionStorage.getItem('authToken');
        let bookId = $(event.currentTarget).attr('data-book-id');
        let getBookRequest = {
            method: 'GET',
            url: `${kinveyBaseUrl}/appdata/${kinveyAppKey}/books/${bookId}`,
            headers: {
                'Authorization': `Kinvey ${authToken}`,
                'Content-Type': 'application/json'
            },
            success: displayBookInEditForm,
            error: handleAjaxError
        };

        $.ajax(getBookRequest);
    }

    function displayBookInEditForm (book) {
        editBookForm.find('input[name=id]').val(book._id);
        editBookForm.find('input[name=title]').val(book.title);
        editBookForm.find('input[name=author]').val(book.author);
        editBookForm.find('textarea[name=descr]').val(book.description);
        showView('viewEditBook');
    }

    function createBook () {
        let newBook = {
            title: createBookForm.find('input[name=title]').val(),
            author: createBookForm.find('input[name=author]').val(),
            description: createBookForm.find('textarea[name=descr]').val()
        };

        let authToken = sessionStorage.getItem('authToken');

        let createBookRequest = {
            method: 'POST',
            url: `${kinveyBaseUrl}/appdata/${kinveyAppKey}/books`,
            headers: {
                'Authorization': `Kinvey ${authToken}`,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(newBook),
            success: listBooks,
            error: handleAjaxError
        };

        $.ajax(createBookRequest)
            .then(function () {
                showInfo('Book successfully created');
            });

    }

    function editBook (event) {
        let authToken = sessionStorage.getItem('authToken');
        let editBookForm = $('#formEditBook');
        let bookId = editBookForm.find('input[name=id]').val();
        let bookTitle = editBookForm.find('input[name=title]').val();
        let bookAuthor = editBookForm.find('input[name=author]').val();
        let bookDescription = editBookForm.find('textarea[name=descr]').val();
        let newBook = {
            title: bookTitle,
            author: bookAuthor,
            description: bookDescription
        };
        
        let updatedBookRequest = {
            method: 'PUT',
            url: `${kinveyBaseUrl}/appdata/${kinveyAppKey}/books/${bookId}`,
            headers: {
               'Authorization': `Kinvey ${authToken}`,
               'Content-Type': 'application/json' 
            },
            data: JSON.stringify(newBook),
            success: listBooks,
            error: handleAjaxError
        };

        $.ajax(updatedBookRequest)
            .then(function () {
                showInfo('Book successfully updated');
            });
    }

    function deleteBook (event) {
        let authToken = sessionStorage.getItem('authToken');
        let bookId = $(event.currentTarget).attr('data-book-id');
        let deleteBookRequest = {
            method: 'DELETE',
            url: `${kinveyBaseUrl}/appdata/${kinveyAppKey}/books/${bookId}`,
            headers: {
                'Authorization': `Kinvey ${authToken}`
            },
            success: listBooks,
            error: handleAjaxError
        };

        $.ajax(deleteBookRequest)
            .then(function () {
                showInfo('Book successfully deleted');
            });
    }
}

// attach loader to the body
$(document).ready( function () {
  var id = 'loader', fill = '#979696',
      size = 30, radius = 3, duration = 1000,
      maxOpacity = 1, minOpacity = 0.15;
  $('<svg id="'+id+'" width="'+(size*3.5)+'" height="'+size+'">' + 
   		'<rect width="'+size+'" height="'+size+'" x="0" y="0" rx="'+radius+'" ry="'+radius+'" fill="'+fill+'" fill-opacity="'+maxOpacity+'">' + 
   			'<animate attributeName="opacity" values="1;'+minOpacity+';1" dur="'+duration+'ms" repeatCount="indefinite"/>' + 
   		'</rect>' + 
    	'<rect width="'+size+'" height="'+size+'" x="'+(size*1.25)+'" y="0" rx="'+radius+'" ry="'+radius+'" fill="'+fill+'" fill-opacity="'+maxOpacity+'">' + 
    		'<animate attributeName="opacity" values="1;'+minOpacity+';1" dur="'+duration+'ms" begin="'+(duration/4)+'ms" repeatCount="indefinite"/>' + 
    	'</rect>' + 
    	'<rect width="'+size+'" height="'+size+'" x="'+(size*2.5)+'" y="0" rx="'+radius+'" ry="'+radius+'" fill="'+fill+'" fill-opacity="'+maxOpacity+'">' + 
    		'<animate attributeName="opacity" values="1;'+minOpacity+';1" dur="'+duration+'ms" begin="'+(duration/2)+'ms" repeatCount="indefinite"/>' + 
    	'</rect>' + 
   	'</svg>').appendTo('body');
    $('#loader').hide();
});
