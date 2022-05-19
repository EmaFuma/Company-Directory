<?php

    ini_set("display_errors", "On");
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    include("config.php");

    header("Content-Type: application/json; charset=UTF-8");

    $conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

    if (mysqli_connect_errno()) {
        $output["status"]["code"] = "300";
        $output["status"]["name"] = "failure";
        $output["status"]["description"] = "database unavailable";
        $output["status"]["returnedIn"] = (microtime(true) - $executionStartTime) / 1000 . " ms";
        $output["data"] = [];

        mysqli_close($conn);

        echo json_encode($output);

        exit();
    }

    $firstName = $_REQUEST["firstName"];
    $lastName = $_REQUEST["lastName"];
    $department = $_REQUEST["department"];
    $location = $_REQUEST["location"];

    if ((isset($firstName) and strlen($firstName) > 0) and (isset($lastName) and strlen($lastName) > 0)) {
        $firstName .= "%";
        $lastName .= "%";
    } elseif (isset($firstName) and strlen($firstName) > 0) {
        $firstName .= "%";
    } elseif (isset($lastName) and strlen($lastName) > 0) {
        $lastName .= "%";
    } else {
        $firstName = "%";
        $lastName = "%";
    }

    $sqlStr = "SELECT p.id, p.lastName, p.firstName, p.jobTitle, p.email, 
                d.name as department, l.name as location 
                FROM personnel p 
                LEFT JOIN department d ON (p.departmentID = d.id) 
                LEFT JOIN location l ON (d.locationID = l.id)
                WHERE (p.firstName LIKE '$firstName' OR p.lastName LIKE '$lastName')";

    if (isset($department) and strlen($department) > 0) {
        $sqlStr = $sqlStr . " and d.id =" . $department;
    }

    if (isset($location) and strlen($location) > 0) {
        $sqlStr = $sqlStr . " and l.id =" . '"' . $location . '"';
    }

    $query = $conn->query($sqlStr);

    if (!$query) {
        $output["status"]["code"] = "400";
        $output["status"]["name"] = "executed";
        $output["status"]["description"] = "query failed";
        $output["data"] = [];

        mysqli_close($conn);

        echo json_encode($output);

        exit();
    }

    $personnel = [];

    while ($row = mysqli_fetch_assoc($query)) {
        array_push($personnel, $row);
    }

    if (count($personnel) === 0) {
        $output["status"]["code"] = "400";
        $output["status"]["name"] = "executed";
        $output["status"]["description"] = "No elements found. Please try again.";
        $output["data"]["personnel"] = [];

        mysqli_close($conn);

        echo json_encode($output);

        exit();
    }

    $output["status"]["code"] = "200";
    $output["status"]["name"] = "ok";
    $output["status"]["description"] = "success";
    $output["status"]["returnedIn"] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output["data"]["personnel"] = $personnel;

    mysqli_close($conn);

    echo json_encode($output);
?>