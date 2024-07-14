var clientes = [];
var requests = 0;

function loadClients() {
    $('#exporting').show();
    clientes = [];
    const token = $('#message').val();

    if (!token) {
        alert('Access token no puede ser nulo');
        return;
    }
    fetchClients(token);

}

function fetchClients(token, url = null) {
    if (!url) url = 'https://app.trengo.eu/api/v2/contacts?page=1';
    $.ajax({
        url,
        beforeSend: function(xhr) {
             xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        }, success: function(data){
            result = data.data;
            clientes = clientes.concat(result);

            if (data.links?.next) {
                setTimeout(() => {
                    fetchClients(token, data.links.next)
                    console.log('API Request: ', data.links.next);
                }, 1500);
            } else {
                // no more pages
                // clientes = result.map(cliente => {
                //     return {id: cliente.id, name: cliente.name, email: cliente.email};
                // });
                const csvData = convertToCSV(clientes);
                const formattedTodayDate = getFormattedDate();
                downloadCSV(csvData, `Clientes Trengo ${formattedTodayDate}.csv`);
                // process the JSON data etc
            }
            
        }
    })
}

function convertToCSV(jsonData) {
    const jsonArray = typeof jsonData !== 'object' ? JSON.parse(jsonData) : jsonData;
    let csv = '';
    
    // Extract the headers from the JSON object
    const headers = Object.keys(jsonArray[0]);
  
    // Append the headers to the CSV string
    csv += headers.join(',') + '\n';
  
    // Iterate over the JSON array
    jsonArray.forEach(item => {
      let row = [];
  
      // Iterate over each property of the object
      for (let header of headers) {
        row.push(item[header]);
      }
  
      // Append the row to the CSV string
      csv += row.join(',') + '\n';
    });
  
    return csv;
  }
  
  function downloadCSV(csvData, fileName) {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  
    if (navigator.msSaveBlob) { // For IE
      navigator.msSaveBlob(blob, fileName);
    } else {
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
    $('#exporting').hide();
  }
  
  function getFormattedDate() {
    const today = new Date();
    let day = today.getDate();
    let month = today.getMonth() + 1;
    const year = today.getFullYear();
  
    // Add zero at the beginning if day is a single number
    if (day < 10) {
      day = '0' + day;
    }
    if (month < 10) {
      month = '0' + month;
    }
  
    return day + '-' + month + '-' + year;
  }
  