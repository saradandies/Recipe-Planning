import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable,of } from 'rxjs';
import { ProfileUser } from '../user.interface';
import { FormBuilder, FormGroup } from '@angular/forms';
import { switchMap, catchError, tap } from 'rxjs/operators';

import { ImageUploadService } from '../image-uploaded.service';
import { UsersService } from '../users.service';
import { RecipeService } from '../recipe.service';

import { Recipe } from '../recipe.interface';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FollowersPopupComponent } from '../followers-popup/followers-popup.component';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
 user$: Observable<ProfileUser | null> | undefined;
  //userId$=this.authService.currentUser$;
  userId$: Observable<string | undefined> | undefined;
  currentUserUid: string | undefined;


  profileForm: FormGroup;
  constructor(private authService: AuthenticationService, private usersService: UsersService,private route: ActivatedRoute, private router: Router, private fb: FormBuilder) {

    this.profileForm = this.fb.group({
      uid: [''],
      displayName: [''],
      firstName: [''],
      lastName: [''],
      phone: [''],
      address: [''],
    });

  }


  ngOnInit(): void {
    this.userId$ = this.authService.currentUser$.pipe(
      map(user => user?.uid)
    );
  }
  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/']);
    });
  }

}
