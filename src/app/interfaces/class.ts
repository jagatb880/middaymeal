/**
 * This interface will help us to keep the student class info
 * @author Jagat Bandhu
 * @since 1.0.0
 */

import {ISection} from '../interfaces/section'

export interface IClass {
    name: string;
    code: number;
    sections: ISection[];
}
