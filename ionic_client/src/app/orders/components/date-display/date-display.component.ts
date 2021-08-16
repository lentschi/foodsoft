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
    const customLongFormat = de.formatLong!.date({ width: 'short' }).replace('y', 'yy');
    return format(this.date, customLongFormat, { locale: de });
  }
}

const isValidDate = (date: Date | undefined): date is Date => {
  const time = date?.getTime();
  return time !== undefined && !isNaN(time);
};
