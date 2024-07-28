import { Injectable } from '@angular/core';
import {
  collection,
  doc,
  docData,
  Firestore,
  getDocs,
  getDoc,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { catchError, from, map, Observable, of, switchMap } from 'rxjs';
import { ProfileUser } from '../app/user.interface';
import { AuthenticationService } from './authentication.service';


@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private firestore: Firestore, private authService: AuthenticationService) { }


  get currentUserProfile$(): Observable<ProfileUser | null> {
    return this.authService.currentUser$.pipe(
      switchMap((user) => {
        if (!user?.uid) {
          return of(null);
        }
        const ref = doc(this.firestore, `Users/${user.uid}`);
        return docData(ref) as Observable<ProfileUser>;
      })
    );
  }


  addUser(user: ProfileUser): Observable<void> {
    const ref = doc(this.firestore, `Users/${user.uid}`);
    return from(setDoc(ref, user));
  }


  updateUser(user: ProfileUser): Observable<void> {
    const ref = doc(this.firestore, `Users/${user.uid}`);
    return from(updateDoc(ref, { ...user }));
  }


  getUser(uid: string): Observable<ProfileUser | null> {
    const ref = doc(this.firestore, `Users/${uid}`);
    return docData(ref).pipe(
      catchError(error => {
        console.error('Error fetching user data:', error);
        return of(null);
      })
    ) as Observable<ProfileUser | null>;
  }


  getSuggestedFriends(): Observable<ProfileUser[]> {
    return this.currentUserProfile$.pipe(
      switchMap(currentUser => {
        if (!currentUser) return of([]);
        const q = query(collection(this.firestore, 'Users'), where('uid', '!=', currentUser.uid));
        return from(getDocs(q)).pipe(
          map(snapshot => {
            const suggestedFriends: ProfileUser[] = [];
            snapshot.forEach(doc => {
              suggestedFriends.push({ uid: doc.id, ...doc.data() } as ProfileUser);
            });
            return suggestedFriends;
          })
        );
      })
    );
  }

  getUserById(userId: string): Observable<ProfileUser | null> {
    const userRef = doc(this.firestore, `Users/${userId}`);
    return docData(userRef).pipe(
      catchError(error => {
        console.error('Error fetching user data:', error);
        return of(null);
      })
    ) as Observable<ProfileUser | null>;
  }
  // getRecipesByUser(uid: string): Observable<Recipe[]> {
  //       return this.firestore.collection<Recipe>('recipes', ref => ref.where('uid', '==', uid)).valueChanges();
  //   }
  getFollowersByUser(uid: string): Observable<string[]> {
    const usersRef = collection(this.firestore, 'Users');
    const queryRef = query(usersRef, where('uid', '==', uid));

    return from(getDocs(queryRef)).pipe(
      map((querySnapshot) => {
        const followersArray: string[] = [];
        querySnapshot.forEach((doc) => {
          const followers = doc.data()['followers'];
          if (followers) {
            followersArray.push(...followers);
          }
        });
        return followersArray;
      }),
      catchError((error) => {
        console.error('Error getting documents:', error);
        throw error; // Rethrow the error to be caught by the subscriber
      })
    );
  }
  getFollowingsByUser(uid: string): Observable<string[]> {
    const usersRef = collection(this.firestore, 'Users');
    const queryRef = query(usersRef, where('uid', '==', uid));

    return from(getDocs(queryRef)).pipe(
      map((querySnapshot) => {
        const followingArray: string[] = [];
        querySnapshot.forEach((doc) => {
          const following = doc.data()['following'];
          if (following) {
            followingArray.push(...following);
          }
        });
        return followingArray;
      }),
      catchError((error) => {
        console.error('Error getting documents:', error);
        throw error; // Rethrow the error to be caught by the subscriber
      })
    );
  }
}
/*
return from(getDocs(queryRef)).pipe(
      map((snapshot) => {
        console.log('Snapshot:', snapshot);
        const followers: ProfileUser[] = [];
        snapshot.forEach((doc) => {
          console.log('Follower doc:', doc.data());
          const followerData = doc.data() as ProfileUser;
          followers.push({ uid: doc.id, ...followerData });
        });
        console.log('Followers:', followers);
        return followers;
      }),
      catchError((error) => {
        console.error('Error fetching followers:', error);
        return of([]);
      })
    );
*/
