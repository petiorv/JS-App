function getInfo() {
    let busesUl =$('#buses');
    let stopNameCont = $('#stopName');
    let stopId = $('#stopId').val();

    let request = {
        url: `https://judgetests.firebaseio.com/businfo/${stopId}.json`,
        method: 'GET'
    };

    $.ajax(request)
        .then(displayInfo)
        .catch(displayError);


    function displayInfo(request) {
        busesUl.empty();
        stopNameCont.text(request.name);

        for(let index in request.buses){
            let li = $(`<li>Bus ${index} arrives in ${request.buses[index]} minutes</li>`);
            busesUl.append(li);
        }
       }

    
    function displayError() {
        stopNameCont.text('Error');
    }

}
