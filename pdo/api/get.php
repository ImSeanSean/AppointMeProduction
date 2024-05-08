<?php
require './Middleware.php';


class Get
{
    private $pdo;
    private $secretKey;
    private $middleware;

    #constructor
    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->secretKey = "secretkey";
        $this->middleware = new Middleware();
    }

    public function sendPayLoad($data, $remarks, $message, $code)
    {
        $status = array("remarks" => $remarks, "message" => $message);
        http_response_code($code);
        // return array(
        //     "status" => $status,
        //     "data" => $data,
        //     "prepared_by" => "AppointMe",
        //     "timestamp" => date_create()
        // );
        return $data;
    }

    public function executeQuery($sqlString)
    {
        $data = array();
        $errmsg = "";
        $code = 0;

        try {
            if ($result = $this->pdo->query($sqlString)->fetchAll()) {
                foreach ($result as $record) {
                    array_push($data, $record);
                }
                $code = 200;
                $result = null;
                return array("code" => $code, "data" => $data);
            } else {
                $errmsg = "No data found";
                $code = 404;
            }
        } catch (\PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 403;
        }
        return array("code" => $code, "errmsg" => $errmsg);
    }

    public function get_records($table, $conditions = null)
    {
        $sqlStr = "SELECT * FROM $table";
        if ($conditions != null) {
            $sqlStr .= " WHERE " . $conditions;
        }

        $result = $this->executeQuery($sqlStr);

        if ($result['code'] == 200) {
            return $this->sendPayLoad($result['data'], "success", "Successfully retrieved data.", $result['code']);
        }

        return $this->sendPayLoad(null, "failed", "Failed to pull data.", $result['code']);
    }


    public function get_consultants($id = null)
    {
        $conditions = null;
        if ($id != null) {
            $conditions = "ConsultantID = $id";
        }
        return $this->get_records("consultant", $conditions);
    }

    public function get_user()
    {
        $tokenInfo = $this->middleware->validateToken();
        if ($tokenInfo) {
            // Token is valid, proceed to fetch user data based on user_id
            $userId = $tokenInfo->user_id;
            return $this->get_records("user", "UserID = $userId");
        } else {
            // Token is invalid or Authorization header is missing, return an error response
            http_response_code(401);
            echo json_encode(array('message' => 'Token is invalid or Authorization header is missing'));
        }
    }
    public function get_teacher()
    {
        $tokenInfo = $this->middleware->validateToken();
        if ($tokenInfo) {
            // Token is valid, proceed to fetch user data based on user_id
            $userId = $tokenInfo->user_id;
            return $this->get_records("consultant", "ConsultantID = $userId");
        } else {
            // Token is invalid or Authorization header is missing, return an error response
            http_response_code(401);
            echo json_encode(array('message' => 'Token is invalid or Authorization header is missing'));
        }
    }
    public function get_appointments()
    {
        $tokenInfo = $this->middleware->validateToken();
        if ($tokenInfo) {
            $userId = $tokenInfo->user_id;

            // Modified SQL query to join user and consultant tables
            $sqlStr = "SELECT appointment.*, 
                   user.FirstName AS UserName, user.LastName AS UserLastName,
                   consultant.first_name AS ConsultantFirstName, consultant.last_name AS ConsultantLastName
              FROM appointment
              LEFT JOIN user ON appointment.user_id = user.UserID
              LEFT JOIN consultant ON appointment.ConsultantID = consultant.ConsultantID
              WHERE appointment.user_id = $userId";

            $result = $this->executeQuery($sqlStr);

            if ($result['code'] == 200) {
                return $this->sendPayLoad($result['data'], "success", "Successfully retrieved appointments with user and consultant names.", $result['code']);
            }

            return $this->sendPayLoad(null, "failed", "Failed to pull data.", $result['code']);
        } else {
            http_response_code(401);
            echo json_encode(array('message' => 'Token is invalid or Authorization header is missing'));
        }
    }
    public function get_appointments_teacher()
    {
        $tokenInfo = $this->middleware->validateToken();
        if ($tokenInfo) {
            $userId = $tokenInfo->user_id;

            // Modified SQL query to join user and consultant tables
            $sqlStr = "SELECT appointment.*, 
                   user.FirstName AS UserName, user.LastName AS UserLastName,
                   consultant.first_name AS ConsultantFirstName, consultant.last_name AS ConsultantLastName
              FROM appointment
              LEFT JOIN user ON appointment.user_id = user.UserID
              LEFT JOIN consultant ON appointment.ConsultantID = consultant.ConsultantID
              WHERE appointment.ConsultantID = $userId";

            $result = $this->executeQuery($sqlStr);

            if ($result['code'] == 200) {
                return $this->sendPayLoad($result['data'], "success", "Successfully retrieved appointments with user and consultant names.", $result['code']);
            }

            return $this->sendPayLoad(null, "failed", "Failed to pull data.", $result['code']);
        } else {
            http_response_code(401);
            echo json_encode(array('message' => 'Token is invalid or Authorization header is missing'));
        }
    }
    // public function get_appointment($id)
    // {
    //     $tokenInfo = $this->middleware->validateToken();
    //     if ($tokenInfo) {
    //         $conditions = null;
    //         if ($id != null) {
    //             $conditions = "AppointmentID = $id";
    //         }
    //         return $this->get_records("appointment", $conditions);
    //     } else {
    //         http_response_code(401);
    //         echo json_encode(array('message' => 'Token is invalid or Authorization header is missing'));
    //     }
    // }
    public function get_appointment($appointmentId)
    {
        $tokenInfo = $this->middleware->validateToken();
        if ($tokenInfo) {
            // Modified SQL query to join user and consultant tables
            $sqlStr = "SELECT appointment.*, 
               user.FirstName AS UserName, user.LastName AS UserLastName,
               consultant.first_name AS ConsultantFirstName, consultant.last_name AS ConsultantLastName
          FROM appointment
          LEFT JOIN user ON appointment.user_id = user.UserID
          LEFT JOIN consultant ON appointment.ConsultantID = consultant.ConsultantID
          WHERE appointment.AppointmentID = $appointmentId";

            $result = $this->executeQuery($sqlStr);

            if ($result['code'] == 200) {
                return $this->sendPayLoad($result['data'], "success", "Successfully retrieved appointment with user and consultant names.", $result['code']);
            }

            return $this->sendPayLoad(null, "failed", "Failed to pull data.", $result['code']);
        } else {
            http_response_code(401);
            echo json_encode(array('message' => 'Token is invalid or Authorization header is missing'));
        }
    }
    public function get_day_schedule($day)
    {
        $tokenInfo = $this->middleware->validateToken();
        if ($tokenInfo) {
            // Modified SQL query to join user and consultant tables
            $sqlStr = "SELECT *
            FROM schedule
            WHERE consultantId = $tokenInfo->user_id
            AND dayOfWeek = $day;";

            $result = $this->executeQuery($sqlStr);

            if ($result['code'] == 200) {
                if (count($result['data']) > 0) {
                    return $this->sendPayLoad($result['data'], "success", "Successfully retrieved schedules.", $result['code']);
                } else {
                    return null; // Return null when no records found
                }
            }

            return $this->sendPayLoad(null, "failed", "Failed to pull data.", $result['code']);
        } else {
            http_response_code(401);
            echo json_encode(array('message' => 'Token is invalid or Authorization header is missing'));
        }
    }
    public function get_day_schedule_student($teacher_id, $day)
    {
        $tokenInfo = $this->middleware->validateToken();
        if ($tokenInfo) {
            // Modified SQL query to join user and consultant tables
            $sqlStr = "SELECT *
            FROM schedule
            WHERE consultantId = $teacher_id
            AND dayOfWeek = $day;";

            $result = $this->executeQuery($sqlStr);

            if ($result['code'] == 200) {
                if (count($result['data']) > 0) {
                    return $this->sendPayLoad($result['data'], "success", "Successfully retrieved schedules.", $result['code']);
                } else {
                    return null; // Return null when no records found
                }
            }

            return $this->sendPayLoad(null, "failed", "Failed to pull data.", $result['code']);
        } else {
            http_response_code(401);
            echo json_encode(array('message' => 'Token is invalid or Authorization header is missing'));
        }
    }
}
