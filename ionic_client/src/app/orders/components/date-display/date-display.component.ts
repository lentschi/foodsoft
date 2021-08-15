import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import format from 'date-fns/format';

@Component({
  selector: 'app-date-display',
  templateUrl: 'date-display.component.html',
  styleUrls: ['date-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateDisplayComponent {
  @Input() public date: Date;

  public get month(): string {
    return format(this.date, 'MMM');
  }
}
