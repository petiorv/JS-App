// $.get('https://petiorvmessenger.firebaseio.com/messenger.json')
//     .then((response) => {
//         console.log(response)
//     });

$('#submit').click(send);
$('#refresh').click(refressh);

let hostUrl = 'https://petiorvmessenger.firebaseio.com/messenger.json';

function send() {
    let message = {
        author: $('#author').val(),
        content: $('#content').val(),
        timestamp: Date.now()
    };

    $.post(hostUrl, JSON.stringify(message))
        .then(refressh)
}

function refressh() {
    $.get(hostUrl)
        .then((result)=>{
            $('#messages').empty();
            let keys = Object.keys(result).sort((m1, m2)=>result[m1].timestamp - result[m2].timestamp)
            for(let msg of keys){
                 $('#messages').append(`${result[msg].author}: ${result[msg].content}\n`)
            }
        })
}