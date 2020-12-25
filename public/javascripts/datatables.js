/*===== DATATABLES  =====*/
$(document).ready(function () {
    $('#doctors-table').DataTable();
    var $input = $('.dataTables_filter label > input');
    $input.parent().after($input);
    $('.dataTables_wrapper input[type=search]').attr("placeholder", "Search");
});

$(document).ready(function () {
    $('#patients-table').DataTable();
    var $input = $('.dataTables_filter label > input');
    $input.parent().after($input);
    $('.dataTables_wrapper input[type=search]').attr("placeholder", "Search");
});

$(document).ready(function () {
    $('#appointment-table').DataTable();
    var $input = $('.dataTables_filter label > input');
    $input.parent().after($input);
    $('.dataTables_wrapper input[type=search]').attr("placeholder", "Search");
});

$(document).ready(function () {
    $('#specialities-table').DataTable();
    var $input = $('.dataTables_filter label > input');
    $input.parent().after($input);
    $('.dataTables_wrapper input[type=search]').attr("placeholder", "Search");
});