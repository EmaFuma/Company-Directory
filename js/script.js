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
  $("#company-tabs").html("Personnel");


  // TABS
  // display personnel table on personnel tab click
  $("#personnel-btn").click(function () {
    $("#department-table").hide();
    $("#location-table").hide();
    $("#personnel-table").show();
    $("#department-btn").removeClass("active");
    $("#location-btn").removeClass("active");
    $(this).addClass("active");
    resetForm("add");
    resetForm("edit");
    $("#company-tabs").html("Personnel");
  });

  // display department table on department tab click
  $("#department-btn").click(function () {
    $("#personnel-table").hide();
    $("#location-table").hide();
    $("#department-table").show();
    $("#personnel-btn").removeClass("active");
    $("#location-btn").removeClass("active");
    $(this).addClass("active");
    resetForm("add");
    resetForm("edit");
    $("#company-tabs").html("Departments");
  });

  // display location table on location tab click
  $("#location-btn").click(function () {
    $("#personnel-table").hide();
    $("#department-table").hide();
    $("#location-table").show();
    $("#personnel-btn").removeClass("active");
    $("#department-btn").removeClass("active");
    $(this).addClass("active");
    resetForm("add");
    resetForm("edit");
    $("#company-tabs").html("Locations");
  });

  // REFRESH BUTTON
  // refresh tables on refresh button click
  $("#refresh-btn").click(function () {
    getAllPersonnel();
    getAllDepartments();
    getAllLocations();
    filter();
    filterByInput();
    $("#search-bar").val("");

    resetForm("add");
    resetForm("edit");
  });

  // VIEW FUNCTION
  $(document).on("click", "tbody tr .view-btn", function () {
    let id = $(this).parent().parent().siblings().html();
    getPersonnelById(id, "modal");
  });

  // FILTER FUNCTION

  //searchbar event listener:
  function filterByInput() {
    let delay;
    $("#filter-input").on("input", function () {
      const employee = $("#filter-input").val();
      const department = $("#department-filter").val();
      const location = $("#location-filter").val();
      clearTimeout(delay); //this line stop querys to queue up as the user type

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

  // ADD FUNCTIONS
  // display add modal on add button click
  $("#add-btn").click(function () {
    resetForm("add");
    addModal(getType());
  });
  // get location on department change
  $(document).on("change", "#add-form #add-department", function () {
    let departmentId = $("#add-department").val();
    $("#add-location").html(
      getLocationByDepartmentId(departmentId, "add-location")
    );
  });
  // add record on add-submit button click
  $("#add-submit-btn").click(function () {
    let type = $("#add-type").html();
    validateForm("add");
    addRecord(type);
    filter();
    filterByInput();
  });

  // EDIT FUNCTIONS
  // display edit modal on edit button click
  $(document).on("click", "tbody tr .edit-btn", function () {
    resetForm("edit");
    let id = $(this).parent().parent().siblings().html();
    editModal(getType(), id);
  });
  // get location on department change
  $(document).on("change", "#edit-form #edit-department", function () {
    let departmentId = $("#edit-department").val();
    $("#edit-location").html(
      getLocationByDepartmentId(departmentId, "edit-location")
    );
  });
  // edit record on edit-submit button click
  $(document).on("click", "#edit-submit-btn", function () {
    let id = $("#edit-id").html();
    validateForm("edit");
    editRecord(getType(), id);
    filter();
    filterByInput();
  });

  //DELETE FUNCTIONS
  // display delete modal on delete button clicked
  $(document).on("click", "tbody tr .delete-btn", function () {
    let id = $(this).parent().parent().siblings().html();
    deleteModal(getType(), id);
  });
  // delete record on confirmation
  $(document).on("click", "#delete-modal-yes", function () {
    let id = $("#delete-id").html();
    deleteRecord(getType(), id);
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
      `<div class="alert alert-dismissible fade show alert-danger" role="alert">${message}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`
    );
  } else {
    $(`#${displayId}-alert`).html(
      `<div class="alert alert-dismissible fade show alert-success" role="alert">${message}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`
    );
  }
  $("#search-bar").val("");
}


// create and display options
function displayOptions(object, selectedValue) {
  let content = "";
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

// Display Modals
function viewModal(object) {
  const data = object.data;
  const title = data[0].jobTitle == "" ? "No Job Title" : data[0].jobTitle;
  $("#view-modal #modal-title").html(
    `${data[0].firstName} ${data[0].lastName}`
  );
  $("#view-modal #cardJob").html(`${title}`);
  $("#view-modal #cardLocation").html(`
		${data[0].department} | ${data[0].location}<br><br>
		<a href="mailto:${data[0].email}" id="cardEmail">${data[0].email}</a>`);
  $("#view-modal").modal("show");
}


function addModal(type) {
  let content = "";
  switch (type) {
    case "personnel":
      content = `<div class="form-row">
				<div class="form-group col-12 col-md-6">
					<label for="add-first">First Name<span class="text-danger">*</span></label>
					<input type="text" id="add-first" class="form-control form-required">
				</div>
				<div class="form-group col-12 col-md-6">
					<label for="add-last">Last Name<span class="text-danger">*</span></label>
					<input type="text" id="add-last" class="form-control form-required">
				</div>
			</div>
			<div class="form-group">
				<label for="add-title">Job Title<span class="text-danger">*</span></label>
				<input type="text" id="add-title" class="form-control form-required">
			</div>
			<div class="form-group">	
				<label for="add-email">Email<span class="text-danger">*</span></label>
				<input type="email" id="add-email" class="form-control form-required">
			</div>
			<div class="form-row">
				<div class="form-group col-12 col-md-6">
					<label for="add-department">Department<span class="text-danger">*</span></label>
					<select id="add-department" class="form-control form-required">
            <option selected hidden value="">Select...</option>
            ${getUniqueDepartments(0)}
					</select>
				</div>
				<div class="form-group col-12 col-md-6">
					<label for="add-location">Location<span class="text-danger">*</span></label>
					<select id="add-location" class="form-control form-required" readonly disabled>
            <option selected hidden value="">Select...</option>
            ${getUniqueLocations(0)}
					</select>
				</div>
			</div>`;
      break;

    case "department":
      content = `<div class="form-group">
				<label for="add-department">Department Name<span class="text-danger">*</span></label>
				<input type="text" id="add-department" class="form-control form-required">
			</div>
			<div class="form-group">
				<label for="add-location">Department Location<span class="text-danger">*</span></label>
				<select id="add-location" class="form-control form-required">
          <option selected hidden value="">Select...</option>
          ${getUniqueLocations(0)}
				</select>
			</div>`;
      break;

    case "location":
      content = `<div class="form-group">
					<label for="add-location">Location Name<span class="text-danger">*</span></label>
					<input type="text" id="add-location" class="form-control form-required">
				</div>`;
      break;
  }
  $("#add-type").html(type).css("text-transform", "capitalize");
  $("#add-form").html(content);
  $("#add-modal").modal("show");
}

function editModal(type, id) {
  $("#edit-type").html(type).css("text-transform", "capitalize");
  $("#edit-id").html(id);

  switch (type) {
    case "personnel":
      getPersonnelById(id, "form", "edit-location");
      break;

    case "department":
      getDepartmentById(id);
      break;

    case "location":
      getLocationById(id);
      break;
  }

  $("#edit-modal").modal("show");
}

function deleteModal(type, id) {
  $("#delete-type").html(type).css("text-transform", "capitalize");
  $("#delete-id").html(id);

  let content = "";
  switch (type) {
    case "personnel":
      content = `<h6 class="mb-3">Are you sure you wish to delete record?</h6>
				<button id="delete-modal-yes" class="btn btn-success">Yes</button>
				<button id="delete-modal-no" class="btn btn-danger" data-dismiss="modal">No</button>`;
      break;

    case "department":
      content = `<h6 class="mb-3">Are you sure you wish to delete department?</h6>
				<button id="delete-modal-yes" class="btn btn-success">Yes</button>
				<button id="delete-modal-no" class="btn btn-danger" data-dismiss="modal">No</button>`;
      break;

    case "location":
      content = `<h6 class="mb-3">Are you sure you wish to delete location?</h6>
				<button type="button" id="delete-modal-yes" class="btn btn-success">Yes</button>
				<button id="delete-modal-no" class="btn btn-danger" data-dismiss="modal">No</button>`;
      break;
  }
  $("#delete-alert").html(content);
  $("#delete-modal").modal("show");
}

function filter() {
  let content = ` 
    <div class="row mb-0">
      <div class="col-sm-4">
        <input type="text" class="form-control" id="filter-input" placeholder="Employee">
      </div>
      <div class="col-sm-4">
        <select class="form-control" id="department-filter">
          <option value="">All Departments</option>
          ${getUniqueDepartments(0)}
        </select>
      </div>
      <div class="col-sm-4">
        <select class="form-control" id="location-filter">
          <option value="">All Locations</option>
          ${getUniqueLocations(0)}
        </select>
      </div>
    </div>`;
  $("#filter-form").html(content);
}
// ----------------------------------------------------------------------------CREATE SCRIPT-----------------------------------------------------------------------------

function addRecord(type) {
  let addObj = {
    first: $(`#add-first`).val(),
    last: $(`#add-last`).val(),
    title: $(`#add-title`).val(),
    email: $(`#add-email`).val(),
    department: $(`#add-department`).val(),
    location: $(`#add-location`).val(),
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
        addPersonnel(addObj);
      }
      break;

    case "department":
      if (addObj.department != "" && addObj.location != "") {
        addDepartment(addObj);
      }
      break;

    case "location":
      if (addObj.location != "") {
        addLocation(addObj);
      }
      break;
  }
}


// add personnel function

function addPersonnel(addObj) {
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
      displayAlert("add", results.status.code, results.status.description);
      getAllPersonnel();
    },
    error: function () {
      console.log("Add personnel error occured");
    },
  });
}

