// http://localhost/project2

// ----------------------------------------------------------------------- MAIN SCRIPT ----------------------------------------------------------------------------------------- 
$(window).on("load", function () {
    if ($("#preloader").length) {
        $("#preloader")
            .delay(1000)
            .fadeOut("slow", function () {
                $(this).remove();
            });
    }
});

function getType() {
    let type = $(".active");
    return type[0].title;
}

$(document).ready(function () {
    //Disable forms submit on enter
    $(window).keydown(function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            return false;
        }
    });

    getAllPersonnel();
    getAllDepartments();
    getAllLocations();
    filter();
    filterByInput();
    $(".company-tabs").html("Personnel");

    // TABS
    // display personnel table on personnel tab click
    $("#personnel-btn").click(function () {
        $("#department-table").hide();
        $("#location-table").hide();
        $("#personnel-table").show();
        $("#department-btn").removeClass("active");
        $("#location-btn").removeClass("active");
        $(this).addClass("active");
        resetForm(`${getType()}-add`);
        resetForm(`${getType()}-edit`);
        $(".company-tabs").html("Personnel");
    });

    // display department table on department tab click
    $("#department-btn").click(function () {
        $("#personnel-table").hide();
        $("#location-table").hide();
        $("#department-table").show();
        $("#personnel-btn").removeClass("active");
        $("#location-btn").removeClass("active");
        $(this).addClass("active");
        resetForm(`${getType()}-add`);
        resetForm(`${getType()}-edit`);
        $(".company-tabs").html("Departments");
    });

    // display location table on location tab click
    $("#location-btn").click(function () {
        $("#personnel-table").hide();
        $("#department-table").hide();
        $("#location-table").show();
        $("#personnel-btn").removeClass("active");
        $("#department-btn").removeClass("active");
        $(this).addClass("active");
        resetForm(`${getType()}-add`);
        resetForm(`${getType()}-edit`);
        $(".company-tabs").html("Locations");
    });

    // REFRESH BUTTON
    // refresh tables on refresh button click
    $("#refresh-btn").click(function () {
        getAllPersonnel();
        getAllDepartments();
        getAllLocations();
        filter();
        filterByInput();

        resetForm(`${getType()}-add`);
        resetForm(`${getType()}-edit`);
    });

    // FILTER FUNCTION

    //searchbar event listener:
    function filterByInput() {
        let delay;
        $("#filter-input").on("input", function () {
            const employee = $("#filter-input").val();
            const department = $("#department-filter").val();
            const location = $("#location-filter").val();
            clearTimeout(delay);

            delay = setTimeout(function () {
                getFilterPersonnel(employee, department, location);
            })
        });
    }

    function filterByDepartmentOrLocation() {
        let delay;
        const employee = $("#filter-input").val();
        const department = $("#department-filter").val();
        const location = $("#location-filter").val();
        clearTimeout(delay);

        delay = setTimeout(function () {
            getFilterPersonnel(employee, department, location);
        })
    }

    $(document).on("change", "#department-filter", function () {
        filterByDepartmentOrLocation();
    })

    $(document).on("change", "#location-filter", function () {
        filterByDepartmentOrLocation();
    })

    // ADD FUNCTION
    // display add modal on add button click
    $("#add-btn").click(function () {
        resetForm(`${getType()}-add`);
        addModal(getType());
    });
    // get location on department change
    $(document).on("change", `#${getType()}-add-form #${getType()}-add-department`, function () {
        let departmentId = $(`#${getType()}-add-department`).val();
        $(`#${getType()}-add-location`).html(
            getLocationByDepartmentId(departmentId, `${getType()}-add-location`)
        );
    });

    // add record on add-submit button click
    $(".add-submit-btn").click(function () {
        let type = getType();
        validateForm(`${type}-add`);
        addRecord(type);
        filter();
        filterByInput();
    });

    // EDIT FUNCTION
    // display edit modal on edit button click
    $(document).on("click", "tbody tr .edit-btn", function () {
        let id = $(this).parent().parent().parent().attr("class");
        editModal(getType(), id);
    });
    // get location on department change
    $(document).on("change", `#${getType()}-edit-form #${getType()}-edit-department`, function () {
        let departmentId = $(`#${getType()}-edit-department`).val();
        $(`#${getType()}-edit-location`).html(
            getLocationByDepartmentId(departmentId, `${getType()}-edit-location`)
        );
    });
    // edit record on edit-submit button click
    $(document).on("click", ".edit-submit-btn", function () {
        let type = getType();
        let id = $(`#${type}-edit-id`).html();
        validateForm(`${type}-edit`);
        editRecord(type, id);
        filter();
        filterByInput();
    });

    //DELETE FUNCTION
    // display delete modal on delete button clicked
    $(document).on("click", "tbody tr .delete-btn", function () {
        let id = $(this).parent().parent().parent().attr("class");
        let first = $(this).parent().parent().siblings().next().html();
        let last = $(this).parent().parent().siblings().html();
        deleteModal(getType(), id, first, last);
    });
    // delete record on confirmation
    $(document).on("click", "#delete-modal-yes", function () {
        let id = $("#delete-id").html();
        const check = false;
        deleteRecord(getType(), id, check);
        filter();
        filterByInput();
    });
});

