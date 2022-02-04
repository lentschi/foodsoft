import { Directive, HostListener, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ComponentProps, ComponentRef } from '@ionic/core';

@Directive({ selector: '[appContextPopover]' })
export class ContextPopoverDirective<T extends ComponentRef> {
  @Input() public appContextPopover?: T;

  @Input() public appContextPopoverProps?: ComponentProps<T>;

  public constructor(private readonly popoverController: PopoverController) {}

  @HostListener('contextmenu', ['$event'])
  public async onContextMenu(event: Event): Promise<void> {
    if (this.appContextPopover === undefined) {
      return;
    }

    event.preventDefault();
    const popover = await this.popoverController.create({
      component: this.appContextPopover,
      componentProps: this.appContextPopoverProps,
      event,
    });
    await popover.present();
  }
}
