import { Pipe, PipeTransform } from '@angular/core';
import format from 'date-fns/format';
import { de } from 'date-fns/locale';


@Pipe({ name: 'formatDate' })
export class FormatDatePipe implements PipeTransform {
  public transform(value: Date): string {
    return format(value, 'PPPP', { locale: de });
  }
}