// ----------------------------------------------------------------------------FORM SCRIPT-----------------------------------------------------------------------------

function validateForm(formId) {
    resetForm(formId);

    // get form inputs as object
    let inputs = $(`#${formId}-form .form-required`);

    for (const [key, obj] of Object.entries(inputs)) {
        if (obj.value == "") {
            $(`#${obj.id}`)
                .addClass("border-danger")
                .siblings()
                .append(
                    '<span class="text-danger form-response">Field Required!</span>'
                );
        }
    }

    //add alert message if any form-response present
    if ($(`#${formId}-form .form-response`).length > 0) {
        displayAlert(formId, 400, "Form Invalid!");
    }
}

// reset form

function resetForm(formId) {
    //reset form alert
    $(`#${formId}-alert`).html("");

    // reset form response text and border color
    $(`#${formId}-form .form-response`).remove();
    $(`#${formId}-form .form-required`).removeClass("border-danger");
}

// ----------------------------------------------------------------------------DISPLAY SCRIPT-----------------------------------------------------------------------------

//create and display alert
function displayAlert(displayId, status, message) {
    if (status != 200) {
        $(`#${displayId}-alert`).html(
            `<div class="alert alert-dismissible fade show alert-danger" role="alert">${message}</div>`
        );
    } else {
        $(`#${displayId}-alert`).html(
            `<div class="alert alert-dismissible fade show alert-success" role="alert">${message}</div>`
        );
    }
}

// Deletion confirmation alert
function displayCheck(displayId) {
    $(`#${displayId}-alert`).html(`
      <h6 class="my-2">Are you sure you wish to delete record?</h6>`);

    $(`#${displayId}-footer`).html(`
      <button id="delete-modal-yes" class="btn btn-success">Yes</button>
      <button id="delete-modal-no" class="btn btn-danger" data-dismiss="modal">No</button>`).show();
}

// create and display options
function displayOptions(object, selectedValue, filter, filterPlace) {
    let content = "";
    if (selectedValue == 0 && filter == "filter") {
        content += `<option selected hidden value="">${filterPlace}</option>`;
    } else if (selectedValue == 0) {
        content += '<option selected hidden value="">Select...</option>';
    }
    for (const [key, value] of Object.entries(object.data)) {
        if (value.id == selectedValue) {
            content += `<option value="${value.id}" selected>${value.name}</option>`;
        } else {
            content += `<option value="${value.id}">${value.name}</option>`;
        }
    }
    return content;
}

// change selected value to
function displaySelected(selectId, selectedValue) {
    let options = $(`#${selectId} option`);
    let selected = selectedValue;
    let content = "";

    $(`#${selectId} option:selected`).attr("selected", false);

    for (let i = 0; i < options.length; i++) {
        if (options[i].value == selected) {
            content += `<option value="${options[i].value}" selected>${options[i].innerHTML}</option>`;
        } else {
            content += `<option value="${options[i].value}">${options[i].innerHTML}</option>`;
        }
    }
    return content;
}

