<?php
	
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);
	

	$executionStartTime = microtime(true);

	include("config.php");

	header('Content-Type: application/json; charset=UTF-8');

	$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);
    
	// $conn = new mysqli($host_name, $user_name, $password, $database); This is for the IONOS Database

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

	$query = "SELECT p.id, p.lastName, p.firstName, p.jobTitle, p.email, 
                d.name as department, l.name as location 
                FROM personnel p 
                LEFT JOIN department d ON (p.departmentID = d.id) 
                LEFT JOIN location l ON (d.locationID = l.id)
                ORDER BY id";

	$result = $conn->query($query);
	
	if (!$result) {

		$output['status']['code'] = "400";
		$output['status']['name'] = "executed";
		$output['status']['description'] = "query failed";	
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output); 

		exit;

	}
   
   	$data = [];

	while ($row = mysqli_fetch_assoc($result)) {

		array_push($data, $row);

	}

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = $data;
	$output['req'] = $_REQUEST;
	
	mysqli_close($conn);

	echo json_encode($output); 

?>