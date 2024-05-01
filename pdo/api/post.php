<?php
require __DIR__ . '\vendor\autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Post
{

    private $pdo;
    private $secretKey;

    #constructor
    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->secretKey = "secretkey";
    }
    public function sendPayLoad($data, $remarks, $message, $code)
    {
        $status = array("remarks" => $remarks, "message" => $message);
        http_response_code($code);

        return array(
            "status" => $status,
            "data" => $data,  // Include data in the response
            "prepared_by" => "AppointMe",
            "timestamp" => date_create(),
            "code" => $code  // Include code in the response
        );
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
    public function register($data)
    {
        // Variables
        $email = $data->email;
        $fname = $data->fname;
        $lname = $data->lname;
        $birthday = $data->birthday;
        $gender = $data->gender;
        $course = $data->course;
        $year = $data->year;
        $block = $data->block;
        $password = $data->password;

        // Check if the email already exists
        $emailCheckSql = "SELECT COUNT(*) FROM `user` WHERE `Email` = :email";
        $emailCheckStmt = $this->pdo->prepare($emailCheckSql);
        $emailCheckStmt->bindParam(':email', $email);
        $emailCheckStmt->execute();

        if ($emailCheckStmt->fetchColumn() > 0) {
            // Email already exists, return a response indicating that
            return 2;
        }

        // Proceed with the insertion
        $insertSql = "INSERT INTO `user` (`Email`, `FirstName`, `LastName`, `bday`, `gender`, `Course`, `year`, `block`, `Password`) 
        VALUES (:email, :fname, :lname, :birthday, :gender, :course, :year, :block, :password)";

        $insertStmt = $this->pdo->prepare($insertSql);

        // Bind Parameters
        $insertStmt->bindParam(':email', $email);
        $insertStmt->bindParam(':fname', $fname);
        $insertStmt->bindParam(':lname', $lname);
        $insertStmt->bindParam(':birthday', $birthday);
        $insertStmt->bindParam(':gender', $gender);
        $insertStmt->bindParam(':course', $course);
        $insertStmt->bindParam(':year', $year);
        $insertStmt->bindParam(':block', $block);
        $insertStmt->bindParam(':password', $password);
        // Execute SQL
        try {
            $insertStmt->execute();
            $userId = $this->pdo->lastInsertId(); // Get the user ID after insertion

            $payload = array(
                'user_id' => $userId,
                'iss' => 'AppointMe',
                'iat' => time(),
                'exp' => time() + 7200,
                'type' => 'student'
            );

            $token = JWT::encode($payload, $this->secretKey, 'HS256');
            // Return the token or any other response to the client
            return $token;
        } catch (PDOException $e) {
            return 1;
        }
    }
    public function registerTeacher($data)
    {
        // Variables
        $email = $data->email;
        $fname = $data->fname;
        $lname = $data->lname;
        $birthday = $data->birthday;
        $gender = $data->gender;
        $password = $data->password;

        // Check if the email already exists
        $emailCheckSql = "SELECT COUNT(*) FROM `consultant` WHERE `Email` = :email";
        $emailCheckStmt = $this->pdo->prepare($emailCheckSql);
        $emailCheckStmt->bindParam(':email', $email);
        $emailCheckStmt->execute();

        if ($emailCheckStmt->fetchColumn() > 0) {
            // Email already exists, return a response indicating that
            return 2;
        }

        // Proceed with the insertion
        $insertSql = "INSERT INTO `consultant` (`Email`, `first_name`, `last_name`, `bday`, `gender`, `Password`) 
        VALUES (:email, :fname, :lname, :birthday, :gender, :password)";

        $insertStmt = $this->pdo->prepare($insertSql);

        // Bind Parameters
        $insertStmt->bindParam(':email', $email);
        $insertStmt->bindParam(':fname', $fname);
        $insertStmt->bindParam(':lname', $lname);
        $insertStmt->bindParam(':birthday', $birthday);
        $insertStmt->bindParam(':gender', $gender);
        $insertStmt->bindParam(':password', $password);
        // Execute SQL
        try {
            $insertStmt->execute();
            $userId = $this->pdo->lastInsertId(); // Get the user ID after insertion

            $payload = array(
                'user_id' => $userId,
                'iss' => 'AppointMe',
                'iat' => time(),
                'exp' => time() + 3600,
                'type' => 'teacher'
            );

            $token = JWT::encode($payload, $this->secretKey, 'HS256');
            // Return the token or any other response to the client
            return $token;
        } catch (PDOException $e) {
            return $e;
        }
    }
    public function login($data)
    {
        // Variables
        $email = $data->email;
        $password = $data->password;
        // SQL
        $sql = "SELECT * FROM user WHERE Email = :email";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':email', $email, PDO::PARAM_STR);
        $stmt->execute();
        // If User Found
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            if ($password == $user['Password']) {
                // Use the correct column name for user ID
                $payload = [
                    'iss' => 'AppointMe',
                    'iat' => time(),
                    'exp' => time() + 7200,
                    'user_id' => $user['UserID'],
                    'type' => 'student'
                ];

                $jwt = JWT::encode($payload, $this->secretKey, 'HS256');
                return $jwt;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    public function login_teacher($data)
    {
        // Variables
        $email = $data->email;
        $password = $data->password;
        // SQL
        $sql = "SELECT * FROM consultant WHERE Email = :email";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':email', $email, PDO::PARAM_STR);
        $stmt->execute();
        // If User Found
        $consultant = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($consultant) {
            if ($password == $consultant['Password']) {
                // Use the correct column name for user ID
                $payload = [
                    'iss' => 'AppointMe',
                    'iat' => time(),
                    'exp' => time() + 7200,
                    'user_id' => $consultant['ConsultantID'],
                    'type' => 'teacher'
                ];

                $jwt = JWT::encode($payload, $this->secretKey, 'HS256');
                return $jwt;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    public function approveTeacher($data)
    {
        try {
            //Authenticate User
            $jwt = $data->key;
            error_log("JWT Token: " . $jwt);
            $key = JWT::decode($jwt, new Key($this->secretKey, 'HS256'));
            // Check authorization here (example: verify that the user is authorized to create an appointment)
            if ($key->type !== 'teacher') {
                return "Unauthorized: Only the Head Teacher is allowed to approve registrations.";
            }
            //Get Teacher ID
            $appointmentId = $data->teacher_id;
            // SQL query to validate user authority and check appointment status
            $sqlValidation = "SELECT * FROM consultant WHERE ConsultantID = $appointmentId";
            $validationResult = $this->executeQuery($sqlValidation);

            if ($validationResult['code'] == 200 && !empty($validationResult['data'])) {
                $appointmentStatus = $validationResult['data'][0]['approved'];

                if ($appointmentStatus == 1) {
                    // Appointment is already confirmed
                    return $this->sendPayLoad(null, "failed", "Teacher is already approved.", 400);
                }

                // SQL query to update the status to 1 (confirmed)
                $sqlUpdate = "UPDATE consultant SET approved = 1 WHERE ConsultantID = $appointmentId";
                $updateResult = $this->executeQuery($sqlUpdate);

                if ($updateResult == true) {
                    return "Teacher approved successfully.";
                } else {
                    return "Failed to approve teacher.";
                }
            } else {
                return "User is not authorized to confirm this appointment.";
            }
        } catch (\Firebase\JWT\ExpiredException $e) {
            return "Unauthorized: Token has expired.";
        } catch (\Firebase\JWT\BeforeValidException $e) {
            return "Unauthorized: Token is not yet valid.";
        } catch (\Firebase\JWT\SignatureInvalidException $e) {
            return "Unauthorized: Invalid token signature.";
        } catch (PDOException $e) {
            // Handle the exception, return an error response, or log the error
            return "Error approving teacher" . $e;
        }
    }
    public function reject_teacher($data)
    {
        try {
            $teacher_Id = $data->teacher_id;

            // Check if the teacher is not approved before attempting deletion
            $check_sql = "SELECT approved FROM consultant WHERE ConsultantID = :teacher_id";
            $check_stmt = $this->pdo->prepare($check_sql);
            $check_stmt->bindParam(':teacher_id', $teacher_Id);
            $check_stmt->execute();
            $result = $check_stmt->fetch(PDO::FETCH_ASSOC);

            if (!$result || $result['approved'] != 0) {
                return $this->sendPayLoad(null, "failed", "Teacher is already approved or not found.", 404);
            }

            // Delete the teacher if approved column is 0
            $delete_sql = "DELETE FROM consultant WHERE ConsultantID = :teacher_id";
            $delete_stmt = $this->pdo->prepare($delete_sql);
            $delete_stmt->bindParam(':teacher_id', $teacher_Id);
            $delete_stmt->execute();

            // Check if any rows were affected (appointment deleted successfully)
            $rowCount = $delete_stmt->rowCount();

            if ($rowCount > 0) {
                return $this->sendPayLoad(null, "success", "Registration rejected successfully.", 200);
            } else {
                return $this->sendPayLoad(null, "failed", "Failed to reject registration. Appointment not found.", 404);
            }
        } catch (\Firebase\JWT\ExpiredException $e) {
            return "Unauthorized: Token has expired.";
        } catch (\Firebase\JWT\BeforeValidException $e) {
            return "Unauthorized: Token is not yet valid.";
        } catch (\Firebase\JWT\SignatureInvalidException $e) {
            return "Unauthorized: Invalid token signature.";
        } catch (\PDOException $e) {
            // Handle the exception, return an error response, or log the error
            return "Error rejecting teacher: " . $e->getMessage();
        }
    }
    public function create_appointment($data)
    {
        try {
            $jwt = $data->key;
            error_log("JWT Token: " . $jwt);
            $key = JWT::decode($jwt, new Key($this->secretKey, 'HS256'));
            // Check authorization here (example: verify that the user is authorized to create an appointment)
            if ($key->type !== 'student') {
                return "Unauthorized: Only students are allowed to create appointments.";
            }
            $user_id = $key->user_id;
            $teacher_id = $data->teacher;
            $date = $data->date;
            $time = $data->time;
            $mode = $data->mode;
            $urgency = $data->urgency;
            $mysqlDatetime = date("Y-m-d H:i:s", strtotime("$date $time"));
            // Retrieve teacher information
            $teacherInfoSql = "SELECT first_name, last_name FROM consultant WHERE ConsultantID = :teacher_id";
            $teacherInfoStmt = $this->pdo->prepare($teacherInfoSql);
            $teacherInfoStmt->bindParam(':teacher_id', $teacher_id);
            $teacherInfoStmt->execute();
            $teacherInfo = $teacherInfoStmt->fetch(PDO::FETCH_ASSOC);

            // Continue
            $teacherFirstName = $teacherInfo['first_name'];
            $teacherLastName = $teacherInfo['last_name'];
            $title = "Meeting with " . $teacherFirstName . " " . $teacherLastName;
            $details = $data->details;
            $status = 0;

            $sql = "INSERT INTO appointment (user_id, ConsultantID, AppointmentDate, appointment_title, AppointmentInfo, status, mode, urgency)
                    VALUES (:user_id, :consultant_id, :appointment_date, :appointment_title, :appointment_info, :status, :mode, :urgency)";

            $stmt = $this->pdo->prepare($sql);

            $stmt->bindParam(':user_id', $user_id);
            $stmt->bindParam(':consultant_id', $teacher_id);
            $stmt->bindParam(':appointment_date', $mysqlDatetime);
            $stmt->bindParam(':appointment_title', $title);
            $stmt->bindParam(':appointment_info', $details);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':mode', $mode);
            $stmt->bindParam(':urgency', $urgency);

            $stmt->execute();

            // Optionally, return success response or handle accordingly
            return "Appointment created successfully.";
        } catch (\Firebase\JWT\ExpiredException $e) {
            return "Unauthorized: Token has expired.";
        } catch (\Firebase\JWT\BeforeValidException $e) {
            return "Unauthorized: Token is not yet valid.";
        } catch (\Firebase\JWT\SignatureInvalidException $e) {
            return "Unauthorized: Invalid token signature.";
        } catch (PDOException $e) {
            // Handle the exception, return an error response, or log the error
            return "Error creating appointment" . $e;
        }
    }
    public function confirm_appointment($data)
    {
        $appointmentId = $data->appointment_id;

        // SQL query to validate user authority and check appointment status
        $sqlValidation = "SELECT * FROM appointment WHERE AppointmentID = $appointmentId";
        $validationResult = $this->executeQuery($sqlValidation);

        if ($validationResult['code'] == 200 && !empty($validationResult['data'])) {
            $appointmentStatus = $validationResult['data'][0]['Status'];

            if ($appointmentStatus == 1) {
                // Appointment is already confirmed
                return $this->sendPayLoad(null, "failed", "Appointment is already confirmed.", 400);
            }

            // SQL query to update the status to 1 (confirmed)
            $sqlUpdate = "UPDATE appointment SET Status = 1 WHERE AppointmentID = $appointmentId";
            $updateResult = $this->executeQuery($sqlUpdate);

            if ($updateResult['code'] == 200) {
                return $this->sendPayLoad(null, "success", "Appointment confirmed successfully.", $updateResult['code']);
            } else {
                return $this->sendPayLoad(null, "failed", "Failed to confirm appointment.", $updateResult['code']);
            }
        } else {
            return $this->sendPayLoad(null, "failed", "User is not authorized to confirm this appointment.", 403);
        }
    }
    public function reject_appointment($data)
    {
        $appointmentId = $data->appointment_id;
        $sql = "DELETE FROM appointment WHERE AppointmentID = :appointment_id";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':appointment_id', $appointmentId);
            $stmt->execute();

            // Check if any rows were affected (appointment deleted successfully)
            $rowCount = $stmt->rowCount();

            if ($rowCount > 0) {
                return $this->sendPayLoad(null, "success", "Appointment rejected and deleted successfully.", 200);
            } else {
                return $this->sendPayLoad(null, "failed", "Failed to reject appointment. Appointment not found.", 404);
            }
        } catch (\PDOException $e) {
            return $this->sendPayLoad(null, "failed", "Error rejecting appointment: " . $e->getMessage(), 500);
        }
    }
}