function addModal(type) {
    switch (type) {
        case "personnel":
            $("#personnel-add-form input").val("");
            $("#personnel-add-department").html(getUniqueDepartments(0));
            $("#personnel-add-location").html(getUniqueLocations(0));
            $("#personnel-add-modal").modal("show");
            break;

        case "department":
            $("#department-add-form input").val("");
            $("#department-add-location").html(getUniqueLocations(0));
            $("#department-add-modal").modal("show");
            break;

        case "location":
            $("#location-add-form input").val("");
            $("#location-add-modal").modal("show");
            break;
    }
}

function editModal(type, id) {
    switch (type) {
        case "personnel":
            $("#personnel-edit-id").html(id)
            getPersonnelById(id, "personnel-edit-location");
            break;

        case "department":
            $("#department-edit-id").html(id)
            getDepartmentById(id);
            break;

        case "location":
            $("#location-edit-id").html(id);
            getLocationById(id);
            break;
    }
}

function deleteModal(type, id, first, last) {
    const check = true;
    let content = "";
    switch (type) {
        case "personnel":
            $("#delete-type").html(`${last} ${first}`);
            $("#delete-id").html(id);
            content = displayCheck("delete");
            break;

        case "department":
            $("#delete-type").html(`${last}`);
            $("#delete-id").html(id);
            content = deleteRecord(type, id, check);
            break;

        case "location":
            $("#delete-type").html(`${last}`);
            $("#delete-id").html(id);
            content = deleteRecord(type, id, check);
            break;
    }
    $("#delete-alert").html(content);
    $("#delete-modal").modal("show");
}

function filter() {
    $("#filter-input").val("");
    $("#department-filter").html(getUniqueDepartments(0, "filter", "Departments"));
    $("#location-filter").html(getUniqueLocations(0, "filter", "Locations"));
}

// ----------------------------------------------------------------------------CREATE SCRIPT-----------------------------------------------------------------------------

function addRecord(type) {
    let addObj = {
        first: $(`#add-first`).val(),
        last: $(`#add-last`).val(),
        title: $(`#add-title`).val(),
        email: $(`#add-email`).val(),
        department: $(`#${type}-add-department`).val(),
        location: $(`#${type}-add-location`).val(),
    };

    switch (type) {
        case "personnel":
            if (
                addObj.first != "" &&
                addObj.last != "" &&
                addObj.title != "" &&
                addObj.email != "" &&
                addObj.department != ""
            ) {
                addPersonnel(addObj, type);
            }
            break;

        case "department":
            if (addObj.department != "" && addObj.location != "") {
                addDepartment(addObj, type);
            }
            break;

        case "location":
            if (addObj.location != "") {
                addLocation(addObj, type);
            }
            break;
    }
}


// add personnel function

function addPersonnel(addObj, type) {
    $.ajax({
        async: true,
        global: false,
        type: "POST",
        url: "php/insertPersonnel.php",
        dataType: "json",
        data: {
            firstName: addObj.first,
            lastName: addObj.last,
            jobTitle: addObj.title,
            email: addObj.email,
            department: addObj.department,
        },
        success: function (results) {
            displayAlert(`${type}-add`, results.status.code, results.status.description);
            getAllPersonnel();
        },
        error: function () {
            console.log("Add personnel error occured");
        },
    });
}

function addDepartment(addObj, type) {
    $.ajax({
        async: true,
        global: false,
        type: "POST",
        url: "php/insertDepartment.php",
        dataType: "json",
        data: {
            department: addObj.department,
            location: addObj.location,
        },
        success: function (results) {
            displayAlert(`${type}-add`, results.status.code, results.status.description);
            getAllDepartments();
        },
        error: function () {
            console.log("Add department error occured");
        },
    });
}

function addLocation(addObj, type) {
    $.ajax({
        async: true,
        global: false,
        type: "POST",
        url: "php/insertLocation.php",
        dataType: "json",
        data: {
            location: addObj.location,
        },
        success: function (results) {
            displayAlert(`${type}-add`, results.status.code, results.status.description);
            getAllLocations();
        },
        error: function () {
            console.log("Error occured adding location!");
        },
    });
}

// ----------------------------------------------------------------------------DELETE SCRIPT-----------------------------------------------------------------------------

