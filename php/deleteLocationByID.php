<?php

	
	
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);

	$executionStartTime = microtime(true);

	include("config.php");

	header('Content-Type: application/json; charset=UTF-8');

	$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

	if (mysqli_connect_errno()) {
		
		$output['status']['code'] = "300";
		$output['status']['name'] = "failure";
		$output['status']['description'] = "database unavailable";
		$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output);

		exit;

	}	

	
	$locationId = $_REQUEST['locationId'];

	$checkQuery = "SELECT COUNT(name) as departments FROM department d WHERE d.locationID = $locationId";
    
	$checkResult = $conn->query($checkQuery);

	$data = [];

	while ($row = mysqli_fetch_assoc($checkResult)) {

		array_push($data, $row);

	}

	$departments = $data[0]['departments'];

	if ($departments > 0) {

		$output['status']['code'] = "400";
		$output['status']['name'] = "executed";
		$output['status']['description'] = "Delete denied. Remove assigned departments before deleting.";	
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output); 

		exit;
	}
	

	$query = 'DELETE FROM location WHERE id = ' . $_REQUEST['locationId'];

	$result = $conn->query($query);
	

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "Succesfully Deleted";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = [];
	
	mysqli_close($conn);

	echo json_encode($output);

?>