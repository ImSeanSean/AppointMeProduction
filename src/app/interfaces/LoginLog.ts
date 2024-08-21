export interface Loginlog {
    log_id: number,
    user_id: number | null,
    consultant_id: number | null,
    login_time: string,
    success: boolean
}