function deleteRecord(type, id, check) {
    switch (type) {
        case "personnel":
            if (id != "") {
                deletePersonnel(id);
            }
            break;

        case "department":
            if (id != "") {
                if (check) {
                    checkDepartment(id);
                } else {
                    deleteDepartment(id);
                }
            }
            break;

        case "location":
            if (id != "") {
                if (check) {
                    checkLocation(id);
                } else {
                    deleteLocation(id);
                }
            }
            break;
    }
}

function deletePersonnel(deleteId) {
    $.ajax({
        async: true,
        global: false,
        type: "POST",
        url: "php/deletePersonnelByID.php",
        dataType: "json",
        data: {
            employeeId: deleteId,
        },
        success: function (results) {
            displayAlert("delete", results.status.code, results.status.description);
            getAllPersonnel();
        },
        error: function () {
            console.log("Error occured deleting personnel record!");
        },
    });
}

function checkDepartment(deleteId) {
    $("#delete-footer").hide();
    $.ajax({
        async: true,
        global: false,
        type: "POST",
        url: "php/checkDepartmentByID.php",
        dataType: "json",
        data: {
            departmentId: deleteId,
        },
        success: function (results) {
            if (results.status.code != 200) {
                displayAlert("delete", results.status.code, results.status.description);
            } else {
                displayCheck("delete");
            }
        },
        error: function () {
            console.log("Error occured deleting department!");
        },
    });
}


function deleteDepartment(deleteId) {
    $.ajax({
        async: true,
        global: false,
        type: "POST",
        url: "php/deleteDepartmentByID.php",
        dataType: "json",
        data: {
            departmentId: deleteId,
        },
        success: function (results) {
            displayAlert("delete", results.status.code, results.status.description);
            getAllDepartments();
        },
        error: function () {
            console.log("Error occured deleting department!");
        },
    });
}

function checkLocation(deleteId) {
    $("#delete-footer").hide();
    $.ajax({
        async: true,
        global: false,
        type: "POST",
        url: "php/checkLocationByID.php",
        dataType: "json",
        data: {
            locationId: deleteId,
        },
        success: function (results) {
            if (results.status.code != 200) {
                displayAlert("delete", results.status.code, results.status.description);
            } else {
                displayCheck("delete");
            }
        },
        error: function () {
            console.log("Error occured deleting department!");
        },
    });
}


function deleteLocation(deleteId) {
    $.ajax({
        async: true,
        global: false,
        type: "POST",
        url: "php/deleteLocationByID.php",
        dataType: "json",
        data: {
            locationId: deleteId,
        },
        success: function (results) {
            displayAlert("delete", results.status.code, results.status.description);
            getAllLocations();
        },
        error: function () {
            console.log("Error occured deleting location!");
        },
    });
}

// ----------------------------------------------------------------------------READ SCRIPT-----------------------------------------------------------------------------

// get personnel from database
function getAllPersonnel() {
    $.ajax({
        async: true,
        global: false,
        type: "POST",
        url: "php/getAllPersonnel.php",
        dataType: "json",
        success: function (result) {
            const employer = result.data;
            let content = "";
            for (let i = 0; i < employer.length; i++) {
                content += `<tr class="${employer[i].id}">
              <td>${employer[i].lastName}</td>
              <td>${employer[i].firstName}</td>
              <td class="d-none d-md-table-cell">${employer[i].department}</td>
              <td class="align-middle text-right py-0">
                  <div class="btn-group" role="group">
                    <button class="edit-btn btn text-primary" title="edit"><i class="bi bi-pencil-square"></i></button>
                    <button class="delete-btn btn text-danger" title="delete"><i class="bi bi-trash3-fill"></i></button>
                  </div>
                </td>
            </tr>`

            }
            $("#personnel-table tbody").html(content);
        },
    });
}

function getAllDepartments() {
    $.ajax({
        async: true,
        global: false,
        type: "POST",
        url: "php/getAllDepartments.php",
        dataType: "json",
        success: function (result) {
            const department = result.data;
            let content = "";
            for (let i = 0; i < department.length; i++) {
                content += `<tr class="${department[i].id}">
              <td>${department[i].name}</td>
              <td class="d-none d-md-table-cell">${department[i].location}</td>
                <td class="align-middle text-right py-0">
                  <div class="btn-group" role="group">
                    <button class="edit-btn btn text-primary" title="edit"><i class="bi bi-pencil-square"></i></button>
                    <button class="delete-btn btn text-danger" title="delete"><i class="bi bi-trash3-fill"></i></button>
                  </div>
                </td>
            </tr>`
            }
            $("#department-table tbody").html(content);
        },
    });
}

