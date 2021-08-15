import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import format from 'date-fns/format';
import { de } from 'date-fns/locale';

@Component({
  selector: 'app-date-display',
  templateUrl: 'date-display.component.html',
  styleUrls: ['date-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateDisplayComponent {
  @Input() public date?: Date;

  public get day(): string | undefined {
    if (!isValidDate(this.date)) {
      return undefined;
    }
    return format(this.date, 'ccc', { locale: de });
  }

  public get details(): string | undefined {
    if (!isValidDate(this.date)) {
      return undefined;
    }
    return format(this.date, 'PP', { locale: de });
  }
}

const isValidDate = (date: Date | undefined): date is Date => {
  const time = date?.getTime();
  return time !== undefined && !isNaN(time);
};
