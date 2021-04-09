/**
 * This interface will help us to keep the student section info
 * @author Jagat Bandhu
 * @since 1.0.0
 */
import {IStudent} from '../interfaces/student'

export interface ISection {
    name: string;
    code: number;
    students: IStudent[];
}
