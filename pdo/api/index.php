<?php
include "./get.php";
include "./post.php";
include "../config/database.php";


header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: *');
header('Access-Control-Allow-Headers: *');

// Centralized CORS handling for OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('HTTP/1.1 200 OK');
    header('Access-Control-Allow-Methods: *');
    header('Access-Control-Allow-Headers: *');
    exit;
}

$con = new Connection();
$pdo = $con->connect();

$get = new Get($pdo);
$post = new Post($pdo);



//echo $_REQUEST['request'];
if (isset($_REQUEST['request']))
    $request = explode('/', $_REQUEST['request']);
else {
    http_response_code(404);
}


switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        switch ($request[0]) {
            case 'get_consultants':
                if (count($request) > 1) {
                    echo json_encode($get->get_consultants($request[1]));
                } else {
                    echo json_encode($get->get_consultants());
                }
                break;
            case 'get_user':
                echo json_encode($get->get_user());
                break;
            case 'get_teacher':
                echo json_encode($get->get_teacher());
                break;
            case 'get_appointments':
                echo json_encode($get->get_appointments());
                break;
            case 'get_appointments_teacher':
                echo json_encode($get->get_appointments_teacher());
                break;
            case 'get_appointment':
                echo json_encode($get->get_appointment($request[1]));
                break;
            default:
                http_response_code(403);
                break;
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        switch ($request[0]) {
            case 'login':
                echo json_encode($post->login($data));
                break;
            case 'login_teacher':
                echo json_encode($post->login_teacher($data));
                break;
            case 'register':
                echo json_encode($post->register($data));
                break;
            case 'create_appointment':
                echo json_encode($post->create_appointment($data));
                break;
            case 'confirm_appointment':
                echo json_encode($post->confirm_appointment($data));
                break;
            case 'reject_appointment':
                echo json_encode($post->reject_appointment($data));
                break;
            default:
                http_response_code(403);
                break;
        }
        break;

    default:
        http_response_code(403);
        break;
}
