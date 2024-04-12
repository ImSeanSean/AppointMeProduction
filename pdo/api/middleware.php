<?php

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Middleware
{
    private $secretKey;

    public function __construct()
    {
        $this->secretKey = 'secretkey';
    }

    public function validateToken()
    {
        $headers = getallheaders();

        if (isset($headers['Authorization'])) {
            $token = trim(str_replace('Bearer', '', $headers['Authorization']));

            try {
                $decoded = JWT::decode($token, new Key($this->secretKey, 'HS256'));
                return $decoded;
            } catch (\Exception $e) {
                return null;
            }
        } else {
            return null;
        }
    }
}
