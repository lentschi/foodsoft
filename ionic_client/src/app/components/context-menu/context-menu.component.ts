import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { ContextMenuConfig } from 'src/app/models/interfaces/context-menu-config';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextMenuComponent {
  @Input() public appContextMenu: ContextMenuConfig;

  @Input() public activatedRoute: ActivatedRoute;

  public constructor(public readonly popoverController: PopoverController) {}

  public get filteredMenuPoints(): ContextMenuConfig {
    return this.appContextMenu.filter(menuPoint => menuPoint.show === undefined || menuPoint.show);
  }
}
