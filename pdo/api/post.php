<?php
require __DIR__ . '\vendor\autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

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
    //User Related Functions
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
    public function deleteTeacher($data)
    {
        // ID
        $id = $data->id;
        // Authenticate User
        $jwt = $data->key;

        try {
            $key = JWT::decode($jwt, new Key($this->secretKey, 'HS256'));
        } catch (Exception $e) {
            return "Unauthorized: Invalid JWT token.";
        }

        // Check authorization here (example: verify that the user is authorized to create an appointment)
        if ($key->type !== 'teacher') {
            return "Unauthorized: Only the Head Teacher is allowed to approve registrations.";
        }

        // Delete from consultant table
        $query = "DELETE FROM consultant WHERE ConsultantId = :id";

        try {
            $stmt = $this->pdo->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            if ($stmt->execute()) {
                return true;
            } else {
                return false;
            }
        } catch (PDOException $e) {
            return "Database error: " . $e->getMessage();
        }
    }
    public function updateTeacher($data)
    {
        // Validate input data
        if (!isset($data->consultantId) || !isset($data->column) || !isset($data->value)) {
            throw new InvalidArgumentException('Invalid input data');
        }

        // Extract data from input
        $consultantId = $data->consultantId;
        $column = $data->column;
        $value = $data->value;

        // Prepare SQL statement
        $sqlUpdate = "UPDATE consultant SET $column = :value WHERE ConsultantID = :consultantId";

        try {
            // Prepare the statement
            $stmt = $this->pdo->prepare($sqlUpdate);

            // Bind parameters
            $stmt->bindParam(':value', $value);
            $stmt->bindParam(':consultantId', $consultantId);

            // Execute the statement
            $stmt->execute();

            // Check if any rows were updated
            if ($stmt->rowCount() > 0) {
                return true;
            } else {
                return false;
            }
        } catch (PDOException $e) {
            // Handle exception
            return false;
        }
    }
    public function sendCode($data)
    {
        $email = $data->email;
        $verificationCode = mt_rand(100000, 999999);
        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host = EMAIL_HOST;
            $mail->SMTPAuth = true;
            $mail->Username = EMAIL_USERNAME;
            $mail->Password = EMAIL_PASSWORD;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = EMAIL_PORT;
            $mail->SMTPOptions = array(
                'ssl' => array(
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                )
            );

            $mail->SMTPDebug = 2;

            $mail->setFrom(EMAIL_FROM, 'AppointMe Team');
            $mail->addAddress($email);

            $mail->isHTML(true);
            $mail->Subject = 'Your Verification Code';
            $mail->Body = "Your verification code is: $verificationCode";

            $mail->send();
            echo json_encode([
                'message' => 'Verification code sent',
                'code' => $verificationCode
            ]);
        } catch (Exception $e) {
            echo json_encode(['error' => 'Error sending email: ' . $mail->ErrorInfo]);
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
    //Teacher Related Functio
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
            return "Unauthorized: Token has expired. Please login again.";
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
            return "Unauthorized: Token has expired. Please login again.";
        } catch (\Firebase\JWT\BeforeValidException $e) {
            return "Unauthorized: Token is not yet valid.";
        } catch (\Firebase\JWT\SignatureInvalidException $e) {
            return "Unauthorized: Invalid token signature.";
        } catch (\PDOException $e) {
            // Handle the exception, return an error response, or log the error
            return "Error rejecting teacher: " . $e->getMessage();
        }
    }
    //Appointment Related Functions
    public function create_appointment($data)
    {
        try {
            $jwt = $data->key;
            error_log("JWT Token: " . $jwt);
            $key = JWT::decode($jwt, new Key($this->secretKey, 'HS256'));
            // Check authorization here (example: verify that the user is authorized to create an appointment)
            if ($key->type !== 'teacher') {
                return "Unauthorized: Only teachers are allowed to create appointments.";
            }
            $user_id = $data->user_id;
            $teacher_id = $data->teacher;
            $date = $data->date;
            $time = $data->time;
            $mode = $data->mode;
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

            $sql = "INSERT INTO appointment (user_id, ConsultantID, AppointmentDate, appointment_title, AppointmentInfo, mode)
                    VALUES (:user_id, :consultant_id, :appointment_date, :appointment_title, :appointment_info, :mode)";

            $stmt = $this->pdo->prepare($sql);

            $stmt->bindParam(':user_id', $user_id);
            $stmt->bindParam(':consultant_id', $teacher_id);
            $stmt->bindParam(':appointment_date', $mysqlDatetime);
            $stmt->bindParam(':appointment_title', $title);
            $stmt->bindParam(':appointment_info', $details);
            $stmt->bindParam(':mode', $mode);

            $stmt->execute();

            // Optionally, return success response or handle accordingly
            return "Appointment created successfully.";
        } catch (\Firebase\JWT\ExpiredException $e) {
            return "Unauthorized: Token has expired. Please login again.";
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
    public function complete_appointment($data)
    {
        $appointmentId = $data->appointment_id;

        // SQL query to validate user authority and check appointment status
        $sqlValidation = "SELECT * FROM appointment WHERE AppointmentID = $appointmentId";
        $validationResult = $this->executeQuery($sqlValidation);

        if ($validationResult['code'] == 200 && !empty($validationResult['data'])) {
            $appointmentStatus = $validationResult['data'][0]['Completed'];

            if ($appointmentStatus == 1) {
                // Appointment is already confirmed
                return $this->sendPayLoad(null, "failed", "Appointment is already marked as completed.", 400);
            }

            // SQL query to update the status to 1 (confirmed)
            $sqlUpdate = "UPDATE appointment SET Completed = 1 WHERE AppointmentID = $appointmentId";
            $updateResult = $this->executeQuery($sqlUpdate);

            if ($updateResult['code'] == 200) {
                return $this->sendPayLoad(null, "success", "Appointment completed successfully.", $updateResult['code']);
            } else {
                return $this->sendPayLoad(null, "failed", "Failed to complete appointment.", $updateResult['code']);
            }
        } else {
            return $this->sendPayLoad(null, "failed", "User is not authorized to confirm this appointment.", 403);
        }
    }
    public function rate_appointment($data)
    {
        try {
            $jwt = $data->key;
            error_log("JWT Token: " . $jwt);
            $key = JWT::decode($jwt, new Key($this->secretKey, 'HS256'));
            // Check authorization here (example: verify that the user is authorized to create an appointment)
            if ($key->type !== 'student') {
                return "Unauthorized: Only students are allowed to rate appointments.";
            }
            // The rest of the function
            //Initialize Data
            $appointmentId = $data->appointment_id;
            $appointmentRating = $data->appointment_rating;
            $appointmentRemarks = $data->appointment_remarks;
            //Find Appointment
            $sqlValidation = "SELECT * FROM appointment WHERE AppointmentID = :appointmentId";
            $stmt = $this->pdo->prepare($sqlValidation);
            $stmt->bindParam(':appointmentId', $appointmentId);
            $stmt->execute();
            $validationResult = $stmt->fetch(PDO::FETCH_ASSOC);
            // Check if appointment exists

            // Update Appointment
            $sqlUpdate = "UPDATE appointment SET rating = :rating, remarks = :remarks WHERE AppointmentID = :id";
            $stmt = $this->pdo->prepare($sqlUpdate);
            $stmt->bindParam(':rating', $appointmentRating);
            $stmt->bindParam(':remarks', $appointmentRemarks);
            $stmt->bindParam(':id', $appointmentId);
            $stmt->execute();
            // Optionally, return success response or handle accordingly
            return "Appointment rated successfully.";
        } catch (\Firebase\JWT\ExpiredException $e) {
            return "Unauthorized: Token has expired. Please login again.";
        } catch (\Firebase\JWT\BeforeValidException $e) {
            return "Unauthorized: Token is not yet valid.";
        } catch (\Firebase\JWT\SignatureInvalidException $e) {
            return "Unauthorized: Invalid token signature.";
        } catch (PDOException $e) {
            // Handle the exception, return an error response, or log the error
            return "Error rating appointment" . $e->getMessage();
        }
    }
    //Queue
    public function add_queue($data)
    {
        try {
            $jwt = $data->key;
            error_log("JWT Token: " . $jwt);
            $key = JWT::decode($jwt, new Key($this->secretKey, 'HS256'));
            // Check authorization 
            if ($key->type !== 'student') {
                return "Unauthorized: Only students are allowed to add a queue.";
            }
            $decodedArray = (array) $key;
            $teacher_id = $data->teacher_id;
            $student_id = $decodedArray['user_id'];
            $mode = $data->mode;
            $urgency = $data->urgency;
            $day = $data->day;
            $time = $data->time;
            $reason = $data->reason;
            //Check if already has queue
            $checkSql = "SELECT COUNT(*) FROM `queue` WHERE `teacher_id` = :teacher_id AND `student_id` = :student_id";
            $checkStmt = $this->pdo->prepare($checkSql);
            $checkStmt->bindParam(':teacher_id', $teacher_id, PDO::PARAM_INT);
            $checkStmt->bindParam(':student_id', $student_id, PDO::PARAM_INT);
            $checkStmt->execute();
            $count = $checkStmt->fetchColumn();

            if ($count > 0) {
                return '1';
            }

            //Insert
            $sql = "INSERT INTO `queue` (`teacher_id`, `student_id`, `mode`, `urgency`, `day`, `time`, `reason`)
            VALUES (:teacher_id, :student_id, :mode, :urgency, :day, :time, :reason)";

            $stmt = $this->pdo->prepare($sql);

            // Bind the parameters to the query
            $stmt->bindParam(':teacher_id', $teacher_id, PDO::PARAM_INT);
            $stmt->bindParam(':student_id', $student_id, PDO::PARAM_INT);
            $stmt->bindParam(':mode', $mode, PDO::PARAM_STR);
            $stmt->bindParam(':urgency', $urgency, PDO::PARAM_STR);
            $stmt->bindParam(':day', $day, PDO::PARAM_STR);
            $stmt->bindParam(':time', $time, PDO::PARAM_STR);
            $stmt->bindParam(':reason', $reason, PDO::PARAM_STR);

            if ($stmt->execute()) {
                return '0';
            } else {
                return '2';
            }
        } catch (\Firebase\JWT\ExpiredException $e) {
            return "Unauthorized: Token has expired. Please login again.";
        } catch (\Firebase\JWT\BeforeValidException $e) {
            return "Unauthorized: Token is not yet valid.";
        } catch (\Firebase\JWT\SignatureInvalidException $e) {
            return "Unauthorized: Invalid token signature.";
        } catch (PDOException $e) {
            // Handle the exception, return an error response, or log the error
            return "Error adding you to queue" . $e->getMessage();
        }
    }
    public function add_queue_teacher($data)
    {
        try {
            $jwt = $data->key;
            error_log("JWT Token: " . $jwt);
            $key = JWT::decode($jwt, new Key($this->secretKey, 'HS256'));
            // Check authorization 
            if ($key->type !== 'teacher') {
                return "Unauthorized: Only teachers are allowed to requeue.";
            }
            $teacher_id = $data->teacher_id;
            $student_id = $data->student_id;
            $mode = $data->mode;
            $urgency = $data->urgency;
            $day = $data->day;
            $time = $data->time;
            $reason = $data->reason;
            //Check if already has queue
            $checkSql = "SELECT COUNT(*) FROM `queue` WHERE `teacher_id` = :teacher_id AND `student_id` = :student_id";
            $checkStmt = $this->pdo->prepare($checkSql);
            $checkStmt->bindParam(':teacher_id', $teacher_id, PDO::PARAM_INT);
            $checkStmt->bindParam(':student_id', $student_id, PDO::PARAM_INT);
            $checkStmt->execute();
            $count = $checkStmt->fetchColumn();

            if ($count > 0) {
                return '1';
            }

            //Insert
            $sql = "INSERT INTO `queue` (`teacher_id`, `student_id`, `mode`, `urgency`, `day`, `time`, `reason`)
            VALUES (:teacher_id, :student_id, :mode, :urgency, :day, :time, :reason)";

            $stmt = $this->pdo->prepare($sql);

            // Bind the parameters to the query
            $stmt->bindParam(':teacher_id', $teacher_id, PDO::PARAM_INT);
            $stmt->bindParam(':student_id', $student_id, PDO::PARAM_INT);
            $stmt->bindParam(':mode', $mode, PDO::PARAM_STR);
            $stmt->bindParam(':urgency', $urgency, PDO::PARAM_STR);
            $stmt->bindParam(':day', $day, PDO::PARAM_STR);
            $stmt->bindParam(':time', $time, PDO::PARAM_STR);
            $stmt->bindParam(':reason', $reason, PDO::PARAM_STR);

            if ($stmt->execute()) {
                return '0';
            } else {
                return '2';
            }
        } catch (\Firebase\JWT\ExpiredException $e) {
            return "Unauthorized: Token has expired. Please login again.";
        } catch (\Firebase\JWT\BeforeValidException $e) {
            return "Unauthorized: Token is not yet valid.";
        } catch (\Firebase\JWT\SignatureInvalidException $e) {
            return "Unauthorized: Invalid token signature.";
        } catch (PDOException $e) {
            // Handle the exception, return an error response, or log the error
            return "Error adding you to queue" . $e->getMessage();
        }
    }
    public function update_queue($data)
    {
        try {
            $jwt = $data->key;
            error_log("JWT Token: " . $jwt);
            $key = JWT::decode($jwt, new Key($this->secretKey, 'HS256'));
            // Check authorization here (example: verify that the user is authorized to create an appointment)
            if ($key->type !== 'student') {
                return "Unauthorized: Only students are allowed to add a queue.";
            }
            // Initialize Variables
            $queue_id = $data->queue_id;
            $day = $data->day;
            $time = $data->time;
            $mode = $data->mode;
            $urgency = $data->urgency;

            // Find Queue
            $sqlValidation = "SELECT * FROM queue WHERE queue_id = :queue_id";
            $stmt = $this->pdo->prepare($sqlValidation);
            $stmt->bindParam(':queue_id', $queue_id);
            $stmt->execute();
            $validationResult = $stmt->fetch(PDO::FETCH_ASSOC);

            // Check if the queue with the provided queue_id exists
            if (!$validationResult) {
                return "Error: Queue with queue_id " . $queue_id . " not found.";
            }

            // Update Queue
            $sqlUpdate = "UPDATE queue SET mode = :mode, urgency = :urgency, day = :day, time = :time WHERE queue_id = :queue_id";
            $stmt = $this->pdo->prepare($sqlUpdate);
            $stmt->bindParam(':mode', $mode);
            $stmt->bindParam(':urgency', $urgency);
            $stmt->bindParam(':day', $day);
            $stmt->bindParam(':time', $time);
            $stmt->bindParam(':queue_id', $queue_id);
            $result = $stmt->execute();

            // Check if the update was successful
            if ($result) {
                return "Queue updated successfully.";
            } else {
                $errorInfo = $stmt->errorInfo();
                return "Error: Queue update failed. SQL Error: " . $errorInfo[2];
            }
        } catch (\Firebase\JWT\ExpiredException $e) {
            return "Unauthorized: Token has expired. Please login again.";
        } catch (\Firebase\JWT\BeforeValidException $e) {
            return "Unauthorized: Token is not yet valid.";
        } catch (\Firebase\JWT\SignatureInvalidException $e) {
            return "Unauthorized: Invalid token signature.";
        } catch (PDOException $e) {
            // Handle the exception, return an error response, or log the error
            return "Error updating the queue: " . $e->getMessage();
        }
    }

    public function delete_queue($data)
    {
        try {
            $jwt = $data->key;
            error_log("JWT Token: " . $jwt);
            $key = JWT::decode($jwt, new Key($this->secretKey, 'HS256'));
            // Check authorization here (example: verify that the user is authorized to create an appointment)
            if ($key->type !== 'teacher' && $key->type !== 'student') {
                return "Unauthorized: Only teachers or students are allowed to perform this action.";
            }
            // The rest of the function
            $queueId = $data->queue_id;
            //Insert
            $sql = "DELETE FROM queue WHERE queue_id = :queueId;";

            $stmt = $this->pdo->prepare($sql);

            $stmt->bindParam(':queueId', $queueId);

            $stmt->execute();
            // Optionally, return success response or handle accordingly
            if ($stmt->rowCount() > 0) {
                // Appointment successfully removed
                return "Request removed successfully.";
            } else {
                // No record found with the given scheduleId
                return "No queue found with the given ID.";
            }
        } catch (\Firebase\JWT\ExpiredException $e) {
            return "Unauthorized: Token has expired. Please login again.";
        } catch (\Firebase\JWT\BeforeValidException $e) {
            return "Unauthorized: Token is not yet valid.";
        } catch (\Firebase\JWT\SignatureInvalidException $e) {
            return "Unauthorized: Invalid token signature.";
        } catch (PDOException $e) {
            // Handle the exception, return an error response, or log the error
            return "Error removing the schedule" . $e->getMessage();
        }
    }
    //Teacher Schedule 
    public function add_schedule($data)
    {
        try {
            $jwt = $data->key;
            error_log("JWT Token: " . $jwt);
            $key = JWT::decode($jwt, new Key($this->secretKey, 'HS256'));
            // Check authorization here (example: verify that the user is authorized to create an appointment)
            if ($key->type !== 'teacher') {
                return "Unauthorized: Only students are allowed to add a schedule.";
            }
            // The rest of the function
            $consultantId = $data->teacher_id;
            $startTime = $data->startTime;
            $day = $data->day;
            //Check
            $existingSchedule = $this->checkExistingSchedule($consultantId, $startTime, $day);
            if ($existingSchedule) {
                // Schedule already exists, return custom error code
                return 2;
            }
            //Insert
            $sql = "INSERT INTO `schedule` (`consultantId`, `startTime`, `dayOfWeek`) 
            VALUES (:consultantId, :startTime, :day)";

            $stmt = $this->pdo->prepare($sql);

            $stmt->bindParam(':consultantId', $consultantId);
            $stmt->bindParam(':startTime', $startTime);
            $stmt->bindParam(':day', $day);

            $stmt->execute();
            // Optionally, return success response or handle accordingly
            return "Appointment rated successfully.";
        } catch (\Firebase\JWT\ExpiredException $e) {
            return "Unauthorized: Token has expired. Please login again. Please login again.";
        } catch (\Firebase\JWT\BeforeValidException $e) {
            return "Unauthorized: Token is not yet valid.";
        } catch (\Firebase\JWT\SignatureInvalidException $e) {
            return "Unauthorized: Invalid token signature.";
        } catch (PDOException $e) {
            // Handle the exception, return an error response, or log the error
            return "Error rating appointment" . $e->getMessage();
        }
    }

    public function remove_schedule($data)
    {
        try {
            $jwt = $data->key;
            error_log("JWT Token: " . $jwt);
            $key = JWT::decode($jwt, new Key($this->secretKey, 'HS256'));
            // Check authorization here (example: verify that the user is authorized to create an appointment)
            if ($key->type !== 'teacher') {
                return "Unauthorized: Only teachers are allowed to delete a schedule.";
            }
            // The rest of the function
            $scheduleId = $data->schedule_id;
            //Insert
            $sql = "DELETE FROM schedule WHERE scheduleId = :scheduleId;";

            $stmt = $this->pdo->prepare($sql);

            $stmt->bindParam(':scheduleId', $scheduleId);

            $stmt->execute();
            // Optionally, return success response or handle accordingly
            if ($stmt->rowCount() > 0) {
                // Appointment successfully removed
                return "Appointment removed successfully.";
            } else {
                // No record found with the given scheduleId
                return "No appointment found with the given schedule ID.";
            }
        } catch (\Firebase\JWT\ExpiredException $e) {
            return "Unauthorized: Token has expired. Please login again.";
        } catch (\Firebase\JWT\BeforeValidException $e) {
            return "Unauthorized: Token is not yet valid.";
        } catch (\Firebase\JWT\SignatureInvalidException $e) {
            return "Unauthorized: Invalid token signature.";
        } catch (PDOException $e) {
            // Handle the exception, return an error response, or log the error
            return "Error removing the schedule" . $e->getMessage();
        }
    }
    public function remove_day_schedule($data)
    {
        try {
            $jwt = $data->key;
            error_log("JWT Token: " . $jwt);
            $key = JWT::decode($jwt, new Key($this->secretKey, 'HS256'));
            // Check authorization here (example: verify that the user is authorized to create an appointment)
            if ($key->type !== 'teacher') {
                return "Unauthorized: Only teachers are allowed to delete schedules.";
            }
            // The rest of the function
            $day = $data->day;
            $consultantId = $data->consultant_id;
            //Delete
            $sql = "DELETE FROM schedule WHERE consultantId = :consultantId AND dayOfWeek = :day;";

            $stmt = $this->pdo->prepare($sql);

            $stmt->bindParam(':day', $day);
            $stmt->bindParam(':consultantId', $consultantId);

            $stmt->execute();
            // Optionally, return success response or handle accordingly
            if ($stmt->rowCount() > 0) {
                // Appointment successfully removed
                return "Appointment removed successfully.";
            } else {
                // No record found with the given scheduleId
                return "No appointment found with the given schedule day.";
            }
        } catch (\Firebase\JWT\ExpiredException $e) {
            return "Unauthorized: Token has expired. Please login again.";
        } catch (\Firebase\JWT\BeforeValidException $e) {
            return "Unauthorized: Token is not yet valid.";
        } catch (\Firebase\JWT\SignatureInvalidException $e) {
            return "Unauthorized: Invalid token signature.";
        } catch (PDOException $e) {
            // Handle the exception, return an error response, or log the error
            return "Error removing the schedule" . $e->getMessage();
        }
    }
    //Notifications
    public function markNotificationAsRead($notificationId)
    {
        $sql = "UPDATE notification SET marked = true WHERE notificationid = :notificationId";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':notificationId', $notificationId, PDO::PARAM_INT);
            $stmt->execute();
            if ($stmt->rowCount() > 0) {
                return true;
            } else {
                return false;
            }
        } catch (PDOException $e) {
            return false;
        }
    }
    public function deleteNotification($notificationId)
    {
        $sql = "DELETE FROM notification WHERE NotificationID = :notificationId";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':notificationId', $notificationId, PDO::PARAM_INT);
            $stmt->execute();
            if ($stmt->rowCount() > 0) {
                return true;
            } else {
                return false;
            }
        } catch (PDOException $e) {
            return false;
        }
    }
    public function createNotification($data)
    {
        // Extract data
        $teacherId = $data->TeacherId;
        $userId = $data->UserId;
        $type = $data->Type;
        $title = $data->Title;
        $description = $data->Description;

        // Prepare SQL statement
        $sql = "INSERT INTO notification (ConsultantId, UserId, NotificationType, NotificationName, NotificationDescription) VALUES (?, ?, ?, ?, ?)";

        // Prepare and execute the statement
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$teacherId, $userId, $type, $title, $description]);

        // Check if the query was successful
        if ($stmt->rowCount() > 0) {
            // Notification created successfully
            return true;
        } else {
            // Failed to create notification
            return false;
        }
    }
    public function checkFTFSchedule($data)
    {
        $date = $data->date;
        $beforeDate = date('Y-m-d H:i:s', strtotime('-30 minutes', strtotime($date)));
        $afterDate = date('Y-m-d H:i:s', strtotime('+30 minutes', strtotime($date)));

        $sql = "SELECT COUNT(*) as count
                FROM appointment
                WHERE 
                    AppointmentDate >= :beforeDate AND
                    AppointmentDate <= :afterDate AND
                    Status = 1 AND
                    Completed = 0 AND
                    mode = 'Face to Face'";

        $stmt = $this->pdo->prepare($sql);

        $stmt->execute(array(':beforeDate' => $beforeDate, ':afterDate' => $afterDate));

        // Fetch result count
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        // Check if count is greater than 0
        return $result && $result['count'] > 0;
    }

    //Additional Functions
    private function checkExistingSchedule($consultantId, $startTime, $day)
    {
        $sql = "SELECT * FROM schedule WHERE consultantId = :consultantId AND startTime = :startTime AND dayOfWeek = :day";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':consultantId', $consultantId);
        $stmt->bindParam(':startTime', $startTime);
        $stmt->bindParam(':day', $day);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
