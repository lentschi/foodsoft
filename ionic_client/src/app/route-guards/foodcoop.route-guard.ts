import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { DefaultFoodcoopApiService } from '../services/api/default-foodcoop-api.service';

@Injectable()
export class FoodcoopRouteGuard implements CanActivate {
  public constructor(private readonly router: Router, private readonly defaultFoodcoopApiService: DefaultFoodcoopApiService) { }

  public async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const defaultFoodcoop = await this.defaultFoodcoopApiService.getDefaultFoodcoop();

    void this.router.navigate([defaultFoodcoop]);
    return false;
  }
}

