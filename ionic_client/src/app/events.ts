import { BehaviorSubject } from 'rxjs';

export const orderIdUpdated$ = new BehaviorSubject<string | undefined>(undefined);
