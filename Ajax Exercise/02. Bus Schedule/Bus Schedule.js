function solve() {
    let hostUrl = 'https://judgetests.firebaseio.com/schedule/';
    let name = '';
    let nextId = 'depot';
        function depart() {
            $('#depart').prop('disabled', true);
            $('#arrive').prop('disabled', false);

            $.get(hostUrl+nextId+'.json')
                .then((response)=> {
                    console.log(response);
                    name = response.name;
                    nextId = response.next;
                $('#info').find('span').text(`Next stop ${name}`)

            })
                .catch(()=>{
                    "use strict";

                });

        }
        function arrive() {
            $('#depart').prop('disabled', false);
            $('#arrive').prop('disabled', true);

            $.get(hostUrl+nextId+'.json')
                .then((response)=> {
                    $('#info').find('span').text(`Arrive at ${name}`);
                });
        }
        return {
            depart,
            arrive
        };
    }
