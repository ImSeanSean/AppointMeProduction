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

    public function get_users()
    {
        $tokenInfo = $this->middleware->validateToken();
        if ($tokenInfo) {
            // Token is valid, proceed to fetch all user data
            return $this->get_records("user");
        } else {
            // Token is invalid or Authorization header is missing, return an error response
            http_response_code(401);
            echo json_encode(array('message' => 'Token is invalid or Authorization header is missing'));
        }
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
    public function get_specific_user($userId)
    {
        $tokenInfo = $this->middleware->validateToken();
        if ($tokenInfo) {
            // Token is valid, proceed to fetch user data based on user_id
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
                   user.FirstName AS UserName, user.LastName AS UserLastName, user.StudentID,
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
                   user.FirstName AS UserName, user.LastName AS UserLastName, user.StudentID,
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
    public function get_appointment($appointmentId)
    {
        $tokenInfo = $this->middleware->validateToken();
        if ($tokenInfo) {
            // Modified SQL query to join user and consultant tables
            $sqlStr = "SELECT appointment.*, 
               user.FirstName AS UserName, user.LastName AS UserLastName, user.StudentID,
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
    public function get_appointment_teacher($teacher_Id)
    {
        $tokenInfo = $this->middleware->validateToken();
        if ($tokenInfo) {
            // Modified SQL query to join user and consultant tables
            $sqlStr = "SELECT appointment.*, 
                   user.FirstName AS UserName, user.LastName AS UserLastName, user.StudentID,
                   consultant.first_name AS ConsultantFirstName, consultant.last_name AS ConsultantLastName
              FROM appointment
              LEFT JOIN user ON appointment.user_id = user.UserID
              LEFT JOIN consultant ON appointment.ConsultantID = consultant.ConsultantID
              WHERE appointment.ConsultantID = $teacher_Id";

            $result = $this->executeQuery($sqlStr);

            if ($result['code'] == 200) {
                return $this->sendPayLoad($result['data'], "success", "Successfully retrieved appointments with user and consultant names.", $result['code']);
            }

            return $this->sendPayLoad([], "success", "No appointments found for the teacher.", 200);
        } else {
            http_response_code(401);
            echo json_encode(array('message' => 'Token is invalid or Authorization header is missing'));
        }
    }
    public function get_queue_student($student_Id)
    {
        $tokenInfo = $this->middleware->validateToken();
        if ($tokenInfo) {
            // Modified SQL query to join user and consultant tables
            $sqlStr = "
                SELECT 
                    q.*,
                    CONCAT(u.FirstName, ' ', u.LastName) AS student_name,
                    CONCAT(c.first_name, ' ', c.last_name) AS teacher_name
                FROM 
                    queue q
                JOIN 
                    user u ON q.student_id = u.UserID
                JOIN 
                    consultant c ON q.teacher_id = c.ConsultantID
                WHERE 
                    q.student_id = :student_id
                ORDER BY 
                    CASE 
                        WHEN q.urgency = 'Urgent' THEN 1
                        ELSE 2
                    END,
                    q.time_created ASC";

            $stmt = $this->pdo->prepare($sqlStr);
            $stmt->bindParam(':student_id', $student_Id, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if ($result) {
                return $this->sendPayLoad($result, "success", "Successfully retrieved appointments with user and consultant names.", 200);
            } else {
                return $this->sendPayLoad([], "success", "No appointments found for the teacher.", 200);
            }
        } else {
            http_response_code(401);
            echo json_encode(array('message' => 'Token is invalid or Authorization header is missing'));
        }
    }
    public function get_queue_teacher($teacher_Id)
    {
        $tokenInfo = $this->middleware->validateToken();
        if ($tokenInfo) {
            // Modified SQL query to join user and consultant tables
            $sqlStr = "
                SELECT 
                    q.*,
                    CONCAT(u.FirstName, ' ', u.LastName) AS student_name,
                    CONCAT(c.first_name, ' ', c.last_name) AS teacher_name
                FROM 
                    queue q
                JOIN 
                    user u ON q.student_id = u.UserID
                JOIN 
                    consultant c ON q.teacher_id = c.ConsultantID
                WHERE 
                    q.teacher_id = :teacher_id
                ORDER BY 
                    CASE 
                        WHEN q.urgency = 'Urgent' THEN 1
                        ELSE 2
                    END,
                    q.time_created ASC";

            $stmt = $this->pdo->prepare($sqlStr);
            $stmt->bindParam(':teacher_id', $teacher_Id, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if ($result) {
                return $this->sendPayLoad($result, "success", "Successfully retrieved appointments with user and consultant names.", 200);
            } else {
                return $this->sendPayLoad([], "success", "No appointments found for the teacher.", 200);
            }
        } else {
            http_response_code(401);
            echo json_encode(array('message' => 'Token is invalid or Authorization header is missing'));
        }
    }
    public function get_specific_queue_teacher($teacher_Id, $queue_Id)
    {
        $tokenInfo = $this->middleware->validateToken();
        if ($tokenInfo) {
            // Modified SQL query to join user and consultant tables
            $sqlStr = "
                SELECT 
                    q.*,
                    CONCAT(u.FirstName, ' ', u.LastName) AS student_name,
                    CONCAT(c.first_name, ' ', c.last_name) AS teacher_name
                FROM 
                    queue q
                JOIN 
                    user u ON q.student_id = u.UserID
                JOIN 
                    consultant c ON q.teacher_id = c.ConsultantID
                WHERE 
                    q.teacher_id = :teacher_id AND q.queue_id = :queue_id
                ORDER BY 
                    CASE 
                        WHEN q.urgency = 'Urgent' THEN 1
                        ELSE 2
                    END,
                    q.time_created ASC";

            $stmt = $this->pdo->prepare($sqlStr);
            $stmt->bindParam(':teacher_id', $teacher_Id, PDO::PARAM_INT);
            $stmt->bindParam(':queue_id', $queue_Id, PDO::PARAM_INT);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if ($result) {
                return $this->sendPayLoad($result, "success", "Successfully retrieved appointments with user and consultant names.", 200);
            } else {
                return $this->sendPayLoad(null, "failed", "Failed to pull data.", 404);
            }
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

            return $this->sendPayLoad([], "success", "No appointments found for the teacher.", 200);
        } else {
            http_response_code(401);
            echo json_encode(array('message' => 'Token is invalid or Authorization header is missing'));
        }
    }
    public function is_schedule_occupied($teacher_id, $date)
    {
        $tokenInfo = $this->middleware->validateToken();
        if ($tokenInfo) {
            //Decode Date
            $decodedDate = base64_decode($date);
            // Modified SQL query to join user and consultant tables
            $sqlStr = "SELECT *
            FROM appointment
            WHERE ConsultantId = $teacher_id
            AND AppointmentDate = '$decodedDate'
            AND status = 1
            LIMIT 25"; // Limit the number of returned rows to 25

            $result = $this->executeQuery($sqlStr);

            if ($result['code'] == 200) {
                if (count($result['data']) > 0) {
                    return $this->sendPayLoad($result['data'], "success", "Successfully retrieved schedules.", $result['code']);
                } else {
                    return $decodedDate;
                }
            }

            return null;
        } else {
            http_response_code(401);
            echo json_encode(array('message' => 'Token is invalid or Authorization header is missing'));
        }
    }
    public function has_existing_appointment($teacher_id)
    {
        $tokenInfo = $this->middleware->validateToken();
        if ($tokenInfo) {
            //Get User ID
            $userId = $tokenInfo->user_id;
            // Modified SQL query to join user and consultant tables
            $sqlStr = "SELECT *
            FROM appointment
            WHERE user_id = $userId
            AND Completed = 0
            AND ConsultantId = $teacher_id";

            $result = $this->executeQuery($sqlStr);

            if ($result['code'] == 200) {
                if (count($result['data']) > 0) {
                    return true;
                } else {
                    return false;
                }
            }

            return false;
        } else {
            http_response_code(401);
            echo json_encode(array('message' => 'Token is invalid or Authorization header is missing'));
        }
    }
    public function get_notifications_student()
    {
        $tokenInfo = $this->middleware->validateToken();
        if ($tokenInfo) {
            $sqlStr = "SELECT *
                       FROM notification
                       WHERE UserID = $tokenInfo->user_id
                       ORDER BY NotificationAt DESC";

            $result = $this->executeQuery($sqlStr);

            if ($result['code'] == 200) {
                if (count($result['data']) > 0) {
                    return $this->sendPayLoad($result['data'], "success", "Successfully retrieved notifications.", $result['code']);
                } else {
                    return $this->sendPayLoad([], "success", "No appointments found for the teacher.", 200);
                }
            }

            return $this->sendPayLoad([], "success", "No appointments found for the teacher.", 200);
        } else {
            http_response_code(401);
            echo json_encode(array('message' => 'Token is invalid or Authorization header is missing'));
        }
    }
    public function get_notifications_teacher()
    {
        $tokenInfo = $this->middleware->validateToken();
        if ($tokenInfo) {
            $sqlStr = "SELECT *
                       FROM notification
                       WHERE ConsultantID = $tokenInfo->user_id
                       ORDER BY NotificationAt DESC";

            $result = $this->executeQuery($sqlStr);

            if ($result['code'] == 200) {
                if (count($result['data']) > 0) {
                    return $this->sendPayLoad($result['data'], "success", "Successfully retrieved notifications.", $result['code']);
                } else {
                    return null;
                }
            }

            return $this->sendPayLoad(null, "failed", "Failed to pull data.", $result['code']);
        } else {
            http_response_code(401);
            echo json_encode(array('message' => 'Token is invalid or Authorization header is missing'));
        }
    }
    //Analytics
    public function get_ratings()
    {
        $tokenInfo = $this->middleware->validateToken();
        if ($tokenInfo) {
            $sqlStr = "SELECT ConsultantID, AppointmentDate, AVG(rating) as rating
                   FROM appointment
                   WHERE ConsultantID = $tokenInfo->user_id AND rating IS NOT NULL
                   GROUP BY ConsultantID, DATE(AppointmentDate)
                   ORDER BY DATE(AppointmentDate) ASC";

            $result = $this->executeQuery($sqlStr);

            if ($result['code'] == 200) {
                if (count($result['data']) > 0) {
                    return $this->sendPayLoad($result['data'], "success", "Successfully retrieved notifications.", $result['code']);
                } else {
                    return null;
                }
            }

            return $this->sendPayLoad(null, "failed", "Failed to pull data.", $result['code']);
        } else {
            http_response_code(401);
            echo json_encode(array('message' => 'Token is invalid or Authorization header is missing'));
        }
    }
    public function get_ratings_weekly()
    {
        $tokenInfo = $this->middleware->validateToken();
        if ($tokenInfo) {
            $sqlStr = "SELECT ConsultantID, 
                          CONCAT(
                              DATE_FORMAT(STR_TO_DATE(CONCAT(YEAR(AppointmentDate), WEEK(AppointmentDate), '1'), '%X%V%w'), '%m/%d'),
                              ' - ',
                              DATE_FORMAT(DATE_ADD(STR_TO_DATE(CONCAT(YEAR(AppointmentDate), WEEK(AppointmentDate), '1'), '%X%V%w'), INTERVAL 6 DAY), '%m/%d')
                          ) AS AppointmentDate,
                          AVG(rating) as rating
                        FROM appointment
                        WHERE ConsultantID = $tokenInfo->user_id AND rating IS NOT NULL
                        GROUP BY ConsultantID, YEAR(AppointmentDate), WEEK(AppointmentDate)
                        ORDER BY YEAR(AppointmentDate) ASC, WEEK(AppointmentDate) ASC";

            $result = $this->executeQuery($sqlStr);

            if ($result['code'] == 200) {
                if (count($result['data']) > 0) {
                    return $this->sendPayLoad($result['data'], "success", "Successfully retrieved notifications.", $result['code']);
                } else {
                    return null;
                }
            }

            return $this->sendPayLoad(null, "failed", "Failed to pull data.", $result['code']);
        } else {
            http_response_code(401);
            echo json_encode(array('message' => 'Token is invalid or Authorization header is missing'));
        }
    }
    public function get_ratings_monthly()
    {
        $tokenInfo = $this->middleware->validateToken();
        if ($tokenInfo) {
            $sqlStr = "SELECT ConsultantID, 
                          DATE_FORMAT(AppointmentDate, '%M %Y') as AppointmentDate, 
                          AVG(rating) as rating
                   FROM appointment
                   WHERE ConsultantID = $tokenInfo->user_id AND rating IS NOT NULL
                   GROUP BY ConsultantID, DATE_FORMAT(AppointmentDate, '%M %Y')
                   ORDER BY DATE_FORMAT(AppointmentDate, '%Y-%m') ASC";

            $result = $this->executeQuery($sqlStr);

            if ($result['code'] == 200) {
                if (count($result['data']) > 0) {
                    return $this->sendPayLoad($result['data'], "success", "Successfully retrieved notifications.", $result['code']);
                } else {
                    return null;
                }
            }

            return $this->sendPayLoad(null, "failed", "Failed to pull data.", $result['code']);
        } else {
            http_response_code(401);
            echo json_encode(array('message' => 'Token is invalid or Authorization header is missing'));
        }
    }
    public function get_appointments_daily()
    {
        $tokenInfo = $this->middleware->validateToken();
        if ($tokenInfo) {
            $sqlStr = "SELECT
                            DATE_FORMAT(dates.AppointmentDay, '%m/%d/%y') AS AppointmentDay,
                            COALESCE(appt.CompletedCount, 0) AS CompletedCount,
                            COALESCE(appt.ConfirmedCount, 0) AS ConfirmedCount,
                            COALESCE(q.PendingCount, 0) AS PendingCount
                        FROM (
                            SELECT DISTINCT DATE(AppointmentDate) AS AppointmentDay
                            FROM appointment
                            WHERE ConsultantID = $tokenInfo->user_id
                            UNION
                            SELECT DISTINCT DATE(time_created) AS AppointmentDay
                            FROM queue
                            WHERE teacher_id = $tokenInfo->user_id
                        ) dates
                        LEFT JOIN (
                            SELECT
                                DATE(AppointmentDate) AS AppointmentDay,
                                SUM(CASE WHEN Completed = 1 THEN 1 ELSE 0 END) AS CompletedCount,
                                SUM(CASE WHEN Completed = 0 THEN 1 ELSE 0 END) AS ConfirmedCount
                            FROM
                                appointment
                            WHERE ConsultantID = $tokenInfo->user_id
                            GROUP BY
                                DATE(AppointmentDate)
                        ) appt ON dates.AppointmentDay = appt.AppointmentDay
                        LEFT JOIN (
                            SELECT
                                DATE(time_created) AS AppointmentDay,
                                COUNT(*) AS PendingCount
                            FROM
                                queue
                            WHERE teacher_id = $tokenInfo->user_id
                            GROUP BY
                                DATE(time_created)
                        ) q ON dates.AppointmentDay = q.AppointmentDay
                        ORDER BY
                            dates.AppointmentDay;
                                                ";

            $result = $this->executeQuery($sqlStr);

            if ($result['code'] == 200) {
                if (count($result['data']) > 0) {
                    return $this->sendPayLoad($result['data'], "success", "Successfully retrieved notifications.", $result['code']);
                } else {
                    return null;
                }
            }

            return $this->sendPayLoad(null, "failed", "Failed to pull data.", $result['code']);
        } else {
            http_response_code(401);
            echo json_encode(array('message' => 'Token is invalid or Authorization header is missing'));
        }
    }
    public function get_appointments_weekly()
    {
        $tokenInfo = $this->middleware->validateToken();
        if ($tokenInfo) {
            $sqlStr = "SELECT
                            CONCAT(
                                DATE_FORMAT(STR_TO_DATE(CONCAT(YEAR(dates.AppointmentDay), WEEK(dates.AppointmentDay), '1'), '%X%V%w'), '%m/%d'),
                                ' - ',
                                DATE_FORMAT(DATE_ADD(STR_TO_DATE(CONCAT(YEAR(dates.AppointmentDay), WEEK(dates.AppointmentDay), '1'), '%X%V%w'), INTERVAL 6 DAY), '%m/%d')
                            ) AS AppointmentDay,
                            COALESCE(SUM(appt.CompletedCount), 0) AS CompletedCount,
                            COALESCE(SUM(appt.ConfirmedCount), 0) AS ConfirmedCount,
                            COALESCE(SUM(q.PendingCount), 0) AS PendingCount
                        FROM (
                            SELECT DISTINCT DATE(AppointmentDate) AS AppointmentDay
                            FROM appointment
                            WHERE ConsultantID = $tokenInfo->user_id
                            UNION
                            SELECT DISTINCT DATE(time_created) AS AppointmentDay
                            FROM queue
                            WHERE teacher_id = $tokenInfo->user_id
                        ) dates
                        LEFT JOIN (
                            SELECT
                                DATE(AppointmentDate) AS AppointmentDay,
                                SUM(CASE WHEN Completed = 1 THEN 1 ELSE 0 END) AS CompletedCount,
                                SUM(CASE WHEN Completed = 0 THEN 1 ELSE 0 END) AS ConfirmedCount
                            FROM
                                appointment
                            WHERE ConsultantID = $tokenInfo->user_id
                            GROUP BY
                                DATE(AppointmentDate)
                        ) appt ON dates.AppointmentDay = appt.AppointmentDay
                        LEFT JOIN (
                            SELECT
                                DATE(time_created) AS AppointmentDay,
                                COUNT(*) AS PendingCount
                            FROM
                                queue
                            WHERE teacher_id = $tokenInfo->user_id
                            GROUP BY
                                DATE(time_created)
                        ) q ON dates.AppointmentDay = q.AppointmentDay
                        GROUP BY
                            WEEK(dates.AppointmentDay), YEAR(dates.AppointmentDay)
                        ORDER BY
                            dates.AppointmentDay;
                        ";

            $result = $this->executeQuery($sqlStr);

            if ($result['code'] == 200) {
                if (count($result['data']) > 0) {
                    return $this->sendPayLoad($result['data'], "success", "Successfully retrieved notifications.", $result['code']);
                } else {
                    return null;
                }
            }

            return $this->sendPayLoad(null, "failed", "Failed to pull data.", $result['code']);
        } else {
            http_response_code(401);
            echo json_encode(array('message' => 'Token is invalid or Authorization header is missing'));
        }
    }

    public function get_appointments_monthly()
    {
        $tokenInfo = $this->middleware->validateToken();
        if ($tokenInfo) {
            $sqlStr = "SELECT
                        DATE_FORMAT(dates.AppointmentDay, '%M %Y') AS AppointmentDay,
                        COALESCE(SUM(appt.CompletedCount), 0) AS CompletedCount,
                        COALESCE(SUM(appt.ConfirmedCount), 0) AS ConfirmedCount,
                        COALESCE(SUM(q.PendingCount), 0) AS PendingCount
                    FROM (
                        SELECT DISTINCT DATE(AppointmentDate) AS AppointmentDay
                        FROM appointment
                        WHERE ConsultantID = $tokenInfo->user_id
                        UNION
                        SELECT DISTINCT DATE(time_created) AS AppointmentDay
                        FROM queue
                        WHERE teacher_id = $tokenInfo->user_id
                    ) dates
                    LEFT JOIN (
                        SELECT
                            DATE(AppointmentDate) AS AppointmentDay,
                            SUM(CASE WHEN Completed = 1 THEN 1 ELSE 0 END) AS CompletedCount,
                            SUM(CASE WHEN Completed = 0 THEN 1 ELSE 0 END) AS ConfirmedCount
                        FROM
                            appointment
                        WHERE ConsultantID = $tokenInfo->user_id
                        GROUP BY
                            DATE(AppointmentDate)
                    ) appt ON dates.AppointmentDay = appt.AppointmentDay
                    LEFT JOIN (
                        SELECT
                            DATE(time_created) AS AppointmentDay,
                            COUNT(*) AS PendingCount
                        FROM
                            queue
                        WHERE teacher_id = $tokenInfo->user_id
                        GROUP BY
                            DATE(time_created)
                    ) q ON dates.AppointmentDay = q.AppointmentDay
                    GROUP BY
                        YEAR(dates.AppointmentDay), MONTH(dates.AppointmentDay)
                    ORDER BY
                        YEAR(dates.AppointmentDay), MONTH(dates.AppointmentDay);
                    ";

            $result = $this->executeQuery($sqlStr);

            if ($result['code'] == 200) {
                if (count($result['data']) > 0) {
                    return $this->sendPayLoad($result['data'], "success", "Successfully retrieved notifications.", $result['code']);
                } else {
                    return null;
                }
            }

            return $this->sendPayLoad(null, "failed", "Failed to pull data.", $result['code']);
        } else {
            http_response_code(401);
            echo json_encode(array('message' => 'Token is invalid or Authorization header is missing'));
        }
    }
    //Admin
    public function admin_get_appointments_daily()
    {
        $tokenInfo = $this->middleware->validateToken();
        if ($tokenInfo) {
            $sqlStr = "SELECT
                            DATE_FORMAT(dates.AppointmentDay, '%m/%d/%y') AS AppointmentDay,
                            COALESCE(appt.CompletedCount, 0) AS CompletedCount,
                            COALESCE(appt.ConfirmedCount, 0) AS ConfirmedCount,
                            COALESCE(q.PendingCount, 0) AS PendingCount
                        FROM (
                            SELECT DISTINCT DATE(AppointmentDate) AS AppointmentDay
                            FROM appointment
                            UNION
                            SELECT DISTINCT DATE(time_created) AS AppointmentDay
                            FROM queue
                        ) dates
                        LEFT JOIN (
                            SELECT
                                DATE(AppointmentDate) AS AppointmentDay,
                                SUM(CASE WHEN Completed = 1 THEN 1 ELSE 0 END) AS CompletedCount,
                                SUM(CASE WHEN Completed = 0 THEN 1 ELSE 0 END) AS ConfirmedCount
                            FROM
                                appointment
                            GROUP BY
                                DATE(AppointmentDate)
                        ) appt ON dates.AppointmentDay = appt.AppointmentDay
                        LEFT JOIN (
                            SELECT
                                DATE(time_created) AS AppointmentDay,
                                COUNT(*) AS PendingCount
                            FROM
                                queue
                            GROUP BY
                                DATE(time_created)
                        ) q ON dates.AppointmentDay = q.AppointmentDay
                        ORDER BY
                            dates.AppointmentDay;
                                                ";

            $result = $this->executeQuery($sqlStr);

            if ($result['code'] == 200) {
                if (count($result['data']) > 0) {
                    return $this->sendPayLoad($result['data'], "success", "Successfully retrieved notifications.", $result['code']);
                } else {
                    return null;
                }
            }

            return $this->sendPayLoad(null, "failed", "Failed to pull data.", $result['code']);
        } else {
            http_response_code(401);
            echo json_encode(array('message' => 'Token is invalid or Authorization header is missing'));
        }
    }
    public function getStudentCount()
    {
        try {
            // SQL query to count the number of students
            $sql = "SELECT COUNT(*) FROM user";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();

            // Fetch the count
            $studentCount = $stmt->fetchColumn();

            return $studentCount;
        } catch (PDOException $e) {
            // Handle the exception (e.g., log error, return error message)
            error_log("Database error: " . $e->getMessage());
            return "Error retrieving student count: " . $e->getMessage();
        }
    }
    public function getConsultantCount()
    {
        try {
            // SQL query to count the number of students
            $sql = "SELECT COUNT(*) FROM consultant";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();

            // Fetch the count
            $studentCount = $stmt->fetchColumn();

            return $studentCount;
        } catch (PDOException $e) {
            // Handle the exception (e.g., log error, return error message)
            error_log("Database error: " . $e->getMessage());
            return "Error retrieving student count: " . $e->getMessage();
        }
    }
    public function getAllActionLogs()
    {
        try {
            // SQL query to get all action logs
            $sql = "SELECT *, DATE_FORMAT(action_time, '%m/%d/%Y %H:%i') AS action_time 
            FROM action_logs 
            ORDER BY action_time DESC";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();

            // Fetch all action logs
            $actionLogs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $actionLogs;
        } catch (PDOException $e) {
            // Handle the exception (e.g., log error, return error message)
            error_log("Database error: " . $e->getMessage());
            return "Error retrieving action logs: " . $e->getMessage();
        }
    }
    public function getLast7DaysActionLogs()
    {
        try {
            // SQL query to get the last 7 days, even if they have no logs
            $sql = "
                SELECT
                    days.DayName,
                    IFNULL(COUNT(al.action_time), 0) AS DailyCount
                FROM (
                    -- Generate the last 7 days
                    SELECT 
                        DATE_FORMAT(NOW() - INTERVAL n DAY, '%a') AS DayName, 
                        CURDATE() - INTERVAL n DAY AS Date
                    FROM (
                        SELECT 0 as n UNION ALL SELECT 1 UNION ALL SELECT 2 
                        UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 
                        UNION ALL SELECT 6
                    ) numbers
                ) days
                LEFT JOIN action_logs al
                    ON DATE(al.action_time) = days.Date
                GROUP BY days.DayName
                ORDER BY days.Date ASC";

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();

            // Fetch the action logs, including empty days
            $actionLogs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $actionLogs;
        } catch (PDOException $e) {
            // Handle the exception (e.g., log error, return error message)
            error_log("Database error: " . $e->getMessage());
            return "Error retrieving action logs: " . $e->getMessage();
        }
    }

    public function getLoginCountPerDay()
    {
        try {
            // SQL query to get login count per day
            $sql = "SELECT DATE(login_time) AS login_date, COUNT(*) AS login_count
                FROM admin_login_logs
                GROUP BY login_date
                ORDER BY login_date DESC";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();

            // Fetch the results
            $loginCounts = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $loginCounts;
        } catch (PDOException $e) {
            // Handle the exception (e.g., log error, return error message)
            error_log("Database error: " . $e->getMessage());
            return "Error retrieving login counts: " . $e->getMessage();
        }
    }

    public function getAllLoginLogs()
    {
        try {
            // SQL query to get all login logs
            $sql = "SELECT * FROM admin_login_logs ORDER BY login_time DESC";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();

            // Fetch all login logs
            $loginLogs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $loginLogs;
        } catch (PDOException $e) {
            // Handle the exception (e.g., log error, return error message)
            error_log("Database error: " . $e->getMessage());
            return "Error retrieving login logs: " . $e->getMessage();
        }
    }
    public function getAppointmentCount()
    {
        try {
            // SQL query to count all appointments
            $sql = "SELECT COUNT(*) FROM appointment";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();

            // Fetch the count
            $count = $stmt->fetchColumn();

            return $count;
        } catch (PDOException $e) {
            // Handle the exception (e.g., log error, return error message)
            error_log("Database error: " . $e->getMessage());
            return "Error retrieving appointment count: " . $e->getMessage();
        }
    }
    public function getDailyAppointmentCount()
    {
        try {
            // SQL query to get the daily count of appointments in the last 7 days with day names
            $sql = "SELECT
                        DAYNAME(dates.AppointmentDay) AS DayName,
                        COALESCE(appt.DailyCount, 0) as DailyCount
                    FROM (
                        SELECT CURDATE() as AppointmentDay
                        UNION ALL
                        SELECT CURDATE() - INTERVAL 1 DAY
                        UNION ALL
                        SELECT CURDATE() - INTERVAL 2 DAY
                        UNION ALL
                        SELECT CURDATE() - INTERVAL 3 DAY
                        UNION ALL
                        SELECT CURDATE() - INTERVAL 4 DAY
                        UNION ALL
                        SELECT CURDATE() - INTERVAL 5 DAY
                        UNION ALL
                        SELECT CURDATE() - INTERVAL 6 DAY
                    ) dates
                    LEFT JOIN (
                        SELECT DATE(AppointmentDate) as AppointmentDay, COUNT(*) as DailyCount
                        FROM appointment
                        WHERE AppointmentDate >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                        GROUP BY DATE(AppointmentDate)
                    ) appt ON dates.AppointmentDay = appt.AppointmentDay
                    ORDER BY dates.AppointmentDay ASC";

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();

            // Fetch the result set
            $dailyCounts = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Return the data as a JSON response
            return $this->sendPayLoad($dailyCounts, "success", "Successfully retrieved daily appointment counts for the last 7 days.", 200);
        } catch (PDOException $e) {
            // Handle errors
            error_log("Database error: " . $e->getMessage());
            return $this->sendPayLoad(null, "failed", "Error retrieving daily appointment count: " . $e->getMessage(), 500);
        }
    }



    public function getCount()
    {
        try {
            // SQL query to count all appointments
            $sql = "SELECT COUNT(*) FROM appointment";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();

            // Fetch the count
            $count = $stmt->fetchColumn();

            return $count;
        } catch (PDOException $e) {
            // Handle the exception (e.g., log error, return error message)
            error_log("Database error: " . $e->getMessage());
            return "Error retrieving appointment count: " . $e->getMessage();
        }
    }
    public function getQueueCount()
    {
        try {
            // SQL query to count all queues
            $sql = "SELECT COUNT(*) FROM queue";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();

            // Fetch the count
            $count = $stmt->fetchColumn();

            return $count;
        } catch (PDOException $e) {
            // Handle the exception (e.g., log error, return error message)
            error_log("Database error: " . $e->getMessage());
            return "Error retrieving queue count: " . $e->getMessage();
        }
    }
}
