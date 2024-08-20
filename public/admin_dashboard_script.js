$(document).ready(function() {
  // Toggle existing cars table
  $('#toggleCars').on('click', function() {
    $('#existingCars').toggle();
  });

  // Handle Add Car
  $('#addCarForm').on('submit', function(e) {
    e.preventDefault();
    $.ajax({
      type: 'POST',
      url: '/add-car',
      data: $(this).serialize(),
      success: function(response) {
        $('#addCarResult').html('<p>Car added successfully!</p>');
        location.reload(); // Reload page to show updated car list
      },
      error: function() {
        $('#addCarResult').html('<p>Error adding car.</p>');
      }
    });
  });

  // Handle Delete Car
  $('#deleteCarForm').on('submit', function(e) {
    e.preventDefault();
    $.ajax({
      type: 'POST',
      url: '/delete-car',
      data: $(this).serialize(),
      success: function(response) {
        $('#deleteCarResult').html('<p>Car deleted successfully!</p>');
        location.reload(); // Reload page to show updated car list
      },
      error: function() {
        $('#deleteCarResult').html('<p>Error deleting car.</p>');
      }
    });
  });

  // Handle Search Car
  $('#search-form').on('submit', function(event) {
    event.preventDefault();
    const form = $(this);
    $.ajax({
      type: 'GET',
      url: form.attr('action'),
      data: form.serialize(),
      success: function(cars) {
        const searchResults = $('#search-results');
        searchResults.empty();
        if (cars.length > 0) {
          cars.forEach(car => {
            searchResults.append(`
              <li>
                ${car.make} ${car.model} (${car.year}) - License: ${car.licenseNumber}
                <br> Rent Rate: ${car.rentRate} 
                <br> Location: ${car.location}
                <br> Customer ID: ${car.customerId}
                <br> Status: ${car.status}
                <br> Start Date: ${car.startDate ? new Date(car.startDate).toLocaleDateString() : ''}
                <br> End Date: ${car.endDate ? new Date(car.endDate).toLocaleDateString() : ''}
              </li>
            `);
          });
        } else {
          searchResults.append('<li>No records found</li>');
        }
      },
      error: function() {
        alert('Error searching for cars');
      }
    });
  });

  // Logout button functionality
  $('#logout-button').on('click', function() {
    window.location.href = '/';
  });
});