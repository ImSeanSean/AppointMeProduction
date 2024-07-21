<?php

//SET DEFAULT TIME ZONE
date_default_timezone_set("Asia/Manila");

//SET TIME LIMIT ON REQUESTs
set_time_limit(1000);

//DEFINE CONSTANT SERVER VARIABLES
define("SERVER", "localhost");
define("DATABASE", "appointme_database");
define("USER", "root");
define("PASSWORD", "");
define("DRIVER", "mysql");

define('EMAIL_HOST', 'smtp.hostinger.com');
define('EMAIL_USERNAME', 'cs@appointme.site');
define('EMAIL_PASSWORD', 'KWHA9p=$:S{8ckU]+;(t^u');
define('EMAIL_PORT', 587);
define('EMAIL_FROM', 'AppointMe CS');

//DOT IS CONCATENATION IN PHP
class Connection
{
    private $connectionString = DRIVER . ":host=" . SERVER . ";dbname=" . DATABASE . "; charset=utf8mb4";
    private $options = [
        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
        \PDO::ATTR_EMULATE_PREPARES => false
    ];

    public function connect()
    {
        return new \PDO($this->connectionString, USER, PASSWORD, $this->options);
    }
}