function addDepartment(addObj) {
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
      displayAlert("add", results.status.code, results.status.description);
      getAllDepartments();
    },
    error: function () {
      console.log("Add department error occured");
    },
  });
}

function addLocation(addObj) {
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
      displayAlert("add", results.status.code, results.status.description);
      getAllLocations();
    },
    error: function () {
      console.log("Error occured adding location!");
    },
  });
}

// ----------------------------------------------------------------------------DELETE SCRIPT-----------------------------------------------------------------------------

function deleteRecord(type, id) {
  switch (type) {
    case "personnel":
      if (id != "") {
        deletePersonnel(id);
      }
      break;

    case "department":
      if (id != "") {
        deleteDepartment(id);
      }
      break;

    case "location":
      if (id != "") {
        deleteLocation(id);
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
        content += `<tr>
            <td class="id">${employer[i].id}</td>
            <td class="align-middle">${employer[i].firstName} ${employer[i].lastName}</td>
              <td class="text-right">
                <div class="btn-group" role="group">
                  <button class="view-btn btn text-primary" title="view"><i class="bi bi-eye-fill"></i></button>
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
        content += `<tr>
            <td class="id">${department[i].id}</td>
            <td class="align-middle">${department[i].name}</td>
              <td class="text-right">
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
        content += `<tr>
            <td class="id">${locations[i].id}</td>
            <td class="align-middle">${locations[i].name}</td>
              <td class="text-right">
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

function getPersonnelById(personnelId, type, selectId) {
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
      if (type == "modal") {
        viewModal(results);
      } else if (type == "form") {
        $("#edit-form").html(`<div class="form-row">
					<div class="form-group col-12 col-md-6">
						<label for="edit-first">First Name<span class="text-danger">*</span></label>
						<input type="text" id="edit-first" class="form-control form-required" value="${
              results.data[0].firstName
            }">
					</div>
					<div class="form-group col-12 col-md-6">
						<label for="edit-last">Last Name<span class="text-danger">*</span></label>
						<input type="text" id="edit-last" class="form-control form-required" value="${
              results.data[0].lastName
            }">
					</div>
				</div>
				<div class="form-group">
					<label for="edit-title">Job Title<span class="text-danger">*</span></label>
					<input type="text" id="edit-title" class="form-control form-required" value="${
            results.data[0].jobTitle
          }">
				</div>	
				<div class="form-group">
					<label for="edit-email">Email<span class="text-danger">*</span></label>
					<input type="email" id="edit-email" class="form-control form-required" value="${
            results.data[0].email
          }">
				</div>				
				<div class="form-row">
					<div class="form-group col-12 col-md-6">
						<label for="edit-department">Department<span class="text-danger">*</span></label>
						<select id="edit-department" class="form-control form-required">
							${getUniqueDepartments(results.data[0].departmentId)}
						</select>
					</div>
					<div class="form-group col-12 col-md-6">
						<label for="edit-location">Location<span class="text-danger">*</span></label>
						<select id="edit-location" class="form-control form-required" readonly disabled>
							${getUniqueLocations(0)}
						</select>
					</div>
				</div>`);
        $("#edit-location").html(
          getLocationByDepartmentId(results.data[0].departmentId, selectId)
        );
      }
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
      $("#edit-form").html(`<div class="form-group">
				<label for="edit-department">Department Name<span class="text-danger">*</span></label>
				<input type="text" id="edit-department" class="form-control form-required" value="${
          results.data[0].name
        }">
			</div>
			<div class="form-group">
				<label for="edit-location">Department Location<span class="text-danger">*</span></label>
				<select id="edit-location" class="form-control form-required"">
					${getUniqueLocations(results.data[0].locationId)}
				</select>
			</div>`);
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
      $("#edit-form").html(`
				<div class="form-group">
					<label for="edit-location">Location Name<span class="text-danger">*</span></label>
					<input type="text" id="edit-location" class="form-control form-required" value="${results.data[0].name}">
				</div>`);
    },
    error: function () {
      console.log("Error occured getting location by id!");
    },
  });
}


function getUniqueDepartments(selectedValue) {
  let data;
  $.ajax({
    async: false,
    global: false,
    url: "php/getUniqueDepartments.php",
    dataType: "json",
    success: function (results) {
      data = displayOptions(results, selectedValue);
    },
    error: function () {
      console.log("Error occured getting unique departments!");
    }
  });
  return data;
}

function getUniqueLocations(selectedValue) {
  let data;
  $.ajax({
    async: false,
    global: false,
    url: "php/getUniqueLocations.php",
    dataType: "json",
    success: function (results) {
      data = displayOptions(results, selectedValue);
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
        content += `<tr>
            <td class="id">${employer[i].id}</td>
            <td class="align-middle">${employer[i].firstName} ${employer[i].lastName}</td>
              <td class="text-right">
                <div class="btn-group" role="group">
                  <button class="view-btn btn text-primary" title="view"><i class="bi bi-eye-fill"></i></button>
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