function getAllLocations() {
    $.ajax({
        async: true,
        global: false,
        type: "POST",
        url: "php/getAllLocations.php",
        dataType: "json",
        success: function (result) {
            const locations = result.data;
            let content = "";
            for (let i = 0; i < locations.length; i++) {
                content += `<tr class="${locations[i].id}">
              <td>${locations[i].name}</td>
                <td class="align-middle text-right py-0">
                  <div class="btn-group" role="group">
                    <button class="edit-btn btn text-primary" title="edit"><i class="bi bi-pencil-square"></i></button>
                    <button class="delete-btn btn text-danger" title="delete"><i class="bi bi-trash3-fill"></i></button>
                  </div>
                </td>
            </tr>`
            }
            $("#location-table tbody").html(content);
        },
    });
}


// CLICK ON EYE ICON NAME AND DISPLAY INFORMATION

function getPersonnelById(personnelId, selectId) {
    $.ajax({
        async: true,
        global: false,
        type: "POST",
        url: "php/getPersonnelByID.php",
        dataType: "json",
        data: {
            id: personnelId,
        },
        success: function (results) {
            const title = results.data[0].jobTitle == "" ? "No Job Title" : results.data[0].jobTitle;
            resetForm("personnel-edit");
            $("#personnel-edit-type").html(`${results.data[0].lastName} ${results.data[0].firstName}`);
            $("#edit-first").val(`${results.data[0].firstName}`);
            $("#edit-last").val(`${results.data[0].lastName}`);
            $("#edit-title").val(`${title}`);
            $("#edit-email").val(`${results.data[0].email}`);
            $("#personnel-edit-department").html(getUniqueDepartments(results.data[0].departmentId));
            $("#personnel-edit-location").html(getUniqueLocations(0));
            $("#personnel-edit-location").html(getLocationByDepartmentId(results.data[0].departmentId, selectId));
            $("#personnel-edit-modal").modal("show");
        },
        error: function () {
            console.log("Error occured getting personnel by id!");
        },
    });
}

function getDepartmentById(departmentId) {
    $.ajax({
        async: false,
        global: false,
        type: "POST",
        url: "php/getDepartmentByID.php",
        dataType: "json",
        data: {
            departmentId: departmentId,
        },
        success: function (results) {
            resetForm("department-edit");
            $("#department-edit-type").html(`${results.data[0].name}`);
            $("#department-edit-department").val(`${results.data[0].name}`);
            $("#department-edit-location").html(`${getUniqueLocations(results.data[0].locationId)}`);
            $("#department-edit-modal").modal("show");
        },
        error: function () {
            console.log("Error occured getting department by id!");
        },
    });
}

function getLocationById(locationId) {
    $.ajax({
        async: false,
        global: false,
        type: "POST",
        url: "php/getLocationByID.php",
        dataType: "json",
        data: {
            locationId: locationId,
        },
        success: function (results) {
            resetForm("location-edit");
            $("#location-edit-type").html(`${results.data[0].name}`);
            $("#location-edit-location").val(`${results.data[0].name}`);
            $("#location-edit-modal").modal("show");
        },
        error: function () {
            console.log("Error occured getting location by id!");
        },
    });
}


function getUniqueDepartments(selectedValue, filter, filterPlace) {
    let data;
    $.ajax({
        async: false,
        global: false,
        url: "php/getUniqueDepartments.php",
        dataType: "json",
        success: function (results) {
            data = displayOptions(results, selectedValue, filter, filterPlace);
        },
        error: function () {
            console.log("Error occured getting unique departments!");
        }
    });
    return data;
}

function getUniqueLocations(selectedValue, filter, filterPlace) {
    let data;
    $.ajax({
        async: false,
        global: false,
        url: "php/getUniqueLocations.php",
        dataType: "json",
        success: function (results) {
            data = displayOptions(results, selectedValue, filter, filterPlace);
        },
        error: function () {
            console.log("Error occured getting unique locations!");
        }
    });
    return data;
}

