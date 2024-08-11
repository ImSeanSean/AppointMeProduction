<?php
require __DIR__ . '\vendor\autoload.php';
require __DIR__ . '\vendor\fpdf186\fpdf.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class Post extends FPDF
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
    //Email Related Functions
    public function sendMail($data)
    {
        $email = $data->email;
        //Create Random 6 Digit Code
        $code = rand(100000, 999999);
        //Store Email and Code
        $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

        $sql = "INSERT INTO email_verifications (email, verification_code, created_at, expires_at)
                VALUES (:email, :code, NOW(), :expires_at)
                ON DUPLICATE KEY UPDATE
                verification_code = :code1, created_at = NOW(), expires_at = :expires_at1";

        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':code', $code);
        $stmt->bindParam(':expires_at', $expiresAt);
        $stmt->bindParam(':code1', $code);
        $stmt->bindParam(':expires_at1', $expiresAt);
        $stmt->execute();
        //Send EMAIL
        $mail = new PHPMailer;
        $mail->isSMTP();
        $mail->Host = EMAIL_HOST;
        $mail->Port = EMAIL_PORT;
        $mail->SMTPAuth = true;
        $mail->Username = EMAIL_USERNAME;
        $mail->Password = EMAIL_PASSWORD;
        $mail->setFrom(EMAIL_USERNAME, EMAIL_FROM);
        $mail->addReplyTo(EMAIL_USERNAME, EMAIL_FROM);
        $mail->addAddress($email);
        $mail->Subject = 'AppointMe E-Mail Verification';
        $mail->Body = 'Your code is ' . $code;

        if (!$mail->send()) {
            return false;
        } else {
            return true;
        }
    }
    //User Related Functions
    public function register($data)
    {
        // Variables
        $email = $data->email;
        $emailCode = $data->emailCode;
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

        //Check if Email Code is Valid
        $emailCodeCheckSql = "SELECT * FROM `email_verifications` WHERE `email` = :email AND `verification_code` = :code";
        $emailCodeCheckStmt = $this->pdo->prepare($emailCodeCheckSql);
        $emailCodeCheckStmt->bindParam(':email', $email);
        $emailCodeCheckStmt->bindParam(':code', $emailCode);
        $emailCodeCheckStmt->execute();

        if ($emailCodeCheckStmt->fetch() === false) {
            return 3;
        }

        // Extract Student ID from email
        $studentId = substr($email, 0, strpos($email, '@'));

        // Proceed with the insertion
        $insertSql = "INSERT INTO `user` (`Email`, `FirstName`, `LastName`, `bday`, `gender`, `Course`, `year`, `block`, `Password`, `StudentID`) 
                  VALUES (:email, :fname, :lname, :birthday, :gender, :course, :year, :block, :password, :student_id)";

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
        $insertStmt->bindParam(':student_id', $studentId);
        // Execute SQL
        try {
            $insertStmt->execute();
            $userId = $this->pdo->lastInsertId(); // Get the user ID after insertion

            $payload = array(
                'user_id' => $userId,
                'iss' => 'AppointMe',
                'iat' => time(),
                'exp' => time() + (24 * 60 * 60),
                'type' => 'student'
            );

            $token = JWT::encode($payload, $this->secretKey, 'HS256');
            // Return the token or any other response to the client
            return $token;
        } catch (PDOException $e) {
            return 1;
        }
    }
    public function updateStudent($data)
    {
        // Validate input data
        if (!isset($data->studentId) || !isset($data->column) || !isset($data->value)) {
            throw new InvalidArgumentException('Invalid input data');
        }

        // Extract data from input
        $studentId = $data->studentId;
        $column = $data->column;
        $value = $data->value;

        // Prepare SQL statement
        $sqlUpdate = "UPDATE user SET $column = :value WHERE UserID = :studentId";

        try {
            // Prepare the statement
            $stmt = $this->pdo->prepare($sqlUpdate);

            // Bind parameters
            $stmt->bindParam(':value', $value);
            $stmt->bindParam(':studentId', $studentId);

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

    public function deleteStudent($data)
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

        // Update email to NULL in user table
        $query = "UPDATE user SET email = NULL WHERE UserID = :id";

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
    public function registerTeacher($data)
    {
        // Variables
        $email = $data->email;
        $fname = $data->fname;
        $lname = $data->lname;
        $birthday = $data->birthday;
        $gender = $data->gender;
        $password = $data->password;
        $department = $data->department;
        $position = $data->position;

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
        $insertSql = "INSERT INTO `consultant` (`Email`, `first_name`, `last_name`, `bday`, `gender`, `Password`, `department`, `position`) 
        VALUES (:email, :fname, :lname, :birthday, :gender, :password, :department, :position)";

        $insertStmt = $this->pdo->prepare($insertSql);

        // Bind Parameters
        $insertStmt->bindParam(':email', $email);
        $insertStmt->bindParam(':fname', $fname);
        $insertStmt->bindParam(':lname', $lname);
        $insertStmt->bindParam(':birthday', $birthday);
        $insertStmt->bindParam(':gender', $gender);
        $insertStmt->bindParam(':password', $password);
        $insertStmt->bindParam(':department', $department);
        $insertStmt->bindParam(':position', $position);
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
            return 1;
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

        // Update email to NULL in consultant table
        $query = "UPDATE consultant SET email = NULL WHERE ConsultantId = :id";

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
                // Successful login
                $payload = [
                    'iss' => 'AppointMe',
                    'iat' => time(),
                    'exp' => time() + (24 * 60 * 60),
                    'user_id' => $user['UserID'],
                    'type' => 'student'
                ];

                $jwt = JWT::encode($payload, $this->secretKey, 'HS256');

                // Log successful login
                $this->logLogin($user['UserID'], null, true);

                return $jwt;
            } else {
                // Log failed login attempt
                $this->logLogin($user['UserID'], null, false);
                return false;
            }
        } else {
            // Log failed login attempt
            $this->logLogin(null, null, false);
            return false;
        }
    }

    public function login_teacher($data)
    {
        // Variables
        $email = $data->email;
        $password = $data->password;

        // SQL to fetch consultant details
        $sql = "SELECT * FROM consultant WHERE Email = :email";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':email', $email, PDO::PARAM_STR);
        $stmt->execute();

        // If Consultant Found
        $consultant = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($consultant) {
            if ($password == $consultant['Password']) {
                // Successful login
                $payload = [
                    'iss' => 'AppointMe',
                    'iat' => time(),
                    'exp' => time() + (24 * 60 * 60),
                    'user_id' => $consultant['ConsultantID'],
                    'type' => 'teacher'
                ];

                $jwt = JWT::encode($payload, $this->secretKey, 'HS256');

                // Log successful login
                $this->logLogin(null, $consultant['ConsultantID'], true);

                return $jwt;
            } else {
                // Log failed login attempt
                $this->logLogin(null, $consultant['ConsultantID'], false);
                return false;
            }
        } else {
            // Log failed login attempt
            $this->logLogin(null, null, false);
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
    public function login_admin($data)
    {
        // Variables
        $email = $data->email;
        $password = $data->password;
        // SQL
        $sql = "SELECT * FROM admin WHERE Username = :email";
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
                    'exp' => time() + time() + (24 * 60 * 60),
                    'user_id' => $consultant['AdminID'],
                    'type' => 'admin'
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
            $previous_appointment_id = $data->previous_appointment_id;
            $title = $data->title;
            $date = $data->date;
            $time = $data->time;
            $mode = $data->mode;
            $mysqlDatetime = date("Y-m-d H:i:s", strtotime("$date $time"));
            $appointmentInfo = $data->appointmentInfo;
            $details = $data->details;

            // Prepare and execute SQL to insert appointment
            $sql = "INSERT INTO appointment (user_id, ConsultantID, PreviousAppointmentID, AppointmentDate, appointment_title, AppointmentInfo, TeacherMessage, mode)
                    VALUES (:user_id, :consultant_id, :previous_appointment_id, :appointment_date, :appointment_title, :appointmentInfo, :TeacherMessage, :mode)";

            $stmt = $this->pdo->prepare($sql);

            $stmt->bindParam(':user_id', $user_id);
            $stmt->bindParam(':consultant_id', $teacher_id);
            $stmt->bindParam(':previous_appointment_id', $previous_appointment_id);
            $stmt->bindParam(':appointment_date', $mysqlDatetime);
            $stmt->bindParam(':appointment_title', $title);
            $stmt->bindParam(':appointmentInfo', $appointmentInfo);
            $stmt->bindParam(':TeacherMessage', $details);
            $stmt->bindParam(':mode', $mode);

            $stmt->execute();
            $appointment_id = $this->pdo->lastInsertId();

            // Log the action
            $actionType = 'appointment_created';
            $actionDetails = "Appointment ID $appointment_id created by teacher ID $teacher_id";
            $this->logAction(null, $teacher_id, $actionType, $actionDetails);

            // Optionally, return success response or handle accordingly
            return $appointment_id;
        } catch (\Firebase\JWT\ExpiredException $e) {
            return "Unauthorized: Token has expired. Please login again.";
        } catch (\Firebase\JWT\BeforeValidException $e) {
            return "Unauthorized: Token is not yet valid.";
        } catch (\Firebase\JWT\SignatureInvalidException $e) {
            return "Unauthorized: Invalid token signature.";
        } catch (PDOException $e) {
            // Handle the exception, return an error response, or log the error
            return "Error creating appointment: " . $e->getMessage();
        }
    }

    public function confirm_appointment($data)
    {
        try {
            $appointmentId = $data->appointment_id;

            // SQL query to validate user authority and check appointment status
            $sqlValidation = "SELECT * FROM appointment WHERE AppointmentID = :appointmentId";
            $stmtValidation = $this->pdo->prepare($sqlValidation);
            $stmtValidation->bindParam(':appointmentId', $appointmentId, PDO::PARAM_INT);
            $stmtValidation->execute();
            $validationResult = $stmtValidation->fetch(PDO::FETCH_ASSOC);

            if ($validationResult) {
                $appointmentStatus = $validationResult['Status'];
                $consultantId = $validationResult['ConsultantID'];

                if ($appointmentStatus == 1) {
                    // Appointment is already confirmed
                    return $this->sendPayLoad(null, "failed", "Appointment is already confirmed.", 400);
                }

                // SQL query to update the status to 1 (confirmed)
                $sqlUpdate = "UPDATE appointment SET Status = 1 WHERE AppointmentID = :appointmentId";
                $stmtUpdate = $this->pdo->prepare($sqlUpdate);
                $stmtUpdate->bindParam(':appointmentId', $appointmentId, PDO::PARAM_INT);
                $stmtUpdate->execute();

                // Log the action
                $jwt = $data->key;
                $key = JWT::decode($jwt, new Key($this->secretKey, 'HS256'));
                $userId = ($key->type === 'teacher') ? $key->user_id : null;
                $actionType = 'appointment_confirmed';
                $actionDetails = "Appointment ID $appointmentId confirmed by consultant ID $userId";

                $this->logAction($userId, $consultantId, $actionType, $actionDetails);

                return $this->sendPayLoad(null, "success", "Appointment confirmed successfully.", 200);
            } else {
                return $this->sendPayLoad(null, "failed", "Appointment not found or user is not authorized.", 403);
            }
        } catch (\Firebase\JWT\ExpiredException $e) {
            return $this->sendPayLoad(null, "failed", "Unauthorized: Token has expired. Please login again.", 401);
        } catch (\Firebase\JWT\BeforeValidException $e) {
            return $this->sendPayLoad(null, "failed", "Unauthorized: Token is not yet valid.", 401);
        } catch (\Firebase\JWT\SignatureInvalidException $e) {
            return $this->sendPayLoad(null, "failed", "Unauthorized: Invalid token signature.", 401);
        } catch (PDOException $e) {
            // Handle the exception, return an error response, or log the error
            return $this->sendPayLoad(null, "failed", "Error confirming appointment: " . $e->getMessage(), 500);
        }
    }

    public function reject_appointment($data)
    {
        $appointmentId = $data->appointment_id;

        // SQL to delete the appointment
        $sql = "DELETE FROM appointment WHERE AppointmentID = :appointment_id";

        try {
            // Prepare and execute the delete statement
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':appointment_id', $appointmentId, PDO::PARAM_INT);
            $stmt->execute();

            // Check if any rows were affected (appointment deleted successfully)
            $rowCount = $stmt->rowCount();

            if ($rowCount > 0) {
                // Log the action
                $jwt = $data->key;
                $key = JWT::decode($jwt, new Key($this->secretKey, 'HS256'));
                $userId = ($key->type === 'teacher') ? $key->user_id : null;
                $consultantId = null; // Assuming that consultant ID is not relevant in this context
                $actionType = 'appointment_rejected';
                $actionDetails = "Appointment ID $appointmentId rejected and deleted by consultant ID $userId";

                $this->logAction($userId, $consultantId, $actionType, $actionDetails);

                return $this->sendPayLoad(null, "success", "Appointment rejected and deleted successfully.", 200);
            } else {
                return $this->sendPayLoad(null, "failed", "Failed to reject appointment. Appointment not found.", 404);
            }
        } catch (\PDOException $e) {
            return $this->sendPayLoad(null, "failed", "Error rejecting appointment: " . $e->getMessage(), 500);
        } catch (\Firebase\JWT\ExpiredException $e) {
            return $this->sendPayLoad(null, "failed", "Unauthorized: Token has expired. Please login again.", 401);
        } catch (\Firebase\JWT\BeforeValidException $e) {
            return $this->sendPayLoad(null, "failed", "Unauthorized: Token is not yet valid.", 401);
        } catch (\Firebase\JWT\SignatureInvalidException $e) {
            return $this->sendPayLoad(null, "failed", "Unauthorized: Invalid token signature.", 401);
        }
    }

    public function complete_appointment($data)
    {
        $appointmentId = $data->appointment_id;

        try {
            // Validate JWT and get user details
            $jwt = $data->key;
            $key = JWT::decode($jwt, new Key($this->secretKey, 'HS256'));
            $userId = ($key->type === 'teacher') ? $key->user_id : null;
            $consultantId = null; // Assuming that consultant ID is not relevant in this context

            // SQL query to validate appointment status
            $sqlValidation = "SELECT * FROM appointment WHERE AppointmentID = :appointment_id";
            $stmtValidation = $this->pdo->prepare($sqlValidation);
            $stmtValidation->bindParam(':appointment_id', $appointmentId, PDO::PARAM_INT);
            $stmtValidation->execute();
            $validationResult = $stmtValidation->fetch(PDO::FETCH_ASSOC);

            if ($validationResult) {
                $appointmentStatus = $validationResult['Completed'];

                if ($appointmentStatus == 1) {
                    // Appointment is already marked as completed
                    return $this->sendPayLoad(null, "failed", "Appointment is already marked as completed.", 400);
                }

                // SQL query to update the status to 1 (completed)
                $sqlUpdate = "UPDATE appointment SET Completed = 1 WHERE AppointmentID = :appointment_id";
                $stmtUpdate = $this->pdo->prepare($sqlUpdate);
                $stmtUpdate->bindParam(':appointment_id', $appointmentId, PDO::PARAM_INT);
                $stmtUpdate->execute();

                // Log the action
                $actionType = 'appointment_completed';
                $actionDetails = "Appointment ID $appointmentId marked as completed by consultant ID $userId";
                $this->logAction($userId, $consultantId, $actionType, $actionDetails);

                return $this->sendPayLoad(null, "success", "Appointment completed successfully.", 200);
            } else {
                return $this->sendPayLoad(null, "failed", "Appointment not found or user is not authorized.", 403);
            }
        } catch (\Firebase\JWT\ExpiredException $e) {
            return $this->sendPayLoad(null, "failed", "Unauthorized: Token has expired. Please login again.", 401);
        } catch (\Firebase\JWT\BeforeValidException $e) {
            return $this->sendPayLoad(null, "failed", "Unauthorized: Token is not yet valid.", 401);
        } catch (\Firebase\JWT\SignatureInvalidException $e) {
            return $this->sendPayLoad(null, "failed", "Unauthorized: Invalid token signature.", 401);
        } catch (\PDOException $e) {
            return $this->sendPayLoad(null, "failed", "Error completing appointment: " . $e->getMessage(), 500);
        }
    }

    public function provide_information($data)
    {
        try {
            $jwt = $data->key;
            error_log("JWT Token: " . $jwt);
            $key = JWT::decode($jwt, new Key($this->secretKey, 'HS256'));
            // Check authorization here (example: verify that the user is authorized to create an appointment)
            if ($key->type !== 'teacher') {
                return "Unauthorized: Only teachers are allowed to provide summary.";
            }
            $appointmentId = $data->appointment_id;
            $appointmentSummary = $data->appointment_summary;
            //Find Appointment
            $sqlValidation = "SELECT * FROM appointment WHERE AppointmentID = :appointmentId";
            $stmt = $this->pdo->prepare($sqlValidation);
            $stmt->bindParam(':appointmentId', $appointmentId);
            $stmt->execute();
            $validationResult = $stmt->fetch(PDO::FETCH_ASSOC);
            // Check if appointment exists

            // Update Appointment
            $sqlUpdate = "UPDATE appointment SET AppointmentInfo = :appointmentSummary WHERE AppointmentID = :id";
            $stmt = $this->pdo->prepare($sqlUpdate);
            $stmt->bindParam(':appointmentSummary', $appointmentSummary);
            $stmt->bindParam(':id', $appointmentId);
            $stmt->execute();
            // Optionally, return success response or handle accordingly
            return "Summary provided successfully.";
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
    public function provide_summary($data)
    {
        try {
            $jwt = $data->key;
            error_log("JWT Token: " . $jwt);
            $key = JWT::decode($jwt, new Key($this->secretKey, 'HS256'));
            // Check authorization here (example: verify that the user is authorized to create an appointment)
            if ($key->type !== 'teacher') {
                return "Unauthorized: Only teachers are allowed to provide summary.";
            }
            $appointmentId = $data->appointment_id;
            $appointmentSummary = $data->appointment_summary;
            //Find Appointment
            $sqlValidation = "SELECT * FROM appointment WHERE AppointmentID = :appointmentId";
            $stmt = $this->pdo->prepare($sqlValidation);
            $stmt->bindParam(':appointmentId', $appointmentId);
            $stmt->execute();
            $validationResult = $stmt->fetch(PDO::FETCH_ASSOC);
            // Check if appointment exists

            // Update Appointment
            $sqlUpdate = "UPDATE appointment SET AppointmentSummary = :appointmentSummary WHERE AppointmentID = :id";
            $stmt = $this->pdo->prepare($sqlUpdate);
            $stmt->bindParam(':appointmentSummary', $appointmentSummary);
            $stmt->bindParam(':id', $appointmentId);
            $stmt->execute();
            // Optionally, return success response or handle accordingly
            return "Summary provided successfully.";
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

            // Initialize Data
            $appointmentId = $data->appointment_id;
            $appointmentRating = $data->helpfulness;
            $appointmentRating2 = $data->empathy;
            $appointmentRating3 = $data->clarity;
            $appointmentRating4 = $data->engagement;
            $appointmentRemarks = $data->appointment_remarks;

            // Find Appointment
            $sqlValidation = "SELECT * FROM appointment WHERE AppointmentID = :appointmentId";
            $stmt = $this->pdo->prepare($sqlValidation);
            $stmt->bindParam(':appointmentId', $appointmentId);
            $stmt->execute();
            $validationResult = $stmt->fetch(PDO::FETCH_ASSOC);

            // Check if appointment exists
            if (!$validationResult) {
                return "Error: Appointment not found.";
            }

            // Update Appointment
            $sqlUpdate = "UPDATE appointment 
                          SET rating = :rating, rating2 = :rating2, rating3 = :rating3, rating4 = :rating4, remarks = :remarks 
                          WHERE AppointmentID = :id";
            $stmt = $this->pdo->prepare($sqlUpdate);
            $stmt->bindParam(':rating', $appointmentRating);
            $stmt->bindParam(':rating2', $appointmentRating2);
            $stmt->bindParam(':rating3', $appointmentRating3);
            $stmt->bindParam(':rating4', $appointmentRating4);
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
            return "Error rating appointment: " . $e->getMessage();
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
            $title = $data->title;
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
            $sql = "INSERT INTO `queue` (`teacher_id`, `student_id`, `appointment_title`, `mode`, `urgency`, `day`, `time`, `reason`)
            VALUES (:teacher_id, :student_id, :appointment_title, :mode, :urgency, :day, :time, :reason)";

            $stmt = $this->pdo->prepare($sql);

            // Bind the parameters to the query
            $stmt->bindParam(':teacher_id', $teacher_id, PDO::PARAM_INT);
            $stmt->bindParam(':student_id', $student_id, PDO::PARAM_INT);
            $stmt->bindParam(':appointment_title', $title, PDO::PARAM_INT);
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
    public function add_followup_queue_teacher($data)
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
            $appointment_id = $data->appointment_id;
            $title = $data->title;
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
            $sql = "INSERT INTO `queue` (`teacher_id`, `student_id`, `previous_appointment_id`, `appointment_title`, `mode`, `urgency`, `day`, `time`, `reason`)
            VALUES (:teacher_id, :student_id, :appointment_id, :title, :mode, :urgency, :day, :time, :reason)";

            $stmt = $this->pdo->prepare($sql);

            // Bind the parameters to the query
            $stmt->bindParam(':teacher_id', $teacher_id, PDO::PARAM_INT);
            $stmt->bindParam(':student_id', $student_id, PDO::PARAM_INT);
            $stmt->bindParam(':appointment_id', $appointment_id, PDO::PARAM_INT);
            $stmt->bindParam(':title', $title, PDO::PARAM_INT);
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
            $title = $data->title;
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
            $sqlUpdate = "UPDATE queue SET appointment_title = :title, mode = :mode, urgency = :urgency, day = :day, time = :time WHERE queue_id = :queue_id";
            $stmt = $this->pdo->prepare($sqlUpdate);
            $stmt->bindParam(':title', $title);
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
        $appointmentId = $data->AppointmentId;
        $type = $data->Type;
        $title = $data->Title;
        $description = $data->Description;


        // Prepare SQL statement
        $sql = "INSERT INTO notification (ConsultantId, UserId, AppointmentId, NotificationType, NotificationName, NotificationDescription) VALUES (?, ?, ?, ?, ?, ?)";

        // Prepare and execute the statement
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$teacherId, $userId, $appointmentId, $type, $title, $description]);

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

    function generatePDF($appointmentId)
    {
        // Fetch appointment data
        $appointmentData = $this->fetchAppointmentData($appointmentId);
        $appointmentCount = count($appointmentData);
        $firstRow = $appointmentData[0];
        $lastRow = $appointmentData[$appointmentCount - 1];

        if (!$appointmentData) {
            echo "No appointment found with the given ID.";
            return;
        }

        // Create PDF object
        $pdf = new FPDF();
        $pdf->AddPage();
        $pdf->SetY(40);

        // Add logo
        $pdf->Image('assets/Logo/logo1.png', 10, 10, 30, 30);
        $pdf->Image('assets/Logo/logo2.png', 170, 10, 30, 30);

        // Set font for header text
        $pdf->SetFont('Arial', 'B', 12);

        // Set position for the header text in the center
        $pdf->SetXY(60, 15);
        $pdf->Cell(90, 10, 'GORDON COLLEGE', 0, 1, 'C');
        $pdf->SetXY(60, 20);
        $pdf->Cell(90, 10, 'COLLEGE OF COMPUTER STUDIES', 0, 1, 'C');
        $pdf->SetXY(60, 25);
        $pdf->Cell(90, 10, 'APPOINTMENT TEAM', 0, 1, 'C');

        // Add two empty rows for spacing
        $pdf->Cell(0, 10, '', 0, 1);

        // Title
        $pdf->SetFont('Arial', 'B', 14);
        $pdf->Cell(0, 10, 'Appointment Summary Report', 0, 1, 'C');

        // Appointment details
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Cell(45, 10, 'Appointment Title:', 1);
        $pdf->SetFont('Arial', '', 12);
        $pdf->Cell(0, 10, $firstRow['appointment_title'], 1, 1);

        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Cell(45, 10, 'Faculty Member:', 1);
        $pdf->SetFont('Arial', '', 12);
        $pdf->Cell(0, 10, $firstRow['ConsultantFirstName'] . ' ' . $firstRow['ConsultantLastName'], 1, 1);

        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Cell(45, 10, 'Student:', 1);
        $pdf->SetFont('Arial', '', 12);
        $pdf->Cell(45, 10, $firstRow['UserName'] . ' ' . $firstRow['UserLastName'], 1);
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Cell(45, 10, 'Student Id:', 1);
        $pdf->SetFont('Arial', '', 12);
        $pdf->Cell(0, 10, $firstRow['StudentID'], 1, 1);

        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Cell(45, 10, 'Start Date:', 1);
        $pdf->SetFont('Arial', '', 12);
        $pdf->Cell(45, 10, date('m/d/Y', strtotime($firstRow['AppointmentDate'])), 1);
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Cell(45, 10, 'End Date:', 1);
        $pdf->SetFont('Arial', '', 12);
        $pdf->Cell(0, 10, date('m/d/Y', strtotime($lastRow['AppointmentDate'])), 1, 1); // Adjust if you have an end date field

        // Appointment Objective
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Cell(0, 10, '1. Appointment Objective', 0, 1);
        $currentY = $pdf->GetY();
        $pdf->SetFont('Arial', '', 12);

        // Draw the MultiCell within the rectangle
        $pdf->SetX(10);
        $pdf->MultiCell(190, 10, $firstRow['AppointmentInfo'], 0, 'L');
        $contentHeight = $pdf->GetY() - $currentY;

        // Adjust the rectangle height if the content height exceeds 30
        $rectHeight = max(20, $contentHeight);
        $pdf->Rect(10, $currentY, 190, $rectHeight);
        $pdf->SetY($currentY + $rectHeight + 10);


        // Meeting Summaries
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Cell(0, 6, '2. Meeting Summaries', 0, 1);
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Cell(30, 6, 'Date', 1);
        $pdf->Cell(30, 6, 'Time', 1);
        $pdf->Cell(60, 6, 'Remarks', 1);
        $pdf->Cell(70, 6, 'Summary', 1, 1);

        // Add meeting summaries here. For demonstration, static data is used.
        for ($i = 0; $i < $appointmentCount; $i++) {
            $pdf->SetFont('Arial', '', 12);

            $summaryText = $appointmentData[$i]['AppointmentSummary'];

            $nb = ceil($pdf->GetStringWidth($summaryText) / 60);
            $cellHeight = 6 * $nb;

            $rowHeight = max($cellHeight, 6);

            // Create the cells with the adjusted height
            $pdf->Cell(30, $rowHeight, date('m/d/Y', strtotime($appointmentData[$i]['AppointmentDate'])), 1);
            $pdf->Cell(30, $rowHeight, date('H:i A', strtotime($appointmentData[$i]['AppointmentDate'])), 1);
            $pdf->Cell(60, $rowHeight, $appointmentData[$i]['rating'], 1);

            $x = $pdf->GetX();
            $y = $pdf->GetY();

            // Create a MultiCell for the Student Remarks
            $pdf->MultiCell(70, 6, $summaryText, 1);

            $pdf->SetXY($x + 70, $y);
            $pdf->Ln($rowHeight);
        }

        // Meeting Ratings
        $pdf->SetY($pdf->GetY() + 6);
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Cell(0, 6, '3. Student Remarks', 0, 1);
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Cell(30, 6, 'Date', 1);
        $pdf->Cell(30, 6, 'Time', 1);
        $pdf->Cell(60, 6, 'Student Rating', 1);
        $pdf->Cell(70, 6, 'Student Remarks', 1, 1);

        foreach ($appointmentData as $appointment) {
            $pdf->SetFont('Arial', '', 12);

            $remarks = $appointment['remarks'];
            $nb = ceil($pdf->GetStringWidth($remarks) / 60);
            $cellHeight = 6 * $nb;

            $rowHeight = max($cellHeight, 6);

            // Create the cells with the adjusted height
            $pdf->Cell(30, $rowHeight, date('m/d/Y', strtotime($appointment['AppointmentDate'])), 1);
            $pdf->Cell(30, $rowHeight, date('H:i A', strtotime($appointment['AppointmentDate'])), 1);
            $pdf->Cell(60, $rowHeight, $appointment['rating'], 1);

            $x = $pdf->GetX();
            $y = $pdf->GetY();

            // Create a MultiCell for the Student Remarks
            $pdf->MultiCell(70, 6, $remarks, 1);

            $pdf->SetXY($x + 70, $y);
            $pdf->Ln($rowHeight);
        }

        // Conclusion
        // $pdf->SetFont('Arial', 'B', 10);
        // $pdf->Cell(0, 10, '3. Conclusion', 0, 1);

        // $pdf->Rect(10, $pdf->GetY(), 190, 30); // Adjust height accordingly
        // $pdf->SetFont('Arial', '', 10);
        // $pdf->MultiCell(0, 10, 'This is the conclusion content. Replace with your actual content.', 0, 'L');

        // Output the PDF
        $pdf->Output('D', 'Appointment_Summary_Report.pdf');
    }
    private function fetchAppointmentData($appointmentId)
    {
        // Ensure that $appointmentId is an integer to prevent SQL injection
        $appointmentId = (int)$appointmentId;

        $sql = "
        WITH RECURSIVE previous_appointments AS (
            SELECT a.*
            FROM appointment a
            WHERE a.AppointmentID = $appointmentId
            UNION ALL
            SELECT a.*
            FROM appointment a
            INNER JOIN previous_appointments pa ON a.AppointmentID = pa.PreviousAppointmentID
        ),
        next_appointments AS (
            SELECT a.*
            FROM appointment a
            WHERE a.AppointmentID = $appointmentId
            UNION ALL
            SELECT a.*
            FROM appointment a
            INNER JOIN next_appointments na ON a.PreviousAppointmentID = na.AppointmentID
        )
        SELECT * FROM (
            SELECT pa.*, 
                   user.FirstName AS UserName, user.LastName AS UserLastName, user.StudentID,
                   consultant.first_name AS ConsultantFirstName, consultant.last_name AS ConsultantLastName
            FROM previous_appointments pa
            LEFT JOIN user ON pa.user_id = user.UserID
            LEFT JOIN consultant ON pa.ConsultantID = consultant.ConsultantID
            UNION
            SELECT na.*, 
                   user.FirstName AS UserName, user.LastName AS UserLastName, user.StudentID,
                   consultant.first_name AS ConsultantFirstName, consultant.last_name AS ConsultantLastName
            FROM next_appointments na
            LEFT JOIN user ON na.user_id = user.UserID
            LEFT JOIN consultant ON na.ConsultantID = consultant.ConsultantID
        ) AS combined
        ORDER BY AppointmentID;
        ";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }
    function generateAllReports($data)
    {
        $consultantId = $data->consultantId;
        // Fetch all grouped appointment data for the specific ConsultantID
        $groupedAppointments = $this->fetchAllAppointmentsData($consultantId);

        // Create PDF object
        $pdf = new FPDF();

        // Loop through each group of connected appointments
        foreach ($groupedAppointments as $groupId => $appointments) {
            $this->generatePDFForGroup($pdf, $appointments);
        }

        // Output the final PDF
        $pdf->Output('D', 'All_Appointment_Reports.pdf');
    }

    private function generatePDFForGroup($pdf, $appointmentData)
    {
        $appointmentCount = count($appointmentData);
        $firstRow = $appointmentData[0];
        $lastRow = $appointmentData[$appointmentCount - 1];

        // Add a new page for each appointment group
        $pdf->AddPage();
        $pdf->SetY(40);

        // (Keep the rest of the original generatePDF() logic here for adding content to the PDF...)
        // Note: Ensure the content is added for all appointments within the group
        // Add logo
        $pdf->Image('assets/Logo/logo1.png', 10, 10, 30, 30);
        $pdf->Image('assets/Logo/logo2.png', 170, 10, 30, 30);

        // Set font for header text
        $pdf->SetFont('Arial', 'B', 12);

        // Set position for the header text in the center
        $pdf->SetXY(60, 15);
        $pdf->Cell(90, 10, 'GORDON COLLEGE', 0, 1, 'C');
        $pdf->SetXY(60, 20);
        $pdf->Cell(90, 10, 'COLLEGE OF COMPUTER STUDIES', 0, 1, 'C');
        $pdf->SetXY(60, 25);
        $pdf->Cell(90, 10, 'APPOINTMENT TEAM', 0, 1, 'C');

        // Add two empty rows for spacing
        $pdf->Cell(0, 10, '', 0, 1);

        // Title
        $pdf->SetFont('Arial', 'B', 14);
        $pdf->Cell(0, 10, 'Appointment Summary Report', 0, 1, 'C');

        // Appointment details
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Cell(45, 10, 'Appointment Title:', 1);
        $pdf->SetFont('Arial', '', 12);
        $pdf->Cell(0, 10, $firstRow['appointment_title'], 1, 1);

        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Cell(45, 10, 'Faculty Member:', 1);
        $pdf->SetFont('Arial', '', 12);
        $pdf->Cell(0, 10, $firstRow['ConsultantFirstName'] . ' ' . $firstRow['ConsultantLastName'], 1, 1);

        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Cell(45, 10, 'Student:', 1);
        $pdf->SetFont('Arial', '', 12);
        $pdf->Cell(45, 10, $firstRow['UserName'] . ' ' . $firstRow['UserLastName'], 1);
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Cell(45, 10, 'Student Id:', 1);
        $pdf->SetFont('Arial', '', 12);
        $pdf->Cell(0, 10, $firstRow['StudentID'], 1, 1);

        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Cell(45, 10, 'Start Date:', 1);
        $pdf->SetFont('Arial', '', 12);
        $pdf->Cell(45, 10, date('m/d/Y', strtotime($firstRow['AppointmentDate'])), 1);
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Cell(45, 10, 'End Date:', 1);
        $pdf->SetFont('Arial', '', 12);
        $pdf->Cell(0, 10, date('m/d/Y', strtotime($lastRow['AppointmentDate'])), 1, 1); // Adjust if you have an end date field

        // Appointment Objective
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Cell(0, 10, '1. Appointment Objective', 0, 1);
        $currentY = $pdf->GetY();
        $pdf->SetFont('Arial', '', 12);

        // Draw the MultiCell within the rectangle
        $pdf->SetX(10);
        $pdf->MultiCell(190, 10, $firstRow['AppointmentInfo'], 0, 'L');
        $contentHeight = $pdf->GetY() - $currentY;

        // Adjust the rectangle height if the content height exceeds 30
        $rectHeight = max(20, $contentHeight);
        $pdf->Rect(10, $currentY, 190, $rectHeight);
        $pdf->SetY($currentY + $rectHeight + 10);


        // Meeting Summaries
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Cell(0, 6, '2. Meeting Summaries', 0, 1);
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Cell(30, 6, 'Date', 1);
        $pdf->Cell(30, 6, 'Time', 1);
        $pdf->Cell(60, 6, 'Remarks', 1);
        $pdf->Cell(70, 6, 'Summary', 1, 1);

        // Add meeting summaries here. For demonstration, static data is used.
        for ($i = 0; $i < $appointmentCount; $i++) {
            $pdf->SetFont('Arial', '', 12);

            $summaryText = $appointmentData[$i]['AppointmentSummary'];

            $nb = ceil($pdf->GetStringWidth($summaryText) / 60);
            $cellHeight = 6 * $nb;

            $rowHeight = max($cellHeight, 6);

            // Create the cells with the adjusted height
            $pdf->Cell(30, $rowHeight, date('m/d/Y', strtotime($appointmentData[$i]['AppointmentDate'])), 1);
            $pdf->Cell(30, $rowHeight, date('H:i A', strtotime($appointmentData[$i]['AppointmentDate'])), 1);
            $pdf->Cell(60, $rowHeight, $appointmentData[$i]['rating'], 1);

            $x = $pdf->GetX();
            $y = $pdf->GetY();

            // Create a MultiCell for the Student Remarks
            $pdf->MultiCell(70, 6, $summaryText, 1);

            $pdf->SetXY($x + 70, $y);
            $pdf->Ln($rowHeight);
        }

        // Meeting Ratings
        $pdf->SetY($pdf->GetY() + 6);
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Cell(0, 6, '3. Student Remarks', 0, 1);
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Cell(30, 6, 'Date', 1);
        $pdf->Cell(30, 6, 'Time', 1);
        $pdf->Cell(60, 6, 'Student Rating', 1);
        $pdf->Cell(70, 6, 'Student Remarks', 1, 1);

        foreach ($appointmentData as $appointment) {
            $pdf->SetFont('Arial', '', 12);

            $remarks = $appointment['remarks'];
            $nb = ceil($pdf->GetStringWidth($remarks) / 60);
            $cellHeight = 6 * $nb;

            $rowHeight = max($cellHeight, 6);

            // Create the cells with the adjusted height
            $pdf->Cell(30, $rowHeight, date('m/d/Y', strtotime($appointment['AppointmentDate'])), 1);
            $pdf->Cell(30, $rowHeight, date('H:i A', strtotime($appointment['AppointmentDate'])), 1);
            $pdf->Cell(60, $rowHeight, $appointment['rating'], 1);

            $x = $pdf->GetX();
            $y = $pdf->GetY();

            // Create a MultiCell for the Student Remarks
            $pdf->MultiCell(70, 6, $remarks, 1);

            $pdf->SetXY($x + 70, $y);
            $pdf->Ln($rowHeight);
        }
    }

    // Fetch all appointments and group them by connected appointment chain
    private function fetchAllAppointmentsData($consultantId)
    {
        $sql = "
        WITH RECURSIVE appointment_chain AS (
            SELECT a.*, a.AppointmentID as GroupID
            FROM appointment a
            WHERE a.PreviousAppointmentID IS NULL
            AND a.ConsultantID = :consultantId
            UNION ALL
            SELECT a2.*, ac.GroupID
            FROM appointment a2
            INNER JOIN appointment_chain ac ON a2.PreviousAppointmentID = ac.AppointmentID
            WHERE a2.ConsultantID = :consultantIdd
        )
        SELECT 
            ac.*,
            user.FirstName AS UserName, user.LastName AS UserLastName, user.StudentID,
            consultant.first_name AS ConsultantFirstName, consultant.last_name AS ConsultantLastName
        FROM appointment_chain ac
        LEFT JOIN user ON ac.user_id = user.UserID
        LEFT JOIN consultant ON ac.ConsultantID = consultant.ConsultantID
        ORDER BY ac.GroupID, ac.AppointmentID;
        ";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':consultantId', $consultantId, PDO::PARAM_INT);
            $stmt->bindParam(':consultantIdd', $consultantId, PDO::PARAM_INT);
            $stmt->execute();
            $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Group appointments by the GroupID
            $groupedAppointments = [];
            foreach ($appointments as $appointment) {
                $groupId = $appointment['GroupID'];
                $groupedAppointments[$groupId][] = $appointment;
            }

            return $groupedAppointments;
        } catch (PDOException $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }
    //Administrator Logs
    public function logLogin($user_id = null, $consultant_id = null, $success = false)
    {
        if ($user_id === null && $consultant_id === null) {
            throw new InvalidArgumentException('Either user_id or consultant_id must be provided');
        }

        $user_id = isset($user_id) ? intval($user_id) : null;
        $consultant_id = isset($consultant_id) ? intval($consultant_id) : null;
        $success = (bool)$success;

        $sql = "INSERT INTO admin_login_logs (user_id, consultant_id, login_time, success)
                VALUES (:user_id, :consultant_id, NOW(), :success)";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
            $stmt->bindParam(':consultant_id', $consultant_id, PDO::PARAM_INT);
            $stmt->bindParam(':success', $success, PDO::PARAM_BOOL);
            $stmt->execute();
        } catch (PDOException $e) {
            error_log('Database error: ' . $e->getMessage());
            throw new Exception('Failed to log login attempt');
        }
    }

    public function logAction($userId, $consultantId, $actionType, $details)
    {
        try {
            // Check if userId exists if provided
            if ($userId !== null) {
                $sql = "SELECT COUNT(*) FROM user WHERE UserID = :user_id";
                $stmt = $this->pdo->prepare($sql);
                $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
                $stmt->execute();
                $userExists = $stmt->fetchColumn();
            } else {
                $userExists = 0;
            }

            // Check if consultantId exists if provided
            if ($consultantId !== null) {
                $sql = "SELECT COUNT(*) FROM consultant WHERE ConsultantID = :consultant_id";
                $stmt = $this->pdo->prepare($sql);
                $stmt->bindParam(':consultant_id', $consultantId, PDO::PARAM_INT);
                $stmt->execute();
                $consultantExists = $stmt->fetchColumn();
            } else {
                $consultantExists = 0;
            }

            // Proceed only if either userId or consultantId exists
            if (($userId !== null && $userExists) || ($consultantId !== null && $consultantExists)) {
                // Prepare the SQL query to insert the action log
                $sql = "INSERT INTO action_logs (user_id, consultant_id, action_type, action_time, details) 
                        VALUES (:user_id, :consultant_id, :action_type, NOW(), :details)";

                $stmt = $this->pdo->prepare($sql);

                // Bind parameters
                $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
                $stmt->bindParam(':consultant_id', $consultantId, PDO::PARAM_INT);
                $stmt->bindParam(':action_type', $actionType, PDO::PARAM_STR);
                $stmt->bindParam(':details', $details, PDO::PARAM_STR);

                // Execute the query
                $stmt->execute();

                return true;
            } else {
                // Neither userId nor consultantId exists
                return false;
            }
        } catch (PDOException $e) {
            // Handle exceptions (e.g., log error, notify admin)
            error_log("Database error: " . $e->getMessage());
            return false;
        }
    }
}