// ----------------------------------------------------------------------------UPDATE SCRIPT-----------------------------------------------------------------------------

function editRecord(type, editId) {
  let editObj = {
    first: $(`#edit-first`).val(),
    last: $(`#edit-last`).val(),
    title: $(`#edit-title`).val(),
    email: $(`#edit-email`).val(),
    department: $(`#edit-department`).val(),
    location: $(`#edit-location`).val(),
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
        editPersonnel(editObj, editId);
      }
      break;

    case "department":
      if (editObj.department != "" && editObj.location != "") {
        editDepartment(editObj, editId);
      }
      break;

    case "location":
      if (editObj.location != "") {
        editLocation(editObj, editId);
      }
      break;
  }
}

function editPersonnel(editObj, editId) {
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
      displayAlert("edit", results.status.code, results.status.description);
      getAllPersonnel();
    },
    error: function () {
      console.log("Error occured editting personnel!");
    },
  });
}

function editDepartment(editObj, editId) {
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
      displayAlert("edit", results.status.code, results.status.description);
      getAllDepartments("");
    },
    error: function () {
      console.log("Error occured editting department!");
    },
  });
}

function editLocation(editObj, editId) {
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
      displayAlert("edit", results.status.code, results.status.description);
      getAllLocations("");
    },
    error: function () {
      console.log("Error occured editting location!");
    },
  });
}