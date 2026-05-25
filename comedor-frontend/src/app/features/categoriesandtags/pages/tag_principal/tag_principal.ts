import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { TagListFragmentComponent } from '@features/categoriesandtags/fragments/tag-list-fragment/tag-list-fragment.component';
import { TagCreateFragmentComponent } from '@features/categoriesandtags/fragments/tag-create-fragment/tag-create-fragment.component';

@Component({
  selector: 'app-tag-principal',
  standalone: true,
  imports: [RouterLink, TagListFragmentComponent, TagCreateFragmentComponent],
  templateUrl: './tag_principal.html',
  styleUrl: './tag_principal.scss',
})
export class TagPrincipal {
  readonly authState = inject(AuthStateService);

  readonly canList = this.authState.hasPermission('TAG_LIST_BY_STATUS');
  readonly canCreate = this.authState.hasPermission('TAG_CREATE');
}