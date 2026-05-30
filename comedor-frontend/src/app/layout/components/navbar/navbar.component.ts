import { Component } from '@angular/core';

import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { filter } from 'rxjs';

import { HamburgerButtonComponent } from '../hamburger-button/hamburger-button.component';

@Component({
  selector: 'app-navbar',

  standalone: true,

  imports: [HamburgerButtonComponent],

  templateUrl: './navbar.component.html',

  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  currentTitle = '';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      let route = this.activatedRoute;

      while (route.firstChild) {
        route = route.firstChild;
      }

      this.currentTitle = route.snapshot.title ?? '';
    });
  }
}
