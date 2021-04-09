
/**
 * This interface will help us to keep the student data
 * @author Jagat Bandhu
 * @since 1.0.0
 */
export interface IStudentRecord {
    record_date: string,
    class_code: number,
    section_code: number,
    student_ids: number[],
    sync_status: boolean,
    image_base64: string;
}