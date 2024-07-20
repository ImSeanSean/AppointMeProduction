export interface Queue {
    queue_id: number,
    student_id: number,
    teacher_id: number,
    previous_appointment_id: string,
    appointment_title: string,
    mode: string,
    urgency: string,
    day: string,
    time: string,
    reason: string,
    time_created: string,
    student_name: string,
    teacher_name: string
}
