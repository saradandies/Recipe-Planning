
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UsersService } from '../users.service';
import { AuthenticationService } from '../authentication.service';
import { ProfileUser } from '../user.interface'
@Component({
  selector: 'app-following',
  templateUrl: './following.component.html',
  styleUrl: './following.component.css'
})
export class FollowingComponent {
users$: Observable<ProfileUser | null> | undefined;
 //followers$!: Observable<ProfileUser[]>;followers!: ProfileUser[];
  following$: Observable<any[]> | undefined; // Adjust the type according to your follower data structure
  isPopupVisible: boolean = true;
  isFollowing: boolean = false;

  toggleFollow() {
    this.isFollowing = !this.isFollowing;
  }
  constructor(public usersService: UsersService, private authService: AuthenticationService) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user?.uid) {
        this.following$ = this.usersService.getFollowingsByUser(user.uid);
      } else {

      }
    });
  }
   loadFollowers(uid: string) {
    this.following$ = this.usersService.getFollowingsByUser(uid);
  }
  closePopup() {
    this.isPopupVisible = false;
    if (this.isFollowing == true) {
      //remove this user from db
      
    }
  }

  // loadFollowers(userName: string) {
  //   this.usersService.getFollowers(userName)
  //     .subscribe(
  //       (followers) => {
  //         this.followers = followers;
  //         console.log('Followers:', this.followers);
  //       },
  //       (error) => {
  //         console.error('Error fetching followers:', error);
  //         // Handle error
  //       }
  //     );
  // }
}


