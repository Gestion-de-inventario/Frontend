import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface BreadcrumbItem {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
})
export class BreadcrumbComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly breadcrumbs = signal<BreadcrumbItem[]>([]);

  ngOnInit(): void {
    this.updateBreadcrumbs();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.updateBreadcrumbs();
      });
  }

  private updateBreadcrumbs(): void {
    const root = this.router.routerState.snapshot.root;
    const items = this.buildBreadcrumbs(root);

    this.breadcrumbs.set(items);
  }

  private buildBreadcrumbs(
    route: ActivatedRouteSnapshot | null | undefined,
    url: string = '',
    breadcrumbs: BreadcrumbItem[] = [],
  ): BreadcrumbItem[] {
    if (!route) {
      return breadcrumbs;
    }

    const children = route.children ?? [];

    const primaryChild = children.find((child) => child.outlet === 'primary') ?? children[0];

    if (!primaryChild) {
      return breadcrumbs;
    }

    const routeUrl = (primaryChild.url ?? [])
      .map((segment) => segment.path)
      .filter(Boolean)
      .join('/');

    const nextUrl = routeUrl ? `${url}/${routeUrl}` : url;

    const label = primaryChild.data?.['breadcrumb'];

    if (label) {
      breadcrumbs.push({
        label,
        url: nextUrl || '/dashboard',
      });
    }

    return this.buildBreadcrumbs(primaryChild, nextUrl, breadcrumbs);
  }
}