function getLocationByDepartmentId(departmentId, selectId) {
    let data;
    $.ajax({
        async: false,
        global: false,
        type: "POST",
        url: "php/getLocationByDepartmentID.php",
        dataType: "json",
        data: {
            "departmentId": departmentId,
        },
        success: function (results) {
            data = displaySelected(selectId, results.data[0].id);
        },
        error: function () {
            console.log("error occured getting location by id");
        }
    });
    return data;
}

function getFilterPersonnel(emp, dep, loc) {
    $.ajax({
        async: true,
        global: false,
        type: "POST",
        url: "php/getFilterPersonnel.php",
        dataType: "json",
        data: {
            employee: emp,
            department: dep,
            location: loc
        },
        success: function (result) {
            const employer = result.data.personnel;
            let content = "";
            for (let i = 0; i < employer.length; i++) {
                content += `<tr class="${employer[i].id}">
              <td>${employer[i].lastName}</td>
              <td>${employer[i].firstName}</td>
              <td class="d-none d-md-table-cell">${employer[i].department}</td>
                <td class="align-middle text-right py-0">
                  <div class="btn-group" role="group">
                    <button class="edit-btn btn text-primary" title="edit"><i class="bi bi-pencil-square"></i></button>
                    <button class="delete-btn btn text-danger" title="delete"><i class="bi bi-trash3-fill"></i></button>
                  </div>
                </td>
            </tr>`

            }
            $("#personnel-table tbody").html(content);
        },
        error: function () {
            console.log("error occured getting location by id");
        }
    });
}

// ----------------------------------------------------------------------------EDIT SCRIPT-----------------------------------------------------------------------------

function editRecord(type, editId) {
    let editObj = {
        first: $(`#edit-first`).val(),
        last: $(`#edit-last`).val(),
        title: $(`#edit-title`).val(),
        email: $(`#edit-email`).val(),
        department: $(`#${type}-edit-department`).val(),
        location: $(`#${type}-edit-location`).val(),
    };

    switch (type) {
        case "personnel":
            if (
                editObj.first != "" &&
                editObj.last != "" &&
                editObj.title != "" &&
                editObj.email != "" &&
                editObj.department != ""
            ) {
                editPersonnel(editObj, editId, type);
            }
            break;

        case "department":
            if (editObj.department != "" && editObj.location != "") {
                editDepartment(editObj, editId, type);
            }
            break;

        case "location":
            if (editObj.location != "") {
                editLocation(editObj, editId, type);
            }
            break;
    }
}

function editPersonnel(editObj, editId, type) {
    $.ajax({
        async: true,
        global: false,
        type: "POST",
        url: "php/editPersonnel.php",
        dataType: "json",
        data: {
            employeeId: editId,
            firstName: editObj.first,
            lastName: editObj.last,
            jobTitle: editObj.title,
            email: editObj.email,
            department: editObj.department,
        },
        success: function (results) {
            displayAlert(`${type}-edit`, results.status.code, results.status.description);
            getAllPersonnel();
        },
        error: function () {
            console.log("Error occured editting personnel!");
        },
    });
}

function editDepartment(editObj, editId, type) {
    $.ajax({
        async: true,
        global: false,
        type: "POST",
        url: "php/editDepartment.php",
        dataType: "json",
        data: {
            departmentId: editId,
            department: editObj.department,
            location: editObj.location,
        },
        success: function (results) {
            displayAlert(`${type}-edit`, results.status.code, results.status.description);
            getAllDepartments("");
        },
        error: function () {
            console.log("Error occured editting department!");
        },
    });
}

function editLocation(editObj, editId, type) {
    $.ajax({
        async: true,
        global: false,
        type: "POST",
        url: "php/editLocation.php",
        dataType: "json",
        data: {
            locationId: editId,
            location: editObj.location,
        },
        success: function (results) {
            displayAlert(`${type}-edit`, results.status.code, results.status.description);
            getAllLocations("");
        },
        error: function () {
            console.log("Error occured editting location!");
        },
    });
}