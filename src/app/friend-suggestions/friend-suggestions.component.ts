import { Component,OnInit } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { UsersService } from '../users.service';
import { ProfileUser } from '../user.interface';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-friend-suggestions',
  templateUrl: './friend-suggestions.component.html',
  styleUrl: './friend-suggestions.component.css'
})
export class FriendSuggestionsComponent implements OnInit {

  suggestedFriends$: Observable<ProfileUser[]> | undefined;

  constructor(private userService: UsersService,private router: Router,private authService: AuthenticationService) { }

  ngOnInit(): void {
    this.suggestedFriends$ = this.userService.getSuggestedFriends();
  }

  viewProfile(friendId: string | undefined) {
    if (friendId) {
      this.router.navigate(['/profile', friendId]).catch(error => {
        console.error('Error navigating to profile:', error);
      });
    }
  }


  // followFriend(friendId: string | undefined) {
  //   if (friendId) {
  //     this.authService.currentUser$.pipe(
  //       switchMap(currentUser => {
  //         if (!currentUser) {
  //           throw new Error('Current user not found');
  //         }
  //         return this.userService.followFriend(friendId, currentUser);
  //       })
  //     ).subscribe(() => {
  //       console.log('User followed successfully');
  //     }, error => {
  //       console.error('Error following user:', error);
  //     });
  //   }
  // }
}
