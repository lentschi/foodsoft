import { Directive, HostListener, Input } from '@angular/core';
import { ActivatedRoute,  Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { first } from 'lodash-es';
import { ContextMenuComponent } from '../components/context-menu/context-menu.component';
import { ContextMenuConfig } from '../models/interfaces/context-menu-config';

@Directive({ selector: '[appContextMenu]' })
export class ContextMenuDirective {
  @Input() public appContextMenu: ContextMenuConfig;

  public constructor(private readonly popoverController: PopoverController, private readonly router: Router, private readonly activatedRoute: ActivatedRoute) {}

  @HostListener('contextmenu', ['$event'])
  public async onContextMenu(event: Event): Promise<void> {
    event.preventDefault();
    const popover = await this.popoverController.create({
      component: ContextMenuComponent,
      componentProps: { appContextMenu: this.appContextMenu, activatedRoute: this.activatedRoute },
      event,
    });
    await popover.present();
  }

  @HostListener('click')
  public onClick(): void {
    const firstMenuPoint = first(this.appContextMenu.filter(menuPoint => menuPoint.show === undefined || menuPoint.show));
    if (firstMenuPoint) {
      if (firstMenuPoint.routerLink) {
        void this.router.navigate(firstMenuPoint.routerLink, { relativeTo: this.activatedRoute });
      } else if (firstMenuPoint.callbackFn) {
        firstMenuPoint.callbackFn();
      } else {
        console.error('context menu point has no action');
      }
    }
  }
}
