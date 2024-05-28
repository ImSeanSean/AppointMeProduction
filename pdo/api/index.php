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
            case 'get_day_schedule':
                echo json_encode($get->get_day_schedule($request[1]));
                break;
            case 'get_day_schedule_student':
                echo json_encode($get->get_day_schedule_student($request[1], $request[2]));
                break;
            case 'get_matching_schedule':
                echo json_encode($get->is_schedule_occupied($request[1], $request[2]));
                break;
            case 'get_notifications_student':
                echo json_encode($get->get_notifications_student());
                break;
            case 'has_existing_appointment':
                echo json_encode($get->has_existing_appointment($request[1]));
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
            case 'register_teacher':
                echo json_encode($post->registerTeacher($data));
                break;
            case 'verification_code':
                echo json_encode($post->sendCode($data));
                break;
            case 'approve_teacher':
                echo json_encode($post->approveTeacher($data));
                break;
            case 'reject_teacher':
                echo json_encode($post->reject_teacher($data));
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
            case 'complete_appointment':
                echo json_encode($post->complete_appointment($data));
                break;
            case 'rate_appointment':
                echo json_encode($post->rate_appointment($data));
                break;
            case 'add_schedule':
                echo json_encode($post->add_schedule($data));
                break;
            case 'remove_schedule':
                echo json_encode($post->remove_schedule($data));
                break;
            case 'remove_all_schedule':
                echo json_encode($post->remove_day_schedule($data));
                break;
            case 'mark_notification':
                echo json_encode($post->markNotificationAsRead($data));
                break;
            case 'create_notification':
                echo json_encode($post->createNotification($data));
                break;
            case 'check_ftf_appointments':
                echo json_encode($post->checkFTFSchedule($data));
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
