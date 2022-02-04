export type ContextMenuConfig = ContextMenuPoint[];

export interface ContextMenuPoint {
  label: string;

  show?: boolean;


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  routerLink?: any[];

  callbackFn?: () => unknown;
}
