export interface Actionlog {
    log_id: number,
    user_id: number | null,
    consultant_id: number | null,
    action_type: string,
    details: string,
    action_time: string
}
